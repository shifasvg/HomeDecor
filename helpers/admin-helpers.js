const User = require('../models/userModel');
const Product = require('../models/productModel');
const Order = require('../models/orderModel');

module.exports={

    GetUserCount:()=>{
        return new Promise(async(resolve,reject)=>{

            try{
                const userCount  = await User.find().count()
                console.log(userCount);

                if(!userCount){
                    reject('no user')
                }else{

                    resolve(userCount)
                }

                
            }catch(err){

                reject(err)


            }


            
        })
    },

    GetMonthlyTotalOrderCount:()=>{

        return new Promise(async(resolve,reject)=>{

            try {
                const getMonthlyOrderCounts = await Order.aggregate([
            {
                $group:{
                    _id:{$month:'$createdAt'},
                    totalOrders:{$sum:1}
                }
            },{
                $sort:{_id:1}
            },
            {
                $project: {
                    month: { $concat: [{ $substr: ['$_id', 0, -1] }, ''] },
                    totalOrders: 1
                }
            }
        
        ])
        // Define an array with all the month names
const months1 = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  
  // Initialize an array to hold the monthly order counts
  const monthlyTotalOrderCount = Array(12).fill(0);
  
  // Loop through the result and update the monthly counts array
  getMonthlyOrderCounts.forEach(entry => {
    const monthIndex = entry._id - 1; // Adjust month index since it starts from 1
    monthlyTotalOrderCount[monthIndex] = entry.totalOrders;
  });

  resolve({months1,monthlyTotalOrderCount})      
            
            } catch (error) {

                reject(error)
                
            }

        })

    },

}