const express = require('express');
const app = express();
const dotenv = require('dotenv').config();
const bodyParser = require('body-parser');
const session = require('express-session');
const dbConnect = require('./config/dbConnect')
const logger = require('morgan');
const nocache = require('nocache');
const path = require('path');
const mongodbSession=require('connect-mongodb-session')(session)
const store= new mongodbSession({
    uri:"mongodb://127.0.0.1:27017/homeDecorDB",
    collection:"SessionDB",
})

// Set routes
const userRouter = require('./routes/userRouter');
const adminRouter = require('./routes/adminRouter');

const { err404handle, errorHandler } = require('./middleware/errorHandler');

// Setting port
const PORT = process.env.PORT || 5000;

// Database 
dbConnect();

// Set view engine
app.set("view engine", "ejs");
app.set('views', ['views','views/partials','views/users','views/admin']);

// Load static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(logger('dev'));

// Parse application
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// User session middleware configuration
const userSessionConfig = {
    secret: 'user-secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        path: '/',
        maxAge: 6000000,
        httpOnly: true,
    },
    store: store
};

// Admin session middleware configuration
const adminSessionConfig = {
    secret: 'admin-secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        path: '/admin',
        maxAge: 6000000,
        httpOnly: true,
    },
    store:store
};

// Custom middleware to conditionally apply session based on path
const sessionMiddleware = (req, res, next) => {
    if (req.path.startsWith('/admin')) {
        session(adminSessionConfig)(req, res, next);
    } else {
        session(userSessionConfig)(req, res, next);
    }
};

app.use(nocache());

// Apply session middleware
app.use(sessionMiddleware);

// Apply user session middleware for user routes
app.use('/', userRouter);

// Apply admin session middleware for admin routes
app.use('/admin', adminRouter);

app.use(err404handle);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`server is running at http://localhost:${PORT}`);
});
