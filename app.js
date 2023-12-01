const express = require('express');
const app = express();
const dotenv = require('dotenv').config();
const bodyParser = require('body-parser');
const session = require('express-session');
const dbConnect = require('./config/dbConnect')
const logger = require('morgan');
const nocache = require('nocache');
const path = require('path');

//set routes
const userRouter = require('./routes/userRouter');
const adminRouter = require('./routes/adminRouter');

const { err404handle, errorHandler } = require('./middleware/errorHandler');

//setting port
const PORT = process.env.PORT || 5000;


//database 
dbConnect();

//set view engine
app.set("view engine", "ejs");
app.set('views', ['views','views/partials','views/users','views/admin']);
// app.set('view cache', false);

//load static files
app.use(express.static(path.join(__dirname, 'public')));



app.use(logger('dev'));

//parse application
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use(session({
    secret:"secret",
    resave:false,
    saveUninitialized:true,
    cookie: {
         maxAge: 6000000,
        httpOnly:true
     }
}))

app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, must-revalidate');
    next();
});




// Apply user session middleware for user routes
app.use('/', userRouter);

// Apply admin session middleware for admin routes
app.use('/admin', adminRouter);




app.use(err404handle);
app.use(errorHandler);

app.listen(PORT,()=>{
    console.log(`server is running at http://localhost:${PORT}`)
})