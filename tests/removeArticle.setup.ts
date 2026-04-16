import { test as setup, expect } from "@playwright/test";

setup("remove newly created article", async ({ request }) => {
  const slugId = process.env.ARTICLE_SLUGID;
  const removeResponse = await request.delete(`https://conduit-api.bondaracademy.com/api/articles/${slugId}`);

  expect(removeResponse.status()).toEqual(204);
});
