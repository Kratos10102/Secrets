require('dotenv').config();
const SECRET_KEY = process.env.SECRET_KEY;
// Using environment variables ^ 
const express = require("express")
const bodyParser = require("body-parser")
const ejs = require("ejs")
const mongoose = require("mongoose")
const app = express()
const { Schema } = require('mongoose');

const bcrypt = require('bcrypt');
const saltRounds = 10;
// Including encryption ^

app.use(express.static("public"))
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: true }))

mongoose.connect(process.env.CONNECT)


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



app.post("/login", async function(req, res) {
    const { username, password } = req.body;
    
    try {
      const foundUser = await User.findOne({ email: username }).exec();
      
      if (foundUser) {
        if (await bcrypt.compare(password, foundUser.password)) {
          res.redirect("/secrets");
        } else {
          res.status(401).send("Invalid password");
        }
      } else {
        res.status(404).send("User not found");
      }
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal server error");
    }
  });
  



app.listen(3000, function() {
    console.log("Server started on port 3000")
})