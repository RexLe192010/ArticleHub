const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const User = require('./userSchema');
const Profile = require('./profileSchema');
const mongoose = require('mongoose');
const connectString = "mongodb+srv://rl105:lexinyi709@cluster0.tzb82.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
mongoose.connect(connectString);

// const sessionUser = {};
// const cookieKey = 'sid';
// the url to the backend server for the callback
const frontendUrl = 'https://articlehub.surge.sh'; // the frontend url
const backendUrl = 'https://articlehub-4d0595467f43.herokuapp.com'; // the backend url

// the function to check if the user is logged in
function isLoggedIn(req, res, next) {

    //  the above are original version, the version below is using express-session
    if (!req.session) {
        return res.status(401).send('No session');
    }

    // check if the user is logged in
    if (!req.session.user) {
        return res.status(401).send('no user information in the session');
    }

    // check if the username is in the session
    if (!req.session.user.username) {
        return res.status(401).send('no username in the session');
    }

    // add the username to the request
    req.username = req.session.user.username;

    next();
}

async function register(req, res) {
    const { username, password, email, dob, phone, zipcode } = req.body;

    // Validate required fields
    if (!username || !password || !email || !dob || !phone || !zipcode) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if the username already exists
    // if (users[username]) {
    //     return res.status(400).json({ error: 'User already exists' });
    // }

    try {
        const saltRounds = 10;

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create a new user
        const newUser = new User({ username: username, hashedPassword: hashedPassword, email: email });
        // make sure that the date of birth is stored as a number representing the milliseconds since the Unix epoch
        const newProfile = new Profile({ username: username, email: email, dob: new Date(dob).getTime(), phone: phone, zipcode: zipcode });
        await newUser.save();
        await newProfile.save();

        console.log(`User registered: ${username}`);
        res.status(201).json({ result: 'success', username: username });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ error: 'User already exists' });
        }
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}


async function login(req, res) {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Missing username or password' });
    }

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        const isValidPassword = await bcrypt.compare(password, user.hashedPassword);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        // the above is the original version, the version below is using express-session
        req.session.user = { username: username }; // add the username to the session
        console.log('current session', req.session);

        console.log(`User logged in: ${username}`);
        res.json({ username: username, result: 'success' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

function logout(req, res) {

    req.session.destroy((err) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal server error');
        } else {
            res.clearCookie('connect.sid');
            res.send({ result: 'Logged out' });
            console.log('User logged out', req.username);
        }
    });
}

async function resetPassword(req, res) {
    const { password } = req.body;
    const loggedInUser = req.username;

    if (!password) {
        return res.status(400).json({ error: 'Missing password' });
    }

    try {
        const user = await User.findOne({ username: loggedInUser });
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        // hash the new password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        user.hashedPassword = hashedPassword;
        await user.save();

        console.log(`Password reset for user: ${loggedInUser}`);
        res.send({ username: loggedInUser, result: 'success' });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
}

// passport setup
passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

// implement the Google strategy
passport.use(new GoogleStrategy({
    // the parameters are provided by Google API
    // Important: remember to add ID and Secret to environment variables!
    callbackURL: backendUrl + '/auth/google/callback',
},
    function (accessToken, refreshToken, profile, done) {
        let user = {
            'email': profile.emails[0].value,
            'name': profile.name.givenName + ' ' + profile.name.familyName,
            'id': profile.id,
            'token': accessToken,
            'avatar': profile.photos[0].value
        };
        // You can perform any necessary actions with your user at this point,
        // e.g. internal verification against a users table,
        // creating new user entries, etc.

        return done(null, user);
    }
));

async function loginWithGoogle(req, res) {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get the user information from the Google profile
    const googleUser = req.user;
    let username = googleUser.name;
    const email = googleUser.email;

    try {
        // check if the email is already registered
        let existingUser = await User.findOne({ email });

        if (existingUser) {
            // the email is already registered, TODO: think about the logic here
            if (!existingUser.auth) {
                existingUser.auth = true;
                await existingUser.save();
            }

            // set the session
            req.session.user = { username: existingUser.username };
            console.log(`User logged in with Google: ${existingUser.username}`);
            return res.redirect(frontendUrl + '/#/Main?username=' + encodeURIComponent(existingUser.username));
        } else {
            // if email is not registered, it is a new user
            let usernameExists = await User.findOne({ username });
            if (usernameExists) {
                // give a random name ot avoid conflict
                username = `${username}_${Math.floor(Math.random() * 1000)}`;
            }

            // crete a new user
            const newUser = new User({
                username,
                hashedPassword: '', // for Google login, no password is needed
                email,
                following: [],
                auth: true, // set the auth flag to true
            });
            await newUser.save();

            // create profile for the new user
            const newProfile = new Profile({
                username,
                email,
                dob: new Date().getTime(), // default date of birth, which is a number representing the milliseconds since the Unix epoch
                phone: '000-000-0000', // default phone number
                zipcode: '00000', // default zipcode
                avatar: googleUser.avatar,
            });
            await newProfile.save();

            // set the session
            req.session.user = { username };
            console.log(`New user created with Google login: ${username}`);

            return res.redirect(frontendUrl + '/#/Main?username=' + encodeURIComponent(username));
        }
    } catch (err) {
        console.error('Error in loginWithGoogle:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

router.post('/register', register);
router.post('/login', login);
router.put('/logout', isLoggedIn, logout);
router.put('/password', isLoggedIn, resetPassword);
router.get('/auth/google', passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login', 'email'] }));
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), loginWithGoogle);
router.get('/loginWithGoogle', loginWithGoogle);


module.exports = { router, isLoggedIn };