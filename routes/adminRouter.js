const express = require('express');
const controller = require('../controllers/admin/adminController');
const middle = require('../middleware/adminMiddleware');
const upload = require('../middleware/multer');
const couponController = require('../controllers/admin/couponController');
const router = express.Router();

//admin signin
router.get(['/', '/signin'], middle.notLogged, controller.loadAdminSignIn);
router.post('/signin', middle.notLogged, controller.postAdminSignin);

//admin dashboard
router.get('/dashboard', controller.loadAdminDashboard);

//admin user management
router.get('/users-management', middle.loggedIn, controller.loadUsersManagement);
router.patch('/users-management/block-user/:user', middle.loggedIn, controller.blockUser);
router.patch('/users-management/unblock-user/:user', middle.loggedIn, controller.unblockUser);

//admin cateogry management
router.get('/category-management', middle.loggedIn, controller.loadAdminCategory);
router.get('/category-management/add-new-category',controller.loadAddNewCategory)
router.post('/category-management/add-new-category', middle.loggedIn, controller.addNewCategory);
router.get('/category-management/edit-category',controller.loadEditCategory)
router.post('/category-management/edit-category',controller.editCategory)

router.get('/category-management/deactivate', middle.loggedIn, controller.deactivateCategory);
router.get('/category-management/activate', middle.loggedIn, controller.activateCategory);
router.get('/category-management/delete', middle.loggedIn, controller.deleteCategory);

//admin product management
router.get('/products-management', controller.productLoad);

router.get('/products-management/add-new-product', controller.loadAddNewProduct);
router.post('/products-management/add-new-product', upload.array('images'), controller.addNewProduct);

router.get('/products-management/edit-product',controller.loadEditProduct);
router.post('/products-management/edit-product', upload.array('images'), controller.editProduct);
router.get('/products-management/delete', controller.deleteProduct)
// router.get('/products-management/edit', controller.productEdit);
// router.post('/products-management/update',controller.productupdate)

//Order management
router.get('/orders',controller.loadOrder);
router.post('/editStatus',controller.editStatus);

//sales report
router.get('/report',controller.orderReport);
router.get('/download-sales-report',controller.downloadSales)
//coupon management
router.get('/coupon-management',couponController.loadCoupon);
router.post('/add-coupon',couponController.addCoupon);
router.get('/add-coupon-page',couponController.loadAddCoupon);
router.get('/edit-coupon-page',couponController.loadEditcoupon);
router.post('/edit-coupon',couponController.editCoupon);
router.get('/coupon-Deactivate',couponController.couponDeactivate);
router.get('/coupon-Activate',couponController.couponActivate);
//admin signout
router.get('/signout',controller.adminSignout);


module.exports = router;