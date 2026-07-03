"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { LiquidMonochrome } from "./LiquidMonochrome";
import styles from "./liquid-monochrome-demo.module.css";

const DEMO_IMAGE =
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1600&q=80";

function DemoHeader() {
  return (
    <header className={styles.demoHeader}>
      <Link href="/" className={styles.backLink}>
        ← Lab
      </Link>
      <div>
        <p className={styles.eyebrow}>Scroll · Masermedia Lab</p>
        <h1 className={styles.title}>Liquid Monochrome</h1>
        <p className={styles.subtitle}>
          Scroll-pinned, scrub-driven liquid ink reveal. Luminance grayscale with
          turbulent organic edges — fully reversible.
        </p>
      </div>
    </header>
  );
}

function HeroExample() {
  return (
    <section className={styles.section}>
      <div className={styles.sectionLabel}>Hero section</div>
      <LiquidMonochrome
        pin
        scrub
        pinDuration={1.4}
        turbulence={0.62}
        noiseScale={0.28}
        liquidStrength={1.1}
        edgeSoftness={0.5}
      >
        <div className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.heroEyebrow}>Premium scroll interaction</p>
            <h2 className={styles.heroTitle}>
              Ink rises.
              <br />
              Color fades to silver.
            </h2>
            <p className={styles.heroBody}>
              Scroll to drive the liquid monochrome wave. The section pins until
              the reveal completes, then releases naturally.
            </p>
          </div>
          <div className={styles.heroVisual}>
            <Image
              src={DEMO_IMAGE}
              alt="Alpine mountain landscape at golden hour"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className={styles.heroImage}
              priority
            />
          </div>
        </div>
      </LiquidMonochrome>
    </section>
  );
}

function ImageExample() {
  return (
    <section className={styles.section}>
      <div className={styles.sectionLabel}>Image</div>
      <LiquidMonochrome
        pin
        scrub
        pinDuration={1}
        direction="bottom-to-top"
        turbulence={0.7}
        noiseScale={0.35}
      >
        <div className={styles.imageFrame}>
          <Image
            src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1400&q=80"
            alt="Sunlit forest valley"
            fill
            sizes="100vw"
            className={styles.coverImage}
          />
          <div className={styles.imageCaption}>
            <span>Luminance grayscale</span>
            <span>ITU-R BT.709 weights</span>
          </div>
        </div>
      </LiquidMonochrome>
    </section>
  );
}

const CARDS = [
  {
    title: "GPU clip-path",
    body: "Organic polygon mask updates per scroll frame — no layout thrash.",
    hue: "var(--lm-card-a)",
  },
  {
    title: "FBM turbulence",
    body: "Layered noise creates viscosity and irregular wave height.",
    hue: "var(--lm-card-b)",
  },
  {
    title: "Scroll scrub",
    body: "GSAP ScrollTrigger pin + scrub — zero autoplay, zero delays.",
    hue: "var(--lm-card-c)",
  },
];

function CardGridExample() {
  return (
    <section className={styles.section}>
      <div className={styles.sectionLabel}>Card grid</div>
      <LiquidMonochrome
        pin
        scrub
        pinDuration={1.2}
        turbulence={0.5}
        noiseScale={0.4}
        liquidStrength={0.9}
      >
        <div className={styles.cardGrid}>
          {CARDS.map((card) => (
            <article
              key={card.title}
              className={styles.card}
              style={{ "--card-accent": card.hue } as CSSProperties}
            >
              <h3>{card.title}</h3>
              <p>{card.body}</p>
            </article>
          ))}
        </div>
      </LiquidMonochrome>
    </section>
  );
}

function FullWidthExample() {
  return (
    <section className={styles.section}>
      <div className={styles.sectionLabel}>Full-width section</div>
      <LiquidMonochrome
        pin
        scrub
        pinDuration={1.5}
        direction="top-to-bottom"
        turbulence={0.58}
        noiseScale={0.3}
        edgeSoftness={0.55}
      >
        <div className={styles.fullWidth}>
          <div className={styles.fullWidthInner}>
            <h2>Reversible by design</h2>
            <p>
              Scroll upward and color flows back through the same liquid boundary.
              Every frame maps directly to scroll position.
            </p>
          </div>
          <div className={styles.fullWidthBand} />
        </div>
      </LiquidMonochrome>
    </section>
  );
}

function Benchmarks() {
  return (
    <section className={styles.benchmarks}>
      <h2>Performance & compatibility</h2>
      <div className={styles.benchmarkGrid}>
        <div>
          <h3>Target</h3>
          <ul>
            <li>60 FPS on modern desktop</li>
            <li>45+ FPS on mobile (clip-path GPU path)</li>
            <li>rAF-batched mask updates</li>
            <li>ResizeObserver for dimension sync</li>
          </ul>
        </div>
        <div>
          <h3>Browsers</h3>
          <ul>
            <li>Chrome 90+ · Safari 15.4+ · Firefox 90+</li>
            <li>clip-path + SVG feColorMatrix</li>
            <li>Reduced motion: instant snap at midpoint</li>
          </ul>
        </div>
        <div>
          <h3>Stack choice</h3>
          <ul>
            <li>GSAP ScrollTrigger — pin/scrub</li>
            <li>SVG luminance matrix — not desaturate</li>
            <li>FBM noise — organic edge</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

export function LiquidMonochromeDemo() {
  return (
    <div className={styles.demo}>
      <DemoHeader />
      <HeroExample />
      <div className={styles.spacer} />
      <ImageExample />
      <div className={styles.spacer} />
      <CardGridExample />
      <div className={styles.spacer} />
      <FullWidthExample />
      <Benchmarks />
      <footer className={styles.footer}>
        <p>Scroll through each section to experience the liquid reveal.</p>
      </footer>
    </div>
  );
}
