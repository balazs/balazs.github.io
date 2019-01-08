var QuickAccessHTML = function () {
    this.name = "QuickAccess";
    this.containerElement = document.getElementById('quick-access-container');
    this.element = document.getElementById('quick-access');
    this.container = document.getElementById('quick-access-tab-container');
    this.dots = document.getElementById('dots');
    this.menuElement = null;
    this.translateX = 0;
    this.elementHeight = null;
    this.landscapeMode = false;
    this.PAGE_ITEMS = 12;
    this.SECOND_PAGE_ITEMS = 50;
    this.MAX_PAGES = 2;
    this.pageNumber = 0;
    this.currentPage = 0;
    this.databaseOperation = common.databaseStatus.NONE;
    // load QA icons asap - for revisits
    let QAcache = localStorage.getItem('dynamic_quick_accesss');
    if (!QAcache) {
        try {
        data.dynamicQuickAccess = JSON.parse(QuickAccess.getItems());
        localStorage.setItem('dynamic_quick_accesss', JSON.stringify(data.dynamicQuickAccess));
    } catch(e) {}
    } else {
        data.dynamicQuickAccess = JSON.parse(QAcache);
    }
    this.pressTimer = 0;
    this.initial();
};

function dbUpdated() {
    //console.log("QuickAccess dbupdated called");
    quickAccessPage.dbUpdatedCalled();
};
function itemAdded() {}
function itemRenamed() {
    var index = quickAccessSettings.getRenamedItem();
    var hostName = common.getHostname(data.dynamicQuickAccess[index].link);
    if (hostName == "quickaccess-ref.internet.apps.samsung")
        hostName = data.dynamicQuickAccess[index].title;
    if (common.isSI8x()) {
        toast.show("Quick access shortcut saved.", 2000);
    }
    history.back();
};

QuickAccessHTML.prototype.setPerformedOperation = function (status) {
//console.log("QuickAccess set called = " + status);
    this.databaseOperation = status;
};

QuickAccessHTML.prototype.dbUpdatedCalled = function () {
    //console.log("QuickAccess dbupdated called = " + this.databaseOperation);
    var operation = this.databaseOperation;
    this.setPerformedOperation(common.databaseStatus.NONE);
    if (operation == common.databaseStatus.REORDER) {
        return;
    } else {
        data.dynamicQuickAccess = JSON.parse(QuickAccess.getItems());
    }
    this.reload();
    common.setDynamicQuickAccess();
    if(operation == common.databaseStatus.NONE || operation == common.databaseStatus.ADD) {
        quickAccessSettings.reload();
    } else {
        this.reload();
    }
};

QuickAccessHTML.prototype.replaceItem = function (temp) {
    //console.log("SingleCP: QuickAccess replaceItem called");
    if (!common.isSecretMode) {
        temp.push(defaultAddButton);
    }
    var diff = false;
    if (temp.length == data.dynamicQuickAccess.length) {
        for (var i = 0; i < temp.length; i++) {
            if (temp[i].color != data.dynamicQuickAccess[i].color ||
                temp[i].firstletter != data.dynamicQuickAccess[i].firstletter ||
                temp[i].icon != data.dynamicQuickAccess[i].icon ||
                temp[i].link != data.dynamicQuickAccess[i].link ||
                temp[i].title != data.dynamicQuickAccess[i].title) {
                diff = true;
                break;
            }
        }
    } else {
        diff = true;
    }

    if (diff) {
        //console.log("SingleCP: QuickAccess replaceItem diff true");
        data.dynamicQuickAccess = temp;
        localStorage.setItem('dynamic_quick_accesss', JSON.stringify(data.dynamicQuickAccess));
        common.setDynamicQuickAccess();
        this.reload();
        quickAccessSettings.reload();
    }
}

QuickAccessHTML.prototype.initial = function () {

    this.menuElement = document.createElement("div");
    this.menuElement.className = "menu";
    this.menuElement.innerHTML = '<ul class="menu-options">'
                                + '<li class="menu-option">Delete</li>'
                                + '<li class="menu-option">Rename</li>'
                                + '</ul>';
    document.getElementsByTagName('body')[0].prepend(this.menuElement);
    this.menuOptions = this.menuElement.children[0];
    this.editBtn = document.getElementById('btn_edit');
    this.nextBtn = document.getElementById('qa_next');
    this.pageBarElement = document.getElementsByClassName('page-bar')[0];

    if (typeof QuickAccess === 'undefined') {
        if (localStorage.hasOwnProperty('dynamic_quick_accesss')) {
            data.dynamicQuickAccess = JSON.parse(localStorage.getItem('dynamic_quick_accesss'));
        }
    } else {
        if (localStorage.hasOwnProperty('dynamic_quick_accesss')) {
            setTimeout(function () {
                //console.log("SingleCP: QuickAccess Init SetTimeout");
                var qaItems = JSON.parse(QuickAccess.getItems());
                this.replaceItem(qaItems);
            }.bind(this), 200);
            data.dynamicQuickAccess = JSON.parse(localStorage.getItem('dynamic_quick_accesss'));
        } else {
            data.dynamicQuickAccess = JSON.parse(QuickAccess.getItems());
            if (!common.isSecretMode) {
                data.dynamicQuickAccess.push(defaultAddButton);
            }
            localStorage.setItem('dynamic_quick_accesss', JSON.stringify(data.dynamicQuickAccess));
        }
    }
    this.generateItems();
    //mainElement.style.display = "block";
    this.databaseOperation = false;
    this.onResize();
    this.setEvent();
    if(document.body.clientWidth >= 530){
        this.landscapeMode = true;
    } else {
        this.landscapeMode = false;
    }
};

QuickAccessHTML.prototype.toggleMenu = function (command) {
    if (!common.isSecretMode)
        this.menuElement.style.display = command === "show" ? "block" : "none";
};

QuickAccessHTML.prototype.setPosition = function(x,y) {
    this.toggleMenu('show');
    this.menuElement.style.left = (x) + 'px';
    this.menuElement.style.top = y + 'px';
};

QuickAccessHTML.prototype.setSelectedItem = function(e) {
    this.selectedMenuItem = e;
};

QuickAccessHTML.prototype.setContextMenuEvent = function () {
    this.menuOptions.addEventListener('click', function (e) {
        if (e.target.innerText == "Delete") {
            var startpos = "item";
            var id = this.selectedMenuItem.target.className.split(" ")[1].substring(startpos.length);
            var deleteItem = {
                title: data.dynamicQuickAccess[id].title,
                link: data.dynamicQuickAccess[id].link
            };
            var deleteQuickAccessItems = [];
            deleteQuickAccessItems.push(deleteItem);
            data.dynamicQuickAccess.splice(id, 1);
            quickAccessSettings.qaList.removeChild(quickAccessSettings.qaList.childNodes[id]);
            common.setDynamicQuickAccess();
            this.selectedMenuItem.target.remove();
            if (typeof QuickAccess !== 'undefined') {
                quickAccessPage.setPerformedOperation(common.databaseStatus.DELETE);
                QuickAccess.deleteItems(JSON.stringify(deleteQuickAccessItems));
            }
            if (common.isSI8x()) {
                toast.show("Quick access shortcut deleted.", 2000);
            }
            quickAccessPage.reload();

        } else if (e.target.innerText == "Rename") {
            var startpos = "item";
            var id = this.selectedMenuItem.target.className.split(" ")[1].substring(startpos.length);
            if (typeof QuickAccess !== 'undefined' && QuickAccess.showRenameDialog != undefined) {
                    var link = data.dynamicQuickAccess[id].link
                    QuickAccess.showRenameDialog(link);
            } else {
                renameQickAccessPage.show(id);
            }
        }
        this.toggleMenu('hide');
    }.bind(this));

    this.containerElement.addEventListener("contextmenu", function (e) {
        e.preventDefault();
        this.toggleMenu('hide');

        if (e.target.className.search(".item") < 0) return;

        if (e.target.childNodes[0].title === 'add_qa_link') return;

        if (typeof QuickAccess !== 'undefined') {
            if (QuickAccess.isDexModeEnabled == undefined) {
                return false;
            }
            if (!QuickAccess.isDexModeEnabled()) {
                return false;
            }
        }

        var x = e.target.offsetLeft;
        if (x > ($(".quickaccess-page").width()) + 28 ) {
            x = x - ($(".quickaccess-page").width() + 28);
        }
        var y = e.target.offsetTop + e.target.offsetHeight / 4;
        this.setPosition(x,y);
        this.setSelectedItem(e);
        return false;
    }.bind(this), false);
}


QuickAccessHTML.prototype.setEvent = function () {
    this.element.addEventListener("touchstart", this.touchStartCallback.bind(this), false);
    this.element.addEventListener("touchend", this.touchEndCallback.bind(this), false);
    this.element.addEventListener("touchmove", this.touchMoveCallback.bind(this), false);

    this.element.addEventListener("mousedown", this.touchStartCallback.bind(this), false);
    this.element.addEventListener("mouseup", this.touchEndCallback.bind(this), false);
    this.element.addEventListener("mousemove", this.touchMoveCallback.bind(this), false);
    this.containerElement.addEventListener("mouseleave", this.touchEndCallback.bind(this), false);

    this.containerElement.addEventListener("mouseover", function(e){
        if (typeof QuickAccess !== 'undefined') {
            if (QuickAccess.isDexModeEnabled == undefined) {
                return false;
            }
            if (!QuickAccess.isDexModeEnabled()) {
                return false;
            }
        }

        if(e.target.className.search(".item") < 0) return;

        e.target.style.backgroundColor = "rgba(0,0,0,0.1)";
        return false;
    }, false);

    this.containerElement.addEventListener("mouseout", function(e){
        e.preventDefault();

        if(e.target.className.search(".item") < 0) return;

        e.target.style.backgroundColor = "";
        return false;
    }, false);

    var self = this;

    this.container.addEventListener("click", function(e){
        self.toggleMenu("hide");
        if (self.countMoves > 1) {
            return;
        }
        var item = e.target;
        var childItem = item.childNodes[0];
        if (item.className.indexOf("item") > -1 && !eventListener.eventMoving) {
            if(childItem.title === "add_qa_link"){
                if (data.dynamicQuickAccess.length > self.SECOND_PAGE_ITEMS) {
                    if (common.isSI8x()) {
                        toast.show("Can't add more than " + self.SECOND_PAGE_ITEMS + " Quick access shortcuts.",2000);
                    } else if (typeof QuickAccess !== 'undefined' && QuickAccess.showMaxItemsToast != undefined) {
                        QuickAccess.showMaxItemsToast();
                    }
                    return;
                }
                if (typeof QuickAccess !== 'undefined' && QuickAccess.showAddDialog != undefined) {
                    QuickAccess.showAddDialog();
                } else {
                    addQuickAccess.show();
                }
                //logging.clickEvent('Button', 'ud_qa_open_add_page');
            } else {
                if (childItem.title.indexOf('http') == -1) {
                    childItem.title = 'http://' + childItem.title;
                }
                setTimeout(function(){
                    e.target.blur();
                    e.target.style.backgroundColor = "";
                }, 500);
                const itemClicked = document.createElement('a');
                itemClicked.href = childItem.title;
                itemClicked.click();
                //logging.clickEvent('QuickAccess', childItem.nextSibling.innerText);
            }
        }
    }, false);

    this.setContextMenuEvent();
    this.nextBtn.addEventListener('click' ,function(e) {
        quickAccessPage.toggleMenu("hide");
        quickAccessPage.slidePage();
    });

    this.editBtn.addEventListener('click', function(e) {
        quickAccessPage.toggleMenu("hide");
        quickAccessSettings.show(false);
        //logging.clickEvent('Button', 'ud_qa_open_settings_page');
    });
};
QuickAccessHTML.prototype.slidePage = function () {
    this.container.style.transform = "translate3D(" + (this.currentPage * this.thressTranslate + 30) + "px,0,0)";
    //Change quick access page
    if (-512 < this.thressTranslate * 1 / 8) {
        this.currentPage++;
        if(this.currentPage < this.pageNumber) {
            maincategories.element.style.display = 'none';
            eventListener.eventMoving = false;
            this.pageBarElement.style.display = "none";
            document.getElementsByClassName("quickaccess-page")[1].style.display = "block";
        }

        this.showContents();
    }

    this.currentPage = this.currentPage < 0 ? 0 : this.currentPage >= this.pageNumber ? this.pageNumber - 1 : this.currentPage;
    this.updateDots();
    this.container.classList.add("transition500");
    this.showCurrentPage();
};

QuickAccessHTML.prototype.applyNightModeClass = function () {
    if (typeof QuickAccess !== 'undefined' && QuickAccess.isNightModeEnabled()) {
        for (var i=0;i<this.elementItems.length;i++) {
            this.elementItems[i].classList.add("nightmode");
            this.isNightMode = true;
        }
    } else if (this.isNightMode) {
        for (var i=0;i<this.elementItems.length;i++) {
            this.elementItems[i].classList.remove("nightmode");
            this.isNightMode = false;
        }
    }
};


QuickAccessHTML.prototype.touchStartCallback = function (e) {
    //console.log('SingleCP: touchStartCallback()');
    if (e.target.id === 'btn_edit' || e.target.className === 'quickaccess_nexticon' || e.target.id === 'qa_next') {
        return;
    }
    this.applyNightModeClass();
    if (e.type === "mousedown" || (common.isValid(e.touches) && e.touches.length == 1)) {
        if(this.pressTimer == 0){
            this.pressTimer = window.setTimeout(function () {
                if (common.isSecretMode) {
                    if (common.isSI8x()) {
                        toast.show("Unable to edit Quick access while Secret mode enabled.", 2000);
                    } else if (typeof QuickAccess !== 'undefined' && QuickAccess.showUnableToEditInSecretModeToast != undefined) {
                        QuickAccess.showUnableToEditInSecretModeToast();
                    }
                    return;
                }
                if(e.target != document.activeElement){
                    console.log("SingleCP: long press error case caught");
                    return;
                }
                if (common.isValid(e.target.childNodes) &&
                    e.target.childNodes[0].title != "add_qa_link" &&
                    (e.target.className.indexOf("item item") == 0)) {
                    //console.log("SingleCP: long press", e.target.id);
                    $("#main_page").css("display", "none");
                    quickAccessSettings.show();
                    quickAccessSettings.selectOnLongPress(e);
                }
            }, 1000);
        }
    }

    this.activeTouchMove = true;
    this.countMoves = 0;

    //Change quick access page
    this.thressTranslate = -document.body.clientWidth;
    maincategories.touchStartHandlerWrap(e);
    this.startX = eventListener.getClientX(e);
    this.startY = eventListener.getClientY(e);
    this.container.classList.remove("transition500");
};

QuickAccessHTML.prototype.touchMoveCallback = function (e) {
    if (!this.activeTouchMove) {
        return;
    }
    this.countMoves++;
    if (this.countMoves > 1 || (common.isValid(e.touches) && e.touches.length == 2)) {
        window.clearTimeout(this.pressTimer);
        this.pressTimer = 0;
    }

    //Change quick access page
    if (e.target.id === 'btn_edit' || e.target.className === 'quickaccess_nexticon' || e.target.id === 'qa_next') {
        return;
    }

    //Change quick access page
    if (this.countMoves == 1) {
        return;
    }

    if (quickAccessSettings.element.style.display === 'none'){
        maincategories.touchMoveHandlerWrap(e);
    }
    this.toggleMenu('hide');
    this.moveX = eventListener.getClientX(e) - this.startX;
    this.moveY = eventListener.getClientY(e) - this.startY;
    var xprecision = this.thressTranslate *  1/4;
    xprecision = (xprecision > 0)? xprecision : xprecision * -1;
    if ((this.moveX < 0 && this.currentPage < this.pageNumber - 1) || (this.moveX > xprecision && this.currentPage > 0)) {
        this.container.style.transform = "translate3D(" +  (this.currentPage*this.thressTranslate + this.moveX) + "px,0,0)";

        this.showContents();
    }
    //console.log('SingleCP: touchmoveCb(), this.moveX = ' + this.moveX + ',this.moveY = ' + this.moveY +', this.currentPage = ' + this.currentPage);
};

QuickAccessHTML.prototype.touchEndCallback = function (e) {
    this.activeTouchMove = false;
    if (e.target.id === 'btn_edit' || e.target.className === 'quickaccess_nexticon' || e.target.id === 'qa_next') {
        return;
    }
    window.clearTimeout(this.pressTimer);
    this.pressTimer = 0;
    if (quickAccessSettings.element.style.display === 'none'){
        maincategories.touchMoveHandlerWrap(e);
    }

    //Change quick access page
    if (this.moveX < 0 && this.moveX < this.thressTranslate *  1/4) {
        this.currentPage++;
        if(this.currentPage < this.pageNumber) {
            maincategories.element.style.display = 'none';
            this.pageBarElement.style.display = "none";
            document.getElementsByClassName("quickaccess-page")[1].style.display = "block";
            eventListener.eventMoving = false;
        }
    } else if(this.moveX > 0 && this.moveX > -this.thressTranslate *  1/4) {
        this.currentPage--;
        if (this.pageNumber == 2) {
            document.getElementsByClassName("quickaccess-page")[1].style.display = "none";
        }
        document.getElementsByClassName("quickaccess-page")[0].style.display = "block";
        maincategories.element.style.display = 'flex';
        this.pageBarElement.style.display = "block";
    }

    this.moveX = 0;
    this.currentPage = this.currentPage < 0 ? 0 : this.currentPage >= this.pageNumber ? this.pageNumber - 1 : this.currentPage;
    this.updateDots();
    this.container.classList.add("transition500");
    this.showCurrentPage();
    //console.log('SingleCP: touchendCb(), this.moveX = ' + this.moveX +', this.currentPage = ' + this.currentPage);

    e.target.blur();
};
QuickAccessHTML.prototype.showContents = function() {
    if (this.currentPage === 0) {
        if (this.container.children.length === 2) {
            this.pageBarElement.display = 'block';
            this.dots.display = 'flex';
        }
        document.getElementById('maincategories').style.display = 'flex';
    }
}

QuickAccessHTML.prototype.showCurrentPage = function () {
    this.container.style.transform = "translate3D(" + (this.currentPage * this.thressTranslate) + "px,0,0)";
    this.showContents();
};

QuickAccessHTML.prototype.reload = function () {
    //console.log("QuickAccessHTML reload");
    this.quickAccessPages = document.getElementsByClassName('quickaccess-page');
    var scrollpos;
    if (this.currentPage == 1) {
        scrollpos = this.quickAccessPages[1].scrollTop;
    }
    this.container.innerHTML = '';
    this.dots.innerHTML = '';
    this.generateItems();
    this.showCurrentPage();
    if (this.currentPage == 1) {
        this.quickAccessPages[1].scrollTop = scrollpos;
    }
    this.setContextMenuEvent();
};

QuickAccessHTML.prototype.generateItems = function () {
    this.PAGE_ITEMS = this.landscapeMode? 18 : 10;

    this.addPage();

    //QA page1
    var itemsString="";
    var pages = this.container.childNodes;
    var fixedQA = [];
    if (typeof QuickAccess === 'undefined') {
        fixedQA = data.quickAccess;

    } else {
        if (this.databaseOperation == common.databaseStatus.NONE) {
            let localData = data.dynamicQuickAccess;
            this.addExists = false;
            for ( let i = 0; i < localData.length; i++) {
                if (localData[i].link === 'add_qa_link') {
                    this.addExists = true;
                }
            }
            if (!common.isSecretMode && !this.addExists) {
                data.dynamicQuickAccess.push(defaultAddButton);
            }
        }
    }
    var dynamicQALength = data.dynamicQuickAccess.length;
    if (dynamicQALength > 50) {
        dynamicQALength = 50;
    }
    if ((typeof QuickAccess !== 'undefined' &&
        common.isSecretMode) || ((dynamicQALength - 1) == 0)) {
        this.editBtn.style.display = "none";
    } else {
        this.editBtn.style.display = "block";
    }
    let noItems = document.getElementById('no-items');
    if((dynamicQALength == 1 && !common.isSecretMode) || (dynamicQALength == 0 && common.isSecretMode)) {
        noItems.style.display = 'block';
    } else {
        noItems.style.display = 'none';
    }

    for(var i = 0; i < fixedQA.length; i++) {
        itemsString += this.createItemHtmlString(fixedQA[i],i);
    }
    for(var i = 0; i < dynamicQALength && i < this.PAGE_ITEMS - fixedQA.length; i++) {
        itemsString += this.createItemHtmlString(data.dynamicQuickAccess[i],i, this.PAGE_ITEMS/2);
    }
    pages[0].innerHTML = itemsString;
    pages[0].style.display = "block";
    //dynamic QA
    var diffItems = this.PAGE_ITEMS - fixedQA.length > 0? this.PAGE_ITEMS - fixedQA.length : 0;
    dynamicQALength -= diffItems;
    dynamicQALength = dynamicQALength <= 0? 0 : dynamicQALength;

    if (dynamicQALength % this.PAGE_ITEMS == 0) {
        this.pageNumber = 1 + dynamicQALength/this.PAGE_ITEMS;
    } else {
        this.pageNumber = 2 + parseInt(dynamicQALength/this.PAGE_ITEMS);
    }
    this.pageNumber = this.pageNumber <= this.MAX_PAGES? this.pageNumber: this.MAX_PAGES;
    if (this.currentPage >= this.pageNumber) {
        this.currentPage = this.pageNumber - 1;
    }

    this.container.style.width = this.pageNumber * 100 + "%";
    var qaIconIndex = 0;
    for (var j = 0; j < this.pageNumber - 1; j++) {
        itemsString = "";
        var qaIconCount = this.PAGE_ITEMS;
        var addiconExists = false;
        while (qaIconCount < this.SECOND_PAGE_ITEMS && qaIconIndex < dynamicQALength) {
            var iconData = data.dynamicQuickAccess[qaIconIndex + diffItems];
            if (iconData.link === "add_qa_link")
                addiconExists = true;
            if (this.isValidIconData(iconData)) {
                itemsString += this.createItemHtmlString(iconData, qaIconCount, this.PAGE_ITEMS/2);
                qaIconCount++;
            }
            qaIconIndex++;
        }
        if (!common.isSecretMode && !addiconExists && ((!this.landscapeMode && dynamicQALength >= 40) || (this.landscapeMode && dynamicQALength >= 32))) {
            itemsString += this.createItemHtmlString(defaultAddButton, 50, this.PAGE_ITEMS/2);
            qaIconIndex++;
        }
        if (qaIconCount > 0) {
            this.addPage();
            pages[j + 1].innerHTML = itemsString;
            if (this.currentPage != 1) {
                pages[j + 1].style.display = "none";
            }
            pages[j + 1].style.overflowY = "scroll";
            pages[j + 1].style.height = document.documentElement.clientHeight + "px";
        }
    }
    localStorage.setItem('renderedQApageOne', pages[0].innerHTML);
    if (pages[1])
        localStorage.setItem('renderedQApageTwo', pages[1].innerHTML);
    this.elementItems  = this.element.querySelectorAll(".item");
    this.updateDots();
};

QuickAccessHTML.prototype.addPage = function () {
    var qaPage = document.createElement('div');
    qaPage.className = 'quickaccess-page';
    this.container.appendChild(qaPage);

    var indicator = document.createElement('div');
    indicator.className = 'small-dot';
    this.dots.appendChild(indicator);
};

QuickAccessHTML.prototype.createItemHtmlString = function (data, index, rowitems) {
    var item;
    if(rowitems && ((index+1)%rowitems==0)){
        item = '<div class="item item' + index + '" tabindex="0" id="qa_item' + index + '" style="margin-right:0vw;">'
            + '<div class="item-content quickAccess-item" title="' + data.link + '">';
    }else{
        item = '<div class="item item' + index + '" tabindex="0" id="qa_item' + index + '">'
            + '<div class="item-content quickAccess-item" title="' + data.link + '">';
    }
    if (data.icon == 'none' || data.icon == 'error' || data.icon == 'BeforeIconSearch') {
         item += '<div class="failed-img" title="' + data.title + '"style="background-color:#bababa; color:#fafafa;font-size:22px;font-family:Roboto Condensed light;">' + data.title.charAt(0).toUpperCase() + '</div>';
    } else if (data.icon == "" && data.color) {
        if (data.color != -1) {
            item += '<div class="failed-img" title="' + data.title + '"style="background-color:#' + common.decimalToHexString(data.color) + ';color:#fafafa;font-size:22px;font-family:Roboto Condensed light;">' + data.firstletter + '</div>';
        } else {
            item += '<div class="failed-img" title="' + data.title + '"style="background-color:#bababa; color:#fafafa;font-size:22px;font-family:Roboto Condensed light;">' + data.firstletter + '</div>';
        }
    } else {
        item += '<img class="item-img" onerror="onerrorEvent(this)" src="' + data.icon + '" title="' + data.title + '" color="' + data.color + '">';
    }

    item += '</div>'
            + '<div class="item-title">' + data.title + '</div>'
            + '</div>';

    return item;
};

QuickAccessHTML.prototype.calculateIconSize = function () {
    var x = 12.5 * document.body.clientWidth/100;
    if (this.landscapeMode) {
        x = x*5/8;
    }
    return x;
};

QuickAccessHTML.prototype.changeItemsCssWidthLandscape = function () {
    return this.landscapeMode? 2/3 : 1;
};

QuickAccessHTML.prototype.onResize = function () {
    //console.log("SingleCP: QuickAccessHTML:: onResize()");
    this.toggleMenu("hide");
    if(document.body.clientWidth >= 530){
        this.landscapeMode = true;
    } else {
        this.landscapeMode = false;
    }
    var boderHeight = this.landscapeMode ? 4 : 6;
    this.elementHeight = (this.calculateIconSize() + 25.25)*3*this.changeItemsCssWidthLandscape() + 16 + boderHeight;
    this.thressTranslate = -document.body.clientWidth;
    this.container.classList.remove("transition500");
    if (this.screenWidth != document.body.clientWidth) {
        this.screenWidth = document.body.clientWidth;
        this.container.style.transform = "translate3D(-" + (this.currentPage * document.body.clientWidth) + "px,0,0)";

        this.showContents();
    }
    if (common.isValid(renameQickAccessPage) && common.isValid(renameQickAccessPage.element) && renameQickAccessPage.element.style.display == 'block') {
        renameQickAccessPage.setMarginTop();
    }

    this.reload();
};

QuickAccessHTML.prototype.getElementHeight = function () {
    return this.containerElement.clientHeight;
};

QuickAccessHTML.prototype.updateDots = function () {
    for (var i = 0; i < this.dots.childNodes.length; i++) {
        this.dots.childNodes[i].classList.remove('dot-active');
    }
    this.dots.childNodes[this.currentPage].classList.add('dot-active');
    if (this.currentPage == 1) {
        this.dots.style.display = 'none';
        this.nextBtn.style.display = 'none';
    }
    if (this.currentPage != 0){
        this.dots.style.display = '-webkit-flex';
        this.nextBtn.style.display = 'block';
    }
    let dotsLen = this.dots.children.length;
    if (dotsLen === 2) {
        this.nextBtn.style.display = 'block';
            if (this.pageBarElement.style.display === 'none') {
            this.dots.style.display = 'none';
        } else {
            this.dots.style.display = 'flex';
        }
    }
    if (dotsLen === 1) {
        this.dots.style.display = 'none';
        this.nextBtn.style.display = 'none';
    }
};

QuickAccessHTML.prototype.isValidIconData = function (data) {
    if (common.isValid(data) && common.isValid(data.link) && (common.isValid(data.icon) || common.isValid(data.color))
     && common.isValid(data.title)) {
        return true;
    }
    return false;
};
