# lil2-remark-math

[remark-math](https://github.com/remarkjs/remark-math) 6.0.0 rewritten in typed [LilScript](https://lilscript.eddocu.com):
math in markdown (`$…$` in text, `$$` fences) on the flat **lil2** pipeline, with the same trees as upstream.

It reimplements micromark-extension-math 3.1.0 (the syntax) and mdast-util-math 3.0.0 (the mdast handlers, and
the element mdast-util-to-hast makes from the nodes' `data`). Inside the family it is compiled into
[lil2-react-markdown](https://github.com/yeargun/lil2-react-markdown)'s math flavor; on its own it turns
markdown into mdast and hast columns.

## Integers, not strings

| upstream | lil2-remark-math |
|---|---|
| token types `'mathFlow'`, `'mathText'`, … | ints in the math range (`TYPES_MATH + n`) |
| construct names `mathFlow`, `mathText` | construct ids (`CONSTRUCTS_MATH + n`) |
| mdast `type: 'math'`, `'inlineMath'` | node kinds `K_MATH`, `K_INLINE_MATH` |
| `data: {hName, hProperties, hChildren}` objects on each node | to-hast handlers by node kind |
| rehype-katex finds math by `className` strings | the elements carry int flags (`HN_MATH_INLINE`, `HN_MATH_DISPLAY`, `HN_LANGUAGE_MATH`) |

## Install

```bash
npm install @itslil/lil2-remark-math
```

TypeScript types are included. One ES module per entry; Node, Deno, Bun and workers get `dist/`, bundlers targeting
browsers get `dist/browser/` through the `browser` condition.

## Use

```ts
import {fromMarkdown, markdownToHast} from '@itslil/lil2-remark-math'
import {K_INLINE_MATH, K_MATH} from '@itslil/lil2-remark-math/constants'

const tree = fromMarkdown('Euler: $e^{i\\pi} + 1 = 0$\n\n$$\n\\int_0^1 x^2 dx\n$$', true)
const [kind, , , firstChild, nextSibling, , , , s1] = tree
function* walk(node = 0): Generator<number> {
  yield node
  for (let child = firstChild[node]; child >= 0; child = nextSibling[child]) yield* walk(child)
}
for (const node of walk()) {
  if (kind[node] === K_INLINE_MATH) console.log('inline', s1[node]) // e^{i\pi} + 1 = 0
  if (kind[node] === K_MATH) console.log('block', s1[node]) // \int_0^1 x^2 dx
}

const hast = markdownToHast('$x^2$')
console.log(hast[6].includes('x^2')) // the TeX, in a `math-inline` element rehype-katex reads
```

`fromMarkdown(value, singleDollarTextMath?)` is remark-parse with remark-math (pass `true` for remark-math's default,
`$x$` text math); `markdownToHast(value, allowDangerousHtml?)` adds remark-rehype. To render the formulas, use
[lil2-rehype-katex](https://github.com/yeargun/lil2-rehype-katex), or in React `@itslil/lil2-react-markdown/full`.

### Which package

| you want | package |
|---|---|
| React elements | [`@itslil/lil2-react-markdown`](https://github.com/yeargun/lil2-react-markdown) (`/gfm`, `/full` for GFM, math, KaTeX) |
| an HTML string, CommonMark | [`@itslil/lil2-micromark`](https://github.com/yeargun/lil2-micromark) |
| an HTML string with GFM, math or KaTeX | `renderToStaticMarkup` of lil2-react-markdown's `/full` flavor (below) |
| mdast (syntax tree) | [`lil2-mdast-util-from-markdown`](https://github.com/yeargun/lil2-mdast-util-from-markdown); with GFM [`lil2-remark-gfm`](https://github.com/yeargun/lil2-remark-gfm), math [`lil2-remark-math`](https://github.com/yeargun/lil2-remark-math), breaks [`lil2-remark-breaks`](https://github.com/yeargun/lil2-remark-breaks) |
| elements from hast columns through any JSX runtime | [`lil2-hast-util-to-jsx-runtime`](https://github.com/yeargun/lil2-hast-util-to-jsx-runtime) |
| hast (HTML tree) | [`lil2-mdast-util-to-hast`](https://github.com/yeargun/lil2-mdast-util-to-hast) and the same three, or [`lil2-rehype-katex`](https://github.com/yeargun/lil2-rehype-katex) with formulas rendered |

Every package is one self-contained ES module with no runtime dependencies (React and KaTeX aside), ships its
TypeScript types, and resolves to a Node build or a browser build through its `exports` conditions.
## Measured (2026-10-04)

The `browser` build against remark-math@6.0.0 bundled for the browser with esbuild and minified by Terser, esbuild and Oxc
(the smallest shown). Each objective is its own LilScript build (effort level 12, `lazy_functions`).

| | lil2 | upstream, best minifier | difference |
|---|---:|---:|---:|
| raw | 61,851 | 78,011 (Terser) | −20.7% |
| gzip (9) | 19,994 | 21,286 (Terser) | −6.1% |
| Brotli (11) | 17,486 | 18,881 (Terser) | −7.4% |

Speed, upstream → lil2: markdown with math to HTML, median per call in a fresh browser context per lane, after checking that both
give the same output (Playwright; Chromium 151, Firefox 153; AMD EPYC 7763 64-Core Processor). Cold rows are the first import and the
first call of a fresh page.

| | Chromium | Firefox |
|---|---:|---:|
| math (1 KB) | 0.86 → 0.36 ms (0.42×) | 1.50 → 0.77 ms (0.52×) |
| chat (1 KB) | 0.65 → 0.29 ms (0.44×) | 1.18 → 0.60 ms (0.51×) |
| import, cold | 5.20 → 5.30 ms | 11.0 → 11.0 ms |
| first call, cold | 10.6 → 10.4 ms | 13.0 → 11.0 ms |

## Behaviour

`test/differential.test.mjs` parses about 840 documents (100 math edge cases in text and flow, a chat-style math
document, and the CommonMark corpus, where `$` now means math) with micromark-extension-math + mdast-util-math and
with lil2. It compares the mdast (with and without `singleDollarTextMath`) and the hast (with and without
dangerous HTML) as rows of indexed arrays, including every position. `test/browser.test.mjs` runs the browser
build in Chromium and Firefox. All are equal.

## License

MIT; see NOTICE.md.
