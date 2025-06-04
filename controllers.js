const {
  selectAllTopics,
  selectAllArticles,
  selectAllUsers,
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
  selectAllArticles()
    .then((articles) => {
      const formattedArticles = articles
        .map(({ body, ...rest }) => rest)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      response.status(200).send({ articles: formattedArticles });
    })
    .catch((err) => {
      console.log(err);
      response.status(500).send({ error: "Internal server error" });
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
