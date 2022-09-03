const mongoose = require('mongoose');

//modelo de esquema y productos de mongoose
//modelo de esquema
const categorySchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    icon: {
        type: String,
    },
    color: {
        type: String,
    }
})

categorySchema.virtual('id').get(function () {
    return this._id.toHexString();
});

categorySchema.set('toJSON', {
    virtuals: true, 
});  

//modelo de modelo
exports.Category = mongoose.model('Category', categorySchema ); //creamos el modelo, estos se escriben con mayus por eso Product
