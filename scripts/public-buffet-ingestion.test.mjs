import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { addApprovedPublicBuffet, isAuthorizedApproval } from './add-approved-public-buffet.mjs'
import { extractPublicSubmission, validatePublicBuffet } from './buffet-validation.mjs'

const candidate = { id: 'fixture-buffet-example-in', name: 'Fixture Buffet', address: '123 Test St', city: 'Example', state: 'IN', latitude: 39.1, longitude: -85.2, youtubeVideoId: '62Vya_ka5Q8', youtubeUrl: 'https://www.youtube.com/watch?v=62Vya_ka5Q8' }
const marked = (record = candidate) => `Readable text\n<!-- BUFFET_PUBLIC_SUBMISSION_V1\n${JSON.stringify(record)}\nBUFFET_PUBLIC_SUBMISSION_END -->`
const event = (overrides = {}) => ({ action: 'labeled', label: { name: 'approved-buffet' }, sender: { login: 'GatheredApp' }, issue: { body: marked(), user: { login: 'random-user' } }, ...overrides })

describe('public buffet approval security', () => {
  it('authorizes only the exact label action performed by GatheredApp', () => {
    expect(isAuthorizedApproval(event())).toBe(true)
    expect(isAuthorizedApproval(event({ sender: { login: 'random-user' } }))).toBe(false)
    expect(isAuthorizedApproval(event({ label: { name: 'buffet-submission' } }))).toBe(false)
    expect(isAuthorizedApproval({ issue: { user: { login: 'GatheredApp' }, body: marked() } })).toBe(false)
  })

  it('parses exactly one valid public payload and rejects malformed payloads', () => {
    expect(extractPublicSubmission(marked())).toEqual(candidate)
    expect(() => extractPublicSubmission('missing')).toThrow(/markers/)
    expect(() => extractPublicSubmission('<!-- BUFFET_PUBLIC_SUBMISSION_V1\n{bad}\nBUFFET_PUBLIC_SUBMISSION_END -->')).toThrow(/invalid JSON/)
    expect(() => extractPublicSubmission(`${marked()}\n${marked()}`)).toThrow(/Multiple/)
  })

  it('rejects extra fields, rangoonRating, and invalid coordinates', () => {
    expect(validatePublicBuffet({ ...candidate, surprise: true })).toEqual(expect.arrayContaining([expect.stringMatching(/unsupported/)]))
    expect(validatePublicBuffet({ ...candidate, rangoonRating: 5 })).toEqual(expect.arrayContaining([expect.stringMatching(/cannot set/)]))
    expect(validatePublicBuffet({ ...candidate, latitude: 91 })).toEqual(expect.arrayContaining([expect.stringMatching(/Latitude/)]))
  })

  it('uses the issue body snapshot and appends only an authorized unique record', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'public-buffet-test-'))
    const eventPath = join(directory, 'event.json')
    const datasetPath = join(directory, 'buffets.json')
    await writeFile(datasetPath, '[]\n')
    await writeFile(eventPath, JSON.stringify(event()))
    await addApprovedPublicBuffet(eventPath, datasetPath)
    expect(JSON.parse(await readFile(datasetPath, 'utf8'))).toEqual([candidate])
  })

  it.each([
    ['ID', { ...candidate, youtubeVideoId: 'abcdefghijk', youtubeUrl: 'https://www.youtube.com/watch?v=abcdefghijk' }],
    ['video ID', { ...candidate, id: 'another-id' }],
    ['name/address', { ...candidate, id: 'another-id', youtubeVideoId: 'abcdefghijk', youtubeUrl: 'https://www.youtube.com/watch?v=abcdefghijk', name: ' FIXTURE  BUFFET ', address: '123  test st' }],
  ])('rejects a duplicate %s without overwriting data', async (_kind, proposed) => {
    const directory = await mkdtemp(join(tmpdir(), 'public-duplicate-test-'))
    const eventPath = join(directory, 'event.json')
    const datasetPath = join(directory, 'buffets.json')
    await writeFile(datasetPath, JSON.stringify([candidate]))
    await writeFile(eventPath, JSON.stringify(event({ issue: { body: marked(proposed) } })))
    await expect(addApprovedPublicBuffet(eventPath, datasetPath)).rejects.toThrow(/Duplicate/)
    expect(JSON.parse(await readFile(datasetPath, 'utf8'))).toEqual([candidate])
  })
})
