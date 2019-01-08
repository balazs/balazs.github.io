var CategoriesSettings = function () {
    this.name = "categories_setting";
    this.state = "singleCP_no1";
    this.MAX_ITEMS = 12;
    this.init();
    this.saved = false;
    this.previousSettings = {};
    this.changed = false;
};

CategoriesSettings.prototype.init = function() {
    //console.log("SingleCP: CategoriesSettings, init()");

    this.element = document.createElement("div");
    this.element.style.display = 'none';
    this.myCategories = document.createElement("div");
    this.originalCategories = document.createElement("div");

    this.element.setAttribute('id','categories_settings');
    this.myCategories.className = 'my-categories';
    this.originalCategories.className = 'recommended-categories';
    this.title = document.createElement("div");
    this.title.className = "my-categories-title";
    this.title.setAttribute('tabindex', '-1');
    this.back = document.createElement('div');
    this.back.className = "categories_back";
    this.back.innerHTML = "<img class='categories_back_button' src='img/qa/internet_ic_back.png'>";
    this.myCategoriesTitle = document.createElement("div");
    this.myCategoriesTitle.className = "categories-sub-header";
    this.myCategoriesTitle.innerHTML = '<p><span>CATEGORIES</span></p>';

    var titleheading = document.createElement('div');
    titleheading.className = "categories-title";
    titleheading.innerHTML = "CONTENT SETTINGS";
    this.addCategorySettings = document.createElement('div');
    this.addCategorySettings.setAttribute('id','addcategory-settings');
    this.addCategorySettings.className = "addcategory-settings";
    this.addCategorySettings.innerHTML = '<div class="add-icon-settings-p"><img class="add-icon-settings" src="img/qa/internet_multi_cp_settings_ic_edit_category.png"></div> <div class="add-icon-settings-text">Edit category</div>';
    this.title.appendChild(this.back);
    this.title.appendChild(titleheading);
    this.element.appendChild(this.title);
    var disableElement = document.createElement('div');
    disableElement.setAttribute('id', 'disable-news-btn');
    var disableButton = '<p><a href="intent://homepageaction/#Intent;scheme=internet;package=com.sec.android.app.sbrowser.edge;end">Disable News Feed</a></p>';
    disableElement.innerHTML = disableButton;
    this.element.appendChild(disableElement);
    this.myCategories.appendChild(this.myCategoriesTitle);
    this.myCategories.appendChild(this.addCategorySettings);
    this.element.appendChild(this.myCategories);
    this.recomended = document.createElement("div");
    this.recomended.setAttribute('id','categories_settings_all');
    this.recomended.style.display = 'none';

    this.categoryheading = document.createElement('div');
    this.categoryheading.className = "categories_settings_all_heading";
    var categoryheading1 = document.createElement('div');
    categoryheading1.className = "c_s_a_h_heading1";
    categoryheading1.innerHTML = "SELECT CATEGORY";
    this.categoryheading2 = document.createElement('div');
    this.categoryheading2.setAttribute('id','categories_settings_all_done');
    this.categoryheading2.className = "c_s_a_h_heading2";
    this.categoryheading2.innerHTML = "DONE";
    this.categoryheading.appendChild(categoryheading1);
    this.categoryheading.appendChild(this.categoryheading2);

    this.categoryselection = document.createElement('div');
    this.categoryselection.className = "categories_settings_topics_heading";
    var topics = document.createElement('div');
    topics.setAttribute('id','categories_settings_topics');
    topics.className = "c_s_a_h_topics";
    topics.innerHTML = "TOPICS";
    var location = document.createElement('div');
    this.categoryselection.appendChild(topics);
    this.categoryselection.appendChild(location);
    // this.categoryselection.appendChild(this.locationsList);

    this.recomended.appendChild(this.categoryheading);
    this.recomended.appendChild(this.categoryselection);
    this.contentContainer = document.createElement('div');
    this.contentContainer.className = 'categories_settings_topics_content';
    this.contentContainer.appendChild(this.originalCategories);
    this.recomended.appendChild(this.contentContainer);

    this.element.appendChild(this.recomended);

    document.body.appendChild(this.element);

    this.myCategoriesUL = document.createElement("ul");
    this.myCategoriesUL.className = "my-category-ul";
    this.myCategoriesUL.setAttribute('tabindex', '-1');
    this.myCategories.appendChild(this.myCategoriesUL);

    this.recommentedListUL = document.createElement("div");
    this.recommentedListUL.className = "categories-list";
    this.originalCategories.appendChild(this.recommentedListUL);
    this.addEventListeners();

    this.refreshMyCategories();
    this.refreshRecommendedList();
};

var backKeyExit = function(event) {
    //categoriesSettings.exit();
    history.back();
};

CategoriesSettings.prototype.addEventListeners = function() {
    this.addCategorySettings.addEventListener('click', addCategoriesPage);
    this.back.addEventListener('click', backKeyExit);
}
var addCategoriesPage = function(event){
    categoriesSettingsAll.show();
}
var changeLanguagesPage = function(event){
    languagesSettingsAll.show();
}

CategoriesSettings.prototype.addClickEventsOnRecommendList = function() {
    var categoriesItems = this.originalCategories.querySelectorAll('.category-item');
    var self = this;
    var clickOnRecommendedItem = function(event) {
        if (event.type === 'keydown' && event.keyCode != 13 && event.keyCode != 32) {
            return;
        }
        //console.log("SingleCP: clicked on category-item "+event.target.id);
        event.currentTarget.blur();
        var input = event.target.getElementsByTagName('input')[0] || event.target.parentNode.getElementsByTagName('input')[0];
        var label = event.target.getElementsByTagName('label')[0] || event.target.parentNode.getElementsByTagName('label')[0];
        var className = event.target.classList[0];
        if(className == "item_checkbox_deselect"  || className == "item_checkbox_select") className = event.target.parentElement.id;
        position = className.substring(5, className.length);
        if (position == 0) return;
        if(!input.checked){
            //checked
            label.className = "item_checkbox_select";
            label.parentNode.classList.remove('unselected-category');
            label.parentNode.className += ' selected-category';
            userCategories[input.id]['selected'] = true;
            input.checked = true;
        } else {
            //unchecked
            label.className = "item_checkbox_deselect";
            label.parentNode.classList.remove('selected-category');
            label.parentNode.className += ' unselected-category';
            userCategories[input.id]['selected'] = false;
            input.checked = false;
        }
    };
    var OnClickOnDoneSelectCat = function(ev) {
        if (ev.type === "keydown" && ev.keyCode != 13 && ev.keyCode != 32) {
            return;
        }
        if (self.recomended.style.display === 'none') return;
        ev.currentTarget.blur();
        self.recomended.style.display = 'none';
        self.saveCategories();

        self.refreshMyCategories();
        //self.show(false, true);
        self.saved = true;
        maincategories.refresh();
        history.back();
        self.saved = false;
        localStorage.setItem('done_categories_setting', true);
        //logging.clickEvent('Button', 'Done');
    };

    this.categoryheading2.addEventListener('click', OnClickOnDoneSelectCat);
    for (var i = 0; i < categoriesItems.length; i++) {
        categoriesItems[i].removeEventListener('click', clickOnRecommendedItem);
        categoriesItems[i].addEventListener('click', clickOnRecommendedItem);
        categoriesItems[i].removeEventListener('keydown', clickOnRecommendedItem);
        categoriesItems[i].addEventListener('keydown', clickOnRecommendedItem);
    }
};

CategoriesSettings.prototype.saveCategories = function() {
    localStorage.setItem('recommended_categories', JSON.stringify(originalCategories));
    localStorage.setItem('my_categories', JSON.stringify(userCategories));
};

CategoriesSettings.prototype.refreshMyCategories = function() {
    this.myCategoriesUL.innerHTML = "";
    this.myCategoriesHashMap = {};
    for (var i = 0; i < allCategories.length; i++) {
        let category = userCategories[allCategories[i]];
        if(category['selected']){
            if (i == 0) {
                this.myCategoriesUL.innerHTML += "<li class='categories-margin-left-bottom fix-category' id='myitem_"+i+"' title='" + category.id + "' tabindex='-1'>" +
                "<div class='item-text'>" + category.title + "</div>"+
                "</li>"
            } else {
                this.myCategoriesUL.innerHTML += "<li class='categories-margin-left-bottom my-category' id='myitem_"+i+"' title='" + category.id + "' tabindex='0'>" +
                "<div class='item-text'>" + category.title + "</div>"+
                "</li>"
            }
            this.myCategoriesHashMap[category.title] = true;
        }
    }
    this.onResize();
};

CategoriesSettings.prototype.refreshRecommendedList = function() {
    if(!userCategories['top']) return;
    this.originalMap = JSON.parse(JSON.stringify(this.myCategoriesHashMap));
    this.recommentedListUL.innerHTML = "";
    var tabindexValue = "0";
    for (var i = 0; i < allCategories.length; i++) {
        var classLists = "category-item categories-margin-left-bottom";
        var select = userCategories[allCategories[i]]['selected'];
        if(select){
            classLists += " selected-category";
            tabindexValue = "0";
            this.recommentedListUL.innerHTML += "<div id='item_"+i+"' class='item_" + i + " " + classLists + "' tabindex='0'>"
            + "<label class='item_checkbox_select' for='" + originalCategories[i].title + "'></label>"
            + "<label for='" + originalCategories[i].title + "' class='item_" + i + " all-category-title'>" + originalCategories[i].title + "</label>"
            + "<input checked type=checkbox id='" + originalCategories[i].category + "' class='hidden'>"
            + "</div>";
        } else {
            classLists += " unselected-category";
            tabindexValue = "0";
            this.recommentedListUL.innerHTML += "<div id='item_"+i+"' class='item_" + i + " " + classLists + "' tabindex='0'>"
            + "<label class='item_checkbox_deselect' for='" + originalCategories[i].title + "'></label>"
            + "<label for='" + originalCategories[i].title + "' class='item_" + i + " all-category-title'>" + originalCategories[i].title + "</label>"
            + "<input type=checkbox id='" + originalCategories[i].category+ "' class='hidden'>"
            + "</div>";
        }
    }
    this.addClickEventsOnRecommendList();
};

CategoriesSettings.prototype.show = function(display, needGenerateContent) {
    //console.log("SingleCP: categories settings show");
    if (display) {
        this.element.style.display = "flex";
        controller.addScreen(categoriesSettings);
        setTimeout(function(){
            categoriesSettings.onResize();
        }, 100);
        this.originalCategories.scrollTop = 0;
        document.getElementsByClassName("my-categories-title")[0].focus();
    } else {
        mainElement.style.display = "block";
        this.element.style.display = "none";
        // if (needGenerateContent) {
        //     maincategories.refresh();
        // }
        maincategories.hideInactiveTabs();
    }
};

CategoriesSettings.prototype.exit = function() {
    if (this.element.style.display === 'none') return;
    this.recomended.style.display = 'none';
    if (userCategories['top']) {
        this.refreshMyCategories();
        this.refreshRecommendedList();
        if (this.changed) {
            maincategories.appendContent(userCategories);
            this.changed = false;
        }
    }
    localStorage.setItem('done_categories_setting', true);
    //logging.clickEvent('Button', 'Done');
    this.show(false, true);
};

CategoriesSettings.prototype.onResize = function() {
    let fixedCategory = document.getElementsByClassName('fix-category')[0];
    let documentHeight = document.body.clientHeight;
    if (fixedCategory)
        this.myCategories.style.height = documentHeight - fixedCategory.offsetHeight + 'px';
    this.originalCategories.style.height = documentHeight - 48 + 'px';
    this.contentContainer.style.height = documentHeight + 'px';
};
