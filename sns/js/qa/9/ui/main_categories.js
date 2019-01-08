var paraEventMove = { // value threshold for horizontal move
    startPointX: 0,
    startPointY: 0,
    endPointX: 0,
    distance: 0,
    distanceY: 0,
    leftCurrent: 0,
    tab: -1,
    notChange: true,
    timeAniamtion: 0.1,
    threshold: document.body.clientWidth,
    flagMove: true,
    moveup: false,
    scrolling: false,
    activeEvent: true
};

var paraEventMoveWrap = { // value threshold for vertical move
    startPointX: 0,
    startPointY: 0,
    endPointX: 0,
    endPointY: 0,
    distance: 0,
    distanceY: 0,
    notChange: true,
    timeAniamtion: 0.1,
    threshold: document.body.clientWidth, // threshold distance X
    thresholdY: 267, // threshold distance X
    thresHoldMove: 10,
    sensitivity: 2,
    checkType: 0, // 1 : direction: horizontal, 2 : vertical , 0 : not move
    flag: true, // true: content page is on bottom
    moveupdown: false,
    styleMove: 1, // style move up down
    endScroll: true,
    activeEvent: true
};
var cardsClickable = true;
var clickDelay = 10;
var cancelClick;
var touchClick = false;
var mouseClick = false;

var notAclick = function() {
    cardsClickable = false;
}

var MainCategories = function(data) {
    this.name = "main_categories";
    //this.state = "singleCP_no1";
    this.listContentObject = [];
    this.adShowItems = [];

    this.element = document.getElementById('maincategories');

    this.elementTab = document.getElementById('main-categories-tab');
    this.elementTabContent = document.getElementById('main-categories-container');
    this.dhFeed = document.getElementsByClassName('dh_feed')[0];
    this.curentCP;
    this.listTabItem;
    this.tabWidth;
    this.iconReloadWidth;
    this.iconSettingWidth;
    this.boderLeftWidth;
    this.translateXMaxElementTab;
    this.oldModeWidth;
    this.marginLeftCategorieTab;
    this.marginLeftSetting;

    this.btnSetting = document.getElementById('btn-setting');
    this.btnGoTop;
    this.id = 179223212;

    this.changeListCategories = false;
    this.scrollTopOfCurrentpage = 0;
    this.object = userCategories;
    this.timeoutRunning = false;
    this.initialized = false;
    this.loadedNews = {}
    var top = "/top.html";
    if (!this.loadNewsFromCache(top)) {
        this.loadNewsFromServer(top, this.elementTabContent);
    }
    this.loadingElement();
};

MainCategories.prototype.loadNewsFromCache = function(category, categorySection) {
    if (this.loadedNews[category]) return true;
    if (window.QuickAccess && !QuickAccess.isNightModeEnabled()) {
        if (category === '/top.html') {
            document.getElementById('top-section').classList.add('active-background');
        } else {
            categorySection.element.classList.add('active-background');
        }
    }
    let timestamp = localStorage.getItem('newsFetchTimestamp' + category);
    let hour = localStorage.getItem('newsFetchHour' + category);
    let currentTime = new Date();
    let valid = false;
    if (parseInt(hour) == currentTime.getHours()) {
        if ((Math.floor(currentTime/1000) - parseInt(timestamp)) > 86399) {
            console.log('Cached news is older than a day.');
            valid = false;
        } else {
            valid = true;
        }
    }
    if (parseInt(hour) != currentTime.getHours()) {
        console.log('Cached news is older than an hour.');
        valid = false;
    }
    let startTime = performance.now();
    let news = localStorage.getItem('renderedNews' + category);
    if (news && valid) {
        console.log('news loaded from cache');
        if (category === '/top.html') {
            this.elementTabContent.innerHTML = news;
        } else {
            categorySection.element.innerHTML = news;
        }
        let endTime = performance.now();
        let totalTime = (endTime - startTime).toFixed(1);
        console.log('Loading time for cache news - ' + totalTime + " ms.");
        this.loadedNews[category] = true;
        this.init();
        this.initialized = true;
        this.loadTime();
        this.loadImages();
        if (category === '/top.html') {
            document.getElementById('top-section').classList.remove('active-background');
        } else {
            categorySection.element.classList.remove('active-background');
        }
        return true;
    }
    return false;
}

MainCategories.prototype.loadNewsFromServer = function(category, categorySection) {
    if (this.loadedNews[category]) return;
    if (this.loadNewsFromCache(category, categorySection)) return;
    if (category !== '/top.html') {
        categorySection.element.children[0].appendChild(this.loadingElement);
    }
    if (window.QuickAccess && !QuickAccess.isNightModeEnabled()) {
        if (category === '/top.html') {
            document.getElementById('top-section').classList.add('active-background');
        } else {
            categorySection.element.classList.add('active-background');
        }
    }
    let self = this;
    function timeout(ms, promise) {
        return new Promise( (resolve, reject) => {
            setTimeout(function() {
                reject(new Error("timeout"));
            }, ms)
            promise.then(resolve, reject)
        })
    }

    let request = new Request(category);
    let headers = new Headers();
    headers.append('Content-Type', 'html');
    let params = {
        method: 'GET',
        mode: 'cors'
    }
    let startTime = performance.now();
    timeout(10*1000, fetch(request, params)).then( (response) => {
        if (response.ok) {
            return response.text();
        } else {
           throw new Error('failed to fetch news');
        }
    }).then((response) => {
        if (!response) return;
        if (category === '/top.html') {
            self.elementTabContent.innerHTML = response;
        } else {
            categorySection.element.innerHTML = response;
        }
        let endTime = performance.now();
        let totalTime = (endTime - startTime).toFixed(1);
        console.log('Loading time for fetching news - ' + totalTime + " ms.");
        self.loadedNews[category] = true;
        localStorage.setItem('renderedNews' + category, response);
        let time = new Date();
        localStorage.setItem('newsFetchTimestamp' + category, Math.floor(time/1000));
        localStorage.setItem('newsFetchHour' + category, time.getHours());
    }).then( ()=> {
        self.init();
        self.initialized = true;
        self.loadTime();
        self.loadImages();
        if (category === '/top.html') {
            document.getElementById('top-section').classList.remove('active-background');
        } else {
            categorySection.element.classList.remove('active-background');
        }
    }).catch((e) => {
        let offlineText = '<div class="loading-failed-container">You are offline</div>';
        if (category === '/top.html') {
            self.elementTabContent.children[0].innerHTML = offlineText;
            document.getElementById('top-section').classList.remove('active-background');
        } else {
            categorySection.element.innerHTML = offlineText;
            categorySection.element.classList.remove('active-background');
        }
        self.init();
        self.initialized = true;
    });
}

MainCategories.prototype.setCP = function(curentCP) {
    this.curentCP = curentCP;
};

MainCategories.prototype.loadingElement = function() {
    this.loadingElement = document.createElement('div');
    this.loadingElement.className = 'loading-element';
    let loadingContainer = document.createElement('div');
    loadingContainer.className = 'loading-container timing-function';
    let loadingOne = document.createElement('img');
    loadingOne.className = 'loading-img timing-function loading-one';
    loadingOne.src = 'img/qa/loading_1.png';
    let loadingTwo = document.createElement('img');
    loadingTwo.className = 'loading-img timing-function loading-two';
    loadingTwo.src = 'img/qa/loading_1.png';
    let loadingThree = document.createElement('img');
    loadingThree.className = 'loading-img timing-function loading-three';
    loadingThree.src = 'img/qa/loading_2.png';
    let loadingFour = document.createElement('img');
    loadingFour.className = 'loading-img timing-function loading-four';
    loadingFour.src = 'img/qa/loading_2.png';
    loadingContainer.appendChild(loadingOne);
    loadingContainer.appendChild(loadingTwo);
    loadingContainer.appendChild(loadingThree);
    loadingContainer.appendChild(loadingFour);
    this.loadingElement.appendChild(loadingContainer);
};

MainCategories.prototype.init = function() {
    if (this.initialized) return;
    var self = this;
    this.oldModeWidth = document.body.clientWidth;

    //this.elementLoadingFailed = document.createElement("div");

    this.iconReloadWidth = 0;
    this.iconSettingWidth = 0;
    this.boderLeftWidth = (document.body.clientWidth * 0.277) / 100;
    this.marginLeftCategorieTab = (document.body.clientWidth * 6.666) / 100; // margin left of first tab + margin left of button setting
    this.marginLeftSetting = (document.body.clientWidth * 5.556) / 100;

    this.btnGoTop = document.createElement("img");
    this.btnGoTop.setAttribute("id", "btn-go-to-top");

    this.btnGoTop.src = "img/qa/go_to_top_mtrl.png";

    //this.element.appendChild(this.elementTabContent);
    // this.elementLoadingFailed.className = "loading-failed-container";
    // this.elementLoadingFailed.innerHTML = 'You are offline';
    // this.elementLoadingFailed.style.display = 'none';

    //this.element.appendChild(this.elementLoadingFailed);
    this.element.appendChild(this.btnGoTop);

    this.setElementSize();
    this.addEventMove();
    this.appendContent(userCategories);
    this.element.style.display = 'flex';
    //this.element.addEventListener("webkitTransitionEnd", function(event) {
        //console.log("SingleCP: ------ transition end ------");
    //}, false);
    this.loadTime();
    this.hideInactiveTabs();
};


MainCategories.prototype.loadTime = function() {
    let newsDates = document.getElementsByClassName("card-date");
    let len = newsDates.length;
    for (let i =0; i < len; i++) {
        let time = newsDates[i].dataset.time;
        let timeAgo = timeSince(time * 1000);
        newsDates[i].innerHTML = timeAgo + " ago";
    }
}
MainCategories.prototype.loadImages = function() {
    // load images
    let categoryPage = this.getactivePage();
    let imgs = categoryPage.element.getElementsByClassName('card-img-top');
    for (let i = 0; i < imgs.length; i++) {
        let img = imgs[i];
        let dataSrc = img.dataset.src;
        if (dataSrc) {
            img.src = dataSrc;
            img.removeAttribute('data-src');
        }
    }
}

/******************* active all scroll tab ***********************/
MainCategories.prototype.activeAllScroll = function(value) {
    if (value === undefined) {
        this.getactivePage().activeOverflow(true);
        return;
    }
    if (value) {
        for (var i = 0; i < this.listContentObject.length; i++) {
            this.listContentObject[i].activeOverflow(true);
        }

    } else {
        for (var i = 0; i < this.listContentObject.length; i++) {
            this.listContentObject[i].activeOverflow(false);
            if (paraEventMoveWrap.flag) {
                this.listContentObject[i].show(true);
                this.listContentObject[i].setScrollTop(0);
                this.listContentObject[i].show(false);
            }
        }
        for (var j = paraEventMove.tab - 1; j <= paraEventMove.tab-1; j++) {
            var page = this.listContentObject[j];
            if (page) {
                page.show(true);
            }
        }
        //console.log("SingleCP: active pages");
    }
};

/**************************** refresh *****************************/
MainCategories.prototype.setElementSize = function() {
    paraEventMoveWrap.thresholdY = quickAccessPage.getElementHeight();
    /**************set  ***************/
    paraEventMove.threshold = (document.body.clientWidth == 0) ? document.documentElement.clientWidth : document.body.clientWidth;
    this.setValueSize();

    if (paraEventMoveWrap.flag) {
        this.setPositionFixed(false);
    } else {
        this.setPositionFixed(true);
    }

    if (this.listTabItem != undefined) {
        this.changeDisplayPages(false);
        if (paraEventMoveWrap.flag == false) {
            this.translateYElementMainCategories(-paraEventMoveWrap.thresholdY);
        }
    }
};

/****************** funtion translate transform ********************/
MainCategories.prototype.translateXElementTab = function(tabIndex, isResized) {
    this.elementTab.style.width = parseInt((94.444 * document.body.clientWidth) / 100) +'px';
    let offset = 20;
    if (tabIndex === this.object.length - 1)
        offset = 0;
    var diff = this.elementTab.scrollLeft - this.listTabItem[tabIndex].offsetLeft + offset;
    var maxleftscroll = this.elementTab.scrollWidth - parseInt(this.elementTab.style.width);
    if (isResized) {
        this.elementTab.scrollLeft -= diff;
    } else {
        if (this.scrollInterval) {
            clearInterval(this.scrollInterval);
        }
        if((maxleftscroll == this.elementTab.scrollLeft) && (diff < 0)){
            return; // Already scrolled to max possible, so no need to scroll again.
        }
        var count = 0;
        if((diff < 0) && (maxleftscroll < (this.elementTab.scrollLeft - diff))){
            diff = this.elementTab.scrollLeft - maxleftscroll;
        }
        this.scrollInterval = setInterval(function() {
            if((diff<10) && (diff>-10)){
                this.elementTab.scrollLeft -= diff;
                clearInterval(this.scrollInterval);
            }else{
                this.elementTab.scrollLeft -= parseInt(diff / 10);
                count++;
                if (count == 10) {
                    clearInterval(this.scrollInterval);
                }
            }
        }.bind(this), 0);
    }
};

MainCategories.prototype.translateYElementMainCategories = function(value) {
    this.element.style.webkitTransform = "translate3d(0," + value + "px,0)";
};

MainCategories.prototype.transformTransition = function(element, value) {
    element.style.webkitTransition = "-webkit-transform " + value + "s";
};

MainCategories.prototype.setValueSize = function() {
    paraEventMove.threshold = document.documentElement.clientWidth;
    this.tabWidth = ((paraEventMove.threshold - this.iconReloadWidth - this.marginLeftCategorieTab - this.iconSettingWidth) / 4);
    this.elementTabContent.style.height = (window.innerHeight - this.elementTab.offsetHeight - this.dhFeed.offsetHeight - 10) + "px";
    this.translateXMaxElementTab = (this.tabWidth * this.object.length) - this.element.offsetWidth + this.iconReloadWidth + this.iconSettingWidth + this.marginLeftCategorieTab + this.marginLeftSetting;
};


MainCategories.prototype.refresh = function() {
    this.elementTab.innerHTML = "";
    index = 0;

    for (var i = 0; i < this.listTabItem.length; i++) {
        this.listTabItem[i].removeEventListener("click", this.clickTabItems.bind(this), false);
    }
    this.listTabItem = null;
    this.appendContent(userCategories);
    this.elementTabContent.style.webkitTransform = "translate3d(0,0,0)";
    this.listTabItem = document.getElementsByClassName("tab-items-categories");
    /************** load data listview when move new tab *********************/
    this.id = parseInt(this.listTabItem[0].getAttribute("type"));
};

MainCategories.prototype.getMoveWrapState = function() {
    return paraEventMoveWrap.flag;
};

/******************** callback on resize **********************/
MainCategories.prototype.onResize = function() {
    //console.log("SingleCP: MainCategories:: onResize()");
    if (paraEventMoveWrap.flag == false) {
        this.element.style.webkitTransform = "translate3d(0,-" + (paraEventMoveWrap.thresholdY) + "px,0)";
    }
    this.setElementSize();
    setTimeout(this.setElementSize.bind(this), 100);
    this.changeDisplayPages(false);
    this.translateXElementTab(paraEventMove.tab - 1, false);
    //quickAccessPage.onResize();
};

/****************************************************************/
MainCategories.prototype.scrollCallback = function() {
    var x = this;
    paraEventMoveWrap.endScroll = false;
    if (this.elementTabContent.scrollTop == 0) {
        paraEventMove.scrolling = false;
    } else {
        paraEventMove.scrolling = true;
    }
};

MainCategories.prototype.setContainerWidth = function(value) {
    this.elementTabContent.style.width = value/document.documentElement.clientWidth *100 + "vw";
};

MainCategories.prototype.findObject = function(id, array) {
    for (var i = 0; i < array.length; i++) {
        if (id == array[i].id) {
            return i;
        }
    }
    return null;
};

MainCategories.prototype.activeTabBottom = function(Tab, value) {
    if (value) {
        this.listTabItem[Tab].classList.add("activeTabBottom");
    } else {
        this.listTabItem[Tab].classList.remove("activeTabBottom");
    }
};

var addedEvent = false;
MainCategories.prototype.appendContent = function(subset) {
    this.object = [];
    // this.elementTabContent.innerHTML = "";
    this.elementTab.innerHTML = "";
    var newList = [];
    this.tabWidth = ((document.body.clientWidth - this.iconReloadWidth - this.marginLeftCategorieTab - this.iconSettingWidth) / 4);

    var showSubset = false;
    if (typeof subset !== 'undefined') {
        showSubset = true;
    }
    for (let i = 0; i < allCategories.length; i++) {
        var contentData = subset[allCategories[i]];
        var show = contentData['selected'];
        if (show) {
            this.object.push(contentData);
        }
    }
    for (let i = 0; i < this.object.length; i++) {
        var contentData = this.object[i];
        var _elem = '<button type="'
                + i
                + '" indexTab="' + i
                + 'vw" id=' + contentData['category']
                + ' class="tab-items-categories" '
                + '> <div class="main-categories-tab-title">'
                + contentData['title'] + '</div> </button>';
            // TODO: don't add to innerHTML in loop, perf issue
            // collect & do once after loop done
            this.elementTab.innerHTML += _elem;
            contentData.pageNo = i;
            contentData.curentCP = contentData.cp;
            contentData.parent = this.elementTabContent;
            newList.push(new MainCategoriesContent(contentData));
    }
    this.listContentObject = newList;
    if (paraEventMove.tab == -1) {
        paraEventMove.tab = 1;
    } else {
        var index1 = this.findObject(this.getactivePage().id, this.listContentObject);
        if (index1 == null) {
            paraEventMove.tab = 1;
            this.getactivePage().setScrollTop(0);
        } else {
            paraEventMove.tab = index1 + 1;
            this.getactivePage().setScrollTop(this.scrollTopOfCurrentpage);
        }
    }
    this.listTabItem = document.getElementsByClassName("tab-items-categories");
    this.translateTab(0, paraEventMove.tab);
    for (var i = 0; i < this.listTabItem.length; i++) {
        this.listTabItem[i].addEventListener("click", this.clickTabItems.bind(this), false);
    }
    this.changeDisplayPages(false);
    listCategoriesContent = document.getElementsByClassName("categories-tab-content");
    this.hideInactiveTabs();
    var categorySection = this.getactivePage();
    var id = categorySection.element.id.replace('-section', '');
    this.loadNewsFromServer('/' + id + '.html', categorySection);
    //this.setElementSize();
};

var index = 0;
var listCategoriesContent;
var activeCategoriesPage = [];
MainCategories.prototype.showActivePages = function(value) {
    if (value == undefined) {
        for (var i = paraEventMove.tab - 1; i <= paraEventMove.tab; i++) {
            if (i >= 0 && i < this.listContentObject.length) {
                if (i === (paraEventMove.tab - 1)) this.listContentObject[i].show(true);
                else this.listContentObject[i].show(false);
            }
        }
        return;
    }
    for (var i = paraEventMove.tab - 1; i <= paraEventMove.tab; i++) {
        if (i >= 0 && i < this.listContentObject.length) {
            if (value && (i === (paraEventMove.tab - 1) )) {
                this.listContentObject[i].show(true);
            }
            else this.listContentObject[i].show(false);
        }
    }
};

MainCategories.prototype.changeDisplayPages = function(reverse) {
    for (var i = 0; i < this.listContentObject.length; i++) {
        this.listContentObject[i].show(false);
        this.listContentObject[i].setPositionX(0);
    }
    var count = 0;
    activeCategoriesPage = [];
    if (reverse) {
        for (var i = paraEventMove.tab - 1; i >= paraEventMove.tab - 2; i--) {
            if (i >= 0 && i < this.listContentObject.length) {
                this.listContentObject[i].setPositionX(-count * document.documentElement.clientWidth);
                activeCategoriesPage.push(this.listContentObject[i]);
            }
            count++;
        }
    } else {
        for (var i = paraEventMove.tab - 1; i <= paraEventMove.tab; i++) {
            if (i >= 0 && i < this.listContentObject.length) {
                this.listContentObject[i].setPositionX(count * document.documentElement.clientWidth);
                activeCategoriesPage.push(this.listContentObject[i]);
            }
            count++;
        }
    }
    this.showActivePages(true);
    for (var i = 0; i < activeCategoriesPage.length; i++) {
        activeCategoriesPage[i].translateX(0);
    }
    //console.log("SingleCP: change displayed pages " + this.getactivePage().curentCP);
};

MainCategories.prototype.addEventMove = function() {
    this.elementTabContent.addEventListener("mousedown", ()=> {
        mouseClick = false;
        touchClick = false;
        clickDelay = 200;
    }, false);
    this.elementTabContent.addEventListener("mouseup", (e)=> {
        cardsClickable = true;
        if (e.button === 2){
            mouseClick = false;
        } else {
            mouseClick = true;
        }
    }, false);
    this.elementTabContent.addEventListener("touchstart", ()=> {
        touchClick = true;
        mouseClick = false;
        clickDelay = 10;
    }, false);
    this.elementTabContent.addEventListener("touchmove", ()=> {
        touchClick = false;
    }, false);

    this.elementTabContent.addEventListener("touchstart", this.touchStartHandler.bind(this), false);
    this.elementTabContent.addEventListener("touchend", this.touchEndHandler.bind(this), false);
    this.elementTabContent.addEventListener("touchmove", this.touchMoveHandler.bind(this), false);
    this.elementTabContent.addEventListener("mousedown", this.touchStartHandler.bind(this), false);
    this.elementTabContent.addEventListener("mouseup", this.touchEndHandler.bind(this), false);
    this.elementTabContent.addEventListener("mouseleave", this.touchEndHandler.bind(this), false);
    this.elementTabContent.addEventListener("mousemove", this.touchMoveHandler.bind(this), false);

    mainElement.addEventListener("touchstart", this.touchStartHandlerWrap.bind(this), false);
    mainElement.addEventListener("touchend", this.touchEndHandlerWrap.bind(this), false);
    mainElement.addEventListener("touchmove", this.touchMoveHandlerWrap.bind(this), false);
    mainElement.addEventListener("mousedown", this.touchStartHandlerWrap.bind(this), false);
    mainElement.addEventListener("mouseup", this.touchEndHandlerWrap.bind(this), false);
    mainElement.addEventListener("mouseleave", this.touchEndHandlerWrap.bind(this), false);
    mainElement.addEventListener("mousemove", this.touchMoveHandlerWrap.bind(this), false);

    this.elementTab.addEventListener("touchstart", this.touchStartTabHandler.bind(this), false);
    this.elementTab.addEventListener("touchend", this.touchEndTabHandler.bind(this), false);
    this.elementTab.addEventListener("touchmove", this.touchMoveTabHandler.bind(this), false);
    this.elementTab.addEventListener("mousedown", this.touchStartTabHandler.bind(this), false);
    this.elementTab.addEventListener("mouseup", this.touchEndTabHandler.bind(this), false);
    this.elementTab.addEventListener("mouseleave", this.touchEndTabHandler.bind(this), false);
    this.elementTab.addEventListener("mousemove", this.touchMoveTabHandler.bind(this), false);

    /****** event click btn-setting move to setting categories page ******/
    this.btnSetting.addEventListener("click", function(ev) {
        this.btnSetting.blur();
        mainElement.style.display = "none";
        if (!categoriesSettings) {
            categoriesSettings = new CategoriesSettings();
        }
        this.scrollTopOfCurrentpage = this.getactivePage().element.scrollTop;
        categoriesSettings.show(true, false);
        if(!navigator.onLine){
            toast.show(common.noNetworkConnection_string, 2000);
        }
        //logging.clickEvent('Button', 'Settings');
    }.bind(this), false);
    /*********************************************************************/

    /****** event click btn-totop move to top of the page ******/
    this.btnGoTop.addEventListener("click", function(ev) {
        let activePage = this.getactivePage();
        activePage.setFastScrollTop(0, activePage);
        //logging.clickEvent('Button', 'GoToTop');
    }.bind(this), false);
    /*********************************************************************/
};

/**************** show hidden btn go to top ****************/
MainCategories.prototype.displayBtnGoToTop = function(value) {
    if (value) {
        this.btnGoTop.classList.add("show-btngotop");
    } else {
        this.btnGoTop.classList.remove("show-btngotop");
    }
};

MainCategories.prototype.setScrollForTab = function(value) {
    if (value) {
        this.elementTab.style.overflowX = "scroll";
    } else {
        this.elementTab.style.overflowX = "hidden";
    }
};

MainCategories.prototype.touchStartTabHandler = function(e) {
    this.tabStartX = eventListener.getClientX(e);
    this.startScrollLeft = this.elementTab.scrollLeft;
    this.activeTabMove = true;
    this.disableClickEvent = false;
    var self = this;
    this.clickTimeout = setTimeout(function() {
        self.disableClickEvent = true;
    }, 200);
};

MainCategories.prototype.touchEndTabHandler = function(e) {
    quickAccessPage.toggleMenu("hide");
    this.activeTabMove = false;
    if (!this.disableClickEvent) {
        clearTimeout(this.clickTimeout);
    }

    if (paraEventMoveWrap.checkType == 2) {
        return;
    }
};

MainCategories.prototype.touchMoveTabHandler = function(e) {
    if (!this.activeTabMove || paraEventMoveWrap.checkType == 2) {
        return;
    }

    var clientX = eventListener.getClientX(e);
    var scrollLeft = this.startScrollLeft - (clientX - this.tabStartX);
    if (scrollLeft < 0) {
        scrollLeft = 0;
    } else if (scrollLeft > this.elementTab.scrollWidth) {
        scrollLeft = this.elementTab.scrollWidth;
    }
    this.elementTab.scrollLeft = scrollLeft;
};

/*************************** Event Touch element wrap***************************/
MainCategories.prototype.touchStartHandlerWrap = function(e) {
    if (this.element.style.display === 'none' || e.target.className === 'quickaccess_nexticon' || e.target.id === 'qa_next') {
        return;
    }
    if (!this.getactivePage()) return;
    cancelClick = setTimeout(notAclick, clickDelay);
    eventListener.eventMoving = false;
    this.touchNumber = (e.touches) ? e.touches.length : 1;
    if (this.touchNumber > 1) {
        if (this.activeEvent) {
            this.horhorizontalCallback(e);
            this.activeEvent = false;
        }
    } else {
        this.activeEvent = true;
    }
    if (!this.activeEvent) {
        return;
    }
    paraEventMoveWrap.checkType = 0;
    this.activeTouchMove = true;
    paraEventMoveWrap.thresholdY = quickAccessPage.getElementHeight();
    if (e.target.id == 'btn-setting') {
        e.stopPropagation();
        return;
    }
    paraEventMoveWrap.startPointX = eventListener.getClientX(e);
    paraEventMoveWrap.startPointY = eventListener.getClientY(e);
    if (this.touchNumber < 1) {
        paraEventMoveWrap.checkType = 0;
    } else {}
};

/*************************** vertical moving callback ************************** */
MainCategories.prototype.touchMoveHandlerWrap = function(e) {
    if (this.element.style.display === 'none') {
        return;
    }
    if (!this.getactivePage()) return;
    eventListener.eventMoving = true;
    this.touchNumber = (e.touches) ? e.touches.length : 1;
    if (!this.activeTouchMove || this.touchNumber > 1) return;

    var currentElement = document.elementFromPoint(eventListener.getClientX(e), eventListener.getClientY(e));
    if (this.activeTabMove && (currentElement != null && (typeof currentElement.className == "undefined" || currentElement.className.indexOf("tab") == -1))) {
        this.activeTabMove = false;
    }

    var self = this;
    var element = this.element;
    paraEventMoveWrap.distance = eventListener.getClientX(e) - paraEventMoveWrap.startPointX;
    paraEventMoveWrap.distanceY = eventListener.getClientY(e) - paraEventMoveWrap.startPointY;

    this.setPositionFixed(false);
    this.setValueSize();
    if (paraEventMoveWrap.checkType !== 0) {} else if (Math.abs(paraEventMoveWrap.distance) > paraEventMoveWrap.thresHoldMove &&
        Math.abs(paraEventMoveWrap.distance) > paraEventMoveWrap.sensitivity * Math.abs(paraEventMoveWrap.distanceY)) {
        paraEventMoveWrap.checkType = 1; // check Horizontal
    } else if (Math.abs(paraEventMoveWrap.distanceY) > paraEventMoveWrap.thresHoldMove &&
        paraEventMoveWrap.sensitivity * Math.abs(paraEventMoveWrap.distance) < Math.abs(paraEventMoveWrap.distanceY)) {
        paraEventMoveWrap.checkType = 2; // check Vertical
    } else {
        paraEventMoveWrap.checkType = 0;
    }
    if (this.getactivePage().getScrollTop() > 0 || !paraEventMoveWrap.endScroll) {
        paraEventMoveWrap.startPointX = eventListener.getClientX(e);
        paraEventMoveWrap.startPointY = eventListener.getClientY(e);
        return;
    }
    if (paraEventMoveWrap.checkType == 2) { // Vertical mode
        eventListener.eventMoving = true; // set active flag when move
        this.setScrollForTab(false);
         if (paraEventMoveWrap.flag == false && paraEventMoveWrap.distanceY > 0) {
            //  move down
            this.transformTransition(this.element, 0);
            if(paraEventMoveWrap.distanceY <= (paraEventMoveWrap.thresholdY)){
                this.translateYElementMainCategories((-paraEventMoveWrap.thresholdY + paraEventMoveWrap.distanceY));
            } else{
                this.translateYElementMainCategories(0);
            }
            paraEventMoveWrap.styleMove = 2;
            this.getactivePage().activeOverflow(false);
        } else if (paraEventMoveWrap.flag == true && paraEventMoveWrap.distanceY < 0) {
            //  move up
            this.transformTransition(this.element, 0);
            if(paraEventMoveWrap.distanceY >= -(paraEventMoveWrap.thresholdY)){
                this.translateYElementMainCategories(paraEventMoveWrap.distanceY);
            }else{
                this.translateYElementMainCategories(-paraEventMoveWrap.thresholdY);
            }
            paraEventMoveWrap.styleMove = 1;
            this.getactivePage().activeOverflow(false);
        }
        paraEventMoveWrap.moveupdown = true;
        return;
    }
};

MainCategories.prototype.getactivePage = function() {
    var index = paraEventMove.tab - 1;
    if (paraEventMove.tab - 1 < 0) {
        index = 0;
    } else if (paraEventMove.tab > this.listContentObject.length) {
        index = this.listContentObject.length - 1;
    }
    return this.listContentObject[index];
};

/*************************** vertical end callback ************************** */
MainCategories.prototype.touchEndHandlerWrap = function(e) {
    if (!this.getactivePage()) return;
    this.activeTouchMove = false;
    this.activeEvent = false;
    eventListener.eventMoving = false;
    this.setScrollForTab(true);

    if (e.target.id == 'btn-setting' || e.target.className === 'quickaccess_nexticon' || e.target.id === 'qa_next') {
        e.stopPropagation();
        return;
    }
    if (paraEventMoveWrap.checkType == 1 || e.type == 'mouseleave') {
        return;
    }
    if (this.element.style.display === 'none') {
        return;
    }
    if((e.target.className == 'quickaccess-page') && (parseInt(e.target.style.height) > quickAccessPage.getElementHeight())){
        return;
    }
    if((e.target.className.search("item item") == 0) && (parseInt(e.target.parentElement.style.height) > quickAccessPage.getElementHeight())){
        return;
    }
    var element = this.element;
    if (eventListener.eventMoving) {
        if (e.cancelable) e.preventDefault();
        e.cancelBubble = true;
        if (e.stopPropagation) e.stopPropagation();
        //console.log("SingleCP: cancel event");
    }
    paraEventMoveWrap.endPointY = eventListener.getClientY(e);
    paraEventMoveWrap.distanceY = paraEventMoveWrap.endPointY - paraEventMoveWrap.startPointY;
    if (paraEventMoveWrap.styleMove == 1 && paraEventMoveWrap.flag) {
        // end move up
        this.transformTransition(this.element, paraEventMoveWrap.timeAniamtion);
        if (paraEventMoveWrap.distanceY >= -(paraEventMoveWrap.thresholdY / 8)) {
            this.translateYElementMainCategories(0);
            this.getactivePage().setScrollTop(0);
            paraEventMoveWrap.flag = true;
            this.timeoutRunning = true;
            setTimeout(function() {
                this.timeoutRunning = false;
                this.activeAllScroll(false);
            }.bind(this), paraEventMove.timeAniamtion * 1000);
        } else {
            this.translateYElementMainCategories(-paraEventMoveWrap.thresholdY);
            paraEventMoveWrap.flag = false;
            // set visible scroll
            this.timeoutRunning = true;
            setTimeout(function() {
                this.timeoutRunning = false;
                this.activeAllScroll(true);
                //logging.customEvent('Feeds', 'Fullscreen');
                //controller.addScreen(maincategories);
            }.bind(this), paraEventMove.timeAniamtion * 1000);
        }
    } else if (paraEventMoveWrap.styleMove == 2 && !paraEventMoveWrap.flag) {
        // end move down
        this.transformTransition(this.element, paraEventMoveWrap.timeAniamtion);
        if (paraEventMoveWrap.distanceY >= (paraEventMoveWrap.thresholdY / 8)) {
            this.translateYElementMainCategories(0);
            this.getactivePage().setScrollTop(0);
            paraEventMoveWrap.flag = true;

            this.timeoutRunning = true;
            setTimeout(function() {
                this.timeoutRunning = false;
                this.activeAllScroll(false);
                //history.back();
            }.bind(this), paraEventMove.timeAniamtion * 1000);
        } else {
            this.translateYElementMainCategories(-paraEventMoveWrap.thresholdY);
            paraEventMoveWrap.flag = false;
            this.timeoutRunning = true;
            setTimeout(function() {
                this.timeoutRunning = false;
                this.activeAllScroll(true);
            }.bind(this), paraEventMove.timeAniamtion * 1000);
        }
    }
    this.timeoutRunning = true;

    timeout = setTimeout(function() {
        this.timeoutRunning = false;
        //console.log("SingleCP: test time : " + paraEventMoveWrap.flag);
        if (!paraEventMoveWrap.flag) {
            this.activeAllScroll(true);
        }
        this.transformTransition(this.element, 0);
    }.bind(this), paraEventMove.timeAniamtion * 1000);
    paraEventMoveWrap.moveupdown = false;
    clearTimeout(cancelClick);
    let link = e.srcElement.closest('.card')
    if (link && cardsClickable) {
        try {
            e.preventDefault();
            e.stopPropagation();
            if (touchClick || mouseClick) {
                window.location.href = link.dataset.link;
            }
        } catch (e) {}
    }
    cardsClickable = true;
};

/********************** handle Forward ******************/
MainCategories.prototype.show = function() {
    this.transformTransition(this.element, paraEventMoveWrap.timeAniamtion);
    this.translateYElementMainCategories(-paraEventMoveWrap.thresholdY);
    paraEventMoveWrap.flag = false;
    // set visible scroll
    this.timeoutRunning = true;
    setTimeout(function() {
        this.timeoutRunning = false;
        this.activeAllScroll(true);
        //controller.addScreen(maincategories);
        this.transformTransition(this.element, 0);
    }.bind(this), paraEventMove.timeAniamtion * 500);
};

MainCategories.prototype.setPositionFixed = function(value) {
    if (value) {
        this.element.style.position = "fixed";
        this.element.style.top = paraEventMoveWrap.thresholdY/document.documentElement.clientWidth *100 + "vw";
    } else {
        this.element.style.position = "relative";
        this.element.style.top = "0px";
    }
};

var timeout = null;
/******************************************************************************/
MainCategories.prototype.clickTabItems = function(e) {
    if (this.disableClickEvent) {
        this.disableClickEvent = false;
        return;
    }
    var itemTab = e.currentTarget;
    var indexTab = parseInt(itemTab.getAttribute("indexTab"));
    itemTab.blur();
    if ((paraEventMove.tab - 1) == indexTab) {
        return;
    }

    //logging.customEvent('Feeds_category', 'Switch', 'Click');
    this.translateTab(paraEventMove.tab - 1, indexTab + 1);
    if (paraEventMoveWrap.flag == false) {
        this.getactivePage().activeOverflow(true);
    }
    var categorySection = this.getactivePage();
    var id = categorySection.element.id.replace('-section', '');
    this.loadNewsFromServer('/' + id + '.html', categorySection);
    setTimeout(function() {
        this.loadImages();
    }.bind(this), 100);
    this.timeoutRunning = true;
    setTimeout(function() {
        this.changeDisplayPages(false);
        this.timeoutRunning = false;
        this.transformTransition(this.elementTabContent, 0);
        this.transformTransition(this.elementTab, 0);
    }.bind(this), paraEventMove.timeAniamtion * 500);
};

/*************************** Event Touch ***************************/
MainCategories.prototype.touchStartHandler = function(e) {
    this.activeTouchMove = true;
    this.listContentActiveMove = true;
    paraEventMove.startPointX = eventListener.getClientX(e);
    paraEventMove.startPointY = eventListener.getClientY(e);
    this.showActivePages(true);
};
/****************************** horizontal moving callback ******************** */
MainCategories.prototype.touchMoveHandler = function(e) {
    if (!this.listContentActiveMove || !this.activeEvent) return;
    if (paraEventMoveWrap.checkType == 2) {
        paraEventMove.flagMove = false;
        return;
    }
    var self = this;
    var element = e.currentTarget;
    paraEventMove.distance = eventListener.getClientX(e) - paraEventMove.startPointX;
    paraEventMove.distanceY = eventListener.getClientY(e) - paraEventMove.startPointY;
    if (paraEventMoveWrap.checkType == 2) { // move vertical
        paraEventMove.flagMove = false;
        return;
    } else if (paraEventMoveWrap.checkType == 1) { // move horizontal
        eventListener.eventMoving = true; // set active flag when move
        /**************************/
        if (paraEventMoveWrap.flag == false) {
            this.getactivePage().activeOverflow(false);
        }
        paraEventMove.flagMove = true;
        if (((paraEventMove.tab == 1) && (paraEventMove.distance > 0)) ||
            ((paraEventMove.tab == this.object.length) && (paraEventMove.distance < 0))) {
            paraEventMove.notChange = true;
            return 0;
        }
        if (paraEventMove.distance >= -paraEventMove.threshold && paraEventMove.distance <= paraEventMove.threshold) {
            paraEventMove.notChange = false;
            if (paraEventMove.distance < 0) {
                this.changeDisplayPages(false);
                for (var i = 0; i < activeCategoriesPage.length; i++) {
                    activeCategoriesPage[i].element.style.display = 'flex';
                    activeCategoriesPage[i].translateX(paraEventMove.distance);
                }
            } else {
                this.changeDisplayPages(true);
                for (var i = 0; i < activeCategoriesPage.length; i++) {
                    activeCategoriesPage[i].element.style.display = 'flex';
                    activeCategoriesPage[i].translateX(paraEventMove.distance);
                }
            }
        }
    } else {
        paraEventMove.notChange = true;
        return;
    }
};

MainCategories.prototype.horhorizontalCallback = function(e) {
    if (paraEventMoveWrap.checkType == 2 || paraEventMoveWrap.checkType == 0) {
        return;
    }
    if (paraEventMoveWrap.flag == false) {
        this.getactivePage().activeOverflow(true);
    }
    var element = e.currentTarget;
    paraEventMove.endPointX = eventListener.getClientX(e);
    paraEventMove.distance = paraEventMove.endPointX - paraEventMove.startPointX;
    if (paraEventMove.notChange === true) {
        paraEventMove.notChange = false;
        return;
    }
    //logging.customEvent('Feeds_category', 'Switch', 'Swipe');
    this.transformTransition(element, paraEventMove.timeAniamtion);
    if (paraEventMove.distance >= paraEventMove.threshold / 8) {
        if (paraEventMove.tab == 1) return;
        /**************** move menu tab categories [swipe right to left]****************/
        this.translateTab(paraEventMove.tab - 1, paraEventMove.tab - 1);
    } else if (paraEventMove.distance <= -paraEventMove.threshold / 8) {
        /**************** move menu tab categories [swipe left to right] ****************/
        this.translateTab(paraEventMove.tab - 1, paraEventMove.tab + 1);
    }
    var categorySection = this.getactivePage();
    var id = categorySection.element.id.replace('-section', '');
    this.loadNewsFromServer('/' + id + '.html', categorySection);
    setTimeout(function() {
        this.loadImages();
    }.bind(this), 100);
    /** check scrollTop to display btn go top **/
    if (this.getactivePage().getScrollTop() == 0) {
        this.displayBtnGoToTop(false);
    } else {
        this.displayBtnGoToTop(true);
    }

    this.timeoutRunning = true;
    setTimeout(function() {
        this.changeDisplayPages(false);
        this.showActivePages();
        if (!paraEventMoveWrap.flag) // if content page is  on top
            this.activeAllScroll();
        this.timeoutRunning = false;
        this.transformTransition(element, 0);
    }.bind(this), paraEventMove.timeAniamtion * 0);
};

MainCategories.prototype.touchEndHandler = function(e) {
    this.activeTouchMove = false;
    this.listContentActiveMove = false;

    if (!this.activeEvent) return;
    if (paraEventMove.scrolling) {
        setTimeout(function() {
            paraEventMove.scrolling = false;
        }.bind(this), paraEventMove.timeAniamtion * 1000);
        return;
    }
    /**************************/
    this.horhorizontalCallback(e);
};

MainCategories.prototype.translateTab = function(oldTab, newTab) {
    this.activeTabBottom(oldTab, false);
    paraEventMove.tab = newTab;
    this.transformTransition(this.elementTab, paraEventMove.timeAniamtion);
    this.translateXElementTab(paraEventMove.tab - 1, false);
    this.activeTabBottom(paraEventMove.tab - 1, true);
};

MainCategories.prototype.calculateTabNum = function() {
    var tabContainerWidth = this.elementTab.offsetWidth;
    var sum = 0;
    var i;
    for (i = 0; i < this.listTabItem.length; i++) {
        sum += this.listTabItem[i].offsetWidth;
        if (sum > tabContainerWidth) {
            break;
        }
    }
    return i > 1 ? i - 1 : 1;
};

var script = null;
var JSONPCALLBACKMap = {};
var JSONPCALLBACKREQUESTCOUNT = {};
var JSONPCALLBACKMapName = ['a', 'b', 'c', 'd', 'e'];
var JSONPCALLBACKSTATUS = {};

var activeExit = false;
MainCategories.prototype.exit = function() {
    //console.log("SingleCP: MainCategories exit");
    activeExit = true;
    this.getactivePage().element.classList.add("hidden-scrollbar");

    this.transformTransition(this.element, paraEventMoveWrap.timeAniamtion);
    this.translateYElementMainCategories(0);
    this.getactivePage().setScrollTop(0);
    paraEventMoveWrap.flag = true;

    this.timeoutRunning = true;
    setTimeout(function() {
        activeExit = false;
        this.timeoutRunning = false;
        this.getactivePage().activeOverflow(false);
    }.bind(this), paraEventMove.timeAniamtion * 1000);
};

MainCategories.prototype.resetTab = function() {
    paraEventMove.tab = -1;
    this.listContentObject = [];
};

MainCategories.prototype.hideInactiveTabs = function() {
    // hide tabs user chose to not activate
    let childNodes = this.elementTabContent.children;
    for (let a = 0; a < childNodes.length; a++) {
        childNodes[a].style.display = 'none';
    }
    //childNodes[0].style.display = 'flex';
    for (let i = 0; i < this.elementTab.children.length; i++) {
        let child = this.elementTab.children[i];
        if (child.className.includes('activeTabBottom')) {
            let sectionName = child.id.toLowerCase() + '-section';
            if (sectionName)
                document.getElementById(sectionName).style.display = 'flex';
        }
    }
};
