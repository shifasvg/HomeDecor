const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const {Session} = require('express-session');
const nodemailer = require('nodemailer');
const usersCollection = require('../../models/userModel');
const otpVerification = require('../../models/otpModel');
const { error } = require('jquery');
const { validateRequestWithBody } = require('twilio/lib/webhooks/webhooks');
const client = require('twilio')(process.env.accountSID, process.env.authToken);
const productCollection = require('../../models/productModel');
const categoryCollection = require('../../models/categoryModel')

//generate OTP
const generateOTP = function () {
    return Math.floor(100000 + Math.random() * 900000);
  };

//send OTP
const sendMobileOTP = async (mobile, generatedOTP) => {
    const phoneNumber = `+91${mobile}`; // Add the country code
  
    try {
      const send = await client.messages.create({ 
        body: `DO NOT SHARE: your HomeDecor OTP is ${generatedOTP}, OTP will expire in 5 minutes`, 
        to: phoneNumber, 
        from: '+14454466466' 
      });
console.log(typeof mobile)
      const hashOTP = await bcrypt.hash(String(generatedOTP), 10)
      await otpVerification.deleteMany({ mobile: mobile });
      const otph = await otpVerification.create({      
          mobile: mobile,
          otp: hashOTP,
          createdAt: Date.now(),
          expiresAt: Date.now() + (60000 * 10) // Expires in 5 minutes
      });

      console.log("in send"+send+" "+phoneNumber)
    } catch (error) {
      console.log('error sending OTP' + error.message);;
    }
  };
  

//send otp to email for verify email
const sendEmailOTP= async(name, email, generatedOTP) => {

    try {
        let transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user:process.env.smptemail,
                pass:process.env.smptpass
            }
        })

        const mailOptions = {
            from:"homedecor909098@gmail.com",
            to: email,
            subject: "Verify Your Email in HomeDecor",
            html: `<p>HomeDecor: Hey ${name} Here is your Verification OTP: <br> Your OTP is <b>${generatedOTP}</b> Do not give this code to anyone. Otp will Expire in 5 Minute</p>`
        }

        const hashOTP = await bcrypt.hash(String(generatedOTP), 10)
        await otpVerification.deleteMany({ user: email });
        const otph = await otpVerification.create({
            user: email,
            otp: hashOTP,
            createdAt: Date.now(),
            expiresAt: Date.now() + (60000 * 5) // Expires in 5 minutes
        });

        transporter.sendMail(mailOptions,(error,info)=>{
            if(error){
                console.log("Error occured")
                console.log(error);
               
            }else{
                console.log("Email has been sent:-",info.response);
            }
        })

    } catch (error) {
        console.log(error.message);
    }
}

  //bcrypt
  const securePassword = async (password) => {
    try {
      const saltRound = 10; // Number of salt rounds for bcrypt hashing
  
      const passwordHash = await bcrypt.hash(password, saltRound);
      return passwordHash;
    } catch (err) {
      console.log(error.message);
    }
  };

// ================Get all active categories========================

const getCategory = async function () {
    try {
      const categories = await categoryCollection.find({ active: true });
      return categories;
    } catch (error) {
      throw new Error('Could not find categories');
    }
  };

  function getSortQuery (sortType) {
    let sortQuery = { createdAt: -1 };
    switch (sortType) {
      case '1':
        sortQuery = { price: 1 };
        break;
      case '2':
        sortQuery = { price: -1 };
        break;
      case '3':
        sortQuery = { createdAt: -1 };
        break;
      case '4':
        sortQuery = { createdAt: 1 };
        break;
    }
    return sortQuery;
  }

module.exports = {

//rendering home page for user

loadHome : async (req,res) => {
    try {
        let userAlertmsg;
        let user;
       
        if(req.query.userMessage || req.query.user || req.session.user){
            userAlertmsg = req.query.userMessage;
            user = req.query.user|| req.session.user;
        }

        const popular = await productCollection.find().limit(8)

        if(req.session.user){
            const userD = req.session.userData;
            const userData = await usersCollection.findById(userD._id);
            if (userData.blocked === true) {
                req.session.user = false;
                return res.redirect('/');
              }
              const userInfo = userData;

              

            res.render('users/home',{userAlertmsg,user,userData,userInfo,popular});
        }else{
            res.render('users/home',{userAlertmsg,popular});
        }
        
    } catch (error) {
        console.log(error.message);
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
},

// rendering user sign up page
loadSignup : async (req,res) => {
    try {
        let userAlertmsg;
        if(req.query.userMessage){
            userAlertmsg = req.query.userMessage
        }
        res.render('users/signup',{userAlertmsg});
    } catch (error) {
        console.log(error.message);
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
},

//registering new user , backend validation and OTP generationg
 postSignUP : async (req,res) => {
    try {
       // console.log(req.body.mobile)

        // req.session.paths = "registerUser";
        const { name, email, mobile, password, cPassword } = req.body;
        const sendOTPMethod = req.body.sendOTP;
        const mobileExist = await usersCollection.findOne({ mobile: mobile });
        const emailExist = await usersCollection.findOne({ email: email });
        if(mobileExist ) {
            return res.redirect('/signup?userMessage=Mobile number already exists!');
        }else if(emailExist){
            return res.redirect('/signup?userMessage=Email already exists!');
        }else if (password != '' && cPassword != '' && email != '' && mobile != '' && name != '') {
           
           if(sendOTPMethod==="mobile"){

            const maskedMobile = 'XXXXXXX' + mobile.slice(-3); // Masking mobile number
            req.session.mobileSignup = mobile;
            req.session.emailSignup = false;

            const OTP = generateOTP();
            req.session.userDetails = {name, email, mobile, password, cPassword};
           
            req.session.otpStage =true;
            sendMobileOTP(mobile,OTP);
            
            return res.redirect(`/otpPageSignup?userMessage=OTP has been sent to your mobile number ${maskedMobile}&transporter=mobile&edit=/signup&resend=${mobile}`)
           }else{
            req.session.emailSignup = email;
            req.session.mobileSignup = false; 

            const OTP = generateOTP();
            req.session.userDetails = {name, email, mobile, password, cPassword};
            
            req.session.otpStage =true;
            sendEmailOTP(name,email,OTP);
            
            return res.redirect(`/otpPageSignup?userMessage=OTP has been sent to your email &transporter=email&edit=/signup&resend=${email}`)
           }

        }else{
            return res.redirect(`/signup?userMessage=Something went wrong, Please try again!`)
        }


    } catch (error) {
        console.log(error.message);
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
},

//render verify otp ejs
loadOtpPage: async (req,res) => {

    try {
        let userAlertmsg;
        let transporter;
        let edit;
        let resend
        if(req.query.userMessage || req.query.resend || req.query.transporter || req.query.edit){
            userAlertmsg = req.query.userMessage;
            transporter = req.query.transporter;
            edit = req.query.edit;
            resend = req.query.resend
        }
        console.log("checking null or not === ==="+userAlertmsg,transporter,edit,resend)
        res.render('users/otpPage',{userAlertmsg,transporter,edit,resend});
    } catch (error) {
        console.log(error.message);
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }

},
loadSignupOtpPage: async (req,res) => {
    try {
        let userAlertmsg;
        let transporter;
        let edit;
        let resend
        if(req.query.userMessage || req.query.resend || req.query.transporter || req.query.edit){
            userAlertmsg = req.query.userMessage;
            transporter = req.query.transporter;
            edit = req.query.edit;
            resend = req.query.resend
        }
        console.log("checking null or not === ==="+userAlertmsg,transporter,edit,resend)
        res.render('users/otpPageSignup',{userAlertmsg,transporter,edit,resend});
    } catch (error) {
        console.error(error);  // Log the error for debugging
        const statusCode = error.status || 500;
        res.status(statusCode).render('error', { error }); 
    }
},

//resend otp
resendOTP: async (req,res) => {
    try {
        const OTP = generateOTP();
        const emailormob = req.query.resend;
        // Regular expression to check if the input is a valid email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        // Regular expression to check if the input is a valid mobile number
        const mobileRegex = /^[0-9]{10}$/;

        if (emailRegex.test(emailormob)) {
            const email = emailormob;
            const userdetails = await usersCollection.find({email:email});
            req.session.otpStage = true
            sendEmailOTP(userdetails.name,email,OTP);
            console.log("Resend Value: "+emailormob);
           return res.redirect(`/otpPage?userMessage=OTP has been resent your email&transporter=${email}&edit=/forgot-password&resend=${email}`); 
        
        }else if (mobileRegex.test(emailormob)) {
            const mobile = emailormob;
            const maskedMobile = 'XXXXXXX' + mobile.slice(-3); // Masking mobile number
            console.log(OTP , mobile)
            req.session.otpStage =true;
            sendMobileOTP(mobile, OTP);
           
            console.log("otp sent no. ===="+ mobile)
            return res.redirect(`/otpPage?userMessage=OTP has resent to your mobile number ${maskedMobile}&transporter=mobile&resend=${mobile}&edit=/forgot-password`);
        }
          

    } catch (error) {
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
},



//after verifying otp creating user
registerUser: async (req,res) => {
    
  try {
   
    if(req.session.userDetails){
        
        const userDetails = req.session.userDetails;
        const passwordHash = await securePassword(userDetails.password);
        const user = new usersCollection ({
            name: userDetails.name,
            email: userDetails.email,
            mobile: userDetails.mobile, 
            password: passwordHash
        });
        const userData = await user.save();

        //for new user given access to account 
        if(userData){
            req.session.signup = false;
            req.session.userData = userData;
            req.session.user = userData.email;

            res.redirect(`/?userMessage=Welcome ${userData.name}&user=${userData.email}`); 
            
        }else{
            res.redirect('/signup?userMessage=Registration failed, please try again!')
        }
    }
   

  } catch (error) {
    console.log(error.message);
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
  }
},

// rendering user sign in page
loadSignin : async (req,res) => {
    try {
        let userAlertmsg;
        if(req.query.userMessage){
            userAlertmsg = req.query.userMessage
        }
        res.render('users/signin',{userAlertmsg});
    } catch (error) {
        console.log(error.message);
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
},

//user login to account using credentials
postSignIn: async (req,res) => {

try {
    
    const {email,password} = req.body;
    //first checks inputs are not empty 
    if(password !== '' && email !== ''){
        const userData = await usersCollection.findOne({email});
        //if user with email found
        if (userData) {
             
            const passwordmatch = await bcrypt.compare(password, userData.password);
            if(passwordmatch){  //password matched

                if(!userData.blocked){ //if account not blocked
                   
                    req.session.userData = userData;
                    req.session.user = userData.email; 
    
                    res.redirect(`/?userMessage=Welcome back ${userData.name}&user=${userData.email}`);

                }else{ //if account is blocked by admin
                    return res.redirect('/signin?userMessage=Sorry, your account is blocked, Please contact admin.')
                }

            }else{// if password does'nt match with email
                return res.redirect('/signin?userMessage=Sorry, your email or password is incorrect!');
            }

        }else{ //if user with email does'nt find
                return res.redirect(`/signin?userMessage=Sorry, user doesn't exist!`)
        }

       
    }else{  //if submit with blank inputs
        res.redirect("/signin?userMessage=email and password can't be blank!")
    }

} catch (error) {
    console.log(error.message);
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
}

},

//Sign out user

signOutUser: async (req,res) => {

    try {
        // Example in user route

        if(req.session.user){
           req.session.destroy();
        return res.redirect('/signin?userMessage=you have been Logged Out!')
        }

    } catch (error) {
        console.log(error.message);
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }

},

//load forgot password
loadforgotPassword: async (req,res) => {
try {
    
    let userAlertmsg;
        if(req.query.userMessage){
            userAlertmsg = req.query.userMessage
        }
        res.render('users/forgotPassword',{userAlertmsg});

} catch (error) {
    console.log(error.message);
    const statusCode = error.status || 500;
    res.status(statusCode).send(error.message);
}
},

//for resetting password - checks wheather user given email or mobile
postFortgotPassword : async (req,res) => {
    try {
        const emailormob = req.body.emailormob;

        // Regular expression to check if the input is a valid email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        // Regular expression to check if the input is a valid mobile number
        const mobileRegex = /^[0-9]{10}$/;

        //if email
        if (emailRegex.test(emailormob)) {
           
            const enteredEmail = req.body.emailormob;
            const emailExist = await usersCollection.findOne({ email: enteredEmail })
            
            if(emailExist){
                req.session.userIdForgotpass = emailExist._id;
                req.session.emailForgotpass = emailExist.email;
                req.session.mobileForgotpass=false;
                const OTP = generateOTP();
                const email = emailExist.email;
                const name = emailExist.name;  
                
                req.session.otpStage = true
                sendEmailOTP(name,email,OTP);
                return res.redirect(`/otpPage?userMessage=OTP has been sent your email&transporter=${email}&edit=/forgot-password&resend=${email}`);//after sending otp , redirected to verify-emailMob-otp, here verifyemailMobOTP.ejs is rendered and submit the form data which is otp , to verification 
            }else{
                return res.redirect(`/forgot-password?userMessage=Incorrect email, We cannot find an account with that email`)
            }
           
            //if mobile
        } else if (mobileRegex.test(emailormob)) {
            
            const enteredMobile = req.body.emailormob;
            const mobileExist = await usersCollection.findOne({mobile: enteredMobile});
            console.log(enteredMobile);
            if(mobileExist){
                req.session.userIdForgotpass = mobileExist._id;
                req.session.mobileForgotpass = mobileExist.mobile;
                req.session.emailForgotpass=false;
                const OTP = generateOTP();
                const mobile = mobileExist.mobile;
                req.session.userId = mobileExist._id;
                
                
                req.session.otpStage =true;
                sendMobileOTP(mobile,OTP)
                console.log("testing ======="+mobile)
               return res.redirect(`/otpPage?userMessage=OTP has been sent your mobile&transporter=${mobile}&edit=/forgot-password&resend=${mobile}`);
            }else{
                return res.redirect(`/forgot-password?userMessage=Incorrect mobile number, We cannot find an account with that mobile number`)
            }

        } else {
            // The input is neither a valid email nor a valid mobile number
            return res.redirect('/forgot-password?userMessage=Invalid input');
        }
    }  catch (error) {
        console.log(error.message);
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
},




//verify email and mobile otp , NB : using this snippet we can verify all email and mobile otps , like forgotpassword , user login etc

verifyEmailMobOTP: async (req,res) => {
const otp = req.body.otp;
try {
    
    let email;
    let mobile;
    if(req.session.emailForgotpass){
         email = req.session.emailForgotpass;
    }else if(req.session.mobileForgotpass){
         mobile = req.session.mobileForgotpass;
    }
    else{
        return res.redirect(`/forgot-password?userMessage=Failed, please try again!`);
    }


//if user doesn't fill the fields
if (!otp) {
    return res.redirect(`/otpPage?userMessage=Empty otp details are not allowed&transporter=${mobile || email}&edit=/forgot-password&resend=${mobile || email}`);
}
//fetching otp details from db

const otps = await otpVerification.findOne({
  $or: [
    { user: email },
    { mobile: mobile }
  ]
});
console.log(otps+"its otps")
if(!otps){
    return res.redirect(`/otpPage?userMessage=Account doesn't exists&transporter=${mobile || email}&edit=forgot-password&resend=${mobile || email}`);

}

const expiresAt = otps.expiresAt;
const hashedOTP = otps.otp;
//if otp time expired deleting and sent alert to user
if (Date.now() > expiresAt) {
    await otpVerification.deleteMany({ 
        $or: [
            {user:email},
            {mobile: mobile}
        ]
     });
    return res.redirect(`/otpPage?userMessage=OTP has expired, try again!&transporter=${mobile || email}&edit=forgot-password&resend=${mobile || email}`);
}

//if otp is valid
const otpValid =  await bcrypt.compare(otp, hashedOTP);

if(otpValid && otpValid !== ''){

    //if otp is sent for forgot password
   
        req.session.otpStage =false;
        return res.redirect('/new-password-page');
    
    
   
// if user enter incorrect otp
}else{
    return res.redirect(`/otpPage?userMessage=OTP is incorrect!&transporter=${mobile || email}&edit=forgot-password&resend=${mobile || email}`)
}
} catch (error) {
    console.log(error.message);
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
}

},

//verify signup email or mob
verifySignupEmailMobOTP: async (req,res) =>{

    const SignupOtp = req.body.otp;
try {
    
    let semail;
    let smobile;
    if(req.session.mobileSignup){
        smobile = req.session.mobileSignup;
    }else if(req.session.emailSignup){
        semail = req.session.emailSignup;
    }
    else{
        return res.redirect(`/signup?userMessage=Failed, please try again!`);
    }


//if user doesn't fill the fields
if (!SignupOtp) {
    return res.redirect(`/otpPageSignup?userMessage=Empty otp details are not allowed&transporter=${smobile || semail}&edit=/forgot-password&resend=${smobile || semail}`);
}
//fetching otp details from db

const findOtp = await otpVerification.findOne({
  $or: [
    { user: semail },
    { mobile: smobile }
  ]
});
console.log(findOtp+"its otps")
if(!findOtp){
    return res.redirect(`/otpPageSignup?userMessage=Account doesn't exists&transporter=${smobile || semail}&edit=forgot-password&resend=${smobile || semail}`);

}

const expiresAt = findOtp.expiresAt;
const hashedOTP = findOtp.otp;
//if otp time expired deleting and sent alert to user
if (Date.now() > expiresAt) {
    await otpVerification.deleteMany({ 
        $or: [
            {user:semail},
            {mobile: smobile}
        ]
     });
    return res.redirect(`/otpPageSignup?userMessage=OTP has expired, try again!&transporter=${smobile || semail}&edit=forgot-password&resend=${smobile || semail}`);
}

//if otp is valid
const signupOtpValid =   bcrypt.compare(SignupOtp, hashedOTP);

if(signupOtpValid && signupOtpValid !== ''){

    //if email otp is sent for forgot password
    
        req.session.otpStage =false;
        return res.redirect('/register-user')
         
    
   
// if user enter incorrect otp
}else{
    return res.redirect(`/otpPageSignup?userMessage=OTP is incorrect!&transporter=${smobile || semail}&edit=forgot-password&resend=${smobile || semail}`)
}
} catch (error) {
    console.log(error.message);
    const statusCode = error.status || 500;
    res.status(statusCode).send(error.message);
}
},

//load new password page
loadNewPassword: async (req,res) => {
    try {
        
        let userAlertmsg;
            if(req.query.userMessage){
                userAlertmsg = req.query.userMessage
            }
            res.render('users/newPassword',{userAlertmsg});
    
    } catch (error) {
        console.log(error.message);
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
    },


//update forgot password with new password 
forgotPasswordUpdate: async (req, res) => {
    try {
        const newpass = req.body.newpass;
        const confirmpass = req.body.confirmpass;

        const id = req.session.userIdForgotpass;

        if (newpass !== '' && confirmpass !== '') {
            if (newpass === confirmpass) {
                const passwordhash = await securePassword(newpass);

                // Updating new hashed password to the database
                if (passwordhash) {
                    const update = await usersCollection.updateOne({ _id: id }, { $set: { password: passwordhash } });

                    // Check if the update was successful
                    if (update.modifiedCount > 0) {
                        // Update done and clear user session for new login
                        req.session.emailForgotpass = false;
                        return res.redirect('/signin?userMessage=Password updated, please sign in ');
                    } else {
                        // Update failed
                        return res.redirect(`/new-password-page?userMessage=Password update failed, please try again!`);
                    }
                } else {
                    // If password didn't hash
                    return res.redirect(`/new-password-page?userMessage=Sorry, password didn't update, Please try again!`);
                }
            } else {
                // If newpass and confirmpass didn't match
                return res.redirect(`/new-password-page?userValidate=Passwords don't match!`);
            }
        }
    } catch (error) {
        console.log(error.message);
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
}
,

shopView : async (req, res) => {
    try {       
        let userAlertmsg;
        let user;
       let userData = req.session.userData;
       let result
        if(req.query.userMessage || req.session.user || req.session.userData|| req.query.result){
            userAlertmsg = req.query.userMessage
            user= req.session.user
            result = req.query.result
           
        }   
        const userInfo = await usersCollection.findOne({email:user});
       const categories = await categoryCollection.find({
    $and: [
        { isDeleted: false },
        { active: true }
    ]
});

if(req.query.catid){
    let catId = req.query.catid;
    const products = await productCollection.find({
        $and: [
            { isDeleted: false },
           
            {category:catId}
        ]});    
    // console.log("categories ===="+categories)
     //console.log("categoryproducts ==="+products)
   
     const itemsperpage = 2;
     const currentpage = parseInt(req.query.page) || 1;
     const startindex = (currentpage - 1) * itemsperpage;
     const endindex = startindex + itemsperpage;
     const totalpages = Math.ceil(products.length / 2);
     const currentproduct = products.slice(startindex,endindex);

      res.render('users/shop', {
      
        categories: categories,
    products,
userAlertmsg, user, userData,userInfo,currentproduct, totalpages,currentpage})
}else{
    const cproducts = await productCollection.aggregate([
        {
            $match: { isDeleted: false }
        },
        {
            $lookup: {
                from: 'categories', // Replace 'categories' with the actual name of your categories collection
                localField: 'category',
                foreignField: '_id',
                as: 'category'
            }
        },
        {
            $unwind: '$category'
        },
        {
            $match: { 'category.active': true }
        }
    ]).exec();
    
    const itemsperpage = 3;
    const currentpage = parseInt(req.query.page) || 1;
    const startindex = (currentpage - 1) * itemsperpage;
    const endindex = startindex + itemsperpage;
    const totalpages = Math.ceil(cproducts.length / 3);
    
    let products;

    if (!result) {
        products = cproducts.slice(startindex, endindex);
    } else {
        products = await productCollection.find({_id:result});
        console.log("inshop",products)
    }

      res.render('users/shop', {
      
        categories: categories,
    products,
userAlertmsg, user,userData,userInfo, totalpages,currentpage})
}

       

      } catch(error){
        console.log(error.message)
      }

  },
        //display category products
        displayCategory: async (req,res) =>{
            const categoryId = req.query.id;
            const categories = await categoryCollection.find();
            
           
               
            const products2 = await productCollection.find({
                category: categoryId 
              })
              if(products2.length > 0){
                //console.log("product2 catId======="+categoryId)
                return res.redirect(`/shop?catid=${categoryId}`);

              }else{
               return res.redirect('/shop?userMessage=No products available on that category!')
              }
             //console.log("cat products==="+products)
             // res.send("hai")
            //  return res.render('users/shop', {
            //     categories,
            //     products})
            
            
          },

//product view
          productView : async (req, res) => {
            try {       
                let userAlertmsg;
                let user
                let id = req.query.id;
                if(req.query.userMessage || req.session.user){
                    userAlertmsg = req.query.userMessage
                    user= req.session.user
                }   
                const product = await productCollection.findOne({ _id: id }).populate('category');   
                const relatedproducts = await productCollection.find({
                    category: product.category,
                    isDeleted: false,
                    _id: { $ne: product._id } // Exclude the current product ID
                }).populate('category');

               console.log("Product=="+product);
            //    console.log("relatedproducts=="+relatedproducts)
console.log(req.session.user+"haiiiiii")
                if(req.session.user){
                    const userDetails = req.session.userData;
                    const userData = await usersCollection.findOne({_id:userDetails._id}).populate({
                        path:'cart.prod_id',
                        model: 'Product',
                        populate: {
                            path:'category',
                            model: 'Category'
                        }
                    });
                    
                    const existingprd = userData.cart.some((item) => {
                        return item.prod_id._id.toString() === product._id.toString();
                      });
                      
                      const existingProduct = userData.cart.find((item) => {
                        return item.prod_id._id.toString() === id.toString();
                      });
                      const existingQty = existingProduct ? existingProduct.qty : 0;
                      
                      console.log("haaaii2 ===" + existingQty);
                      const userInfo = userData
                    res.render('users/productView', {
                        relatedproducts,
                        product,
                        userAlertmsg,
                        user,
                        userData,
                        existingprd,
                        existingQty,
                        userInfo
                    })
                }else{
                    res.render('users/productView', {
                        relatedproducts,product,userAlertmsg})
                }

        
              } catch(error){
                console.log(error.message)
              }
        
          },
          
          loadAbout : async(req,res)=> {
            try {
                let userAlertmsg;
                let user;
               let userData = req.session.userData;
                if(req.query.userMessage || req.session.user || req.session.userData){
                    userAlertmsg = req.query.userMessage
                    user= req.session.user
                }   
                res.render('users/about',{userAlertmsg,userData})
            } catch (error) {
                console.log(error.message);
                res.status(error.status || 500).send(error.message);
            }
          },

    search: async (req,res)=> {
        try {

            let userAlertmsg;
            let user;
           
            if(req.query.userMessage || req.session.user ){
                userAlertmsg = req.query.userMessage
                user= req.session.user
            }   
            const userInfo = await usersCollection.findOne({email:user});

            const searchText = req.query.search;
            console.log("search",searchText)

            const result = await productCollection.find({
              $and: [
                { isDeleted: false },
                {
                  $or: [
                    { productname: { $regex: searchText, $options: 'i' } },
                   
                  ],
                },
              ],
            }).populate('category');
        
            const categories = await getCategory();
            if (req.session.user) {
              const user = req.session.userData;
        
              const userData = await usersCollection.findById(user._id).populate({
                path: 'cart.prod_id',
                model: 'Product',
                populate: {
                  path: 'category',
                  model: 'Category',
                },
              });
              console.log("Resulffj",result)
              res.redirect(`/shop?result=${result[0]._id}`);
            //   res.render('users/shop', { userData, categories, products: result, user, userAlertmsg, userInfo });
            } else {
              res.render('users/shop', { categories, products: result, userAlertmsg, userInfo });
            }
        } catch (error) {
            console.log(error.message);
            res.status(error.status || 500).send(error.message);
        }
    },

    displaySort : async (req,res) => {
        try {
    //const categoryId = req.query.id;
    let userAlertmsg;
    let user;
   let userData = req.session.userData;
    if(req.query.userMessage || req.session.user || req.session.userData|| req.query.result){
        userAlertmsg = req.query.userMessage
        user= req.session.user
    }   
    const userInfo = await usersCollection.findOne({email:user});
    let page = 1;

    if (req.query.page) {
      page = req.query.page;
    }
    const limit = 3;

    const minPrice = parseFloat(req.query.minPrice) || 0; // Minimum price
    const maxPrice = parseFloat(req.query.maxPrice) || Number.MAX_VALUE; // Maximum price

    const categoriesPromise = await getCategory();
    let  productsPromise;
    
      
      productsPromise = productCollection.find({
        isDeleted: false,
        price: { $gte: minPrice, $lte: maxPrice },
      })
        .sort(getSortQuery(req.query.sort))
        
        
   
    const [ products, categories] = await Promise.all([
      productsPromise,
      categoriesPromise,
    ]);
   
    const itemsperpage = 3;
    const currentpage = parseInt(req.query.page) || 1;
    const startindex = (currentpage - 1) * itemsperpage;
    const endindex = startindex + itemsperpage;
    const totalpages = Math.ceil(products.length / 3);

  console.log('hello',products)    

  res.render('users/shop', {
      
    categories: categories,
products,
userAlertmsg, user,userData,userInfo, totalpages,currentpage})
    
    
        } catch (error) {
            console.log(error.message);
            res.status(error.status || 500).send(error.message);
        }
    }

}

