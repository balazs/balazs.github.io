var QuickAccessHTML = function () {
    this.name = "QuickAccess";
    this.containerElement = document.getElementById('quick-access-container');
    this.element = document.getElementById('quick-access');
    this.container = document.getElementById('quick-access-tab-container');
    this.dots = document.getElementById('dots');
    this.menuElement = null;
    this.translateX = 0;
    this.elementHeight = null;
    this.PAGE_ITEMS = 12;
    this.SECOND_PAGE_ITEMS = 50;
    this.MAX_PAGES = 2;
    this.pageNumber = 0;
    this.currentPage = 0;
    this.firstload = 1;
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
    this.xprecisionFactor = common.isLandscapeMode() ? 1/8 : 1/4;
    this.initial();
};

function editModeExited () {
    //console.log("SingleCP: QuickAccess editModeExited  called");
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
    //this.nextBtn = document.getElementById('qa_next');
    this.topbar = document.getElementsByClassName('header')[0];

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

    if (common.getDeviceType() == common.deviceType.DEX) {
        this.containerElement.style.marginTop = 48+'px';
        this.topbar.style.marginLeft = 48+'px';
        this.topbar.style.marginRight = 48+'px';
    }
    this.generateItems();
    //mainElement.style.display = "block";
    this.databaseOperation = false;
    this.onResize();
    this.setEvent();
    this.firstload = 0;
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

        if (common.getDeviceType() != common.deviceType.DEX) return false;

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
        if (common.getDeviceType() != common.deviceType.DEX) return false;

        if(e.target.className.search(".item") < 0) return;
        if (e.target.childNodes[0].childNodes[0].classList.contains("failed-img")) {
            e.target.childNodes[0].childNodes[0].classList.remove("failed-img");
            e.target.childNodes[0].childNodes[0].classList.add("hover-failed-img");
        }
        e.target.style.backgroundColor = "rgba(0,0,0,0.1)";
        return false;
    }, false);

    this.containerElement.addEventListener("mouseout", function(e){
        e.preventDefault();

        if(e.target.className.search(".item") < 0) return;
        if (e.target.childNodes[0].childNodes[0].classList.contains("hover-failed-img")) {
            e.target.childNodes[0].childNodes[0].classList.remove("hover-failed-img");
            e.target.childNodes[0].childNodes[0].classList.add("failed-img");
        }

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
        var startpos = "item";
        if (item.className.indexOf("item") > -1 && !eventListener.eventMoving) {
            var id = item.className.split(" ")[1].substring(startpos.length);
            var link = data.dynamicQuickAccess[id].link;
            if(link === "add_qa_link"){
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
                if (link.indexOf('http') == -1) {
                    link = 'http://' + link;
                }
                setTimeout(function(){
                    e.target.blur();
                    e.target.style.backgroundColor = "";
                }, 500);
                const itemClicked = document.createElement('a');
                itemClicked.href = link;
                itemClicked.click();
                //logging.clickEvent('QuickAccess', childItem.nextSibling.innerText);
            }
        }
    }, false);

    this.setContextMenuEvent();
    // this.nextBtn.addEventListener('click' ,function(e) {
    //     quickAccessPage.toggleMenu("hide");
    //     quickAccessPage.slidePage();
    // });

    this.editBtn.addEventListener('click', function(e) {
        if (typeof QuickAccess !== 'undefined' && QuickAccess.enterEditMode != undefined) {
            QuickAccess.enterEditMode();
        } else {
            quickAccessSettings.show();
        }
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
            //this.pageBarElement.style.display = "none";
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
                    toast.show("Unable to edit Quick access while Secret mode enabled.", 2000);
                    return;
                }
                if (common.isValid(e.target.childNodes) &&
                    e.target.childNodes[0].title != "add_qa_link" &&
                    (e.target.className.indexOf("item item") == 0)) {
                        toast.show("Use Edit button to edit Quick access shortcuts when news feed is on.", 2000);
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
    var xprecision = this.thressTranslate *  this.xprecisionFactor;
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
    if (this.moveX < 0 && this.moveX < this.thressTranslate * this.xprecisionFactor) {
        this.currentPage++;
        if(this.currentPage < this.pageNumber) {
            maincategories.element.style.display = 'none';
            //this.pageBarElement.style.display = "none";
            document.getElementsByClassName("quickaccess-page")[1].style.display = "block";
            eventListener.eventMoving = false;
        }
    } else if(this.moveX > 0 && this.moveX > -this.thressTranslate * this.xprecisionFactor) {
        this.currentPage--;
        if (this.pageNumber == 2) {
            document.getElementsByClassName("quickaccess-page")[1].style.display = "none";
        }
        document.getElementsByClassName("quickaccess-page")[0].style.display = "block";
        maincategories.element.style.display = 'flex';
        //this.pageBarElement.style.display = "block";
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
            //this.pageBarElement.display = 'block';
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
    if(this.currentPage == 1) {
        $("#maincategories").hide();
        //this.pageBarElement.style.display = "none";
        $(".quickaccess-page")[1].scrollTop = scrollpos;
    } else {
        $("#maincategories").show();
        //this.pageBarElement.style.display = "block";
    }
    this.showCurrentPage();
    if (this.currentPage == 1) {
        this.quickAccessPages[1].scrollTop = scrollpos;
    }
    this.setContextMenuEvent();
};

QuickAccessHTML.prototype.generateItems = function () {
    let addExists = false;
    for (let i = 0; i < data.dynamicQuickAccess.length; i++) {
        if (data.dynamicQuickAccess[i].link === "add_qa_link") {
            addExists = true;
        }
    }
    if (!addExists && !common.isSecretMode) {
        data.dynamicQuickAccess.push(defaultAddButton);
    }
    var isDexmode = (common.getDeviceType() == common.deviceType.DEX);
    var pagewidth;
    var minWidth;
    if (isDexmode) {
        pagewidth = document.body.clientWidth - 146;
        minWidth = 86;
    } else {
        pagewidth = document.body.clientWidth - 32;
        minWidth = 65;
    }

    // qa max item
    // mobile portrait: 5, landscape: 9
    // tablet portrait: 7, landscape: 9
    // dex: 9
    this.ROW_ITEMS = 9;
    switch (common.getDeviceType()) {
        case common.deviceType.PHONE:
            if (!common.isLandscapeMode()) {
                this.ROW_ITEMS = 5;
            }
            break;
        case common.deviceType.TABLET:
            if (!common.isLandscapeMode()) {
                this.ROW_ITEMS = 7;
            }
            break;
    }

    var calculatedRowItems = parseInt(pagewidth / minWidth);
    if (calculatedRowItems == 0) {
        this.ROW_ITEMS = 1;
        minWidth = pagewidth;
    } else if (this.ROW_ITEMS > calculatedRowItems) {
        this.ROW_ITEMS = calculatedRowItems;
    }

    var width = pagewidth/this.ROW_ITEMS;

    if (common.isLandscapeMode() && !isDexmode) {
        this.PAGE_ITEMS = this.ROW_ITEMS;
    } else {
        this.PAGE_ITEMS = this.ROW_ITEMS * 2;
    }

    var itemWidth = width - 4;

    this.addPage();

    //QA page1
    var itemsString="";
    var pages = this.container.childNodes;
    var fixedQA = [];
    if (typeof QuickAccess === 'undefined') {
        fixedQA = data.quickAccess;
    }
    var dynamicQALength = data.dynamicQuickAccess.length;
    if ((common.isSecretMode) || ((dynamicQALength - 1) == 0)) {
        this.editBtn.style.display = "none";
    } else {
        this.editBtn.style.display = "block";
    }
    for(var i = 0; i < fixedQA.length; i++) {
        itemsString += this.createItemHtmlString(fixedQA[i],i, itemWidth, this.ROW_ITEMS);
    }
    for(var i = 0; i < dynamicQALength && i < this.PAGE_ITEMS - fixedQA.length; i++) {
        itemsString += this.createItemHtmlString(data.dynamicQuickAccess[i],i, itemWidth, this.ROW_ITEMS);
    }
    if ((dynamicQALength == 1 && !common.isSecretMode) || (dynamicQALength == 0 && common.isSecretMode)) {
        itemsString += '<div class="quickaccess_empty" style="display: flex;">'
                    + '<div class="no-qa-p1">No Quick access shortcuts</div>'
                    + '</div>'
        pages[0].innerHTML = itemsString;
        pages[0].style.display = "flex";
    } else {
        pages[0].innerHTML = itemsString;
        pages[0].style.display = "block";
    }


    if (isDexmode) {
        $('.quick-access .item-content').addClass('quick-access-item-content-dex-size');
        $('.quick-access .item-img').addClass('quick-access-icon-dex-size');
        $('.failed-img').addClass('quick-access-icon-dex-size');
        $('.hover-failed-img').addClass('quick-access-icon-dex-size');
        $('.failimgicon').addClass('failimgicon-dex-size');
    }

    if(this.firstload){
        clearTimeout(this.timeout);
        this.timeout = setTimeout(function () {
            //console.log("SingleCP: QuickAccess load second page delayed QA items");
            qa_secondpage_items(this);
        }.bind(this), 40);
    }else{
        //console.log("SingleCP: QuickAccess load second page QA items");
        qa_secondpage_items(this);
    }
    function qa_secondpage_items(self) {
        //dynamic QA
        var diffItems = self.PAGE_ITEMS - fixedQA.length > 0? self.PAGE_ITEMS - fixedQA.length : 0;
        dynamicQALength -= diffItems;
        dynamicQALength = dynamicQALength <= 0? 0 : dynamicQALength;

        if (dynamicQALength % self.PAGE_ITEMS == 0) {
            self.pageNumber = 1 + dynamicQALength/self.PAGE_ITEMS;
        } else {
            self.pageNumber = 2 + parseInt(dynamicQALength/self.PAGE_ITEMS);
        }
        self.pageNumber = self.pageNumber <= self.MAX_PAGES? self.pageNumber: self.MAX_PAGES;
        if (self.currentPage >= self.pageNumber) {
            self.currentPage = self.pageNumber - 1;
        }

        self.container.style.width = self.pageNumber * 100 + "%";
        var qaIconIndex = 0;
        var addedAddButton = false;
        for (var j = 0; j < self.pageNumber - 1; j++) {
            itemsString = "";
            var qaIconCount = self.PAGE_ITEMS;
            while (qaIconCount < self.SECOND_PAGE_ITEMS && qaIconIndex < dynamicQALength) {
                var iconData = data.dynamicQuickAccess[qaIconIndex + diffItems];
                if (self.isValidIconData(iconData)) {
                    itemsString += self.createItemHtmlString(iconData, qaIconCount, itemWidth, self.PAGE_ITEMS/2);
                    if (iconData.link === 'add_qa_link') addedAddButton = true;
                    qaIconCount++;
                }
                qaIconIndex++;
            }
            if (!addedAddButton && !common.isSecretMode) {
                itemsString += self.createItemHtmlString(defaultAddButton, qaIconCount, itemWidth, self.PAGE_ITEMS/2);
            }
            if (qaIconCount > 0) {
                self.addPage();
                pages[j + 1].innerHTML = itemsString;
                if (self.currentPage != 1) {
                    pages[j + 1].style.display = "none";
                }
                pages[j + 1].style.overflowY = "scroll";
                pages[j + 1].style.height = (document.documentElement.clientHeight - 40) + "px";
                if (isDexmode) {
                    pages[j + 1].style.paddingBottom = '75px';
                }
            }
        }

        if (common.getDeviceType() == common.deviceType.DEX) {
            $('.quick-access .item-content').addClass('quick-access-item-content-dex-size');
            $('.quick-access .item-img').addClass('quick-access-icon-dex-size');
            $('.failed-img').addClass('quick-access-icon-dex-size');
            $('.hover-failed-img').addClass('quick-access-icon-dex-size');
            $('.failimgicon').addClass('failimgicon-dex-size');
        }
        self.elementItems  = self.element.querySelectorAll(".item");
        // self.currentPage = self.currentPage < 0 ? 0 : (self.pageNumber && (self.currentPage >= self.pageNumber)) ? self.pageNumber - 1 : self.currentPage;
        self.updateDots();
        return false;
    };
    localStorage.setItem('renderedQApageOne', pages[0].innerHTML);
    if (pages[1])
        localStorage.setItem('renderedQApageTwo', pages[1].innerHTML);
};

QuickAccessHTML.prototype.addPage = function () {
    if(this.container.childElementCount < 2){
        var qaPage = document.createElement('div');
        qaPage.className = 'quickaccess-page';

        if (common.getDeviceType() == common.deviceType.DEX) {
            qaPage.style.width = document.body.clientWidth - 146 + 'px';
            qaPage.style.marginLeft = 71 + 'px';
            qaPage.style.marginRight = 71 + 'px';
        } else {
            qaPage.style.width = document.body.clientWidth - 32 + 'px';
        }
        this.container.appendChild(qaPage);

        var indicator = document.createElement('div');
        indicator.className = 'small-dot';
        this.dots.appendChild(indicator);
        if (common.isSecretMode) {
            $('#dots').css("left", "33.33vw");
        }else{
            $('#dots').css("left", "0vw");
        }
    }
};

QuickAccessHTML.prototype.createItemHtmlString = function (data, index, itemWidth, rowitems) {
    var item = '<div class="item item' + index + '" tabindex="0" id="qa_item' + index + '" style="margin-right:'+ 2 + 'px; margin-left:'+ 2 + 'px; width: ' + itemWidth + 'px;">';

    if (data.link === 'add_qa_link') {
        item += '<div class="item-content quickAccess-item" title="' + data.link + '">';
    } else {
            item += '<div class="item-content quickAccess-item">';
    }

    if (data.icon == 'none' || data.icon == 'error' || data.icon == 'BeforeIconSearch') {
        item += '<div class="failed-img" aria-hidden="true"><div class="failimgicon">' + data.title.charAt(0).toUpperCase() + '</div></div>';
    } else if (data.icon == "" && data.color) {
        if (data.color != -1) {
            item += '<div class="failed-img" aria-hidden="true"><div class="failimgicon" ' + 'style="background-color:#' + common.decimalToHexString(data.color) + ';">' + data.firstletter + '</div></div>';
        } else {
            item += '<div class="failed-img" aria-hidden="true"><div class="failimgicon">' + data.firstletter + '</div></div>';
        }
    } else {
        if (data.link === 'add_qa_link') {
            item += '<img class="item-img" onerror="onerrorEvent(this)" src="' + data.icon + '" title="' + data.title + '" color="' + data.color + '">';
        } else {
            item += '<img class="item-img" onerror="onerrorEvent(this)" src="' + data.icon + '" color="' + data.color + '">';
        }
    }
    if (data.link === 'add_qa_link') {
        item += '</div>'
            + '<div class="item-title"></div>'
            + '</div>';
    } else {
        item += '</div>'
            + '<div class="item-title">' + data.title + '</div>'
            + '</div>';
    }

    return item;
};

QuickAccessHTML.prototype.onResize = function () {
    //console.log("SingleCP: QuickAccessHTML:: onResize()");
    this.toggleMenu("hide");
    this.currentClientWidth = document.body.clientWidth;
    var boderHeight = common.isLandscapeMode() ? 4 : 6;
    this.xprecisionFactor = common.isLandscapeMode() ? 1/8 : 1/4;
    this.thressTranslate = -document.body.clientWidth;
    this.container.classList.remove("transition500");
    if (this.screenWidth != document.body.clientWidth) {
        this.screenWidth = document.body.clientWidth;
        this.container.style.transform = "translate3D(-" + (this.currentPage * document.body.clientWidth) + "px,0,0)";
    }

    if (common.isValid(renameQickAccessPage) && common.isValid(renameQickAccessPage.element) && renameQickAccessPage.element.style.display == 'block') {
        renameQickAccessPage.setMarginTop();
    }

    // if (common.isValid(addQuickAccess.element) && addQuickAccess.element.style.display == 'block') {
    //     addQuickAccess.onResize();
    //     if(this.prevClientWidth != this.currentClientWidth) {
    //         this.reload();
    //     }
    // } else {
        this.reload();
    // }
    // this.prevClientWidth = this.currentClientWidth;
};

QuickAccessHTML.prototype.getElementHeight = function () {
    return this.containerElement.clientHeight;
};

QuickAccessHTML.prototype.updateDots = function () {
    for (var i = 0; i < this.dots.childNodes.length; i++) {
        this.dots.childNodes[i].classList.remove('dot-active');
    }
    if (this.currentPage < 0) this.currentPage = 0;
    this.dots.childNodes[this.currentPage].classList.add('dot-active');
    if (this.currentPage == 1) {
        this.dots.style.display = 'none';
        //this.nextBtn.style.display = 'none';
    }
    if (this.currentPage != 0){
        this.dots.style.display = '-webkit-flex';
        //this.nextBtn.style.display = 'block';
    }
    let dotsLen = this.dots.children.length;
    if (dotsLen === 2) {
        //this.nextBtn.style.display = 'block';
        // if (this.pageBarElement.style.display === 'none') {
        //     this.dots.style.display = 'none';
        // } else {
            this.dots.style.display = 'flex';
        //}
    }
    if (dotsLen === 1) {
        this.dots.style.display = 'none';
        //this.nextBtn.style.display = 'none';
    }
};

QuickAccessHTML.prototype.isValidIconData = function (data) {
    if (common.isValid(data) && common.isValid(data.link) && (common.isValid(data.icon) || common.isValid(data.color))
     && common.isValid(data.title)) {
        return true;
    }
    return false;
};
