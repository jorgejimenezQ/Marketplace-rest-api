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
        product: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Product',
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
        owner: owner.username
            ? {
                  username: owner.username,
                  image: owner.imagePath.name,
              }
            : owner,
        // messageId: this._id,
        messageGroup: this.messageGroup._id,
        message: this.messageBody,
        dateCreated: this.createdAt,
        isRead: this.isRead,
        // owner: this.owner,
        product: { itemNumber: this.product.itemNumber },
    }
}

// Sanitize the data going out
messageSchema.methods.toJSON = function () {
    const message = this
    const msgObj = message.toObject()

    const result = {}
    result.message = msgObj.messageBody
    result.dateCreated = msgObj.createdAt
    result.isRead = msgObj.isRead

    result.messageGroup = msgObj.messageGroup

    result.owner = {
        username: msgObj.owner.username,
        image: msgObj.owner.imagePath.name,
    }
    result.product = {
        name: msgObj.product.name,
        itemNumber: msgObj.product.itemNumber,
    }
    return result
}

const Message = mongoose.model('Message', messageSchema)
module.exports = Message
