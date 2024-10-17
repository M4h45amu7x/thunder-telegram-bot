import sharp from 'sharp'
import { Readable } from 'stream'

export const utils = {
    streamToUint8ClampedArray: async (stream: Readable) => {
        const chunks: Uint8Array[] = []
        for await (const chunk of stream) chunks.push(chunk)

        const image = await sharp(Buffer.concat(chunks)).raw().ensureAlpha().toBuffer({ resolveWithObject: true })

        return new Uint8ClampedArray(image.data.buffer)
    },
}
