const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema(
  {
    userId: {
      type: String,
    },
    address: {
      name: {type: String},
      mobile:{ type: Number },
      pincode: { type: Number },
      // locality: String,
      address: {type: String},
      district: {type: String},
      state: {type: String},
      landmark: {type: String},
      altr_number: { type: Number },
      country: {
        type: String,
        default: 'India'
      }
    },

    items: [
      {
        productId: { type: String },
        productname: { type: String },
        price: { type: Number },
        category: { type: String },
        images: { type: String },
        bill: { type: Number},
        productTotal: { type: Number },
        quantity: { type: Number },
        orderStatus: { type: String, default:"Order placed" },
       
      },
    ],
    paymentMode: {
      type: String,
    },
    orderBill: {
      type: String,
    },
    orderDate: {
      type: Date,
      default: Date(),
    },
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
