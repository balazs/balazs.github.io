function failed(msg, error) {
    console.error(msg);
    if (error && error.message)
        console.error(error.message);
}

var urlParams = {};
window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,
                             function(m, key, value) { urlParams[key] = value; });

function requestNotificationPermission(next) {
    console.info('requestNotificationPermission');
    Notification.requestPermission(
        function(result) {
            console.log('Notification.requestPermission result: ' + result);
            if (result === 'granted') {
                next();
            } else {
                console.error("Failed to aquire notification permission.");
            }
        }
    );
}

var pushSub;

function didSubscribe(subsciption) {
    showDidRegisterPush(subsciption);
    pushSub = subsciption;
}

function registerPush() {
    if (Notification.permission !== 'granted') {
        requestNotificationPermission(registerPush);
        return;
    }
    navigator.serviceWorker.ready.then(function (swReg) {
        showDidRegisterServiceWorker();
        swReg.pushManager.subscribe({userVisibleOnly: true}).then(function (subsciption) {
            didSubscribe(subsciption);
        }).catch(function (err) {
           failed('subscribe failed', err);
        });
    }).catch(function (err) {
       failed('sw ready failed', err);
    })
}

function onLoad() {
    console.info('onLoad');
    if (urlParams['received'] !== undefined)
        showDidReceive();

    if (!navigator.serviceWorker.controller) {
        navigator.serviceWorker.register('sw.js').then().catch(function (err) {
            failed('sw reg failed', err);
        });
    } else {
        showDidRegisterServiceWorker();
        navigator.serviceWorker.ready.then(function (swReg) {
            swReg.pushManager.getSubscription().then(function (subsciption) {
                if (subsciption) didSubscribe(subsciption);
                else console.info('no push reg found');
            }).catch(function (err) {
                failed('failed checking push subsciption', err);
            });
        }).catch(function (err) {
            failed('failed getting sw reg', err);
        });
    }
}

function unregisterPush() {
    // TBD
}
