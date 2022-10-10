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
    product: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Product',
    },
    deleted: { type: Boolean, default: false },
    dateDeleted: Date,
})

schema.methods.toConvBlock = function (otherUser) {
    const conversation = this
    return {
        user: conversation.user,
        otherUser: conversation.otherUser,
        messageGroup: conversation.messageGroup,
        product: conversation.product,
        conversationId: conversation._id,
    }
}

schema.statics.createUserConversation = async (
    user1Id,
    user2Id,
    productId,
    groupId
) => {
    // Create one userConversations for each
    // user and save them
    const userConv1 = new UserConversation({
        user: user1Id,
        otherUser: user2Id,
        messageGroup: groupId,
        product: productId,
    })
    const userConv2 = new UserConversation({
        user: user2Id,
        otherUser: user1Id,
        messageGroup: groupId,
        product: productId,
    })

    // Save the userConversations
    await userConv1.save()
    await userConv2.save()

    if (!userConv1 || !userConv2) throw new Error('Something Went Wrong')
    return userConv1
}

const UserConversation = mongoose.model('UserConversation', schema)
module.exports = UserConversation
