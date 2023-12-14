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
           res.render('admin/coupon',{coupon,formatDate,adminAlertmsg });


    } catch (error) {
        console.log(error.message);
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
},
loadAddCoupon : async (req,res) => {
    try {
        let adminAlertmsg;
        if(req.query.message){
            adminAlertmsg = req.query.message;
        }

        res.render('admin/addcoupon',{adminAlertmsg})

    } catch (error) {
        console.log(error.message);
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
},

addCoupon : async (req,res) => {
    try {

        let adminAlertmsg;
        if(req.query.message){
            adminAlertmsg = req.query.message;
        }

        const code = req.body.couponCode;
      const value = req.body.couponValue;
      const expiry = req.body.couponExpiry;
      const bill = req.body.minBill;
      const maxAmount = req.body.maxAmount;

      const find = await Coupon.findOne({ code });

      if (find) {
        adminAlertmsg = 'Coupon already exists';
        return res.redirect(`/admin/add-coupon-page?message=${adminAlertmsg}`);
      } else {
        if (value > 0 && value <= 100) {
          const couponData = new Coupon({
            code,
            value,
            minBill: bill,
            maxAmount,
            expiryDate: expiry,
          });
          await couponData.save();
         
          adminAlertmsg = 'New Coupon Added Successfully';
          res.redirect(`/admin/coupon-management?message=${adminAlertmsg}`);
        } 
      }

    } catch (error) {
        console.log(error.message);
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
},

loadEditcoupon : async (req,res) => {
try {
    const edit = await Coupon.findOne({ _id: req.query.edit });
    res.render('admin/editcoupon', { couponEdit: edit });
} catch (error) {
    console.log(error.message);
    res.status(error.status || 500).json({ success: false, error: error.message });
}
},

editCoupon: async (req,res) => {
try {
    const id = req.query.id;
      const code = req.body.couponCode;
      const value = req.body.couponValue;
      const expiry = new Date(req.body.couponExpiry);
      const bill = req.body.minBill;
      const maxAmount = req.body.maxAmount;
      const currDate = new Date();
      const Status = currDate.getTime() < expiry.getTime() ? 'Active' : 'Expired';
      const updated = await Coupon.findByIdAndUpdate(
        { _id: id },
        {
          $set: {
            code,
            value,
            expiryDate: expiry,
            minBill: bill,
            maxAmount,
            Status,
          },
        }
      );
      if (!updated) {
        throw new Error('an error occured while updating the coupon');
      }
      return res.redirect('/admin/coupon-management');
} catch (error) {
    console.log(error.message);
    res.status(error.status || 500).json({ success: false, error: error.message });
}
},

couponDeactivate: async (req, res) => {
    try {
      const id = req.query.id;
      await Coupon.findOneAndUpdate({ _id: id }, { $set: { Status: 'Inactive' } });   
      res.redirect('/admin/coupon-management?message="coupon Deactivated successfully"');
    } catch (error) {
      console.log(error.message);
    }
  },

  couponActivate: async (req, res) => {
    try {
      const id = req.query.id;
      const expired = await Coupon.findOne({ _id: id, Status: 'Expired' });
      if (expired) {
        return res.redirect('/admin/coupon-management?message="Coupon expiry need to updated before activating"');
      } else {
        await Coupon.findOneAndUpdate({ _id: id }, { $set: { Status: 'Active' } });
        return res.redirect('/admin/coupon-management?message="coupon Activated Successfully"');
      }
    } catch (error) {
      console.log(error.message);
    }
  },


}