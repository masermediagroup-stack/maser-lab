# Figma: Tyler Vea Frost Disc Nav

**Slug:** `tyler-glass-nav`  
**Category:** navigation

## Design sources

| Source | URL | Notes |
| --- | --- | --- |
| Figma file | none | |
| Elite Pixel Guy stills | attached to lab request | 1 dim peek · 2 glowing peek · 3 expanded quiet · 4 expanded + slot glow |
| Other | Lab demo forest still (`demo/forest-ground.png`) | Full-bleed behind the disc in the product stage only — not exported |

## Token map

| Locked value | CSS variable | Notes |
| --- | --- | --- |
| `blur(12px)` | `--nav-frost-blur` | Never animate |
| `saturate(170%)` | `--nav-frost-saturate` | Never animate |
| `rgba(12, 14, 18, 0.92)` | `--nav-frost-fill-floor` | No `@supports` / reduced transparency |
| `0 8px 24px rgba(0, 0, 0, 0.35)` | `--nav-outer-lift` | Expanded lift only |
| State fills / rims | `--nav-frost-fill`, `--nav-rim`, `--nav-inset-highlight` | Discrete `data-shell` — no interpolation |

## Visual diff checklist

- [ ] Peek is the top rim of the same disc (translate, no morph)
- [ ] Three slots: house / briefcase / envelope
- [ ] Cyan-white hairline rim; measured 12px slot/peek glow only where the table allows
- [ ] No extra floating icons on peek
