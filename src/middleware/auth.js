const jwt = require('jsonwebtoken')
const User = require('../models/user/user.js')

// Validates the authentication token and adds the
// authenticated use to the request object
const authenticate = async (req, res, next) => {
    try {
        // Get the token from the request header
        const token = req.get('Authorization').replace('Bearer ', '')
        
        // Decode the data from the token
        const tokenData = jwt.verify(token, process.env.JWT_SECRET)

        // Use the token and tokenData to search for an existing account
        const user = await User.findOne({
            _id: tokenData._id,
            'tokens.token': token,
        })

        // If it doesn't exist throw an error
        if (!user) {
            throw new Error()
        }

        // Add the user and the token to the request object
        req.token = token
        req.user = user

        next()
    } catch (e) {
        res.status(401).send({ error: 'Please authenticate' })
    }
}

module.exports = authenticate
