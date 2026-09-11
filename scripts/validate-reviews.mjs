import { readFile } from 'node:fs/promises'
import { validateReviewDataset } from './review-validation.mjs'
const records=JSON.parse(await readFile(new URL('../src/data/reviews.json',import.meta.url),'utf8')); const errors=validateReviewDataset(records); if(errors.length){console.error(errors.join('\n'));process.exitCode=1}else console.log(`Validated ${records.length} community reviews.`)
