import { appendFile, readFile, writeFile } from 'node:fs/promises'
import { extractSubmission, findDuplicateErrors, validateBuffet, validateDataset } from './buffet-validation.mjs'

export async function addBuffetFromEvent(eventPath, datasetPath = new URL('../src/data/buffets.json', import.meta.url)) {
  if (!eventPath) throw new Error('GitHub event payload path is unavailable.')
  const event = JSON.parse(await readFile(eventPath, 'utf8'))
  if (event.issue?.user?.login !== 'GatheredApp' || event.issue?.author_association !== 'OWNER') throw new Error('Automated ingestion is restricted to the repository owner.')
  const candidate = extractSubmission(event.issue.body)
  const validationErrors = validateBuffet(candidate, 'Submitted buffet')
  if (validationErrors.length) throw new Error(validationErrors[0])
  const records = JSON.parse(await readFile(datasetPath, 'utf8'))
  const currentErrors = validateDataset(records)
  if (currentErrors.length) throw new Error(`Existing dataset is invalid: ${currentErrors[0]}`)
  const duplicates = findDuplicateErrors(records, candidate)
  if (duplicates.length) throw new Error(duplicates[0])
  const updated = [...records, candidate]
  const finalErrors = validateDataset(updated)
  if (finalErrors.length) throw new Error(finalErrors[0])
  await writeFile(datasetPath, `${JSON.stringify(updated, null, 2)}\n`)
  return candidate
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  addBuffetFromEvent(process.env.GITHUB_EVENT_PATH).then((record) => console.log(`Added buffet: ${record.name}`)).catch(async (error) => {
    const message = (error instanceof Error ? error.message : 'Buffet ingestion failed.').replace(/[\r\n`]/g, ' ').slice(0, 300)
    console.error(message)
    if (process.env.GITHUB_OUTPUT) await appendFile(process.env.GITHUB_OUTPUT, `error=${message}\n`)
    process.exitCode = 1
  })
}
