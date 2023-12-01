const mongoose=require('mongoose')

const otpVerification=new mongoose.Schema({
    user:String,
    mobile:String,
    otp:{type: String,
        trim:true
        },
    createdAt:Date,
    expiresAt:Date,
})
const OTPverify=mongoose.model("otpVerification",otpVerification)

module.exports=OTPverify