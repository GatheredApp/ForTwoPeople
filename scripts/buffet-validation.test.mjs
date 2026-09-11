import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { addBuffetFromEvent } from './add-buffet-from-issue.mjs'
import { extractSubmission, findDuplicateErrors, validateBuffet } from './buffet-validation.mjs'

const candidate = { id: 'test-buffet-example-in', name: 'Test Buffet', address: '123 Test St', city: 'Example', state: 'IN', latitude: 39.1, longitude: -85.2, youtubeVideoId: '62Vya_ka5Q8', youtubeUrl: 'https://www.youtube.com/watch?v=62Vya_ka5Q8' }
const body = `## Buffet submission\n\n<!-- BUFFET_SUBMISSION_V1\n${JSON.stringify(candidate, null, 2)}\nBUFFET_SUBMISSION_END -->`

describe('server-side buffet ingestion', () => {
  it('extracts and validates marked issue JSON', () => {
    expect(extractSubmission(body)).toEqual(candidate)
    expect(validateBuffet(candidate)).toEqual([])
    expect(() => extractSubmission('no payload')).toThrow(/markers/)
    expect(() => extractSubmission('<!-- BUFFET_SUBMISSION_V1\n{broken}\nBUFFET_SUBMISSION_END -->')).toThrow(/invalid JSON/)
  })

  it('rejects duplicate IDs and video IDs', () => {
    expect(findDuplicateErrors([candidate], { ...candidate, name: 'Other', address: 'Elsewhere', latitude: 1, longitude: 2 })).toEqual(expect.arrayContaining([expect.stringContaining('ID'), expect.stringContaining('video ID')]))
  })

  it('performs the full issue-to-JSON append dry run without touching production data', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'buffet-test-'))
    const eventPath = join(directory, 'event.json')
    const datasetPath = join(directory, 'buffets.json')
    await writeFile(datasetPath, '[]\n')
    await writeFile(eventPath, JSON.stringify({ issue: { body, user: { login: 'GatheredApp' }, author_association: 'OWNER' } }))
    await addBuffetFromEvent(eventPath, datasetPath)
    expect(JSON.parse(await readFile(datasetPath, 'utf8'))).toEqual([candidate])
  })

  it('rejects a non-owner event before processing input', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'buffet-test-'))
    const eventPath = join(directory, 'event.json')
    await writeFile(eventPath, JSON.stringify({ issue: { body, user: { login: 'someone' }, author_association: 'NONE' } }))
    await expect(addBuffetFromEvent(eventPath, join(directory, 'missing.json'))).rejects.toThrow(/owner/)
  })
})
