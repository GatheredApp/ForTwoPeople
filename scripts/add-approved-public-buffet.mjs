import { appendFile, readFile, writeFile } from 'node:fs/promises'
import { extractPublicSubmission, findDuplicateErrors, validateDataset, validatePublicBuffet } from './buffet-validation.mjs'

export function isAuthorizedApproval(event) {
  return event?.action === 'labeled' && event?.label?.name === 'approved-buffet' && event?.sender?.login === 'GatheredApp'
}

export async function addApprovedPublicBuffet(eventPath, datasetPath = new URL('../src/data/buffets.json', import.meta.url)) {
  if (!eventPath) throw new Error('GitHub event payload path is unavailable.')
  const event = JSON.parse(await readFile(eventPath, 'utf8'))
  if (!isAuthorizedApproval(event)) throw new Error('This event is not an authorized GatheredApp approval.')

  // Deliberately use the body snapshot embedded in the approved label event. Never
  // re-fetch the editable issue: this binds ingestion to exactly what was reviewed.
  const candidate = extractPublicSubmission(event.issue?.body)
  const errors = validatePublicBuffet(candidate)
  if (errors.length) throw new Error(errors[0])

  const records = JSON.parse(await readFile(datasetPath, 'utf8'))
  const datasetErrors = validateDataset(records)
  if (datasetErrors.length) throw new Error(`Existing dataset is invalid: ${datasetErrors[0]}`)
  const duplicates = findDuplicateErrors(records, candidate)
  if (duplicates.length) throw new Error(duplicates[0])
  const updated = [...records, candidate]
  const finalErrors = validateDataset(updated)
  if (finalErrors.length) throw new Error(finalErrors[0])
  await writeFile(datasetPath, `${JSON.stringify(updated, null, 2)}\n`)
  return candidate
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  addApprovedPublicBuffet(process.env.GITHUB_EVENT_PATH).then(async (record) => {
    console.log(`Added approved public buffet: ${record.name}`)
    if (process.env.GITHUB_OUTPUT) await appendFile(process.env.GITHUB_OUTPUT, `name=${record.name.replace(/[\r\n]/g, ' ').slice(0, 200)}\n`)
  }).catch(async (error) => {
    const message = (error instanceof Error ? error.message : 'Buffet ingestion failed.').replace(/[\r\n`]/g, ' ').slice(0, 300)
    console.error(message)
    if (process.env.GITHUB_OUTPUT) await appendFile(process.env.GITHUB_OUTPUT, `error=${message}\n`)
    process.exitCode = 1
  })
}
