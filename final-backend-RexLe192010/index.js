const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
const mongoose = require('mongoose');
const connectString = "mongodb+srv://rl105:lexinyi709@cluster0.tzb82.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(connectString);
const corsOptions = {
    origin: ['http://localhost:3000', 'https://articlehub.surge.sh'],
    // the real origin will be the surge url
    credentials: true,
};
app.set('trust proxy', 1);
app.use(cors(corsOptions));

app.use(session({
    secret: 'doNotGuessTheSecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 3600 * 1000, // 1 hour
        secure: true, // Use HTTPS
        sameSite: 'None', // allow cross-origin and cross-site requests
    }
}));

app.use((req, res, next) => {
    console.log('req.session', req.session);
    next();
});

app.use(passport.initialize());
app.use(passport.session());

// Middleware setup
app.use(bodyParser.json());
app.use(cookieParser());


// Import routes
const { router: authRoutes } = require('./src/auth');
const profileRoutes = require('./src/profile');
const articlesRoutes = require('./src/articles');
const followingRoutes = require('./src/following');

// register routes
app.use(authRoutes);
app.use(profileRoutes);
app.use(articlesRoutes);
app.use(followingRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.send({ message: 'Welcome to the API server' });
});


// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ error: 'Something went wrong!' });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

