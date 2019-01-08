var Common = function() {
    this.contentsLoadingFailed_string = "Loading Failed.";
    this.noNetworkConnection_string = "No network connection. Connect to a network and try again";
    this.cannotFindYourLocation_string = "Unable to find Location.";
    this.noNewContentsAvailable_string = 'New Contents Available';
    this.MAX_QUICK_ACCESS_ITEM = 60;
    this.ExceededNumberOfQuickAccessItem_string = "Can't add more than " + this.MAX_QUICK_ACCESS_ITEM + " Quick access shortcuts.";
    this.contentsLoadingWaitTime = 2000;
    this.configLoadingWaitTime = 3000;
    this.loadingFailStatus = {
        NETWORK_ISSUE: 0,
        NO_NEW_CONTENTS: 1,
        INCORRECT_DATA: 2
    };
    this.databaseStatus = {
        ADD: 0,
        DELETE: 1,
        UPDATE: 2,
        REORDER: 3,
        NONE: 4
    };
    this.isSecretMode = false;
    if (typeof QuickAccess !== 'undefined') {
        this.isSecretMode = QuickAccess.isSecretMode();
    }
};
Common.prototype.getTimeStamp = function() {
    return new Date().getTime();
};

Common.prototype.showContentsLoadingFailed = function(tabTitle, status) {
    console.log('SingleCP: tabTitle ' + tabTitle);
    for (var i = 0; i < maincategories.listContentObject.length; ++i) {
        if (maincategories.listContentObject[i].element.title == tabTitle) {
            var page = maincategories.listContentObject[i];
            page.setBackground(false);
            page.displayLoadingEle(false);
            page.loadingFlag = false;
            page.loadingSucceed = false;
            console.log('SingleCP: showContentsLoadingFailed: LoadingFail - ' + page.id);
            break;
        }
    }

    var activePage = maincategories.getactivePage();
    var msg;
    if (status == this.loadingFailStatus.NO_NEW_CONTENTS) {
        msg = this.noNewContentsAvailable_string;
    } else {
        msg = this.noNetworkConnection_string;
    }
    if (activePage.element.title == tabTitle) {
        activePage.setFastScrollTop((activePage.getscrollHeight() - activePage.getoffsetHeight()));// - activePage.getloadingEleOffsetHeight());
        toast.show(msg, 2000);
    }
};

onerrorEvent = function (source) {
    console.log('SingleCP: create gray icon') ;
    var failedElement = document.createElement("div");
    failedElement.className = "failed-img";
    failedElement.innerHTML = source.title.charAt(0);

    var eleBackgroundColor = '#bababa';
    if (source.getAttribute("color") != '') {
        eleBackgroundColor = source.getAttribute("color");
    }
    failedElement.style.backgroundColor = eleBackgroundColor;
    if (source.classList.contains('item-img') || source.classList.contains('cp-item-img')) {
        failedElement.style.color = "white";
    } else {
        failedElement.innerHTML = source.title;
        failedElement.style.color = "#bababa";
        failedElement.style.fontSize = "10px";
        failedElement.style.fontWeight = "bold";
    }
    failedElement.title = source.title;
    failedElement.setAttribute("color", eleBackgroundColor);
    failedElement.setAttribute("src", source.src);
    source.parentElement.appendChild(failedElement);
    source.parentElement.removeChild(source);
};
Common.prototype.isValid = function(data) {
    if (typeof data !== "undefined" && data) {
        return true;
    }
    return false;
};

Common.prototype.setDynamicQuickAccess = function() {
    var tempDynamicQuickAccess = [];
    for (var i = 0; i < data.dynamicQuickAccess.length; ++i) {
        if (quickAccessPage.isValidIconData(data.dynamicQuickAccess[i]) && data.dynamicQuickAccess[i].icon != defaultAddButton.icon) {
            tempDynamicQuickAccess.push(data.dynamicQuickAccess[i]);
        }
    }
    if (typeof QuickAccess !== 'undefined') {
        if (!this.isSecretMode) {
            tempDynamicQuickAccess.push(defaultAddButton);
        }
    } else {
        tempDynamicQuickAccess.push(defaultAddButton);
    }
    data.dynamicQuickAccess = tempDynamicQuickAccess;

    localStorage.setItem('dynamic_quick_accesss', JSON.stringify(data.dynamicQuickAccess));
};

/**
 * return square of distance between two point
 * @param {*} p1
 * @param {*} p2
 */
Common.prototype.calculateDistance = function(p1, p2) {
    return (p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y);
};

Common.prototype.getHostname = function(url) {
    var aTag = document.createElement('a');
    url = url.replace(' ', '');
    if (url.indexOf('http://') == -1 && url.indexOf('https://') == -1) {
        url = 'https://' + url;
    }

    aTag.href = url;
    return aTag.hostname;
};

Common.prototype.getDomainURL = function(url) {
    var aTag = document.createElement('a');
    url = url.replace(' ', '');
    if (url.indexOf('http://') == -1 && url.indexOf('https://') == -1) {
        url = 'https://' + url;
    }

    aTag.href = url;
    return aTag.protocol + '//' + aTag.hostname;
};

Common.prototype.getFaviconURL = function(url) {
    return this.getDomainURL(url) + '/favicon.ico';
};

Common.prototype.handleImageUrl = function (imageUrl) {
    var url = imageUrl.replace("{CMD}","crop")
                        .replace("{W}","180")
                        .replace("{H}","180")
                        .replace("{Q}","100")
                        .replace("{EXT}","webp");
    return url;
};

Common.prototype.decimalToHexString = function(number)
{
  if (number < 0)
  {
    number = 0xFFFFFF + number + 1;
  }
  return number.toString(16).toUpperCase();
}


Common.prototype.syncRearrangeCategories = function(original, rearranged) {
    let modifiedOrder = [];
    for (let i = 0; i < rearranged.length; i++) {
        for (let j = 0; j < original.length; j++) {
            if (rearranged[i].category === original[j].category) {
                modifiedOrder.push(original[j]);
                break;
            }
        }
    }
    return modifiedOrder;
}

Common.prototype.animateScroll = function(element, scrollPosition, time) {
    element.scrollTo({top: scrollPosition, behavior: 'smooth'});
}

Common.prototype.animate = function(node, prop, end, duration, fn, arg, context) {
    var stepTime = 20;
    var startTime = new Date().getTime();
    var start = node.scrollTop;
    if (typeof end === "string") {
        end = parseInt(end, 10);
    }

    var timer;

    function removeTimer(node, timer) {
        var timerData = _data(node, "animTimers");
        if (timer && timerData) {
            delete timerData["_" + timer];
        }
    }

    function addTimer(node, timer) {
        var timerData = _data(node, "animTimers");
        if (!timerData) {
            timerData = {};
            _data(node, "animTimers", timerData);
        }
        timerData["_" + timer] = timer;
    }

    function step() {
        removeTimer(node, timer);
        var nextValue, done, portionComplete;
        var timeRunning = new Date().getTime() - startTime;

        if (timeRunning >= duration) {
            nextValue = end;
            done = true;
        } else {
            portionComplete = timeRunning / duration;
            nextValue = ((end - start) * portionComplete) + start;
            done = false;
        }

        node[prop] = nextValue;
        if (!done) {
            timer = setTimeout(step, stepTime);
            addTimer(node, timer);
        } else {
            //if (fn) {
                context = context || window;
                fn.call(context, node, arg);
            //}
        }
    }

    step();
}

Common.prototype.stop = function(node) {
    var timers = _data(node, "animTimers");
    if (timers) {
        for (var item in timers) {
            if (timers.hasOwnProperty(item)) {
                clearTimeout(timers[item]);
            }
        }
    }
    _data(node, "animTimers", null);
}

var _data = (function() {
    var uniqueCntr = 0;
    var nodeIndex = {};

    return function(node, name, value) {
        var key = node._dataKey;
        var nodeData;

        if (!key) {
            key = node._dataKey = uniqueCntr++;
        }
        nodeData = nodeIndex[key];
        if (!nodeData) {
            nodeData = nodeIndex[key] = {};
        }
        if (typeof value != "undefined") {
            nodeData[name] = value;
        } else {
            return nodeData[name];
        }
    }
})();

Common.prototype.isSI8x = function() {
    return navigator.userAgent.includes('SamsungBrowser/8.');
};
