const multer = require('multer');
const cloudinary = require('cloudinary').v2;

//middleware to upload images

const storage = multer.diskStorage({
    destination: (req,file,cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadImage = upload.single('file');



// is admin logout or not
const notLogged = async (req,res,next) => {
    try {
        if (req.session.admin) {
            res.redirect('/admin/dashboard?message=You are already signed in!'); // User is logged in, redirect with a message
        } else {
            next(); // admin is not logged in, proceed to the next middleware
        }
    } catch (error) {
        
    }
}


//middleware to check admin logged in or not
const loggedIn = async (req,res,next) =>{
    try {
        
        if (req.session.admin) {
            next(); // admin is logged in, proceed to the next middleware
        } else {
            res.redirect('/admin?message=Please login'); // admin is not logged in, redirect to the login page
        }

    } catch (error) {
        console.log(error.message);
    }
}



module.exports = {
    loggedIn,
    notLogged,
    uploadImage
}