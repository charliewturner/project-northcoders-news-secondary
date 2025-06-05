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

describe("GET /api/articles/:article_id", () => {
  test("200: Responds with an object with the key of article and the value of an article object", () => {
    return request(app)
      .get("/api/articles/3")
      .expect(200)
      .then(({ body }) => {
        expect(Object.keys(body)).toEqual(["article"]);

        expect(body.article.hasOwnProperty("article_id")).toEqual(true);
        expect(body.article.hasOwnProperty("title")).toEqual(true);
        expect(body.article.hasOwnProperty("topic")).toEqual(true);
        expect(body.article.hasOwnProperty("author")).toEqual(true);
        expect(body.article.hasOwnProperty("body")).toEqual(true);
        expect(body.article.hasOwnProperty("created_at")).toEqual(true);
        expect(body.article.hasOwnProperty("votes")).toEqual(true);
        expect(body.article.hasOwnProperty("article_img_url")).toEqual(true);
      });
  });
});

describe("GET /api/users", () => {
  test("200: Responds with an object containing an array of users", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body }) => {
        expect(Array.isArray(body.users)).toEqual(true);
        expect(Object.keys(body)).toEqual(["users"]);
        body.users.forEach((article) => {
          expect(article.hasOwnProperty("username")).toEqual(true);
          expect(article.hasOwnProperty("name")).toEqual(true);
          expect(article.hasOwnProperty("avatar_url")).toEqual(true);
        });
      });
  });
});

describe("POST /api/articles/:article_id/comments", () => {
  test("201: Adds a comment to the specified article with the correct author/username", () => {
    const newComment = {
      username: "butter_bridge",
      body: "Placeholder comment <--",
    };

    return request(app)
      .post("/api/articles/3/comments")
      .send(newComment)
      .expect(201)
      .then(({ body }) => {
        const { comment } = body;

        expect(comment).hasOwnProperty("comment_id");
        expect(comment).hasOwnProperty("article_id");
        expect(comment).hasOwnProperty("body");
        expect(comment).hasOwnProperty("votes");
        expect(comment).hasOwnProperty("author");
        expect(comment).hasOwnProperty("created_at");

        expect(comment.body).toEqual("Placeholder comment <--");
        expect(comment.author).toEqual("butter_bridge");
        // expect(body.article.hasOwnProperty("article_id")).toEqual(true);
      });
  });
});

describe("PATCH /api/articles/:article_id", () => {
  test("Accepts an object containing voting data. The data updates the votes key on the specified article when passed a positive number of votes", () => {
    const votes = {
      inc_votes: 38,
    };

    return request(app)
      .patch("/api/articles/3")
      .send(votes)
      .expect(200)
      .then(({ body }) => {
        expect(body.votes).toBe(38);
      });
  });
  test("Accepts an object containing voting data. The data updates the votes key on the specified article when passed a negative number of votes", () => {
    const votes = {
      inc_votes: -50,
    };

    return request(app)
      .patch("/api/articles/3")
      .send(votes)
      .expect(200)
      .then(({ body }) => {
        expect(body.votes).toBe(-50);
      });
  });
  test("When passed an invalid data type for votes, passes the correct error back", () => {
    const votes = {
      inc_votes: "invalid entry",
    };

    return request(app).patch("/api/articles/3").send(votes).expect(400);
  });
  test("When trying to amend votes on an invalid article ID, returns a 404", () => {
    const votes = {
      inc_votes: 23,
    };

    return request(app).patch("/api/articles/317").send(votes).expect(404);
  });
});

describe("DELETE /api/comments/:comment_id", () => {
  test("Deletes the comment specified by the comment_id passed in", () => {
    // return request(app)
    //   .delete("/api/comments/1")
    //   .send()
    //   .expect(204)
    //   .then((response) => {
    //     console.log(response);
    //   });

    return db
      .query("SELECT comment_id FROM comments LIMIT 1")
      .then(({ rows }) => {
        const comment_id = rows[0].comment_id;
        return request(app).delete(`/api/comments/${comment_id}`).expect(204);
      });
  });
});
