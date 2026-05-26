import {insertData, saveInsertData, changeValue, insertReset, applyInsert, deleteTransfer} from "./insert.js";
import {addNote, applyLookNote, applySelectTag, lookNote, search, sort} from "./look.js";
let mainData = {};
let isComposing = false;

function toast(m, f, a) {
    const contentEle = document.getElementById("toast-content");
    contentEle.innerHTML = "";
    const text = m.split("\n");
    for(let i = 0;i < text.length;i++) {
        if(i > 0) {
            const br = document.createElement("br");
            contentEle.append(br);
        }
        contentEle.append(text[i]);
    }
    const buttonGroupEle = document.getElementById("toast-button-group");
    buttonGroupEle.innerHTML = "";
    const okButton = document.createElement("button");
    okButton.textContent = "OK";
    okButton.classList.add("toast-button");
    okButton.addEventListener("click", () => {
        if(typeof f === "function") {
            if(typeof a === "object") {
                f(...a);
            } else if(a !== undefined) {
                f(a);
            } else {
                f();
            }
        }
        removeToast();
    });
    buttonGroupEle.append(okButton);
    if(typeof f === "function") {
        const cancelButton = document.createElement("button");
        cancelButton.textContent = "キャンセル";
        cancelButton.classList.add("toast-button");
        cancelButton.addEventListener("click", () => {
            removeToast();
        });
        buttonGroupEle.append(cancelButton);
    }
    const showToastEle = document.getElementById("show-toast");
    showToastEle.checked = true;
}

function removeToast() {
    const showToastEle = document.getElementById("show-toast");
    showToastEle.checked = false;
}

function stopInsertion(k) {
    if(k === "Enter") {
        const focusedEle = document.querySelector("*:focus");
        if(focusedEle) {
            focusedEle.blur();
        }
    }
}

function applyData() {
    const data = localStorage.getItem("train_note");
    if(data) {
        mainData = JSON.parse(data);
    } else {
        mainData = {};
    }
    Object.keys(mainData.insertData ?? {}).forEach((k) => {
        insertData[k] = mainData.insertData[k];
    });
    if(mainData.settings) {
        const methodEle = document.getElementById("display-method");
        methodEle.value = mainData.settings.method ?? "table";
    }
}

function saveData() {
    let data = localStorage.getItem("train_note");
    if(data) {
        data = JSON.parse(data);
    } else {
        data = {};
    }
    if(!data.settings) {
        data.settings = {};
    }
    const displayMethodEle = document.getElementById("display-method");
    data.settings.method = displayMethodEle.value;
    localStorage.setItem("train_note", JSON.stringify(data));
    saveInsertData();
}

function detailsOpen(t) {
    const target = document.getElementById(t);
    if(target) {
        target.checked = !target.checked;
    }
}

window.onload = function() {
    const descriptionButtonEle = document.getElementById("description-button");
    descriptionButtonEle.addEventListener("click", () => {
        toast("ノートを見る: 記録したノート一覧を見ることができます。タグでの絞り込みや時間、料金でのソートもできます。\n題名: ノートのタイトルです。なくても保存することができます。\n出発: 開始地点を記録できます。必須項目です。\n時間: 電車の時間を記録できます。\n手段: 〇〇線や徒歩など移動手段を記録できます。\n料金: 運賃などを記録できます。\nメモ: その駅に関するメモを残すことができます。\n経由地を追加: 途中で立ち寄る場所や乗換する駅を記録できます。\n到着: 目的地を記録できます。必須項目です。\nその他のオプション: タグ、メモ、URLを追加できます。\nタグ: 管理用のタグを追加できます。追加したタグをタップすると削除できます。\nこのノートのメモ: このノートに関する情報を残すことができます。\nURL: 電車の情報などへのリンクを追加できます。追加したURLをタップすると削除できます。");
    });
    const showDataButtonEle = document.getElementById("show-data");
    showDataButtonEle.addEventListener("click", () => {
        lookNote(toast);
    });
    const addNoteButtonEle =document.getElementById("add-note");
    addNoteButtonEle.addEventListener("click", () => {
        addNote(toast, insertReset, insertData);
        lookNote(toast, false);
        applySelectTag();
        search(toast);
        sort(toast);
    });
    const detailsButtonEles = document.querySelectorAll(".details-button");
    detailsButtonEles.forEach((d) => {
        d.addEventListener("click", () => {
            detailsOpen(d.dataset.target);
        });
    });
    const saveContentInsertEles = document.querySelectorAll(".save-content-insert");
    saveContentInsertEles.forEach((s) => {
        s.addEventListener("input", () => {
            changeValue(toast, s.dataset.id);
        });
    });
    const addTagButtonEle = document.getElementById("add-tag-button");
    addTagButtonEle.addEventListener("click", () => {
        changeValue(toast, "tag");
    });
    const addUrlButtonEle = document.getElementById("add-url-button");
    addUrlButtonEle.addEventListener("click", () => {
        changeValue(toast, "url");
    });
    const displayMethodEle = document.getElementById("display-method");
    displayMethodEle.addEventListener("change", () => {
        saveData();
        lookNote(toast, false);
    });
    const searchTagSelectEle = document.getElementById("search-tag-select");
    searchTagSelectEle.addEventListener("change", () => {
        search(toast);
    });
    const sortSelectEle = document.getElementById("sort-select");
    sortSelectEle.addEventListener("change", () => {
        sort(toast);
    });
    const orderSelectEle = document.getElementById("order-select");
    orderSelectEle.addEventListener("change", () => {
        sort(toast);
    });
    document.addEventListener("compositionstart", () => {
        isComposing = true;
        console.log(isComposing);
    });
    document.addEventListener("compositionend", () => {
        isComposing = false;
        console.log(isComposing);
    });
    applyData();
    applyInsert(toast);
    applyLookNote();
    saveData();
    console.log(mainData);
}

window.addEventListener("keydown", (k) => {
    if(isComposing) {
        return;
    }
    stopInsertion(k.key);
});