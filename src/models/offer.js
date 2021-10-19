const validator = require('validator')
const mongoose = require('mongoose')

const offerSchema = new mongoose.Schema(
    {
        offerAmount: {
            type: Number,
            required: true,
        },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Product',
            unique: false,
        },
        buyer: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        offerAccepted: { type: Boolean, required: false, default: false },
        offerViewed: { type: Boolean, required: false, default: false },
        offerRejected: { type: Boolean, required: false, default: false },
        // message: {
        //     type: String,
        //     required: true,
        //     validate(value) {
        //         if (value.length > 250)
        //             throw Error(
        //                 'An offer message can only be up to 250 characters',
        //             )
        //     },
        // },
    },
    { timestamps: true },
)

const Offer = mongoose.model('Offer', offerSchema)
module.exports = Offer
