import { test, expect } from "@playwright/test";
import tagData from "../test-data/tags.json";

test.beforeEach(async ({ page }) => {
  await page.route("**/api/tags", async (route) => {
    await route.fulfill({
      json: tagData,
    });
  });

  await page.goto("https://conduit.bondaracademy.com/");

  // Assert to allow enough time for mock tags.json data to take effect
  await expect(page.locator(".sidebar .tag-pill")).toHaveCount(tagData.tags.length);
});

test("has title", async ({ page }) => {
  await expect(page).toHaveTitle(/conduit/i);
});
