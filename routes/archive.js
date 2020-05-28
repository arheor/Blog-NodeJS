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
    .populate('owner', 'login')
    .sort({ createdAt: -1 })
    .then((posts) => {
      models.Post.count()
        .then((count) => {
          res.render('archive/index', {
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
        .catch(() => {
          throw new Error('Server Error');
        });
    })
    .catch(() => {
      throw new Error('Server Error');
    });
}

// routers
router.get('/', (req, res) => posts(req, res));
router.get('/archive/:page', (req, res) => posts(req, res));

router.get('/posts/:post', (req, res, next) => {
  const url = req.params.post.trim().replace(/ +(?= )/g, '');
  const userId = req.session.userId;
  const userLogin = req.session.userLogin;

  if (!url) {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
  } else {
    models.Post.findOne({
      url,
    }).then((post) => {
      if (!post) {
        const err = new Error('Not Found');
        err.status = 404;
        next(err);
      } else {
        res.render('post/post', {
          post,
          user: {
            id: userId,
            login: userLogin,
          },
        });
      }
    });
  }
});

// users posts
router.get('/users/:login/:page*?', (req, res) => {
  const userId = req.session.userId;
  const userLogin = req.session.userLogin;
  const perPage = +config.PER_PAGE;
  const page = req.params.page || 1;
  const login = req.params.login;

  models.User.findOne({
    login,
  }).then((user) => {
    models.Post.find({
      owner: user.id,
    })
      .skip(perPage * page - perPage)
      .limit(perPage)
      .sort({ createdAt: -1 })
      .then((posts) => {
        console.log(posts);
        models.Post.count({
          owner: user.id,
        })
          .then((count) => {
            res.render('archive/user', {
              user: {
                id: userId,
                login: userLogin,
              },
              _user: user,
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
          .catch(() => {
            throw new Error('Server Error');
          });
      })
      .catch(() => {
        throw new Error('Server Error');
      });
  });
});

module.exports = router;
