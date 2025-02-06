import sharp from "sharp";

export async function makeSharpImage(pfpBuf: Buffer) {
    return await sharp(pfpBuf).resize(200, 200).jpeg().toBuffer();
}

