const { json } = require("body-parser");
const exprees = require("express");
const router = exprees.Router();
const { isLoggedIn } = require("./auth");
const User = require("./userSchema");
const Article = require("./articleSchema");
const mongoose = require('mongoose');
const connectString = "mongodb+srv://rl105:lexinyi709@cluster0.tzb82.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
mongoose.connect(connectString);


async function getArticles(req, res) {
    const { id } = req.params;
    // the page number is specified in the query string by the user; if not specified, default to 0
    const page = req.query.page || 0;
    // the number of articles per page is fixed to 10
    const pageSize = 10;
    console.log("getArticles: ", id);

    try {
        if (id && !isNaN(parseInt(id))) {
            // if id is provided, fetch the article by id
            console.log("id is provided, fetch the article by id", id);
            const articleId = parseInt(id);
            const article = await Article.findOne({ pid: articleId });
            if (!article) {
                // if article is not found, return 404
                return res.status(404).send('Article not found');
            }
            console.log("article with id: ", id, article);
            return res.send({ articles: [article] });
        }

        if (id && isNaN(parseInt(id))) {
            // if id is not a number, fetch the articles by authorname
            console.log("id is not a number, fetch the articles by authorname", id);
            const authorname = id;
            console.log(authorname);
            const authorArticles = await Article.find({ author: authorname });
            console.log(id + "'s articles:" + authorArticles);
            return res.send({ articles: authorArticles });
        }

        // if no id is provided, fetch all articles for the logged-in user
        // need to check if the user is logged in
        const loggedInUsername = req.username;
        const loggedInUser = await User.findOne({ username: loggedInUsername });
        console.log("no id provided, fetch article for loggedInUser: ", loggedInUser);

        if (!loggedInUser) {
            return res.status(403).send('Forbidden user');
        }

        // extract all the feed users
        const feedUsers = [loggedInUsername, ...loggedInUser.following];
        console.log("feedUsers: ", feedUsers);

        // fetch all the articles for the feed users, sorted by the date from the newest to the oldest
        // limit the number of articles to the pageSize, which is 10 by default
        const feedArticles = await Article.find({ author: { $in: feedUsers } }).sort({ date: -1 }).limit(pageSize).skip(page * pageSize);
        console.log("feedArticles: ", feedArticles);
        return res.send({ articles: feedArticles });
    } catch (err) {
        res.status(500).send('Internal server error');
    }
}

async function updateArticle(req, res) {
    const { id: articleId } = req.params;
    console.log("req.params: ", req.params);
    console.log("updateArticle: ", articleId);
    try {
        const article = await Article.findOne({ pid: articleId });
        if (!article) {
            return res.status(404).send('Article not found');
        }

        const { commentId, text } = req.body;
        const loggedInUser = req.username;
        console.log(text, commentId, loggedInUser);

        if (!commentId && article.author !== loggedInUser) {
            // if no commentId is provided, only the author can update the article
            return res.status(403).send('Forbidden user');
        }

        if (commentId !== undefined) {
            // if commentId is provided, update the comment
            if (commentId === -1) {
                // if commentId is -1, add a new comment to the current article
                const newComment = {
                    id: article.comments.length + 1,
                    author: loggedInUser,
                    text,
                };
                article.comments.push(newComment);
                await article.save();
            } else {
                // if commentId is a valid number, update the comment with the provided commentId
                const comment = article.comments.find((comment) => comment.id === commentId);
                if (!comment) {
                    return res.status(404).send('Comment not found');
                }
                if (comment.author !== loggedInUser) {
                    return res.status(403).send('Forbidden user');
                }
                if (text) { // update text if provided
                    comment.text = text;
                }
                await article.save();
            }
        } else if (text) {
            // if no commentId is provided, update the article text
            console.log("update article text");
            article.text = text;
            await article.save();
        }
        // return the updated article
        return res.send({ articles: [article] });
    } catch (err) {
        res.status(500).send('Internal server error');
    }
}

async function createArticle(req, res) {
    const { text, image } = req.body;
    const loggedInUser = req.username;

    // check if the text is missing, image is optional
    if (!text) {
        return res.status(400).send('Missing text');
    }

    try {
        const newArticle = new Article({
            pid: await Article.countDocuments() + 1,
            author: loggedInUser,
            text,
            date: new Date().getTime(),
            comments: [],
        });

        await newArticle.save();
        res.send({ articles: [newArticle] });
    } catch (err) {
        res.status(500).send('Internal server error');
    }
}

router.get('/articles/:id?', isLoggedIn, getArticles);
router.put('/articles/:id', isLoggedIn, updateArticle);
router.post('/article', isLoggedIn, createArticle);

module.exports = router;