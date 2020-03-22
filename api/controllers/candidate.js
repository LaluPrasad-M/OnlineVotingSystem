const mongoose = require('mongoose');
const Candidate = require('../models/candidate'); 

//Handle GET request to Add Candidate by Admin
exports.candidate_get_add = (req,res) => {
    //Find all Candidates list to display
    Candidate.find()
    .select("cid name position party")
    .exec()
    .then(docs => {
        const response = {
            candidates: docs.map(doc => {
                return [doc.cid,doc.name,doc.position,doc.party]
            })
        };
        //Render the page to Add and Display Candidates
        res.render("candidateAdd",{Token:"?Token="+req.query.Token,message:"",data:response});
    }) 
    //If any Error Occured
    .catch(err =>{
        //Render the page to Add and Display Candidates, along with Error Message
        res.render('candidateAdd',{Token:"?Token="+req.query.Token,message: err,data:response});
        res.status(500);
    });
}

//Handle POST request to add Candidates
exports.candidate_post_add = (req,res) => {
    //Find all Candidates list to display
    Candidate.find()
    .select("cid name position party")
    .exec()
    .then(docs => {
        const response = {
            candidates: docs.map(doc => {
                return [doc.cid,doc.name,doc.position,doc.party]
            })
        };
        //Find candidates with particular position and party
        Candidate.find({position:req.body.position,party:req.body.party})
        .exec()
        .then(candidate => {
            //If candidate Found
            if(candidate.length >= 1){
                //Render the page to Add and Display Candidates and Error Message
                res.render('candidateAdd',{Token:"?Token="+req.query.Token,message: "Position already filled",data:response});
                return res.status(409);
            } else {
                //Create a new Customer
                const candidate = new Candidate({
                    _id: new mongoose.Types.ObjectId(),
                    name: req.body.name,
                    position: req.body.position,
                    cid: new Date().getTime()%10000000000,
                    party: req.body.party,
                });
                //Save Customer To MongoDb
                candidate.save()
                .then(result => {
                    response.candidates.push([candidate.cid, candidate.name,candidate.position,candidate.party]);
                    //Render the page to Add and Display Candidates
                    res.render('candidateAdd',{Token:"?Token="+req.query.Token,message: "Candidate Updated",data:response});
                    res.status(201);
                })
                .catch(err => {
                    //Render the page to Add and Display Candidates
                    res.render('candidateAdd',{Token:"?Token="+req.query.Token,message: err,data:response});
                    res.status(500);
                });
            }
        });
    }) 
    .catch(err =>{
        //Render the page to Add and Display Candidates
        res.render('candidateAdd',{Token:"?Token="+req.query.Token,message: err,data:response});
        res.status(500);
    });
}

exports.candidate_get_delete1 = (req,res) => {

    Candidate.find()
    .select("cid name position party")
    .exec()
    .then(docs => {
        const response = {
            candidates: docs.map(doc => {
                return [doc.cid,doc.name,doc.position,doc.party]
            })
        };
        res.render("candidateDelete1",{Token:"?Token="+req.query.Token,message:"",data:response});
    }) 
    .catch(err =>{
        res.render('candidateDelete1',{Token:"?Token="+req.query.Token,message: err,data:response});
        res.status(500);
    });
}

exports.candidate_post_delete1 = (req, res) => {
    Candidate.find()
    .select("cid name position party")
    .exec()
    .then(docs => {
        const response = {
            candidates: docs.map(doc => {
                return [doc.cid,doc.name,doc.position,doc.party]
            })
        };
        const response1 = [];
        response.candidates.forEach(function(doc){
            if(req.body.party === doc[3]){
                response1.push(doc[2]);
            }
        });
           
        res.render("candidateDelete2",{Token:"?Token="+req.query.Token,data:response,entry:[req.body.party,response1]});
        res.status(200);
    }) 
    .catch(err =>{
        res.render('candidateAdd',{Token:"?Token="+req.query.Token,data:response});
        res.status(500);
    });
}

exports.candidate_get_delete2 = (req,res) => {
    Candidate.find({name:req.body.name})
    .select("cid name position party")
    .exec()
    .then(docs => {
        const response = {
            candidates: docs.map(doc => {
                return [doc.cid,doc.name,doc.position,doc.party]
            })
        };
        res.render("candidateDelete2",{Token:"?Token="+req.query.Token,data:response,entry:[req.body.party,response.candidates]});
    }) 
    .catch(err =>{
        res.render('candidateDelete2',{Token:"?Token="+req.query.Token,data:response,entry:[req.body.party,response.candidates]});
        res.status(500);
    });
}

exports.candidate_post_delete2 = (req, res) => {
    Candidate.remove({position:req.body.position,party:req.body.party})
    .exec()
    .then(result => {
        Candidate.find()
        .select("cid name position party")
        .exec()
        .then(docs => {
            const response = {
                candidates: docs.map(doc => {
                    return [doc.cid,doc.name,doc.position,doc.party]
                })
            };
            res.render('candidateDelete1',{Token:"?Token="+req.query.Token,message:{position:req.body.position, party:req.body.party}, data:response});
            res.status(200);
        })
    })
    .catch(err => {
        res.render("candidateDelete1",{Token:"?Token="+req.query.Token,message:err,data:response1});
        res.status(500);
    });  
}

//Handle Get Request to display Candidates votes
exports.display_votes = (req, res) => {
    console.log("Hello")
    Candidate.find()
    .select("cid name position party votes")
    .exec()
    .then(docs => {
        const response = {
            candidates: docs.map(doc => {
                return [doc.cid,doc.name,doc.position,doc.party,doc.votes]
            })
        };
        //Go to Candidate Add Page
        res.render("displayVotes",{Token:"?Token="+req.query.Token,data:response});
        return res.status(200);
    })
    .catch(err =>{
        console.log(err);
        //Redirect to User Main Page
        res.redirect("mainpage?Token="+req.query.Token);
        return res.status(500);
    });
}
