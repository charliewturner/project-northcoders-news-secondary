const {
  selectAllTopics,
  selectAllArticles,
  selectAllUsers,
  selectArticleById,
  insertCommentByArticleId,
  updateArticleVotes,
  removeCommentById,
} = require("./models");

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

exports.getAllArticles = (request, response) => {
  const { sort_by, order } = request.query;

  selectAllArticles(sort_by, order)
    .then((articles) => {
      response.status(200).send({ articles });
    })
    .catch((err) => {
      console.log(err);
      response.status(500).send({ error: "Internal server error" });
    });

  //   selectAllArticles(sort_by, order)
  //     .then((articles) => {
  //       const formattedArticles = articles
  //         .map(({ body, ...rest }) => rest)
  //         .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  //       response.status(200).send({ articles: formattedArticles });
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //       response.status(500).send({ error: "Internal server error" });
  //     });
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
  const { inc_votes } = request.body;

  updateArticleVotes(article_id, inc_votes)
    .then((updatedArticle) => {
      response.status(200).send(updatedArticle);
    })
    .catch((err) => {
      next(err);
    });
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
