const exprees = require('express');
const router = exprees.Router();
const { isLoggedIn } = require('./auth');
// the middleware to upload image, which comes from uploadCloudinary.js
const uploadImage = require('./uploadCloudinary');
const Profile = require('./profileSchema');
const mongoose = require('mongoose');
const connectString = "mongodb+srv://rl105:lexinyi709@cluster0.tzb82.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
mongoose.connect(connectString);

async function getHeadline(req, res) {
    const username = req.params.user || req.username;
    console.log("username", username);

    try {
        const foundUser = await Profile.findOne({ username: username });

        if (!foundUser) {
            return res.status(404).send('User not found');
        }

        res.send({ username: username, headline: foundUser.headline });
    } catch (error) {
        res.status(500).send('Internal server error');
    }
}

async function updateHeadline(req, res) {
    const headline = req.body.headline;
    const username = req.username;
    console.log("headline", headline);
    console.log("username", username);

    if (!headline) {
        return res.status(400).send('Missing headline');
    }

    // find the logged in user
    try {
        const foundUser = await Profile.findOne({ username: username });

        if (!foundUser) {
            return res.status(404).send('User not logged in');
        }

        foundUser.headline = headline;
        await foundUser.save();

        res.send({ username: username, headline: headline });
    } catch (error) {
        res.status(500).send('Internal server error');
    }
}

async function getEmail(req, res) {
    const username = req.params.user || req.username;

    try {
        const foundUser = await Profile.findOne({ username: username });

        if (!foundUser) {
            return res.status(404).send('User not found');
        }

        res.send({ username: username, email: foundUser.email });
    } catch (error) {
        res.status(500).send('Internal server error');
    }
}

async function updateEmail(req, res) {
    const email = req.body.email;
    const username = req.username;

    if (!email) {
        console.log("Missing email");
        return res.status(400).send('Missing email');
    }

    // validate the email
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) {
        console.log("Invalid email format");
        return res.status(400).send('Invalid email format');
    }

    try {
        const foundUser = await Profile.findOne({ username: username });

        if (!foundUser) {
            console.log("User not logged in");
            return res.status(404).send('User not logged in');
        }

        foundUser.email = email;
        await foundUser.save();

        res.send({ username: username, email: email });
    } catch (error) {
        res.status(500).send('Internal server error');
    }
}

async function getDob(req, res) {
    const username = req.params.user || req.username;

    try {
        const user = await Profile.findOne({ username: username });

        if (!user) {
            return res.status(404).send('User not found');
        }

        // return the date of birth in milliseconds
        res.send({ username: username, dob: user.dob });
    } catch (error) {
        res.status(500).send('Internal server error');
    }
}

async function getZipcode(req, res) {
    const username = req.params.user || req.username;

    try {
        const user = await Profile.findOne({ username: username });

        if (!user) {
            return res.status(404).send('User not found');
        }

        res.send({ username: username, zipcode: user.zipcode });
    } catch (error) {
        res.status(500).send('Internal server error');
    }
}

async function updateZipcode(req, res) {
    const zipcode = req.body.zipcode;
    const username = req.username;

    if (!zipcode) {
        return res.status(400).send('Missing zipcode');
    }

    // validate the zipcode
    const regex = /^\d{5}$/;
    if (!regex.test(zipcode)) {
        return res.status(400).send('Invalid zipcode format');
    }

    try {
        const foundUser = await Profile.findOne({ username: username });

        if (!foundUser) {
            return res.status(404).send('User not logged in');
        }

        foundUser.zipcode = zipcode;
        await foundUser.save();

        res.send({ username: username, zipcode: zipcode });
    } catch (error) {
        res.status(500).send('Internal server error');
    }
}

async function getPhone(req, res) {
    // the username for the requested user or the logged in user
    const username = req.params.user || req.username;

    try {
        const user = await Profile.findOne({ username: username });

        if (!user) {
            return res.status(404).send('User not found');
        }

        res.send({ username: username, phone: user.phone });
    } catch (error) {
        res.status(500).send('Internal server error');
    }
}

async function updatePhone(req, res) {
    const phone = req.body.phone;
    const username = req.username; // the username of the logged in user

    if (!phone) {
        return res.status(400).send('Missing phone');
    }

    // validate the phone number
    const regex = /^\d{3}-\d{3}-\d{4}$/;
    if (!regex.test(phone)) {
        return res.status(400).send('Invalid phone format');
    }

    // find the logged in user
    try {
        const foundUser = await Profile.findOne({ username: username });

        if (!foundUser) {
            return res.status(404).send('User not logged in');
        }

        foundUser.phone = phone;
        await foundUser.save();

        res.send({ username: username, phone: phone });
    } catch (error) {
        res.status(500).send('Internal server error');
    }
}

async function getAvatar(req, res) {
    const username = req.params.user || req.username;

    // find the user
    try {
        const user = await Profile.findOne({ username: username });

        if (!user) {
            return res.status(404).send('User not found');
        }

        res.send({ username: username, avatar: user.avatar });
    } catch (error) {
        res.status(500).send('Internal server error');
    }
}

async function updateAvatar(req, res) {
    const username = req.username;
    console.log("username", username);

    try {
        if (!req.fileurl) {
            return res.status(400).send('Missing avatar');
        }

        // find the user
        const foundUser = await Profile.findOne({ username: username });

        if (!foundUser) {
            return res.status(404).send('User not logged in');
        }

        // update the avatar
        foundUser.avatar = req.fileurl;
        await foundUser.save();

        res.send({ username: username, avatar: req.fileurl });
    } catch (error) {
        res.status(500).send('Internal server error');
    }
}

router.get('/headline/:user?', isLoggedIn, getHeadline);
router.put('/headline', isLoggedIn, updateHeadline);
router.get('/email/:user?', isLoggedIn, getEmail);
router.put('/email', isLoggedIn, updateEmail);
router.get('/dob/:user?', isLoggedIn, getDob);
router.get('/zipcode/:user?', isLoggedIn, getZipcode);
router.put('/zipcode', isLoggedIn, updateZipcode);
router.get('/phone/:user?', isLoggedIn, getPhone);
router.put('/phone', isLoggedIn, updatePhone);
router.get('/avatar/:user?', isLoggedIn, getAvatar);
router.put('/avatar', isLoggedIn, uploadImage('avatar'), updateAvatar);

module.exports = router;
