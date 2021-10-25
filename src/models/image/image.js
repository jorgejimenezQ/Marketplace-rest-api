const mongoose = require('mongoose')

// ========================================
// Image schema:
// Will be used as a subdocument for the
// product schema
// ========================================
const imageSchema = new mongoose.Schema(
    {
        path: {
            type: String,
            required: true,
        },
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

imageSchema.virtual('url').get(function () {
    return `${this.path}${this.name}`
})
module.exports = imageSchema
