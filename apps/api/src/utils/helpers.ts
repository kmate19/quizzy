import sharp from "sharp";

export async function makeSharpImage(pfpBuf: Buffer) {
    return await sharp(pfpBuf)
        .resize(400, 300, { fit: sharp.fit.inside })
        .avif()
        .toBuffer();
}
