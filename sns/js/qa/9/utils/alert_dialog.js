var AlertDialog = function() {
    this.element;
    this.init();
};

AlertDialog.prototype.init = function() {
    this.element = document.createElement('div');
    this.element.className = 'alert-dialog';
    this.element.innerHTML = '<div class="alert-dialog-content">'
                                +'<div id="alert_message">Alert message</div>'
                                +'<div id="alert_button">OK</div>'
                            +'</div>';
    document.body.appendChild(this.element);
    this.alertMessage = document.getElementById("alert_message");
    this.alertButton = document.getElementById("alert_button");
    var self = this;
    this.alertButton.addEventListener('click', function(){
        history.back();
        if (typeof(self.clickCallback) != "undefined") {
            self.clickCallback();
        }
    });
};

AlertDialog.prototype.show = function(message, clickCallback) {
    this.alertMessage.innerHTML = message;
    this.element.style.display = "block";
    this.clickCallback = clickCallback;
    controller.addScreen(alertDialog);
};

AlertDialog.prototype.exit = function() {
    this.element.style.display = "none";
};
