const mongoose = require('mongoose');
const dbConnect = async ()=>{
    try {
        await  mongoose.connect("mongodb://127.0.0.1:27017/homeDecorDB", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("db connected");
    } catch (error) {
        console.log("db error");
    }
};

module.exports=dbConnect;