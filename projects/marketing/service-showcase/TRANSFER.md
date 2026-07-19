# Transfer: Service Showcase

Ready to drop into a landing page (e.g. 319Junk). Lab chrome stays behind.

Universal checklist: `.agents/skills/maser-lab-web/references/project-lifecycle.md` → **Transfer checklist**.

## What to copy

Copy this folder into your app (rename path as you like):

```text
lab/src/components/projects/marketing/service-showcase/
```

**Include (portable):**

| File | Role |
| --- | --- |
| `service-showcase.tsx` | Root section component |
| `service-tabs.tsx` | Tab navigation |
| `service-panel.tsx` | Content / media panel |
| `before-after-slider.tsx` | Comparison slider |
| `data.ts` | Replace with your services |
| `types.ts` | Shared types |
| `constants.ts` | Defaults / ranges |
| `tokens.css` | B&W design tokens |
| `index.ts` | Public exports |

**Do not copy (lab-only):**

- `service-showcase-demo.tsx`

## Dependencies

```bash
npm install framer-motion
```

Also needed (usually already present in a Next + Tailwind app):

- `next` + `next/image` (or swap images to `<img>`)
- `tailwindcss`
- `@/lib/utils` `cn` helper (or inline `clsx` / `tailwind-merge`)

Allow Unsplash (or your CDN) in `next.config` if you keep remote images:

```ts
images: {
  remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
}
```

## Drop-in usage

Heading stays **outside** the component.

```tsx
import {
  ServiceShowcase,
  type ServiceItem,
} from "@/components/service-showcase";

const items: ServiceItem[] = [
  {
    id: "residential",
    label: "Residential",
    title: "Residential Junk Removal",
    description: "We remove furniture, appliances, mattresses…",
    cta: { label: "Get a free estimate", href: "/estimate" },
    image: { src: "/images/residential.jpg", alt: "Clean residential space" },
    comparison: {
      before: { src: "/images/residential-before.jpg", alt: "Before" },
      after: { src: "/images/residential-after.jpg", alt: "After" },
    },
  },
  // Commercial, Industrial, rentals…
];

export function ServicesSection() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="mb-8 text-4xl font-semibold tracking-tight">
          Junk removal for every space
        </h2>
        <ServiceShowcase items={items} />
      </div>
    </section>
  );
}
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `items` | `ServiceItem[]` | `SERVICE_ITEMS` | Service data — replace for your brand |
| `defaultActiveId` | `string` | `"residential"` | Uncontrolled initial tab |
| `activeId` | `string` | — | Controlled active tab |
| `onActiveChange` | `(id: string) => void` | — | Tab change callback |
| `forceReducedMotion` | `boolean` | `false` | Force reduced motion |
| `animationEnabled` | `boolean` | `true` | Disable motion |
| `panelDurationMs` | `number` | `300` | Content swap duration |
| `tabDurationMs` | `number` | `250` | Pill spring duration |
| `borderRadiusPx` | `number` | `24` | Corner radius |
| `spacingScale` | `number` | `1` | Whitespace multiplier |
| `imageMode` | `"auto" \| "comparison" \| "image"` | `"auto"` | Force media presentation |
| `className` | `string` | — | Wrapper class |

## Porting steps

1. Copy the portable files above into your site repo
2. Install `framer-motion`
3. Keep Space Grotesk (loaded inside the component) or override `--ss-font` in CSS
4. Replace `items` / `data.ts` with your copy + images
5. Put your page heading **above** `<ServiceShowcase />`
6. QA desktop + mobile + keyboard tabs + before/after drag + `prefers-reduced-motion`
7. Set Maser-Lab registry status → `transferred` when done

## Notes

- Pure black/white section — no lab blue chrome ships with the component.
- Rentals omit `comparison` → normal image. Residential / Commercial / Industrial include `comparison` for the slider.
- Lab demo controls are for tuning only; they are not part of the export.
