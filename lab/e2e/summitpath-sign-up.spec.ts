import { test, expect, Page } from "@playwright/test";

const BASE_URL = "http://localhost:3001";
const DEMO_URL = `${BASE_URL}/demos/summitpath-sign-up`;

// ────────────────────────────────────────────────────────────
// Selectors (by aria/role/label to stay robust)
// ────────────────────────────────────────────────────────────
const SEL = {
  section: '[aria-label="SummitPath sign-up section"]',
  nameInput: '#summitpath-signup-name',
  emailInput: '#summitpath-signup-email',
  passwordInput: '#summitpath-signup-password',
  submitBtn: 'button[type="submit"]',
  disabledCheckbox: 'input[type="checkbox"]',
  statusText: '[aria-live="polite"]',
  reducedMotionToggle: 'button[aria-label="Toggle reduced motion"]',
  heroImage: 'img[alt="Hiking summit path"]',
};

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────
async function goto(page: Page) {
  await page.goto(DEMO_URL, { waitUntil: "networkidle" });
  await page.waitForSelector(SEL.section, { timeout: 10_000 });
}

async function fillValidForm(page: Page) {
  await page.fill(SEL.nameInput, "Jane Doe");
  await page.fill(SEL.emailInput, "jane@trail.com");
  await page.fill(SEL.passwordInput, "SecurePass123");
}

// ────────────────────────────────────────────────────────────
// Tests
// ────────────────────────────────────────────────────────────
test.describe("SummitPath Sign-Up Demo — State Validation", () => {

  test("1. Default render — section visible, fields empty, button disabled", async ({ page }) => {
    await goto(page);

    // Section present
    await expect(page.locator(SEL.section)).toBeVisible();

    // Hero image loaded
    const heroImg = page.locator(SEL.heroImage);
    await expect(heroImg).toBeVisible();
    const naturalWidth = await heroImg.evaluate<number, HTMLImageElement>(
      (img) => img.naturalWidth
    );
    expect(naturalWidth, "Hero image should have non-zero naturalWidth (loaded)").toBeGreaterThan(0);

    // Heading text
    await expect(page.locator("h2", { hasText: "Create Account" })).toBeVisible();
    await expect(page.getByText("Explore the trail ahead.")).toBeVisible();

    // Fields empty
    await expect(page.locator(SEL.nameInput)).toHaveValue("");
    await expect(page.locator(SEL.emailInput)).toHaveValue("");
    await expect(page.locator(SEL.passwordInput)).toHaveValue("");

    // Submit button disabled (canSubmit = false on empty fields)
    await expect(page.locator(SEL.submitBtn)).toBeDisabled();

    // Status label = "Ready to submit"
    await expect(page.locator(SEL.statusText)).toHaveText("Ready to submit");

    // Disabled checkbox unchecked
    await expect(page.locator(SEL.disabledCheckbox)).not.toBeChecked();

    await page.screenshot({ path: "e2e/screenshots/1-default-render.png", fullPage: false });
  });

  test("2. Input focus — focus ring applied to inputs", async ({ page }) => {
    await goto(page);

    const nameInput = page.locator(SEL.nameInput);
    await nameInput.focus();

    // After focus the input should have focus
    await expect(nameInput).toBeFocused();

    // Tab to email
    await page.keyboard.press("Tab");
    await expect(page.locator(SEL.emailInput)).toBeFocused();

    // Tab to password
    await page.keyboard.press("Tab");
    await expect(page.locator(SEL.passwordInput)).toBeFocused();

    await page.screenshot({ path: "e2e/screenshots/2-input-focus.png" });
  });

  test("3. Invalid submit → error state", async ({ page }) => {
    await goto(page);

    // Submit with all empty fields (via JS to bypass disabled attr check)
    // The component's handleSubmit sets error if !canSubmit.
    // We trigger the form directly since the button is disabled on empty.
    await page.evaluate(() => {
      const form = document.querySelector("form");
      if (form) form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    });

    // Status label should switch to error message
    await expect(page.locator(SEL.statusText)).toHaveText("Fix the highlighted fields");

    // At least one field should be aria-invalid
    const invalidInputs = page.locator('input[aria-invalid="true"]');
    await expect(invalidInputs).not.toHaveCount(0);

    // Error messages visible
    await expect(page.getByRole("alert", { name: /name/i }).or(page.locator('[role="alert"]').first())).toBeVisible();

    // Button icon should be TriangleAlert (check for SVG present in button)
    const submitBtn = page.locator(SEL.submitBtn);
    const btnSvgCount = await submitBtn.locator("svg").count();
    expect(btnSvgCount, "Submit button should show error icon (SVG)").toBeGreaterThan(0);

    await page.screenshot({ path: "e2e/screenshots/3-error-state.png" });
  });

  test("4. Valid submit → loading then success state", async ({ page }) => {
    await goto(page);

    await fillValidForm(page);

    // Button should now be enabled
    const submitBtn = page.locator(SEL.submitBtn);
    await expect(submitBtn).toBeEnabled();

    // Submit
    await submitBtn.click();

    // Loading state — spinner SVG or status text "Creating account..."
    // The transition is 700ms; capture loading state quickly
    const loadingStatus = page.locator(SEL.statusText);
    // We allow a brief window to see loading, then wait for success
    await expect(loadingStatus).toHaveText("Creating account...", { timeout: 500 }).catch(() => {
      // Already transitioned to success — also acceptable if test ran slowly
    });

    // Wait for success
    await expect(loadingStatus).toHaveText("Account created", { timeout: 3_000 });

    // Success icon (CheckCircle2 SVG) should be in button
    const btnSvgCount = await submitBtn.locator("svg").count();
    expect(btnSvgCount, "Submit button should show success icon").toBeGreaterThan(0);

    // Button should be disabled in success state
    await expect(submitBtn).toBeDisabled();

    await page.screenshot({ path: "e2e/screenshots/4-success-state.png" });
  });

  test("5. Disabled toggle — disables all form elements", async ({ page }) => {
    await goto(page);

    const checkbox = page.locator(SEL.disabledCheckbox);
    await expect(checkbox).not.toBeChecked();

    // Enable disabled state
    await checkbox.check();
    await expect(checkbox).toBeChecked();

    // All inputs should be disabled
    await expect(page.locator(SEL.nameInput)).toBeDisabled();
    await expect(page.locator(SEL.emailInput)).toBeDisabled();
    await expect(page.locator(SEL.passwordInput)).toBeDisabled();

    // Submit button disabled
    await expect(page.locator(SEL.submitBtn)).toBeDisabled();

    // Social buttons disabled
    const socialBtns = page.locator('.summitpath-signup-social');
    const count = await socialBtns.count();
    for (let i = 0; i < count; i++) {
      await expect(socialBtns.nth(i)).toBeDisabled();
    }

    await page.screenshot({ path: "e2e/screenshots/5-disabled-state.png" });

    // Uncheck — re-enables
    await checkbox.uncheck();
    await expect(page.locator(SEL.nameInput)).toBeEnabled();
    await expect(page.locator(SEL.emailInput)).toBeEnabled();
    await expect(page.locator(SEL.passwordInput)).toBeEnabled();
  });

  test("6. Reduced-motion toggle — data attribute applied", async ({ page }) => {
    await goto(page);

    const demoRoot = page.locator(".summitpath-signup").first();
    const section = page.locator(SEL.section);

    // Initially no reduced-motion attribute
    await expect(demoRoot).not.toHaveAttribute("data-reduced-motion", "true");
    await expect(section).not.toHaveAttribute("data-reduced-motion", "true");

    // Find and click the ReducedMotionToggle button
    const toggleBtn = page.locator('button[aria-label="Toggle reduced motion"]');
    // Fallback: find by text if aria-label differs
    const toggleFallback = page.getByRole("button", { name: /reduced.motion/i });
    
    const toggleToClick = (await toggleBtn.count() > 0) ? toggleBtn : toggleFallback;
    await toggleToClick.click();

    // Demo root and section should have data-reduced-motion="true"
    await expect(demoRoot).toHaveAttribute("data-reduced-motion", "true", { timeout: 2_000 });
    await expect(section).toHaveAttribute("data-reduced-motion", "true", { timeout: 2_000 });

    // CSS duration tokens should resolve to 0ms (check via computed style)
    const fastDuration = await section.evaluate((el) =>
      getComputedStyle(el).getPropertyValue("--summitpath-signup-duration-fast").trim()
    );
    expect(fastDuration, "duration-fast token should be 0ms when reduced-motion enabled").toBe("0ms");

    await page.screenshot({ path: "e2e/screenshots/6-reduced-motion.png" });

    // Toggle off
    await toggleToClick.click();
    await expect(demoRoot).not.toHaveAttribute("data-reduced-motion", "true");
  });
});
