const mongoose = require('mongoose');

//modelo de esquema y productos de mongoose
//modelo de esquema
const orderSchema = mongoose.Schema({
    orderItems: [{ //creamos un array con [] porque pueden ser multiples ordenes de compra
        type: mongoose.Schema.Types.ObjectId,  //relaciono el objeto con un id
        ref: 'OrderItem',   //relaciono el id con el orderItem esquema
        required: true,
    }],
    shippingAddress1: {
        type: String,
        required: true,
    },
    shippingAddress2: {
        type: String,
    },
    city: {
        type: String,
        required: true,
    },
    zip: {
        type: String,
        required: true,
    },
    country: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
        default: 'Pending',
    },
    totalPrice: {
        type: Number,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    dateOrdered: {
        type: Date,
        default: Date.now,
    },
})

//creamos un id virtual
orderSchema.virtual('id').get(function () {
    return this._id.toHexString();
})

//lo pasamos a archivo json
orderSchema.set('toJSON', {
    virtuals: true
})

//modelo de modelo
exports.Order = mongoose.model('Order', orderSchema ); //creamos el modelo, estos se escriben con mayus por eso Product


/**
Order Example:

{
    "orderItems" : [
        {
            "quantity": 3,
            "product" : "5fcfc406ae79b0a6a90d2585"
        },
        {
            "quantity": 2,
            "product" : "5fd293c7d3abe7295b1403c4"
        }
    ],
    "shippingAddress1" : "Flowers Street , 45",
    "shippingAddress2" : "1-B",
    "city": "Prague",
    "zip": "00000",
    "country": "Czech Republic",
    "phone": "+420702241333",
    "user": "5fd51bc7e39ba856244a3b44"
}

 */