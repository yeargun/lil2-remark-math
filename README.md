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

## Use

```js
import {fromMarkdown, markdownToHast} from '@itslil/lil2-remark-math'

fromMarkdown('$$\n\\alpha\n$$', true) // mdast columns; singleDollarTextMath = true
markdownToHast('Euler: $e^{i\\pi}$', false)
```

The columns are lil2-mdast-util-from-markdown's and lil2-mdast-util-to-hast's. `dist/browser/` is the
`browser` condition (named character references decoded by the document).

## Measured (2026-10-04)

The `browser` build against remark-math@6.0.0 bundled for the browser with esbuild and minified by Terser, esbuild and Oxc
(the smallest shown). Each objective is its own LilScript build (effort level 12, `lazy_functions`).

| | lil2 | upstream, best minifier | difference |
|---|---:|---:|---:|
| raw | 61,851 | 78,011 (Terser) | −20.7% |
| gzip (9) | 19,994 | 21,286 (Terser) | −6.1% |
| Brotli (11) | 17,509 | 18,881 (Terser) | −7.3% |

Speed, upstream → lil2: markdown with math to HTML, median per call in a fresh browser context per lane, after checking that both
give the same output (Playwright; Chromium 151, Firefox 153; AMD EPYC 7763 64-Core Processor). Cold rows are the first import and the
first call of a fresh page.

| | Chromium | Firefox |
|---|---:|---:|
| math (1 KB) | 0.85 → 0.36 ms (0.43×) | 1.50 → 0.82 ms (0.55×) |
| chat (1 KB) | 0.66 → 0.28 ms (0.43×) | 1.18 → 0.60 ms (0.51×) |
| import, cold | 5.00 → 5.20 ms | 11.0 → 12.0 ms |
| first call, cold | 10.6 → 9.90 ms | 14.0 → 11.0 ms |

## Behaviour

`test/differential.test.mjs` parses about 840 documents (100 math edge cases in text and flow, a chat-style math
document, and the CommonMark corpus, where `$` now means math) with micromark-extension-math + mdast-util-math and
with lil2. It compares the mdast (with and without `singleDollarTextMath`) and the hast (with and without
dangerous HTML) as rows of indexed arrays, including every position. `test/browser.test.mjs` runs the browser
build in Chromium and Firefox. All are equal.

## License

MIT; see NOTICE.md.
