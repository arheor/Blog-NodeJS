const express = require('express');
const router = express.Router();
const moment = require('moment');
moment.locale('ru');

const config = require('../config');
const models = require('../models');

async function posts(req, res) {
  const userId = req.session.userId;
  const userLogin = req.session.userLogin;
  const perPage = +config.PER_PAGE;
  const page = req.params.page || 1;

  try {
    const posts = await models.Post.find({})
      .skip(perPage * page - perPage)
      .limit(perPage)
      .populate('owner', 'login')
      .sort({ createdAt: -1 });
    const count = await models.Post.count();
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
  } catch (error) {
    throw new Error('Server Error');
  }
}

// routers
router.get('/', (req, res) => posts(req, res));
router.get('/archive/:page', (req, res) => posts(req, res));

router.get('/posts/:post', async (req, res, next) => {
  const url = req.params.post.trim().replace(/ +(?= )/g, '');
  const userId = req.session.userId;
  const userLogin = req.session.userLogin;

  if (!url) {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
  } else {
    try {
      const post = await models.Post.findOne({
        url,
      }).populate('owner', 'login');
      if (!post) {
        const err = new Error('Not Found');
        err.status = 404;
        next(err);
      } else {
        const comments = await models.Comment.find({
          post: post.id,
          parent: { $exists: false },
        });
        // .populate({
        //   path: 'children',
        //   populate: {
        //     path: 'children',
        //     populate: {
        //       path: 'children'
        //     }
        //   }
        // });

        console.log(comments);

        res.render('post/post', {
          post,
          comments,
          moment,
          user: {
            id: userId,
            login: userLogin,
          },
        });
      }
    } catch (error) {
      throw new Error('Server Error');
    }
  }
});

// users posts
router.get('/users/:login/:page*?', async (req, res) => {
  const userId = req.session.userId;
  const userLogin = req.session.userLogin;
  const perPage = +config.PER_PAGE;
  const page = req.params.page || 1;
  const login = req.params.login;

  try {
    const user = await models.User.findOne({
      login,
    });

    const posts = await models.Post.find({
      owner: user.id,
    })
      .skip(perPage * page - perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });
    const count = await models.Post.count({
      owner: user.id,
    });
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
  } catch (error) {
    throw new Error('Server Error');
  }
});

module.exports = router;
