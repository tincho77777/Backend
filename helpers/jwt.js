// const expressJwt = require('express-jwt');
const { expressjwt: expressJwt } = require('express-jwt');

// Protección de la API y el middleware JWT de autenticación

function authJwt(){
    const secret = process.env.secret;  //este secreto hace que nuestra aplicacion no sea hackeable ya que se agrega al token haciendolo unico
    const api = process.env.API_URL;
    return expressJwt({
        secret,
        algorithms: ['HS256'], //Dato sacado de la pagina jwt, esta es la codificacion que usa para encriptar
        isRevoked: isRevoked //no permite a los usuario administrar la pagina, solo si sos admin podes
    }).unless({
        path: [
            //regular expresion , se usa para hacer menos codigo, si no habria que poner cada url de products
            { url: /\/public\/uploads(.*)/ , methods: ['GET', 'OPTIONS']}, //para obtener los productps sin autenticacion
            { url: /\/api\/v1\/products(.*)/, methods: ['GET', 'OPTIONS'] },
            { url: /\/api\/v1\/categories(.*)/ , methods: ['GET', 'OPTIONS']},
            { url: /\/api\/v1\/orders(.*)/, methods: ['GET', 'OPTIONS', 'POST'] },
            { url: /\/api\/v1\/users(.*)/, methods: ['GET', 'OPTIONS', 'POST'] },
            `${api}/users/login`,
            `${api}/users/register`
            // { url: /(.*)/ },
        ],
    })
}

//el payload contiene los datos que están dentro del token, por ejemplo, quiero obtener isAdmin de
//el token, que está registrado para el usuario, y este usuario me lo envía con los encabezados de solicitud.

// async function isRevoked(req, { payload }) {
//     return !payload.isAdmin
// }

async function isRevoked(req, payload, done){
    if(!payload.isAdmin){
        done(null, true);  //si no es Admin, entonces será rechazado
    }

    done(); //si es admin podes seguir

}

module.exports = authJwt;