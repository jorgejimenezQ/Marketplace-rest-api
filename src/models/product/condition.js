const validator = require('validator')
const mongoose = require('mongoose')

const conditionSchema = new mongoose.Schema({
    categoryId: {
        type: Number,
        required: true,
    },
    value: {
        type: String,
        required: true,
    },
    description: String,
})

const Condition = mongoose.model('Condition', conditionSchema)
module.exports = Condition
