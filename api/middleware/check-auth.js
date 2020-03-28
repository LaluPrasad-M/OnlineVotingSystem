const jwt = require('jsonwebtoken');
const User = require('../models/user')
module.exports = (req, res, next) => {
    try{
        const token = req.query.Token;
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        req.userData = decoded;
        User.findById(req.userData.userId)
        .exec()
        .then(result => {
            if(result.length <= 0){
                res.redirect("/login");
                res.status("401");
            }
            next();
        })
        .catch(err => {
            res.redirect("/");
            return res.status(401);
        })
    }catch (error){
        res.redirect('/');
        return res.status(401);
    }
}
