# FIGMA

**File:** [GrokBot-Dallas](https://www.figma.com/design/pZRH3cYPdDl1cDbmzzgZ5M/GrokBot-Dallas)

**Primary frame:** `GrokBot-TV-Idle-Wallpaper` — node `11:2` (1920×1080)

| Node | Name | Use |
| --- | --- | --- |
| `11:2` | GrokBot-TV-Idle-Wallpaper | Layout + moving-gradient shader params |
| `11:84` | grokbot | Center logo — Grok Bot lockup |
| `11:100` | spacexai wordmark | Center logo — SpaceX (hidden in still) |
| `11:140` | LOCKUP_HORIZONTAL_2D_DARK | Center logo — Cursor lockup (hidden in still) |
| `11:97` | Text block | Bottom-left headline + subline |

Logo crossfade reference: `.logo-animation` (`11:74`) — opacity cycle only; do not ship chromatic-metal ShaderEffect on logos.
