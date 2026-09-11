import { readFile } from 'node:fs/promises'
import { validateDataset } from './buffet-validation.mjs'

const path = new URL('../src/data/buffets.json', import.meta.url)
const data = JSON.parse(await readFile(path, 'utf8'))
const errors = validateDataset(data)
if (errors.length) {
  console.error(errors.join('\n'))
  process.exitCode = 1
} else console.log(`Validated ${data.length} buffet records.`)
