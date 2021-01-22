console.log('Client side javascript file is loaded!')
var tapeList = []

function plusTape(elementId) {

    var counter = parseInt(document.getElementById("counter-" + elementId).innerText)
    var quantity = parseInt(document.getElementById("quantity-" + elementId).innerText)
    var tmplId = parseInt(document.getElementById("tmlp-id-"+elementId).innerText)

    if (quantity > 0) {
        quantity = quantity - 1
        counter = counter + 1

        if (quantity == 0) {
            document.getElementById("plus-btn-" + elementId).style.visibility = "hidden";
        }


        document.getElementById("counter-" + elementId).innerHTML = counter
        document.getElementById("quantity-" + elementId).innerHTML = quantity


        var searchResult = searchInArray(elementId, tapeList)

        if (searchResult == null) {
            tapeList.push({
                'id': elementId,
                'counter': counter,
                'qty':quantity,
                'tmpl':tmplId
            })
        } else {
            searchResult.counter = counter;
            searchResult.qty = quantity;
        }

        console.log(tapeList)
        if(tapeList.length > 0){
            document.getElementById("register-btn").style.visibility = "visible";
            document.getElementById("back-btn").style.visibility = "hidden";
        }
    }

    updateInput('list');
}

function minusTape(elementId) {

    var counter = parseInt(document.getElementById("counter-" + elementId).innerText)
    var quantity = parseInt(document.getElementById("quantity-" + elementId).innerText)

    if (counter > 0) {
        quantity = quantity + 1
        counter = counter - 1

        if (quantity > 0) {
            document.getElementById("plus-btn-"+elementId).style.visibility = "visible";

        }

        document.getElementById("counter-" + elementId).innerHTML = counter
        document.getElementById("quantity-" + elementId).innerHTML = quantity

        var searchResult = searchInArray(elementId, tapeList)

        if (searchResult != null) {
            searchResult.counter = counter;
            searchResult.qty = quantity;

            if (counter <= 0){
                removeFromArray(elementId,tapeList)
            }
        }

        var elements = countDataArray(tapeList)
        if(elements <= 0){
            document.getElementById("register-btn").style.visibility = "hidden";
            document.getElementById("back-btn").style.visibility = "visible";
        }

        console.log(tapeList)
    }

    updateInput('list');
}

function searchInArray(nameKey, myArray) {

    for (var i = 0; i < myArray.length; i++) {
        if (myArray[i].id === nameKey) {
            return myArray[i];
        }
    }

    return null;
}

function removeFromArray(nameKey,myArray){
    for (var i = 0; i < myArray.length; i++) {
        if (myArray[i].id === nameKey) {
            myArray.splice(i,1)
        }
    }
}

function countDataArray(myArray){
    data_counter = 0
    for (var i = 0; i < myArray.length; i++){
        data_counter = data_counter + myArray[i].counter
    }
    return data_counter
}


function updateInput(inputID){
    var input = document.getElementById(inputID);
    input.value = ''
    input.value = JSON.stringify(tapeList)
}

// fetch('/tape/template', {
//
//     method: 'POST',
//     headers: {
//         'Content-Type': 'application/json'
//     },
//     body: JSON.stringify({
//         list:tapeList
//         // user: {
//         //     name: "John",
//         //     email: "john@example.com"
//         // }
//     })
// });