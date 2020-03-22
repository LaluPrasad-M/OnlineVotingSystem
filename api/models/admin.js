const mongoose = require('mongoose');

const AdminSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    fname: {type : String, required: true},
    lname: {type : String},
    gender: {type : String, required: true},
    dob: {type : Date, required: true},
    email: {type : String, required: true, unique: true,
         match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
        },
    address: {type : String, required: true},
    city: {type : String, required: true},
    state: {type : String, required: true},
    pincode: {type : String, required: true},
    password: {type : String, required: true},
    photo: {type: String},
});

module.exports = mongoose.model('Admin', AdminSchema);