/**
 * This class controls the menu for each catgory
 *
 */
class uiMenu {
  constructor(menu, open, close, newsSection) {
    this.menu = menu;
    this.open = open;
    this.close = close;
    this.newsSection = newsSection;
    this.body = document.getElementsByTagName("body")[0];

    this.open.addEventListener('click', this.openMenu.bind(this));
    this.close.addEventListener('click', this.closeMenu.bind(this));

    document.addEventListener('close-menu', function(ev){
      this.closeMenu();
    }.bind(this));
  }

  openMenu() {
    this.menu.classList.add('open');
    this.position = window.pageYOffset;
    //this.newsSection.style.position = "fixed";
    this.body.style.overflow = "hidden";

    showOverlay();
  }

  closeMenu() {
    this.menu.classList.remove('open');
    //this.newsSection.style.position = "";
    this.body.style.overflow = "initial";
    // window.scrollTo(0, this.position);

    hideOverlay();
  }
}