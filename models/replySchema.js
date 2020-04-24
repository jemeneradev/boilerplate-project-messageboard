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
    },
    created_on:{
        type:Date,
        default: Date.now()
    },
    reported:{
        type:Boolean,
        default: false
    }
})