require('dotenv').config();
const SECRET_KEY = process.env.SECRET_KEY;
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const app = express();
const LocalStrategy = require('passport-local').Strategy;
const passport = require('passport');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const session = require('express-session');

app.use(express.static("public"));
app.set('view engine', 'ejs');

mongoose.connect(process.env.CONNECT);

app.use(bodyParser.urlencoded({ extended: true }));

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

const User = mongoose.model("User", userSchema);

passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ email: username })
      .then(user => {
        if (!user) {
          return done(null, false);
        }
        bcrypt.compare(password, user.password)
          .then(match => {
            if (match) {
              return done(null, user);
            } else {
              return done(null, false);
            }
          })
          .catch(err => done(err));
      })
      .catch(err => done(err));
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

app.use(session({
  secret: SECRET_KEY,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.get("/", function(req, res){
    res.render("home");
});

app.get("/login", function(req, res){
    res.render("login");
});

app.get("/register", function(req, res){
    res.render("register");
});

app.get("/secrets", function(req, res){
  if (req.isAuthenticated()) {
    res.render("secrets");
  } else {
    res.redirect("/login");
  }
});

app.post("/register", async function(req,res){
  const newUser = new User({
    email: req.body.username,
    password: await bcrypt.hash(req.body.password, saltRounds)
  })
  try {
    await newUser.save();
    req.login(newUser, function(err) {
      if (err) { return next(err); }
      return res.redirect("/secrets");
    });
  } catch(err) {
    console.log(err);
  }
});

app.post('/login', passport.authenticate('local', {
  successRedirect: '/secrets',
  failureRedirect: '/login'
}));

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.listen(3000, function() {
    console.log("Server started on port 3000");
});
