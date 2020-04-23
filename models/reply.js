const mongoose = require('mongoose')

const replySchema = require('../models/replySchema')

module.exports = mongoose.model('Reply',replySchema);
