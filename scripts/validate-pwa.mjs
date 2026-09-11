import { access, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const publicDirectory = path.join(root, 'public')
const manifestPath = path.join(publicDirectory, 'manifest.webmanifest')
const expectedIcons = new Map([
  ['./icons/goon-192.png', 192],
  ['./icons/goon-512.png', 512],
  ['./icons/goon-maskable-192.png', 192],
  ['./icons/goon-maskable-512.png', 512],
  ['./icons/goon-180.png', 180],
])

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

async function validate() {
  await access(manifestPath)
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))

  assert(manifest.name === 'Mullet Review', 'Manifest name must be exactly "Mullet Review".')
  assert(manifest.short_name === 'Mullet Review', 'Manifest short_name must be exactly "Mullet Review".')
  assert(manifest.start_url === './', 'Manifest start_url must be "./".')
  assert(manifest.scope === './', 'Manifest scope must be "./".')
  assert(manifest.display === 'standalone', 'Manifest display must be "standalone".')

  const manifestIcons = new Map(manifest.icons.map((icon) => [icon.src, icon]))
  for (const [iconUrl, size] of expectedIcons) {
    const iconPath = path.join(publicDirectory, iconUrl.replace(/^\.\//, ''))
    await access(iconPath)
    const metadata = await sharp(iconPath).metadata()
    assert(metadata.width === size && metadata.height === size, `${iconUrl} must be ${size}x${size}.`)

    if (size !== 180) {
      const entry = manifestIcons.get(iconUrl)
      assert(entry, `Manifest must reference ${iconUrl}.`)
      assert(entry.sizes === `${size}x${size}`, `Manifest size for ${iconUrl} is incorrect.`)
      const expectedPurpose = iconUrl.includes('maskable') ? 'maskable' : 'any'
      assert(entry.purpose === expectedPurpose, `Manifest purpose for ${iconUrl} must be "${expectedPurpose}".`)
      if (expectedPurpose === 'maskable') {
        const stats = await sharp(iconPath).stats()
        assert(stats.isOpaque, `${iconUrl} must have an opaque background.`)
      }
    }

    const deployedUrl = new URL(iconUrl, 'https://gatheredapp.github.io/ForTwoPeople/manifest.webmanifest')
    assert(deployedUrl.pathname.startsWith('/ForTwoPeople/icons/'), `${iconUrl} escapes the GitHub Pages project path.`)
  }

  console.log('PWA manifest, icon dimensions, and GitHub Pages-relative URLs are valid.')
}

validate().catch((error) => {
  console.error(`PWA validation failed: ${error.message}`)
  process.exitCode = 1
})
