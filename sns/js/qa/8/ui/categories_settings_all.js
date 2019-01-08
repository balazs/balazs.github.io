var CategoriesSettingsAll = function () {
    this.name = "categories_Settings_All";
    this.state = "singleCP_no4";
};

CategoriesSettingsAll.prototype.onResize = function() {
    //console.log("SingleCP: CategoriesSettingsAll:: onResize()");
};

CategoriesSettingsAll.prototype.show = function() {
    //console.log("SingleCP: CategoriesSettingsAll:: show()");
    this.categoriesSettingsAll = document.getElementById('categories_settings_all');
    this.categoriesSettingsTopics = document.getElementById('categories_settings_topics');
    this.categoriesSettingsAll.style.display = 'block';
    this.categoriesSettingsTopics.click();
    controller.addScreen(categoriesSettingsAll);
    categoriesSettings.previousSettings = JSON.parse(JSON.stringify(userCategories));
};

CategoriesSettingsAll.prototype.exit = function() {
    this.categoriesSettingsAll = document.getElementById("categories_settings_all");
    if (this.categoriesSettingsAll.style.display === 'none') return;
    this.categoriesSettingsAll.style.display = 'none';
    if (categoriesSettings.saved === false) {
        userCategories = JSON.parse(JSON.stringify(categoriesSettings.previousSettings));
        categoriesSettings.changed = false;
    } else {
        categoriesSettings.saved = false;
        categoriesSettings.changed = true;
    }
    categoriesSettings.refreshRecommendedList();
};