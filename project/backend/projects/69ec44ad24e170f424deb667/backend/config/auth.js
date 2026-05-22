const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const { database } = require('./database');

const User = database.model('User');

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, (email, password, done) => {
  User.findOne({ where: { email } })
    .then(user => {
      if (!user) {
        return done(null, false, { message: 'Invalid email or password' });
      }
      bcrypt.compare(password, user.password, (err, match) => {
        if (err) {
          return done(err);
        }
        if (!match) {
          return done(null, false, { message: 'Invalid email or password' });
        }
        return done(null, user);
      });
    })
    .catch(err => done(err));
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findByPk(id)
    .then(user => done(null, user))
    .catch(err => done(err));
});

module.exports = passport;