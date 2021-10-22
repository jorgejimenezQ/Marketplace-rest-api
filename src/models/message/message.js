const validator = require('validator')
const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        messageBody: {
            type: String,
            require: true,
            validate(value) {
                if (value.length > 700)
                    throw new Error(
                        'The message must be less then 700 characters',
                    )
            },
        },
        isRead: {
            type: Boolean,
            default: false,
            required: false,
        },
        dateRead: Date,
        parent: {
            type: mongoose.Schema.Types.ObjectId,
            require: false,
            ref: 'messageSchema',
        },
        messageGroup: {
            type: mongoose.Schema.Types.ObjectId,
            require: true,
            ref: 'MessageGroup',
        },
        deleted: Boolean,
        dateDeleted: Date,
    },
    { timestamps: true },
)

messageSchema.methods.toMessage = function (message, owner, recipient) {
    return {
        from: owner.username,
        to: recipient.username,
        message: message.messageBody,
        date: message.createdAt,
        messageId: message._id,
        conversation: message.messageGroup._id,
    }
}
// Sanitize the data going out
messageSchema.methods.toJSON = function () {
    const message = this
    const msgObj = message.toObject()

    const result = {}
    result.messageBody = msgObj.messageBody
    result.dateCreated = msgObj.createdAt

    return result
}

const Message = mongoose.model('Message', messageSchema)
module.exports = Message
