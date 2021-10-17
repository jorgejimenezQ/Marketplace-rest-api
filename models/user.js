const validator = require('validator')
const mongoose = require('mongoose')
const Message = require('./message.js')
const Product = require('./product.js')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { description } = require('commander')

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
        imageUrl: { type: String, required: false },
        password: {
            type: String,
            required: true,
        },
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
            select: ['itemRef', 'description', 'name'],
        },
    ])

    const prof = {
        username: user.username,
        imageUrl: user.imageUrl,
        products: user.products,
    }

    return prof
}

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

    next()
})

const User = new mongoose.model('User', userSchema)

module.exports = User
