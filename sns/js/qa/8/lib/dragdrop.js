var DragDrop = function() {
    this.moveInfo = {};
    this.touchCount = 0;
    this.eventListener = null;
    this.activeTouchMove = false;
    this.dragable = true;
    this.isMoving = false;
    this.currentPage = 0;
    this.init();
};

DragDrop.prototype.init = function() {
    this.eventListener = new EventListener();
};

DragDrop.prototype.setDragable = function(dragable) {
    if (this.dragItem != undefined) {
        this.dragable = dragable;
    } else {
        this.dragable = false;
    }
    if (dragable) {
        this.placeHolder.style.height = this.dragItem.getBoundingClientRect().height + "px";
        this.ulEl.insertBefore(this.placeHolder, this.dragItem);
        this.setDragItemPosition(this.dragItem.top, this.dragItem.left);
        this.dragItem.classList.add("drag-item");
    }
};

DragDrop.prototype.setDragItemPosition = function(top, left) {
    this.dragItem.style.top = (top + 0.2 * parseInt($("body").css("width")) / 2) + "px";
    this.dragItem.style.left = ((left + 0.1 * parseInt($("body").css("width")) / 2) + parseInt($("body").css("margin-left")))+ "px";
};

DragDrop.prototype.setIntervalScroll = function(isRun) {
    if (isRun) {
        var topDiff = quickAccessSettings.dragDrop.dragItem.getBoundingClientRect().top - quickAccessSettings.container.getBoundingClientRect().top;
        var bottomDiff = quickAccessSettings.dragDrop.dragItem.getBoundingClientRect().bottom - quickAccessSettings.container.getBoundingClientRect().bottom;
        if (topDiff <= 5) {
            quickAccessSettings.scroll("up");
        } else if (bottomDiff >= 15) {
            quickAccessSettings.scroll("down");
        } else if (topDiff > 5 || bottomDiff < 15) {
            quickAccessSettings.stopScrollAnimate();
        }
    } else {
        quickAccessSettings.stopScrollAnimate();
    }
};

DragDrop.prototype.sortable = function(object, dropCallback) {
    this.dropCallback = dropCallback;
    this.itemClass = object.itemClass;
    this.ulEl = object.element;
    this.placeHolder = object.placeHolder;
    this.el = object.parent;
    this.addEventsListener();
    this.preMargin = object.preMargin;
};

DragDrop.prototype.addEventsListener = function() {
    this.el.addEventListener("touchstart", this.touchStartHandler.bind(this), false);
    this.el.addEventListener("touchmove", this.touchMoveHandler.bind(this), false);
    this.el.addEventListener("touchend", this.touchEndHandler.bind(this), false);
    this.el.addEventListener("touchcancel", this.touchEndHandler.bind(this), false);

    this.el.addEventListener("mousedown", this.touchStartHandler.bind(this), false);
    this.el.addEventListener("mousemove", this.touchMoveHandler.bind(this), false);
    this.el.addEventListener("mouseup", this.touchEndHandler.bind(this), false);
    this.el.addEventListener("mouseleave", this.touchEndHandler.bind(this), false);
};

DragDrop.prototype.setClickCallback = function(clickCallback) {
    this.clickCallback = clickCallback;
};

DragDrop.prototype.setMargin = function(preMargin) {
    this.preMargin = preMargin;
};

DragDrop.prototype.updateDragItem = function() {
    var top = this.top,
        left = this.left;
    if (this.preMargin) {
        top -= this.preMargin.top;
        left -= this.preMargin.left;
    }
    if (this.dragItem) {
        this.setDragItemPosition(top, left);
    }
    //console.log('SingleCP: top');
};

var touchStartFire = false;
var mouseDown = 0;
DragDrop.prototype.touchStartHandler = function(ev) {
    //console.log("SingleCP: start " + event.type);
    this.isMoving = false;
    if (ev.type == "touchstart") {
        touchStartFire = true;
        setTimeout(function() {
            touchStartFire = false;
            //console.log("SingleCP: time out: " + touchStartFire);
        }, 50);
    }
    if ((ev.button == 0 || ev.button == 2) && ev.buttons == 3) {
        return;
    }
    if (ev.type == "mousedown") {
        mouseDown++;
        if(mouseDown>1) return;
    }
    touchNumber = (ev.touches) ? ev.touches.length : 1;
    if (touchNumber > 1) {
        return;
    }
    this.activeTouchMove = true;
    this.touchCount++;

    this.dragItem = document.elementFromPoint(this.eventListener.getClientX(ev), this.eventListener.getClientY(ev));
    if (this.dragItem.classList.contains(this.itemClass) &&
        (!this.dragItem.childNodes[0] || this.dragItem.childNodes[0].title !== 'add_qa_link')) {
        this.activeDragDrop = true;
        categoriesSettings.element.style.overflowY = "hidden";
    } else {
        this.activeDragDrop = false;
        return;
    }
    this.dragItem.top = this.dragItem.offsetTop;
    if (this.dragItem.top === 0) {
        return;
    }
    var style = this.dragItem.currentStyle || window.getComputedStyle(this.dragItem);
    this.dragItem.left = this.dragItem.offsetLeft - style.marginLeft.substr(0, style.marginLeft.length - 2) - this.currentPage * document.body.clientWidth;

    this.moveInfo.offsetX = this.dragItem.offsetLeft - this.eventListener.getClientX(ev) - this.currentPage * document.body.clientWidth;
    this.moveInfo.offsetY = this.dragItem.offsetTop - this.eventListener.getClientY(ev);

    if (this.preMargin) {
        this.dragItem.top -= this.preMargin.top;
        this.dragItem.left -= this.preMargin.left;
    }
    this.dragItem.top = (this.eventListener.getClientY(ev) - this.dragItem.clientHeight);
    this.dragItem.left = (this.dragItem.left-this.dragItem.clientWidth/4);
    if (this.dragable) {
        this.setDragItemPosition((this.dragItem.top + this.dragItem.parentElement.parentElement.scrollTop), this.dragItem.left);
        this.dragItem.classList.add("drag-item");

        this.placeHolder.style.height = this.dragItem.clientHeight + "px";
        this.ulEl.insertBefore(this.placeHolder, this.dragItem);
    }
};
DragDrop.prototype.touchMoveHandler = function(ev) {
    if (!this.activeDragDrop || !this.dragable) {
        return;
    }
    this.isMoving = true;
    var touchNumber = (ev.touches) ? ev.touches.length : 1;
    if (!this.activeTouchMove || touchNumber > 1) {
        return;
    }
    if (ev.button == 2 && ev.buttons == 1) {
        return;
    }
    this.top = (this.eventListener.getClientY(ev) +  this.preMargin.top - this.dragItem.offsetTop);
    this.left = (this.eventListener.getClientX(ev) + this.moveInfo.offsetX);
    var top = this.top,
        left = this.left;
    if (this.preMargin) {
        top -= this.preMargin.top;
        left -= this.preMargin.left;
    }
    this.setDragItemPosition((this.eventListener.getClientY(ev) - this.dragItem.clientHeight), (left-this.dragItem.clientWidth/4));
    this.dragItem.style.display = "none";
    this.dropItem = document.elementFromPoint(this.eventListener.getClientX(ev), this.eventListener.getClientY(ev));
    this.dragItem.style.removeProperty("display");
    if (this.dropItem && this.dropItem.classList.contains(this.itemClass) &&
        (!this.dropItem.childNodes[0] || this.dropItem.childNodes[0].title !== 'add_qa_link')) {
        var qaList = document.getElementsByClassName('qa-list')[0];
        var dropItemIndex = [].slice.call(qaList.children).indexOf(this.dropItem);
        var placeHolderIndex = [].slice.call(qaList.children).indexOf(this.placeHolder);
        if (dropItemIndex < placeHolderIndex) {
            this.ulEl.insertBefore(this.placeHolder, this.dropItem);
        } else {
            this.ulEl.insertBefore(this.placeHolder, this.dropItem.nextSibling);
        }
    }
    this.setIntervalScroll(true);
};
var oldTimeClick = 0,
    oldTimeClickMouse = 0;
var oldEventName = "";
DragDrop.prototype.touchEndHandler = function(ev) {
    document.activeElement.blur();
    //console.log("SingleCP: end " + event.type);
    if (ev.button == 2 && ev.buttons == 1) return;
    if(ev.type == "mouseup" || ev.type == "mouseleave"){
        mouseDown--;
        if(mouseDown > 0)
            return;
    }
    if (ev.touches && ev.touches.length > 0) return;
    if (this.dragItem == undefined || !this.activeDragDrop) return;
    categoriesSettings.element.style.overflowY = "scroll";
    if (this.dragItem.classList.contains('drag-item')) {
        this.dragItem.classList.remove("drag-item");
    }
    this.dragItem.style.removeProperty("transform");
    this.dragItem.style.top = "0px";
    this.dragItem.style.left = "0px";
    if (!this.activeDragDrop) {
        this.touchCount = 0;
        return;
    } else {
        this.activeTouchMove = false;
    }
    //console.log('SingleCP: ' + ev.type + ", fire " + touchStartFire);
    if (touchStartFire && ev.type == "mouseup") {
        if (this.ulEl.contains(this.placeHolder))
            this.ulEl.removeChild(this.placeHolder);
        return;
    }
    if ("touchend" == ev.type && (ev.timeStamp - oldTimeClick) < 100) {
        //console.log("SingleCP: too quick 1");
        if (this.ulEl.contains(this.placeHolder))
            this.ulEl.removeChild(this.placeHolder);
        return;
    }
    oldTimeClick = ev.timeStamp;
    //console.log('SingleCP: ' + (ev.timeStamp - oldTimeClickMouse));
    if ("mouseup" == ev.type && (ev.timeStamp - oldTimeClickMouse) < 100) {
        //console.log("SingleCP: too quick 2");
        if (this.ulEl.contains(this.placeHolder))
            this.ulEl.removeChild(this.placeHolder);
        return;
    }
    oldTimeClickMouse = ev.timeStamp;
    oldEventName = ev.type;

    this.activeDragDrop = false;
    var touchNumber = (ev.touches) ? ev.touches.length : 0;
    if (touchNumber > 0) {
        this.touchCount = 0;
        return;
    }

    clearTimeout(this.timeout);
    this.setIntervalScroll(false);
    this.autoScroll = false;
    if (this.touchCount >= 1) {
        if (this.dragItem.classList.contains(this.itemClass) && !this.isMoving && this.clickCallback) {
            this.clickCallback(this.dragItem);
        }
        if (this.ulEl.contains(this.placeHolder))
            this.ulEl.removeChild(this.placeHolder);
        //console.log("SingleCP: remove element");
    } else {
        if (this.ulEl.contains(this.placeHolder)) {
            this.ulEl.insertBefore(this.dragItem, this.placeHolder);
            this.ulEl.removeChild(this.placeHolder);
        }
        this.dropCallback();
        var items = document.getElementsByClassName('dn-item');
        var itemHeight = items[0].clientHeight;
        if (itemHeight > 0) {
            for (var i = 0; i < items.length; i++) {
                items[i].style.height = "initial";
                items[i].style.removeProperty('outline');
            }
        }
    }
    this.touchCount = 0;
};