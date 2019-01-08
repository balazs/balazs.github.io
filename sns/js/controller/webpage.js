/**
 * Controls states of webpage:
 *   - home page
 *   - category page
 *   - article page
 */
class Webpage {
  constructor(article, backButton, menuButton, footer, newsSection,existingPreferences, cookiesEnabled, preferences, isMobile) {
    this.article = article;
    this.backButton = backButton;
    this.menuButton = menuButton;
    this.footer = footer;
    this.newsSection = newsSection;
    this.existingPreferences = existingPreferences;
    this.cookiesEnabled = cookiesEnabled;
    this.preferences = preferences;
    this.isMobile = isMobile;
  }

  showFromUrl(resetCards = false) {
    let url = getUrlState();
    let category = url.s_category;

    if (category) {
      this.category(category);
    } else if (url.news) {
      this.article.load();
      this.showNewsLayout();
    } else {
      this.home(resetCards);
      if (url.s_id) {
        gtag("set", { "qaid": url.s_id});
        history.replaceState({}, "", window.location.origin);
      } else {
        gtag("set", { "qaid": "null"});
      }
    }

    if (category || url.news) {
      //header.classList.add('solid');
    }
  }

  showNewsSection() {
    var opacity = this.newsSection.style.opacity;
    if (opacity) {
      function op() {
        opacity = parseFloat(opacity);
        if (opacity < 1.0) {
          opacity += parseFloat(0.1);
          setTimeout( ()=> {op()}, 35);
        }
        newsSection.style.opacity = opacity;
      }
      op();
    }
    this.newsSection.classList.remove('hide');
    this.footer.classList.remove('hide');
  }

  hideNewsSection() {
    this.newsSection.classList.add('hide');
  }

  /**
   * Shows home page
   */
  home(resetCards = true) {
    if (!resetCards) {
      console.log('dont reset');
    }

    let sections = document.getElementsByClassName("category-section");
    for (let i = 0, len = sections.length; i < len; i++) {
      sections[i].classList.remove('selected');
      sections[i].classList.remove('hide');
    }

    if (resetCards) {
      const NUM_CARDS_PER_CATEGORY = 5;
      let cards = document.getElementsByClassName("card");
      this.category("All");

      let sections = document.getElementsByClassName("category-section");
      for (let i = 0, len = sections.length; i < len; i++) {
        let cards = sections[i].getElementsByClassName("card");

        for (let i = 0, len = cards.length; i < len; i++) {
          if (i < NUM_CARDS_PER_CATEGORY) {
            cards[i].classList.remove('hide');
          } else {
            cards[i].classList.add('hide');
          }
        }
      }

      let moreButtons = document.getElementsByClassName("more-button");
      for (let i = 0, len = moreButtons.length; i < len; i++) {
        moreButtons[i].classList.remove('hide');
      }
    }

    backButton.classList.add('hide');
    menuButton.classList.remove('hide');

    this.article.hide();
    this.showNewsSection();
    if (this.cookiesEnabled && !this.existingPreferences && this.isMobile) {
      this.preferences.show();
    }
    this.showPreferences();
    //this.prioritizePreferences();
    document.title = 'News from Samsung';
  }

  /**
   * Shows all news in the category
   */
  category(category, hideOthers) {
    hideOthers = (typeof hideOthers !== 'undefined') ? hideOthers : true;

    if (!(getUrlState()).news) {
      this.article.hide();
    }
    let sections = document.getElementsByClassName("category-section");
    for (let i = 0, len = sections.length; i < len; i++) {
      sections[i].classList.remove('hide');
      sections[i].classList.remove('selected');

      if (sections[i].id !== category+"-section" && category !== "All" && hideOthers) {
        sections[i].classList.add('hide');
      }

      if (sections[i].id === category+'-section') {
        sections[i].classList.add('selected');
      }
    }

    let moreButton = document.querySelector('.more-'+category+'-button');
    moreButton && moreButton.classList.add('hide');

    this.article.hide();
    this.showNewsSection();
    document.title = (category.charAt(0).toUpperCase() + category.slice(1)) + ' · News from Samsung';
  }

  /**
   * display news article
   */
  news(url, category, changeHistory) {
    this.article.show(url, category, changeHistory);
    this.showNewsLayout();
  }

  /**
   * hide/show elements related to news ui
   */
  showNewsLayout() {
    this.footer.classList.add('hide');
    this.menuButton.classList.add('hide');
    this.backButton.classList.remove('hide');
    this.hideNewsSection();
  }

  /**
   * Show only preferences.
   */
  showPreferences() {
    if (this.existingPreferences) {
      let sections = document.getElementsByClassName("category-section");
      for (let i = 0; i < sections.length; i++) {
        let category = sections[i].id.replace("-section", "");
        if (!this.existingPreferences.includes(category)) {
          sections[i].classList.add('hide');
        }
      }
      // always show
      document.getElementById("top-section").classList.remove('hide');
    }
  }

  /**
   * displays news in order of preferences first, then everything else
   */
  prioritizePreferences() {
    let first = [];
    let last = [];
    let sections = document.getElementsByClassName("category-section");
    for(let i = 0; i < sections.length; i++) {
      let category = sections[i].id.replace("-section", "");
      if(category === "top"){
        first.push(sections[i]);
      } else {
        if(this.existingPreferences.includes(category)) {
          first.push(sections[i]);
        } else {
          last.push(sections[i]);
        }
      }
    }
    while(this.newsSection.firstChild) {
      this.newsSection.removeChild(this.newsSection.firstChild);
    }
    for(let j = 0; j < first.length; j++) {
      this.newsSection.appendChild(first[j]);
    }
    for(let k = 0; k < last.length; k++) {
      this.newsSection.appendChild(last[k]);
    }
  }

  /**
   * updates user's new preferences
   */
  updatePreferences(newPreferences) {
    this.existingPreferences = newPreferences;
  }

}