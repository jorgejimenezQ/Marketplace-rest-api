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
        body: {
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
        parent: {
            type: mongoose.Schema.Types.ObjectId,
            require: false,
            ref: 'messageSchema',
        },
    },
    { timestamps: true },
)

const Message = mongoose.model('Message', messageSchema)
module.exports = Message
