const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose')
const User = require('../models/user')
const flash = require('connect-flash');

module.exports = function(passport) {
    passport.use(
      new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
        // Match user
        User.findOne({
          email: email
        }).then(user => {
          if (!user) {
            console.log("Password incorrect ")
           // req.flash('success_msg', 'You are now registered and can log in')
            return done(null, false, { message: 'Email or Password incorrect' }  )
          }
  
          // Match password
          bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) throw err;
            if (isMatch) {
              return done(null, user);
            } else {
              console.log("sdadsad")
              return done(null, false, { message: 'Email or Password incorrect' });
              
            }
          });
        });
      })
    );
  
    passport.serializeUser(function(user, done) {
      done(null, user.id);
    });
  
    passport.deserializeUser(function(id, done) {
      User.findById(id, function(err, user) {
        done(err, user);
      });
    });
  };