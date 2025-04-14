export const arrayBufferToBase64 = (buffer: number[], mimeType = 'image/png'): string => {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return `data:${mimeType};base64,${window.btoa(binary)}`
}

export async function generateSessionHash(lobbyCode: string, secretKey: string) {
  const data = `${lobbyCode}`
  const encoder = new TextEncoder()
  const keyData = encoder.encode(secretKey)
  const messageData = encoder.encode(data)

  const cryptoKey = await window.crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )

  const signature = await window.crypto.subtle.sign('HMAC', cryptoKey, messageData)

  const hashArray = Array.from(new Uint8Array(signature))
  const hashHex = hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('')

  return hashHex
}
