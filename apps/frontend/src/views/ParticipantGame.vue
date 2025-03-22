<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router';
import { ref, onMounted } from 'vue';
import { wsclient } from '@/lib/apiClient';
import { generateSessionHash } from '@/utils/helpers';
import { Loader2Icon, Users, Copy } from 'lucide-vue-next';
import { useQuizzyStore } from '@/stores/quizzyStore'

const route = useRoute();
const router = useRouter();
const quizzyStore = useQuizzyStore()
const lobbyId = ref(quizzyStore.lobbyId)
const isHost = ref(quizzyStore.isHost)
const isLoading = ref(true);
const error = ref<string | null>(null);
const participants = ref<{ username: string, pfp: string }[]>([]);
const websocket = ref<WebSocket | null>(null);
const copiedToClipboard = ref(false);
const heartbeatInterval = ref<number | null>(null);
const reconnectAttempts = ref(0);

if (route.path === `/quiz/${lobbyId.value}`) {
  isHost.value = true;
}


const copyLobbyCode = () => {
  navigator.clipboard.writeText(lobbyId.value);
  copiedToClipboard.value = true;
  copiedToClipboard.value = false;
};



const setupWebSocket = async () => {
  try {
    console.log('websocket setup', lobbyId.value);

    console.log(quizzyStore.getLobbyData());

    const storedWs = quizzyStore.getLobbyData();
    let wsHash = quizzyStore.hash || await generateSessionHash(lobbyId.value, 'asd')

    if (storedWs) {
      if (storedWs.lobbyId === lobbyId.value) {
        console.log('Using existing WebSocket connection data');
        wsHash = storedWs.hash;
      }
    }

    if (!wsHash) {
      wsHash = await generateSessionHash(lobbyId.value, 'asd');
    }

    console.log('connecting to...:', lobbyId.value);
    const ws = await wsclient.ws.server[':lobbyid'][':hash'].$ws({
      param: { lobbyid: lobbyId.value, hash: wsHash },
    });

    websocket.value = ws;
    setupWebSocketListeners(websocket.value);

    quizzyStore.setLobbyData({
      lobbyId: lobbyId.value,
      hash: wsHash,
      isHost: isHost.value,
      quizId: quizzyStore.quizId,
      timestamp: Date.now(),
      heartbeatInterval: 30000
    });

  } catch (err) {
    console.error('WebSocket setup error:', err);
    error.value = err instanceof Error ? err.message : 'Failed to connect to the game lobby';
    isLoading.value = false;
  }
};

const manualReconnect = async () => {
  error.value = null;
  isLoading.value = true;
  reconnectAttempts.value = 0;
  await setupWebSocket();
};

const addParticipant = (username: string, pfp: string) => {
  const newUser = { 
    username: username, 
    pfp: "data:image/png;base64," + pfp
   };
   console.log(newUser)
  participants.value = [...participants.value, newUser];
};

const setupWebSocketListeners = (ws: WebSocket) => {
  ws.addEventListener('open', () => {
    console.log('lobby open', lobbyId.value);
    isLoading.value = false;
    reconnectAttempts.value = 0;
    if (ws.readyState === WebSocket.OPEN) {
      const userData = {
        username: quizzyStore.userName,
        pfp: quizzyStore.pfp.replace('data:image/png;base64,', '')
      }
      ws.send(JSON.stringify({
        type: 'whoami',
        successful: true,
        server: false,
        data: userData,
      }));  
      ws.send(JSON.stringify({
        type: 'connect',
        successful: true,
        server: false,
      }));
      ws.send(JSON.stringify({
        type: 'members',
        successful: true,
        server: false,
      }));
    } else {
      console.error('not open. state:', ws.readyState);
    }
  });

  ws.addEventListener('message', (event) => {
    try {
      const data = JSON.parse(event.data)

      if (data.type === 'connect') {
        console.log("data connect",data.data)
        if(data.data.username && data.data.pfp) {
          addParticipant(data.data.username, data.data.pfp);
        }
      }

      if(data.type === 'members') {
        console.log("data members",data.data)
        for (const member of data.data) {
            addParticipant(member.username, member.pfp);
        }
      }
      
      if(data.type === 'ping') {
        console.log("Ping received");
        ws.send(JSON.stringify({
          type: 'pong',
          successful: true,
          server: false,
        }));
      }

    } catch (err) {
      console.error('Error parsing WebSocket message:', err)
    }
  });

  ws.addEventListener('error', (event) => {
    console.error('WebSocket error:', event);
    error.value = 'Connection error occurred';
  });

  ws.addEventListener('close', (event) => {
    console.log('WebSocket closed:', event.code, event.reason);

    if (event.code === 1003) {
      error.value = event.reason || 'Server closed the connection';
      quizzyStore.$reset();
    } else if (event.code !== 1000 && route.name === 'quiz_multiplayer') {
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

  quizzyStore.setLobbyData({
    lobbyId: '',
    hash: '',
    isHost: false,
    quizId: '',
    timestamp: 0,
    heartbeatInterval: 0
  })
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
      <p class="ml-4 text-white text-xl">Csatlakozás...</p>
    </div>
    <div v-else-if="error" class="bg-red-500 bg-opacity-50 backdrop-blur-md rounded-lg p-4 text-white">
      <p class="mb-4">{{ error }}</p>
      <div class="flex gap-4 justify-center">
        <button @click="manualReconnect" class="glass-button px-4 py-2 rounded-md bg-green-600/30">
          Újracsatlakozás
        </button>
        <button @click="router.push('/')" class="glass-button px-4 py-2 rounded-md">
          Vissza a kezdőlapra
        </button>
      </div>
    </div>

    <div v-else class="text-white">
      <div class="flex justify-between items-center mb-8">
        <button @click="leaveLobby" class="glass-button px-4 py-2 rounded-md bg-red-600/30">
          Lobby elhagyása
        </button>
      </div>

      <div class="mb-8 p-4 bg-white/10 backdrop-blur-sm rounded-lg">
        <div class="flex justify-between items-center">
          <h2 class="text-2xl font-semibold">Lobby kód:</h2>
          <div class="flex items-center">
            <span class="text-xl font-mono bg-gray-700 px-3 py-1 rounded-md">{{ lobbyId }}</span>
            <button @click="copyLobbyCode" class="ml-2 glass-button p-2 rounded-md">
              <Copy v-if="!copiedToClipboard" class="h-5 w-5" />
              <span v-else class="text-green-400">Másolva!</span>
            </button>
          </div>
        </div>
      </div>

      <div class="mb-8">
        <div class="flex items-center mb-4">
          <Users class="h-6 w-6 mr-2" />
          <h2 class="text-2xl font-semibold">Résztvevők</h2>
        </div>

        <div v-if="participants.length === 0" class="text-center py-8 bg-white/5 rounded-lg">
          <p class="text-gray-400">Még nincs aktív résztvevő</p>
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div v-for="participant in participants" :key="participant.username"
            class="p-4 glass-button rounded-lg flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <img :src="participant.pfp || '/placeholder.svg?height=40&width=40'" class="w-10 h-10 rounded-full object-cover" />
              <span class="text-lg font-medium">{{ participant.username }}</span>
            </div>
          </div>
        </div>
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