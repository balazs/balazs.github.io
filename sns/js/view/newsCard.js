/**
 * This file creates the news card view
 * ---------------
 * |    image    |
 * ---------------
 * |    title    |
 * ---------------
 * | other info  |
 * ---------------
 * | description |
 * ---------------
 *
 */
class newsCard {
  constructor(link, title, image, source, sourceImage, time,
              description, category, background) {
    this.link = link;
    this.title = title;
    this.image = image;
    this.source = source;
    this.time = time;
    this.description = description;
    this.category = category;
    this.background = background;
    this.sourceImage = sourceImage;
  }

  card() {
    let card = document.createElement("div");
    card.className = "card";
    card.dataset.category = this.category;
    //card.style.border = "solid 2px " + this.background;
    // link wraps around the entire card
    let cardLink = document.createElement("a");
    cardLink.href = this.link;
    cardLink.addEventListener("click", (e)=> {
      e.preventDefault();
      showFrame(this.link, true);
    }, false);
    // category
    let cardCategory = document.createElement("p");
    cardCategory.className = "card-category";
    //cardCategory.style.backgroundColor = this.background;
    let categoryNode = document.createTextNode(this.category);
    cardCategory.appendChild(categoryNode);
    // image
    let cardImage = document.createElement("img");
    cardImage.className = "card-img-top";
    cardImage.src = this.image;
    // where description, source, time and category goes
    let cardBody = document.createElement("div");
    cardBody.className = "card-body";
    cardBody.style.backgroundColor = this.background;
    let cardHeader = document.createElement("div");
    cardHeader.className = "card-header";
    //cardHeader.style.backgroundColor = this.background;
    // title
    let cardTitle = document.createElement("h5");
    cardTitle.className = "card-title";
    let titleNode = document.createTextNode(this.title);
    cardTitle.appendChild(titleNode);
    // description
    let cardDescription = document.createElement("p");
    cardDescription.className = "card-text";
    let descriptionNode = document.createTextNode(this.description);
    cardDescription.appendChild(descriptionNode);
    // publisher
    let publisherAvater = this.sourceImage; // TODO
    let cardPublisher = document.createElement("span");
    cardPublisher.className = "card-publisher";
    let publisherNode = document.createTextNode(this.source);
    cardPublisher.appendChild(publisherNode);
    // time
    let date = timeSince(new Date(this.time * 1000));
    let cardDate = document.createElement("span");
    cardDate.className = "card-date";
    let dateNode = document.createTextNode(" - " + date + " ago");
    cardDate.appendChild(dateNode);
    if (this.image)
      cardHeader.appendChild(cardImage);
    cardHeader.appendChild(cardTitle);
    //cardBody.appendChild(cardDescription);
    cardLink.appendChild(cardHeader);
    cardBody.appendChild(cardPublisher);
    cardBody.appendChild(cardDate);
    cardBody.appendChild(cardCategory);
    cardLink.appendChild(cardBody);
    card.appendChild(cardLink);
    return card;
  }
}