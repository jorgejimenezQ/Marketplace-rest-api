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
const removeFile = require('../utils/removeFile')

const router = express.Router()

const storage = customStorage({
    destination: function (req, file, cb) {
        const filepath = makeFilepath('user', file)
        cb(null, filepath)
    },
})

// Create user upload options
const upload = multer({ storage, ...uploadOptions })

/** Add a user's image **/
router.post(
    '/images/addUserImage',
    authenticate,
    upload.single('image'),
    async (req, res) => {
        try {
            const prevFilepath =
                process.env.ASSETS_USER + req.user.imagePath.name

            // Check for existing image and delete
            removeFile(prevFilepath)

            // Update the user and save
            req.user.imagePath = {
                path: process.env.USER_ASSETS_PATH,
                name: req.file.filename,
            }
            await req.user.save()

            res.send(req.user)
        } catch (e) {
            res.status(400).send({
                error: 'Something went wrong',
                errorMessage: e.message,
            })
        }
    },
    (error, req, res, next) => {
        console.log('Error: check error code')
        res.status(400).send({ error: error.message })
    }
)

/** Remove image */
router.delete('/images', authenticate, async (req, res) => {
    try {
        // Remove the file from storage
        removeFile(`${process.env.ASSETS_USER}${req.user.imagePath.name}`)

        // Remove the image from the user and save
        req.user.imagePath = {
            path: process.env.USER_PLACEHOLDER_PATH,
            name: process.env.USER_PLACEHOLDER_NAME,
        }
        await req.user.save()

        res.send()
    } catch (e) {
        res.status(400).send({
            error: 'Something went wrong',
            errorMessage: e.message,
        })
    }
})

module.exports = router
