//const cookies = require('../util/cookie');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const {validationResult} = require('express-validator');


module.exports.getLogin = (req, res, next) => {
    let message = req.flash('error');
    if(message.length <= 0) message = null;
    res.render('auth/login', {
        pageTitle: 'Login',
        path: '/login',
        errorMessage: message
    });
};
module.exports.getSignup = (req, res, next) => {
    res.render('auth/signup', {
        pageTitle: 'SignUp',
        path: '/signup',
        isAuthenticated: false
    
    });
};

module.exports.postSignup = (req, res, next) => {
    console.log('Sign-up route has been called'); // Log when the route is accessed
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    const errors = validationResult(req);
    

    // Basic input validation
    if (password !== confirmPassword) {
        console.log('Passwords do not match');
        return res.redirect('/signup'); // Redirect if passwords do not match
    }

    // Check if user already exists
    User.findOne({ email: email })
        .then((userDoc) => {
            if (userDoc) {
                console.log('User already exists');
                return res.redirect('/signup'); // User exists, redirect to signup page
            }

            // Hash the password before saving the user
            return bcrypt.hash(password, 12);
        })
        .then((hashedPassword) => {
            // Create a new user with the hashed password
            const user = new User({
                email: email,
                password: hashedPassword, // Save the hashed password
                cart: { items: [] },
            });

            // Save user to the database
            return user.save();
        })
        .then((result) => {
            console.log('User created successfully');
            res.redirect('/login'); // Redirect to login page after successful signup
        })
        .catch((err) => {
            console.log(err); // Log any errors
            res.redirect('/signup'); // Redirect to signup page on error
        });
};

module.exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    // Find the user by email
    User.findOne({ email: email })
        .then(user => {
            if (!user) {
                // No user found with the provided email
                req.flash('error', 'Invalid email or password');
                return res.redirect('/login');
            }

            // Compare passwords
            bcrypt.compare(password, user.password)
                .then(matched => {
                    if (matched) {
                        // If password matches, set session variables
                        req.session.user = user;
                        req.session.isLoggedIn = true;
                        req.session.save(err => {
                            if (err) {
                                console.log(err);
                            }
                            // Set userId in res.locals for easy access
                            res.locals.userId = user._id;

                            // Redirect to home page after successful login
                            res.redirect('/');
                        });
                    } else {
                        // Password doesn't match
                        req.flash('error', 'Password did not match');
                        res.redirect('/login');
                    }
                })
                .catch(err => {
                    console.log(err);
                    req.flash('error', 'Sorry, there was some problem...');
                    res.redirect('/login');
                });
        })
        .catch(err => console.log(err));
};


module.exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        if(err) console.log(err);
        res.redirect('/');
    });
}
