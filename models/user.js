const mongoose = require('mongoose');

//modelo de esquema y productos de mongoose
//modelo de esquema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    passwordHash: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    street: {
        type: String,
        default: '',
    },
    apartment: {
        type: String,
        default: '',
    },
    zip: {
        type: String,
        default: '',
    },
    city: {
        type: String,
        default: '',
    },
    country: {
        type: String,
        default: '',
    },
    // id: {
    //     type: String,
    //     default: '',
    // },
    token: {
        type: String,
        default: '', 
    }, 
})

//creamos un id virtual
userSchema.virtual('id').get(function () {
    return this._id.toHexString();
})

//lo pasamos a archivo json
userSchema.set('toJSON', {
    virtuals: true
})

//modelo de modelo
//exportamos el modulo y el esquema
exports.User = mongoose.model('User', userSchema ); //creamos el modelo, estos se escriben con mayus por eso Product
exports.userSchema = userSchema;