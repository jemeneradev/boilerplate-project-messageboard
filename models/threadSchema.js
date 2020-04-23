const mongoose = require('mongoose')
const replySchema = require('../models/replySchema.js')

module.exports = new mongoose.Schema({
    board:{
        type:String,
        required: true
    },
    text:{
        type:String,
        required: true
    },
    created_on:{
        type:Date,
        default: Date.now()
    },
    bumped_on:{
        type:Date,
        default: Date.now()
    },
    reported:{
        type:Boolean,
        default: false
    }, 
    delete_password:{
        type:String,
        required: true
    },
    replies:{
        type:[replySchema]
    }
});