# Fonts

All four families are licensed under the SIL Open Font License 1.1 and are
shipped here as subset variable WOFF2 files.

| File | Family | Source |
| --- | --- | --- |
| `InterVariable.woff2` | Inter, by Rasmus Andersson (subset with `pyftsubset` to Latin, Latin Extended-A, punctuation, arrows and the symbols the site sets; both variable axes and every OpenType feature kept) | https://rsms.me/inter/ |
| `JetBrainsMono-Variable.woff2` | JetBrains Mono, by JetBrains | https://www.jetbrains.com/lp/mono/ |
| `Fraunces-Variable.woff2`, `Fraunces-Italic-Variable.woff2` | Fraunces, by Undercase Type | https://github.com/undercasetype/Fraunces |
| `NotoSerifKR-Variable-Jacket.woff2` | Noto Serif KR, by Google (subset with `pyftsubset` to the Hangul syllables in `components/screens/book-jacket.tsx`; the weight axis kept) | https://github.com/google/fonts/tree/main/ofl/notoserifkr |

To cut the Korean file again after changing the jacket's Hangul, from
`apps/docs`, with `NotoSerifKR[wght].ttf` from the source above:

```sh
python3 -c "s = open('components/screens/book-jacket.tsx', encoding='utf-8').read(); print(''.join(sorted({c for c in s if '\uac00' <= c <= '\ud7a3'})))" > /tmp/jacket.txt
pyftsubset 'NotoSerifKR[wght].ttf' --text-file=/tmp/jacket.txt --flavor=woff2 --output-file=app/fonts/NotoSerifKR-Variable-Jacket.woff2
```
