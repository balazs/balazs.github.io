var Controller = function(option) {
    this.screenStack = [];
    this.canPushHistory = true;
    this.currentPageNum = 0;
    this.allScreenCount;
    this.openLikeHomePage = false;
    //this.initial();
};

Controller.prototype.initial = function() {
};

Controller.prototype.setAvailableScreen = function(screensArray) {
    this.availableScreens = screensArray;
    this.allScreenCount = this.availableScreens.length;
};

Controller.prototype.addScreen = function (screen) {
    this.screenStack.push(screen);
    this.currentPageNum = parseInt(screen.state.replace("singleCP_no",""));
    if (this.currentPageNum != 2) {
        try {
            history.pushState(screen.state, null, window.location.pathname);
        } catch (error) {
            this.canPushHistory = false;
            //console.log('SingleCP: addScreen: ' + error);
        }
    }
    this.onResize();
};

Controller.prototype.back = function(event) {
    var stateNum = event.state;
    if (!stateNum || stateNum.indexOf("singleCP_no")==-1) {
        if (this.openLikeHomePage) {
            this.currentPageNum = 0;
            for (var i = 1; i < this.allScreenCount; ++i) {
                try {
                    this.availableScreens[i].exit();
                } catch(e) {}
            }
        } else {
            history.back();
        }
    } else {
        stateNum= parseInt(stateNum.replace("singleCP_no",""));
        if (stateNum === 2) return;
        if (stateNum  > this.currentPageNum) {
            this.availableScreens[stateNum].show(true, true);
        } else if (stateNum == this.currentPageNum) {
            history.back();
        } else {
            var currentScreen = this.screenStack.pop();
            if (typeof currentScreen != 'undefined' && typeof currentScreen.exit != 'undefined') {
                currentScreen.exit();
            }
        }
        this.currentPageNum = stateNum;
    }
    renameQickAccessPage.element.style.display = "none";
    this.onResize();
};

Controller.prototype.onResize = function() {
    var currentScreen = this.currentPageNum > 0 ? this.currentPageNum : 1;
    if (currentScreen === 2) return;
    this.availableScreens[currentScreen].onResize();
};