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