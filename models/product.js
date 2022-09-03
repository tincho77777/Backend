const mongoose = require('mongoose');

//require: verbo (requiere)
//required: adjetico (es requerido)

//modelo de esquema y productos de mongoose
//modelo de esquema
//estructura y atributos del producto
const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    richDescription: {
        type: String,
        default: '',    //como no es requerida le pongo como default un cadena vacia
    },
    image: {
        type: String,
        default: '',    //como no es requerida le pongo como default un cadena vacia
    },
    images: [{      // es un array de strings por eso los corchetes
        type: String,
    }],
    brand: {
        type: String,
        default: '',    //como no es requerida le pongo como default un cadena vacia
    },
    price: {
        type: Number,
        default: 0,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,  //relaciono el objeto con un id
        ref: 'Category',   //relaciono el id con la categoria esquema
        required: true,
    },
    countInStock: {
        type: Number,
        require: true,
        min: 0,
        max: 255,   //pongo un valor min y max de stock, si no estoy entre esos valores marca error
    },
    rating: {
        type: Number,
        default: 0,
    },
    numReviews: {
        type: Number,
        default: 0
    },
    isFeatured: {
        type: Boolean,
        default: false,
    },
    dateCreated: {
        type: Date,
        default: Date.now,
    }
})

//creamos un id virtual
productSchema.virtual('id').get(function () {
    return this._id.toHexString();
})

//lo pasamos a archivo json
productSchema.set('toJSON', {
    virtuals: true
})

//modelo de modelo
exports.Product = mongoose.model('Product', productSchema ); //creamos el modelo, estos se escriben con mayus por eso Product
