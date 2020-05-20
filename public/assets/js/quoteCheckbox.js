function onlyOneA(checkbox) {
    var checkboxes = document.getElementsByName('compA')
    checkboxes.forEach((item) => {
        if (item !== checkbox) item.checked = false
    })
}
function onlyOneB(checkbox) {
    var checkboxes = document.getElementsByName('compB')
    checkboxes.forEach((item) => {
        if (item !== checkbox) item.checked = false
    })
}
function onlyOneC(checkbox) {
    var checkboxes = document.getElementsByName('compC')
    checkboxes.forEach((item) => {
        if (item !== checkbox) item.checked = false
    })
}
function onlyOneD(checkbox) {
    var checkboxes = document.getElementsByName('compD')
    checkboxes.forEach((item) => {
        if (item !== checkbox) item.checked = false
    })
}

function flyingOrDriving(checkbox) {
    var checkboxes = document.getElementsByName('flyOrDrive');
    checkboxes.forEach((item) => {
        if (item !== checkbox){
            item.checked = false
            if((item.value).toString() == 'fly'){
                $('#drivingDiv').show();
                $('#flyingDiv').hide();
            }else{
                $('#flyingDiv').show();
                $('#drivingDiv').hide();
            }
        }
    })
}

/*function editFlyingOrDriving(checkbox) {

        var checkboxes = document.getElementsByName('editFlyOrDrive');
    console.log(checkbox.id);
        var currentSlide = $('#carouselExampleIndicators div.active').index() + 1;
        checkboxes.forEach((item) => {
            if (item.id != checkbox.id) {
                console.log(item.id);

                item.removeAttribute('checked');
            }
            if (item.id.split('-')[1] == currentSlide) {
                var editDrivingDivId = "\'#editDrivingDiv-" + item.id.split('-')[1] + "\'";
                var editFlyingDivId = "\'#editFlyingDiv-" + item.id.split('-')[1] + "\'";

                if ((item.value).toString() == 'drive') {
                    console.log('test');
                    $(editFlyingDivId).hide();
                    $(editDrivingDivId).show();

                } else {
                    console.log('test2');
                    $(editDrivingDivId).hide();
                    $(editFlyingDivId).show();
                }
            }
        });
}*/

function editFlyingOrDriving(checkbox) {
    var currentSlide = $('#carouselExampleIndicators div.active').index() + 1;
    var checkboxes = document.getElementsByName('editFlyOrDrive');

    checkboxes.forEach((item) => {
        if(item.id.split('-')[1] == currentSlide.toString()) {
            if (item !== checkbox) {
                item.checked = false;

                var drivingDiv = 'editDrivingDiv-' + currentSlide;
                var flyingDiv = 'editFlyingDiv-' + currentSlide;

                if (item.id.split('-')[0].toString() == 'fly') {
                    console.log('test');
                    document.getElementById(flyingDiv).style.display = "none";
                    document.getElementById(drivingDiv).style.display = "flex";
                } else {
                    console.log('test2');
                    document.getElementById(flyingDiv).style.display = "flex";
                    document.getElementById(drivingDiv).style.display = "none";
                }
            }
        }
    });
}

//Add Freight
function typeOfTruck(checkbox) {
    var checkboxes = document.getElementsByName('truckType');
    checkboxes.forEach((item) => {
        if (item !== checkbox) item.checked = false
    })
}

function freightDestination(checkbox) {
    var checkboxes = document.getElementsByName('destinationType');
    checkboxes.forEach((item) => {
        if (item !== checkbox)item.checked = false
    })
}

//Edit Freight
function editTypeOfTruck(checkbox) {
    var checkboxes = document.getElementsByName('editTruckType');
    checkboxes.forEach((item) => {
        if (item !== checkbox) {
            item.checked = false
        }
    })
}

function editFreightDestination(checkbox) {
    var checkboxes = document.getElementsByName('editDestinationType');
    checkboxes.forEach((item) => {
        if (item !== checkbox) {
            item.checked = false
        }
    })
}

function devMfg(selectObj) {
    let mfg = selectObj.value;
    let brkAccDropdown = document.getElementsByName('brkAccDropdownArr');
    for(let row of brkAccDropdown){
        if(mfg.includes(row.value)){
            document.getElementById(row.value).style.display = 'block';
        } else {
            document.getElementById(row.value).style.display = 'none';
            for(let el of document.getElementById(row.value).getElementsByTagName('li')){
                el.children[0].checked = false;

                for(let el2 of el.getElementsByTagName('li')){
                    el2.children[0].checked = false;
                }
            }
        }
    }
}

function accBrk(checkbox) {
    if(checkbox.checked == true)
        document.getElementById(checkbox.id + 'Opt').style.display = "table-row";
    else {
        document.getElementById(checkbox.id + 'Opt').style.display = "none";
        for(let el of document.getElementById(checkbox.id + 'Opt').getElementsByTagName('li')){
            if (el.children[1].checked == true) {
                el.children[1].checked = false;
                el.children[0].value = '0';
            }
        }
    }
}

function accBrkEdit(checkbox) {
    if (checkbox.checked == true)
        document.getElementById(checkbox.id + 'Opt_Edit').style.display = "block";
    else {
        document.getElementById(checkbox.id + 'Opt_Edit').style.display = "none";
        for (let el of document.getElementById(checkbox.id + 'Opt_Edit').getElementsByTagName('li')) {
            if (el.children[1].checked == true) {
                el.children[1].checked = false;
                el.children[0].value = '0';
            }
        }
    }
}
/*
function accBrkOpt(checkbox) {
    let anyChecked = false;
    let parent = checkbox.value.split('_')[0] + '_' + checkbox.value.split('_')[1] + 'Opt';
    for(let el of document.getElementById(parent).getElementsByTagName('li')){
        console.log(el.children[0].checked);
        if(el.children[0].checked == true){
            anyChecked = true;
        }
    }
    console.log(anyChecked);
    if(anyChecked == false){
        document.getElementById(parent).style.display = "none";
        document.getElementById(checkbox.value.split('_')[0] + '_' + checkbox.value.split('_')[1]).checked = false;
    }
}*/

//Section properties panelboard detail button
/*function compAdetails(selectObj) {
    console.log(selectObj);
    let pb = selectObj.value.split('_')[0];
    let div = 'details_' + selectObj.value.split('_')[1] + '_A';
    if(pb == 'panelboard'){
        document.getElementById(div).style.display = "flex";
    } else {
        document.getElementById(div).style.display = "none";
    }
}

function compBdetails(selectObj) {
    let pb = selectObj.value.split('_')[0];
    let div = 'details_' + selectObj.value.split('_')[1] + '_B';
    if(pb == 'panelboard'){
        document.getElementById(div).style.display = "flex";
    } else {
        document.getElementById(div).style.display = "none";
    }
}

function compCdetails(selectObj) {
    let pb = selectObj.value.split('_')[0];
    let div = 'details_' + selectObj.value.split('_')[1] + '_C';
    if(pb == 'panelboard'){
        document.getElementById(div).style.display = "flex";
    } else {
        document.getElementById(div).style.display = "none";
    }
}

function compDdetails(selectObj) {
    let pb = selectObj.value.split('_')[0];
    let div = 'details_' + selectObj.value.split('_')[1] + '_D';
    if(pb == 'panelboard'){
        document.getElementById(div).style.display = "flex";
    } else {
        document.getElementById(div).style.display = "none";
    }
}*/

function showComp(secNum){
    let element = document.getElementById('compA' + secNum);
    let event = new Event('change');
    element.dispatchEvent(event);

    let element2 = document.getElementById('compB' + secNum);
    let event2 = new Event('change');
    element2.dispatchEvent(event2);

    let element3 = document.getElementById('compC' + secNum);
    let event3 = new Event('change');
    element3.dispatchEvent(event3);

    let element4 = document.getElementById('compD' + secNum);
    let event4 = new Event('change');
    element4.dispatchEvent(event4);
}

function getComp(comp){
    $(".modal-header #getComp").val( comp );
}

function showPB(checkbox){
    let checkboxes = document.getElementsByName('pbCheck');
    let noChecks = true;
    let secNum = checkbox.id.split('_')[1];
    checkboxes.forEach((item) => {
        if (item !== checkbox){
            item.checked = false
        }

        if(item.checked == true){
            noChecks = false;
            document.getElementById('pb' + secNum).style.display = "flex";
            document.getElementById('configurePB' + secNum).style.display = "flex";
        } else {
            document.getElementById('pbBrk' + secNum).style.display = "none";
            document.getElementById('notPB' + secNum).style.display = "none";
        }
    });

    if(noChecks){
        document.getElementById('notPB' + secNum).style.display = "flex";
        document.getElementById('pb' + secNum).style.display = "none";
        document.getElementById('configurePB' + secNum).style.display = "none";
    }
}

function showPBbrk(checkbox){
    var checkboxes = document.getElementsByName('pbCheck');
    let noChecks = true;
    let secNum = checkbox.id.split('_')[1];
    checkboxes.forEach((item) => {
        if (item !== checkbox){
            item.checked = false
        }

        if(item.checked == true){
            noChecks = false;
            document.getElementById('pbBrk' + secNum).style.display = "flex";
            document.getElementById('configurePB' + secNum).style.display = "flex";
        } else {
            document.getElementById('pb' + secNum).style.display = "none";
            document.getElementById('notPB' + secNum).style.display = "none";
        }
    });

    if(noChecks){
        document.getElementById('notPB' + secNum).style.display = "flex";
        document.getElementById('pbBrk' + secNum).style.display = "none";
        document.getElementById('configurePB' + secNum).style.display = "none";
    }
}

function checkForPB(secNum, compType){
    if(compType.A == 'panelboard' && compType.D != 'brk'){
        document.getElementById('pb' + secNum).style.display = "flex";
        document.getElementById('configurePB' + secNum).style.display = "flex";
        document.getElementById('pbBrk' + secNum).style.display = "none";
        document.getElementById('notPB' + secNum).style.display = "none";
        document.getElementById('panelboard_' + secNum).checked = true;

    } else if(compType.A == 'panelboard' && compType.D == 'brk'){
        document.getElementById('pbBrk' + secNum).style.display = "flex";
        document.getElementById('configurePB' + secNum).style.display = "flex";
        document.getElementById('pb' + secNum).style.display = "none";
        document.getElementById('notPB' + secNum).style.display = "none";
        document.getElementById('panelboardbrk_' + secNum).checked = true;
    }
}


