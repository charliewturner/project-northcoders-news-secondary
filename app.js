const express = require("express");
const app = express();

const {
  getAllTopics,
  getAllArticles,
  getAllUsers,
  getArticleById,
  postCommentByArticleId,
  patchArticleVotes,
  deleteCommentById,
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

app.patch("/api/articles/:article_id", patchArticleVotes);

app.delete("/api/comments/:comment_id", deleteCommentById);

app.use((err, request, response, next) => {
  if (err.status && err.msg) {
    response.status(err.status).send({ status: err.status, msg: err.msg });
  } else {
    console.log(err);
    this.response
      .status(500)
      .send({ status: 500, msg: "Internal Server Error" });
  }
});
module.exports = app;
