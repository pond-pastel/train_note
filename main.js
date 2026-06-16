import {insertData, saveInsertData, changeValue, insertReset, applyInsert, deleteTransfer} from "./insert.js";
import {editingId, addNote, cancelEdit, applyLookNote, applySelectTag, lookNote, search, sort} from "./look.js";
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
    if(mainData.settings) {
        const methodEle = document.getElementById("display-method");
        methodEle.value = mainData.settings.method ?? "table";
        const mode = document.getElementById(mainData.settings.mode ?? "");
        if(mode) {
            mode.checked = true;
        }
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
    const lightModeEle = document.getElementById("light-mode");
    const darkModeEle = document.getElementById("dark-mode");
    const systemModeEle = document.getElementById("system-mode");
    const modeEle = [lightModeEle, darkModeEle, systemModeEle];
    modeEle.forEach((m) => {
        if(m.checked) {
            data.settings.mode = m.id;
        }
    });
    localStorage.setItem("train_note", JSON.stringify(data));
    saveInsertData();
}

function detailsOpen(t) {
    const target = document.getElementById(t.dataset.target);
    if(target && !(target.checked && t.classList.contains("appearance-mode-button"))) {
        target.checked = !target.checked;
    }
}

window.onload = function() {
    const descriptionButtonEle = document.getElementById("description-button");
    descriptionButtonEle.addEventListener("click", () => {
        toast("ノートを見る: 記録したノート一覧を見ることができます。タグでの絞り込みや時間、料金でのソートもできます。\n題名: ノートのタイトルです。\n出発: 開始地点を記録できます。必須項目です。\n時間: 電車の時間を記録できます。出発時間、到着時間を間違わないように注意してください。\n手段: 〇〇線や徒歩など移動手段を記録できます。\n料金: 運賃などを記録できます。0未満の場合は自動で0になります。\nメモ: その駅に関するメモを残すことができます。\n経由地を追加: 途中で立ち寄る場所や乗換する駅を記録できます。\n到着: 目的地を記録できます。必須項目です。\nその他のオプション: タグ、メモ、URLを追加できます。\nタグ: 管理用のタグを追加できます。追加したタグをタップすると削除できます。\nこのノートのメモ: このノートに関する情報を残すことができます。\nURL: 電車の情報などへのリンクを追加できます。追加したURLをタップすると削除できます。\nノートをリセット: 入力内容をリセットします。経由地がある場合は経由地が全て削除されます。\n編集: ノートを編集できます。編集モードはサイトを再読み込みした時や離れた時に解除されますが、入力内容はリセットされません。(この仕様をうまく使うとノートを複製することができます。)");
    });
    const howToUseButtonEle = document.getElementById("how-to-use-button");
    howToUseButtonEle.addEventListener("click", () => {
        toast("トレインノートの使い方(*は必須項目)\n必要に応じてタイトルを入力します。\n出発地*を入力します。\n時間*を選択します。\n必要に応じて移動手段を入力します。\n料金*を入力します。料金がかからない場合、0と入力してください。\n必要に応じてその駅のメモを追加します。\n必要に応じて経由地を追加します。\n目的地*を入力します。\n必要であればその他のオプションからタグ(複数可)、メモ(複数行可)、URL(複数可)を追加できます。");
    });
    const showDataButtonEle = document.getElementById("show-data");
    showDataButtonEle.addEventListener("click", () => {
        lookNote(toast, applyInsert);
    });
    const addNoteButtonEle =document.getElementById("add-note");
    addNoteButtonEle.addEventListener("click", () => {
        addNote(toast, insertReset, insertData);
        lookNote(toast, applyInsert, false);
        applySelectTag();
        search(toast, applyInsert);
        sort(toast, applyInsert);
    });
    const resetButtonEle = document.getElementById("reset-button");
    resetButtonEle.addEventListener("click", () => {
        if(!editingId) {
            toast("本当に入力をリセットしますか？", insertReset, toast);
        } else {
            toast("編集内容を破棄しますか？", cancelEdit, insertReset);
        }
    });
    const detailsButtonEles = document.querySelectorAll(".details-button");
    detailsButtonEles.forEach((d) => {
        d.addEventListener("click", () => {
            detailsOpen(d);
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
        lookNote(toast, applyInsert, false);
    });
    const searchTagSelectEle = document.getElementById("search-tag-select");
    searchTagSelectEle.addEventListener("change", () => {
        search(toast, applyInsert);
    });
    const sortSelectEle = document.getElementById("sort-select");
    sortSelectEle.addEventListener("change", () => {
        sort(toast, applyInsert);
    });
    const orderSelectEle = document.getElementById("order-select");
    orderSelectEle.addEventListener("change", () => {
        sort(toast, applyInsert);
    });
    const appearanceModeButtonEles = document.querySelectorAll(".appearance-mode-button");
    appearanceModeButtonEles.forEach((a) => {
        a.addEventListener("click", () => {
            detailsOpen(a);
            saveData();
        });
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