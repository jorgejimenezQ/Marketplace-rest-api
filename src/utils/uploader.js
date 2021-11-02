const path = require('path')

// Create a file destination for products and user uploads
const makeFilepath = (asset, file) => {
    const uniqueSuffix = Date.now() + Math.round(Math.random() * 1e16)
    const suffix = file.mimetype.split('/')[1]

    const filepath = path.join(
        __dirname,
        `../../public/${asset}/${uniqueSuffix.toString(16)}.${suffix}`
    )

    return filepath
}

// Creat the options for product and user uploads
const uploadOptions = {
    // dest: 'public/product',
    limits: {
        fileSize: 12000000,
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/))
            return cb(new Error('Please upload a jpg or jpeg file.'))
        cb(undefined, true)
    },
}

module.exports = { makeFilepath, uploadOptions }
