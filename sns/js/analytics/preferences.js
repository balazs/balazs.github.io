/**
 * This Class keeps track of the user preferences (favorite categories)
 *
 */
class Preferences {
  constructor(exitingPreferences, body, newsSection) {
    this.cookieName = "preferences";
    this.preferences = new Map();
    for (let i = 0; i < CATEGORIES.length; i++) {
      this.preferences.set(CATEGORIES[i], 1);
    }

    this.temp = new Map(this.preferences);
    let userPrefs = null;
    if (exitingPreferences) {
      userPrefs = this.extractBitMap(exitingPreferences);
      for (let i = 0; i < userPrefs.length; i++) {
        if (CATEGORIES[i] === userPrefs[i]) {
          this.preferences.set(CATEGORIES[i], 1);
        } else {
          this.preferences.set(CATEGORIES[i], 0);
        }
      }
    }
    gtag('set', 'prefs', this.checkPrefChanged() ? userPrefs : 'null');
    this.body = body;
    this.ev = new Event("newPreferences");
    this.newsSection = newsSection;

    this.setupView();
  }

  /**
   * Generates the view for preferences menu
   */
  setupView() {
    this.pref = document.querySelector('#preference-menu');
    let header = document.querySelector('.pref-header');
    let close = header.querySelector('.close-menu');

    close.addEventListener("click", () => {
      this.save();
      this.hide();
    })
    document.addEventListener('close-menu', () => {
      this.save();
      this.hide();
    });

    this.pref.addEventListener('change', (ev) => {
      let category = ev.target.id.split('-')[0];
      if (ev.target.checked) {
        this.preferences.set(category, 1);
      } else {
        this.preferences.set(category, 0);
      }
    });

    for (let i = 0; i < CATEGORIES.length; i++) {
      let category = CATEGORIES[i];
      let elId = category+'-toggle-button-input';
      let input = document.getElementById(elId);
      // toggle user exisiting preferences
      if (this.preferences.get(category) === 1) {
        input.checked = true;
      } else {
        input.checked = false;
      }
    }

    return this.pref;
  }

  /**
   * save preferences
   *  1. Save to cookie
   *  2. send to Google Analytics
   */
  save() {
    const prefs = this.convertToBitMap().toString();
    gtag('set', 'prefs', this.checkPrefChanged() ? prefs : 'null');
    let days = 60 * 60 * 24 * 30; // 30 days
    document.cookie = this.cookieName + "=" + prefs + ";max-age=" + days;

    // custom event to retoggle sections
    document.dispatchEvent(this.ev);
  }

  /**
   * convert preferences to bitMap
   */
  convertToBitMap() {
    let bitMap = [];
    for (let i = 0; i < CATEGORIES.length; i++) {
      bitMap.push(this.preferences.get(CATEGORIES[i]));
    }
    return bitMap;
  }

  /**
   * convert bitMap to preferences
   */
  extractBitMap(bitMap) {
    let bits = bitMap.split(",");
    let preferences = [];
    for (let i = 0; i < CATEGORIES.length; i++) {
      if (bits[i] === "1") {
        preferences[i] = CATEGORIES[i];
      } else {
        preferences[i] = "noop";
      }
    }
    return preferences;
  }

  /**
   * returns preferences as a bitmap
   */
  getPreferences() {
    const prefs = this.convertToBitMap().toString();
    return this.extractBitMap(prefs);
  }

  /**
   * check if user made any changes to their preferences
   */
  checkPrefChanged() {
    for (let [k,v] of this.preferences) {
      let value = this.temp.get(k);

      if (v !== value) {
         return true;
      }
    }
    return false;
  }

  show() {
    this.pref.classList.add('open-right');
    this.body.style.overflow = "hidden";
    this.temp = new Map(this.preferences);

    showOverlay();
  }

  hide() {
    this.pref.classList.remove('open-right');
    this.body.style.overflow = "initial";

    hideOverlay();
  }

}