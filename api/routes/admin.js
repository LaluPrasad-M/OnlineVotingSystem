const express = require('express');
const router = express.Router();
const multer = require('multer');
const checkAuth = require('../middleware/check-admin-auth');

const AdminController = require("../controllers/admin");
const CandidateController = require("../controllers/candidate");


const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, './api/public/Profiles/');
    },
    filename: function(req, file, cb){
        cb(null,(new Date()).getTime() + file.originalname);
    }
});
//File validation
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


router.get('/signup',AdminController.admin_get_signup);

router.post('/signup',upload.single('photo'), AdminController.admin_post_signup);

router.get('/login',AdminController.admin_get_login);

router.post('/login',AdminController.admin_post_login);

router.get('/profile',checkAuth,AdminController.admin_get_details);


router.get('/addCandidate',checkAuth, CandidateController.candidate_get_add);

router.post('/addCandidate', checkAuth, CandidateController.candidate_post_add);

router.get('/deleteCandidate',checkAuth, CandidateController.candidate_get_delete1);

router.post('/deleteCandidate', checkAuth, CandidateController.candidate_post_delete1);

router.get('/deleteCandidate1',checkAuth, CandidateController.candidate_get_delete2);

router.post('/deleteCandidate1', checkAuth, CandidateController.candidate_post_delete2);

router.get('/displayVotes', checkAuth, CandidateController.display_votes);

module.exports = router;
