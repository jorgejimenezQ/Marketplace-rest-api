const validator = require('validator')
const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    otherUser: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },

    messageGroup: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        ref: 'MessageGroup',
    },
    deleted: Boolean,
    datedeleted: Date,
})

schema.methods.toConvBlock = function (user1, user2) {
    return {
        users: [
            {
                username: user1.username,
                imageUrl: user1.imagePath.url,
            },
            {
                username: user2.username,
                imageUrl: user2.imagePath.url,
            },
        ],
        conversationId: this._id,
    }
}

const UserConversation = mongoose.model('UserConversation', schema)
module.exports = UserConversation
