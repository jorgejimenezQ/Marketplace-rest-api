const express = require('express')
const userRouter = require('./routes/user.js')
require('./db/mongoose.js')

// Get the express object
const app = express()

// Have express use the routers
app.use(express.json())
app.use(userRouter)

module.exports = app

// ===============================================
// ===============================================
// ===============================================
function main() {
    const User = require('./models/user.js')
    const Message = require('./models/message.js')
    const mongoose = require('mongoose')
    const Product = require('./models/product.js')
    const Offer = require('./models/offer.js')

    const id1 = new mongoose.Types.ObjectId()
    const id2 = new mongoose.Types.ObjectId()
    const id3 = new mongoose.Types.ObjectId()
    const id4 = new mongoose.Types.ObjectId()

    const parentid = new mongoose.Types.ObjectId()
    const productid = new mongoose.Types.ObjectId()
    const productid2 = new mongoose.Types.ObjectId()
    const productid3 = new mongoose.Types.ObjectId()

    const product = new Product({
        _id: productid,
        itemRef: '1243987',
        description:
            'I have had this ps2 for 20 years. I am sad to have to sell it',
        name: 'ps2',
        condition: 'Acceptable',
        price: 123.99,
        owner: id1,
        category: 'Video Games',
    })
    const product2 = new Product({
        _id: productid2,
        itemRef: '98137',
        description: 'I hate this couch, take it away!!',
        name: 'Couch',
        condition: 'Acceptable',
        price: 5.0,
        owner: id3,
        category: 'Furniture',
    })
    const product3 = new Product({
        _id: productid3,
        itemRef: '178115',
        description: 'This car is awesome! please buy!',
        name: 'Honda Civic',
        condition: 'Acceptable',
        price: 4000.009,
        owner: id1,
        category: 'Vehicles',
    })

    const offerid1 = new mongoose.Types.ObjectId()
    const offerid2 = new mongoose.Types.ObjectId()
    const offerid3 = new mongoose.Types.ObjectId()

    const offer1 = new Offer({
        _id: offerid1,
        offerAmount: 43.99,
        product: productid,
        buyer: id2,
    })

    const offer2 = new Offer({
        _id: offerid2,
        offerAmount: 125.99,
        product: productid,
        buyer: id3,
    })

    const offer3 = new Offer({
        _id: offerid3,
        offerAmount: 200.99,
        product: productid,
        buyer: id4,
    })

    const user1 = new User({
        _id: id1,
        username: 'juan',
        email: 'exam@mdf.com',
        password: '1234lkj;',
    })

    const user2 = new User({
        _id: id2,
        username: 'cynthia',
        email: 'cynthia@mdf.com',
        password: 'password234',
    })

    const user3 = new User({
        _id: id3,
        username: 'pedro',
        email: 'pedro@mdf.com',
        password: 'password234',
    })

    const user4 = new User({
        _id: id4,
        username: 'chuy',
        email: 'chuy@mdf.com',
        password: 'password234',
    })

    const message1 = new Message({
        _id: parentid,
        owner: id2,
        recipient: id1,
        body: 'Hello Juan!',
    })

    const message2 = new Message({
        owner: id1,
        recipient: id2,
        body: 'You Up?',
        parent: parentid,
    })

    const message3 = new Message({
        owner: id1,
        recipient: id2,
        body: 'Wanna come over?',
        parent: parentid,
    })

    const test = async () => {
        await User.deleteMany()
        await Product.deleteMany()
        await Offer.deleteMany()
        // await Message.deleteMany()

        await user1.save()
        await user2.save()
        await user3.save()
        await user4.save()

        await product.save()
        await product2.save()
        await product3.save()

        await offer1.save()
        await offer2.save()
        await offer3.save()

        await message1.save()
        await message2.save()
        await message3.save()

        // getMsgs()
        // productOfferRelationship()
        // makeandupdateuser()
    }

    const makeandupdateuser = async () => {
        const bcrypt = require('bcryptjs')

        // update password
        // const newPass = 'newballs'
        // let juan = await User.findById(id1)
        // console.log(juan.password)
        // juan.password = newPass

        // await juan.save()

        // juan = await User.findById(id1)
        // console.log(juan.password)
        // const isValidPass = await bcrypt.compare(newPass, juan.password)
        // console.log(isValidPass)

        // Try to log in
        // const password = '1234lkj;'
        // const email = 'exam@mdf.com'

        // try {
        //     const user = await User.getExistingUser(email, password)
        //     console.log(user)
        // } catch (e) {
        //     console.log(e)
        // }
    }

    const productOfferRelationship = async () => {
        // const product = await Product.findById(productid).populate('offers')
        // console.log(product)
        // console.log(product.offers)

        const juan = await User.findById(id1).populate(
            'products',
            'name',
            'price',
        )
        console.log(juan)
        // console.log(juan.products)
        await juan.products[0].populate('offers', 'offerAmount')

        console.log(juan.products[0].offers)
    }

    const getMsgs = async () => {
        const parentMsg = await Message.findOne({
            owner: id2,
        })
        await parentMsg.populate('owner', 'username')
        await parentMsg.populate('recipient', 'username')

        // console.log(`${parentMsg.owner.username} said: \n "${parentMsg.body}"`)

        const responce = await Message.find({
            owner: parentMsg.recipient._id,
        })
            .populate('owner', 'username')
            .populate('recipient', 'username')

        // console.log(responce[0])
        // console.log(`${responce[0].owner.username} said: \n "${responce[0].body}"`)
        // console.log(`${responce[1].owner.username} said: \n "${responce[1].body}"`)

        const user = await User.findById(id1).populate('messages', 'body')
        await user.populate('products')

        // console.log(JSON.stringify(user))
        // console.log(user)
        // console.log(user.messages)
        // console.log(user.products)
    }

    test()
}

// main()
