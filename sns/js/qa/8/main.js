var controller, categoriesSettings, maincategories, signature, network, quickAccessPage, quickAccessSettings, renameQickAccessPage;
var categoriesModel, mainElement, eventListener;
var toast;
var addQuickAccess,feedbackPopup, categoriesSettingsAll;

/**
 * Takes the timestampe and returns current time - timestamp
 * as X Y ago
 */
function timeSince(date) {
  let seconds = Math.floor((new Date() - date) / 1000);
  let interval = Math.floor(seconds / 31536000);
  if (interval > 1)
    return interval + " years";
  if (interval === 1)
    return interval + " year";
  interval = Math.floor(seconds / 2592000);
  if (interval > 1)
    return interval + " months";
  if (interval === 1)
    return interval + " month";
  interval = Math.floor(seconds / 86400);
  if (interval > 1)
    return interval + " days";
  if (interval === 1)
    return interval + " day";
  interval = Math.floor(seconds / 3600);
  if (interval > 1)
    return interval + " hours";
  if (interval === 1)
    return interval + " hour";
  interval = Math.floor(seconds / 60);
  if (interval > 1)
    return interval + " minutes";
  if (interval === 1)
    return interval + " minute";
  return Math.floor(seconds) + " seconds";
}
let start = performance.now();
let getCategories = localStorage.getItem('my_categories');
let getCategoriesJson = JSON.parse(getCategories);
//let getRecommendedCategories = localStorage.getItem('recommended_categories');
if (getCategories && getCategoriesJson['top'])
    userCategories = getCategoriesJson;

// if (getRecommendedCategories)
//     categoriesList = JSON.parse(getRecommendedCategories);

var isAlreadyWheel = false;
// initial event
eventListener = new EventListener();
// initial Apis
mainElement = document.getElementById("main_page");
// initial uitilities
controller = new Controller({});
toast = new Toast();
common = new Common();
//intitial screens
quickAccessPage = new QuickAccessHTML();
let end = performance.now();
let totalTime = (end - start).toFixed(1);
console.log('Loading time for QA - ' + totalTime + " ms.")
addQuickAccess = new AddQuickAccess();
quickAccessSettings = new QuickAccessSettings();
renameQickAccessPage = new RenameQuickAccess();
maincategories = new MainCategories();
controller.openLikeHomePage = true;
categoriesSettingsAll = new CategoriesSettingsAll();

categoriesSettings = new CategoriesSettings();
/* Order of below Array entries should be same as singleCP_no defined in the individual pages */
controller.setAvailableScreen(["",categoriesSettings, "" /* languagesSettingsAll */, quickAccessSettings, categoriesSettingsAll, addQuickAccess]);
if ("serviceWorker" in navigator) {
//     navigator.serviceWorker
//         .register('/qa/qa-service-worker.js')
//         .then(function(sw) {
//             console.log('Service Worker Registered');
//         }).catch(function(error) {
//           console.warn("Service Worker failed to register: " + error );
//         });
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister()
    }
  });
}

gtag('event', 'page_view', {
  'page_path': '/',
  'timestamp': new Date().getTime(),
});

window.onpopstate = function(event) {
    //console.log('SingleCP: onpopstate');
    controller.back(event);
};

window.addEventListener("resize", function(){
    //console.log('SingleCP: window.addEventListener resize()');
    controller.onResize();
    quickAccessPage.onResize();
    if (quickAccessPage.container.children.length === 1) {
        maincategories.element.style.display = 'flex';
        quickAccessPage.pageBarElement.style.display = 'block';
        quickAccessPage.dots.style.display = 'none';
    }
    maincategories.onResize();
    renameQickAccessPage.onResize();
    categoriesSettings.onResize();
    quickAccessSettings.onResize();
} , false);

// if (typeof releaseVersion !== "undefined") {
//     //console.log("SingleCP: Release version: " + releaseVersion + ', categories version: '+ version_categories);
//     logging.customEvent('Version', 'SingleCPPage', releaseVersion);
//     logging.customEvent('Version', 'Categories', version_categories);
// }

function ChangedFullScreen() {
    isAlreadyWheel = true;
    maincategories.transformTransition(maincategories.element, paraEventMoveWrap.timeAniamtion);
    maincategories.translateYElementMainCategories(-quickAccessPage.getElementHeight());
    paraEventMoveWrap.flag = false;
    // set visible scroll
    setTimeout(function() {
        maincategories.activeAllScroll(true);
        maincategories.setElementSize();
    }, 100);
    setTimeout(function() {
        //logging.customEvent('Feeds', 'Fullscreen');
        isAlreadyWheel = false;
    }, 500);
};

function ChangedDefaultScreen() {
    isAlreadyWheel = true;
    maincategories.transformTransition(maincategories.element, paraEventMoveWrap.timeAniamtion);
    maincategories.translateYElementMainCategories(0);
    maincategories.getactivePage().setScrollTop(0);
    paraEventMoveWrap.flag = true;
    setTimeout(function() {
        maincategories.activeAllScroll(false);
        maincategories.setElementSize();
    }, 100);
    setTimeout(function() {
        isAlreadyWheel = false;
    }, 500);
};

mainElement.addEventListener('mousewheel', function(e) {
    var category = maincategories.getactivePage().element;
    var delta = e.wheelDelta;
    var isFullScreen;
    try {
        isFullScreen = category.classList.contains('active-overflow-content');
    } catch (e) {
        return;
    }
    if (delta >= 0) { // up wheel
        //console.log('SingleCP: up wheel, isFullScreen: ' + isFullScreen);
        if (!isFullScreen && !isAlreadyWheel) {
            //ChangedFullScreen();
        } else if (isFullScreen && !isAlreadyWheel && (category.scrollTop == 0)) {
            ChangedDefaultScreen();
        }
    } else { // down wheel
        //console.log('SingleCP: down wheel, isFullScreen: ' + isFullScreen);
        if (!isFullScreen && !isAlreadyWheel) {
            ChangedFullScreen();
        }
    }
});

var onKeyDownEventListener = function(e) {
    if (e.type === 'keydown' && e.keyCode != 33 && e.keyCode != 34) {
        return;
    }
    var category = maincategories.getactivePage().element;
    var isFullScreen = category.classList.contains('active-overflow-content');
    if (e.keyCode == 33) { // page up
        var scrollTopCategory = category.scrollTop;
        if (!isFullScreen) {
            //ChangedFullScreen();
        } else if (isFullScreen && (scrollTopCategory == 0)) {
            ChangedDefaultScreen();
        } else if (isFullScreen && (scrollTopCategory > 0)) {
            var scroll_top = scrollTopCategory - 500;
            if (scroll_top < 0) {
                scroll_top = 0;
            }
            common.animateScroll(category, scroll_top, 300);
        }
    } else if (e.keyCode == 34) { // page down
        if (!isFullScreen) {
            ChangedFullScreen();
        } else {
            common.animateScroll(category, scrollTopCategory + 500, 300);
        }
    }
};
document.addEventListener('keydown', onKeyDownEventListener);
var launchCount = localStorage.getItem("launch_count");
if (launchCount == null) {
    localStorage.setItem("launch_count", 1);
} else if (launchCount <3) {
    localStorage.setItem("launch_count", ++launchCount);
}

$(document).on('contextmenu', function(e) {
    if (!$(e.target).is("#add-qa-input_url, #input_title, .item")) {
        return false;
    }
});
