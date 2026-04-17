import { request, expect } from "@playwright/test";

const globalTeardown = async () => {
  const context = await request.newContext();
  const slugId = process.env.ARTICLE_SLUGID;
  const loginToken = process.env.ACCESS_TOKEN;

  const removeResponse = await context.delete(`https://conduit-api.bondaracademy.com/api/articles/${slugId}`, {
    headers: {
      Authorization: `Token ${loginToken}`,
    },
  });

  expect(removeResponse.status()).toEqual(204);
};

export default globalTeardown;
