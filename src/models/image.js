const mongoose = require('mongoose')
const Product = require('./product.js')

const imageSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Product',
        },
        path: { type: String, required: true },
        name: { type: String, required: true },
        deleted: Boolean,
    },
    {
        toObject: {
            transform: function (doc, ret) {
                delete ret.id
            },
        },
    },
)

const Image = mongoose.model('Image', imageSchema)
module.exports = Image
