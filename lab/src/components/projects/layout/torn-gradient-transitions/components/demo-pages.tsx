"use client";

import type { ReactNode } from "react";

export type DemoPage = {
  id: string;
  label: string;
  /** Shown in the preview status line and announced on swap. */
  title: string;
  render: () => ReactNode;
};

function TypographyPage() {
  return (
    <article className="tgt-page tgt-page--type">
      <header className="tgt-type__head">
        <span className="tgt-eyebrow">Issue 04 — Material</span>
        <h2 className="tgt-type__display">
          Torn
          <em>&nbsp;matter</em>
        </h2>
      </header>
      <div className="tgt-type__cols">
        <p className="tgt-type__lede">
          A sheet does not simply vanish. It resists, thins, and gives way along
          the line where its fibres already wanted to part.
        </p>
        <p>
          Pulp settles unevenly on the mould. Where it pools, the sheet is
          opaque and stiff; where it thins, light passes and the fibre pattern
          becomes the image.
        </p>
        <p>
          The tear reads as three separate events at three separate scales — the
          shape of the split, the ragged mid-frequency rips, and the individual
          fibres bridging the gap for a moment longer than they should.
        </p>
      </div>
      <footer className="tgt-type__foot">
        <span>01 / Typography</span>
        <span>Cotton rag, 640 gsm</span>
      </footer>
    </article>
  );
}

function EditorialPage() {
  return (
    <article className="tgt-page tgt-page--editorial">
      <div className="tgt-editorial__frame" role="img" aria-label="Abstract duotone study of folded paper">
        <div className="tgt-editorial__plate" />
        <div className="tgt-editorial__grain" />
        <span className="tgt-editorial__tag">Plate ii</span>
      </div>
      <div className="tgt-editorial__body">
        <span className="tgt-eyebrow">Editorial</span>
        <h2 className="tgt-editorial__title">The weight of a surface</h2>
        <p>
          Photographed at grazing incidence so the raking light does the
          describing. Nothing in the frame is coloured — the hue comes entirely
          from how deep each cavity sits.
        </p>
        <dl className="tgt-editorial__meta">
          <div>
            <dt>Photography</dt>
            <dd>Studio Maser</dd>
          </div>
          <div>
            <dt>Format</dt>
            <dd>6 × 7 negative</dd>
          </div>
          <div>
            <dt>Stock</dt>
            <dd>Handmade deckle</dd>
          </div>
        </dl>
      </div>
    </article>
  );
}

function GradientPage() {
  return (
    <article className="tgt-page tgt-page--gradient">
      <div className="tgt-gradient__field" aria-hidden />
      <div className="tgt-gradient__grid" aria-hidden />
      <div className="tgt-gradient__copy">
        <span className="tgt-eyebrow">Composition</span>
        <h2 className="tgt-gradient__title">Chromatic study</h2>
        <p>
          Four overlapping fields, no photographic source. Included so the
          transition has to cover saturated colour as well as paper white.
        </p>
      </div>
      <ul className="tgt-gradient__legend">
        <li>
          <span data-swatch="a" /> Field A · 480 nm
        </li>
        <li>
          <span data-swatch="b" /> Field B · 560 nm
        </li>
        <li>
          <span data-swatch="c" /> Field C · 620 nm
        </li>
      </ul>
    </article>
  );
}

function ProductPage() {
  return (
    <article className="tgt-page tgt-page--product">
      <div className="tgt-product__stage">
        <div className="tgt-product__object" aria-hidden />
        <div className="tgt-product__shadow" aria-hidden />
      </div>
      <div className="tgt-product__detail">
        <span className="tgt-eyebrow">Object 07</span>
        <h2 className="tgt-product__title">Deckle press</h2>
        <p className="tgt-product__blurb">
          Anodised aluminium frame, cast bronze screws, replaceable brass mesh.
          Made to pull a single sheet at a time.
        </p>
        <ul className="tgt-product__specs">
          <li>
            <span>Sheet</span>
            <span>420 × 297 mm</span>
          </li>
          <li>
            <span>Mass</span>
            <span>3.4 kg</span>
          </li>
          <li>
            <span>Finish</span>
            <span>Bead blast</span>
          </li>
        </ul>
        <div className="tgt-product__buy">
          <span className="tgt-product__price">£486</span>
          <button type="button" className="tgt-product__cta">
            Add to bag
          </button>
        </div>
      </div>
    </article>
  );
}

export const DEMO_PAGES: DemoPage[] = [
  {
    id: "typography",
    label: "Typography",
    title: "Torn matter",
    render: () => <TypographyPage />,
  },
  {
    id: "editorial",
    label: "Editorial",
    title: "The weight of a surface",
    render: () => <EditorialPage />,
  },
  {
    id: "gradient",
    label: "Gradient",
    title: "Chromatic study",
    render: () => <GradientPage />,
  },
  {
    id: "product",
    label: "Product",
    title: "Deckle press",
    render: () => <ProductPage />,
  },
];
