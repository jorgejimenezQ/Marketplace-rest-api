const validator = require('validator')
const mongoose = require('mongoose')

const productSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        itemRef: {
            type: String,
            unique: true,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        imageUris: [
            {
                uri: { type: String, required: false },
            },
        ],
        images: [
            {
                image: { type: Buffer, required: false },
            },
        ],
        name: {
            type: String,
            required: true,
        },
        condition: {
            type: String,
            required: true,
            //TODO:  validate - with condition enum values
        },
        price: {
            type: Number,
            required: true,
        },
        category: {
            type: String,
            required: true,
        },
    },
    { timestamps: true },
)

productSchema.virtual('offers', {
    ref: 'Offer',
    localField: '_id',
    foreignField: 'product',
})

const Product = mongoose.model('Product', productSchema)
module.exports = Product
