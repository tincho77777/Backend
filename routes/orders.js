const {Order} = require('../models/order');
const express = require('express');
const router = express.Router();
const { OrderItem } = require('../models/order-item');


//GET REQUEST 
//recibir lista de ordenes
router.get(`/`, async (req, res) =>{
    const orderList = await Order.find()
    .populate('user', 'name')
    .sort({ dateOrdered: -1});

    if(!orderList) {
        res.status(500).json({success: false})
    } 
    res.send(orderList);
})

//GET request
//ver orden por id
router.get(`/:id`, async (req, res) => {  //METODO PARA MOSTRAR UN PRODUCTO
    const order = await Order.findById(req.params.id)
    .populate('user', 'name')
    .populate({
        path: 'orderItems', 
        populate: {
            path: 'product', 
            populate: 'category'}
        });

    if(!order){
        res.status(500).json({success: false})
    }
    res.send(order);
});

//POST request
//Cargamos una orden
router.post('/', async (req, res) => {

    const orderItemsIds = Promise.all(req.body.orderItems.map( async (orderitem) => {
        let newOrderItem = new OrderItem({
            quantity: orderitem.quantity,
            product: orderitem.product
        })
        newOrderItem = await newOrderItem.save(); 
        return newOrderItem._id; 
    }))
    
    const orderItemsIdsResolved = await orderItemsIds;

    //creamos variable precioTotal
    //array de precios totales y devuelve un solo precio que contiene el precio de todas las compras
    const totalPrices = await Promise.all(orderItemsIdsResolved.map(async (orderItemId) => {
        const orderItem = await OrderItem.findById(orderItemId).populate('product', 'price')
        const totalPrice = orderItem.product.price * orderItem.quantity;
        return totalPrice;
    }))

    //Combina los valores del arrya para sacar un solo precio total, el cero es porque la suma comienza en cero
    const totalPrice = totalPrices.reduce((a,b) => a + b , 0);
    
    console.log(totalPrices);

    //hacemos los mismo atributos que tiene en order
    let order = new Order({   //creo un nuevo modelo de order
        orderItems: orderItemsIdsResolved,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        status: req.body.status,
        totalPrice: totalPrice, //variable que sale de arriba
        user: req.body.user,
    });
    order = await order.save();  //guardo la orden en mongo y espero que esta este lista
    
    if(!order){    //chequeo si no hay orden creada y envio el error
        return res.status(400).send('The order cannot be created!');
    }

    res.status(200).send(order);  //si esta creada la orden la devuelvo si no manda el error de arriba
})

//PUT request
//Actualizar una orden
router.put('/:id', async (req, res) => {
    const order = await Order.findByIdAndUpdate(
        req.params.id,
        {
            status: req.body.status
        },
        {new: true}
    )
    if(!order){    //chequeo si no hay orden creada y envio el error
        return res.status(400).send('The order cannot be updated!');
    }

    res.send(order);  //si esta creada la orden la devuelvo si no manda el erro de arriba
})

//DELETE request
//Borrar las ordenes por el id
//api/v1//orders/idSeleccionado
router.delete('/:id', (req, res) => {
    Order.findByIdAndRemove(req.params.id)
    .then( async (order) => {  //llamamos una promesa
        if(order){  //si encontras la orden con ese id
            await order.orderItems.map(async (orderItem) =>{
                await OrderItem.findByIdAndRemove(orderItem);
            })
            return res.status(200).json({success: true, message:'The order is deleted!'})
        }else{ //si no encuentra orden con ese id
            return res.status(404).json({success: false, message:'Order not found!'})
        }
    }).catch(err => {
        return res.status(500).json({success: false, error: err})
    })
})

//GET request de ventas totales
router.get('/get/totalsales', async (req, res) => {
    const totalSales = await Order.aggregate([
        { $group: { _id: null , totalsales: { $sum: '$totalPrice'} }}
    ]);

    if(!totalSales){
        return res.status(400).send('The order sales cannot be generated!');
    }

    res.send({totalsales: totalSales.pop().totalsales}); //me devuelve solo el precio total sin el arreglo
})

//Get orders count
//Obtener recuentos de ordenes con fines estadísticos
router.get(`/get/count`, async (req, res) => {  //METODO PARA MOSTRAR UN PRODUCTO
    const orderCount = await Order.countDocuments(); //recibo la cantidad y me devuelve la cantidad

    if(!orderCount){
        res.status(500).json({success: false})
    }
    
    res.send({
        orderCount: orderCount
    });
});  

//GET REQUEST user orders
router.get(`/get/userorders/:userid`, async (req, res) => {  //METODO PARA MOSTRAR UN PRODUCTO
    const userOrderList = await Order.find({ user: req.params.userid })
    .populate({
        path: 'orderItems', populate: {
            path: 'product', populate: 'category'}
        }).sort({ dateOrdered: -1 });

    if(!userOrderList){
        res.status(500).json({success: false})
    }
    
    res.send(userOrderList);
});

module.exports = router;