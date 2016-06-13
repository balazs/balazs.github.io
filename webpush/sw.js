function failed(msg, error) {
    console.error(msg);
    if (error && error.message)
        console.error(error.message);
}

this.oninstall = function(event) {
    console.info("sw installed");
}

this.onactivate = function(event) {
    console.info("sw activated");
}

this.onpush = function (event) {
    var msg = 'Some push message received at \'' + (new Date()).toUTCString() + '\'';
    self.registration.showNotification(msg).then(function () {
        console.info('notification shown');
    }).catch(function (err) {
        failed('could not show notification', err);
    });
};

this.onnotificationclick = function(event) {
    var noti = event.notification;

    console.info('notification activated');

    event.waitUntil(clients.openWindow('./index.html?received=1'));
}
