/**
 * This JavaScript snippet is used only for push messages and
 * quick access.
 * Main purpose of this is to load the news article asap if
 * its the first page load. Otherwise, there's a short instance
 * where the user sees the HTML render and then the actual
 * news article. Compressed with Gulp and added into HTML by
 * htmlgenerator.py.
 */
(function(){
  let newsSection = document.getElementById("news-section");
  let backButton = document.getElementById("article-back-button");
  const origin = window.location.origin;
  // get url params
  let currentState = location.search.substr(1);
  function cleanUrl(url, param) {
    let head = url.search(param);
    if (head === -1) {
      return url;
    }
    let tail = head + 4;
    while ( tail < url.length && url[tail] !== "&") {
      tail++;
    }
    let news = "?" + url.substr(0,head) + url.substr(tail);
    return decodeURIComponent(news);
  }
  let result = {};
  currentState.split("&").forEach((key) => {
    let value = key.split("=");
    result[value[0]] = decodeURIComponent(value[1]);
  });
  if (result.news) {
    newsSection.classList.add('hide');
    let news = cleanUrl(currentState, "&ui=");
    if(result.ui) {
      history.replaceState({}, "", origin);
      history.pushState({}, "", origin + news);
    }
    if(result.s_qa) {
      gtag("set", { "qaid": "uhp_qa_article_redirected"});
      document.getElementById("header").classList.add('hide');
      document.getElementById("menu").classList.add('hide');
    }
    if (!document.getElementById("frame")) {
      let iframe = document.createElement("iframe");
      iframe.frameBorder = 0;
      news = cleanUrl(news, "&s_qa").replace("?news=", "").replace("news=", "");
      iframe.src = news;
      iframe.id = "frame";
      if (result.s_qa) {
        iframe.style.marginTop = "0px";
        iframe.style.marginLeft = "0px";
        let metaThemeColor = document.querySelector("meta[name=theme-color]");
        metaThemeColor.setAttribute("content", "#fff");
      }
      window.addEventListener('message', (msg) => {
        if (msg.data.type == 'page_scroll_height_change') {
          iframe.style.height = msg.data.value + 'px';
        }
      });
      document.getElementsByTagName("body")[0].appendChild(iframe);
    }
  }

  if(result.ui) {
    let days = 604800; // 7 days
    document.cookie = "ui=" + result.ui + ";max-age=" + days;
    document.cookie = "pushClicked=true;max-age=" + days * 4;
    gtag("set", { "ui": result.ui});
  } else {
    gtag("set", { "ui": "null"});
  }
})();