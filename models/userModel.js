const mongoose = require('mongoose');
const Schema = mongoose.Schema;



// Define the user schema
const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    mobile: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    
    password: {
      type: String,
      
    },

    address: [{
      name: String,
      mobile: Number,
      pincode: Number,
      // locality: String,
      address: String,
      district: String,
      state: String,
      landmark: String,
      altr_number: Number,
      country: {
        type: String,
        default: 'India'
      }
    }],


    wallet: {
      type: Number,
      default: 0,
    },

    walletTransactions:[
      {
        amount: {
          type: Number,
          required: true,
        },
        type: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
        product:{
          type:String
        },
        date: {
          type: Date,
          default: Date(),
        },
      }
    ],


    cart: {
      type: [{
        prod_id: {
          type: Schema.Types.ObjectId,
          ref: 'Product', // Reference to the Product model
          required: true,
        },
        qty: {
          type: Number,
          default: 1
        },
        unit_price: {
          type: Number
        },
        total_price: {
          type: Number
        },
      }],
      default: [] // Initialize cart as an empty array by default
    },

  wishlist: [mongoose.Types.ObjectId],

  orders:[{
    products:[{
        prd_id:mongoose.Types.ObjectId,
        qty:Number,
        price:Number,
        status:{
            type:String,
            default:"pending"
        },
        returned:{
            type:Boolean,
            default:false
        },
        refunded:{
            type:Boolean,
            default:false
        },
    }],
    total_amount:Number,
        order_date:Date,
        payment_method:String,
    address: {
          name: String,
          mobile: Number,
          pincode: Number,
          locality: String,
          adress: String,
          district: String,
          state:String,
          landmark: String,
          altr_number: Number,
          country: {
            type: String,
            default: 'India'},
        },
  }],

  blocked: {
    type: Boolean,
    default: false, 
    required: true
  },



  },
  
  { timestamps: true },

);


module.exports = mongoose.model('User', userSchema);
