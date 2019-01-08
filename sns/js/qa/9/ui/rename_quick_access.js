var RenameQuickAccess = function () {
    this.quickAccessItem = {};
    this.init();
};

RenameQuickAccess.prototype.init = function() {
    this.element = document.createElement("div");
    this.element.className = "rename-quick-access";

    document.body.appendChild(this.element);

    this.popUp = document.createElement("div");
    this.popUp.className = "pop-up";

    this.popUp.innerHTML = '<div id="rename_qa_title" class="rename-qa-title">Rename Quick access shortcut</div>' +
                           '<div class="popup_url">' +
                                '<input type="url" id="input_title" class="rename-qa-input" placeholder="Title" maxLength="2048"></input>' +
                            '</div>'+
                           '<div class="ctrl-button">' +
                               '<button id="btn_save" class="rename-qa-btn" disabled>RENAME</button>' +
                               '<button id="btn_cancel" class="rename-qa-btn">CANCEL</button>' +
                           '</div>';

    this.element.appendChild(this.popUp);

    this.element.addEventListener('click', function(event){
        var target = event.target;

        switch(target.id) {
            case 'btn_cancel':
            this.hide();
            break;

            case 'btn_save':
            this.saveQuickAccessShortcut();
            history.back();
            break;
        }
        switch(target.classList[0]) {
            case 'rename-quick-access':
                this.hide();
            break;
        }
    }.bind(this));

    this.element.addEventListener('mousemove', ()=> {
        return;
    });
    this.inputTitle = document.getElementById('input_title');
    this.btnCancel = document.getElementById('btn_cancel');
    this.btnSave = document.getElementById('btn_save');
    this.inputTitle.addEventListener('input', inputChangeValue.bind(this));
    this.inputTitle.addEventListener('keyup', inputChangeValue.bind(this));
    var self = this;
    this.popUp.addEventListener('click', function(e) {
        if ((e.target.id == 'btn_save' && e.target.getAttribute('disabled') != 'disabled')
            || e.target.id == 'btn_cancel' || e.target.id == 'input_title') return;
        self.inputTitle.focus();
    });

    this.btnCancel.addEventListener('mouseover', function(){
        self.btnCancel.style.cursor = 'pointer';
    });
    this.btnCancel.addEventListener('mouseout', function(){
        self.btnCancel.style.cursor = 'default';
    });
    this.btnSave.addEventListener('mouseover', function() {
        if (self.btnSave.style.opacity == '1') {
            self.btnSave.style.cursor = 'pointer';
        }
    });
    this.btnSave.addEventListener('mouseout', function() {
        self.btnSave.style.cursor = 'default';
    });

    function inputChangeValue(event) {
        const MAX_CHARS = 2048;
        const KEY_ENTER = 13;
        if (this.inputTitle.value.trim().length > 0) {
            if (this.originTitle == this.inputTitle.value) {
                this.btnSave.setAttribute('disabled', true);
            } else {
                if (event.keyCode === KEY_ENTER) {
                    this.saveQuickAccessShortcut();
                    this.hide();
                    return;
                }
                if (this.inputTitle.value.length >= MAX_CHARS) {
                    toast.show("Can't enter more than "+MAX_CHARS+" characters", 2000);
                }
                this.btnSave.removeAttribute('disabled');
            }
        } else {
            this.btnSave.setAttribute('disabled', true);
        }
    }
};

RenameQuickAccess.prototype.saveQuickAccessShortcut = function() {
    if (this.inputTitle.value != '') {
        data.dynamicQuickAccess[this.qaIndex].title = this.inputTitle.value.trim();
        quickAccessSettings.update(this.qaIndex);
        if (typeof QuickAccess !== 'undefined') {
            var renamequickAccessItem = {
                title: data.dynamicQuickAccess[this.qaIndex].title,
                link: data.dynamicQuickAccess[this.qaIndex].link
            };
            QuickAccess.updateItems(JSON.stringify(renamequickAccessItem));
        }
        toast.show("Quick Access shortcut saved.", 2000);
        common.setDynamicQuickAccess();
        quickAccessPage.reload();
        if (mainElement.style.display == 'none') {
            history.back();
        } else {
            this.hide();
        }
    }
};

RenameQuickAccess.prototype.show = function(qaIndex) {
    this.qaIndex = qaIndex;
    this.inputTitle.value = data.dynamicQuickAccess[qaIndex].title;
    this.originTitle = data.dynamicQuickAccess[qaIndex].title;
    this.element.style.display = "flex";
    this.btnSave.setAttribute('disabled', true);
    var self = this;
    setTimeout(function(){ self.inputTitle.focus(); }, 300);
};

RenameQuickAccess.prototype.hide = function() {
    this.element.style.display = "none";
};

RenameQuickAccess.prototype.setMarginTop = function() {
    var marginTop = Math.floor((document.body.clientHeight - this.popUp.outerHeight()) / 2);
    this.popUp.style.marginTop = marginTop + 'px';
};

RenameQuickAccess.prototype.onResize = function() {
	this.popUp.style.top = (((document.body.clientHeight - this.popUp.clientHeight)/2) - 30) + "px";
}
