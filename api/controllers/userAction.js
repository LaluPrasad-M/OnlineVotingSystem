const mongoose = require('mongoose');
const Candidate = require('../models/candidate'); 
const User = require('../models/user'); 
const jwt = require('jsonwebtoken');


//Handle Get Request to display Candidates
exports.userAction_get_candidates = (req, res, next) => {
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
        res.render("displayCandidates",{Token:"?Token="+req.query.Token,data:response});
        return res.status(200);
    })
    .catch(err =>{
        //Redirect to User Main Page
        res.render('message',{message: "500 Error: "+ err.message});
        return res.status(500);
    });
}

//Handle Get Request for Voting Page
exports.userAction_get_vote = (req, res, next) => {
    Candidate.find()
    .select("cid name position party")
    .exec()
    .then(docs => {;
        //Verify If You have given Vote
        User.findById(req.userData.userId)
        .select("hasGivenVote")
        .exec()
        .then(userdocs => {
            //If Vote not given
            if(userdocs.hasGivenVote == false){
                const response = {
                    candidates: docs.map(doc => {
                        return [doc.cid,doc.name,doc.position,doc.party,doc._id]
                    })
                };
                //Goto To Voting Page
                res.render('vote',{data:response.candidates,Token:req.query.Token});//,{Token:"?Token="+req.query.Token,});
            } else {
                //If Vote Already Given,
                //Display a message to show vote is agready given
                res.render("message",{
                    message:"You Have Already Given your Valuable Vote!\nThank You"
                })
            }
            res.status(200);
        })
    }) 
    .catch(err =>{
        res.render('message',{message: "500 Error: "+ err.message});
        res.status(500);
    });
}

//Handle POST request for Voting
exports.userAction_post_vote = (req, res, next) => {
    //Check if Valid User
    User.findById(req.userData.userId)
    .select("hasGivenVote")
    .exec()
    .then(docs => {
        //Check If Vote Already Given by Voter
        if(docs.hasGivenVote == false){
            //If vote not given,
        
            //Increment Candidate Vote by 1
            Candidate.update({_id:req.body.candidateId},{
                $inc : {
                    votes : 1
                }
            })
            .exec();
            //Update Voter Permission to not access the page again
            User.update({_id:req.userData.userId},{
                $set : {
                    hasGivenVote : true
                }
            })
            .exec();
            //Redirect to User Main Page
            res.redirect("mainpage?Token="+req.query.Token)
        } else {
            //If Vote Already Given,
            //Display a message to show vote is agready given
            res.render("message",{
                message:"You Have Already Given your Valuable Vote!\nThank You"
            })
        }
        res.status(200);
    })
    .catch(err => {
        res.render('message',{message: "500 Error: "+ err.message});
        res.status(500);
    })
}