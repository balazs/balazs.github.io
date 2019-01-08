/**
 * This class controls the article page that user clicks on.
 * This class does not create view from push message
 *
 */
class Article {
  constructor(body) {
    this.body = body;
    this.iframe = document.createElement("iframe");
    this.iframe.id = "frame";
    this.iframe.frameBorder = 0;
  }

  /**
   * Only used during initial page loads or refreshes.
   * Renders the article if user reloads the page or
   * a cold navigate to article.
   */
  load() {
    let urlState = getUrlState();
    let news;
    try {
      // reconstruct news url, because it gets broken up
      // when deconstructing parameters
      news = urlState.news;
      news += "=samsung_i18n&";
      news += ("token=" + encodeURIComponent(urlState.token) + "&")
      news += ("impr_id=" + encodeURIComponent(urlState.impr_id) + "&");
      news += ("channel_id=" + encodeURIComponent(urlState.channel_id) + "&");
      news += ("lang=" + encodeURIComponent(urlState.lang) + "&");
      news += ("region=" + encodeURIComponent(urlState.region) + "&");
      news += ("recommend_time=" + encodeURIComponent(urlState.recommend_time) + "&");
      news += ("content_space=" + encodeURIComponent(urlState.content_space) + "&");
      news += ("no_personal=" + encodeURIComponent(urlState.no_personal));
    } catch(e) {}
    if (news) {
      this.show(news, "" ,false);
    }
  }

  /**
   * This shows the article
   */
  show(url, category, changeHistory) {
    if (changeHistory) {
      let newUrl = location.origin + "?news=" + url + "&cat=" + encodeURIComponent(category);
      history.pushState({}, "", newUrl);
    }
    this.iframe.src = url;
    let frame = document.getElementById("frame");
    if (!frame) {
      this.body.appendChild(this.iframe);
      this.body.style.height = '100%';
    }
  }

  /**
   * This removes the news from view. Iframe is removed from body,
   * because it interferes with the history API if the src is changed.
   */
   hide() {
    try {
      document.getElementById("frame").remove();
      document.getElementsByTagName("body")[0].style.height = '100%';
    } catch(e){}
   }
}