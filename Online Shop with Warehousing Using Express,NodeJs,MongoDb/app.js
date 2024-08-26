const path = require("path");
const express = require("express");
const flash = require('connect-flash');
const bodyParser = require("body-parser");
const session = require("express-session");
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const mongoose = require('mongoose');
const multer = require('multer');
const crypto = require('crypto');

const dbURI = 'mongodb+srv://kinoha321:gonzoldik123@cluster0.afz9hau.mongodb.net/shop?';
const app = express();

// Initialize MongoDB session store
const store = new MongoDBStore({
  uri: dbURI,
  collection: 'sessions'
});

// Initialize CSRF protection middleware
const csrfProtection = csrf();

const fileStorage = multer.diskStorage({
  destination: (req, file, callback) => {
      callback(null, 'uploads');
  },
  filename: (req, file, callback) => {
      crypto.randomBytes(20, (err, buffer) => {
          const name = Date.now() + buffer.toString('hex') + '.' + file.originalname.split('.').reverse()[0];
          callback(null, name);
      });
  }
});

const fileFilter = (req, file, callback) => {
  const fileTypes = ['image/png', 'image/jpg', 'image/jpeg'];
  if(fileTypes.includes(file.mimetype)) {
      callback(null, true);
  } else {
      callback(null, false);
  }
};

// Set view engine and views directory
app.set("view engine", "ejs");
app.set("views", "views");

// Import routes and controllers
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");
const errorsController = require("./controllers/errors");

// Import User model
const User = require('./models/user');

// Middleware to parse the body of incoming requests
app.use(bodyParser.urlencoded({ extended: false }));
// Middleware to serve static files from the "public" directory
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'));

app.use(express.static(path.join(__dirname, "public"))); // This is path for CSS
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Session middleware configuration
app.use(session({
  secret: 'my secret',
  resave: false,
  saveUninitialized: false,
  store: store
}));

// CSRF protection middleware
app.use(csrfProtection);

// Flash messages middleware
app.use(flash());

// Middleware to set local variables used in views
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken(); // Set CSRF token
  res.locals.isAuthenticated = req.session.isLoggedIn; // Set authentication status
  console.log('CSRF Token (stored in session):', res.locals.csrfToken); // Log CSRF token stored in session
  next();
});


// Middleware to attach user object to request if user is logged in
app.use((req, res, next) => {
  if (!req.session.user) {
    return next(); // No user in session, proceed without setting req.user
  }
  User.findById(req.session.user._id)
    .then(user => {
      if (!user) {
        return next(); // No user found in database, proceed without setting req.user
      }
      req.user = user; // Set req.user if found
      next();
    })
    .catch(err => {
      console.error('Error fetching user:', err);
      next(err); // Pass error to next middleware
    });
});

// Define routes
app.use("/admin", adminRoutes); // Routes for admin.js
app.use(shopRoutes);
app.use(authRoutes);

// 404 error handler
app.use(errorsController.get404);

// Database connection without default user creation
mongoose.connect(dbURI, {

})
  .then(result => {
    app.listen(3000, () => {
      console.log('Connected to the database and server is running on port 3000');
    });
  })
  .catch(error => {
    console.error('Database connection error:', error);
  });
