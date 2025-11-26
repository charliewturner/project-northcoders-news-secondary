const db = require("./db/connection.js");
const { articleData } = require("./db/data/development-data/index.js");
const bcrypt = require("bcrypt");

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

  let queryString = `SELECT articles.article_id, articles.title, articles.topic, articles.author, articles.body, articles.created_at, articles.votes, articles.article_img_url, COUNT (comments.comment_id)::INT AS comment_count FROM articles LEFT JOIN comments ON comments.article_id = articles.article_id `;

  const queryValues = [];
  if (topic) {
    queryString += `WHERE articles.topic = $1 `;
    queryValues.push(topic);
  }

  queryString += `GROUP BY articles.article_id ORDER BY ${
    sort_by === "comment_count" ? "comment_count" : `articles.${sort_by}`
  } ${order};`;

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
  COUNT(comments.comment_id)::INT AS comment_count
  FROM articles
  LEFT JOIN comments ON comments.article_id = articles.article_id
  WHERE articles.article_id = $1
  GROUP BY articles.article_id`;

  return db.query(queryString, [article_id]).then(({ rows }) => {
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

exports.fetchCommentsByArticleId = (article_id) => {
  return db
    .query(
      "SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC",
      [article_id]
    )
    .then(({ rows }) => {
      return rows;
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

exports.selectUserWithPassword = (username) => {
  return db
    .query(
      `
      SELECT username, name, avatar_url, password_hash
      FROM users
      WHERE username = $1;
    `,
      [username]
    )
    .then(({ rows }) => rows[0] || null);
};

exports.updateArticleVoteForUser = (article_id, username, newVote) => {
  if (![1, 0, -1].includes(newVote)) {
    return Promise.reject({ status: 400, msg: "Invalid vote value" });
  }

  // 1. Find existing vote from this user on this article (default 0)
  return db
    .query(
      `
      SELECT vote
      FROM article_votes
      WHERE article_id = $1 AND username = $2;
      `,
      [article_id, username]
    )
    .then(({ rows }) => {
      const oldVote = rows[0]?.vote || 0;
      const diff = newVote - oldVote;

      // If nothing changed, just return the article as-is
      if (diff === 0) {
        return db
          .query(`SELECT * FROM articles WHERE article_id = $1;`, [article_id])
          .then(({ rows }) => {
            if (!rows.length) {
              return Promise.reject({ status: 404, msg: "Article not found" });
            }
            return rows[0];
          });
      }

      const upsertVoteQuery = `
        INSERT INTO article_votes (article_id, username, vote)
        VALUES ($1, $2, $3)
        ON CONFLICT (article_id, username)
        DO UPDATE SET vote = EXCLUDED.vote;
      `;

      const updateArticleVotesQuery = `
        UPDATE articles
        SET votes = votes + $1
        WHERE article_id = $2
        RETURNING *;
      `;

      // 2. Apply both updates in a transaction
      return db
        .query("BEGIN")
        .then(() => db.query(upsertVoteQuery, [article_id, username, newVote]))
        .then(() => db.query(updateArticleVotesQuery, [diff, article_id]))
        .then(({ rows }) =>
          db.query("COMMIT").then(() => {
            if (!rows.length) {
              return Promise.reject({ status: 404, msg: "Article not found" });
            }
            return rows[0];
          })
        )
        .catch((err) => {
          return db.query("ROLLBACK").then(() => {
            throw err;
          });
        });
    });
};

exports.selectArticleVotesByUser = (username) => {
  return db
    .query(
      `
      SELECT article_id, vote
      FROM article_votes
      WHERE username = $1;
      `,
      [username]
    )
    .then(({ rows }) => rows);
};

exports.updateCommentVoteForUser = (comment_id, username, newVote) => {
  if (![1, 0, -1].includes(newVote)) {
    return Promise.reject({ status: 400, msg: "Invalid vote value" });
  }

  // find existing vote from this user on this comment
  return db
    .query(
      `
      SELECT vote
      FROM comment_votes
      WHERE comment_id = $1 AND username = $2;
      `,
      [comment_id, username]
    )
    .then(({ rows }) => {
      const oldVote = rows[0]?.vote || 0;
      const diff = newVote - oldVote;

      if (diff === 0) {
        // no change → just return current comment
        return db
          .query(`SELECT * FROM comments WHERE comment_id = $1;`, [comment_id])
          .then(({ rows }) => {
            if (!rows.length) {
              return Promise.reject({ status: 404, msg: "Comment not found" });
            }
            return rows[0];
          });
      }

      const upsertVoteQuery = `
        INSERT INTO comment_votes (comment_id, username, vote)
        VALUES ($1, $2, $3)
        ON CONFLICT (comment_id, username)
        DO UPDATE SET vote = EXCLUDED.vote;
      `;

      const updateCommentVotesQuery = `
        UPDATE comments
        SET votes = votes + $1
        WHERE comment_id = $2
        RETURNING *;
      `;

      return db
        .query("BEGIN")
        .then(() => db.query(upsertVoteQuery, [comment_id, username, newVote]))
        .then(() => db.query(updateCommentVotesQuery, [diff, comment_id]))
        .then(({ rows }) =>
          db.query("COMMIT").then(() => {
            if (!rows.length) {
              return Promise.reject({ status: 404, msg: "Comment not found" });
            }
            return rows[0];
          })
        )
        .catch((err) => {
          return db.query("ROLLBACK").then(() => {
            throw err;
          });
        });
    });
};

exports.selectCommentVotesByUser = (username) => {
  return db
    .query(
      `
      SELECT comment_id, vote
      FROM comment_votes
      WHERE username = $1;
      `,
      [username]
    )
    .then(({ rows }) => rows);
};
