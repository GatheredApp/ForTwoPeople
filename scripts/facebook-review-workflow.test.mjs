import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const workflow = readFileSync(
  new URL('../.github/workflows/add-facebook-review-from-issue.yml', import.meta.url),
  'utf8',
)

describe('Facebook review ingestion workflow deployment', () => {
  it('publishes the newly created commit as the ingestion job output', () => {
    expect(workflow).toContain('commit_sha: ${{ steps.commit.outputs.commit_sha }}')
    expect(workflow).toContain('echo "commit_sha=$(git rev-parse HEAD)" >> "$GITHUB_OUTPUT"')
  })

  it('deploys that exact commit through the reusable Pages workflow', () => {
    expect(workflow).toMatch(/deploy:\n\s+needs: ingest\n\s+if: needs\.ingest\.outputs\.commit_sha != ''/)
    expect(workflow).toContain('uses: ./.github/workflows/deploy-pages.yml')
    expect(workflow).toContain('ref: ${{ needs.ingest.outputs.commit_sha }}')
  })

  it('grants the reusable deployment only its required permissions', () => {
    expect(workflow).toMatch(
      /deploy:[\s\S]*?permissions:\n\s+contents: read\n\s+pages: write\n\s+id-token: write/,
    )
  })
})
