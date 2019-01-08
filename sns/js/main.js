(function() {
  let heroCard = document.querySelector('.news-cards-sections.hero > div:first-child a');
  let imgSrc = heroCard.querySelector('.card-img-top').getAttribute('src');
  imgSrc = imgSrc.replace(/list\/((\d+)x+(\d+)\/)?/,'large/');
  let heroImgEl = document.createElement('img');
  heroImgEl.setAttribute('src', imgSrc);
  heroImgEl.classList.add('hero-img');
  heroCard.insertAdjacentElement('afterbegin', heroImgEl);
  detectMobile();

  let existingPreferences;
  let preferences;
  if (cookiesEnabled && isMobile) {
    let pushClicked = getFromCookie("pushClicked");
    if (pushClicked) {
      document.cookie = "pushClicked=true;max-age=" + 604800 * 4;
    }
    let cookiePrefs = getFromCookie("preferences");
    preferences = new Preferences(cookiePrefs, body, newsSection);
    if(cookiePrefs) {
      existingPreferences = preferences.extractBitMap(cookiePrefs);
      // overwrite cookie to keep it fresh
      document.cookie = "preferences=" + cookiePrefs + ";max-age=2592000";
    }
  } else {
    gtag('set', 'prefs', 'unsupported');
  }
  let article = new Article(body);
  let webpage = new Webpage(article, backButton, menuButton, footer, newsSection, existingPreferences, cookiesEnabled, preferences, isMobile);
  // initilize some window events
  window.onpopstate = function() {
    webpage.showFromUrl(false);
    try {
      let y = position.pop();
      window.scrollTo(0, y);
    } catch (e) {}
  }
  let previousPos = window.pageYOffset;
  // initilize menu
  let categoryMenu = document.getElementById("menu");
  let openMenu = document.getElementById("menu-button");
  let closeMenu = document.getElementById("close-menu");
  let settings = document.getElementById("settings");

  window.addEventListener("message", (msg) => {
    if (msg.data.type === "page_url_change") {
      let url = "/?news=" + msg.data.value;
      if (getUrlState().s_qa) {
        location.href = url + "&s_qa";
      } else {
        location.href = url;
      }
    }
  });

  window.addEventListener('message', (msg) => {
    if (msg.data.type == 'go_back') {
      window.history.back();
    }
  });

  if (isMobile) {

    let scrolled = false;
    let prevScroll = 0;
    let scrollDelta = 10;
    let navbarHeight = 50; // header
    let iframeScrollY = 0;

    window.addEventListener('scroll', (e) => {
      scrolled = true;
    });

    window.addEventListener('message', (msg) => {
      if (msg.data.type == 'scrollY') {
        iframeScrollY = msg.data.value;
        if (Number.isInteger(iframeScrollY)) {
          scrolled = true;
        }
      }
    });

    let scrollHandler = () => {
      let currScroll = 0;
      if (iframeScrollY) {
        currScroll = iframeScrollY;
      }
      else {
        currScroll = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
      }

      if (Math.abs(prevScroll - currScroll) <= scrollDelta)
        return;

      if (currScroll > prevScroll && currScroll > navbarHeight) {
        header.classList.add('up');
      } else {
        header.classList.remove('up');
      }

      iframeScrollY = 0;
      prevScroll = currScroll;
    };

    setInterval((t) => {
      if (scrolled) {
        scrollHandler();
        scrolled = false;
      }
    }, 1000/4);


    let menu = new uiMenu(categoryMenu, openMenu, closeMenu, newsSection);

    if (cookiesEnabled) {
      document.addEventListener("newPreferences", (e) => {
        let prefs = preferences.getPreferences();
        webpage.updatePreferences(prefs);
        webpage.showFromUrl(true);
      }, false);
    }
  }

  if (cookiesEnabled && preferences) {
    settings.addEventListener('click', () => {
      preferences.show();
    });
  } else {
    settings.classList.add('hidden');
  }

  enableMenu();

  // more buttons
  newsSection.addEventListener('click', function(ev) {
    if (ev.target && ev.target.matches('.more-button')) {
      let category = ev.target.dataset.category;

      let cards = document.querySelectorAll('#'+category+'-news-cards .card.hide');

      const NUM_TO_ADD = 5;
      for (let i = 0; i < cards.length && i < NUM_TO_ADD; i++) {
        var card = cards[i];
        card.classList.remove('hide');
      }

      if (cards.length - NUM_TO_ADD <= 0) {
        ev.target.classList.add('hide');
      }

      let data = {
        "category": category,
        "ui": ui
      }
      post(data);
    }
  }, false);

  // card link behavior
  newsSection.addEventListener('click', (ev) => {
    for (let i = 0; i < ev.path.length; i++) {
      let node = ev.path[i];
      if (node.nodeName === 'A') {
        ev.preventDefault();
        let url = node.href;
        let category = node.parentNode.dataset.category;
        let title = node.querySelector('.card-title');
        document.title = title.innerHTML + ' · News from Samsung';

        position.push(window.pageYOffset);
        webpage.news(url, category, true);
        gtag('event', 'page_view', {
          'page_path': url,
          'timestamp': new Date().getTime(),
          'category': category
        });
        let data = {
          "url" : url,
          "ui" : ui
        }
        post(data);
        break;
      }
    }

    ev.stopPropagation();
  }, false);

  webpage.showFromUrl(true);

  backButton.addEventListener("click", (ev) => {
    window.history.back();
    footer.classList.remove('hide');
  });

  let newsDates = document.getElementsByClassName("card-date");
  const shortUnit = true;
  for (let i =0, len = newsDates.length; i < len; i++) {
    let time = newsDates[i].dataset.time;
    let timeAgo = timeSince(time * 1000);
    if (shortUnit) {
      let parts = timeAgo.split(' ');
      let t = parts[0];
      let unit = parts[1];
      timeAgo = t+unit.substring(0,1);
    }
    newsDates[i].innerHTML = timeAgo + " ago";
  }

  gtag('event', 'page_view', {
    'page_path': '/' + window.location.search,
    'timestamp': new Date().getTime(),
    'category': 'top'
  });

  function enableMenu() {
    let closeMenu = document.getElementById('close-menu');

    menu.addEventListener('click', (ev) => {
      if (!(ev.target && ev.target.matches('[data-category]'))) {
        return;
      }
      let category = ev.target.dataset.category;
      position.push(window.pageYOffset);
      pushHistory(category);
      webpage.category(category);
      if (isMobile) {
        closeMenu.click();
      }
      window.scrollTo(0,0);
      let data = {
        "category" : category,
        "ui" : ui
      }
      post(data);
      backButton.classList.remove('hide');
      menuButton.classList.add('hide');
    });
  }
  if ("serviceWorker" in navigator) {
    // navigator.serviceWorker
    //     .register('/service-worker.js')
    //     .then(function(sw) {
    //         console.log('Service Worker Registered');
    //     }).catch(function(error) {
    //       console.warn("Service Worker failed to register: " + error );
    //     });
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
      for(let registration of registrations) {
        registration.unregister()
      }
    });
  }
})();
