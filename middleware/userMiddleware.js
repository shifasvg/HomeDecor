const usersCollection = require("../models/userModel");

const loggedIn = async (req,res,next) => {

    if(req.session.user){
        try {
            const user = req.session.user;
            const userDetails = await usersCollection.findOne({email: user});
            req.userDetails = userDetails;
            if(userDetails.blocked){
                req.session.destroy((err) => {
                    console.log(err);
                    res.status(500);
                })
                res.clearCookie('connect.sid');
                res.redirect('/signin?userMessage=Your account is blocked by administrator!')
            }
            next()
        } catch (error) {
            console.log(error);
            return res.status(500).send("Internal Server Error");
        }
    }else {
        return res.redirect('/signin?userMessage=Please sign in for Accessibility');
    }

}

const notLogged = async (req,res,next) => {

    try {
        if (req.session.user) {
            const user = req.session.user;
         
            res.redirect(`/?userMessage=You are already signed in&user=${user}`); // User is logged in, redirect with a message
        } else {
            next(); // User is not logged in, proceed to the next middleware
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }

}

const verificationPanel = (req, res, next) => {
    if (req.session.otpStage) {
        next()

    } else {
        return res.redirect('/signin?userMessage=Log in for Accessibility')
    }
}

// checks order completed or not
const ordered=(req,res,next)=>{
    if(!req.session.ordered){
        next()
    }else{
        return res.redirect("/user/orders?userMessage=Your order has been completed already!")
    }
}


const isBlocked = async (req, res, next) => {
    try {
      const userData = req.session.userData;
      if (!userData) {
        return next();
      }
      const user = await usersCollection.findById(userData._id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      if (user.blocked) {
        req.session.user = false;
        req.session.destroy();
        res.clearCookie('connect.sid');
        return  res.redirect('/signin?userMessage=Your account is blocked by administrator!')
      }
      return next();
    } catch {
      return res.status(500).json({ error: 'Internal server error' });
    }
  };



module.exports = {
    loggedIn,
    notLogged,
    verificationPanel,
    ordered,
    isBlocked,

}