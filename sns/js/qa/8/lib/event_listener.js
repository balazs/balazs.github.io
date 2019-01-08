var EventListener = function(data) {
    this.isTouchSupported;
    this.startEvent;
    this.moveEvent;
    this.endEvent;
    this.eventMoving = false;

    this.init();
};

EventListener.prototype.init = function() {
    this.isTouchSupported = 'ontouchstart' in window;
    this.startEvent = this.isTouchSupported ? 'touchstart' : 'mousedown';
    this.moveEvent = this.isTouchSupported ? 'touchmove' : 'mousemove';
    this.endEvent = this.isTouchSupported ? 'touchend' : 'mouseup';
};

EventListener.prototype.getClientX = function(e) {
    return (e.pageX) ? e.pageX : e.changedTouches[0].clientX;
};

EventListener.prototype.getClientY = function(e) {
    return (e.pageY) ? e.pageY : e.changedTouches[0].clientY;
};