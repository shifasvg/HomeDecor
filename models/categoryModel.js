const mongoose = require("mongoose")

const Schema = mongoose.Schema

const categorySchema = new Schema({
    categoryName : {
        type:String,
        trim:"true",
    },
    active:{
        type:Boolean,
        default:true
    },
    isDeleted:{
        type:Boolean,
        default:false
    }
})

const Category = mongoose.model("Category",categorySchema)

module.exports = Category