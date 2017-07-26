const passport = require("koa-passport");

const users = require("./users.js");
const cfg = require("./config.js");

const passportJWT = require("passport-jwt");

const ExtractJwt = passportJWT.ExtractJwt;
const JWTStrategy = passportJWT.Strategy;

const params = {
  secretOrKey: cfg.jwtSecret,
  jwtFromRequest: ExtractJwt.fromAuthHeader()
};

passport.use(new JWTStrategy(params, function (payload, done) {
  const user = users[payload.id] || null;
  if (user) {
    return done(null, {
      id: user.id
    });
  } else {
    return done(new Error("User not found"), null);
  }
}))
