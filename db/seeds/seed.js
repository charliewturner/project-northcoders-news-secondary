const db = require("../connection");
const data = require("../data/development-data/index");
const format = require("pg-format");
const { convertTimestampToDate } = require("./utils");

const createTopicsTable = format(`
  CREATE TABLE topics (
  slug VARCHAR(50) UNIQUE PRIMARY KEY,
  description VARCHAR(512),
  img_url VARCHAR(1000)
);`);

const createUsersTable = format(`
  CREATE TABLE users (
    username VARCHAR(50) PRIMARY KEY,
    name VARCHAR(50),
    avatar_url VARCHAR(1000)
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
  article_img_url VARCHAR(1000),
  FOREIGN KEY (topic) REFERENCES topics (slug),
FOREIGN KEY (author) REFERENCES users (username)
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
    })
    .then(() => {
      const topicValues = topicData.map(({ slug, description, img_url }) => [
        slug,
        description,
        img_url,
      ]);
      const updateTopicsTable = format(
        `INSERT INTO topics
          (slug, description, img_url)
        VALUES
         %L
         RETURNING *;`,
        topicValues
      );
      return db.query(updateTopicsTable);
    })
    .then(() => {
      const userValues = userData.map(({ username, name, avatar_url }) => [
        username,
        name,
        avatar_url,
      ]);
      const updateUsersTable = format(
        `
        INSERT INTO users
        (username, name, avatar_url)
         VALUES
          %L
           RETURNING *;`,
        userValues
      );
      return db.query(updateUsersTable);
    })
    .then(() => {
      const articleValues = articleData.map((article) => {
        const convertedArticle = convertTimestampToDate(article);
        return [
          convertedArticle.title,
          convertedArticle.topic,
          convertedArticle.author,
          convertedArticle.body,
          convertedArticle.created_at,
          convertedArticle.votes,
          convertedArticle.article_img_url,
        ];
      });

      const updateArticlesTable = format(
        `INSERT INTO articles
        (title, topic, author, body, created_at, votes,      article_img_url)
        VALUES
        %L
          RETURNING *;`,
        articleValues
      );
      return db.query(updateArticlesTable);
    })
    .then(() => {
      const commentValues = commentData.map((comment) => {
        const convertedComment = convertTimestampToDate(comment);
        return [
          convertedComment.article_id,
          convertedComment.body,
          convertedComment.votes,
          convertedComment.author,
          convertedComment.created_at,
        ];
      });

      const updateCommentsTable = format(
        `INSERT INTO comments
          (article_id, body, votes, author, created_at)
         VALUES
         %L
         RETURNING *;`,
        commentValues
      );

      return db.query(updateCommentsTable);
    })
    .then(() => {
      console.log("Tables successfully updated!");
    })
    .catch((err) => {
      console.log("Error during seeding: " + err);
    });
};

module.exports = seed;
