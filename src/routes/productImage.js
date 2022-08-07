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
            // console.log(product, parseInt(process.env.IMG_LIMIT))
            if (product.imagePaths.length > parseInt(process.env.IMG_LIMIT))
                return res.status(409).send({
                    Error: 'Only 2 images allowed per product!',
                })

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
            const imageIds = req.body.images

            const newImages = product.imagePaths.filter((image) => {
                for (let i = 0; i < imageIds.length; i++) {
                    if (image._id.toString() === imageIds[i]) {
                        removeFile(`${process.env.ASSETS_PRODUCT}${image.name}`)
                        return false
                    }
                }
                return true
            })

            // Modefy the product images and save
            req.product.imagePaths = newImages
            await req.product.save()

            // Crate a product block
            res.send(req.product.toProductBlock(req.user))
        } catch (e) {
            res.status(400).send({
                error: 'Something went wrong',
                errorMessage: e.message,
            })
        }
    }
)

module.exports = router
