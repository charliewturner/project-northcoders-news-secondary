const db = require("../connection");
const data = require("../data/development-data/index");
const format = require("pg-format");

const createTopicsTable = format(`
  CREATE TABLE topics (
  slug VARCHAR(50) UNIQUE PRIMARY KEY,
  description VARCHAR(512),
  img_url VARCHAR(512)
);`);

const createUsersTable = format(`
  CREATE TABLE users (
    username VARCHAR(50) PRIMARY KEY,
    name VARCHAR(50),
    avatar_url VARCHAR(512)
  );`);

const createArticlesTable = format(`
CREATE TABLE articles (
  article_id SERIAL PRIMARY KEY,
  title VARCHAR(512),
  topic VARCHAR(50),
  author VARCHAR(50),
  body TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  votes INT DEFAULT 0,
  article_img_url VARCHAR(512)
);`);

const createCommentsTable = format(`
CREATE TABLE comments (
  comment_id SERIAL PRIMARY KEY,
  article_id INT,
  body TEXT,
  votes INT default 0,
  author VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (author) REFERENCES users (username),
  FOREIGN KEY (article_id) REFERENCES articles (article_id)
);`);

// const updateTopicsTable = format(
//   `
//   INSERT INTO topics
//     (slug, description, img_url)
//   VALUES
//     %L
//   RETURNING *;`,
//   nestedArrOfValues
// );
// const updateUsersTable = format(
//   `
//   INSERT INTO users
//     (username, name, avatar_url)
//   VALUES
//     %L
//   RETURNING *;`,
//   nestedArrOfValues
// );
// const updateArticlesTable = format(
//   `
//   INSERT INTO articles
//     (title, topic, author, body, created_at, votes, article_img_url)
//   VALUES
//     %L
//   RETURNING *;`,
//   nestedArrOfValues
// );

// const updateCommentsTable = format(
//   `INSERT INTO comments
//     (article_id, body, votes, author, created_at)
//   VALUES
//     %L
//   RETURNING *;`,
//   nestedArrOfValues
// );

const seed = ({ topicData, userData, articleData, commentData }) => {
  // For this task you should create tables for topics, users, articles, and comments

  return db
    .query(
      `DROP TABLE IF EXISTS comments; DROP TABLE IF EXISTS articles;DROP TABLE IF EXISTS users;DROP TABLE IF EXISTS topics;`
    )
    .then(() => {
      return db.query(createTopicsTable);
    })
    .then(() => {
      return db.query(createUsersTable);
    })
    .then(() => {
      return db.query(createArticlesTable);
    })
    .then(() => {
      console.log("Tables created successfully!");
      return db.query(createCommentsTable);
    });
};

module.exports = seed;
