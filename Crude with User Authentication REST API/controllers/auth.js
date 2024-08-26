// const {validationResult} = require('express-validator');
const bcrypt = require('bcryptjs');
 const jwt = require('jsonwebtoken');

const User = require('../models/user');
const {validationResult} = require('express-validator');

module.exports.signup = (req, res, next) => {
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;

    bcrypt
        .hash(password, 12)
        .then(hashedPassword => {
            const user = new User({
                email: email,
                name: name,
                password: hashedPassword
            });
            return user.save();
        })
        .then(result => {
            res
                .status(201)
                .json({
                    message: 'User created',
                    userId: result._id
                });
        })
        .catch(err => {
            next(err);
          });
};

module.exports.login = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
  
    const email = req.body.email;
    const password = req.body.password;
    let loadedUser;
    User.findOne({ email: email })
      .then(user => {
        if (!user) {
          return res.status(401).json({ error: 'A user with this email was not found' });
        }
        loadedUser = user;
        return bcrypt.compare(password, user.password);
      })
      .then(result => {
        if (!result) {
          return res.status(401).json({ error: 'Wrong password' });
        }
          const token = jwt.sign(
                { email: loadedUser.email, userId: loadedUser._id.toString() },
                'somesupersecretsecret',
                { expiresIn: '1h' }
            );
            
        // If we reach here, the password is correct
        return res.status(200).json({ 
            message: 'Login successful', 
            userId: loadedUser._id.toString(), 
            token: token 
          });
      })
      .catch(err => {
        next(err);
      });
  };

// module.exports.getUserStatus = (req, res, next) => {
//     User
//         .findById(req.userId)
//         .then(user => {
//             if(!user) {
//                 const error = new Error('User not found');
//                 error.statusCode = 404;
//                 throw error;
//             }

//             res
//                 .status(200)
//                 .json({ status: user.status });
//         })
//         .catch(err => {
//             err.statusCode = err.statusCode || 500;
//             next(err);
//         })
// };

// module.exports.updateUserStatus = (req, res, next) => {
//     const newStatus = req.body.status;

//     User
//         .findById(req.userId)
//         .then(user => {
//             if(!user) {
//                 const error = new Error('User not found');
//                 error.statusCode = 404;
//                 throw error;
//             }

//             user.status = newStatus;
//             return user.save();
//         })
//         .then(result => {
//             res
//                 .status(201)
//                 .json({ message: 'User status updated.' });
//         })
//         .catch(error => {
//             error.statusCode = error.statusCode || 500;
//             next(error);
//         })
// };
