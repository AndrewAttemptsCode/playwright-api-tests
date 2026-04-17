import fs from "fs";
import { request, expect } from "@playwright/test";

const email = process.env.USER_EMAIL;
const password = process.env.USER_PASSWORD;

if (!email || !password) {
  throw new Error("Missing environment variables");
}

const authLoginFile = "playwright/.auth/user.json";
const templatePath = "test-data/templateStorageState.json";


const globalSetup = async () => {

  const context = await request.newContext();

  const loginResponse = await context.post("https://conduit-api.bondaracademy.com/api/users/login", {
    data: {
      "user": {
        email: email,
        password: password,
      },
    },
  });

  const loginData = await loginResponse.json();
  const loginToken = loginData.user.token;

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
    

  const createResponse = await context.post("https://conduit-api.bondaracademy.com/api/articles/", {
    data: {
      "article": {
        "title":"Global likes test article",
        "description":"Article to test likes",
        "body":"This article was created to practice project setup and teardown with use of the article likes counter.",
        "tagList":["api", "playwright", "automation", "tear down", "project setup"]
      },
    },
    headers: {
      Authorization: `Token ${loginToken}`,
    },
    });
    
    const createData = await createResponse.json();
    const slugId = createData.article.slug;
    process.env.ARTICLE_SLUGID = slugId;

    expect(createResponse.status()).toEqual(201);
};

export default globalSetup;