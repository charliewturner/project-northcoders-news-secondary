const express = require("express");
const app = express();
const {
  getAllTopics,
  getAllArticles,
  getAllUsers,
} = require("./controllers.js");
const endpoints = require("./endpoints.json");

app.get("/api", (request, response) => {
  response.status(200).send({ endpoints });
});
app.get("/api/topics", getAllTopics);
app.get("/api/articles", getAllArticles);
app.get("/api/users", getAllUsers);

module.exports = app;
