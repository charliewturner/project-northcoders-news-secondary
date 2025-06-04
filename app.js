const express = require("express");
const app = express();
const { getAllTopics } = require("./controllers.js");

app.get("/api/topics", getAllTopics);

module.exports = app;
