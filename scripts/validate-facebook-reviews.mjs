import { readFile } from 'node:fs/promises'
import { validateFacebookDataset } from './facebook-review-validation.mjs'
const r=JSON.parse(await readFile(new URL('../src/data/facebookReviews.json',import.meta.url),'utf8')),e=validateFacebookDataset(r);if(e.length){console.error(e.join('\n'));process.exitCode=1}else console.log(`Validated ${r.length} Facebook reviews.`)
