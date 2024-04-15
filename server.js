const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

mongoose.connect('mongodb://localhost:27017/blogDB');

const blogSchema = new mongoose.Schema({
    title: String,
    body: String,
    author: String,
    createdAt: { type: Date, default: Date.now }
});

const Blog = mongoose.model('Blog', blogSchema);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', async (req, res) => {
    try {
        const blogs = await Blog.find({});
        res.render('index', { blogs });
    } catch (err) {
        res.status(500).send('Error retrieving blog posts');
    }
});

app.get('/new', (req, res) => {
    res.render('post');
});

app.post('/postBlogs', async (req, res) => {
    const data = {
        title: req.body.title,
        body: req.body.body,
        author: req.body.author
    };
    try {
        const savedBlog = await Blog.create(data);
        res.redirect('/');
    } catch (err) {
        res.status(500).send('Error saving blog post');
    }
});

app.get('/edit/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const blog = await Blog.findById(id);
        if (!blog) {
            res.status(404).send('Blog post not found');
        } else {
            res.render('post', { blog });
        }
    } catch (err) {
        res.status(500).send('Error retrieving blog post');
    }
});

app.put('/updateBlog/:id', async (req, res) => {
    const id = req.params.id;
    const data = {
        title: req.body.title,
        body: req.body.body,
        author: req.body.author
    };
    try {
        const updatedBlog = await Blog.findByIdAndUpdate(id, data, { new: true });
        if (!updatedBlog) {
            res.status(404).send('Blog post not found');
        } else {
            res.redirect('/');
        }
    } catch (err) {
        res.status(500).send('Error updating blog post');
    }
});

app.delete('/delete/:id', async (req, res) => {
    const id = req.params.id;
    
    try {
        const deletedBlog = await Blog.findByIdAndDelete(id);
        if (!deletedBlog) {
            res.status(404).send('Blog post not found');
        } else {
            
            res.status(204).send();
        }
    } catch (err) {
        res.status(500).send('Error deleting blog post');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
