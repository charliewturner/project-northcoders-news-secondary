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

describe.skip("GET /api", () => {
  test("200: Responds with an object detailing the documentation for each endpoint", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body: { endpoints } }) => {
        expect(endpoints).toEqual(endpointsJson);
      });
  });
});

describe.skip("GET /api/topics", () => {
  test("200: Responds with an array of topics. Each topic is an object with a slug and a description key", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body }) => {
        expect(Array.isArray(body.topics)).toEqual(true);
        expect(Object.keys(body)).toEqual(["topics"]);
        // console.log(body.topics);
        body.topics.forEach((topic) => {
          expect(topic.hasOwnProperty("slug")).toEqual(true);
          expect(topic.hasOwnProperty("description")).toEqual(true);
        });
      });
  });
});

describe.skip("GET /api/articles", () => {
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
  test("200: Responds with articles sorted in descending created_by order by default", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toBeSortedBy("created_at", { descending: true });
      });
  });
  test("200: Responds with articles sorted by the specified sort_by, in the specified order", () => {
    return request(app)
      .get("/api/articles?sort_by=title&order=asc")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toBeSortedBy("title", { ascending: true });
      });
  });
  test("200: Returns the articles filtered by a specific topic", () => {
    return request(app)
      .get("/api/articles?topic=cats")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(Array.isArray(articles)).toEqual(true);

        articles.forEach((article) => {
          expect(article.topic).toBe("cats");
        });
      });
  });
  test("200: Returns the an empty array of articles when sent a valid topic with no articles", () => {
    return request(app)
      .get("/api/articles?topic=paper")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(Array.isArray(articles)).toEqual(true);
        expect(articles).toEqual([]);
      });
  });
  test("404: Returns an error when passed an invalid topic", () => {
    return request(app)
      .get("/api/articles?topic=notarealtopic")
      .expect(404)
      .then(({ body }) => {
        expect(body).toEqual({ status: 404, msg: "Topic not found" });
      });
  });
  test("400: Responds with an error when attempting to use invalid queries", () => {
    return request(app)
      .get("/api/articles?sort_by=director&order=asc")
      .expect(400)
      .then(({ body }) => {
        expect(body).toEqual({ status: 400, msg: "Invalid sort_by query" });
      });
  });
});

describe.skip("GET /api/articles/:article_id", () => {
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
  test("200: Responds with an object including a comment_count key", () => {
    return request(app)
      .get("/api/articles/3")
      .expect(200)
      .then(({ body }) => {
        expect(Object.keys(body)).toEqual(["article"]);
        expect(body.article.hasOwnProperty("comment_count")).toEqual(true);
      });
  });
});

describe.skip("GET /api/users", () => {
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

describe.skip("POST /api/articles/:article_id/comments", () => {
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

describe.skip("PATCH /api/articles/:article_id", () => {
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

describe.skip("DELETE /api/comments/:comment_id", () => {
  test("Deletes the comment specified by the comment_id passed in", () => {
    return db
      .query("SELECT comment_id FROM comments LIMIT 1")
      .then(({ rows }) => {
        const comment_id = rows[0].comment_id;
        return request(app).delete(`/api/comments/${comment_id}`).expect(204);
      });
  });
});
