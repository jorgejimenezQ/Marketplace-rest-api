/**
 * Copyright (c) 2017
 *
 * long description for the file
 *
 * @summary Operations on product, see the market-oas.yaml file.
 * @author Jorge Jimenez <jimenezjorge717@gmail.com>
 */

const express = require('express')
const authenticate = require('../middleware/auth.js')
const Product = require('../models/product/product.js')
const Offer = require('../models/offer/offer.js')
const { updateOffer, updateOfferMany } = require('../utils/updateOffer.js')

const router = express.Router()

// Create offer
router.post('/offers', authenticate, async (req, res) => {
    try {
        // Find the product with the itemNumber
        const product = await Product.findOne({
            itemNumber: req.body.itemNumber,
        }).populate('owner')
        // Did it work?
        if (!product || product.sold || product.removed) {
            throw new Error('The product was not found!')
        }

        // User the procuct's id to create the offer
        const offer = new Offer({
            offerAmount: req.body.amount,
            product: product._id,
            owner: req.user._id, // The user that created the request
        })
        await offer.save()
        // Did it work?
        if (!offer) throw new Error()

        // Create an offer block and send it
        res.send(offer.toOfferBlock(product, product.owner, req.user))
    } catch (e) {
        res.status(400).send({
            error: 'Something went wrong',
            errorMessage: e.message,
        })
    }
})

// Read an offer
router.get('/offers/:offerId', authenticate, async (req, res) => {
    try {
        const offerBlock = await updateOffer(req, (offer) => {
            offer.offerViewed = true
            offer.dateViewed = Date.now()
        })

        res.send(offerBlock)
    } catch (e) {
        res.status(400).send({
            error: 'Something went wrong',
            errorMessage: e.message,
        })
    }
})

// Read all offers for a product
router.get('/offers/:itemNumber/all', authenticate, async (req, res) => {
    try {
        const offers = await updateOfferMany(req, (offer) => {
            offer.offerViewed = true
            offer.dateViewed = Date.now()
        })

        res.send(offers)
    } catch (e) {
        res.status(400).send({
            error: 'Something went wrong',
            errorMessage: e.message,
        })
    }
})

// Accept an offer
router.put('/offers/:offerId', authenticate, async (req, res) => {
    try {
        const offerBlock = await updateOffer(req, (offer) => {
            // Update the fields
            offer.offerAccepted = true
            offer.offerRejected = false
            offer.dateAccepted = Date.now()
        })

        res.send(offerBlock)
    } catch (e) {
        res.status(400).send({
            error: 'Something went wrong',
            errorMessage: e.message,
        })
    }
})

// Reject an offer
router.delete('/offers/:offerId', authenticate, async (req, res) => {
    try {
        const offerBlock = await updateOffer(req, (offer) => {
            offer.offerRejected = true
            offer.offerAccepted = false
            offer.dateRejected = Date.now()
        })

        res.send(offerBlock)
    } catch (e) {
        res.status(400).send({
            error: 'Something went wrong',
            errorMessage: e.message,
        })
    }
})

module.exports = router
