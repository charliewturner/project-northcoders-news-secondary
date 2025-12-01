const {
  selectAllTopics,
  selectAllArticles,
  selectAllUsers,
  selectArticleById,
  insertCommentByArticleId,
  updateArticleVoteForUser,
  removeCommentById,
  fetchCommentsByArticleId,
  selectUserWithPassword,
  selectArticleVotesByUser,
  updateCommentVoteForUser,
  selectCommentVotesByUser,
  insertArticle,
  removeArticleById,
} = require("./models");
const bcrypt = require("bcrypt");

exports.getAllTopics = (request, response) => {
  selectAllTopics()
    .then((topics) => {
      response.status(200).send({ topics });
    })
    .catch((err) => {
      console.log(err);
      response.status(500).send({ error: "Internal server error" });
    });
};

exports.getAllArticles = (request, response, next) => {
  const { sort_by, order, topic } = request.query;

  selectAllArticles(sort_by, order, topic)
    .then((articles) => {
      response.status(200).send({ articles });
    })

    .catch((err) => {
      next(err);
    });
};

exports.getArticleById = (request, response) => {
  const { article_id } = request.params;
  selectArticleById(article_id)
    .then((article) => {
      response.status(200).send({ article });
    })
    .catch((err) => {
      console.log(err);
      response.status(500).send({ error: "Internal server error" });
    });
};

exports.getCommentsByArticleId = (request, response) => {
  const { article_id } = request.params;
  fetchCommentsByArticleId(article_id)
    .then((comments) => response.status(200).send({ comments }))
    .catch((err) => {
      console.log(err);
      response.status(500).send({ error: "Internal server error" });
    });
};

exports.postCommentByArticleId = (request, response, next) => {
  const { article_id } = request.params;
  const newComment = request.body;

  insertCommentByArticleId(article_id, newComment)
    .then((comment) => {
      response.status(201).send({ comment });
    })
    .catch((err) => {
      console.log(err);
      next(err);
    });
};

exports.patchArticleVotes = (request, response, next) => {
  const { article_id } = request.params;
  const { username, vote } = request.body;

  if (!username) {
    return next({ status: 400, msg: "Username required for voting" });
  }

  if (![1, 0, -1].includes(vote)) {
    return next({ status: 400, msg: "Invalid vote value" });
  }

  updateArticleVoteForUser(article_id, username, vote)
    .then((updatedArticle) => {
      response.status(200).send({ article: updatedArticle });
    })
    .catch(next);
};

exports.getAllUsers = (request, response) => {
  selectAllUsers()
    .then((users) => {
      response.status(200).send({ users });
    })
    .catch((err) => {
      console.log(err);
      response.status(500).send({ error: "Internal server error" });
    });
};

exports.deleteCommentById = (request, response, next) => {
  const { comment_id } = request.params;
  removeCommentById(comment_id)
    .then(() => {
      response.status(204).send();
    })
    .catch(next);
};

exports.loginUser = (request, response, next) => {
  const { username, password } = request.body;

  if (!username || !password) {
    return next({ status: 400, msg: "Username and password required" });
  }

  selectUserWithPassword(username)
    .then((user) => {
      if (!user) {
        return Promise.reject({
          status: 401,
          msg: "Invalid username or password",
        });
      }

      return bcrypt.compare(password, user.password_hash).then((isMatch) => {
        if (!isMatch) {
          return Promise.reject({
            status: 401,
            msg: "Invalid username or password",
          });
        }

        const { password_hash, ...safeUser } = user;
        response.status(200).send({ user: safeUser });
      });
    })
    .catch(next);
};

exports.getUserArticleVotes = (request, response, next) => {
  const { username } = request.params;

  selectArticleVotesByUser(username)
    .then((votes) => {
      response.status(200).send({ votes });
    })
    .catch(next);
};

exports.patchCommentVotes = (request, response, next) => {
  const { comment_id } = request.params;
  const { username, vote } = request.body;

  if (!username) {
    return next({ status: 400, msg: "Username required for voting" });
  }

  if (![1, 0, -1].includes(vote)) {
    return next({ status: 400, msg: "Invalid vote value" });
  }

  updateCommentVoteForUser(comment_id, username, vote)
    .then((updatedComment) => {
      response.status(200).send({ comment: updatedComment });
    })
    .catch(next);
};

exports.getUserCommentVotes = (request, response, next) => {
  const { username } = request.params;

  selectCommentVotesByUser(username)
    .then((votes) => {
      response.status(200).send({ votes });
    })
    .catch(next);
};

exports.postArticle = (req, res, next) => {
  const { author, title, topic, body, article_img_url } = req.body;

  if (!author || !title || !topic || !body) {
    return next({ status: 400, msg: "Missing required fields" });
  }
  removeArticleById,
    insertArticle({ author, title, topic, body, article_img_url })
      .then((article) => {
        res.status(201).send({ article });
      })
      .catch(next);
};

exports.deleteArticleById = (request, response, next) => {
  const { article_id } = request.params;

  removeArticleById(article_id)
    .then(() => {
      response.status(204).send();
    })
    .catch(next);
};
