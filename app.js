require('dotenv').config();
const SECRET_KEY = process.env.SECRET_KEY;
// Using environment variables ^ 
const express = require("express")
const bodyParser = require("body-parser")
const ejs = require("ejs")
const mongoose = require("mongoose")
const app = express()

// Including field encryption
const Schema = mongoose.Schema;
const mongooseFieldEncryption = require("mongoose-field-encryption").fieldEncryption;
// Including field encryption

app.use(express.static("public"))
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: true }))

mongoose.connect(process.env.CONNECT)

const userSchema = new Schema({
    email: String,
    password: String
})

userSchema.plugin(mongooseFieldEncryption, { 
  fields: ["password"], 
  secret: SECRET_KEY,
  saltGenerator: function (secret) {
    return "1234567890123456"; 
    // should ideally use the secret to return a string of length 16, 
    // default = `const defaultSaltGenerator = secret => crypto.randomBytes(16);`, 
    // see options for more details
  },
});

const User = mongoose.model("User", userSchema)






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
      password: req.body.password
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
        if (foundUser.password === password) {
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