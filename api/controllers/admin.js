const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/admin'); 
const Candidate = require('../models/candidate'); 

//Request to show Admin Details
exports.admin_get_details = (req, res, next) => {
    //decode the token
    const admin = jwt.decode(req.query.Token);
    //Find Admin using email ID
    Admin.find({email:admin.email})
    .exec()
    .then(admin => {
        //If any Admin user Found
        if(admin.length >= 1){
                /*photo:'https://kusuma-ovs.herokuapp.com/public/Profiles/'+user[0].photo*/
            res.render('adminProfile',{data:admin});
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

//Request to show Admin SignUp Page
exports.admin_get_signup = (req,res) => {
    //Render the page to Web
    res.render('adminsignup',{message:""});
}

//Handle Post Requests for Admin SignUp
exports.admin_post_signup = (req, res, next) => {
    //Find Admin Using email Id
    Admin.find({email: req.body.email})
    .exec()
    .then(admin =>{
        //If any Admin Found
        if(admin.length >= 1){
            res.redirect('signup?message=Email%20Exists');
            return res.status(409);
        } else {
            //If no Admin with the email Id found,
            //Hash the Password
            bcrypt.hash(req.body.password, 10, (err, hash) => {
                if(err){
                    res.redirect('signup?message='+err);
                    return res.status(500);
                } else {
                    //Create a Admin using provided data
                    const admin = new Admin({
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
                    admin.save()
                    .then(result => {
                        //Go To login Page
                        res.redirect("login?email="+result.email+"&message=User%20Created")
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

//Request to show Admin login Page
exports.admin_get_login = (req,res) => {
    res.render('adminlogin');
}

//Handle POST request for Admin Login
exports.admin_post_login =  (req, res, next) => {
    //search for Admin with Given Data
    Admin.find({email: req.body.email})
    .exec()
    .then(user => {
        //If Admin not Found
        if(user.length <1){
            //Remain in Same page
            res.redirect('login?message=Auth%20Failed');
            return res.status(401);
        }
        //If any Admin Found,
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
                });                
                //Get all the Candidates list
                Candidate.find()
                .select("cid name position party")
                .exec()
                .then(docs => {
                    const response = {
                        candidates: docs.map(doc => {
                            return [doc.cid,doc.name,doc.position,doc.party]
                        })
                    };
                    //Go to Candidate Add Page
                    res.render("candidateAdd",{Token:"?Token="+token,message:"",data:response});
                    return res.status(200);
                })
                .catch(err =>{
                    res.render('candidateAdd',{Token:"?Token="+token,message: err,data:response});
                    return res.status(500);
                });
            } else {
                //If Wrong Password
                res.redirect('login?message=Auth%20Failed');
                return res.status(401);
            }
        });
    })
    .catch(err => {
        //If Error Accesing Data Base
        res.redirect('login?message='+err);
        res.status(500);
    });
    
}