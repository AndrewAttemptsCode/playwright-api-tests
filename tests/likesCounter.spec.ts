import { expect, test } from "@playwright/test";

test.describe("Likes counter functionality", () => {
  test("count increases", async ({ page }) => {
    await page.goto("https://conduit.bondaracademy.com/");

    const likeButton =  page.locator("app-article-preview").first().getByRole("button");
    await expect(likeButton).toContainText("0");
    await likeButton.click();
    await expect(likeButton).toContainText("1");
  });

});