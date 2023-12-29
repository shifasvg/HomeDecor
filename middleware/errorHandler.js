// module.exports = {
//     errorHandler: function (err, req, res, next) {
//         // set locals, only providing error in development
//         res.locals.message = err.message;
//         res.locals.error = req.app.get('env') === 'development' ? err : {};
//         console.log(err);
//         // render the error page
//         const errStatus=err.status || 500
//         const errMessage=err.message
//         // res.render('users/error', { errStatus,errMessage });
//         res.send('someerror')
//     },
//     err404handle: function (req, res, next) {
//         next();
//     }

// }

//not found
const err404handle = (req,res,next)=>{
    const error = new Error(`Not Found: ${req.originalUrl}`)
    res.status(404);
    console.log(error.message)
    next(error);
};

// Error Handler

const errorHandler = (err,req,res,next)=>{
    const statusCode =res.statusCode == 200? 500: res.statusCode;
    console.log("statuscode ="+statusCode)
    res.status(statusCode);
    if (req.originalUrl.startsWith('/admin')) {return res.render('admin/adminErrorPage')}
    else{
        if(req.session.user && req.session.userData){
            let user = req.session.user;
            let userData = req.session.userData;
            res.render('users/error', { error: err.message , user, userData}); 
        }else{
            res.render('users/error', { error: err.message }); 
        }
        
    }
    
}

module.exports = { errorHandler, err404handle};