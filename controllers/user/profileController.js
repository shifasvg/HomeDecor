const User = require('../../models/userModel');
const Category = require('../../models/categoryModel');
const bcrypt = require('bcrypt');
const Razorpay = require('razorpay');
module.exports = {

loadProfile: async (req,res) => {
    try {
        let userAlertmsg;
        let user;
       
        if(req.query.userMessage || req.session.user||req.session.userData){
            userAlertmsg = req.query.userMessage;
            user = req.session.user;
           
        }
       
        if(req.session.user){
            const userData = req.session.userData;
        const userProfileData = await User.findById(userData._id).populate({
            path: 'cart.prod_id',
            model: 'Product',
          });

        
      const userInfo = userProfileData;
        res.render('users/profile',{
            user,
            userData,
            userProfileData,
            userAlertmsg,
            userInfo
        })
        }else{
            res.status(500).render("users/error");
        }
    } catch (error) {
        console.log(error.message);
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
},

editProfile: async(req,res) => {
    try {
        let userAlertmsg;
        let user;
       
        if(req.query.userMessage || req.session.user){
            userAlertmsg = req.query.userMessage;
            user = req.session.user; 
        }
        let id = req.query.id;
        const newprofileData = {
            name:req.body.name,
            mobile:req.body.mobile,
            email:req.body.email
        }
        const updatedUser = await User.findByIdAndUpdate(id, newprofileData, { new: true });
        if (updatedUser) {
            res.redirect('/user-profile?userMessage=User profile updated');
        } else {
            res.status(404).send('User not found or update failed');
        }
    } catch (error) {
        console.log(error.message);
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
},

loadAddress: async (req,res) => {
    try {
        let userAlertmsg;
        let user;
       
        if(req.query.userMessage || req.session.user){
            userAlertmsg = req.query.userMessage;
            user = req.session.user;
           
        }
       
        if(req.session.user){
            const userData = req.session.userData;
        const userProfileData = await User.findById(userData._id).populate({
            path: 'cart.prod_id',
            model: 'Product',
          });

         
      
        res.render('users/address',{
            user,
            userData,
            userProfileData,
            userAlertmsg
        })
        }else{
            res.status(500).render("users/error");
        }
    } catch (error) {
        console.log(error.message);
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
},

addNewAddress: async (req,res) => {
    try {
        const id = req.query.id,
        checkoutAddForm = req.query.checkoutAddForm;
        console.log("iddd"+id)
        const addressData = {
          name: req.body.name,
          mobile: Number(req.body.mobile), // Parse as number
          pincode: Number(req.body.pincode), // Parse as number
        //   locality: req.body.locality,
          address: req.body.address,
          district: req.body.district,
          state: req.body.state,
          landmark: req.body.landmark,
          altr_number: Number(req.body.AlternativeNumber), // Parse as number
        };
    
        // Update user's address array
        const updateUser = await User.findByIdAndUpdate(
          { _id: id },
          { $push: { address: addressData } },
          { new: true }
        );
    
        req.session.userData = updateUser;

        if(updateUser && checkoutAddForm){
            res.redirect('/checkout?userMessage=New address added')
        }else if(updateUser){
            res.redirect('/user-address?userMessage=New address added')
        }

        

    } catch (error) {
        console.log(error.message);
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
},

editAddress: async (req,res)=> {
    try {
        const id = req.query.id;
        const addressId = req.query.addressId;
        const checkoutEditForm = req.query.checkoutEditForm;
        const newAddressData = {
            name: req.body.name,
            mobile: Number(req.body.mobile), // Parse as number
            pincode: Number(req.body.pincode), // Parse as number
          //   locality: req.body.locality,
            address: req.body.address,
            district: req.body.district,
            state: req.body.state,
            landmark: req.body.landmark,
            altr_number: Number(req.body.AlternativeNumber), // Parse as number
          };

          const updatedUser = await User.findOneAndUpdate(
            { _id: id, 'address._id': addressId },
            { $set: { 'address.$': newAddressData } },
            { new: true }
          );
          req.session.userData = updatedUser;
            if(updatedUser && checkoutEditForm){
                res.redirect('/checkout?userMessage=Address updated')
            }else if(updatedUser){
                res.redirect('/user-address?userMessage=Address updated')
            }
         

    } catch (error) {
        console.log(error.message);
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
},

deleteAddress: async (req,res) => {
    try {
        const id = req.query.id;
        const addressId = req.query.addressId;
        const updatedUser = await User.findByIdAndUpdate(
            { _id: id },
            { $pull: { address: { _id: addressId } } },
            { new: true }
          );
          req.session.userData = updatedUser;
          res.redirect('/user-address?userMessage=Saved address deleted ')
    } catch (error) {
        console.log(error.message);
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message); 
    }
},

loadWallet : async (req,res) => {
    try {
        let userAlertmsg;
        let user;
       
        if(req.query.userMessage || req.session.user){
            userAlertmsg = req.query.userMessage;
            user = req.session.user;
           
        }

        if(req.session.user){
            const userData = req.session.userData;
       
            const walletBalance = await User.findById(userData._id, 'wallet');
            console.log('wallet', walletBalance);

        const userProfileData = await User.findById(userData._id).populate({
            path: 'cart.prod_id',
            model: 'Product',
          });
          const keyId = process.env.rpId
          res.render('users/wallet',{
            user,
            userData,
            userProfileData,
            userAlertmsg,
            keyId,
           walletBalance: walletBalance.wallet,
        });
        }else{
            res.status(500).render("users/error");
        }

    

    } catch (error) {
        console.log(error.message);
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
},

addWalletMoney: async(req,res) =>{
    try {
        const bill = req.query.amount;
      const userid = req.session.userData
        // Find the user by ID
        const user = await User.findOne({ _id: userid });

        // Update the wallet amount
        user.wallet += parseFloat(bill); 

        // Save the updated user
        await user.save();
            const razorpay = new Razorpay({
              key_id: 'rzp_test_1RHZRb2L3r35z5',
              key_secret: 'gpL4LQjEoyKCFx83VOLwd3E5',
            });
            console.log(razorpay);
            const options = {
              amount: bill * 100, // to smallest currency  paisa
              currency: 'INR',
            };
            const order = await razorpay.orders.create(options);
            res.json({ razorpay: true, bill });
    } catch (error) {
        console.log(error.message);
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
}

}