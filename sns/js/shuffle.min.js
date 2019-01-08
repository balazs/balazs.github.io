(function(){
  let distribution = {
    "1": [0.0, 0.1],
    "2": [0.11, 0.3],
    "3": [0.31, 0.7],
    "4": [0.71, 0.9],
    "5": [0.9, 1.0]
  }
  let percentages = {
    "1": 0.1,
    "2": 0.2,
    "3": 0.4,
    "4": 0.2,
    "5": 0.1
  }

  /**
   *  shuffle order of news randomly in a category
   */
  function shuffleNews(category) {
    if (location.search.indexOf('noshuffle=1') > 0) return;

    let categorySection = document.getElementById(category + "-news-cards");
    let children = categorySection.childNodes;
    let len = children.length;
    let cards = []
    // get all news articles
    for (let i = 0; i < len; i++) {
      if (children[i].className === "card") {
        cards.push(children[i]);
      }
    }
    let originalOrder = (getFromCookie("order"));
    let newOrder;
    // construct new order of the cards
    if (originalOrder) {
      newOrder = restoreOrder(cards, originalOrder);
    }
    if (!newOrder){
      newOrder = shuffle(cards);
      originalOrder = false;
    }
    // detach old news and attach new news
    while (categorySection.firstChild) {
      categorySection.removeChild(categorySection.firstChild);
    }
    len = newOrder.length;
    let order = "";
    for (let j = 0; j < len; j++) {
      let newsCard = newOrder[j];
      if ( newsCard) {
        categorySection.appendChild(newsCard);
        let anchor = newsCard.children[0];
        let link = getNewsId(anchor.href);
        order += (link + ",");
      }
    }
    if (!originalOrder) document.cookie = "order=" + order + ";max-age=3600";
    gtag('set', { 'order': order });
  }

  /**
   * scale distrubtion if # of news is less than distribution size
   * and when an object is chosen
   */
  function scaleDistribution(remove) {
    //let newDistribution = {}
    let len = Object.keys(distribution).length;
    if (!remove) {
      // recalculate distribution up to the length
      let sum = 0.0;
      for (key in percentages) {
        sum += percentages[key];
      }
      const diff = 1.0 - sum;
      let split = parseFloat(diff / len);
      for (key in percentages) {
        let value = percentages[key];
        percentages[key] = value + split;
      }
    } else {
      // delete the key value and recalculate based on remainders
      let value = distribution[remove];
      let percentage = percentages[remove];
      delete distribution[remove];
      delete percentages[remove];
      len -= 1;
      let split = parseFloat(percentage / len);
      // update the new percentages
      for (key in percentages) {
        let newPercentage = percentages[key] + split;
        percentages[key] = newPercentage;
      }
      let count = -0.01;
      for (let key in distribution) {
        let lower = count + 0.01;
        count += percentages[key];
        distribution[key] = [lower, count];
      }
    }
  }
  function getMax(){
    let max = 0.0;
    for (key in distribution) {
      let upper = distribution[key][1];
      if (upper > max) max = upper;
    }
    return parseFloat(max);
  }

  /**
   * Given a distribution, return the object
   */
  function choose() {
    let max = getMax();
    let random = (Math.random() * parseFloat(max));
    for(let key in distribution) {
      let range = distribution[key];
      if (random >= parseFloat(range[0]) && random <= parseFloat(range[1])) {
        return parseInt(key);
      }
    }
  }

  /**
   * psuedo random shuffling based on a distribution
   */
  function shuffle(cards) {
    let newOrder = [];
    let len = cards.length;
    let shuffleLen = 5;
    if (len < 5) shuffleLen = len;
    if (Object.keys(distribution).length > len) {
      while(Object.keys(distribution).length > len) {
        // remove last
        let last = Object.keys(distribution).length;
        delete distribution[last];
        delete percentages[last];
      }
    }
    scaleDistribution(false);
    let i = 1;
    for (; i < shuffleLen; i++) {
      let chosen = choose();
      newOrder.push(cards[chosen - 1]);
      scaleDistribution(chosen);
    }
    for (key in distribution) {
      newOrder.push(cards[parseInt(key) - 1]);
    }
    if ( len > shuffleLen) {
      return newOrder.concat(cards.slice(i, len));
    }
    return newOrder;
  }

  /**
   * Fisher-Yates (aka Knuth) Shuffle.
   */
  /*
  function shuffle(array) {

    let current = array.length, temp, random;

    // While there remain elements to shuffle...
    while (0 !== current) {

      // Pick a remaining element...
      random = Math.floor(Math.random() * current);
      current -= 1;

      // And swap it with the current element.
      temp = array[current];
      array[current] = array[random];
      array[random] = temp;
    }

    return array;
  }
  */
  /**
   * restore original ordering of news from cookie
   */
  function restoreOrder(cards, originalOrder) {
    if (originalOrder) {
      originalOrder = originalOrder.split(",");
    } else {
      return false;
    }
    let order = [];
    let cardsLen = cards.length;
    let originalOrderLen = originalOrder.length - 1;
    if (cardsLen !== originalOrderLen) {
      return false;
    }
    let newsMap = {};
    // create map of article and news cards
    for (let i = 0; i < cardsLen; i++) {
      let link = getNewsId((cards[i].children[0]).href);
      newsMap[link] = cards[i];
    }
    // recreate the original order
    for (let j = 0; j < originalOrderLen; j++) {
      let key = originalOrder[j];
      if (newsMap.hasOwnProperty(key)) {
        order.push(newsMap[key]);
      } else {
        // Page was updated and does not have the same old news
        return false;
      }
    }
    return order;
  }

  /**
   * get values from cookie
   */
  function getFromCookie(field) {
    let cookie = document.cookie;
    if (cookie) {
      let values = cookie.split(";");
      for (let i = 0; i < values.length; i++) {
        if (values[i].indexOf(field) >= 0) {
          let item = ((values[i].split("="))[1]);
          return item;
        }
      }
    }
  }

  function getNewsId(link) {
    return (link.split("/"))[3];
  }
  shuffleNews("top");
})();