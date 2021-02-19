const express = require('express')
const mongoose = require('mongoose')
const ShortUrl = require('./models/shortUrl')
const passport = require("passport")
const bodyParser = require("body-parser")
const LocalStrategy = require("passport-local")
const passportLocalMongoose =  require("passport-local-mongoose") 
const User = require("./models/user")
const app = express()

mongoose.set('useNewUrlParser', true); 
mongoose.set('useFindAndModify', false); 
mongoose.set('useCreateIndex', true); 
mongoose.set('useUnifiedTopology', true); 
mongoose.connect('mongodb://localhost:27017/testdb').then(console.log("DB connected"))

app.use(express.static(__dirname + '/public'));
app.set('view engine',  'ejs')

app.use(express.urlencoded({ extended: false }))
app.use(bodyParser.urlencoded({ extended: true })); 
  
app.use(require("express-session")({ 
    secret: "guvi", 
    resave: false, 
    saveUninitialized: false
}))

passport.use(new LocalStrategy(User.authenticate())); 
passport.serializeUser(User.serializeUser()); 
passport.deserializeUser(User.deserializeUser()); 


app.use(passport.initialize())
app.use(passport.session())
// app.get('/', async(req, res)=>{
//   const shortUrls = await ShortUrl.find()
//   res.render('index', { shortUrls: shortUrls})
// })

// Showing home page 
app.get("/", function (req, res) { 
  res.render("login"); 
}); 

// Showing secret page 
app.get("/userprofile", isLoggedIn, async (req, res) => { 
  const shortUrls = await ShortUrl.find()
  res.render("index", { shortUrls: shortUrls}); 
}); 

//Auth Routes
app.get("/login",(req,res)=>{
    res.render("login");
});

//Handling user login 
app.post("/login",passport.authenticate("local",{
  successRedirect:"/userprofile",
  failureRedirect:"/login"
}),function (req, res){
});

app.get("/register-signin",(req,res)=>{
    res.render("register");
});

app.post("/register",(req,res)=>{
    
  User.register(new User({username: req.body.username,phone:req.body.phone,telephone: req.body.telephone}),req.body.password,function(err,user){
      if(err){
          console.log(err);
          res.render("register");
      }
  passport.authenticate("local")(req,res,() =>{
      res.redirect("/login");
  })    
  })
})

//Handling user logout  
app.get("/logout",(req,res)=>{
  req.logout();
  res.redirect("/");
});

function isLoggedIn(req,res,next) {
  if(req.isAuthenticated()){
      return next();
  }
  res.redirect("/login");
}

//url post
app.post('/shortUrls', async(req, res) => {
 await ShortUrl.create({full: req.body.fullUrl })
 res.redirect('/userprofile')
})

app.get('/:shortUrl', async (req,res) => {
  const shortUrl = await ShortUrl.findOne({short: req.params.shortUrl })
  if(shortUrl == null) return res.sendStatus(404)

  shortUrl.click++
  shortUrl.save()

  res.redirect(shortUrl.full)
})

app.listen(process.env.PORT || 80);