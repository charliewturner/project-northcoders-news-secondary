const db = require("./db/connection.js");
const { articleData } = require("./db/data/development-data/index.js");

exports.selectAllTopics = () => {
  return db.query("SELECT * FROM topics").then((data) => {
    return data.rows;
  });
};

exports.selectAllArticles = () => {
  return db.query("SELECT * FROM articles").then((data) => {
    return data.rows;
  });
};

exports.selectArticleById = (article_id) => {
  return db
    .query("SELECT * FROM articles WHERE article_id = $1", [article_id])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Article not found" });
      }
      return rows[0];
    });
};

exports.selectAllUsers = () => {
  return db.query("SELECT * FROM users").then((data) => {
    return data.rows;
  });
};

exports.insertCommentByArticleId = (article_id, { username, body }) => {
  if (!username || !body) {
    return Promise.reject({ status: 400, msg: "Missing required field(s)" });
  }
  return db
    .query(
      "INSERT INTO comments (article_id, author, body) VALUES ($1, $2, $3) RETURNING *",
      [article_id, username, body]
    )
    .then(({ rows }) => rows[0]);
};
