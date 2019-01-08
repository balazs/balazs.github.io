/**
 * Creates a dialog
 */
class Dialog {
  constructor(message, time, body, title) {
    this.message = message;
    this.time = time;
    this.body = body;
    this.title = title;
    this.dialog = document.createElement("div");
    this.dialog.className = "dialog";
    this.dialogTitle = document.createElement("p");
    this.dialogTitle.className = "dialog-title";
    this.dialogTitle.innerHTML = this.title;
    this.text = document.createElement("p");
    this.text.className = "dialog-text";
    this.text.innerHTML = this.message;
    this.background = document.createElement('div');
    this.background.className = 'dialog-background';
    this.dialog.appendChild(this.dialogTitle);
    this.dialog.appendChild(this.text);
    this.background.appendChild(this.dialog);
  }

  /**
   * message disappears after a certain time
   */
  quickMessage() {
    body.appendChild(this.dialog);
    setTimeout(() => {
      body.removeChild(this.dialog);
    }, this.time);
  }

  /**
   * dialog prompting user for action
   */
  prompt() {
    let options = document.createElement("div");
    options.className = "dialog-options";
    let cancel = document.createElement("p");
    cancel.innerHTML = "Later";
    cancel.addEventListener("click", () => {
      this.body.removeChild(this.dialog);
    })
    let settings = document.createElement("a");
    settings.href = "intent://homepageaction/#Intent;scheme=internet;package=com.sec.android.app.sbrowser;end";
    settings.innerHTML = "Settings";
    settings.addEventListener("click", () => {
      body.removeChild(this.dialog);
    });
    options.appendChild(cancel);
    options.appendChild(settings);
    this.dialog.appendChild(options);
    this.body.appendChild(this.background);
  }

  /**
   * dialog for keeping/reverting QA page
   */
  popupQA() {
    let options = document.createElement("div");
    options.className = "dialog-options";
    let cancel = document.createElement("p");
    cancel.innerHTML = "No, Thank you";
    cancel.addEventListener("click", () => {
      localStorage.setItem("usuhpqakeep", false);
      this.body.removeChild(this.background);
      location.href = "internet-native://newtab/";
    });
    let settings = document.createElement("div");
    settings.innerHTML = "I'm in!";
    settings.addEventListener("click", () => {
      localStorage.setItem("usuhpqakeep", true);
      this.body.removeChild(this.background);
    });
    options.appendChild(cancel);
    options.appendChild(settings);
    this.dialog.appendChild(options);
    this.body.appendChild(this.background);
  }
}
