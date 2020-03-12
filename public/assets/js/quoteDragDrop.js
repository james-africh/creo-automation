(function breakerDragDrop()
{
    //exclude older browsers by the features we need them to support
    //and legacy opera explicitly so we don't waste time on a dead browser
    if
    (
        !document.querySelectorAll
        ||
        !('draggable' in document.createElement('span'))
        ||
        window.opera
    )
    { return; }

    //get the collection of draggable targets and add their draggable attribute
    for(var
            targets = document.querySelectorAll('[data-draggable="target"]'),
            len = targets.length,
            i = 0; i < len; i ++)
    {
        targets[i].setAttribute('aria-dropeffect', 'none');
    }

    //get the collection of draggable items and add their draggable attributes
    for(var
            items = document.querySelectorAll('[data-draggable="item"]'),
            len = items.length,
            i = 0; i < len; i ++)
    {
        items[i].setAttribute('draggable', 'true');
        items[i].setAttribute('aria-grabbed', 'false');
        items[i].setAttribute('tabindex', '0');
    }


    //dictionary for storing the selections data
    //comprising an array of the currently selected items
    //a reference to the selected items' owning container
    //and a refernce to the current drop target container
    var selections =
        {
            items      : [],
            owner      : null,
            droptarget : null
        };

    //function for selecting an item
    function addSelection(item)
    {
        //if the owner reference is still null, set it to this item's parent
        //so that further selection is only allowed within the same container
        if(!selections.owner)
        {
            selections.owner = item.parentNode;
        }

        //or if that's already happened then compare it with this item's parent
        //and if they're not the same container, return to prevent selection
        else if(selections.owner != item.parentNode)
        {
            return
        }

        //set this item's grabbed state
        item.setAttribute('aria-grabbed', 'true');

        //add it to the items array
        selections.items.push(item);
    }

    //function for unselecting an item
    function removeSelection(item)
    {
        //reset this item's grabbed state
        item.setAttribute('aria-grabbed', 'false');

        //then find and remove this item from the existing items array
        for(var len = selections.items.length, i = 0; i < len; i ++)
        {
            if(selections.items[i] == item)
            {
                selections.items.splice(i, 1);
                break;
            }
        }
    }

    //function for resetting all selections
    function clearSelections()
    {
        //if we have any selected items
        if(selections.items.length)
        {
            //reset the owner reference
            selections.owner = null;

            //reset the grabbed state on every selected item
            for(var len = selections.items.length, i = 0; i < len; i ++)
            {
                selections.items[i].setAttribute('aria-grabbed', 'false');
            }

            //then reset the items array
            selections.items = [];
        }
    }

    //shorctut function for testing whether a selection modifier is pressed
    function hasModifier(e)
    {
        return (e.ctrlKey || e.metaKey || e.shiftKey);
    }


    //function for applying dropeffect to the target containers
    function addDropeffects()
    {
        //apply aria-dropeffect and tabindex to all targets apart from the owner
        for(var len = targets.length, i = 0; i < len; i ++)
        {
            if
            (
                targets[i] != selections.owner
                &&
                targets[i].getAttribute('aria-dropeffect') == 'none'
            )
            {
                targets[i].setAttribute('aria-dropeffect', 'move');
                targets[i].setAttribute('tabindex', '0');
            }
        }

        //remove aria-grabbed and tabindex from all items inside those containers
        for(var len = items.length, i = 0; i < len; i ++)
        {
            if
            (
                items[i].parentNode != selections.owner
                &&
                items[i].getAttribute('aria-grabbed')
            )
            {
                items[i].removeAttribute('aria-grabbed');
                items[i].removeAttribute('tabindex');
            }
        }
    }

    //function for removing dropeffect from the target containers
    function clearDropeffects()
    {
        //if we have any selected items
        if(selections.items.length)
        {
            //reset aria-dropeffect and remove tabindex from all targets
            for(var len = targets.length, i = 0; i < len; i ++)
            {
                if(targets[i].getAttribute('aria-dropeffect') != 'none')
                {
                    targets[i].setAttribute('aria-dropeffect', 'none');
                    targets[i].removeAttribute('tabindex');
                }
            }

            //restore aria-grabbed and tabindex to all selectable items
            //without changing the grabbed value of any existing selected items
            for(var len = items.length, i = 0; i < len; i ++)
            {
                if(!items[i].getAttribute('aria-grabbed'))
                {
                    items[i].setAttribute('aria-grabbed', 'false');
                    items[i].setAttribute('tabindex', '0');
                }
                else if(items[i].getAttribute('aria-grabbed') == 'true')
                {
                    items[i].setAttribute('tabindex', '0');
                }
            }
        }
    }

    //shortcut function for identifying an event element's target container
    function getContainer(element)
    {
        do
        {
            if(element.nodeType == 1 && element.getAttribute('aria-dropeffect'))
            {
                return element;
            }
        }
        while(element = element.parentNode);

        return null;
    }



    //mousedown event to implement single selection
    document.addEventListener('mousedown', function(e)
    {
        //if the element is a draggable item
        if(e.target.getAttribute('draggable'))
        {
            //clear dropeffect from the target containers
            clearDropeffects();

            //if the multiple selection modifier is not pressed
            //and the item's grabbed state is currently false
            if
            (
                !hasModifier(e)
                &&
                e.target.getAttribute('aria-grabbed') == 'false'
            )
            {
                //clear all existing selections
                clearSelections();

                //then add this new selection
                addSelection(e.target);
            }
        }

        //else [if the element is anything else]
        //and the selection modifier is not pressed
        else if(!hasModifier(e))
        {
            //clear dropeffect from the target containers
            clearDropeffects();

            //clear all existing selections
            clearSelections();
        }

        //else [if the element is anything else and the modifier is pressed]
        else
        {
            //clear dropeffect from the target containers
            clearDropeffects();
        }

    }, false);

    //mouseup event to implement multiple selection
    document.addEventListener('mouseup', function(e)
    {
        //if the element is a draggable item
        //and the multipler selection modifier is pressed
        if(e.target.getAttribute('draggable') && hasModifier(e))
        {
            //if the item's grabbed state is currently true
            if(e.target.getAttribute('aria-grabbed') == 'true')
            {
                //unselect this item
                removeSelection(e.target);

                //if that was the only selected item
                //then reset the owner container reference
                if(!selections.items.length)
                {
                    selections.owner = null;
                }
            }

            //else [if the item's grabbed state is false]
            else
            {
                //add this additional selection
                addSelection(e.target);
            }
        }

    }, false);

    //dragstart event to initiate mouse dragging
    document.addEventListener('dragstart', function(e)
    {
        //if the element's parent is not the owner, then block this event
        if(selections.owner != e.target.parentNode)
        {
            e.preventDefault();
            return;
        }

        //[else] if the multiple selection modifier is pressed
        //and the item's grabbed state is currently false
        if
        (
            hasModifier(e)
            &&
            e.target.getAttribute('aria-grabbed') == 'false'
        )
        {
            //add this additional selection
            addSelection(e.target);
        }

        //we don't need the transfer data, but we have to define something
        //otherwise the drop action won't work at all in firefox
        //most browsers support the proper mime-type syntax, eg. "text/plain"
        //but we have to use this incorrect syntax for the benefit of IE10+
        e.dataTransfer.setData('text', '');

        //apply dropeffect to the target containers
        addDropeffects();

    }, false);



    //keydown event to implement selection and abort
    document.addEventListener('keydown', function(e)
    {
        //if the element is a grabbable item
        if(e.target.getAttribute('aria-grabbed'))
        {
            //Space is the selection or unselection keystroke
            if(e.keyCode == 32)
            {
                //if the multiple selection modifier is pressed
                if(hasModifier(e))
                {
                    //if the item's grabbed state is currently true
                    if(e.target.getAttribute('aria-grabbed') == 'true')
                    {
                        //if this is the only selected item, clear dropeffect
                        //from the target containers, which we must do first
                        //in case subsequent unselection sets owner to null
                        if(selections.items.length == 1)
                        {
                            clearDropeffects();
                        }

                        //unselect this item
                        removeSelection(e.target);

                        //if we have any selections
                        //apply dropeffect to the target containers,
                        //in case earlier selections were made by mouse
                        if(selections.items.length)
                        {
                            addDropeffects();
                        }

                        //if that was the only selected item
                        //then reset the owner container reference
                        if(!selections.items.length)
                        {
                            selections.owner = null;
                        }
                    }

                    //else [if its grabbed state is currently false]
                    else
                    {
                        //add this additional selection
                        addSelection(e.target);

                        //apply dropeffect to the target containers
                        addDropeffects();
                    }
                }

                //else [if the multiple selection modifier is not pressed]
                //and the item's grabbed state is currently false
                else if(e.target.getAttribute('aria-grabbed') == 'false')
                {
                    //clear dropeffect from the target containers
                    clearDropeffects();

                    //clear all existing selections
                    clearSelections();

                    //add this new selection
                    addSelection(e.target);

                    //apply dropeffect to the target containers
                    addDropeffects();
                }

                //else [if modifier is not pressed and grabbed is already true]
                else
                {
                    //apply dropeffect to the target containers
                    addDropeffects();
                }

                //then prevent default to avoid any conflict with native actions
                e.preventDefault();
            }

            //Modifier + M is the end-of-selection keystroke
            if(e.keyCode == 77 && hasModifier(e))
            {
                //if we have any selected items
                if(selections.items.length)
                {
                    //apply dropeffect to the target containers
                    //in case earlier selections were made by mouse
                    addDropeffects();

                    //if the owner container is the last one, focus the first one
                    if(selections.owner == targets[targets.length - 1])
                    {
                        targets[0].focus();
                    }

                    //else [if it's not the last one], find and focus the next one
                    else
                    {
                        for(var len = targets.length, i = 0; i < len; i ++)
                        {
                            if(selections.owner == targets[i])
                            {
                                targets[i + 1].focus();
                                break;
                            }
                        }
                    }
                }

                //then prevent default to avoid any conflict with native actions
                e.preventDefault();
            }
        }

        //Escape is the abort keystroke (for any target element)
        if(e.keyCode == 27)
        {
            //if we have any selected items
            if(selections.items.length)
            {
                //clear dropeffect from the target containers
                clearDropeffects();

                //then set focus back on the last item that was selected, which is
                //necessary because we've removed tabindex from the current focus
                selections.items[selections.items.length - 1].focus();

                //clear all existing selections
                clearSelections();

                //but don't prevent default so that native actions can still occur
            }
        }

    }, false);



    //related variable is needed to maintain a reference to the
    //dragleave's relatedTarget, since it doesn't have e.relatedTarget
    var related = null;

    //dragenter event to set that variable
    document.addEventListener('dragenter', function(e)
    {
        related = e.target;

    }, false);

    //dragleave event to maintain target highlighting using that variable
    document.addEventListener('dragleave', function(e)
    {
        //get a drop target reference from the relatedTarget
        var droptarget = getContainer(related);

        //if the target is the owner then it's not a valid drop target
        if(droptarget == selections.owner)
        {
            droptarget = null;
        }

        //if the drop target is different from the last stored reference
        //(or we have one of those references but not the other one)
        if(droptarget != selections.droptarget)
        {
            //if we have a saved reference, clear its existing dragover class
            if(selections.droptarget)
            {
                selections.droptarget.className =
                    selections.droptarget.className.replace(/ dragover/g, '');
            }

            //apply the dragover class to the new drop target reference
            if(droptarget)
            {
                droptarget.className += ' dragover';
            }

            //then save that reference for next time
            selections.droptarget = droptarget;
        }

    }, false);

    //dragover event to allow the drag by preventing its default
    document.addEventListener('dragover', function(e)
    {
        //if we have any selected items, allow them to be dragged
        if(selections.items.length)
        {
            e.preventDefault();
        }

    }, false);



    //WHEN ITEM IS PLACED IN COMPARTMENT
    //dragend event to implement items being validly dropped into targets,
    //or invalidly dropped elsewhere, and to clean-up the interface either way
    document.addEventListener('dragend', function(e)
    {
        let compType = selections.droptarget.id.split('-')[2];
        let brkItems = document.getElementById(selections.droptarget.id).getElementsByTagName('li').length;

        //if we have a valid drop target reference
        //(which implies that we have some selected items)
        if(selections.droptarget)
        {
            //append the selected items to the end of the target container
            for(var len = selections.items.length, i = 0; i < len; i ++)
            {
                let itemType = selections.items[i].id.split('_')[1];
                if(compType == itemType){
                    if(compType == 'brk'){
                        if(brkItems == 0)
                            selections.droptarget.appendChild(selections.items[i]);
                    } else
                        selections.droptarget.appendChild(selections.items[i]);

                }
            }

            //prevent default to allow the action
            e.preventDefault();

        }

        //if we have any selected items
        if(selections.items.length)
        {
            //clear dropeffect from the target containers
            clearDropeffects();

            //if we have a valid drop target reference
            if(selections.droptarget)
            {
                //reset the selections array
                clearSelections();

                //reset the target's dragover class
                selections.droptarget.className =
                    selections.droptarget.className.replace(/ dragover/g, '');

                //reset the target reference
                selections.droptarget = null;
            }

        }

    }, false);




    //keydown event to implement items being dropped into targets
    document.addEventListener('keydown', function(e)
    {
        //if the element is a drop target container
        if(e.target.getAttribute('aria-dropeffect'))
        {
            //Enter or Modifier + M is the drop keystroke
            if(e.keyCode == 13 || (e.keyCode == 77 && hasModifier(e)))
            {
                //append the selected items to the end of the target container
                for(var len = selections.items.length, i = 0; i < len; i ++)
                {
                    e.target.appendChild(selections.items[i]);
                }

                //clear dropeffect from the target containers
                clearDropeffects();

                //then set focus back on the last item that was selected, which is
                //necessary because we've removed tabindex from the current focus
                selections.items[selections.items.length - 1].focus();

                //reset the selections array
                clearSelections();

                //prevent default to to avoid any conflict with native actions
                e.preventDefault();

            }
        }
    }, false);

    document.getElementById('quoteSaveSectionBtn').addEventListener('click', function() {
        let secNum = document.getElementById('numSectionsSave').value;
        let layoutNum = document.getElementById('layoutNumSave').value;
        let secArr = [];

        function getCompA(secNum) {
            let brkA = document.getElementById(secNum + '_' + layoutNum + '-A-brk');
            let controlA = document.getElementById(secNum + '_' + layoutNum + '-A-control');
            let panelboardA = document.getElementById(secNum + '_' + layoutNum + '-A-panelboard');

            if(brkA)
                return brkA.children;
            else if(controlA)
                return controlA.children;
            else if(panelboardA)
                return panelboardA.children;
            else
                return null;
        }

        function getCompB(secNum){
            let brkB = document.getElementById(secNum + '_' + layoutNum + '-B-brk');
            let controlB = document.getElementById(secNum + '_' + layoutNum + '-B-control');
            let panelboardB = document.getElementById(secNum + '_' + layoutNum + '-B-panelboard');

            if(brkB)
                return brkB.children;
            else if(controlB)
                return controlB.children;
            else if(panelboardB)
                return panelboardB.children;
            else
                return null;
        }

        function getCompC(secNum){
            let brkC = document.getElementById(secNum + '_' + layoutNum + '-C-brk');
            let controlC = document.getElementById(secNum + '_' + layoutNum + '-C-control');
            let panelboardC = document.getElementById(secNum + '_' + layoutNum + '-C-panelboard');

            if(brkC)
                return brkC.children;
            else if(controlC)
                return controlC.children;
            else if(panelboardC)
                return panelboardC.children;
            else
                return null;
        }

        function getCompD(secNum){
            let brkD = document.getElementById(secNum + '_' + layoutNum + '-D-brk');
            let controlD = document.getElementById(secNum + '_' + layoutNum + '-D-control');
            let panelboardD = document.getElementById(secNum + '_' + layoutNum + '-D-panelboard');

            if(brkD)
                return brkD.children;
            else if(controlD)
                return controlD.children;
            else if(panelboardD)
                return panelboardD.children;
            else
                return null;
        }

        for (let j = 0; j < secNum; j++) {
            let secNum = j+1;
            let tempObj = {
                secNum: secNum,
                compA: null,
                compB: null,
                compC: null,
                compD: null
            };
            let compA = getCompA(secNum);
            let compB = getCompB(secNum);
            let compC = getCompC(secNum);
            let compD = getCompD(secNum);

            if(compA){
                for(let el of compA){
                    if(tempObj.compA == null)
                        tempObj.compA = el.id.split('_')[0];
                    else
                        tempObj.compA = tempObj.compA + ',' + el.id.split('_')[0];
                }
            }
            if(compB){
                for(let el of compB){
                    if(tempObj.compB == null)
                        tempObj.compB = el.id.split('_')[0];
                    else
                        tempObj.compB = tempObj.compB + ',' + el.id.split('_')[0];
                }
            }
            if(compC){
                for(let el of compC){
                    if(tempObj.compC == null)
                        tempObj.compC = el.id.split('_')[0];
                    else
                        tempObj.compC = tempObj.compC + ',' + el.id.split('_')[0];
                }
            }
            if(compD){
                for(let el of compD){
                    if(tempObj.compD == null)
                        tempObj.compD = el.id.split('_')[0];
                    else
                        tempObj.compD = tempObj.compD + ',' + el.id.split('_')[0];
                }
            }

            secArr.push(tempObj);
        }

        function sectionFormSubmit(secArr, layoutNum, secNum) {
            let quoteID = document.getElementById('quoteIDSave').value;
            let form = document.createElement('form');
            form.method = "POST";
            form.action = "../quoteSaveChanges";

            for(let el of secArr) {
                let element1 = document.createElement('input');
                element1.value = el.secNum;
                element1.name = "sectionNum";
                form.appendChild(element1);

                let element2 = document.createElement('input');
                element2.value = el.compA;
                element2.name = "compA";
                form.appendChild(element2);

                let element3 = document.createElement('input');
                element3.value = el.compB;
                element3.name = "compB";
                form.appendChild(element3);

                let element4 = document.createElement('input');
                element4.value = el.compC;
                element4.name = "compC";
                form.appendChild(element4);

                let element5 = document.createElement('input');
                element5.value = el.compD;
                element5.name = "compD";
                form.appendChild(element5);

                let element6 = document.createElement('input');
                element6.value = quoteID;
                element6.name = "quoteID";
                form.appendChild(element6);

                let element7 = document.createElement('input');
                element7.value = layoutNum;
                element7.name = "layoutNum";
                form.appendChild(element7);

                let element8 = document.createElement('input');
                element8.value = secNum;
                element8.name = "totalSection";
                form.appendChild(element8);

            }

            document.body.appendChild(form);
            form.submit();
        }
        sectionFormSubmit(secArr, layoutNum, secNum);
    });
})();