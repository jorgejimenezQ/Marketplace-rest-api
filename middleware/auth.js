const jwt = require('jsonwebtoken')
const User = require('../models/user.js')

// Validates the authentication token and adds the
// authenticated use to the request object
const authenticate = async (req, res, next) => {
    try {
        // Get the token from the request header
        const token = req.get('Authorization').replace('Bearer ', '')
        // Decode the data from the token
        const tokenData = jwt.verify(token, process.env.JWT_SECRET)

        console.log(token)
        console.log(tokenData)

        const user = await User.findOne({
            _id: tokenData._id,
            'tokens.token': token,
        })

        console.log(user)

        next()
    } catch (e) {
        res.status(401).send({ error: 'Please authenticate' })
    }
}

module.exports = authenticate
