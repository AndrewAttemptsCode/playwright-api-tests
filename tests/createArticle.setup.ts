import { test as setup, expect } from "@playwright/test";

setup("Create new article", async ({ request }) => {
  const createResponse = await request.post("https://conduit-api.bondaracademy.com/api/articles/", {
    data: {
      "article": {
        "title":"Likes test article",
        "description":"Article to test likes",
        "body":"This article was created to practice project setup and teardown with use of the article likes counter.",
        "tagList":["api", "playwright", "automation", "tear down", "project setup"]
      },
    },
  });
  
  const data = await createResponse.json();
  const slugId = data.article.slug;
  process.env.ARTICLE_SLUGID = slugId;

  expect(createResponse.status()).toEqual(201);
});
