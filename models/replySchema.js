const mongoose = require('mongoose')

module.exports = mongoose.Schema({
    text:{
        type:String,
        required:true
    },
    delete_password:{
        type:String,
        required: true
    },
    thread_id:{
        type:mongoose.ObjectId,
        required:true
    } 
})