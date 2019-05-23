const isAuth = require('../auth/IsAuth.js')
const queries = require('../db/queries.json')

module.exports = (app,mysql)=>{
    app.post("/update-wc-status",
    //isAuth.isAuthenticated,
    (req,res)=>{
        console.log('req ', req.body.wcStatus,req.body.orderId);
        if(!req.body.wcStatus || !req.body.orderId){
            return res
            .status(500)
            .send({ message: 'Estado o numero de orden no han sido ingresados'})
        }

        let compare = ["sending","cook","finished"];
        
        if(compare.indexOf(req.body.wcStatus)==-1){
            return res
            .status(500)
            .send({ message: 'Estado no valido'})
        }

        let date = new Date();

        req.body.wcStatus='wc-'+req.body.wcStatus;
        mysql.query(queries.woocommerce.update,[req.body.wcStatus,date,date,req.body.orderId],(err,orders,fields)=>{
            if (err) {
                return res
                .status(500)
                .send({ message: 'Error actualizando la base de datos' })
              }
              return res
                .status(200)
                .send({ message: 'Orden actualizada',
                'data': orders}) 
        
        })
        


        
    })
}