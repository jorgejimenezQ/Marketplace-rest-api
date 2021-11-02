const Product = require('../models/product/product.js')
const Offer = require('../models/offer/offer.js')

/**
 * Takes an offer and makes updates.
 * Returns an offer block
 */
const updateOffer = async (req, update) => {
    // We need to set the offer's deleted to true
    // Find the offer with the
    const offer = await Offer.findById(req.params.offerId)
    if (!offer) throw new Error('The offer was not found!')

    const product = await Product.findById(offer.product).populate('owner')
    if (!product || product.sold || product.removed)
        throw new Error('There was a problem!')

    // Update the fields
    update(offer)

    // Save the offer and get the owner
    await offer.save()
    await offer.populate('owner')

    // Generate and return offer block
    return offer.toOfferBlock(product, product.owner, offer.owner)
}

/**
 * Create an array of offerblocks
 */
const updateOfferMany = async (req, update) => {
    // Look for the product by the itemNumber
    const productArr = await Product.find({
        itemNumber: req.params.itemNumber,
    }).populate('owner')
    const product = productArr[0]
    // Did we find it?
    if (!product || product.sold || product.removed)
        throw new Error('There was a problem!')

    // console.log(product)

    // Get the offers with that product's id
    const offers = await Offer.find({ product: product._id }).populate('owner')

    const blocks = []

    // Add the product and user only once
    blocks.push({ product: product.toProductBlock(product.owner) })

    // Iterate through the offers and create an offerBlock
    // for each one.
    await Promise.all(
        offers.map(async (offer) => {
            // Make updates
            update(offer)
            // Save updates
            await offer.save()

            blocks.push(offer.toOfferBlock(offer.owner))
        })
    )

    return blocks
}

module.exports = { updateOffer, updateOfferMany }
