const validator = require('validator')
const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    messageGroup: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        ref: 'MessageGroup',
    },
})

const UserConversation = mongoose.model('UserConversation', schema)
module.exports = UserConversation
