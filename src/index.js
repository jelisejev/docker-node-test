require('dotenv').config();

const Koa = require('koa')
const app = new Koa()

// body parser
const bodyParser = require('koa-bodyparser')
app.use(bodyParser())

// authentication
require('./auth')
const passport = require('koa-passport')
app.use(passport.initialize())

// routes
const route = require('koa-route')

// Generate JWT Auth token
const jwt = require("jwt-simple");
const cfg = require('./config');
const users = require('./users');
app.use(route.post('/token', ctx => {
  if (ctx.header.email && ctx.header.password) {
    const email = ctx.header.email;
    const password = ctx.header.password;

    const user = users.find(u => {
      return u.email === email && u.password === password;
    });

    if (user) {
      const payload = {
        id: user.id
      };
      const token = jwt.encode(payload, cfg.jwtSecret);

      ctx.body = {
        token: token
      };
    } else {
      ctx.throw(401);
    }
  } else {
    ctx.throw(401);
  }
}))

const request = require('request-promise')
app.use(route.get('/parameter-set/:id', (ctx, id) => {
  // Authenticate before calling the internal service
  return passport.authenticate('jwt', { session: false }, async (err, user, info, status) => {
    if (user === false) {
      ctx.throw(401)
    } else {

      try {
        const response = await request({
          url: `${process.env.TARGET_URL}?$filter=ParameterSetID%20eq%20${id}`,
          headers: {
            'Authorization': `Basic ${process.env.AUTH_TOKEN}`
          }
        });

        ctx.body = JSON.parse(response);
      } catch (err) {
        ctx.body = err;
      }

    }
  })(ctx)
}))


// start server
const port = process.env.PORT || 3000
app.listen(port, () => console.log('Server listening on', port))
