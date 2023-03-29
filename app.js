require('dotenv').config();
const SECRET_KEY = process.env.SECRET_KEY;
// Using environment variables ^ 
const bodyParser = require("body-parser")
const ejs = require("ejs")
const mongoose = require("mongoose")
const { Schema } = mongoose;

const LocalStrategy = require('passport-local').Strategy;
const passport = require('passport');
// User authentication + strategy ^

const bcrypt = require('bcrypt');
const saltRounds = 10;
// Including encryption ^
const express = require("express")
const session = require('express-session');
const app = express()

app.use(express.static("public"))
app.set('view engine', 'ejs')

app.use(bodyParser.urlencoded({ extended: true }))

mongoose.connect(process.env.CONNECT);


app.use(session({
  secret: SECRET_KEY,
  resave: false,
  saveUninitialized: true
}));


passport.use(new LocalStrategy(
  async function(username, password, done) {
    try {
      const user = await User.findOne({ email: username });
      if (!user) { return done(null, false); }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) { return done(null, false); }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));



passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(async function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});





const userSchema = new Schema({
    email: String,
    password: String
})

const User = mongoose.model("User", userSchema)
// Including the schema/collection in MongoDB ^


app.get("/", function(req, res){
    res.render("home")
})

app.get("/login", function(req, res){
    res.render("login")
})

app.get("/register", function(req, res){
    res.render("register")
})

app.get("/secrets", function(req, res){
    res.render("secrets")
})



app.post("/register", async function(req,res){
  mongoose.connect(process.env.CONNECT);
  const newUser = new User({
      email: req.body.username,
      password: await bcrypt.hash(req.body.password, saltRounds)
    })

   try {
    await newUser.save()
    res.redirect("/secrets")
   } catch(err) {
      console.log(err)
   }
})


app.post('/login',passport.authenticate('local', {
  successRedirect: '/secrets',
  failureRedirect: '/login'
}));





  



app.listen(3000, function() {
    console.log("Server started on port 3000")
})


