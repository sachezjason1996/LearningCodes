const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/'); // upload folder
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  fields: [
    {
      name: 'title',
      maxCount: 1,
    },
    {
      name: 'content',
      maxCount: 1,
    },
    {
      name: 'image',
      maxCount: 1,
    },
  ],
});

module.exports = upload;