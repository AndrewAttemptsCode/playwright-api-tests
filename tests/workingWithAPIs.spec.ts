import { test, expect, request } from "@playwright/test";
import tagData from "../test-data/tags.json";
import "dotenv/config";

const email = process.env.USER_EMAIL;
const password = process.env.USER_PASSWORD;

if (!email || !password) {
  throw new Error("Missing environment variables");
}

test.beforeEach(async ({ page }) => {
  // Intercept and mock tags api
  await page.route("**/api/tags", async (route) => {
    await route.fulfill({
      json: tagData,
    });
  });

  await page.goto("https://conduit.bondaracademy.com/");

  // Assert to allow enough time for mock tags.json data to take effect
  await expect(page.locator(".sidebar .tag-pill")).toHaveCount(tagData.tags.length);

  // Login to allow removal of articles
  await page.getByRole("link", { name: /sign in/i }).click();
  await page.getByRole("textbox", { name: /email/i }).fill(email);
  await page.getByRole("textbox", { name: /password/i }).fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();
});

test("has title", async ({ page }) => {
  await expect(page).toHaveTitle(/conduit/i);
 
});

test("updates latest article title and description", async ({ page }) => {
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

  // Refetch article list api with global feed click
  await page.getByRole("listitem").filter({ hasText: /global feed/i }).click();

  await expect(page.locator("app-article-list").getByRole("heading", { name: /new title/i })).toBeVisible();
  await expect(page.locator("app-article-list")).toContainText(/new description/i);
});

test("delete article", async ({ page, request }) => {
  // Request log in using login api end point with email and pass
  const response = await request.post("https://conduit-api.bondaracademy.com/api/users/login", {
    data: {
      "user": {
        "email": email,
        "password": password
      }
    }
  });

  // Receive response object 
  const data = await response.json();
  // Narrow and target account token
  const token = data.user.token;

  // Request new article creation with post article api end point and token auth
  const postResponse = await request.post("https://conduit-api.bondaracademy.com/api/articles/", {
    data: {
      "article": {
        "title":"Title created with api",
        "description":"Article with article end point",
        "body":"This article was created by using the article end point",
        "tagList":["api", "playwright", "automation"]
      }
    },
    headers: {
      Authorization: `Token ${token}`,
    },
  });

  // Assert that the article post was successfully created
  expect(postResponse.status()).toEqual(201);

  // Navigate to global feed tab
  const globalFeed = page.getByRole("listitem").filter({ hasText: /global feed/i });
  await globalFeed.click();
  
  // Locate post article within the global feed
  const articleItem = page.locator("app-article-preview").filter({ has: page.getByRole("heading", { name: /title created with api/i })});
  await expect(articleItem).toBeVisible();
  await articleItem.click();
  
  // Article page contains the article title
  const articleBanner = page.locator(".banner");
  await expect(articleBanner).toContainText(/title created with api/i);

  // Locate and click delete article button
  const deleteArticleButton = articleBanner.getByRole("button", { name: /delete article/i });
  await deleteArticleButton.click();

  // Navigate to global feed tab and expect article to be removed
  await globalFeed.click();
  await expect(articleItem).not.toBeVisible();
});
