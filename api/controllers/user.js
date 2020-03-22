const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

//Request to show User Details
exports.user_get_details = (req, res, next) => {
    //decode the token
    const user = jwt.decode(req.query.Token);
    //Find User using emial ID
    User.find({email:user.email})
    .exec()
    .then(user => {
        //If any User Found
        if(user.length >= 1){
                /*photo:'https://kusuma-ovs.herokuapp.com/public/Profiles/'+user[0].photo*/
            res.render('profile',{data:user});
            res.status(200);
        }
        res.redirect('mainpage?Token='+req.query.Token);
        res.status(200);
    })
    //Catch the Error, if occured
    .catch(err =>{
        res.redirect('mainpage?Token='+req.query.Token);
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
                        password: hash,
                        photo: req.body.photo
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
        bcrypt.compare(req.body.password, user[0].password, (err, result) => {
            if(err){
                res.redirect('login?message=Auth%20Failed');
                return res.status(401);
            }
            //if Passowrd is correct
            if(result){
                //Generate a token with the given password
                const token = jwt.sign({
                    email: user[0].email,
                    userId: user[0]._id
                },
                process.env.JWT_KEY,
                {
                    expiresIn: "1h"
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
        });
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