<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router';
import { ref, onMounted } from 'vue';
import { wsclient } from '@/lib/apiClient';
import { generateSessionHash } from '@/utils/helpers';
import { Loader2Icon, Users, Copy } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const lobbyId = ref(route.params.lobbyId as string);
const isLoading = ref(true);
const error = ref<string | null>(null);
const participants = ref<{ id: string; name: string; isHost?: boolean }[]>([]);
const websocket = ref<WebSocket | null>(null);
const copiedToClipboard = ref(false);
const userId = ref('');
const username = ref('');
const heartbeatInterval = ref<number | null>(null);
const reconnectAttempts = ref(0);
const maxReconnectAttempts = 5;

const copyLobbyCode = () => {
  navigator.clipboard.writeText(lobbyId.value);
  copiedToClipboard.value = true;
  copiedToClipboard.value = false;
};

const startHeartbeat = (ws: WebSocket) => {
  if (heartbeatInterval.value) {
    clearInterval(heartbeatInterval.value);
  }
  
  heartbeatInterval.value = window.setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ 
        type: 'ping', 
        timestamp: Date.now(),
        successful: true,
        server: false,
      }));
    } else if (ws.readyState === WebSocket.CLOSED || ws.readyState === WebSocket.CLOSING) {
      clearInterval(heartbeatInterval.value!);
      heartbeatInterval.value = null;
      reconnect();
    }
  }, 30000) as unknown as number;
};

const reconnect = async () => {
  if (reconnectAttempts.value >= maxReconnectAttempts) {
    error.value = 'Connection lost. Maximum reconnection attempts reached.';
    return;
  }
  
  reconnectAttempts.value++;
  
  try {
    await setupWebSocket();
  } catch {
    setTimeout(() => {
      reconnect();
    }, 1000 * Math.pow(2, reconnectAttempts.value));
  }
};

const setupWebSocket = async () => {
  try {
    console.log('Setting up WebSocket connection for lobby:', lobbyId.value);

    console.log(localStorage.getItem('quizzyWebSocket'));

    const storedWs = localStorage.getItem('quizzyWebSocket');
    let wsHash;
    
    if (storedWs) {
      const wsData = JSON.parse(storedWs);
      if (wsData.lobbyId === lobbyId.value) {
        console.log('Using existing WebSocket connection data');
        wsHash = wsData.hash;
      }
    }

    if (!wsHash) {
      console.log('Generating new session hash');
      wsHash = await generateSessionHash(lobbyId.value, 'asd');
    }
    
    // Establish WebSocket connection
    console.log('Connecting to WebSocket with lobby:', lobbyId.value);
    const ws = await wsclient.ws.server[':lobbyid'][':hash'].$ws({
      param: { lobbyid: lobbyId.value, hash: wsHash },
    });
    
    websocket.value = ws;
    setupWebSocketListeners(ws);
    startHeartbeat(ws);
    
    // Store connection info
    localStorage.setItem('quizzyWebSocket', JSON.stringify({
      lobbyId: lobbyId.value,
      hash: wsHash,
      timestamp: Date.now()
    }));
  } catch (err) {
    console.error('WebSocket setup error:', err);
    error.value = err instanceof Error ? err.message : 'Failed to connect to the game lobby';
    isLoading.value = false;
  }
};

const setupWebSocketListeners = (ws: WebSocket) => {
  ws.addEventListener('open', () => {
    console.log('WebSocket connection opened for lobby:', lobbyId.value);
    isLoading.value = false;
    reconnectAttempts.value = 0;

    //here is the problem|invalid message type
    setTimeout(() => {
      if (ws.readyState === WebSocket.OPEN) {
        console.log('Sending subscribe message for lobby:', lobbyId.value);
        ws.send(JSON.stringify({ 
          type: 'subscribe',
          successful: true,
          server: false,
        }));//ez itt gatya
      } else {
        console.error('WebSocket is not open. Current state:', ws.readyState);
      }
    }, 100);
  });
  
  ws.addEventListener('message', (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log('Received WebSocket message:', data.type);
      
      // Handle server error messages
      if (data.type === 'error') {
        console.error('Server error:', data.error?.message || 'Unknown error');
        error.value = data.error?.message || 'Server reported an error';
        return;
      }
      
      // Handle other message types
      if (data.type === 'participantList') {
        participants.value = data.participants;
      } else if (data.type === 'participantJoined') {
        if (!participants.value.some(p => p.id === data.participant.id)) {
          participants.value.push(data.participant);
        }
      } else if (data.type === 'participantLeft') {
        participants.value = participants.value.filter(p => p.id !== data.participantId);
      } else if (data.type === 'userInfo') {
        userId.value = data.userId;
        username.value = data.username;
      } else if (data.type === 'pong') {
        console.log('Received heartbeat pong from server');
      } else if (data.type === 'connect') {
        console.log('Successfully connected to lobby:', data.data?.message);
      }
    } catch (err) {
      console.error('Error parsing WebSocket message:', err);
    }
  });
  
  ws.addEventListener('error', (event) => {
    console.error('WebSocket error:', event);
    error.value = 'Connection error occurred';
  });
  
  ws.addEventListener('close', (event) => {
    console.log('WebSocket closed:', event.code, event.reason);
    
    if (event.code === 1003) {
      // This is the server's "Lobby does not exist" or "Hash mismatch" error
      error.value = event.reason || 'Server closed the connection';
      localStorage.removeItem('quizzyWebSocket');
    } else if (event.code !== 1000 && route.name === 'quiz_multiplayer') {
      reconnect();
    }
  });
};

const leaveLobby = () => {
  console.log('Leaving lobby:', lobbyId.value);
  
  if (websocket.value && websocket.value.readyState === WebSocket.OPEN) {
    try {
      console.log('Sending unsubscribe message');
      websocket.value.send(JSON.stringify({ 
        type: 'unsubscribe', 
        successful: true,
        server: false,
      }));
      
      // Give server time to process the unsubscribe
      setTimeout(() => {
        if (websocket.value) {
          websocket.value.close(1000, "User left lobby");
        }
      }, 200);
    } catch (err) {
      console.error('Error leaving lobby:', err);
    }
  }
  
  if (heartbeatInterval.value) {
    clearInterval(heartbeatInterval.value);
    heartbeatInterval.value = null;
  }
  
  localStorage.removeItem('quizzyWebSocket');
  router.push('/');
};

onMounted(() => {
  if (!lobbyId.value) {
    error.value = 'Invalid lobby ID';
    isLoading.value = false;
    return;
  }
  console.log("minden pacek")
  
  setupWebSocket();
});


</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-8 bg-gray-800 bg-opacity-80 rounded-md mt-8">
    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <Loader2Icon class="w-12 h-12 text-white animate-spin" />
      <p class="ml-4 text-white text-xl">Connecting to lobby...</p>
    </div>
    
    <div v-else-if="error" class="bg-red-500 bg-opacity-50 backdrop-blur-md rounded-lg p-4 text-white">
      {{ error }}
      <button @click="router.push('/')" class="mt-4 glass-button px-4 py-2 rounded-md">
        Return to Home
      </button>
    </div>
    
    <div v-else class="text-white">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold">Multiplayer Lobby</h1>
        <button @click="leaveLobby" class="glass-button px-4 py-2 rounded-md bg-red-600/30">
          Leave Lobby
        </button>
      </div>
      
      <div class="mb-8 p-4 bg-white/10 backdrop-blur-sm rounded-lg">
        <div class="flex justify-between items-center">
          <h2 class="text-2xl font-semibold">Lobby Code:</h2>
          <div class="flex items-center">
            <span class="text-xl font-mono bg-gray-700 px-3 py-1 rounded-md">{{ lobbyId }}</span>
            <button @click="copyLobbyCode" class="ml-2 glass-button p-2 rounded-md">
              <Copy v-if="!copiedToClipboard" class="h-5 w-5" />
              <span v-else class="text-green-400">Copied!</span>
            </button>
          </div>
        </div>
      </div>
      
      <div class="mb-8">
        <div class="flex items-center mb-4">
          <Users class="h-6 w-6 mr-2" />
          <h2 class="text-2xl font-semibold">Participants</h2>
        </div>
        
        <div v-if="participants.length === 0" class="text-center py-8 bg-white/5 rounded-lg">
          <p class="text-gray-400">Waiting for participants to join...</p>
        </div>
        
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div v-for="participant in participants" :key="participant.id" 
               class="p-4 glass-button rounded-lg flex items-center justify-between">
            <div class="flex items-center">
              <div class="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                {{ participant.name.charAt(0).toUpperCase() }}
              </div>
              <span class="ml-3">{{ participant.name }}</span>
            </div>
            <span v-if="participant.isHost" class="px-2 py-1 text-xs bg-yellow-500/50 rounded-md">Host</span>
          </div>
        </div>
      </div>
      
      <div class="flex justify-center">
        <button class="glass-button px-8 py-4 text-xl rounded-lg bg-green-600/30">
          Play
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.glass-button {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: relative;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.glass-button:hover {
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid white;
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.2);
  transform: translateY(-2px);
}

.glass-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>