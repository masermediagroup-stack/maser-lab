# Transfer: Cephlo Hack FW

Fill when status → `ready` or `transferred`.

Universal checklist: `.agents/skills/maser-lab-web/references/project-lifecycle.md` → **Transfer checklist**.

## Export

```tsx
import { CephloHackFwWallpaper } from "@/components/projects/display/cephlo-hack-fw";
```

## Dependencies

- next/font (IBM Plex Sans Condensed, demo chrome only)
- Universal Sans trial files already in `lab/public/fonts/`

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| headlineText | string | Cephlo Hack FW | Bottom-left headline |
| upNextText | string | Up next | Subline |
| silkLook | SilkLook | DEFAULT_SILK_LOOK | Live gradient uniforms, including dither and noise |
| reducedMotion | boolean | false | Freezes the field |

## Public assets

- `lab/public/assets/cephlo-hack-fw/cephlo-lockup.png`

## Porting steps

1. Copy `lab/src/components/projects/display/cephlo-hack-fw/` to the portfolio repo
2. Copy the lockup from `lab/public/assets/cephlo-hack-fw/`
3. Copy Universal Sans trial fonts if the destination does not already have them
4. Adjust import paths
5. Preview the 1920×1080 stage

## Notes

Status is `building`. This file is a draft until Transfer mode.
