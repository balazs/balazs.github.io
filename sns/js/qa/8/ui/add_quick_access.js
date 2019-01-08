var AddQuickAccess = function() {
    this.name = 'AddQuickAccess';
    this.state = "singleCP_no5";
    this.element;
    this.newDynamicQuickAccess = [];
    this.init();
};

AddQuickAccess.prototype.init = function() {
    this.element = document.createElement('div');
    this.element.setAttribute('id', 'add-quick-access');

    this.elementBlack = document.createElement('div');
    this.elementBlack.className = "quick_access_popup_black";
    this.elementWhite = document.createElement('div');
    this.elementWhite.className = "quick_access_popup_white";
    this.elementBlack.appendChild(this.elementWhite);
    this.element.appendChild(this.elementBlack);

    var heading = document.createElement('div');
    heading.className = "popup_heading";
    heading.innerHTML = "Add Quick access shortcut";
    this.elementWhite.appendChild(heading);

    var popupUrl = document.createElement('div');
    popupUrl.className = "popup_url";
    popupUrl.innerHTML = '<input type="url" name="url" id = "add-qa-input_url" maxlength="2048" class="popup_input_text" placeholder=" Enter web address">';

    this.elementWhite.appendChild(popupUrl);

    var popup_last = document.createElement('div');
    popup_last.className = "popup_last";

    this.popupCancel = document.createElement('button');
    this.popupCancel.setAttribute('id','btn-addqa-cancel');
    this.popupCancel.className = "add-quick-access-addqa-cancel-button";
    this.popupCancel.innerHTML = "CANCEL";
    this.popupSave = document.createElement('button');
    this.popupSave.setAttribute('id','btn-addqa-done');
    this.popupSave.className = "add-quick-access-addqa-done-button";
    this.popupSave.innerHTML = "SAVE";
    popup_last.appendChild(this.popupSave);
    popup_last.appendChild(this.popupCancel);

    this.elementWhite.appendChild(popup_last);
    document.body.appendChild(this.element);
    this.popupUrlInput = document.getElementById('add-qa-input_url');
    this.setEventListeners();
};

AddQuickAccess.prototype.show = function() {
    //console.log('SingleCP: QuickAccess settings show');
    var qaPage = document.getElementsByClassName('quickaccess-page');
    if (qaPage.length == 2 && qaPage[1].style.display == 'none') {
        quickAccessPage.slidePage();
        setTimeout(function() {
            this.displayElement();
        }.bind(this), 300);
        return;
    }
    this.displayElement();
};

AddQuickAccess.prototype.displayElement = function() {
    this.element.style.display = 'block';
    controller.addScreen(addQuickAccess);
    this.resetElement();
};

AddQuickAccess.prototype.exit = function() {
    //console.log("qaddquickaccess exit");
    if (!quickAccessSettings) {
        quickAccessSettings = new QuickAccessSettings();
    }
    //quickAccessSettings.reload();
    this.element.style.display = 'none';
};

AddQuickAccess.prototype.setEventListeners = function() {
    var self = this;

    var OnClickEventListener = function(ev) {
        ev.stopPropagation();
        if (ev.type === 'keydown' && ev.keyCode != 13 && ev.keyCode != 32) {
            return;
        }

        var target = ev.target;

        switch (target.classList[0]) {
        case 'add-quick-access-addqa-cancel-button':
        case 'quick_access_popup_black':
            //self.exit();
            history.back();
            // logging.clickEvent('Button', 'ud_qa_done_cancel');
            break;
        case 'add-quick-access-addqa-done-button':
            self.saveQuickAccessShortcut();
            localStorage.setItem('ud_qa_status_added_qa', true);
            break;
        }
    };
    this.popupCancel.addEventListener('click', OnClickEventListener);
    this.popupCancel.addEventListener('keydown', OnClickEventListener);
    this.popupCancel.addEventListener('mouseover', function() {
        self.popupCancel.style.cursor = "pointer";
    });
    this.popupCancel.addEventListener('mouseout', function() {
        self.popupCancel.style.cursor = "default";
    });
    this.popupSave.addEventListener('click', OnClickEventListener);
    this.popupSave.addEventListener('keydown', OnClickEventListener);
    this.popupSave.addEventListener('mouseover', function() {
        self.popupSave.style.cursor = "pointer";
    });
    this.popupCancel.addEventListener('mouseout', function() {
        self.popupSave.style.cursor = "default";
    });

    this.elementBlack.addEventListener('click', OnClickEventListener);
    this.elementBlack.addEventListener('keydown', OnClickEventListener);

    function inputChangeValue(event) {
        var url = self.popupUrlInput.value.trim();
        if (url.length == 0) {
            self.popupSave.disabled = true;
            self.popupSave.style.opacity = '0.4';
        } else {
            if (url.length >= 2048) {
                toast.show("Can't enter more than 2048 characters", 2000);
            }
            if (event.keyCode === 13) {
                self.saveQuickAccessShortcut();
                localStorage.setItem('ud_qa_status_added_qa', true);
                return;
            }
            self.popupSave.disabled = false;
            self.popupSave.style.opacity = '1.0';
        }
    };
    this.popupUrlInput.addEventListener('keyup', inputChangeValue);
    this.popupUrlInput.addEventListener('input', inputChangeValue);
    this.elementWhite.addEventListener('click', function(e) {
        if ((e.target.id == 'btn-addqa-done' && e.target.getAttribute('disabled') != 'disabled')
            || e.target.id == 'btn-addqa-cancel' || e.target.id == 'add-qa-input_url') {
            return;
        }
        self.popupUrlInput.focus();
    });
};

AddQuickAccess.prototype.onResize = function() {
    //console.log("SingleCP: addQuickAccess:: onResize()");
    if (quickAccessPage.landscapeMode) {
        this.elementWhite.style.top = (document.body.clientHeight-this.elementWhite.clientHeight)/2 - 30 + 'px';
    } else {
        this.elementWhite.style.top = (document.body.clientHeight-this.elementWhite.clientHeight)/2 + 'px';
    }
};

AddQuickAccess.prototype.isNotAvailableAddQuickAccessItem = function() {
    return this.newDynamicQuickAccess.length >= (common.MAX_QUICK_ACCESS_ITEM + 1);
};

AddQuickAccess.prototype.saveQuickAccessShortcut = function() {
    //console.log("SingleCP: called addQuickAccess::saveQuickAccessShortcut");
    var url = this.popupUrlInput.value.trim();
    if (url.length == 0) {
        return;
    }
    var title = common.getHostname(url);
    var len = title.indexOf(".");
    if (len == -1) {
        len = title.length;
    }
    title = title.substring(0,len);

    if (this.isNotAvailableAddQuickAccessItem()) {
        toast.show(common.ExceededNumberOfQuickAccessItem_string, 1000);
        return;
    }

    if (typeof QuickAccess === 'undefined') {
        if (this.isDuplicatedQuickAccess()) {
            this.popupSave.disabled = true;
            return;
        }

        this.getQuickAccessIcon(url, function (quickAccessURL, faviconURL) {
            for (var i = 0; i < data.dynamicQuickAccess.length; ++i) {
                if (data.dynamicQuickAccess[i].link == quickAccessURL) {
                    data.dynamicQuickAccess[i].icon = faviconURL;
                    common.setDynamicQuickAccess();
                    quickAccessSettings.reload();
                    break;
                }
            }
        });
    }
    var self = this;
    quickAccessPage.setPerformedOperation(common.databaseStatus.ADD);
    window.setTimeout(function () {
        //console.log("SingleCP: called addQuickAccess:: save timer called");
        var url = self.popupUrlInput.value.trim();
        var title = url;

        var quickAccess = {
            icon: "BeforeIconSearch",
            title: title,
            link: url,
            color: "#BDBDBD"
        }

        if (typeof QuickAccess !== 'undefined') {
            var UpdatequickAccessItem = {
                title: "",
                link: url
            };

            var alreadyExists = QuickAccess.updateItems(JSON.stringify(UpdatequickAccessItem));
            if (alreadyExists) {
                quickAccessPage.setPerformedOperation(common.databaseStatus.NONE);
                return;
            }
        }

        data.dynamicQuickAccess.splice(data.dynamicQuickAccess.length - 1, 0, quickAccess);

        this.newDynamicQuickAccess = [];
        for (var i = 0; i < data.dynamicQuickAccess.length; ++i) {
            this.newDynamicQuickAccess.push(data.dynamicQuickAccess[i]);
        }
        // logging.customEvent('UD_QA_manual', title, url);
        common.setDynamicQuickAccess();
        quickAccessSettings.reload();
    }, 150);
    //this.exit();
    history.back();
};

AddQuickAccess.prototype.isDuplicatedQuickAccess = function() {
    var res = false;
    var userQuickAccessList = JSON.stringify(data.dynamicQuickAccess);
    var quickAccessList = JSON.stringify(data.quickAccess);
    var comparisonString = '';
    var url = this.popupUrlInput.value.trim();
    var title = common.getHostname(url);
    var len = title.indexOf(".");
    if (len == -1 || len == 0) {
        len = title.length;
    }
    title = title.substring(0,len);

    if (title == '') {
        res = true;
    } else {
        comparisonString = '"title":"' + title + '"';
        if (common.isValid(userQuickAccessList) && userQuickAccessList.toLowerCase().indexOf(comparisonString.toLowerCase()) != -1) {
            res = true;
        }
        if (common.isValid(quickAccessList) && quickAccessList.toLowerCase().indexOf(comparisonString.toLowerCase()) != -1) {
            res = true;
        }
    }

    if (url == '') {
        res = true;
    } else {
        comparisonString = '"link":"' + url + '"';
        if (common.isValid(userQuickAccessList) && userQuickAccessList.toLowerCase().indexOf(comparisonString.toLowerCase()) != -1) {
            res = true;
        }
        if (common.isValid(quickAccessList) && quickAccessList.toLowerCase().indexOf(comparisonString.toLowerCase()) != -1) {
            res = true;
        }
    }

    return res;
};

AddQuickAccess.prototype.getQuickAccessIcon = function(url, callback) {
    var self = this;
    var imgElement = document.createElement("img");
    imgElement.onload = function () {
        //console.log("SingleCP: called imgElement.onload");
        if (this.height < 32 || this.width < 32) {
            callback(url, 'none');
        } else {
            callback(url, this.src);
        }
    };

    imgElement.onerror = function () {
        //console.log("SingleCP: cannot get the favicon");
        callback(url, 'none');
    };

    imgElement.src = common.getFaviconURL(url);
    //console.log("SingleCP: imgElement.src: " + imgElement.src);
};

AddQuickAccess.prototype.resetElement = function(manualMethod) {
    this.popupUrlInput.value = '';
    this.popupUrlInput.focus();
    this.popupSave.disabled = true;
    this.popupSave.style.opacity = '0.4';
};