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

## Behaviour

`test/differential.test.mjs` parses about 840 documents (100 math edge cases in text and flow, a chat-style math
document, and the CommonMark corpus, where `$` now means math) with micromark-extension-math + mdast-util-math and
with lil2. It compares the mdast (with and without `singleDollarTextMath`) and the hast (with and without
dangerous HTML) as rows of indexed arrays, including every position. `test/browser.test.mjs` runs the browser
build in Chromium and Firefox. All are equal.

## License

MIT; see NOTICE.md.
