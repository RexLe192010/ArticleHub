const mongoose = require('mongoose');

// const commentSchema = new mongoose.Schema({
//     id: Number,
//     author: String,
//     text: String,
// });

const articleSchema = new mongoose.Schema({
    pid: { type: Number, required: true },
    author: { type: String, required: true },
    text: { type: String, required: true },
    date: { type: Number, required: true },
    comments: [{
        id: { type: Number, required: true },  // Unique ID for each comment
        author: { type: String, required: true },  // Author of the comment
        text: { type: String, required: true },  // Text content of the comment
    }],
});

const Article = mongoose.model('Article', articleSchema);

module.exports = Article;
