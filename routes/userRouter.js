const express = require('express');
const middle=require('../middleware/userMiddleware'); //this middleware check user loggedin or out and block 
const userController=require('../controllers/user/userController');
const cartController = require('../controllers/user/cartController');
const profileController = require('../controllers/user/profileController');
const orderController = require('../controllers/user/orderController');

const router = express.Router();




//home
router.get('/', userController.loadHome); 
 
//user signup
router.get('/signup', middle.notLogged, userController.loadSignup);
router.post('/signup', middle.notLogged, userController.postSignUP);
router.get('/register-user', middle.notLogged, userController.registerUser); //register user details after otp verification
router.get('/otpPageSignup',userController.loadSignupOtpPage);//render signup otp page
router.post('/verify-signup-emailMob-otp', middle.verificationPanel,userController.verifySignupEmailMobOTP);//route to verify signup otp for email/mobile
//common resend otp 
router.get('/resend-otp', middle.verificationPanel, userController.resendOTP);//add resend for signup
// //user signin
router.get('/signin', middle.notLogged, userController.loadSignin);
router.post('/signin', middle.notLogged, userController.postSignIn);
//user signout
router.get('/signout', middle.loggedIn, userController.signOutUser);
//render otp page for forgot password
router.get('/otpPage', middle.verificationPanel, userController.loadOtpPage);
//user forgot passowrd
router.get('/forgot-password', userController.loadforgotPassword);
router.post('/forgot-password', userController.postFortgotPassword);
//route to verify forgot password otp for email/mobile
router.post('/verify-emailMob-otp', middle.verificationPanel, userController.verifyEmailMobOTP);
//after verify otp , new password page and updates password
router.get('/new-password-page', userController.loadNewPassword);
router.post('/new-password-page', userController.forgotPasswordUpdate);
//shop view, product view & category view 
router.get('/shop', middle.isBlocked, userController.shopView);
router.get('/shop/displayCategory',userController.displayCategory);
router.get('/product-view',middle.isBlocked,userController.productView);

//-----------CartController-------------//
router.get('/cart', middle.isBlocked, middle.loggedIn, cartController.loadCart);
router.post('/addtocart',cartController.addToCart);
router.delete('/cart/remove/:productId', middle.loggedIn, cartController.deleteCartItem);
router.get('/checkout',middle.isBlocked, middle.loggedIn, cartController.loadCheckout);
router.post('/payment',cartController.payment); 


router.get('/confirm-order',middle.isBlocked, middle.loggedIn, cartController.confirmOrder);
router.get('/show-confirm-order', middle.isBlocked, middle.loggedIn, cartController.loadConfirmOrder);
// router.get('/razorpayPaymentFailed',cartController.razorpayPaymentFailed);
router.get('/orderRedirect',cartController.orderSuccessRedirect);
router.post('/applyCoupon',cartController.applyCoupon);
//----------User Profile----------------//
router.get('/user-profile', middle.isBlocked, middle.loggedIn, profileController.loadProfile);
router.post('/user-edit-profile',profileController.editProfile)
router.get('/user-address', middle.isBlocked, middle.loggedIn, profileController.loadAddress);
router.post('/add-new-address',profileController.addNewAddress);
router.post('/edit-address',profileController.editAddress);
router.get('/user-profile/delete-address', middle.isBlocked, middle.loggedIn, profileController.deleteAddress);
router.get('/user-wallet',profileController.loadWallet)
//----------User order-------------//
router.get('/user-orders', middle.isBlocked, middle.loggedIn, orderController.loadUserOrder);
router.post('/cancelOrder', orderController.cancelOrder);
router.patch('/returnOrder/:id', orderController.returnOrder);
router.get('/orderProductDetails',orderController.orderProductDetails);

module.exports=router;