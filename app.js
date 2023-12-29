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
// app.use(logger('dev'));

// Parse application
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(nocache());

app.use(session({ secret: 'secret', cookie: { maxAge: 6000000 }, resave: false, saveUninitialized: true }));

// Apply user session middleware for user routes
app.use('/', userRouter);

// Apply admin session middleware for admin routes
app.use('/admin', adminRouter);

app.use(err404handle);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`server is running at http://localhost:${PORT}`);
});
