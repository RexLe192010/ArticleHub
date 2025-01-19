const exprees = require('express');
const router = exprees.Router();
const { isLoggedIn } = require('./auth');
const User = require('./userSchema');
const mongoose = require('mongoose');
const connectString = "mongodb+srv://rl105:lexinyi709@cluster0.tzb82.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
mongoose.connect(connectString);
// const { users } = require('./auth');

async function getFollowing(req, res) {
    const username = req.params.user || req.username;
    console.log("username", username);

    try {
        const foundUser = await User.findOne({ username: username });

        if (!foundUser) {
            return res.status(404).send('User not found');
        }

        res.send({ username: username, following: foundUser.following });
    } catch (error) {
        res.status(500).send('Internal server error');
    }
}

async function addFollowing(req, res) {
    const username = req.params.user;
    const loggedInUser = req.username;

    if (!username) {
        return res.status(400).send('Missing user');
    }

    if (loggedInUser === username) {
        return res.status(400).send('Cannot follow yourself');
    }

    try {
        const currentUser = await User.findOne({ username: loggedInUser });
        const userToFollow = await User.findOne({ username: username });

        if (!currentUser) {
            return res.status(404).send('Logged in user not found');
        }

        if (!userToFollow) {
            return res.status(404).send('User to follow not found');
        }

        if (currentUser.following.includes(username)) {
            return res.status(400).send('User already followed');
        }

        // prepend the username to the following list
        currentUser.following = [username, ...currentUser.following];
        await currentUser.save();

        res.send({ username: loggedInUser, following: currentUser.following });
    } catch (error) {
        res.status(500).send('Internal server error');
    }

}

async function removeFollowing(req, res) {
    const username = req.params.user;
    const loggedInUser = req.username;

    if (!username) {
        return res.status(400).send('Missing user');
    }

    if (loggedInUser === username) {
        return res.status(400).send('Cannot unfollow yourself');
    }

    try {
        const foundUser = await User.findOne({ username: loggedInUser });

        if (!foundUser) {
            return res.status(404).send('User not logged in');
        }

        if (!foundUser.following.includes(username)) {
            return res.status(400).send('User not followed');
        }

        foundUser.following = foundUser.following.filter(followedUser => followedUser !== username);
        await foundUser.save();

        res.send({ username: loggedInUser, following: foundUser.following });
    } catch (error) {
        res.status(500).send('Internal server error');
    }
}

router.get('/following/:user?', isLoggedIn, getFollowing);
router.put('/following/:user', isLoggedIn, addFollowing);
router.delete('/following/:user', isLoggedIn, removeFollowing);

module.exports = router;