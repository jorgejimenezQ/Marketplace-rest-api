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
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        offerAccepted: { type: Boolean, required: false, default: false },
        dateAccepted: Date,
        dataViewed: Date,
        dateRejected: Date,
        offerViewed: { type: Boolean, required: false, default: false },
        offerRejected: { type: Boolean, required: false, default: false },
    },
    { timestamps: true }
)

// Returns an offer block with the product and the user
offerSchema.methods.toOfferBlock = function (
    product,
    productOwner,
    offerOwner
) {
    const prodBlock = product.toProductBlock(productOwner)
    return {
        product: prodBlock,
        offer: {
            owner: {
                username: offerOwner.username,
                imageUrl: offerOwner.imagePath.url,
            },
            amount: this.offerAmount,
            isViewed: this.offerViewed,
            isRejected: this.offerRejected,
            offerId: this._id,
            isAccepted: this.offerAccepted,
        },
    }
}

// Returns an offer block without the
// product and the user
offerSchema.methods.toOfferBlock = function (offerOwner) {
    return {
        offer: {
            owner: {
                username: offerOwner.username,
                imageUrl: offerOwner.imagePath.url,
            },
            amount: this.offerAmount,
            isViewed: this.offerViewed,
            isRejected: this.offerRejected,
            offerId: this._id,
            isAccepted: this.offerAccepted,
        },
    }
}

const Offer = mongoose.model('Offer', offerSchema)
module.exports = Offer
