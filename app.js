const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
require("dotenv/config");
const authJwt = require('./helpers/jwt');
const errorHandler = require('./helpers/error-handler');

app.use(cors());
//El método HTTP OPTIONS solicita opciones de comunicación permitidas para una URL o servidor determinado. 
// Un cliente puede especificar una URL con este método, o un asterisco (*) para referirse a todo el servidor.
app.options("*", cors());

//middleware para que el post entienda que se esta mandando un json (middleware: software intermedio)
app.use(express.json());  
app.use(morgan('tiny'));
app.use(authJwt()); 
app.use('/public/uploads', express.static(__dirname + '/public/uploads'))
app.use(errorHandler); //Manejo de errores de autenticación
// app.use(express.urlencoded({ extended: false }));
// app.use(express.urlencoded({ extended: true }));
// app.use(bodyParser.json());
    


//routes
const categoriesRoutes = require('./routes/categories');
const productsRoutes = require('./routes/products');
const usersRoutes = require('./routes/users');
const ordersRoutes = require('./routes/orders');



const api = process.env.API_URL;


app.use(`${api}/categories`, categoriesRoutes);
app.use(`${api}/products`, productsRoutes);
app.use(`${api}/users`, usersRoutes);
app.use(`${api}/orders`, ordersRoutes);



//Database conexion 
//user: e-shop  password: 12345M
mongoose.connect(process.env.CONNECTION_STRING , {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'eshop-database'
}) 
.then( () => {
console.log('Database connection is ready!')
})
.catch( (err) => {
    console.log(err)
})

//empezando el servidor
app.listen(3000, () => {
    console.log("server is running http://localhost:3000");
});
