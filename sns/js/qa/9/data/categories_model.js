var JSONPCALLBACK = [];
var CategoriesModel = function(option) {
    this.currentCP;
    this.script = null;
    this.successCallback;
    this.init(option);
    this.dynamicCatList = [];
    this.dynamicCat = [];
    this.onChangeRequest();
};

CategoriesModel.prototype.onChangeRequest = function() {
    this.dynamicCatList = [];
    this.dynamicCat = [];
    this.dynamicLocationsList = [];
    dailyhuntApi.getChannelsLocation(this.locationsCb);
    dailyhuntApi.getChannels(this.reqSuccessCB);
};

CategoriesModel.prototype.locationsCb = function(result) {
    var rowData = result;
    for (var i = 0; i < rowData.length; ++i) {
        item = {};
        item["id"] = rowData[i].id;
        item["title"] = rowData[i].name;
        item["cp"] = "dailyhunt";
        item["contenturl"] = rowData[i].contentUrl;
        categoriesModel.dynamicLocationsList.push(item);
    }
    locationsList = categoriesModel.dynamicLocationsList;
    localStorage.setItem('recommended_locations', JSON.stringify(categoriesModel.dynamicLocationsList));
    categoriesSettings.refreshLocations();
};

CategoriesModel.prototype.reqSuccessCB = function (result){
    var rowData = result;

    if (rowData.length === 0) {
        document.getElementsByClassName("loading-failed-container")[0].style.display = 'block';
        document.getElementsByClassName("main-categories-container")[0].style.display = 'none';
        document.getElementsByClassName("main-categories-tab")[0].style.display = 'none';
        return;
    } else {
        document.getElementsByClassName("loading-failed-container")[0].style.display = 'none';
        document.getElementsByClassName("main-categories-container")[0].style.display = 'block';
        document.getElementsByClassName("main-categories-tab")[0].style.display = 'block';
    }

    var launch_count = localStorage.getItem("launch_count");
    var historyCategories = JSON.parse(localStorage.getItem('my_categories'));
    var isSelectedCategory = function(historyCategories, inCategory){
        if(common.isValid(historyCategories)){
            for(var i = 0; i<historyCategories.length; i++){
                if(inCategory.id == historyCategories[i].id)
                    return true;
            }
        }
        return false;
    }

    for (var i = 0; i < rowData.length; ++i) {
        if (launch_count < 3 &&
            rowData[i].type === "FORYOU") {
            continue;
        }
        item = {};
        item["id"] = rowData[i].id;
        item["title"] = rowData[i].name;
        item["cp"] = "dailyhunt";
        item["contenturl"] = rowData[i].contentUrl;
        if(categoriesModel.dynamicCat.length <3 || isSelectedCategory(historyCategories, item)){
            categoriesModel.dynamicCat.push(item);
        }
        categoriesModel.dynamicCatList.push(item);
    }

    function detect_change(categoriesList, dynamicCatList){
        for(var i=0;i<categoriesList.length;i++){
            if(categoriesList[i].title != dynamicCatList[i].title){
                return true;
            }
        }
        return false;
    }
    if((categoriesList.length != categoriesModel.dynamicCatList.length) || detect_change(categoriesList, categoriesModel.dynamicCatList)){
        categoriesList = categoriesModel.dynamicCatList;
        myCategories = categoriesModel.dynamicCat;
        categoriesModel.saveCategories();
        categoriesSettings.refreshMyCategories();
        categoriesSettings.refreshRecommendedList();
        maincategories.resetTab();
        maincategories.refresh();
    }else{
        for(var i=0;i<categoriesList.length;i++){
            if(categoriesList[i].title == categoriesModel.dynamicCatList[i].title){
                categoriesList[i].contenturl = categoriesModel.dynamicCatList[i].contenturl;
            }
        }
    }
};

CategoriesModel.prototype.init = function(option) {
    if (this.script !== null) {
        document.body.removeChild(script);
    }
    this.script = document.createElement("script");
    this.script.type = "text/javascript";
};

CategoriesModel.prototype.loadCategories = function(successCallback) {
    this.successCallback = successCallback;
    // callback
    var self = this;
    var version = localStorage.getItem('version_categories');

    //console.log('SingleCP: version update');
    var localMyCategories;
    var updatedMyCategories = [];
    var categoriesListMap = {};

    if (localStorage.hasOwnProperty('my_categories')
            && (version != null && version != "1.0")) {
        localMyCategories = JSON.parse(localStorage.getItem('my_categories'));
    }
    if (!localStorage.hasOwnProperty('done_categories_setting')) { /* first */
        //console.log('SingleCP: first update');
        localMyCategories = [];
        updatedMyCategories = myCategories;
    }

    if (common.isValid(categoriesList)) {
        for (var i = 0; i < categoriesList.length; i++) {
            categoriesListMap[categoriesList[i].title] = categoriesList[i];
        }
    }

    if (common.isValid(localMyCategories)) {
        for (var i = 0; i < localMyCategories.length; i++) {
            if (categoriesListMap.hasOwnProperty(localMyCategories[i].title)) {
                updatedMyCategories.push(categoriesListMap[localMyCategories[i].title]);
            }
        }
    }
    if (updatedMyCategories.length > 0) {
        myCategories = updatedMyCategories;
    }
    successCallback(myCategories);
    this.saveCategories();
    localStorage.setItem('version_categories', version_categories);
};

CategoriesModel.prototype.saveAllCatagories = function() {
    localStorage.setItem('my_categories', JSON.stringify(myCategories));
};

CategoriesModel.prototype.saveCategories = function() {
    localStorage.setItem('my_categories', JSON.stringify(myCategories));
    localStorage.setItem('recommended_categories', JSON.stringify(categoriesList));
};

CategoriesModel.prototype.loggingStatus = function() {
    var lastLoggingTime = localStorage.getItem('category_status_logging_time');
    var currentTime = Date.now();
    var dayInMilli = 1 * 24 * 60 * 60 * 1000;
    if (currentTime - lastLoggingTime < dayInMilli) return;

    localStorage.setItem('category_status_logging_time', currentTime);
    // logging.customEvent('Feeds_category', 'Status_category_number', myCategories.length);
    // for (var i = 0; i < myCategories.length; i++) {
    //     logging.customEvent('Feeds_category', 'Status', myCategories[i].title);
    // }
};
