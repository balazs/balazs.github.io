/**
 * 
 */

var promptHomePage = promptHomePage || {};

promptHomePage.promptUserHomepage = function() {
  if (this.rewards() && this.eligable() && !this.qaAlreadySet()) {
    this.showPrompt();
    return;
  }
  if (!this.eligable())
    return;
  let launchCount = localStorage.getItem("launch_count");
  if (parseInt(launchCount) === 3 && !this.qaAlreadySet()) {
    this.showPrompt();
  }
}

promptHomePage.showPrompt = function() {
  let msgText = "Quick Access now brings trending content. Tap Settings to select \"Quick access\" as new home page.";
  let msg = new Dialog(msgText, 1000, document.getElementsByTagName("body")[0])
  msg.prompt();
}

promptHomePage.eligable = function() {
  let match = "SamsungBrowser/";
  let agents = navigator.userAgent.split(" ");
  for (let i = 0; i < agents.length; i++) {
    if (agents[i].indexOf(match) !== -1) {
      let version = agents[i].replace(match, "");
      if (parseFloat(version) >= 8.2) {
        return true;
      }
    }
  };
  return false;
}

promptHomePage.qaAlreadySet = function() {
  if (window.QuickAccess) {
    return window.QuickAccess.isSetAsHomePage();
  } else {
    return false;
  }
}

promptHomePage.rewards = function() {
  let params = getUrlState();
  if (params.s_rewards) {
    return true;
  } else {
    return false;
  }
}
