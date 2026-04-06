import { test, expect } from "@playwright/test";
import tagData from "../test-data/tags.json";

test.beforeEach(async ({ page }) => {
  // Intercept and mock tags api
  await page.route("**/api/tags", async (route) => {
    await route.fulfill({
      json: tagData,
    });
  });

  // Intercept articles api, modify latest article entry
  await page.route("**/api/articles**", async (route) => {
    const response = await route.fetch();
    const data = await response.json();
    data.articles[0].title = "New Title";
    data.articles[0].description = "New description";

    await route.fulfill({
      json: data
    });
  });

  await page.goto("https://conduit.bondaracademy.com/");

  // Assert to allow enough time for mock tags.json data to take effect
  await expect(page.locator(".sidebar .tag-pill")).toHaveCount(tagData.tags.length);
});

test("has title", async ({ page }) => {
  await expect(page).toHaveTitle(/conduit/i);
 
});

test("updates latest article title and description", async ({ page }) => {
  await expect(page.locator("app-article-list").getByRole("heading", { name: /new title/i })).toBeVisible();
  await expect(page.locator("app-article-list")).toContainText(/new description/i);
});
