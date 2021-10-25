const validator = require('validator')
const mongoose = require('mongoose')
const Message = require('../message/message.js')
const Product = require('../product/product.js')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const imageSchema = require('../image/image.js')

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        emailIsVerified: { type: Boolean, default: false },
        imagePath: { type: imageSchema, required: false },
        password: {
            type: String,
            required: true,
        },
        deleted: { type: Boolean, default: false },
        dateDeleted: Date,
        profileImage: Buffer,
        tokens: [
            {
                token: { type: String, required: true },
            },
        ],
    },

    {
        timestamps: true,
        // Should we include virtuals by default or as needed
        // toJSON: { virtuals: true },
        // toObject: { virtuals: true },
    },
)

// A virtual field that creates a user-product relationship
// A user has many products. Product have one user
userSchema.virtual('products', {
    ref: 'Product',
    localField: '_id',
    foreignField: 'owner',
})

// The user --< message relationship
// A user has many messages
userSchema.virtual('messages', {
    ref: 'Message',
    localField: '_id',
    foreignField: 'owner',
})

// Sanatize data before converting to JSON
// Only return the username and email
userSchema.methods.toJSON = function () {
    const user = this.toObject()

    delete user.password
    delete user.createdAt
    delete user.updatedAt
    delete user._id
    delete user.tokens
    delete user.__v
    delete user.email
    delete user.emailIsVerified
    delete user.deleted
    delete user.dateDeleted

    // if (!user.imagePath) {
    //     user.imagePath = {
    //         path: USER_PLACEHOLDER_PATH,
    //         name: USER_PLACEHOLDER_NAME,
    //     }
    // }

    return user
}

// Returns the following user information:
// - username
// - images
// - product
//     * A product's image
//     * product's itemRef
userSchema.methods.createProfile = async function () {
    const user = this // "this" refers to the document

    // Populate the user's products
    await user.populate([
        {
            path: 'products',
            select: [
                'itemNumber',
                'description',
                'name',
                'price',
                'imagePaths',
            ],
        },
    ])

    const prof = {
        username: user.username,
        image: user.imagePath,
        products: user.products,
    }

    return prof
}

userSchema.methods.removeToken = async function (tokeId) {}

// Generates and returns a JSON Token
userSchema.methods.generateToken = async function () {
    // "this" refers to the document
    // Use the doc to create a token
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)

    // Save the token to the database and return it
    user.tokens = user.tokens.concat({ token })
    await user.save()

    return token
}

// Get an existing user using email and password
userSchema.statics.getAccount = async (email, password) => {
    // Get the user by email
    // Check if we found a user with that email
    const user = await User.findOne({ email })
    if (!user) throw new Error('Unable to login')

    // Compare the password with the hashed password
    // If compare fails throw error
    const isValidPass = await bcrypt.compare(password, user.password)
    if (!isValidPass) throw new Error('Unable to login')

    // Return the user
    return user
}

// Will hash the password whenever it is being updated. According to "https://mongoosejs.com/docs/middleware.html" using Model will not
// run the pre method. It has to be used with the document -–The instance of the Model.
userSchema.pre('save', async function (next) {
    const user = this
    if (user.isModified('password')) {
        user.password = await bcrypt.hashSync(user.password, 8)
    }

    if (!user.imagePath) {
        user.imagePath = {
            path: process.env.USER_PLACEHOLDER_PATH,
            name: process.env.USER_PLACEHOLDER_NAME,
        }
    }

    next()
})

const User = new mongoose.model('User', userSchema)

module.exports = User
