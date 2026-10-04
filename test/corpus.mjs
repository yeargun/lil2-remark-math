// The math corpus: math edge cases (text and flow, escapes, padding, fences with meta, containers, laziness,
// interplay with code, emphasis, links and HTML), a chat-style math document, and the CommonMark corpus
// (where `$` now means math).
import {readFileSync} from 'node:fs'
import {corpus as commonmark} from './commonmark-corpus.mjs'

const text = [
  '$a$', '$$a$$', '$$$a$$$', '$a$$', '$$a$', '$ $', '$  $', '$ a $', '$  a  $', '$a b$', '$ a b $',
  '\\$a$', '$a\\$', '\\$a\\$', '$a$$b$', 'a $b', '$a', 'a$', '$$', '$', '$$$', 'x $$ y', '$a$b$c$',
  '$a\nb$', '$ a\nb $', '$\na\n$', '$a\n\nb$', '$\ta\t$', '$a\tb$', '$$ a $$ b $', '$`a`$', '`$a$`',
  '*$a*$', '$*a$*', '[$a$](b)', '![$a$](b)', '[a]($b$)', '$<b>$', '<b>$a$</b>', '$&amp;$', '$\\alpha$',
  '$$\\frac{1}{2}$$ text', 'price: $5 and $10', '$5', '5$', '\\\\$a$', '$a$\\', 'a\\\n$b$', '$a$  \nb',
  '**$a$**', '_$a$_', '$a$**b**', '# $a$', '- $a$\n- $b$', '> $a$', '[$a$]\n\n[$a$]: x', '$[a](b)$',
]
const flow = [
  '$$\na\n$$', '$$\n\\alpha\n$$', '$$ meta\na\n$$', '$$  meta  data\na\n$$', '$$ me$ta\na\n$$', '$$$\na\n$$',
  '$$\na\n$$$', '$$\na\n$$ b', '$$\na\n  $$', '$$\na\n    $$', '  $$\n  a\n  $$', '   $$\n  a\n $$',
  '\t$$\na\n$$', '$$\n\ta\n$$', '$$\n\n$$', '$$\n$$', '$$', '$$\n', '$$\na', '$$\na\n', '$$\n\na\n\n$$',
  '- $$\n  a\n  $$', '- $$\n  a\n$$', '> $$\n> a\n> $$', '> $$\na\n$$', '> $$\n> a', '1. $$\n   a\n   $$\n2. b',
  'a\n$$\nb\n$$', '$$\na\n$$\nb', '$$\na\r\nb\r\n$$', '$$\ra\r$$', '```\n$$\n```', '$$\n```\n$$',
  '<div>\n$$\n</div>', '$$\n<div>\n$$', '    $$\n    a\n    $$', '$$\n$a$\n$$', '$$ a $$', '$$ $$',
  '- a\n\n  $$\n  b\n  $$', '$$\\\na\n$$', '$$\n  a\n $$', ' $$\n  a\n   b\n $$', '$$\na\n$$\n$$\nb\n$$',
]

export function corpus() {
  const doc = readFileSync(new URL('math-doc.md', import.meta.url), 'utf8')
  return [
    ...text.map((markdown, i) => ({name: `text ${i + 1}`, markdown})),
    ...flow.map((markdown, i) => ({name: `flow ${i + 1}`, markdown})),
    {name: 'math document', markdown: doc},
    ...commonmark()
  ]
}
