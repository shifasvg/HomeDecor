const User = require('../../models/userModel');
const Coupon = require('../../models/couponModel');

module.exports = {

//render coupon page
loadCoupon: async (req,res) => {
    try {

        let adminAlertmsg;
        if(req.query.message){
            adminAlertmsg = req.query.message;
        }

        const formatDate = function (date) {
            const day = ('0' + date.getDate()).slice(-2);
            const month = ('0' + (date.getMonth() + 1)).slice(-2);
            const year = date.getFullYear().toString();
            return `${day}-${month}-${year}`;
          };
          const coupon = await Coupon.find().sort({ _id: -1 });
           res.render('admin/coupon',{coupon,formatDate });


    } catch (error) {
        console.log(error.message);
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
}

}