const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try{
        const token = req.query.Token
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        req.userData = decoded;
        next();
    }catch (error){

        res.render('main');
        return res.status(401);
    }
}
