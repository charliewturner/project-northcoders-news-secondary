const express = require("express");
const app = express();

const {
  getAllTopics,
  getAllArticles,
  getAllUsers,
  getArticleById,
  postCommentByArticleId,
} = require("./controllers.js");
const endpoints = require("./endpoints.json");

app.use(express.json());

app.get("/api", (request, response) => {
  response.status(200).send({ endpoints });
});
app.get("/api/topics", getAllTopics);
app.get("/api/articles", getAllArticles);
app.get("/api/articles/:article_id", getArticleById);
app.get("/api/users", getAllUsers);

app.post("/api/articles/:article_id/comments", postCommentByArticleId);

module.exports = app;
