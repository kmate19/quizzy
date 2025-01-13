import crypto from 'node:crypto';

export function genLobbyId() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';

    // Get 8 bytes of random values
    const randomBytes = crypto.randomBytes(8);

    for (let i = 0; i < 8; i++) {
        // Use modulo to map the byte to our character set
        const randomIndex = randomBytes[i] % characters.length;
        result += characters.charAt(randomIndex);
    }

    return result;
}
