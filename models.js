const db = require("./db/connection.js");

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
