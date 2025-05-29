const db = require("../connection");
const data = require("../data/development-data/index");
const format = require("pg-format");

const createTopicsTable = format(`DROP TABLE IF EXISTS topics;

CREATE TABLE topics (
  slug VARCHAR(50) UNIQUE PRIMARY KEY,
  description VARCHAR(512),
  img_url VARCHAR(512)
);`);

const createUsersTable = format(`DROP TABLE IF EXISTS users;

  CREATE TABLE users (
    username VARCHAR(50) PRIMARY KEY,
    name VARCHAR(50),
    avatar_url VARCHAR(512)
  );`);

const createArticlesTable = format(`DROP TABLE IF EXISTS articles;
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

const createCommentsTable = format(`DROP TABLE IF EXISTS comments;
CREATE TABLE comments (
  comment_id SERIAL PRIMARY KEY,
  article_id INT,
  FOREIGN KEY (article_id) REFERENCES articles (article_id),
  body TEXT,
  votes INT default 0,
  author VARCHAR(255),
  FOREIGN KEY (author) REFERENCES users (username),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`);

const seed = ({ topicData, userData, articleData, commentData }) => {
  // For this task you should create tables for topics, users, articles, and comments

  return db.query(); //<< write your first query in here.
};
module.exports = seed;
