require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const listingRoutes = require('./routes/listing');
const reviewRoutes = require('./routes/review');
const userRoutes = require('./routes/user');
const ExpressError = require('./utils/ExpressError');
const Listing = require('./models/listing');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

const sessionOptions = {
  secret: "wanderlust",
  resave: false,
  saveUninitialized: true,    
};
app.use(require('express-session')(sessionOptions));
app.use(require('connect-flash')());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser()); 

const MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/wanderlust';

(async function connectDB(){
  try{
    await mongoose.connect(MONGO_URL);
    console.log('Mongo connected');
  } catch(err){
    console.error('Mongo connection error:', err);
    process.exit(1);
  }
})();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, 'public')));

// Simple locals middleware (no auth yet)
// expose current user and flash messages to all views
app.use((req, res, next) => {
  res.locals.currentUser = req.user || null;
  res.locals.success = req.flash ? req.flash('success') : null;
  res.locals.error = req.flash ? req.flash('error') : null;
  next();
});

// app.get("/demouser", async (req, res) => {
//   let fakeuser = new User({ 
//     email: "student@gmail.com",
//     username: "student" 
//   });
//   const newUser = await User.register(fakeuser, "password");
//   res.send(newUser);
// });


app.get('/', (req, res) => res.send('Hi, I am root'));

// mount routers
app.use('/listings', listingRoutes);
app.use('/listings/:id/reviews', reviewRoutes);
app.use('/users', userRoutes);

// dev-only debug route
if(process.env.NODE_ENV !== 'production'){
  app.get('/debug/listing', async (req, res, next) => {
    try{
      const listing = await Listing.findOne({});
      if(!listing) return res.status(404).json({ error: 'No listing found' });
      res.json(listing.toObject());
    } catch(err){ next(err); }
  });
}

// catch-all
app.use((req, res, next) => next(new ExpressError(404, 'Page Not Found')));

app.use((err, req, res, next) => {
  const { statusCode = 500, message = 'Something went wrong!' } = err;
  res.status(statusCode).render('error.ejs', { message: message || 'Something went wrong!' });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));