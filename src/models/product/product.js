const validator = require('validator')
const mongoose = require('mongoose')
const User = require('../user/user.js')
const imageSchema = require('../image/image.js')

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
        imagePaths: [
            {
                type: imageSchema,
                required: [true, 'The image array is required'],
            },
        ],
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
    }
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
    result.imagePaths = product.imagePaths.toObject()
    result.name = product.name
    result.condition = product.condition
    result.price = product.price
    result.category = product.category
    result.itemNumber = product.itemNumber
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

/**
 * returns a productBlock
 *  productBlock: {
 *     "user": {
 *         "username": "eptokuct",
 *         "imageUrl": "path/to/placeholder/placeholder.jpg"
 *     },
 *     "imagePaths": [
 *         {
 *             "path": "localhost:3000/public/product-images/",
 *             "name": "generic-image-name-3.png"
 *         },
 *         {
 *             "path": "localhost:3000/public/product-images/",
 *             "name": "generic-image-name-1.png"
 *         },
 *         {
 *             "path": "localhost:3000/public/product-images/",
 *             "name": "generic-image-name-2.png"
 *         }
 *     ],
 *     "name": "black shoes",
 *     "condition": "Very Good",
 *     "price": 99.99,
 *     "category": "Video Games",
 *     "itemNumber": "EN51b9718e",
 *     "description": "I was married in these shoes"
 * }
 */
productSchema.methods.toProductBlock = function (owner) {
    return {
        user: {
            username: owner.username,
            imageUrl: owner.imagePath.url,
        },
        imageUrls: this.imagePaths,
        name: this.name,
        condition: this.condition,
        price: this.price,
        category: this.category,
        itemNumber: this.itemNumber,
        description: this.description,
    }
}

/**
 * Takes an array of products
 * Returns an array of productBlocks

 */
productSchema.statics.toProductBlockArray = async (arr) => {
    const prodBlocks = []
    let owner
    await Promise.all(
        arr.map(async (product) => {
            if (!owner) {
                await product.populate('owner')
                owner = product.owner
            } else if (product.owner !== owner._id) {
                await product.populate('owner')
                owner = product.owner
            }

            prodBlocks.push(product.toProductBlock(product.owner))
        })
    )

    return prodBlocks
}

const Product = mongoose.model('Product', productSchema)
module.exports = Product
