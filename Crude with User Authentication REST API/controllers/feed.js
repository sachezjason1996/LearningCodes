const {validationResult} = require('express-validator');

const Post = require('../models/post');
const User = require('../models/user');

module.exports.getPostAll = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
  const pageSize = parseInt(req.query.pageSize) || 10; // Default to 10 posts per page if not provided
  
  const skip = (page - 1) * pageSize;
  const limit = pageSize;

  try {
    const posts = await Post.find().skip(skip).limit(limit);
    if (posts.length === 0) {
      const error = new Error('No posts found');
      error.statusCode = 404;
      throw error;
    }

    const totalPosts = await Post.countDocuments();
    res.status(200).json({
      posts: posts,
      currentPage: page,
      pageSize: pageSize,
      totalPages: Math.ceil(totalPosts / pageSize),
      totalPosts: totalPosts
    });
  } catch (err) {
   
    next(err);
  }
}



// Export a function to create a new post
module.exports.createPost = (req, res, next) => {
 
    console.log('req.userId Check', req.userId); 
    // **Validation**: Check for validation errors in the request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // If there are errors, return a 422 status code with the error messages
      return res.status(422).json({ errors: errors.array() });
    }
    let imageUrl;
    if (req.file) {
      // If an image was uploaded, store its URL in the imageUrl variable
      imageUrl = `/uploads/${req.file.filename}`;
    } else {
      // If no image was uploaded, set imageUrl to null
      imageUrl = null;
    }

   const userId = req.userId;

  User.findById(userId)
    .then(user => {
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const post = new Post({
        title: req.body.title,
        content: req.body.content,
        image: imageUrl,
        creator: {
          _id: user._id,
          email: user.email,
          name: user.name
        }
      });

      return post.save();
    })
    .then(result => {
      res.status(201).json({
        message: 'Post created successfully',
        post: result,
        creator: { _id: result.creator._id, email: result.creator.email, name: result.creator.name }
      });
    })
    .catch(err => {
      next(err); // Pass the error to the next middleware function
    });

  };
module.exports.getPost = (req, res, next) => {
  const postId = req.params.id

  Post.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error('Post not found');
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({ post: post });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

module.exports.updatePost = (req, res, next) => {
  console.log('Check User Id in update Post', req.userId);
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    // Extract data from request body
    const postId = req.params.id;
    const title = req.body.title;
    const content = req.body.content;

    // Check if an image was uploaded
    let imageUrl;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`; // store the uploaded file's URL
    } else {
      imageUrl = req.body.image; // use the existing image URL if no new image was uploaded
    }

    // Find the post to update
    Post.findById(postId)
      .then(post => {
        if (!post) {
          return res.status(404).json({ message: 'Post not found' });
        }
      //  console.log('Post data:', post); // <--- Added console log statement

        if (post.creator._id.toString() !== req.userId) {
          return res.status(403).json({ message: 'Not authorized to update this post' });
        }

        // Update the post
        post.title = title;
        post.content = content;
        post.image = imageUrl;

        // Save the updated post
        post.save()
          .then(result => {
            res.status(200).json({
              message: 'Post updated successfully',
              post: result
            });
          })
          .catch(err => {
            next(err);
          });
      })
      .catch(err => {
        next(err);
      });
  } catch (error) {
    // Handle any other errors
    next(error);
  }

};

exports.deletePost = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId);

    console.log('Did I get the postId', postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    // Optional: Check if the user is authorized to delete the post
    if (post.creator._id.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await Post.findByIdAndDelete(postId);

    const user = await User.findById(req.userId);
    user.posts.pull(postId);
    await user.save();

    res.status(200).json({ message: 'Post deleted!' });
  } catch (err) {
    next(err); // Pass the error to the next middleware function
  }
};