const express = require('express');
const router = express.Router();

const config = require('../config');
const models = require('../models');

function posts(req, res) {
  const userId = req.session.userId;
  const userLogin = req.session.userLogin;
  const perPage = +config.PER_PAGE;
  const page = req.params.page || 1;

  models.Post.find({})
    .skip(perPage * page - perPage)
    .limit(perPage)
    .then((posts) => {
      models.Post.count()
        .then((count) => {
          res.render('index', {
            user: {
              id: userId,
              login: userLogin,
            },
            posts: {
              // посты найденные в базе
              posts,
              // текущая страница :page
              current: page,
              // общее кол-во страниц
              pages: Math.ceil(count / perPage),
              // постов на странице
              perPage: config.PER_PAGE,
            },
          });
        })
        .catch(console.log);
    })
    .catch(console.log);
}

// routers
router.get('/', (req, res) => posts(req, res));
router.get('/archive/:page', (req, res) => posts(req, res));

module.exports = router;
