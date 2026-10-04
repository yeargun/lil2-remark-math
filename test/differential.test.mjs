// Same mdast and hast as upstream remark-math (micromark-extension-math + mdast-util-math, then
// mdast-util-to-hast), compared as rows of indexed arrays.
import assert from 'node:assert/strict'
import {test} from 'node:test'
import {fromMarkdown as upstreamFromMarkdown} from 'mdast-util-from-markdown'
import {math} from 'micromark-extension-math'
import {mathFromMarkdown} from 'mdast-util-math'
import {toHast} from 'mdast-util-to-hast'
import {corpus} from './corpus.mjs'
import * as mdastRows from './rows-mdast.mjs'
import * as hastRows from './rows-hast.mjs'
const lib = await import(new URL(process.env.LIL2_ARTIFACT ?? '../.dev/dist/remark-math.js', import.meta.url))
const upstream = (markdown, singleDollarTextMath) => upstreamFromMarkdown(markdown, {extensions: [math({singleDollarTextMath})], mdastExtensions: [mathFromMarkdown()]})

for (const singleDollarTextMath of [true, false]) {
  test(`mdast equals upstream (singleDollarTextMath: ${singleDollarTextMath})`, () => {
    const failures = []
    for (const c of corpus()) {
      try {
        assert.deepStrictEqual(mdastRows.fromColumns(lib.fromMarkdown(c.markdown, singleDollarTextMath)), mdastRows.fromObjects(upstream(c.markdown, singleDollarTextMath)))
      } catch (error) {
        failures.push({name: c.name, markdown: c.markdown.slice(0, 160), error: String(error.message).slice(0, 900)})
      }
    }
    if (failures.length) console.log(JSON.stringify({failures: failures.length, first: failures.slice(0, 3)}, null, 1))
    assert.equal(failures.length, 0)
  })
}

for (const allowDangerousHtml of [false, true]) {
  test(`hast equals upstream (allowDangerousHtml: ${allowDangerousHtml})`, () => {
    const failures = []
    for (const c of corpus()) {
      try {
        assert.deepStrictEqual(hastRows.fromColumns(lib.markdownToHast(c.markdown, allowDangerousHtml), lib.propNames, lib.keywordNames), hastRows.fromObjects(toHast(upstream(c.markdown, true), {allowDangerousHtml})))
      } catch (error) {
        failures.push({name: c.name, markdown: c.markdown.slice(0, 160), error: String(error.message).slice(0, 900)})
      }
    }
    if (failures.length) console.log(JSON.stringify({failures: failures.length, first: failures.slice(0, 3)}, null, 1))
    assert.equal(failures.length, 0)
  })
}
