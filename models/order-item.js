const mongoose = require('mongoose');

//modelo de esquema y productos de mongoose
//modelo de esquema
const orderItemSchema = mongoose.Schema({
    quantity: {
        type: Number,
        required: true
    },
    product: { //necesitamos relacionar las ordenes a los productos
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    } 
})

//modelo de modelo
exports.OrderItem = mongoose.model('OrderItem', orderItemSchema ); //creamos el modelo, estos se escriben con mayus por eso Product