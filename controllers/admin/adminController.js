const admin = require('../../models/adminModel');
const usersCollection = require('../../models/userModel');
const Category = require('../../models/categoryModel');
const Product = require('../../models/productModel');
const Order = require('../../models/orderModel');

const CategoryExist = async (name) => {
    try {
      const exist = await  Category.findOne({ categoryName: name });
      if (exist) {
        return true;
      } else {
        return false;
      }
    } catch (error) {}
  };

  const getCategory = async function () {
    try {
      const categories = await Category.find({});
      if (categories.length > 0) {
        return categories;
      } else {
        return redirect(`/admin/category-management?message=Could't find any category`)
      }
    } catch (error) {
      console.log(error.message);
    }
  };

module.exports = {

//Render admin dashboard
loadAdminDashboard: async (req,res) => {
    try {
       
        let adminAlertmsg;
        if(req.query.message){
            adminAlertmsg = req.query.message;
        }

        const months = {};
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      // fetching all orders
      const orders = await Order.find({});
      orders.forEach((order) => {
        const month = monthNames[order.orderDate.getMonth()];
        if (!months[month]) {
          months[month] = 0;
        }
        months[month]++;
      });

      const paymentModeStats = await Order.aggregate([
        {
          $group: { _id: '$paymentMode', count: { $sum: 1 } },
        },
      ]);

      const orderCount = await Order.find({ __v: 0 }).count();
      const userCount = await usersCollection.find().count();

      const orderSum = await Order.aggregate([
        { $unwind: '$items' },
        { $match: { 'items.orderStatus': 'Delivered' } },
        { $group: { _id: null, totalBill: { $sum: '$items.bill' } } },
      ]);
     
      const quantitySum = await Order.aggregate([
        { $unwind: '$items' },
        { $match: { 'items.orderStatus': 'Delivered' } },
        { $group: { _id: null, totalProducts: { $sum: '$items.quantity' } } },
      ]);
  
      const orders1 = await Order.find({}).sort({ orderDate: -1 }).limit(5);
 

        res.render('admin/adminDashboard',{
          adminAlertmsg,
          months,
          data: JSON.stringify(paymentModeStats),
          totalBill: orderSum[0].totalBill,
          orderCount,
          userCount,
          totalQuantity: quantitySum[0].totalProducts,orders1});
    } catch (error) {
        console.log(error.message);
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }


},

//Render admin login page
loadAdminSignIn : async (req,res) => {
    try {
        let adminAlertmsg;
        if(req.query.message){
            adminAlertmsg = req.query.message;
        }
        res.render('admin/adminSignin',{adminAlertmsg});
    } catch (error) {
        console.log(error.message);
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
},

//post admin login
postAdminSignin : async (req,res) => {
    try {
        const { email, password } = req.body
            const isAdmin = await admin.findOne({ adminEmail: email })
            console.log(isAdmin)
            if (isAdmin) {
                if (password == isAdmin.password) {
                 
                    req.session.admin = isAdmin.adminEmail;
                   
                    
                   // res.send('hello')
                    res.redirect('/admin/dashboard?message=Admin logged in')

                } else {
                    return res.redirect('/admin?message=Password is Incorrect! Try Again')
                }
            } else {
                return res.redirect(`/admin?message=Admin Details Doesn't exist!`)
            }
    } catch (error) {
        console.log(error.message);
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
},

//admin signout
adminSignout : async (req,res) => {

    try {

        // Destroy only the admin session
       req.session.destroy();
        res.redirect('/admin/signin?message=admin logged out successfully!');
    
    } catch (error) {
        console.log(error.message);
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
},


//render user management page
loadUsersManagement: async (req, res) => {

    try {
        
        const searchQuery = req.query.search
        let adminAlertmsg;
        let usersList = await usersCollection.find({})
        // console.log("userList==========="+usersList)
        
        if (searchQuery || req.query.message) {
            const searchRegex = new RegExp(searchQuery, 'i');
            usersList = usersList.filter(user => searchRegex.test(user.first_name))
            adminAlertmsg = req.query.message; 
        }
     
       res.render('admin/adminCustomers', { usersList , adminAlertmsg, })
    } catch (error) {
        console.log(error.message);
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
},

    //block user
    blockUser: async (req, res) => {
      try {
          const userId = req.params.user;
          if (userId) {
              // Block the user in the database
              await usersCollection.updateOne({ _id: userId }, { $set: { blocked: true } });
              res.redirect('/admin/users-management?message=User blocked')
          } else {
              console.error('Invalid user ID.');
              res.status(400).send('Invalid user ID');
          }
      } catch (error) {
        res.redirect('/admin/users-management?message=Something went wrong!')
      }
  }
  ,
    unblockUser: async (req,res) => {
        try {
            const user = req.params.user
            if(user){
                await usersCollection.updateOne({ _id: user }, { $set: { blocked: false } })
                res.redirect('/admin/users-management?message=user Unblocked')
            }else{
                res.redirect('/admin/users-management?message=Something went wrong!')
            }

        } catch (error) {
            console.log(error.message);
            const statusCode = error.status || 500;
            res.status(statusCode).send(error.message);
        }
    },

// render Category page
loadAdminCategory : async (req, res) => {
    try {
        
        let adminAlertmsg;
     if(req.query.message){
        adminAlertmsg = req.query.message
     }
     if(req.query.cancel){
      req.session.editCategory=false;
     }
      const categoryList = await Category.find({isDeleted:false});
      if (categoryList) {
       
          return res.render('admin/adminCategory', { categories: categoryList, adminAlertmsg  });
        
      }
    } catch (error) {
        console.log(error.message);
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
  },

//load add new category
loadAddNewCategory:  async (req,res) => {
  try {
     
      let adminAlertmsg;
      if(req.query.message){
          adminAlertmsg = req.query.message;
      }
      res.render('admin/addNewCategory',{adminAlertmsg});
  } catch (error) {
      console.log(error.message);
      const statusCode = error.status || 500;
      res.status(statusCode).send(error.message);
  }


},

  //add Category
  addNewCategory: async (req, res) => {
    try {
      const catname = req.body.category;
      if (catname !== '') {
        const exist = await Category.find({ categoryName: catname });
        console.log("exists details", exist);
  
        const isDeleted = exist.some(category => category.isDeleted === true);
        
        if (exist.length === 0) {
          // Category doesn't exist, proceed with creating a new one
          const categoryData = new Category({ categoryName: catname });
          const savedCategory = await categoryData.save();
  
          if (savedCategory) {
            return res.redirect('/admin/category-management?message=Category added');
          } else {
            return res.redirect('/admin/category-management?message=Error saving category');
          }
        } else if (isDeleted) {
          for (const category of exist) {
            await Category.updateOne({ _id: category._id }, { $set: { isDeleted: false } });
          }
         // return res.redirect('/admin/category-management?message=Category already exists in deleted, if you wish you can restore');
         return res.redirect('/admin/category-management?message=Category added');
        } else {
          console.log("Checking is deleted: " + isDeleted);
          return res.redirect('/admin/category-management?message=The category already exists');
        }
      } else {
        return res.redirect(`/admin/category-management?message=The category field can't be null`);
      }
    } catch (error) {
      console.log(error.message);
      const statusCode = error.status || 500;
      res.status(statusCode).send(error.message);
    }
  },
  
loadEditCategory: async (req,res) => {
  try {
     
      let adminAlertmsg;
      let categoryidtoedit;
      if(req.query.message || req.query.id){
          adminAlertmsg = req.query.message;
          categoryidtoedit = req.query.id;
          const catData = await Category.findOne({ _id: categoryidtoedit });
          if (catData) {
            catname = catData.categoryName;
          }
      }
      
      res.render('admin/editCategory',{adminAlertmsg,categoryidtoedit,catname});
  } catch (error) {
      console.log(error.message);
      const statusCode = error.status || 500;
      res.status(statusCode).send(error.message);
  }


},


  editCategory: async (req,res) => {
    const id = req.query.id;
    const updateText = req.body.categoryUpdate;
    try {
      const result = await Category.findOne({ _id: id });
      console.log(result);
      if (result) {
        if (result.categoryName === updateText) {
          return res.redirect('/admin/category-management?message=You entered same name as before, no changes made');
        }
        const exist = await CategoryExist(updateText);
        if (!exist) {
          await Category.findOneAndUpdate(
            { _id: result._id },
            { $set: { categoryName: updateText } }
          );
        } else {
          return res.redirect('/admin/category-management?message=Category already exixts, Please try another name!');
        }
        return res.redirect('/admin/category-management?message=Category edited');
      } else {
        return res.redirect('/admin/category-management?message=error while editing');
      }
     
    } catch (error) {
        console.log(error.message);
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
  },

  //deactivate category
  deactivateCategory: async (req, res) => {
    const id = req.query.id;
    try {
      const result = await Category.findByIdAndUpdate({ _id: id }, { $set: { active: false } });
      if (result) {
        return res.redirect('/admin/category-management?message=Category deactivated');
      } else {
        return res.redirect('/admin/category-management?message=Something went worng, Please try again!');
      }
    } catch (error) {
        console.log(error.message);
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
  },

  activateCategory: async (req, res) => {
    const id = req.query.id;
    try {
      const result = await Category.findByIdAndUpdate({ _id: id }, { $set: { active: true } });
      if (result) {
        return res.redirect('/admin/category-management?message=Category activated');
      } else {
        return res.redirect('/admin/category-management?message=Something went worng, Please try again!');
      }
    } catch (error) {
        console.log(error.message);
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
  },

  //delete category
  deleteCategory: async (req,res) => {
    const id = req.query.id;
    try {
      const result = await Category.updateOne({ _id: id }, { $set: { isDeleted: true } });
      if (result) {
        return res.redirect('/admin/category-management?message=Category deleted');
      } else {
        return res.redirect('/admin/category-management?message=Something went wrong, please try again!');
      }
    } catch (error) {
        console.log(error.message);
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
  },

//render product management

productLoad: async (req, res) => {
    try {
        
        let adminAlertmsg;
        if(req.query.message){
           adminAlertmsg = req.query.message
        }
        const categories = await getCategory();
      const products = await Product.find({isDeleted:false}).sort({ updatedAt: -1 }).populate('category');
      if (products) {

       
            
        res.render('admin/adminProducts', { products, adminAlertmsg, categories,});
        

        
      } else {
        res.redirect('/admin/dashboard?message=Products not found')
      }
    } catch (error) {
      console.log(error.message);
    }
  },

//load add product
loadAddNewProduct: async (req,res) => {
    try {
       
        let adminAlertmsg;
        if(req.query.message){
            adminAlertmsg = req.query.message;
        }
        const categories = await Category.find({
          isDeleted: false,
          active: true
      });

      const productNames = await Product.find({isDeleted: false})
      
        // Extract product names from the productNames array
        const productNamesString = productNames.map(product => product.productname).join(',');

        res.render('admin/addNewProduct', { adminAlertmsg, categories, productNames: productNamesString });
    } catch (error) {
        console.log(error.message);
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }


},


//add products
addNewProduct: async(req,res) => {

try {
    
   

        const productData = new Product({
            productname: req.body.productname,
            price: req.body.price,
            description: req.body.description,
            stock: req.body.stock,
            category:req.body.category,
            mrp: req.body.mrp,
            discount: req.body.discount,
            images: req.files.map(file => ({
              filename: file.filename,
              originalname: file.originalname,
              path: file.path,
            })),

        });
        const product = await productData.save();
        console.log(product);
        return res.status(200).json({ message: 'Product added successfully' });
      
     
     



} catch (error) {
    console.log(error.message);
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
}

},

//render edit product form
loadEditProduct: async (req,res) => {
  try {
     
      let adminAlertmsg;
      let id
      if(req.query.message||req.query.id){
          adminAlertmsg = req.query.message;
          id= req.query.id;
      }
      const editproduct = await Product.findOne({_id: id});
      // console.log("here is edit product"+editproduct)
      const categories = await Category.find({
        isDeleted: false,
        active: true
    });

    const productNames = await Product.find({isDeleted: false})
      
        // Extract product names from the productNames array
        const productNamesString = productNames.map(product => product.productname).join(',');

      res.render('admin/editProduct',{adminAlertmsg,categories,editproduct, productNames: productNamesString});
  } catch (error) {
      console.log(error.message);
      const statusCode = error.status || 500;
      res.status(statusCode).send(error.message);
  }


},

//edit product
editProduct: async (req,res) => {
  try {
    const productId = req.body.productId
    console.log(req.body.images0)
 // Extract product data from request body
 const productData = {
  productname: req.body.productname,
  price: req.body.price,
  description: req.body.description,
  stock: req.body.stock,
  category: req.body.category,
  mrp: req.body.mrp,
  discount: req.body.discount,
 
};
let existingImages = []; // Array to store existing images

// Check if the product has existing images
const existingProduct = await Product.findById(productId);

if (existingProduct && existingProduct.images) {
  // Extract filenames from req.body.images0
  const requestedFilenames = req.body.images0;

  // Filter existing images based on filenames in req.body.images0
  existingImages = existingProduct.images.filter(image =>
    requestedFilenames.includes(image.filename)
  );
}

console.log("exist"+existingImages)
  if (req.files) {
    const newImages = req.files.map((file) => ({
      filename: file.filename,
      originalname: file.originalname,
    }));
    productData.images = [...existingImages, ...newImages];
    } else {
      productData.images = existingImages;
    }

console.log(req.body);
// Update the product in the database (assuming you have the product ID)
const updatedProduct = await Product.findOneAndUpdate(
  { _id: productId },
  { $set: productData },
  { new: true } // This option ensures the updated document is returned
);


return res.status(200).json({ message: 'Product edited successfully' });

  } catch (error) {
    console.log(error.message);
      const statusCode = error.status || 500;
      res.status(statusCode).send(error.message);
  }
},

deleteProduct: async (req,res) => {

  const id = req.query.id;
  try {
    const result = await Product.updateOne({ _id: id }, { $set: { isDeleted: true } });
    if (result) {
      return res.redirect('/admin/products-management?message=Product deleted');
    } else {
      return res.redirect('/admin/products-management?message=Something went wrong, please try again!');
    }
  }  catch (error) {
    console.log(error.message);
      const statusCode = error.status || 500;
      res.status(statusCode).send(error.message);
  }
},

//render order management page
loadOrder: async(req,res) => {
  try {
    const orders = await Order.find({}).sort({ orderDate: -1 });
      return res.render('admin/adminOrders', { orders });
  } catch (error) {
    console.log(error.message);
    const statusCode = error.status || 500;
    res.status(statusCode).send(error.message);
  }
},

editStatus : async (req,res) => {
  try {
    const itemOrderId = req.query.itemOrderId;
    const orderStatus = req.body.newStatus;
    const productId = req.body.productId;
    const orderId = req.body.orderId;
    console.log("itemOrderid",itemOrderId);
    console.log("orderstatus"+orderStatus);
    console.log("productId",productId)
      console.log('orderId body',orderId)

      const status = await Order.findOneAndUpdate(
        { _id: orderId, 'items._id': itemOrderId },
        { $set: { 'items.$.orderStatus': orderStatus } }
      );
      if (!status) {
        // Handle the case where no matching document was found
        console.log("No matching document found");
        return res.status(404).send("No matching document found");
      }
      if (orderStatus == "Delivered") {
        await Product.findOneAndUpdate(
          { _id: productId },
          {
            $inc: { stock: -status.items[0].quantity },
          }
        );
      }
res.redirect('/admin/orders')

  } catch (error) {
    console.log(error.message);
    const statusCode = error.status || 500;
    res.status(statusCode).send(error.message);
  }
},

orderReport: async (req, res) => {
  try {
    req.session.filterDate = false;
    const formatDate = function (date) {
      const day = ('0' + date.getDate()).slice(-2);
      const month = ('0' + (date.getMonth() + 1)).slice(-2);
      const year = date.getFullYear().toString();
      return `${day}-${month}-${year}`;
    };
    const orders = await Order.find({ 'items.orderStatus': 'Delivered' });
    res.render('admin/salesReport', { orders, formatDate });
  } catch (error) {
    console.log(error.message);
  }
},

downloadSales: async(req,res)=> {
  try {
    const orders = await fetchDataForSalesReport();

    // Convert the data to CSV format
    const csvContent = orders.map(order => {
      return order.items.map(item => {
        return [
          item.images,
          item.productname,
          item._id,
          item.quantity,
          item.bill,
          item.orderStatus,
          order.paymentMode,
          formatDate(order.orderDate),
          order.orderBill
        ].join(',');
      }).join('\n');
    }).join('\n');

    // Save the CSV content to a file
    fs.writeFileSync('public/sales_report.csv', csvContent);

    // Respond with the file download
    res.download('public/sales_report.csv');
  res.redirect('/admin/report')
  } catch (error) {
    console.log(error.message);
  }
}

}