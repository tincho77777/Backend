const {User} = require('../models/user');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); //libreria para ocultar la contraseñas
const jwt = require('jsonwebtoken'); 
//Un JSON Web Token es un token de acceso estandarizado en el RFC 7519 que permite el intercambio seguro de datos entre dos partes. Contiene toda la información importante sobre una entidad, lo que implica que no hace falta consultar una base de datos ni que la sesión tenga que guardarse en el servidor (sesión sin estado).

//PARA OBTENER EL TOKEN DE AUTORIZACION EN POSTMAN TENGO QUE HACER UN POST EN:
// http://localhost:3000/api/v1/users/login
//con:
// {
//     "email": "tuturritoloko@gmail.com",
//     "password": "123456"
// }


//GET REQUEST //recibe
router.get(`/`, async (req, res) => {  //METODO PARA MOSTRAR UN PRODUCTO
    const userList = await User.find().select('-passwordHash'); 

    if(!userList){
        res.status(500).json({success: false})
    }
    
    res.send(userList);
}); 

//obtener users y detalles de usuarios
router.get('/:id', async (req, res) => {
    const user = await User.findById(req.params.id).select('-passwordHash');

    if(!user){
        res.status(500).json({message: 'The user with de given ID was not found'})
    }
    res.status(200).send(user);
})

//Cargamos un usuario
router.post('/', async (req, res) => {
    //hacemos los mismo atributos que tiene en user
    let user = new User({   //creo un nuevo modelo de usuario
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),  //encriptamos la contraseña
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country
    });  

    user = await user.save();  //guardo el user en mongo y espero que esta este lista

    if(!user){    //chequeo si no hay user creado y envio el error
        return res.status(400).send('The user cannot be created!');  
    }

    res.send(user);  //si esta creada la categoria la devuelvo si no manda el erro de arriba
})

//Actualizar un usuario
//put request
router.put('/:id', async (req, res) => {
    const userExist = await User.findById(req.params.id);
    let newPassword;

    if(req.body.password){ //si le paso una nueva contraseña, encriptala y usa esa nueva
        newPassword = bcrypt.hashSync(req.body.password, 10)
    }else{ //si no te paso deja la que tenia antes
        newPassword = userExist.passwordHash;
    }

    const user = await User.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            email: req.body.email,
            passwordHash: newPassword,  
            phone: req.body.phone,
            isAdmin: req.body.isAdmin,
            street: req.body.street,
            apartment: req.body.apartment,
            zip: req.body.zip,
            city: req.body.city,
            country: req.body.country
        },
        {new: true}
    )
    if(!user){    //chequeo si no hay usuario creado y envio el error
        return res.status(400).send('The user cannot be updated!');
    }

    res.send(user);  //si esta creada la categoria la devuelvo si no manda el erro de arriba
});

//LOGIN
router.post('/login', async (req, res) => {
    const user = await User.findOne({email: req.body.email})
    const secret = process.env.secret;

    if(!user){ //si no hay ese usuario buscado por el email
        return res.status(400).send('The user not found');
    } 
    
    if(user && bcrypt.compareSync(req.body.password, user.passwordHash)){ //comparo la contraseña encriptada
        const token = jwt.sign( //PARAMETROS SECRETOS
            {
                userId: user.id,
                isAdmin: user.isAdmin
            },
            secret,
            {expiresIn: '1d'}  //cuando iniciamos sesion al tiempo esta expira y hay q loguearse de vuelta, aca al dia expira por eso 1d
        )
        
        res.status(200).send({user: user.email, token: token})   //el usuario pasa a ser el email
    }else{
        res.status(400).send('Wrong password!');   //manda que la contraseña esta incorrecta
    }
    
})

//POST
//Post para registrarse
router.post('/register', async (req,res)=>{
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
    })
    user = await user.save();

    if(!user)
    return res.status(400).send('the user cannot be created!')

    res.send(user);
})

//Delete request
//Borrar los usuarios por el id
// api/v1/users/idSeleccionado
router.delete('/:id', (req, res) => {
    User.findByIdAndRemove(req.params.id)
    .then(user => {  //llamamos una promesa
        if(user){  //si encontras el usuario con ese id
            return res.status(200).json({success: true, message:'The user is deleted!'})
        }else{ //si no encuentra usuario con ese id
            return res.status(404).json({success: false, message:'User not found!'})
        }
    }).catch(err => {
        return res.status(500).json({success: false, error: err})
    })
})

//Get users count
//Obtener recuentos de usuarios con fines estadísticos
router.get(`/get/count`, async (req, res) => {  //METODO PARA MOSTRAR UN USUARIO
    const userCount = await User.countDocuments(); //recibo la cantidad y me devuelve la cantidad

    if(!userCount){
        res.status(500).json({success: false})
    }
    
    res.send({
        userCount: userCount 
    });
});  

module.exports = router; 