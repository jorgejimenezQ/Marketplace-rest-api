const validator = require('validator')
const mongoose = require('mongoose')
const User = require('./user.js')
const Image = require('./image.js')

// ========================================
// Image schema:
// Will be used as a subdocument for the
// product schema
// ========================================
const imageSchema = new mongoose.Schema(
    {
        path: { type: String, required: true },
        name: { type: String, required: true },
        deleted: Boolean,
    },
    {
        toObject: {
            transform: (doc, ret) => {
                delete ret._id
            },
        },
    },
)

imageSchema.methods.toJSON = function () {
    const image = this
    const imageObj = image.toObject()

    delete imageObj._id

    return imageObj
}

// =============================
// P R O D U C T    S C H E M A
// =============================
const productSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        itemNumber: {
            type: String,
            unique: true,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        imageURLs: [imageSchema],
        name: {
            type: String,
            required: true,
            lowercase: true,
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
        // The fields below are initially set to default value or not set
        sold: {
            type: Boolean,
            required: false,
            default: false,
        },
        dateSold: Date,
        removed: {
            // When a product gets removed, we just set this to true
            type: Boolean,
            required: false,
            default: false,
        },
        dateRemoved: Date,
    },
    {
        timestamps: true,
    },
)

// Create product-offer relationship
productSchema.virtual('offers', {
    ref: 'Offer',
    localField: '_id',
    foreignField: 'product',
})

productSchema.virtual('images', {
    ref: 'Image',
    localField: '_id',
    foreignField: 'product',
})

// Sanitize data going out
// Note: this refers to the document i.e., an
// instance of the model
productSchema.methods.toJSON = function () {
    const product = this
    const prodObject = product.toObject()
    const result = {}

    result.owner = product.owner.username
    result.images = product.imageURLs.toObject()
    result.name = product.name
    result.condition = product.condition
    result.price = product.price
    result.category = product.category
    result.itmeNumber = product.itmeNumber
    result.description = product.description

    return result
}

// Generate item number for the product
productSchema.methods.generateItemNumber = function () {
    const product = this
    const prefix = product._id.toString().slice(-8)
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const alpha =
        characters.charAt(Math.floor(Math.random() * characters.length)) +
        characters.charAt(Math.floor(Math.random() * characters.length))

    return alpha.concat(prefix)
}

const Product = mongoose.model('Product', productSchema)
module.exports = Product
