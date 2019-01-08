var MainCategoriesContent = function(option) {
    this.contentsAnimation;
    this.loadingSucceed = true;
    this.loadingFlag = false;
    this.loadedDataExists = false;
    this.element = document.getElementById(option.category + '-section');
    this.currentLocalName;
    this.listItems = [];
    this.parent;
    this.method;
    this.FADE_ANIMATION_DURATION = 500;
    this.init(option);
};


MainCategoriesContent.prototype.init = function(option){
    this.dislikeCount = 0;
    this.id = option.id;
    this.parent = option.parent;
    this.curentCP = option.curentCP;
    this.currentCpApi = '';

    this.setBackground(true);
    var self = this;
    this.element.addEventListener("scroll", function () {
        if (!activeExit) this.classList.remove("hidden-scrollbar");
        var scrollTop = this.scrollTop;
        var scrollHeight = this.scrollHeight;
        var offsetHeight = this.offsetHeight;
        var contentHeight = scrollHeight - offsetHeight;

        if (scrollTop == 0) {
            maincategories.displayBtnGoToTop(false);
        } else {
            maincategories.displayBtnGoToTop(true);
        }

        // if ((self.loadingSucceed && contentHeight - 300 <= scrollTop) ||
        //     (!self.loadingSucceed && contentHeight <= (scrollTop + 1))) { /* at the bottom */
        ////     console.log("SingleCP: bottom!!!");
        //     if (!self.loadingFlag) {
        //         self.getData({method : "append", loadFirstTime: false});
        //     }
        // }
        // self.checkVisibleItems({
        //     scrollLength: scrollHeight,
        //     scrollTop: scrollTop,
        //     scrollBottom: offsetHeight + scrollTop,
        //     listElements: this.childNodes
        // });
    }, false);

    // for loading element
    // this.loadingEle = document.createElement("li");
    // this.loadingEle.className ="loading-element";
    // this.loadingEle.innerHTML = '<div class="loading-container timing-function">'
    //                                 +'<img class="loading-img timing-function loading-one" onerror="this.style.display=' + "'" + 'none' + "'"  + '" src="img/qa/loading_1.png">'
    //                                 +'<img class="loading-img timing-function loading-two" onerror="this.style.display=' + "'" + 'none' + "'"  + '" src="img/qa/loading_1.png">'
    //                                 +'<img class="loading-img timing-function loading-three" onerror="this.style.display=' + "'" + 'none' + "'"  + '" src="img/qa/loading_2.png">'
    //                                 +'<img class="loading-img timing-function loading-four" onerror="this.style.display=' + "'" + 'none' + "'"  + '" src="img/qa/loading_2.png">'
    //                             +'</div>';
    //this.element.appendChild(this.loadingEle);
    this.displayLoadingEle(false);

    // if (this.id == "news_local") {
    //     this.appendLocalElements();
    // }
};

MainCategoriesContent.prototype.show = function(value){
    if (value) {
        this.element.classList.remove("hidden-content");
        this.element.style.display = "flex";
    } else {
        this.element.classList.add("hidden-content");
        this.element.style.display = "none";
    }
    //this.displayLoadingEle(false);
};

MainCategoriesContent.prototype.setBackground = function(value){
    if (value && window.QuickAccess && !QuickAccess.isNightModeEnabled()) {
        this.element.classList.add("active-background");
    } else {
        this.element.style.opacity = 1.0;
    }
};

MainCategoriesContent.prototype.translateX = function(x,needTransition){
    this.element.classList.add("hidden-scrollbar");
    let distance = x/document.documentElement.clientWidth *100;
    this.element.style.transform = "translate3d(" + distance + "vw, 0, 0)";
    this.element.style.transition = "0s";
};

MainCategoriesContent.prototype.setPositionX = function(value){
    this.element.style.left = value/document.documentElement.clientWidth *100 + "vw";
};

MainCategoriesContent.prototype.activeOverflow = function(value){
    if (value) {
        this.element.classList.add("active-overflow-content");
    } else {
        this.element.classList.remove("active-overflow-content");
    }
};

MainCategoriesContent.prototype.setScrollTop = function(value){
    this.element.scrollTop = value;
};

MainCategoriesContent.prototype.setFastScrollTop = function(value, activePage){
    common.animateScroll(activePage.element, value, 300);
};

MainCategoriesContent.prototype.getScrollTop = function(){
    return this.element.scrollTop;
};

MainCategoriesContent.prototype.getscrollHeight = function(){
    return this.element.scrollHeight;
};

MainCategoriesContent.prototype.getoffsetHeight = function(){
    return this.element.offsetHeight;
};

MainCategoriesContent.prototype.getloadingEleOffsetHeight = function(){
    return this.loadingEle.offsetHeight;
};

MainCategoriesContent.prototype.displayLoadingEle = function(value){
    // if (value) {
    ////     console.log("show loading");
    //     this.loadingEle.classList.remove("hidden-loading");
    // } else {
    ////     console.log("hide loading");
    //     this.loadingEle.classList.add("hidden-loading");
    // }
};