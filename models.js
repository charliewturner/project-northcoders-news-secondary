const db = require("./db/connection.js");
const { articleData } = require("./db/data/development-data/index.js");

exports.selectAllTopics = () => {
  return db.query("SELECT * FROM topics").then((data) => {
    return data.rows;
  });
};

exports.selectAllArticles = (sort_by = "created_at", order = "desc", topic) => {
  const validSortBy = [
    "article_id",
    "title",
    "topic",
    "author",
    "body",
    "created_at",
    "votes",
    "comment_count",
  ];

  const validOrder = ["desc", "asc"];

  sort_by = sort_by.toLowerCase();
  order = order.toLowerCase();

  if (!validSortBy.includes(sort_by)) {
    return Promise.reject({ status: 400, msg: "Invalid sort_by query" });
  }
  if (!validOrder.includes(order)) {
    return Promise.reject({ status: 400, msg: "Invalid order query" });
  }

  let queryString = `SELECT articles.article_id, articles.title, articles.topic, articles.author, articles.created_at, articles.votes, articles.article_img_url FROM articles `;

  const queryValues = [];
  if (topic) {
    queryString += `WHERE articles.topic = $1 `;
    queryValues.push(topic);
  }

  queryString += `ORDER BY ${sort_by} ${order}`;

  return db.query(queryString, queryValues).then(({ rows }) => {
    if (topic && rows.length === 0) {
      return db
        .query(`SELECT * FROM topics WHERE slug = $1`, [topic])
        .then(({ rows }) => {
          if (rows.length === 0) {
            return Promise.reject({ status: 404, msg: "Topic not found" });
          } else {
            return [];
          }
        });
    } else return rows;
  });
};

exports.selectArticleById = (article_id) => {
  const queryString = `SELECT articles.*,
  COUNT (comments.comment_id)::INT AS comment_count
  FROM articles
  LEFT JOIN comments ON comments.article_id = articles.article_id
  WHERE articles.article_id = $1
  GROUP BY articles.article_id`;

  return db.query(queryString, [article_id]).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, msg: "Topic not found" });
    }
    return rows[0];
  });
  // return db
  //   .query("SELECT * FROM articles WHERE article_id = $1", [article_id])
  //   .then(({ rows }) => {
  //     if (rows.length === 0) {
  //       return Promise.reject({ status: 404, msg: "Article not found" });
  //     }
  //     return rows[0];
  //   });
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

exports.updateArticleVotes = (article_id, inc_votes) => {
  if (typeof inc_votes !== "number") {
    return Promise.reject({ status: 400, msg: "Invalid vote count" });
  }
  return db
    .query(
      "UPDATE articles SET votes = votes + $1 WHERE article_id = $2 RETURNING *",
      [inc_votes, article_id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Article not found" });
      }
      return rows[0];
    });
};

exports.removeCommentById = (comment_id) => {
  if (isNaN(comment_id) || !comment_id) {
    return Promise.reject({ status: 400, msg: "Invalid comment id" });
  }

  return db
    .query("DELETE FROM comments WHERE comment_id = $1 RETURNING *", [
      comment_id,
    ])
    .then(({ rows }) => {
      if (rows.length === 0)
        return Promise.reject({ status: 404, msg: "Comment not found" });
    });
};
