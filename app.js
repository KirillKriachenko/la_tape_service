const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const app = express()
const port = process.env.PORT || 8089


var xmlrpc = require('xmlrpc')
var Odoo = require('odoo-xmlrpc')

const publicDir = path.join(__dirname, '/public')
const viewPath = path.join(__dirname, '/templates')


app.set('view engine', 'hbs')
app.set('views', viewPath)

var odoo = new Odoo({
    url: 'https://odoo.livingart.ca',
    port: '8443',
    db: 'odoo.livingart.ca',
    username: 'gregoryr@livingart.ca',
    password: 'Gregory@123'
})



app.use(express.static(publicDir))
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.get('', (req, res) => {
    res.render('index', {title: 'Main Menu'})
})
app.get('/tape/template', (req, res) => {
    const TAPE_CATEGORY_ID = 448;

    odoo.connect(function (err) {
        if (err) {
            return console.log(err);
        }
        console.log('Connected to Odoo server.');
        var inParams = [];
        inParams.push([['categ_id', '=', TAPE_CATEGORY_ID]]);
        inParams.push(['name', 'qty_available', 'default_code', 'attribute_line_ids', 'product_variant_count', 'image_1920']); //fields

        var params = [];
        params.push(inParams);
        odoo.execute_kw('product.template', 'search_read', params, function (err, value) {
            if (err) {
                return console.log(err);
            }
            // console.log('Result: ', value);
            res.render('choosetemplate', {data: value})
        });
    });
})

app.post('/tape/template', (req, res, next) => {
    console.log('POST METHOD')
    console.log(req.body.list)
    var list = JSON.parse(req.body.list)

    var update_data = (callback) => {
        for (var i = 0; i < list.length; i++) {
            var id = list[i].id;
            var counter = list[i].counter;
            var quantity = list[i].qty;
            var tmpl = list[i].tmpl;

            console.log(quantity)


            odoo.connect(function (err) {
                if (err) {
                    return console.log(err);
                }
                console.log('Connected to Odoo server.');
                var inParams = [];

                inParams.push({'product_id': id, 'new_quantity': quantity, 'product_tmpl_id': tmpl})
                var params = [];
                params.push(inParams);
                odoo.execute_kw('stock.change.product.qty', 'create', params, function (err, value) {
                    if (err) {
                        return console.log(err);
                    }
                    console.log('Result: ', value);


                    odoo.connect(function (err) {
                        if (err) {
                            return console.log(err);
                        }
                        console.log('Connected to Odoo server.');
                        var inParams = [];

                        inParams.push(value)
                        // inParams.push('read');
                        // inParams.push(false); //raise_exception
                        var params = [];
                        params.push(inParams);
                        odoo.execute_kw('stock.change.product.qty', 'change_product_qty', params, function (err, value) {
                            if (err) {
                                return console.log(err);
                            }
                            console.log('Result: ', value);


                        });
                    });

                });
            });

            // var update_data = (callback) =>{
            //     odoo.connect(function (err) {
            //         if (err) {
            //             return console.log(err);
            //         }
            //         console.log('Connected to Odoo server.');
            //
            //         var inParams = [];
            //         inParams.push([['product_id', '=', parseInt(id)],['location_id','=',29]]);
            //         inParams.push(['id']); //fields
            //
            //         var params = [];
            //         params.push(inParams);
            //         odoo.execute_kw('stock.quant', 'search_read', params, function (err, value) {
            //             if (err) {
            //                 return console.log(err);
            //             }
            //             console.log('Result: ', value[0].id);
            //             callback(value[0].id)
            //         });
            //     });
            // }
            //
            // update_data((dataID) =>{
            //
            //     console.log('DATA', dataID)
            //     console.log('Quantity',quantity)
            //     odoo.connect(function (err) {
            //         if (err) { return console.log(err); }
            //         console.log('Connected to Odoo server.');
            //         console.log(dataID)
            //         var inParams = [];
            //         inParams.push([dataID]); //id to update
            //         inParams.push({'inventory_quantity': quantity})
            //         var params = [];
            //         params.push(inParams);
            //         odoo.execute_kw('stock.quant', 'write', params, function (err, value) {
            //             if (err) { return console.log(err); }
            //             console.log('Result: ', value);
            //         });
            //     });
            //
            // })
        }
        callback()
    }
    update_data((data) =>{
        function redirect(){
            res.redirect('/tape/template')
        }
        setTimeout(redirect,1500  )

    })


})

app.get('/tape/products', (req, res) => {
    if (!req.query.template) {
        return res.send({
            error: 'You must provice search term'
        })
    }

    // console.log(req.query.template)

    var dataList = (callback) => {
        odoo.connect(function (err) {
            if (err) {
                return console.log(err);
            }
            console.log('Connected to Odoo server.');
            var inParams = [];
            inParams.push([['product_tmpl_id', '=', parseInt(req.query.template)]]);

            var params = [];
            params.push(inParams);
            odoo.execute_kw('product.product', 'search_read', params, function (err, value) {
                if (err) {
                    console.log(err);
                    return res.send({
                        error: err
                    })
                }

                callback(value)
            });

        });
    }

    dataList((data) => {
        res.render('registertape', {data: data})
    })


    // odoo.connect(function (err) {
    //     if (err) {
    //         return console.log(err);
    //     }
    //     console.log('Connected to Odoo server.');
    //     var inParams = [];
    //     inParams.push([['product_tmpl_id', '=', parseInt(req.query.template)]]);
    //
    //     var params = [];
    //     params.push(inParams);
    //     odoo.execute_kw('product.product', 'search_read', params, function (err, value) {
    //         if (err) {
    //             console.log(err);
    //             return res.send({
    //                 error: err
    //             })
    //         }
    //
    //
    //     });
    //
    // });

    // res.render('registertape', {data: value})
})


app.listen(port, () => console.log('Listening on port http://localhost:8089 ${port}'));


// odoo.connect(function (err) {
//     if (err) { return console.log(err); }
//     console.log('Connected to Odoo server.');
//     var inParams = [];
//     inParams.push([['product_tmpl_id', '=', parseInt(req.query.template)]]);
//
//     var params = [];
//     params.push(inParams);
//     var products = odoo.execute_kw('product.product', 'search_read', params, function (err, value) {
//         if (err) {
//             console.log(err);
//             return res.send({
//                 error:err
//             })
//         }
//
//         console.log(value)
//
//         // console.log('Result: ', value);
//         // res.render('registertape',{data:value})
//         return {
//             value
//         };
//     });
//     console.log(products)
//     // res.render('registertape',{data:value})
// });


//     var server = xmlrpc.createServer({host:'localhost',port:9090})
//     // Handle methods not found
//     server.on('NotFound',function (method,params) {
//         console.log('Method ' + method + 'does bit exist')
//     })
//     // Handle method calls by listening for events with the method call name
//     server.on('anAction', function (err, params, callback) {
//         console.log('Method call params for \'anAction\': ' + params)
//         callback(null, 'aResult')
//     })
//     console.log('XML-RPC server listening on port 9091')
//     res.render('registertape',{})