const mongoose = require('mongoose')


const threadSchema = require('../models/threadSchema')

module.exports = mongoose.model('Thread',threadSchema);