const express = require('express');

const bodyParser = require('body-parser');

const feedRoutes = require('./routes/feed');

const mongoose = require('mongoose');


const authRoutes = require('./routes/user');



const app = express();
const dbURI = 'mongodb+srv://kinoha321:gonzoldik123@cluster0.afz9hau.mongodb.net/store?';




app.use(bodyParser.json()); // parse JSON requests
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.get('/', (req, res) => {
  res.send('Welcome to my API!');
});



app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Database connection without default user creation
mongoose.connect(dbURI, {

})
  .then(result => {
    app.listen(8080, () => {
      console.log('Connected to the database and server is running on port 8080');
    });
  })
  .catch(error => {
    console.error('Database connection error:', error);
  });