const endpointsJson = require("../endpoints.json");
/* Set up your test imports here */

const request = require("supertest");
const db = require("../db/connection.js");
const seed = require("../db/seeds/seed.js");
const testData = require("../db/data/test-data");
const app = require("../app.js");
const { forEach } = require("../db/data/development-data/articles.js");
/* Set up your beforeEach & afterAll functions here */

beforeEach(() => {
  return seed(testData);
});

afterAll(() => {
  return db.end();
});

describe("GET /api", () => {
  test("200: Responds with an object detailing the documentation for each endpoint", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body: { endpoints } }) => {
        expect(endpoints).toEqual(endpointsJson);
      });
  });
});

describe("GET /api/topics", () => {
  test("200: Responds with an array of topics. Each topic is an object with a slug and a description key", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body }) => {
        expect(Array.isArray(body.topics)).toEqual(true);
        expect(Object.keys(body)).toEqual(["topics"]);

        body.topics.forEach((topic) => {
          expect(topic.hasOwnProperty("slug")).toEqual(true);
          expect(topic.hasOwnProperty("description")).toEqual(true);
        });
      });
  });
});

describe("GET /api/articles", () => {
  test("200: Responds with an object with the key of articles. Each article has the correct properties", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        expect(Array.isArray(body.articles)).toEqual(true);
        expect(Object.keys(body)).toEqual(["articles"]);

        body.articles.forEach((article) => {
          expect(article.hasOwnProperty("article_id")).toEqual(true);
          expect(article.hasOwnProperty("title")).toEqual(true);
          expect(article.hasOwnProperty("topic")).toEqual(true);
          expect(article.hasOwnProperty("author")).toEqual(true);
          expect(article.hasOwnProperty("body")).toEqual(false);
          expect(article.hasOwnProperty("created_at")).toEqual(true);
          expect(article.hasOwnProperty("votes")).toEqual(true);
          expect(article.hasOwnProperty("article_img_url")).toEqual(true);
        });
      });
  });
});
