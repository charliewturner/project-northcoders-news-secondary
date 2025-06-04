const express = require("express");
const app = express();
const { getAllTopics } = require("./controllers.js");
const endpoints = require("./endpoints.json");

app.get("/api", (request, response) => {
  response.status(200).send({ endpoints });
});
app.get("/api/topics", getAllTopics);

module.exports = app;
