const express = require('express')
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

// var odoo = new Odoo({
//     url: 'https://odoo.livingart.ca',
//     port: '8443',
//     db: 'odoo.livingart.ca',
//     username: 'kirill@livingart.ca',
//     password: 'a1b2Norm911me'
// })


app.use(express.static(publicDir))
console.log(publicDir)

app.get('', (req, res) => {
    res.render('index', {title: 'Main Menu'})
})
app.get('/tape/template', (req, res) => {
    const  TAPE_CATEGORY_ID = 448;

    odoo.connect(function (err) {
        if (err) { return console.log(err); }
        console.log('Connected to Odoo server.');
        var inParams = [];
        inParams.push([['categ_id', '=', TAPE_CATEGORY_ID]]);
        inParams.push(['name', 'qty_available','default_code','attribute_line_ids','product_variant_count', 'image_1920']); //fields

        var params = [];
        params.push(inParams);
        odoo.execute_kw('product.template', 'search_read', params, function (err, value) {
            if (err) { return console.log(err); }
            console.log('Result: ', value);
            res.render('choosetemplate',{data:value})
        });
    });
})

app.get('/tape/products',(req,res) =>{
    if(!req.query.template){
        return res.send({
            error:'You must provice search term'
        })
    }

    console.log(req.query.template)
    odoo.connect(function (err) {
        if (err) { return console.log(err); }
        console.log('Connected to Odoo server.');
        var inParams = [];
        inParams.push([['product_tmpl_id', '=', parseInt(req.query.template)]]);
        // inParams.push([['product_tmpl_id', '=', req.query.template]]);
        // inParams.push(['name', 'qty_available','image_1920']); //fields

        var params = [];
        params.push(inParams);
        odoo.execute_kw('product.product', 'search_read', params, function (err, value) {
            if (err) {
                console.log(err);
                return res.send({
                    error:err
                })
            }

            console.log('Result: ', value);
            res.render('registertape',{data:value})
        });
    });
})


app.listen(port, () => console.log('Listening on port http://localhost:8089 ${port}'));


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