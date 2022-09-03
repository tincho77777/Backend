const {Category} = require('../models/category');
const express = require('express');
const router = express.Router();


//GET REQUEST //recibe
router.get(`/`, async (req, res) => {  //METODO PARA MOSTRAR UN PRODUCTO
    const categoryList = await Category.find();

    if(!categoryList){
        res.status(500).json({success: false}) //error 500: errores del servidor
    }
    
    res.status(200).send(categoryList);   //error 200: no son de error, significan que la pagina cargo correctamente
});

//obtener categorías y detalles de categoría
router.get('/:id', async (req, res) => {
    const category = await Category.findById(req.params.id);

    if(!category){
        res.status(500).json({message: 'The category with de given ID was not found'})
    }
    res.status(200).send(category);
})


//Cargamos una categoria
router.post('/', async (req, res) => {
    //hacemos los mismo atributos que tiene en category
    let category = new Category({   //creo un nuevo modelo de categoria
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color,
    });
    category = await category.save();  //guardo la catoria en mongo y espero que esta este lista

    if(!category){    //chequeo si no hay categoria creada y envio el error
        return res.status(404).send('The category cannot be created!');
    }

    res.send(category);  //si esta creada la categoria la devuelvo si no manda el erro de arriba
})

//Actualizar una categoria
//put request
router.put('/:id', async (req, res) => {
    const category = await Category.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            icon: req.body.icon || category.icon,
            color: req.body.color
        },
        {new: true}
    )
    if(!category){    //chequeo si no hay categoria creada y envio el error
        return res.status(400).send('The category cannot be updated!');
    }

    res.send(category);  //si esta creada la categoria la devuelvo si no manda el erro de arriba
})

//Borrar las categorias por el id
// api/v1//categories/idSeleccionado
router.delete('/:id', (req, res) => {
    Category.findByIdAndRemove(req.params.id)
    .then(category => {  //llamamos una promesa
        if(category){  //si encontras la categoria con ese id
            return res.status(200).json({success: true, message:'The category is deleted!'})
        }else{ //si no encuentra categoria con ese id
            return res.status(404).json({success: false, message:'Category not found!'})
        }
    }).catch(err => {
        return res.status(500).json({success: false, error: err})
    })
})

module.exports = router;