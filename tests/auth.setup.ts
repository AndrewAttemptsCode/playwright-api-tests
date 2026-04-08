import { test as setup } from "@playwright/test";
import "dotenv/config";

const email = process.env.USER_EMAIL;
const password = process.env.USER_PASSWORD;

if (!email || !password) {
  throw new Error("Missing environment variables");
}

const authLoginFile = "playwright/.auth/user.json";

setup("authentication", async ({ page }) => {
  await page.goto("https://conduit.bondaracademy.com/");
  await page.getByRole("link", { name: /sign in/i }).click();
  await page.getByRole("textbox", { name: /email/i }).fill(email);
  await page.getByRole("textbox", { name: /password/i }).fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();

  await page.waitForURL("**/");

  await page.context().storageState({ path: authLoginFile });
});
