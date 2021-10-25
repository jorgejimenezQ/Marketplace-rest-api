const validator = require('validator')
const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema(
    {
        owner: {
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
                        'The message must be less then 700 characters'
                    )
            },
        },
        isRead: {
            type: Boolean,
            default: false,
            required: false,
        },
        dateRead: Date,
        messageGroup: {
            type: mongoose.Schema.Types.ObjectId,
            require: true,
            ref: 'MessageGroup',
        },
        deleted: Boolean,
        dateDeleted: Date,
    },
    { timestamps: true }
)

messageSchema.methods.toMessageBlock = function (owner) {
    return {
        user: {
            username: owner.username,
            imageUrl: owner.imagePath.url,
        },
        message: this.messageBody,
        date: this.createdAt,
        messageId: this._id,
        messageGroup: this.messageGroup._id,
    }
}

// Sanitize the data going out
messageSchema.methods.toJSON = function () {
    const message = this
    const msgObj = message.toObject()

    const result = {}
    result.message = msgObj.messageBody
    result.dateCreated = msgObj.createdAt

    return result
}

const Message = mongoose.model('Message', messageSchema)
module.exports = Message
