const express = require('express');
const router = express.Router();

const blogController = require('../controllers/blogController');
const { verifyToken } = require('../middleware/verifyToken');

router.post('/add', verifyToken, blogController.addBlog);
router.get('/', verifyToken, blogController.getAllBlogs);
router.put('/edit/:id', verifyToken, blogController.editBlog);
router.delete('/delete/:id', verifyToken, blogController.deleteBlog);
router.get('/:id', verifyToken, blogController.getBlogById);

module.exports = router;