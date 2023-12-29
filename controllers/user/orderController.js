const Order = require('../../models/orderModel');
const User = require('../../models/userModel');
const Category = require('../../models/categoryModel');
const Product = require('../../models/productModel');
const mongoose = require('mongoose');

// change format of date
const formatDate = async function (date){
    const day = ('0' + date.getDate()).slice(-2);
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear().toString();
    return `${day}-${month}-${year}`;
}

module.exports = {
    loadUserOrder : async (req,res) => {
        try {
            let userAlertmsg;
        let user;
       
        if(req.query.userMessage || req.session.user||req.session.userData){
            userAlertmsg = req.query.userMessage;
            user = req.session.user;
           
        }
        const userData = req.session.userData;
        const orderedProducts = await Order.find({ userId: userData._id }).sort({ orderDate: -1 });
       
        res.render('users/order',{
            user,
            userAlertmsg,
            userData,
            orderedProducts,
        })
        } catch (error) {
            console.log(error.message);
            const statusCode = error.status || 500;
            res.status(statusCode).send(error.message);
        }
    },
    
    cancelOrder: async(req,res) => {
        try { 
            const userData = req.session.userData;
          
    const id = req.body.id;
    const mop = req.body.mop;
    const refund = parseInt(req.body.refund);
    const orderQuery = {
      userId: userData._id,
      'items._id': id,
    };
    const updateOrderStatus = { $set: { 'items.$.orderStatus': 'Cancelled by customer' } };
  
    if(mop == "Razorpay" || "Wallet"){
    
      const result = await Order.findOneAndUpdate(orderQuery, updateOrderStatus);
      await User.findByIdAndUpdate({ _id: userData._id }, { $inc: { wallet: refund } });
      const result2 = await Product.findOneAndUpdate(
        { _id: result.items[0].productId },
        { $inc: { stock: result.items[0].quantity } },
        { new: true }
      );
     
      res.json(result2);
    }else{
      
      let result = await Order.findOneAndUpdate(orderQuery, updateOrderStatus);
      let result2 = await Product.findOneAndUpdate(
        { _id: result.items[0].productId },
        { $inc: { stock: result.items[0].quantity } }
      );
      res.json(result2);
    }

        } catch (error) {
            console.log(error.message);
            res.status(error.status || 500).send(error.message);
        }
    },

    returnOrder : async (req, res) => {
        try {
            const userData = req.session.userData;
            const id = req.params.id;
            console.log("productitemid",id)
            const result = await Order.findOneAndUpdate(
              {
                userId: userData._id,
                'items._id': id,
              },
              {
                $set: { 'items.$.orderStatus': 'Return initiated' },
              },
              { new: true }
            );
        
            res.redirect('/user-orders');
          } catch (error) {
            console.log(error.message);
          }
    },

    orderProductDetails : async(req,res) => {
      try {
        let userAlertmsg;
        let user;
       
        if(req.query.userMessage || req.session.user||req.session.userData){
            userAlertmsg = req.query.userMessage;
            user = req.session.user;
           
        }
        let orderedPrdId = req.query.orderedPrdid;
        let orderCartProductsId = req.query.orderCartProductsId
        const userData = req.session.userData;

const orderedPrd = await Order.findOne({_id:orderCartProductsId})

        // const orderedPrd = await Order.aggregate([
        //   {
        //     $match: {
        //       // Match orders with the specified orderCartProductsId
        //       _id: mongoose.Types.ObjectId(orderCartProductsId)
        //     }
        //   },
        // ]).exec();
        


        const product = orderedPrd.items.find(item => item._id.toString() === orderedPrdId)

        res.render('users/orderProductDetails',{
          user,
          userAlertmsg,
          userData,
          orderedPrd,
          product
      });

      } catch (error) {
        console.log(error.message);
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
      }
    }
}