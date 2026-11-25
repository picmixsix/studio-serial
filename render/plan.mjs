// node render/plan.mjs <narasi.txt>  ->  JSON {header, scenes, warnings} di stdout
import fs from 'node:fs'
import { parseNarasi } from '../src/lib/parse.js'
const raw = fs.readFileSync(process.argv[2], 'utf8')
process.stdout.write(JSON.stringify(parseNarasi(raw)))
