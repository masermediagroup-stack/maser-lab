# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: summitpath-sign-up.spec.ts >> SummitPath Sign-Up Demo — State Validation >> 4. Valid submit → loading then success state
- Location: e2e\summitpath-sign-up.spec.ts:124:7

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3001/demos/summitpath-sign-up
Call log:
  - navigating to "http://localhost:3001/demos/summitpath-sign-up", waiting until "networkidle"

```

# Test source

```ts
  1   | import { test, expect, Page } from "@playwright/test";
  2   | 
  3   | const BASE_URL = "http://localhost:3001";
  4   | const DEMO_URL = `${BASE_URL}/demos/summitpath-sign-up`;
  5   | 
  6   | // ────────────────────────────────────────────────────────────
  7   | // Selectors (by aria/role/label to stay robust)
  8   | // ────────────────────────────────────────────────────────────
  9   | const SEL = {
  10  |   section: '[aria-label="SummitPath sign-up section"]',
  11  |   nameInput: '#summitpath-signup-name',
  12  |   emailInput: '#summitpath-signup-email',
  13  |   passwordInput: '#summitpath-signup-password',
  14  |   submitBtn: 'button[type="submit"]',
  15  |   disabledCheckbox: 'input[type="checkbox"]',
  16  |   statusText: '[aria-live="polite"]',
  17  |   reducedMotionToggle: 'button[aria-label="Toggle reduced motion"]',
  18  |   heroImage: 'img[alt="Hiking summit path"]',
  19  | };
  20  | 
  21  | // ────────────────────────────────────────────────────────────
  22  | // Helpers
  23  | // ────────────────────────────────────────────────────────────
  24  | async function goto(page: Page) {
> 25  |   await page.goto(DEMO_URL, { waitUntil: "networkidle" });
      |              ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3001/demos/summitpath-sign-up
  26  |   await page.waitForSelector(SEL.section, { timeout: 10_000 });
  27  | }
  28  | 
  29  | async function fillValidForm(page: Page) {
  30  |   await page.fill(SEL.nameInput, "Jane Doe");
  31  |   await page.fill(SEL.emailInput, "jane@trail.com");
  32  |   await page.fill(SEL.passwordInput, "SecurePass123");
  33  | }
  34  | 
  35  | // ────────────────────────────────────────────────────────────
  36  | // Tests
  37  | // ────────────────────────────────────────────────────────────
  38  | test.describe("SummitPath Sign-Up Demo — State Validation", () => {
  39  | 
  40  |   test("1. Default render — section visible, fields empty, button disabled", async ({ page }) => {
  41  |     await goto(page);
  42  | 
  43  |     // Section present
  44  |     await expect(page.locator(SEL.section)).toBeVisible();
  45  | 
  46  |     // Hero image loaded
  47  |     const heroImg = page.locator(SEL.heroImage);
  48  |     await expect(heroImg).toBeVisible();
  49  |     const naturalWidth = await heroImg.evaluate<number, HTMLImageElement>(
  50  |       (img) => img.naturalWidth
  51  |     );
  52  |     expect(naturalWidth, "Hero image should have non-zero naturalWidth (loaded)").toBeGreaterThan(0);
  53  | 
  54  |     // Heading text
  55  |     await expect(page.locator("h2", { hasText: "Create Account" })).toBeVisible();
  56  |     await expect(page.getByText("Explore the trail ahead.")).toBeVisible();
  57  | 
  58  |     // Fields empty
  59  |     await expect(page.locator(SEL.nameInput)).toHaveValue("");
  60  |     await expect(page.locator(SEL.emailInput)).toHaveValue("");
  61  |     await expect(page.locator(SEL.passwordInput)).toHaveValue("");
  62  | 
  63  |     // Submit button disabled (canSubmit = false on empty fields)
  64  |     await expect(page.locator(SEL.submitBtn)).toBeDisabled();
  65  | 
  66  |     // Status label = "Ready to submit"
  67  |     await expect(page.locator(SEL.statusText)).toHaveText("Ready to submit");
  68  | 
  69  |     // Disabled checkbox unchecked
  70  |     await expect(page.locator(SEL.disabledCheckbox)).not.toBeChecked();
  71  | 
  72  |     await page.screenshot({ path: "e2e/screenshots/1-default-render.png", fullPage: false });
  73  |   });
  74  | 
  75  |   test("2. Input focus — focus ring applied to inputs", async ({ page }) => {
  76  |     await goto(page);
  77  | 
  78  |     const nameInput = page.locator(SEL.nameInput);
  79  |     await nameInput.focus();
  80  | 
  81  |     // After focus the input should have focus
  82  |     await expect(nameInput).toBeFocused();
  83  | 
  84  |     // Tab to email
  85  |     await page.keyboard.press("Tab");
  86  |     await expect(page.locator(SEL.emailInput)).toBeFocused();
  87  | 
  88  |     // Tab to password
  89  |     await page.keyboard.press("Tab");
  90  |     await expect(page.locator(SEL.passwordInput)).toBeFocused();
  91  | 
  92  |     await page.screenshot({ path: "e2e/screenshots/2-input-focus.png" });
  93  |   });
  94  | 
  95  |   test("3. Invalid submit → error state", async ({ page }) => {
  96  |     await goto(page);
  97  | 
  98  |     // Submit with all empty fields (via JS to bypass disabled attr check)
  99  |     // The component's handleSubmit sets error if !canSubmit.
  100 |     // We trigger the form directly since the button is disabled on empty.
  101 |     await page.evaluate(() => {
  102 |       const form = document.querySelector("form");
  103 |       if (form) form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  104 |     });
  105 | 
  106 |     // Status label should switch to error message
  107 |     await expect(page.locator(SEL.statusText)).toHaveText("Fix the highlighted fields");
  108 | 
  109 |     // At least one field should be aria-invalid
  110 |     const invalidInputs = page.locator('input[aria-invalid="true"]');
  111 |     await expect(invalidInputs).not.toHaveCount(0);
  112 | 
  113 |     // Error messages visible
  114 |     await expect(page.getByRole("alert", { name: /name/i }).or(page.locator('[role="alert"]').first())).toBeVisible();
  115 | 
  116 |     // Button icon should be TriangleAlert (check for SVG present in button)
  117 |     const submitBtn = page.locator(SEL.submitBtn);
  118 |     const btnSvgCount = await submitBtn.locator("svg").count();
  119 |     expect(btnSvgCount, "Submit button should show error icon (SVG)").toBeGreaterThan(0);
  120 | 
  121 |     await page.screenshot({ path: "e2e/screenshots/3-error-state.png" });
  122 |   });
  123 | 
  124 |   test("4. Valid submit → loading then success state", async ({ page }) => {
  125 |     await goto(page);
```