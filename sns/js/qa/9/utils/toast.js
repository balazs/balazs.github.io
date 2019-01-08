var Toast = function() {
    this.init();
};

Toast.prototype.init = function() {
    this.element = document.createElement("div");
    this.element.className = 'toast-page';
    this.element.innerHTML = '<div class="toast-popup"></div>';
    document.body.appendChild(this.element);
    this.toastPopup = this.element.querySelector(".toast-popup");
    this.element.style.display = "none";
};

Toast.prototype.show = function(text, timeout) {
    this.toastPopup.innerHTML = '<div>' + text + '</div>';
    if (typeof QuickAccess !== 'undefined') {
        if (common.getDeviceType() == common.deviceType.DEX) {
            this.toastPopup.style.bottom = "70px";
        }
    }
    this.element.style.removeProperty("display");
    var self = this;
    setTimeout(function(){
        self.element.style.display = "none";
    }, timeout);
};