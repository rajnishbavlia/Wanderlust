const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user");

// signup form
router.get("/signup", (req, res) => {
  res.render("users/signup");
});

// signup logic
router.post('/signup', async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const user = new User({ username, email });
    const registeredUser = await User.register(user, password);

    req.login(registeredUser, err => {
      if (err) return next(err);
      req.flash('success', 'Welcome to Wanderlust! Your account is created.');
      res.redirect('/listings');
    });
  } catch (e) {
    req.flash('error', e.message);
    res.redirect('/users/signup');
  }
});

// login form
router.get("/login", (req, res) => {
  res.render("users/login");
});

// login logic
router.post(
  "/login",
  passport.authenticate('local', {
    failureRedirect: '/users/login',
    failureFlash: true,
  }),
  (req, res) => {
    req.flash("success", "You have successfully logged in!");
    res.redirect("/listings");
  }
);

// logout
router.get('/logout', (req, res, next) => {
  req.logout(function(err) {
    if (err) return next(err);
    req.flash('success', 'You have logged out successfully!');
    res.redirect('/listings');
  });
});67333


module.exports = router;
