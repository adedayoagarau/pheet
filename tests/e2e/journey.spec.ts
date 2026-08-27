import { expect, test } from "@playwright/test";

test("desktop journey, source inspection, questions, and clean refresh", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /see where the work fits/i }),
  ).toBeVisible();
  await page.getByRole("button", { name: /start evidence review/i }).click();
  await page
    .getByRole("button", { name: /analyze portfolio evidence/i })
    .click();
  await page
    .getByRole("button", { name: /Context Atlas Partially demonstrated/i })
    .click();
  await expect(page.locator(".source-card span")).toHaveText(
    "Context object schema",
  );
  const prepare = page.getByRole("button", {
    name: /create 3 grounded questions/i,
  });
  await expect(prepare).toBeEnabled();
  await prepare.click();
  await expect(page.locator(".question-card")).toHaveCount(3);
  await page.getByRole("button", { name: "Accept" }).first().click();
  await expect(page.locator(".question-card").first()).toContainText(
    "accepted",
  );
  await page.reload();
  await expect(
    page.getByRole("heading", { name: /see where the work fits/i }),
  ).toBeVisible();
  await expect(page.locator(".question-card")).toHaveCount(0);
});

test("390px layout has no horizontal overflow and preserves keyboard focus", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    ),
  ).toBeLessThanOrEqual(1);
  const action = page.getByRole("button", { name: /start evidence review/i });
  await action.focus();
  await expect(action).toBeFocused();
});
