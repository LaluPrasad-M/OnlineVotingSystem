const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const rp = require('request-promise');

/*
    //Instagram userdata
    rp("https://www.instagram.com/"+ username + "?__a=1")
    .then(function(instagramData){
        //success!
        instagramData = JSON.parse(instagramData)
        image = instagramData['graphql']['user']['profile_pic_url_hd'];
        console.log(image)
        return image;
    })
    .catch(function(err){
        //handle error
    });
*/
exports.setprofile = (req, res, next) => {
    username = req.query.username;
    rp("https://www.instagram.com/"+ username + "?__a=1")
    .then(function(instagramData){
        //success!
        instagramData = JSON.parse(instagramData)
        image = instagramData['graphql']['user']['profile_pic_url_hd'];
         //Update Voter Profile Picture
         User.update({_id:req.userData.userId},{
            $set : {
                photo : image
            }
        })
        .exec();
        res.redirect('profile?Token='+req.query.Token);
    })
}

exports.search_user_name = (req, res, next) => {
    //url = 'https://www.instagram.com/web/search/topsearch/?context=user&count=1&query=' + req.body.photo
    res.render('searchInstagramProfilePhoto',{Token:req.query.Token,profiles:"",search_user_name:''});
    res.status(200)
}


exports.search_result_user_name = (req, res, next) => {
    url = 'https://www.instagram.com/web/search/topsearch/?context=user&count=0&query=' + req.body.username
    rp(url)
    .then(instagramData =>{
        //success!
        instagramData = JSON.parse(instagramData)
        console.log(instagramData['users'].length);

        if(instagramData['users'].length>0){
            profiles = instagramData['users']
            console.log(profiles[0]['user']['username'])
            res.render('searchInstagramProfilePhoto',{Token:req.query.Token,search_user_name:req.body.username});
            res.status(200)
        } else {
            res.render('searchInstagramProfilePhoto',{Token:req.query.Token,profiles:"",search_user_name:req.body.username});
            res.status(200)
        }
    })
    .catch(err =>{
        //handle error
        console.log(err);
        res.status(500).JSON({err:err});
    });
}

//Request to show User Details
exports.user_get_details = (req, res, next) => {
    //Find User using emial ID
    User.find({email:req.userData.email})
    .exec()
    .then(user => {
        //If any User Found
        if(user.length >= 1){ 
            res.render('profile',{data:user});
            res.status(200);
        }
        else{
            res.render('message',{message: "400 Error: Bad Request"});
            res.status(400);
        }
    })
    //Catch the Error, if occured
    .catch(err =>{
        res.render('message',{message: "500 Error: "+ err.message});
        res.status(500); 
    });
}

//Request to show User SignUp Page
exports.user_get_signup = (req,res) => {
    //Render the page to Web
    res.render('signup',{message:""});
}

//Handle Post Requests for User SignUp
exports.user_post_signup = (req, res, next) => {
    //Find User Using email Id
    User.find({email: req.body.email})
    .exec()
    .then(user =>{
        //If any User Found
        if(user.length >= 1){
            res.redirect('signup?message=Email%20Exists');
            return res.status(409);
        } else {
            //If no User with the email Id found,
            //Hash the Password
            bcrypt.hash(req.body.password, 10, (err, hash) => {
                if(err){
                    res.redirect('signup?message='+err);
                    return res.status(500);
                } else {
                    //Create a User using provided data
                    const user = new User({
                        _id: new mongoose.Types.ObjectId(),
                        fname: req.body.fname,
                        lname:req.body.lname,
                        gender:req.body.gender,
                        dob:req.body.dob,
                        email: req.body.email,
                        address:req.body.address,
                        city:req.body.city,
                        state:req.body.state,
                        pincode:req.body.pincode,
                        photo:'../public/Profiles/no_profile_set.jpg',
                        password: req.body.password,//hash,
                    });
                    //Save To Mongo
                    user.save()
                    .then(result => {
                        //Go To login Page
                        res.redirect("login?email="+result.email+"&message=User%20Created")
                        //res.render('login',{email: result.email,message:"User Created"});
                        res.status(200);
                    })
                    //If any Error Occured,
                    .catch(err => {
                        //Remain in the Same Page
                        res.redirect('signup?message='+err);
                        res.status(500);
                    });
                }
            });
            }
    })
}

//Request to show User login Page
exports.user_get_login = (req,res) => {
    res.render('login');
}

//Handle POST request for User Login
exports.user_post_login = (req, res, next) => {
    //search for User with Given Data
    User.find({email: req.body.email})
    .exec()
    .then(user => {
        //If User not Found
        if(user.length <1){
            //Remain in Same page
            res.redirect('login?message=Auth%20Failed');
            return res.status(401);
        }
        //If any User Found,
        //Check for password
        /*bcrypt.compare(req.body.password, user[0].password, (err, result) => {
            if(err){
                res.redirect('login?message=Auth%20Failed');
                return res.status(401);
            }
            //if Passowrd is correct
            if(result){
                */
            if(user[0].password == req.body.password){
                //Generate a token with the given password
                const token = jwt.sign({
                    email: user[0].email,
                    userId: user[0]._id
                },
                process.env.JWT_KEY,
                {
                    algorithm: 'HS384',
                    expiresIn: 900
                }
                );                
                //Go to User Main Page
                res.redirect("mainpage?Token="+token);
                return res.status(200);
            } else {
                //If Wrong Password
                res.redirect('login?message=Auth%20Failed');
                res.status(401);
            }
        //});
    })
    .catch(err => {
        //If Error Accesing Data Base
        res.redirect('login?message='+err);
        res.status(500);
    });
    
}


//Request to show User Main Page
exports.user_get_mainpage = (req, res, next) =>{
    res.render('User_mainpage');
}