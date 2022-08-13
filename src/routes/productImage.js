/**
 * Copyright (c) 2017
 *
 * long description for the file
 *
 * @summary Operations on product, see the market-oas.yaml file.
 * @author Jorge Jimenez <jimenezjorge717@gmail.com>
 */

const express = require('express')
const authenticate = require('../middleware/auth')
const Product = require('../models/product/product')
const Offer = require('../models/offer/offer')
const multer = require('multer')
const customStorage = require('../utils/customMulterStorage')
const { makeFilepath, uploadOptions } = require('../utils/uploader')
const findProduct = require('../middleware/getProduct')
const removeFile = require('../utils/removeFile')
const PRODUCT_PATH = `${__dirname}/../../public/product/`
const router = express.Router()

const storage = customStorage({
    destination: function (req, file, cb) {
        const filepath = makeFilepath('product', file)
        cb(null, filepath)
    },
})

// Create user upload options
const upload = multer({ storage, ...uploadOptions })

/** Add product image */
router.post(
    '/images/:itemNumber/addProductImage',
    authenticate,
    findProduct,
    upload.array('images', 6),
    async (req, res) => {
        try {
            const product = req.product

            // Check the maximum allowed
            if (product.imagePaths.length > parseInt(process.env.IMG_LIMIT)) {
                req.files.map((file) => {
                    removeFile(PRODUCT_PATH + file.filename)
                })
                res.status(409).send({
                    Error: 'Only 2 images allowed per product!',
                })
                // remove the file we just added
                return
            }

            // update product with the path and name of the images
            const newImagePaths = req.files.map((file) => {
                return {
                    path: '../../public/product/',
                    name: file.filename,
                }
            })

            // Add the new pictures to the product
            product.imagePaths = product.imagePaths.concat(newImagePaths)
            await product.save() // Save

            // Crate a product block
            res.send(product.toProductBlock(req.user))
        } catch (e) {
            res.status(400).send({
                error: 'Something went wrong',
                errorMessage: e.message,
            })
        }
    },
    (error, req, res, next) => {
        res.status(400).send({ error: error.message })
    }
)

/** Delete image */
router.delete(
    '/images/:itemNumber/deleteImages',
    authenticate,
    findProduct,
    async (req, res) => {
        try {
            // Find the product and filter out the
            // images the user wants to delete
            const product = req.product
            const images = req.body.images
            let isFileDeletedError = false

            if (images.length == 0) {
                res.status(400).send({
                    error: 'There needs to be at least one image to query',
                })
                return
            }

            // Check for product with no images
            if (product.imagePaths.length == 0) {
                res.status(404).send({
                    error: 'There are no images for this product',
                })
                return
            }

            // Iterate through the image and remove the one in images array
            const newImages = product.imagePaths.filter((image) => {
                if (images.includes(image.name)) {
                    // Get the file path
                    const filePath = `${__dirname}/../../public/product/${image.name}`

                    const isFileDeleted = removeFile(filePath)
                    // Check for error from removeFile
                    if (!isFileDeleted) isFileDeletedError = true
                    console.log('got here before false')
                    return false
                }
                return true
            })

            // Modify the product images and save
            req.product.imagePaths = newImages
            await req.product.save()

            // If there was an error throw exception, log it
            // if (isFileDeletedError) { }

            // Send a product block
            res.send(req.product.toProductBlock(req.user))
        } catch (e) {
            res.status(404).send({
                error: 'Something went wrong',
                errorMessage: e.message,
            })
        }
    }
)

module.exports = router
