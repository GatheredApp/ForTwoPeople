import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const source = path.join(root, 'src/assets/goon.png')
const outputDirectory = path.join(root, 'public/icons')
const standardSizes = [192, 512, 180]
const maskableSizes = [192, 512]
const maskableBackground = '#e65f32'

async function writeAndVerify(fileName, size, pipeline) {
  const output = path.join(outputDirectory, fileName)
  await pipeline.png().toFile(output)
  const metadata = await sharp(output).metadata()

  if (metadata.width !== size || metadata.height !== size) {
    throw new Error(`${fileName} was ${metadata.width}x${metadata.height}; expected ${size}x${size}.`)
  }

  console.log(`Generated ${path.relative(root, output)} (${size}x${size})`)
}

async function generateIcons() {
  let metadata
  try {
    metadata = await sharp(source).metadata()
  } catch (error) {
    throw new Error(`Could not read canonical icon source at ${source}: ${error.message}`, { cause: error })
  }

  if (!metadata.width || !metadata.height) {
    throw new Error(`Canonical icon source at ${source} does not have readable dimensions.`)
  }

  console.log(`Using src/assets/goon.png (${metadata.width}x${metadata.height}) as the canonical source artwork.`)
  await mkdir(outputDirectory, { recursive: true })

  for (const size of standardSizes) {
    await writeAndVerify(
      `goon-${size}.png`,
      size,
      sharp(source).resize(size, size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      }),
    )
  }

  for (const size of maskableSizes) {
    // The artwork occupies 68% of the square so it remains inside Android's
    // central maskable safe zone, then it is composited over the brand orange.
    const artworkSize = Math.round(size * 0.68)
    const artwork = await sharp(source)
      .resize(artworkSize, artworkSize, { fit: 'contain' })
      .png()
      .toBuffer()

    await writeAndVerify(
      `goon-maskable-${size}.png`,
      size,
      sharp({
        create: {
          width: size,
          height: size,
          channels: 4,
          background: maskableBackground,
        },
      }).composite([{ input: artwork, gravity: 'centre' }]),
    )
  }
}

generateIcons().catch((error) => {
  console.error(`App icon generation failed: ${error.message}`)
  process.exitCode = 1
})
