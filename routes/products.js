const {Product} = require('../models/product');
const express = require('express');
const { Category } = require('../models/category');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');

const FILE_TYPE_MAP = {  //Definimos los tipo de imagenes que se pueden cargar, en este caso png, jpeg, jpg
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
};
// La finalidad de las funciones async/await es simplificar el comportamiento del uso síncrono de promesas y realizar algún comportamiento específico en un grupo de Promises. Del mismo modo que las Promises son semejantes a las devoluciones de llamadas estructuradas, async/await se asemejan a una combinación de generadores y promesas.

//CARGA DE IMAGENES
//Datos sacados de la libreria npm multer, disk, para no tener problemas con nombres e imagenes
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('Invalid image type!');

        if(isValid){ //si la imagen es valida no hay error y el callback se ejecuta
            uploadError = null;
        }
        cb(uploadError, 'public/uploads') //direccion donde van a estar las imagenes
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-'); //forma de nombrar el archivo
        const extension = FILE_TYPE_MAP[file.mimetype]; //mimetype usa el tipo de dato que nosotros especificamos en FILE_TYPE_MAP para que solo se puedan introducir estos
        cb(null, `${fileName}-${Date.now()}.${extension}`) //date.now para que el nombre de file sea unico
    } 
})
const uploadOptions = multer({ storage: storage })

//GET REQUEST: recibe
router.get(`/`, async (req, res) => {  //METODO PARA MOSTRAR UN PRODUCTO

    let filter = {};
    if(req.query.categories){
        filter = {category: req.query.categories.split(',')}
    }

    const productList = await Product.find(filter).populate('category');  //.select('name image -_id');  :nos va a mostrar solo el nombre e imagen y con el menos no nos muestra el id

    if(!productList){
        res.status(500).json({success: false})
    }
    
    res.send(productList);
});

//GET REQUEST
//obtener un producto y una lista de productos por su id REST API
router.get(`/:id`, async (req, res) => {  //METODO PARA MOSTRAR UN PRODUCTO
    const product = await Product.findById(req.params.id).populate('category'); //el populate se utiliza para relacionar dos tablas de mongo db

    if(!product){
        res.status(500).json({success: false})
    }
    
    res.send(product);
});

//POST REQUEST //envio
router.post(`/`, uploadOptions.single('image'), async (req, res) => {  //METODO PARA ENVIAR DESDE EL FRONT UN PRODUCTO
    const category = await Category.findById(req.body.category);
    if(!category) return res.status(400).send('Invalid category!');

    const file = req.file;
    if(!file) return res.status(400).send('No image in the request!');

    const fileName = file.filename; //este nombre va a venir de: cb(null, fileName + '-' + Date.now())
    //creamos la base de la direccion para la imagen: http://localhost:3000/public/uploads
    //protocol me da el http
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

    let product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,       //req = requiere
        image: `${basePath}${fileName}`,  // ej direccion de imagen: "http://localhost:3000/public/uploads/image-232125212.jpeg" 
        brand: req.body.brand, 
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured
    })
    product = await product.save();

    if (!product) return res.status(500).send('The product cannot be created');

    res.send(product); 
});

//Actualizar un producto
//put request
router.put('/:id', uploadOptions.single('image'), async (req, res) => {
    if(!mongoose.isValidObjectId(req.params.id)){  //si el id es valido continua si no no
        return res.status(400).send('Invalid product ID!')
    }  
    const category = await Category.findById(req.body.category);
    if(!category) return res.status(400).send('Invalid category!')

    const product = await Product.findById(req.params.id);
    if(!product) return res.status(400).send('Invalid product!')

    const file = req.file;
    let imagepath;

    if(file){
        const fileName = file.filename; //este nombre va a venir de: cb(null, fileName + '-' + Date.now())
    //creamos la base de la direccion para la imagen: http://localhost:3000/public/uploads
    //protocol me da el http
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
        imagepath = `${basePath}${fileName}`;
    }else{
        imagepath = product.image;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        {
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,       //req = requiere
        image: imagepath,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured
        },
        {new: true}
    )
    if(!updatedProduct){    //chequeo si no hay categoria creada y envio el error
        return res.status(500).send('The product cannot be updated!');
    }

    res.send(updatedProduct);  //si esta creada la categoria la devuelvo si no manda el erro de arriba
})

//Borrar los productos por el id
//Delete request
// api/v1/products/idSeleccionado
router.delete('/:id', (req, res) => {
    Product.findByIdAndRemove(req.params.id)
    .then(product => {  //llamamos una promesa
        if(product){  //si encontras la producto con ese id
            return res.status(200).json({success: true, message:'The product is deleted!'})
        }else{ //si no encuentra producto con ese id
            return res.status(404).json({success: false, message:'Product not found!'})
        }
    }).catch(err => {
        return res.status(500).json({success: false, error: err})
    })
})

//Get products count
//Obtener recuentos de productos con fines estadísticos
router.get(`/get/count`, async (req, res) => {  //METODO PARA MOSTRAR UN PRODUCTO
    const productCount = await Product.countDocuments(); //recibo la cantidad y me devuelve la cantidad

    if(!productCount){
        res.status(500).json({success: false})
    }
    
    res.send({
        success: true,
        productCount: productCount
    });
});  

//Get request: Featured products
//obtener productos destacados
router.get(`/get/featured/:count`, async (req, res) => {  
    const count = req.params.count ? req.params.count: 0;
    const products = await Product.find({isFeatured: true}).limit(+count); //le ponemos el + para transformar count es un Number, si no es un string

    if(!products){
        res.status(500).json({success: false})
    }
    
    res.send(products);
});  

//METODO PUT PARA CARGAR VARIAS IMAGENES JUNTAS NO UNA POR UNA
router.put('/gallery-images/:id', uploadOptions.array('images', 10), async (req, res) => { //El 10 es la maxima cantidad de fotos que podemos subir
    if(!mongoose.isValidObjectId(req.params.id)){  //si el id es valido continua si no no
        return res.status(400).send('Invalid product ID!')
    } 

    const files = req.files;
    let imagesPaths = [];
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
    
    if(files){
        files.map(file => {
            imagesPaths.push(`${basePath}${file.filename}`);
        })
    }

    const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
        images: imagesPaths
        },
        {new: true}
    )

    if(!product){    //chequeo si no hay categoria creada y envio el error
        return res.status(500).send('The product cannot be updated!');
    }

    res.send(product);  //si esta creada la categoria la devuelvo si no manda el erro de arriba
})

module.exports = router;



// name:Product6
// description:Product6 description
// richDescription:Product6 richDescription
// brand:Product6 brand
// price:26
// category:608fe08365074604f45ce544
// countInStock:36 
// rating:2
// numReviews:21
// isFeatured:true