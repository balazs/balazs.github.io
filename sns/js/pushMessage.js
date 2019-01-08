/**
 * Displays toast for subscribing user to push messages
 */
class PushMessage  {
  constructor(serviceWorker){
    this.key = 'BGQ6cSUXKq89hy3RBy8lt5TvIUoeKEifPNdhqz40R1NvatTt-7fK13OIV8_5yFYsjm_alfGZn_RwywZSi6CK6L0'; // test key
    this.serviceWorker = serviceWorker;
    this.isSubscribed = false;
  }

  initialize() {
    this.pushButton.addEventListener('click', function() {
      this.pushButton.disabled = true;
      if (this.isSubscribed) {
        console.log('unsubscribe');
        this.unsubscribe();
      } else {
        console.log('subscribe')
        this.subscribe();
      }
      this.isSubscribed = !this.isSubscribed;
      this.updateBtn();
    }.bind(this), false);

    // Set the initial subscription value
    this.serviceWorker.pushManager.getSubscription()
    .then(function(subscription) {
      this.isSubscribed = !(subscription === null);
      if (this.isSubscribed) {
        console.log('User IS subscribed.');
      } else {
        console.log('User is NOT subscribed.');
      }

     this.updateBtn();
    }.bind(this)).catch(function(err) {
      console.log('Failed to subscribe the user: ', err);
      this.updateBtn();
    });
  }

  createView() {
    const prefMenu = document.getElementById('preference-menu');
    this.view = document.createElement('div');
    this.view.className = 'push-notifications-dialog';
    let message = document.createElement('p');
    message.innerHTML = 'Click to enable/disable push notifications';
    message.className = 'dialog-text';
    let input = document.createElement('input');
    input.type = 'checkbox';
    input.className = 'toggle-button-input';
    input.id = 'notifications-toggle-button';
    this.pushButton = document.createElement('label');
    this.pushButton.className = 'toggle-button pref-text';
    this.pushButton.textContent = 'Enable Push Message';
    this.pushButton.htmlFor = 'notifications-toggle-button';
    this.view.appendChild(message);
    this.view.appendChild(input);
    this.view.appendChild(this.pushButton);
    this.initialize();
    prefMenu.appendChild(this.view);
  }

  updateBtn() {
    if (Notification.permission === 'denied') {
      this.pushButton.textContent = 'Push Messaging Blocked.';
      this.pushButton.disabled = true;
      this.updateSubscriptionOnServer(null);
      return;
    }

    if (this.isSubscribed) {
      this.pushButton.textContent = 'Disable Push Messaging';
    } else {
      this.pushButton.textContent = 'Enable Push Messaging';
    }
    this.pushButton.disabled = false;
  }

  updateSubscriptionOnServer(subscription) {
    // TODO: Send subscription to application server
    if (subscription) {
      console.log(JSON.stringify(subscription));
    }
  }

  subscribe() {
    const applicationServerKey = this.urlB64ToUint8Array(this.key);
    const options = {
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey
    }
    this.serviceWorker.pushManager.subscribe(options)
        .then(function(subscription) {
          console.log('User is subscribed.');
          this.updateSubscriptionOnServer(subscription);
          this.isSubscribed = true;
          this.updateBtn();
        }.bind(this)).catch(function(err) {
          console.log('Failed to subscribe the user: ', err);
          this.updateBtn();
        });
  }

  unsubscribe() {

  }

  urlB64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}