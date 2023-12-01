const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productSchema = new Schema(
  {
    productname: {
      type: String,
      required: true,
      trim:true
    },
    
    price: {
      type: Number,
      required: true,
    },

    mrp: {
        type: Number,
        required: true,
      },

    description: {
      type: String,
      required: true,
    },

    stock: {
      type: Number,
      required: true,
    },

    discount: {
        type: String
    },

      images: [
    {
      filename: String,
      originalname: String
    }
  ],

    category: {
      type: Schema.Types.ObjectId, // Reference to Category schema
      ref: 'Category', // Reference to the 'Category' model
      
    },

    isDeleted:{
      type: Boolean,
      default:false
    }

  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
