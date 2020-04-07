const express = require('express');
const router = express.Router();
const multer = require('multer');
const checkAuth = require('../middleware/check-auth');

const UserController = require("../controllers/user");
const UserActionController = require("../controllers/userAction");

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, './api/public/Profiles/');
    },
    filename: function(req, file, cb){
        cb(null,(new Date()).getTime() + file.originalname);
    }
});
const fileFilter = (req, file, cb) =>{
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
        cb(null, true); //Save the file
    } else {
        cb(null, false); // Reject the file
    }
};
const upload = multer({storage: storage,limits: {
    fileSize: 1024 * 1024 *10 
    },
    fileFilter: fileFilter
});


router.get('/signup',UserController.user_get_signup);

router.post('/signup',upload.single('photo'), UserController.user_post_signup);

router.get('/login',UserController.user_get_login);

router.post('/login',UserController.user_post_login);

router.get("/mainpage",checkAuth, UserController.user_get_mainpage);

router.get('/displayCandidates',checkAuth, UserActionController.userAction_get_candidates);

router.get('/userAction',checkAuth, UserActionController.userAction_get_vote);

router.post('/userAction',checkAuth, UserActionController.userAction_post_vote);

router.get('/profile',checkAuth, UserController.user_get_details);

router.get('/editprofilephoto',checkAuth, UserController.search_user_name);

router.post('/editprofilephoto',checkAuth, UserController.search_result_user_name);

router.get('/setprofile',checkAuth, UserController.setprofile);

module.exports = router;