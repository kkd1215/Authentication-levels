require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const session  = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');



const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false
}))

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb://localhost:27017/userDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model('User', userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
///////////////////////////////////////////// Home Route //////////////////////////////////////////////////////////////////
app.route('/')
  .get((req, res) => {
    res.render('home');
  });

//////////////////////////////////////////// Secret Route ////////////////////////////////////////////////////////////////

app.route('/secrets')
  .get((req, res) => {
    if(req.isAuthenticated()) {
      res.render('secrets')
    }else {
      res.redirect('/login')
    }
  });

//////////////////////////////////////////// Register Route //////////////////////////////////////////////////////////////
app.route('/register')
  .get((req, res) => {
    res.render('register');
  })

  .post((req, res) => {
    User.register({username: req.body.username}, req.body.password, (err, user) => {
      if(err) {
        console.log(err);
        res.redirect('/register');
      }else {
        passport.autenticate('local')(req, res, () => {
          res.redirect('/secrets');
        });
      }
    });
  });
///////////////////////////////////////////// Login Route ////////////////////////////////////////////////////////////////
app.route('/login')
  .get((req, res) => {
    res.render('login');
  })

  .post((req, res) => {
    const user = new User({
      username:req.body.username,
      password:req.body.password
    });

    req.login(user, err => {
      if(err){
        console.log(err);
      }else {
        passport.autenticate('local')(req, res, () => {
          res.redirect('/secrets');
        });
      }
    });

  });

/////////////////////////////////////////// Logout Route //////////////////////////////////////////////////////////////////

app.route('/logout')
  .get((req, res) => {
    res.redirect('/');
  });

app.listen(3000, () => {
  console.log('Server Started at port 3000');
});
