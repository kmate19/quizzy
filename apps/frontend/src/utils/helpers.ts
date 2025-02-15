export const arrayBufferToBase64 = (buffer: number[], mimeType = 'image/png'): string => {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return `data:${mimeType};base64,${window.btoa(binary)}`
  }