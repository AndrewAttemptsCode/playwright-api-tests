import { test as setup } from "@playwright/test";
import fs from "fs";

const email = process.env.USER_EMAIL;
const password = process.env.USER_PASSWORD;

if (!email || !password) {
  throw new Error("Missing environment variables");
}

const authLoginFile = "playwright/.auth/user.json";
const templatePath = "test-data/templateStorageState.json";

setup("authentication", async ({ page, request }) => {
  // // Login and store via UI
  // await page.goto("https://conduit.bondaracademy.com");
  // await page.getByRole("link", { name: /sign in/i }).click();
  // await page.getByRole("textbox", { name: /email/i }).fill(email);
  // await page.getByRole("textbox", { name: /password/i }).fill(password);
  // await page.getByRole("button", { name: /sign in/i }).click();

  // const loginResponse = await page.waitForResponse("https://conduit-api.bondaracademy.com/api/users/login");

  // await page.waitForURL("**/");

  // await page.context().storageState({ path: authLoginFile });

  // const data = await loginResponse.json();
  // const loginToken = data.user.token;


  // Login and store via API and fs
  const loginResponse = await request.post("https://conduit-api.bondaracademy.com/api/users/login", {
    data: {
      "user": {
        email: email,
        password: password,
      },
    },
  });

  const data = await loginResponse.json();
  const loginToken = data.user.token;

  // Get base json shape
  const template = JSON.parse(
    fs.readFileSync(templatePath, "utf-8")
  );
  
  // Assign origin url and login token to template
  template.origins[0].origin = "https://conduit.bondaracademy.com";
  template.origins[0].localStorage[0].value = loginToken;
  
  // Save template changes to user.json within .auth
  fs.writeFileSync(authLoginFile, JSON.stringify(template, null, 2));

  // Assign login token to env variable in memory
  // to be applied to extraHTTPHeaders in playwright config
  process.env.ACCESS_TOKEN = loginToken;
});
