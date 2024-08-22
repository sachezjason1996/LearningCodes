const { body } = require('express-validator');
const User = require('../models/user');

module.exports.signup = [
    body('email')
      .trim()
      .isEmail()
      .normalizeEmail()
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            throw new Error('Email already exists');
          }
          return true; // or return Promise.resolve(true);
        });
      }),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long'),
    body('name')
      .trim()
      .not()
      .isEmpty()
      .withMessage('Name is required'),
  ];
  module.exports.login = [
    body('email')
        .trim()
        .isEmail()
        .normalizeEmail(),
    body('password')
        .isLength({ min: 8 })
];