const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const app = express()
const hostname = '0.0.0.0';
const port = process.env.NODE_PORT || 8089;
const env = process.env;

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
    username: 'kirill@livingart.ca',
    password: 'a1b2Norm911me'
})


app.use(express.static(publicDir))
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.get('', (req, res) => {
    res.render('search', {title: 'Main Menu'})
})
app.get('/tape/template', (req, res) => {
    const TAPE_CATEGORY_ID = 448;

    odoo.connect(function (err) {
        if (err) {
            return console.log(err);
        }
        console.log('Request find all tapes');

        var findAllCategoryParams = []
        findAllCategoryParams.push([['parent_id', '=', TAPE_CATEGORY_ID]])
        findAllCategoryParams.push(['id', 'name'])

        var findAllCategory = [];
        findAllCategory.push(findAllCategoryParams)
        var all_category = odoo.execute_kw('product.category', 'search_read', findAllCategory, function (err, value) {
            if (err) {
                return console.log(err);
            }

            // console.log(value);
            id_list = []
            for (let i = 0; i < value.length; i++) {
                // console.log(value[i].id)
                id_list.push(value[i].id)
            }

            var inParams = [];
            inParams.push([['categ_id', 'in', id_list]]);
            inParams.push(['name', 'qty_available', 'default_code', 'attribute_line_ids', 'product_variant_count', 'image_1920']); //fields

            var params = [];
            params.push(inParams);
            console.log(params)
            odoo.execute_kw('product.template', 'search_read', params, function (err, value) {
                if (err) {
                    return console.log(err);
                }
                res.render('choosetemplate', {data: value})
            });
        })

    });
})

app.post('/tape/template', (req, res, next) => {
    var list = JSON.parse(req.body.list)

    var update_data = (callback) => {
        for (var i = 0; i < list.length; i++) {
            var id = list[i].id;
            var counter = list[i].counter;
            var quantity = list[i].qty;
            var tmpl = list[i].tmpl;

            odoo.connect(function (err) {
                if (err) {
                    return console.log(err);
                }
                console.log('Request find specific tape');
                var inParams = [];

                inParams.push({'product_id': id, 'new_quantity': quantity, 'product_tmpl_id': tmpl})
                var params = [];
                params.push(inParams);
                odoo.execute_kw('stock.change.product.qty', 'create', params, function (err, value) {
                    if (err) {
                        return console.log(err);
                    }
                    odoo.connect(function (err) {
                        if (err) {
                            return console.log(err);
                        }
                        console.log('Request update stock quantity');
                        var inParams = [];

                        inParams.push(value)
                        var params = [];
                        params.push(inParams);
                        odoo.execute_kw('stock.change.product.qty', 'change_product_qty', params, function (err, value) {
                            if (err) {
                                return console.log(err);
                            }

                        });
                    });

                });
            });
        }
        callback()
    }
    update_data((data) => {
        function redirect() {
            res.redirect('/tape/template')
        }

        setTimeout(redirect, 1500)

    })


})

app.post('/search', (req, res) => {

    const TAPE_CATEGORY_ID = 448;
    console.log(req.body.name)
    odoo.connect(function (err) {
        var findAllCategoryParams = []
        findAllCategoryParams.push([['parent_id', '=', TAPE_CATEGORY_ID]])
        findAllCategoryParams.push(['id', 'name'])

        var findAllCategory = [];
        findAllCategory.push(findAllCategoryParams)
        var all_category = odoo.execute_kw('product.category', 'search_read', findAllCategory, function (err, value) {
            if (err) {
                return console.log(err);
            }

            // console.log(value);
            id_list = []
            for (let i = 0; i < value.length; i++) {
                // console.log(value[i].id)
                id_list.push(value[i].id)
            }

            var inParams = [];

            // search_name = req.body.name
            // if (search_name != 'all') {
            //
            // } else {
            //     inParams.push([['categ_id', 'in', id_list]]);
            // }
            inParams.push([['categ_id', 'in', id_list], ['name', 'ilike', req.body.name]]);
            inParams.push(['name', 'qty_available', 'categ_id', 'attribute_line_ids', 'product_variant_count']); //fields

            var params = [];
            params.push(inParams);
            // console.log(params)
            odoo.execute_kw('product.template', 'search_read', params, function (err, value) {
                if (err) {
                    return console.log(err);
                }
                //  Template Data
                // console.log(value)

                // res.send(value)

                id_list = []
                for (let i = 0; i < value.length; i++) {
                    // console.log(value[i].id)
                    id_list.push(value[i].id)
                }


                var inParams = [];

                inParams.push([['name', 'ilike', req.body.name], ['product_tmpl_id', 'in', id_list]]);
                inParams.push(['id', 'name', 'categ_id', 'qty_available', 'product_template_attribute_value_ids']);

                var params = [];
                params.push(inParams);

                odoo.execute_kw('product.product', 'search_read', params, function (err, value) {
                    if (err) {
                        return console.log(err);
                    }
                    res.send(value);
                })

            });
        })


        // function get_variant_name

        // for(let i = 0; i < value_produt.length; i++){
        //     console.log(value_produt[i])
        //
        //     console.log(value_produt[i].product_template_attribute_value_ids[0])
        //
        //     var inParams = [];
        //     inParams.push([['id','=',value_produt[i].product_template_attribute_value_ids[0]]])
        //     inParams.push(['id','name'])
        //
        //     var params = [];
        //     params.push(inParams)
        //
        //     console.log(inParams)
        //     console.log(params)
        //
        //     odoo.execute_kw('product.template.attribute.value', 'search_read', params, function (err, value) {
        //         if (err) {
        //             return console.log(err);
        //         }
        //
        //         // console.log(value)
        //
        //     });
        // }


        // var inParams = [];
        // // inParams.push([['name', 'like', req.body.name]]);
        // var inParams = [];
        //
        // // inParams.push([['id', '=', 14]]);
        // inParams.push([['id', '=', 8754]]);
        // inParams.push(['id', 'name']);
        //
        // var params = [];
        // params.push(inParams);
        //
        //
        // console.log(inParams)
        // console.log(params)
        //
        //
        // odoo.execute_kw('product.attribute.value', 'search_read', params, function (err, value) {
        //     if (err) {
        //         return console.log(err);
        //     }
        //
        //     console.log(value)
        //
        // });


        // var inParams = [];
        // // inParams.push([['name', 'like', req.body.name]]);
        // var inParams = [];
        //
        // inParams.push([['name', 'like', req.body.name]]);
        // inParams.push(['id','name']);
        //
        // var params = [];
        // params.push(inParams);
        //
        //
        // console.log(inParams)
        // console.log(params)
        //
        // odoo.execute_kw('product.product', 'search_read', params, function (err, value) {
        //     if (err) {
        //         return console.log(err);
        //     }
        //     console.log(value)
        //
        //     res.send(value)
        //
        // });


    })


})

app.get('/tape/products', (req, res) => {
    if (!req.query.template) {
        return res.send({
            error: 'You must provide search term'
        })
    }

    var dataList = (callback) => {
        odoo.connect(function (err) {
            if (err) {
                return console.log(err);
            }
            console.log('Request find specific tape');
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
})


app.listen(port, hostname, () => console.log('Listening on port http://' + hostname + ':' + port + '/'));