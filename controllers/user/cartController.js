
const User = require('../../models/userModel');
const Category = require('../../models/categoryModel');
const Product = require('../../models/productModel');
const Coupon = require('../../models/couponModel');
const Order = require('../../models/orderModel');
const Razorpay = require('razorpay');


const getTotalSum = async function (id) {
    try {
      const userData = await User.findById({ _id: id });
      if (userData.cart) {
        const cart = userData.cart;
        const sum = cart.reduce((sum, item) => sum + item.total_price, 0);
        return sum;
      } else return 0;
    } catch (error) {
      console.error(error.message);
      throw new Error('error while calculating net total price of cart item');
    }
  };

module.exports = {


    
    //render cart page
    loadCart : async (req,res) => {
        try {
            let userAlertmsg;
            let user;
           
            if(req.query.userMessage || req.session.user){
                userAlertmsg = req.query.userMessage;
                user = req.session.user;
            }
            
    const userData = req.session.userData;

      if(userData){
        const cartUser = await User.findById({ _id: userData._id }).populate({
            path: 'cart.prod_id', // Path to the product reference field
            model: 'Product', // Model to populate from (should match ref in schema)
          });
   
          if (!user) {
            return res.status(404).render('users/error', { err404Msg: 'The requested resource was not found' });
          }
    
          const cart = cartUser ? cartUser.cart : [];
       console.log("cartusersss",cart)
    const userInfo = cartUser;
  
             const result = await getTotalSum(userData._id);
             let headerData = userData
             let totalQuantity = 0;
             cart.forEach(function(item) { 
              totalQuantity += item.qty;  });
console.log("totalqtu",totalQuantity)
            res.render('users/cart',{
                cart,
                totalQuantity,
                cartBill: result,
          
                userData,
                userAlertmsg,
                user,
                userInfo
            })
      }else{
        return res.status(404).render('users/error'); //when userData not available
      }
    
 

        } catch (error) {
            console.log(error.message);
            const statusCode = error.status || 500;
            res.status(statusCode).send(error.message);
        }
    },



    addToCart: async (req, res) => {
        try {
          let prdId = req.query.prdId;
          const newQty = req.body.qty;
          console.log("Qtyyyy" + newQty);
          const userData = req.session.userData;
          const goToCart = req.body.goToCart === 'true';
          if (!userData) {
            res.status(401).redirect('/signin?userMessage=Please login to access cart!');
          }
          const product = await Product.findOne({ _id: prdId });
          if (!product) {
            return res.status(404).render('users/error');
          }
          const user = await User.findById(userData._id);
          // console.log("is user here" + user);
      
          if (!user.cart) {
            user.cart = []; // Initialize cart as an empty array if it doesn't exist
          }
      
          const existingCartItem = user.cart.find((item) => item.prod_id.toString() === prdId.toString());
          

          if (existingCartItem && existingCartItem.qty == newQty&& goToCart) {
            res.redirect('/cart')

          }else if(existingCartItem && existingCartItem.qty == newQty){
            
            res.redirect(`/product-view?id=${prdId}&userMessage=Product already in cart`);

          } else if (existingCartItem && (existingCartItem.qty < newQty || existingCartItem.qty > newQty)) {
            const tprice = newQty * product.price;
            const updateprd = await User.updateOne(
                { 'cart.prod_id': existingCartItem.prod_id },
                { $set: { 'cart.$[elem].qty': newQty, 'cart.$[elem].unit_price': product.price, 'cart.$[elem].total_price': tprice } },
                { arrayFilters: [{ 'elem.prod_id': existingCartItem.prod_id }] }
              );
              delete req.session.orderBill;
                delete req.session.appliedCouponCode;
                delete req.session.appliedMsg;
              const result = await getTotalSum(userData._id);
      
            // res.redirect(`/cart?userMessage=Product already in cart and qty updated`);
            res.json({itemTotalPrice:tprice,grandTotal:result})
          } else {
            const newItem = {
              prod_id: prdId, // Use prdId instead of id 
              qty: newQty,
              unit_price: product.price,
              total_price: product.price,
            };
            user.cart.push(newItem);
            const updatedUser = await user.save();
            if (updatedUser) {
                delete req.session.orderBill;
                delete req.session.appliedCouponCode;
                delete req.session.appliedMsg;
                res.redirect(`/product-view?id=${prdId}&userMessage=Product added to cart`);
            }
          }
        } catch (error) {
          console.log(error.message);
          const statusCode = error.status || 500;
          res.status(statusCode).send(error.message);
        }
      },

      deleteCartItem : async (req,res) => {
        try {
            const userId = req.session.userData 
        const productId = req.params.productId;
        const user = await User.findById(userId._id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Remove the product from the cart
        user.cart = user.cart.filter(item => item.prod_id.toString() !== productId);
        await user.save();
        delete req.session.orderBill;
        delete req.session.appliedCouponCode;
        delete req.session.appliedMsg;
        res.json({ message: 'Product removed from the cart successfully' });
        } catch (error) {
            console.error('Error removing product from cart:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
      },

      loadCheckout: async (req,res)=> {
        try {
            let userAlertmsg;
            let user;
           let totalBill
            if(req.query.userMessage || req.session.user){
                userAlertmsg = req.query.userMessage;
                user = req.session.user;
            }
            const userId = req.session.userData;
            const userData = await User.findById(userId._id).populate({
                path: 'cart.prod_id', // Path to the product reference field
                model: 'Product', // Model to populate from (should match ref in schema)
              });
              
              if (userData.cart.length === 0) {
                return res.redirect('/cart?userMessage=Please add any product to continue');
              } else {
               
                if(req.session.orderBill){
                   totalBill = req.session.orderBill;
                }else{
                   totalBill = await getTotalSum(userId._id);
                }
              console.log("totalbill/session.orderBil",totalBill)
              const appliedCouponCode = req.session.appliedCouponCode || '';
              const couponMsg = req.session.appliedMsg || '';
                if(req.session.userData){
                  res.render('users/checkout',{
                    userData,
                    userAlertmsg,
                    user,
                    totalBill,
                    cart:userData.cart,
                    address:userData.address,
                    appliedCouponCode: appliedCouponCode,
                    couponMsg,
                   // deduction:req.session.deduction
                  })
                }else{
                 return res.status(404).render('users/error')
                }
                
              }
           

        } catch (error) {
          console.log(error.message);
          const statusCode = error.status || 500;
          res.status(statusCode).send(error.message);
        }
      },

      loadPayment : async (req,res) => {
        try {
          
          return res.redirect(`/payment?index=${req.body.selectedAddressIndex}&paymentMethod=${req.body.paymentMethod}`);
        } catch (error) {
          console.log(error.message);
          const statusCode = error.status || 500;
          res.status(statusCode).send(error.message);
        }
      },

      payment: async (req, res) => {
        try {
          let userAlertmsg;
          let user;
      
          if (req.query.userMessage || req.session.user) {
            userAlertmsg = req.query.userMessage;
            user = req.session.user;
          }
      
          const selectedAddressId = req.body.selectedAddressIndex;
          const selectedPaymentMethod = req.body.paymentMethod
          
          const userId = req.session.userData;
          const userData = await User.findById(userId._id).populate({
            path: 'cart.prod_id', // Path to the product reference field
            model: 'Product', // Model to populate from (should match ref in schema)
          });
          // Find the selected address from the user's addresses array
          const selectedAddress = userData.address.find((item) => {
            return item._id.toString() === selectedAddressId.toString();
          });
         
          req.session.selectedAddress = selectedAddress;
          req.session.paymentMethod = selectedPaymentMethod;
          if(!req.session.orderBill){
            const totalBill = await getTotalSum(userId._id);
          req.session.orderBill = totalBill;
         
          }
       
          // if(userData.wallet >= req.session.orderBill || selectedPaymentMethod == "Razorpay"|| selectedPaymentMethod == "Cash on Delivery"){
            const keyId = process.env.rpId
            res.render('users/payment',{
              userAlertmsg,
              user,
              userData,
              item:selectedAddress,
              totalBill:req.session.orderBill,
              cart:userData.cart,
              selectedPaymentMethod,
              keyId,
             // deduction:req.session.deduction
            })
          // }else{
          //   res.redirect('/checkout?userMessage=No sufficent balance')
          // }
          
        } catch (error) {
          console.log(error.message);
          const statusCode = error.status || 500;
          res.status(statusCode).send(error.message);
        }
      },

      confirmOrder: async (req,res) => {
        try {
      
          const user = req.session.userData;
          const paymentMode = req.session.paymentMethod;
          const selectedAddress = req.session.selectedAddress;
          const orderBill = req.session.orderBill;
          const userData = await User.findById(user._id).populate({
            path: 'cart.prod_id',
            model: 'Product',
            populate: {
              path: 'category',
              model: 'Category',
            },
          });
          const cart = userData.cart;
        
          req.session.orderedCartItems = cart
          const cartItems = [];
          cart.forEach((item) => {
           
            cartItems.push({
              productId: item.prod_id._id,
              productname: item.prod_id.productname,
              price: item.unit_price,
              category: item.prod_id.category.categoryName,
              images: item.prod_id.images[0].filename,
              bill: item.total_price,
              productTotal: item.total_price,
              quantity: item.qty,
            });
          })


          const address = {
            name: selectedAddress.name,
            mobile: selectedAddress.mobile,
            pincode: selectedAddress.pincode,
            address: selectedAddress.address,
            district: selectedAddress.district,
            state: selectedAddress.state,
            landmark: selectedAddress.landmark,
            altr_number: selectedAddress.altr_number,
            
          }

          function createOrders(cart, paymentMode, address, orderBill) {
            const newOrder = new Order({
              userId: userData._id,
              address: address,
              items: cartItems,
              paymentMode: paymentMode,
              orderBill: orderBill,
              orderDate: new Date(),
            });
            req.session.order = newOrder;
            return newOrder;
            
          }
          
          if(paymentMode == "Cash on delivery"){
            const newOrder = createOrders(cart, paymentMode, address, orderBill);
            res.json({codSuccess:true})
             
          }else if(paymentMode == 'Razorpay'){
            const newOrder = createOrders(cart, paymentMode, address, orderBill);

            const bill = req.session.orderBill;
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
            if (order) {
              res.json({ razorpay: true, order, bill });
            } else {
              throw new Error('error while creating order');
            }
          } else if (paymentMode == 'Wallet') {
            if (userData.wallet >= orderBill) {
              console.log("if wlalet have balanc")
              createOrders(cart, paymentMode, address, orderBill);
              await User.findByIdAndUpdate({ _id: userData._id }, { $inc: { wallet: -orderBill } });

              const walletTrasaction = {
                amount:orderBill,
                type:'debited',
                description:'Product purchase using wallet',
                product: cart.forEach((item) => {
                  item.prod_id.productname + ","
                }),
                date: new Date()
            }
             const updateWalletTrasaction = await User.findByIdAndUpdate(
                { _id: userData._id },
                { $push: { walletTransactions: walletTrasaction } },
                { new: true }
              );
            await updateWalletTrasaction.save();
    

              res.json({ walletSuccess: true });
            }
          }
        
        } catch (error) {
          console.log(error.message);
          const statusCode = error.status || 500;
          res.status(statusCode).send(error.message);
        }
      },

      orderSuccessRedirect : async (req,res) => {
        try {
          const user = req.session.userData;
          const order = req.session.order;
          order.items.forEach((item) => {
            item.orderStatus = 'Processed';
          });
          const newOrder = new Order(order);
          await newOrder.save();
          
          
           // Update product stock
    const cart = req.session.orderedCartItems;
    
    for (const item of cart) {
      const id = item.prod_id._id;
      const result2 = await Product.findOneAndUpdate(
        { _id: id },
        { $inc: { stock: -item.qty } },
        { new: true }
      );
    
    }



          await User.findOneAndUpdate({ _id: user._id }, { $set: { cart: [] } }, { new: true });

          delete req.session.appliedCouponCode
          delete req.session.orderBill;
          delete req.session.appliedMsg
         
          return res.redirect('/show-confirm-order');
        } catch (error) {
          console.log('error while storing the order data');
        }
      },

      loadConfirmOrder: async (req,res) => {
        try {
          let userAlertmsg;
          let user;
      
          if (req.query.userMessage || req.session.user) {
            userAlertmsg = req.query.userMessage;
            user = req.session.user;
          }
          const userData = req.session.userData;
          const orderedCartItems =  req.session.orderedCartItems
          const selectedAddress = req.session.selectedAddress;
          const paymentMode = req.session.paymentMethod;
         
          res.render('users/orderConfirmed',{
            user,
            userAlertmsg,
            userData,
            orderedCartItems :orderedCartItems,
            orderBill:req.session.orderBill,
            item:selectedAddress,
            paymentMode,
           // deduction:req.session.deduction,
           
          })

        } catch (error) {
          console.log(error.message);
          const statusCode = error.status || 500;
          res.status(statusCode).send(error.message);
        }
      },

      razorpayPaymentFailed:async(req,res) => {
        try {
          res.send("payment failed")
        } catch (error) {
          console.log(error.message);
          const statusCode = error.status || 500;
          res.status(statusCode).send(error.message);
        }
      },


      applyCoupon : async (req,res) => {
        try {

          if (!req.session.appliedCouponCode) {
            const code = req.body.coupon;
            const bill = req.body.bill;
            const couponFound = await Coupon.findOne({ code });
            if (couponFound) {
              if (couponFound.Status === 'Active') {
                const coupDate = new Date(couponFound.expiryDate);
                const currDate = new Date();
                const status = currDate.getTime() > coupDate.getTime() ? 'Expired' : 'Active';
                await Coupon.findOneAndUpdate({ code }, { $set: { Status: status } });
        
                const Vcoupon = await Coupon.findOne({ code }); // Extra validation
                let final;
                if (Vcoupon.minBill < bill) {
               
                  const deduction = (bill * Vcoupon.value) / 100;
                 
                  if (Vcoupon.maxAmount > deduction) {
                    final = bill - (bill * Vcoupon.value) / 100;
                  } else {
                    final = bill - Vcoupon.maxAmount;
                  }
                  req.session.appliedCouponCode = code;
                  req.session.appliedMsg = code + "-Coupon Added Successfully"
                  req.session.orderBill = Math.floor(final);
        
                }
                res.json({success:true,couponFound,final});
              } else {
                res.json(couponFound);
              }
            } 
          
          }else{
            res.json({success:false})
          }

      
        } catch (error) {
          console.log(error.message);
          res.status(error.status || 500).json({ success: false, error: error.message });
        }
      },

      removeCoupon: async (req,res) => {
        try {
          const userData = req.session.userData;
          delete req.session.appliedCouponCode
          delete req.session.orderBill;
          delete req.session.appliedMsg
          const result = await getTotalSum(userData._id);
  console.log("reomveddg")
          res.json({ success: true, total:result });
        } catch (error) {
          console.log(error.message);
          res.status(error.status || 500).json({ success: false, error: error.message });
        }
      },

     
      


}