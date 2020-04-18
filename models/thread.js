const mongoose = require('mongoose')
var repliesSchema = mongoose.Schema({
    thread_id:{
        type:mongoose.ObjectId,
        required:true
    }
})

var threadSchema = new mongoose.Schema({
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
        type:[repliesSchema]
    }
});

module.exports = mongoose.model('Thread',threadSchema);