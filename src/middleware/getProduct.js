const Product = require('../models/product/product')

const product = async (req, res, next) => {
    try {
        // Find the product by item number
        const product = await Product.findOne({
            itemNumber: req.params.itemNumber,
        })
        if (!product) throw new Error()

        // Add the product to the request object
        req.product = product

        // Authorize the user to access product
        if (req.product.owner._id.toString() !== req.user._id.toString()) {
            res.status(401).send({ error: 'Could not access the item' })
            return
        }

        next()
    } catch (e) {
        res.status(404).send({ error: 'Product not found!' })
    }
}

module.exports = product
