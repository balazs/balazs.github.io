var QuickAccessSettings = function() {
    this.name = "QuickAccessSettings";
    this.state = "singleCP_no3";
    this.SELECT_ITEMS = 'Select Items';
    this.element;
    this.dragDrop;
    this.renamedItem = -1;
    this.isRunScrolling = false;
    this.startPosition = { x: 0, y: 0 };
    this.currentPoint = { x: 0, y: 0 };
    this.initial();
};

QuickAccessSettings.prototype.initial = function() {
    this.dragDrop = new DragDrop();
    this.dragDrop.setDragable(false);

    this.element = document.createElement("div");
    this.element.className = 'quick-access-settings';

    document.body.appendChild(this.element);
    this.element.innerHTML = '<div class="control-bar">' +
        '<div class="select-all-container" id="select_all_checkbox_div">' +
        '<div>' +
        '<div id="select_all" tabindex="1" class="chkbox">' +
        '<label id="select_all_checkbox"></label>' +
        '<span class="select-all-lable" id="select_all_checkbox_span">All</span>' +
        '</div>' +
        '</div>' +
        '<span id="select_items">Select Items</span>' +
        '</div>' +
        '<button id="btn_rename" tabindex="3" disabled class="control-btn">Rename</button>' +
        '<button id="btn_delete" tabindex="2" disabled class="control-btn">Delete</button>' +
        '</div>';
    this.btnRename = document.getElementById('btn_rename');
    this.btnDelete = document.getElementById('btn_delete');

    this.btnDelete.style.opacity = 0.4;
    this.btnRename.style.opacity = 0.4;

    this.container = document.createElement('div');
    this.container.className = 'container';
    this.element.appendChild(this.container);

    this.qaList = document.createElement('ul');
    this.qaList.className = 'qa-list';

    this.container.appendChild(this.qaList);

    this.selectItems = document.getElementById('select_items');
    this.selectAll = document.getElementById('select_all');

    this.generateItems();
    this.addEventListener();
};

QuickAccessSettings.prototype.generateItems = function() {
    var dynamicQALength = data.dynamicQuickAccess.length;
    var qaListHTML = '';
    for (var i = 0; i < dynamicQALength; i++) {
        qaListHTML += this.createItemHtmlString(data.dynamicQuickAccess[i], i);
    }
    this.qaList.innerHTML = qaListHTML;
};

QuickAccessSettings.prototype.createItemHtmlString = function (itemData, index) {
    if (!itemData) {
        return '';
    }
    var dynamicQALength = data.dynamicQuickAccess.length;
    if (typeof QuickAccess !== 'undefined') {
        if (!common.isSecretMode) {
            dynamicQALength--;
        }
    } else {
        dynamicQALength--;
    }
    var item = '<li class="dn-item" tabindex="' + (index + 4) + '" id="qa_item_edit' + index + '">';
    if (index < dynamicQALength) {
        item += '<div class="chkbox">'
            + '<label id="select_all_checkbox_label"></label>'
            + '</div>';
    }

    if(itemData.link === 'add_qa_link')
        item += '<div class="item-content quickAccess-item" title="' + itemData.link + '" style="opacity: 0.3;">';
    else
        item += '<div class="item-content quickAccess-item">';
    if (itemData.icon == 'none' || itemData.icon == 'error' || itemData.icon == 'BeforeIconSearch') {
        item += '<div class="failed-img" aria-hidden="true" ' + 'style="background-color:#bababa; color:#ffffff;font-size:22px;font-family:Roboto condensed;font-weight:300;">' + itemData.title.charAt(0).toUpperCase() + '</div>';
    } else if (itemData.icon == "" && itemData.color) {
        if (itemData.color != -1) {
            item += '<div class="failed-img" aria-hidden="true" ' + 'color="' + itemData.color + '" style="background-color:#' + common.decimalToHexString(itemData.color) + ';color:#ffffff;font-size:22px;font-family:Roboto condensed;font-weight:300;">' + itemData.firstletter + '</div>';
        } else {
            item += '<div class="failed-img" aria-hidden="true" ' + 'style="background-color:#bababa; color:#ffffff;font-size:22px;font-family:Roboto condensed;font-weight:300;">' + itemData.firstletter + '</div>';
        }
    } else {
        if (itemData.link === 'add_qa_link') {
            item += '<img class="item-img" onerror="onerrorEvent(this)" src="' + itemData.icon + '" title="' + itemData.title + '" color="' + itemData.color + '">';
        } else {
            item += '<img class="item-img" onerror="onerrorEvent(this)" src="' + itemData.icon + '" color="' + itemData.color + '">';
        }
    }

    if (itemData.link === 'add_qa_link') {
        item += '</div>'
            + '<div class="item-title"></div>'
            + '</li>';

    } else {
        item += '</div>'
            + '<div class="item-title">' + itemData.title + '</div>'
            + '</li>';
    }
    return item;
};

QuickAccessSettings.prototype.touchStartHandler = function(event) {
    if ((event.button == 0 || event.button == 2) && event.buttons == 3) {
        return;
    }
    if (event.target.childNodes[0] && event.target.childNodes[0].title === 'add_qa_link') {
        return;
    }
    var self = this;
    this.startPosition = {
        x: event.clientX ? event.clientX : event.touches[0].pageX,
        y: event.clientY ? event.clientY : event.touches[0].pageY
    }
    this.currentPoint = this.startPosition;
    clearTimeout(this.longPressTimeout);
    var touchNumber = (event.touches) ? event.touches.length : 1;
    if (touchNumber > 1) {
        return;
    }
    this.longPressTimeout = setTimeout(function() {

        var distance = common.calculateDistance(self.startPosition, self.currentPoint);
        if (distance > 300) return;
        self.container.style.overflowY = 'hidden';
        var items = $(".dn-item");
        for (var i = 0; i < items.length; i++) {
            items[i].style.height = items[0].getBoundingClientRect().height + "px";
            items[i].style.outline = 'none';
        }
        setTimeout(function() {
            self.dragDrop.setDragable(true);
            self.dragDrop.touchCount = 0;
        }, 100);
    }, 500);
};

QuickAccessSettings.prototype.touchMoveHandler = function(event) {
    if (event.button == 2 && event.buttons == 1) {
        return;
    }this.currentPoint = {
        x: event.clientX ? event.clientX : event.touches[0].pageX,
        y: event.clientY ? event.clientY : event.touches[0].pageY
    }
};

QuickAccessSettings.prototype.touchEndHandler = function(event) {
    if (event.button == 2 && event.buttons == 1) {
        return;
    }
    clearTimeout(this.longPressTimeout);
    this.dragDrop.setDragable(false);
    this.container.style.overflowY = 'scroll';
};

QuickAccessSettings.prototype.selectOnLongPress = function(event) {
    var classname = event.target.className;
    var startpos = "item";
    var id = classname.split(" ")[1].substring(startpos.length);

    var item = document.getElementById('qa_item_edit' + id);
    var scrollpos = item.offsetTop;
    if (item.className.indexOf("dn-item") > -1) {
        var checkBox = item.childNodes[0];
        // checkBox.classList.add('selectedItem');
        // checkBox.childNodes[0].childNodes[0].classList.add('selectedItem');
        // item.childNodes[1].style.filter = 'contrast(60%)';
        checkBox.classList.add('selectedItem');
        checkBox.childNodes[0].classList.add('selectedItem');
        item.childNodes[1].style.filter = 'contrast(60%)';
        this.updateButtons();
        var pageY = event.clientY ? event.clientY : event.touches[0].pageY;
        if (pageY < document.getElementsByClassName('control-bar')[0].offsetHeight) {
            pageY = document.getElementsByClassName('control-bar')[0].offsetHeight;
        }
        this.container.scrollTop = scrollpos - pageY;
    }
};

QuickAccessSettings.prototype.addEventListener = function() {
    var self = this;
    var pressCallback = function(event) {
        event.preventDefault();
        //console.log('SingleCP: pressCallback()');
        if (event.type === 'keydown' && event.keyCode != 13 && event.keyCode != 32) {
            return;
        }
        switch (event.target.id) {
            case 'btn_qa_cancel':
                history.back();
                break;

            case 'btn_delete':
                if (this.checkBoxItems) {
                    var deleteQuickAccessItems = [];
                    for (var i = this.checkBoxItems.length - 1; i >= 0; i--) {
                        if (this.checkBoxItems[i].classList.contains('selectedItem')) {
                            var deleteItem = {
                                title: data.dynamicQuickAccess[i].title,
                                link: data.dynamicQuickAccess[i].link
                            };
                            deleteQuickAccessItems.push(deleteItem);
                            data.dynamicQuickAccess.splice(i, 1);
                            this.qaList.removeChild(this.qaList.childNodes[i]);
                        }
                    }

                    if (typeof QuickAccess !== 'undefined') {
                        quickAccessPage.setPerformedOperation(common.databaseStatus.DELETE);
                        QuickAccess.deleteItems(JSON.stringify(deleteQuickAccessItems));
                    }
                    if (common.isSI8x()) {
                        if (deleteQuickAccessItems.length == 1) {
                            toast.show("Quick access shortcut deleted.", 2000);
                        } else {
                            toast.show(deleteQuickAccessItems.length + " Quick access shortcuts deleted.", 2000);
                        }
                    }
                    common.setDynamicQuickAccess();
                    quickAccessPage.reload();
                    this.updateItemIds();
                }
                if ((data.dynamicQuickAccess.length - 1) == 1) {
                    this.selectAllItems(true);
                } else {
                    this.selectAllItems(false);
                    this.selectAll.childNodes[0].classList.remove('selectedItem');
                }
                history.back();
                let secondpage = document.getElementsByClassName('quickaccess-page')[1];
                if (maincategories.element.style.display === 'none' && (secondpage && secondpage.style.display === 'none')){
                    maincategories.element.style.display = 'flex';
                }
                //logging.clickEvent('Button', 'ud_qa_delete');
                break;

            case 'btn_rename':
                this.showRenamePopup();
                //logging.clickEvent('Button', 'ud_qa_rename');
                break;

            case 'select_all':
            case 'select_all_checkbox':
            case 'select_all_checkbox_div':
            case 'select_all_checkbox_span':
                if (document.getElementsByClassName('dn-item').length > 1) {
                    var selectAllCheckbox;
                    if (event.target.id == 'select_all_checkbox_div') {
                        selectAllCheckbox = event.target.childNodes[0].childNodes[0].childNodes[0];
                    } else if (event.target.id == 'select_all_checkbox_span') {
                        selectAllCheckbox = event.target.parentNode.childNodes[0];
                    } else {
                        selectAllCheckbox = event.target;
                    }

                    if (selectAllCheckbox.classList.contains('selectedItem')) {
                        selectAllCheckbox.classList.remove('selectedItem');
                        this.selectAllItems(false);
                    } else {
                        selectAllCheckbox.classList.add('selectedItem');
                        this.selectAllItems(true);
                    }
                }
                //logging.clickEvent('Button', 'ud_qa_all_check');
                break;
        }

        var item = event.target;
        if (item.className.indexOf("dn-item") > -1 || item.id == 'select_all_checkbox_label') {
            if (item.id == 'select_all_checkbox_label') {
                item = item.parentNode.parentNode;
            }
            var childItem = item.childNodes[0];
            event.target.blur();
            if (childItem.title === 'add_qa_link') {
                //console.log('SingleCP: Open add QA pop-up disabled');
                //logging.clickEvent('Button', 'ud_qa_open_add_page disabled');
            } else {
                var checkBox = childItem;
                var iconBox = item;
                if (checkBox.classList.contains('selectedItem')) {
                    checkBox.classList.remove('selectedItem');
                    checkBox.childNodes[0].classList.remove('selectedItem');
                    iconBox.childNodes[1].style.filter = '';
                } else {
                    checkBox.classList.add('selectedItem');
                    checkBox.childNodes[0].classList.add('selectedItem');
                    iconBox.childNodes[1].style.filter = 'contrast(60%)';
                }
                this.updateButtons();
            }
        } else if (event.target.type === 'checkbox' && event.target.id != 'select_all') {
            event.target.checked = !event.target.checked;
            this.updateButtons();
        }
    }
    this.element.addEventListener('click', pressCallback.bind(this));
    this.element.addEventListener('keydown', pressCallback.bind(this));
    this.qaList.addEventListener('touchstart', this.touchStartHandler.bind(this));
    this.qaList.addEventListener('touchend', this.touchEndHandler.bind(this));
    this.qaList.addEventListener('touchmove', this.touchMoveHandler.bind(this));
    this.qaList.addEventListener('mousemove', this.touchMoveHandler.bind(this));
    this.qaList.addEventListener('mousedown', this.touchStartHandler.bind(this));
    this.qaList.addEventListener('mouseup', this.touchEndHandler.bind(this));
    this.element.addEventListener('mouseleave', this.touchEndHandler.bind(this));

    var items = document.getElementsByClassName('dn-item');
    for (var i = 0; i < items.length; i++) {
        items[i].addEventListener('mouseover', function(e){
            if (common.getDeviceType() != common.deviceType.DEX) return false;

            if(e.target.className.search("dn-item") < 0) return;

            if (e.target.childNodes[0].title == "add_qa_link") return;

            e.target.style.backgroundColor = "rgba(0,0,0,0.1)";
            return false;

        });

        items[i].addEventListener('mouseover', function(e){
            if (common.getDeviceType() != common.deviceType.DEX) return false;

            if(e.target.className.search("dn-item") < 0) return;

            if (e.target.childNodes[0].title == "add_qa_link") return;

            e.target.style.backgroundColor = "";
            return false;

        });
    }

    this.btnRename.addEventListener('mouseover', function(){
        self.btnRename.style.cursor = "pointer";
    });
    this.btnRename.addEventListener('mouseout', function(){
        self.btnRename.style.cursor = "default";
    });

    this.btnDelete.addEventListener('mouseover', function(){
        self.btnDelete.style.cursor = "pointer";
    });
    this.btnDelete.addEventListener('mouseout', function(){
        self.btnDelete.style.cursor = "default";
    });

    this.container.addEventListener('scroll', function() {
        //console.log('SingleCP: scroll this.container.scrollTop = ' + this.container.scrollTop);
        var preMargin = { top: this.preMargin.top, left: this.preMargin.left };
        this.dragDrop.setMargin(preMargin);
        clearTimeout(this.longPressTimeout);
    }.bind(this));
};

QuickAccessSettings.prototype.selectAllItems = function(selected) {
    this.checkBoxItems = document.querySelectorAll('.dn-item .chkbox');
    for (var i = this.checkBoxItems.length - 1; i >= 0; i--) {
        if (selected) {
            this.checkBoxItems[i].classList.add('selectedItem');
            this.checkBoxItems[i].childNodes[0].classList.add('selectedItem');
            this.checkBoxItems[i].nextSibling.style.filter = 'contrast(60%)';
        } else {
            this.checkBoxItems[i].classList.remove('selectedItem');
            this.checkBoxItems[i].childNodes[0].classList.remove('selectedItem');
            this.checkBoxItems[i].nextSibling.style.filter = '';
        }
    }
    if (selected) {
        this.selectItems.innerHTML = this.checkBoxItems.length;
    } else {
        this.selectItems.innerHTML = this.SELECT_ITEMS;
    }
    this.updateButtons();
};

QuickAccessSettings.prototype.updateButtons = function() {
    this.checkBoxItems = document.querySelectorAll('.dn-item .chkbox');
    var checkedItems = 0;
    for (var i = this.checkBoxItems.length - 1; i >= 0; i--) {
        if (this.checkBoxItems[i].classList.contains('selectedItem')) {
            checkedItems++;
        }
    }
    if (checkedItems > 0) {
        this.btnDelete.style.display = 'block';
        this.btnRename.style.display = 'block';
        this.btnDelete.disabled = false;
        this.btnDelete.style.opacity = 1.0;
        this.selectItems.innerHTML = checkedItems;
    } else {
        this.btnDelete.disabled = true;
        this.btnDelete.style.opacity = 0.4;
        this.btnDelete.style.display = 'none';
        this.btnRename.style.display = 'none';
        this.selectItems.innerHTML = this.SELECT_ITEMS;
    }
    if (checkedItems === 1) {
        this.btnRename.disabled = false;
        this.btnRename.style.opacity = 1.0;
    } else {
        this.btnRename.disabled = true;
        this.btnRename.style.opacity = 0.4;
    }
    if (this.checkBoxItems.length === checkedItems) {
        this.selectAll.childNodes[0].classList.add('selectedItem');
    } else {
        this.selectAll.childNodes[0].classList.remove('selectedItem');
    }
    if (document.getElementsByClassName('quickaccess-page')[0].children.length === 1) {
        this.selectAll.childNodes[0].classList.remove('selectedItem');
    }
};

QuickAccessSettings.prototype.getRenamedItem = function() {
    return this.renamedItem;
}

QuickAccessSettings.prototype.showRenamePopup = function() {
    if (this.checkBoxItems) {
        for (var i = this.checkBoxItems.length - 1; i >= 0; i--) {
            if (this.checkBoxItems[i].classList.contains('selectedItem')) {
                if (typeof QuickAccess !== 'undefined' && QuickAccess.showRenameDialog != undefined) {
                    var link = data.dynamicQuickAccess[i].link
                    QuickAccess.showRenameDialog(link);
                    this.renamedItem = i;
                } else {
                    renameQickAccessPage.show(i);
                }
                break;
            }
        }
    }
};

QuickAccessSettings.prototype.reload = function() {
    this.generateItems();
    this.clearCheckbox();
    this.updateButtons();
    if((data.dynamicQuickAccess.length==1)&& (this.element.style.display == "block")){
        history.back();
    }
};

QuickAccessSettings.prototype.show = function(selectedQAItem) {
    mainElement.style.display = 'none';
    this.element.style.display = "block";
    this.btnRename.style.display = "none";
    this.btnDelete.style.display = "none";
    quickAccessPage.toggleMenu('hide');
    this.checkBoxItems = document.querySelectorAll('.select-checkbox');
    for (var i = 0; i < this.checkBoxItems.length; i++) {
        this.checkBoxItems[i].checked = false;
    }
    if ((data.dynamicQuickAccess.length - 1) == 1) {
        this.selectAllItems(true);
    } else {
        this.updateButtons();
    }
    controller.addScreen(quickAccessSettings);
    if (!this.enabledRedorderMode) {
        this.enabledRedorderMode = true;
        this.enableReorderMode();
    }
};

QuickAccessSettings.prototype.scroll = function(move) {
    if (!this.isRunScrolling) {
        this.isRunScrolling = true;
        var time = 2.5;
        var duration;
        var scrollTopValue;
        if (move == 'up') {
            scrollTopValue = 0;
            duration = (this.container.scrollTop - scrollTopValue) * time;
        } else if (move == 'down') {
            scrollTopValue = this.container.scrollHeight - this.container.clientHeight;
            duration = (scrollTopValue - this.container.scrollTop) * time;
        }
        $(this.container).animate({scrollTop: scrollTopValue}, duration, 'linear', function() {
            quickAccessSettings.isRunScrolling = false;
        });
    }
};

QuickAccessSettings.prototype.stopScrollAnimate = function() {
    $(this.container).stop();
    this.isRunScrolling = false;
};

QuickAccessSettings.prototype.enableReorderMode = function() {
    //console.log('SingleCP: QuickAccessSettings, enableReorderMode()');

    this.placeHolder = document.createElement("li");
    this.placeHolder.className = "dn-item place-holder";
    this.placeHolder.innerHTML = '<div class="item-content quickAccess-item"></div>';

    var self = this;
    var dropCallback = function() {
        var items = document.getElementsByClassName('dn-item');
        var edittingShortcuts = [];
        for (var i = 0; i < data.dynamicQuickAccess.length; i++) {
            if (data.dynamicQuickAccess[i].link === 'add_qa_link')
                break;
            var id = items[i].id;
            var position = id.substring(12, id.length);
            edittingShortcuts.push(data.dynamicQuickAccess[position]);
        }
        data.dynamicQuickAccess = edittingShortcuts;
        common.setDynamicQuickAccess();
        if (typeof QuickAccess !== 'undefined') {
            quickAccessPage.setPerformedOperation(common.databaseStatus.REORDER);
            setTimeout(function() {
                QuickAccess.reorderItems(JSON.stringify(data.dynamicQuickAccess));
            }, 0);
        }
        quickAccessPage.reload();
        self.updateItemIds();
        self.checkBoxItems = document.querySelectorAll('.dn-item .chkbox');
    };

    var controllBar = document.getElementsByClassName('control-bar')[0];
    var marginTop = controllBar.clientHeight;
    var marginLeft = window.getComputedStyle(quickAccessSettings.qaList, null).getPropertyValue('padding-left').replace('px', '');
    this.container.style.height = (document.body.clientHeight - marginTop) + 'px';

    this.preMargin = { top: marginTop, left: marginLeft };
    this.dragDrop.sortable({
        itemClass: 'dn-item',
        element: this.qaList,
        parent: this.element,
        placeHolder: this.placeHolder,
        preMargin: this.preMargin
    }, dropCallback);
};

QuickAccessSettings.prototype.updateItemIds = function() {
    var items = document.getElementsByClassName('dn-item');
    for (var i = 0; i < items.length; i++) {
        items[i].id = 'qa_item_edit' + i;
    }
};

QuickAccessSettings.prototype.onResize = function() {
    var controllBar = document.getElementsByClassName('control-bar')[0];
    var marginTop = controllBar.clientHeight;
    var marginLeft = window.getComputedStyle(quickAccessSettings.qaList, null).getPropertyValue('padding-left').replace('px', '');
    this.preMargin = { top: marginTop, left: marginLeft };
    var preMargin = { top: marginTop + this.container.scrollTop, left: marginLeft };
    this.container.style.height = (document.body.clientHeight - marginTop) + 'px';
    if (common.isValid(renameQickAccessPage.element) && renameQickAccessPage.element.style.display == 'block') {
        renameQickAccessPage.setMarginTop();
    }

    this.dragDrop.setMargin(preMargin);

    this.containerHeight = document.body.clientHeight - marginTop;
};

QuickAccessSettings.prototype.clearCheckbox = function() {
    this.selectAll.childNodes[0].classList.remove('selectedItem');
    if (common.isValid(this.checkBoxItems)) {
        for (var i = 0; i < this.checkBoxItems.length; i++) {
            this.checkBoxItems[i].classList.remove('selectedItem');
            this.checkBoxItems[i].childNodes[0].classList.remove('selectedItem');
            this.checkBoxItems[i].nextSibling.style.filter = '';
        }
    }
    this.btnRename.disabled = true;
    this.btnDelete.disabled = true;
    this.selectItems.innerHTML = this.SELECT_ITEMS;
};

QuickAccessSettings.prototype.update = function(index) {
    var item = data.dynamicQuickAccess[index];
    this.qaList.childNodes[index].childNodes[2].innerText = item.title;
    this.clearCheckbox();
};

QuickAccessSettings.prototype.exit = function() {
    this.element.style.display = "none";
    $("#main_page").css("display", "block");
    this.clearCheckbox();
    if (common.isValid(renameQickAccessPage.element) && renameQickAccessPage.element.style.display == 'block') {
        renameQickAccessPage.hide();
    }
    let qaLen = data.dynamicQuickAccess.length
    if ( (qaLen < 11 && !this.landscapeMode) || (this.landscapeMode && qaLen < 19) ) {
        document.getElementById('maincategories').style.display = 'flex';
        document.getElementsByClassName('page-bar')[0].style.display = 'block';
    }
};