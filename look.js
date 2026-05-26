let noteList = [];
let searchList, sortList;

export function addNote(toast, insertReset, note) {
    if(!note.fromStation.name) {
        toast("出発地の駅名が抜けているため追加できません。");
        return;
    }
    for(let i = 0;i < note.transferList.length;i++) {
        if(!note.transferList[i].name) {
            toast(`${i + 1}番目の経由地の駅名が抜けているため追加できません。`);
            return;
        }
    }
    if(!note.toStation.name) {
        toast("目的地の駅名が抜けているため追加できません。");
        return;
    }
    let timeError = false;
    if((note.fromStation?.fromTime ?? 1) > (note.fromStation?.toTime ?? 0)) {
        timeError = true;
    }
    for(let i = 0;i < note.transferList.length;i++) {
        if(i === 0) {
            if((note.fromStation?.toTime ?? 1) > (note.transferList[i].fromTime ?? 0)) {
                timeError = true;
            }
        } else if((note.transferList[i - 1].toTime ?? 1) > (note.transferList[i].fromTime ?? 0)) {
            timeError = true;
        }
        if((note.transferList[i].fromTime ?? 1) > (note.transferList[i].toTime ?? 0)) {
            timeError = true;
        }
    }
    if(timeError) {
        toast("時間が正しくないため追加できません。");
        return;
    }
    const saveContentEles = document.querySelectorAll(".save-content-insert");
    saveContentEles.forEach((s) => {
        s.value = "";
    });
    noteList.push(note);
    saveData();
    console.log("ノートを追加しました。");
    console.log(noteList);
    insertReset(toast);
    window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth"
    });
}

function deleteNote(toast, id) {
    if(sortList ?? searchList) {
        toast("エラーが発生しました。");
        return;
    }
    let newArray = [];
    for(let i = 0;i < noteList.length;i++) {
        if(i !== id) {
            newArray.push(noteList[i]);
        }
    }
    noteList = newArray;
    saveData();
    lookNote(toast);
    console.log("ノートを削除しました。");
    console.log(noteList);
    if(noteList.length === 0) {
        closeNote();
    }
}

export function applyLookNote() {
    let data = localStorage.getItem("train_note");
    if(data) {
        data = JSON.parse(data);
    } else {
        data = {};
    }
    noteList = data.noteList ?? [];
    applySelectTag();
}

export function applySelectTag() {
    const selectEle = document.getElementById("search-tag-select");
    const value = selectEle.value;
    selectEle.innerHTML = "";
    const dfOpt = document.createElement("option");
    dfOpt.value = "";
    dfOpt.textContent = "しない";
    selectEle.append(dfOpt);
    let tagList = [];
    noteList.forEach((n) => {
        (n.tag ?? []).forEach((t) => {
            if(!(tagList.some((s) => s === t))) {
                tagList.push(t);
            }
        });
    });
    tagList.forEach((t) => {
        const opt = document.createElement("option");
        opt.value = t;
        opt.textContent = `${t}タグ`;
        selectEle.append(opt);
    });
    selectEle.value = value;
}

function saveData() {
    let data = localStorage.getItem("train_note");
    if(data) {
        data = JSON.parse(data);
    } else {
        data = {};
    }
    data.noteList = noteList;
    localStorage.setItem("train_note", JSON.stringify(data));
}

function getFullDate(i) {
    let result = "";
    const date = new Date(i);
    result += `${date.getFullYear()}年 `;
    result += `${date.getMonth() + 1}月 `;
    result += `${date.getDate()}日 `;
    result += `${date.getHours()}時 `;
    result += `${date.getMinutes()}分`;
    return result;
}

function getTime(i) {
    let result = "";
    const h = Math.floor(i / 3600000);
    if(h > 0) {
        result += `${h}時間 `;
    }
    const m = Math.floor((i - h * 3600000) / 60000);
    if(i > 0) {
        result += `${m}分`;
    } else {
        result += "0分";
    }
    return result;
}

function closeNote() {
    const lookNoteEle = document.getElementById("look-note");
    lookNoteEle.checked = false;
}

export function lookNote(toast, look = true) {
    const dataListEle = document.getElementById("data-list");
    dataListEle.innerHTML = "";
    const displayMethodEle = document.getElementById("display-method");
    const method = displayMethodEle.value;
    const list = sortList ?? searchList ?? noteList;
    if(list.length === 0) {
        const nullListMessage = document.createElement("h3");
        nullListMessage.textContent = "ノートがありません。";
        dataListEle.append(nullListMessage);
    }
    console.log(list);
    for(let i = 0;i < list.length;i++) {
        const ulBox = document.createElement("div");
        ulBox.classList.add("route-ul-box");
        const t = list[i].title === "" ? "無題" : list[i].title;
        switch(method) {
            case "list":
                const title = document.createElement("h3");
                title.classList.add("note-title");
                title.textContent = t;
                ulBox.append(title);
                const detailsUl = document.createElement("ul");
                function applyList(id) {
                    const item = (typeof id === "string") ? list[i][`${id}Station`] : list[i].transferList[id];
                    const ul = document.createElement("ul");
                    ul.classList.add("route-ul");
                    const nameLi = document.createElement("li");
                    nameLi.textContent = item.name;
                    ul.append(nameLi);
                    console.log(item);
                    if(id !== "to") {
                        const timeLi = document.createElement("li");
                        timeLi.textContent = `時間: ${getFullDate(item.fromTime)} ~ ${getFullDate(item.toTime)}(${getTime(item.toTime - item.fromTime)})`;
                        ul.append(timeLi);
                        const lineLi = document.createElement("li");
                        lineLi.textContent = `移動手段: ${item.line === "" ? "データがありません。" : item.line}`;
                        ul.append(lineLi);
                        const fareLi = document.createElement("li");
                        fareLi.textContent = `料金: ${item.fare ?? "データがありません。"}`;
                        ul.append(fareLi);
                    } else {
                        nameLi.classList.add("to-station-li");
                        const targetList = list[i];
                        const time = ((targetList.transferList.slice(-1)[0] ?? {}).toTime ?? targetList.fromStation.toTime) - targetList.fromStation.fromTime;
                        detailsUl.classList.add("details-ul");
                        const timeLi = document.createElement("li");
                        timeLi.textContent = `所要時間: ${getFullDate(targetList.fromStation.fromTime)} ~ ${getFullDate((targetList.transferList.slice(-1)[0] ?? {}).toTime ?? targetList.fromStation.toTime)}(${getTime(time)})`;
                        detailsUl.append(timeLi);
                        let fare = targetList.fromStation.fare;
                        targetList.transferList.forEach((t) => {
                            fare += t.fare;
                        });
                        const fareLi = document.createElement("li");
                        fareLi.textContent = `合計料金: ${fare}`;
                        detailsUl.append(fareLi);
                    }
                    const noteLi = document.createElement("li");
                    if(item.note) {
                        noteLi.textContent = `メモ: ${item.note}`;
                        ul.append(noteLi);
                    }
                    ulBox.append(ul);
                    if(id === "to") {
                        ulBox.append(detailsUl);
                    }
                }
                applyList("from");
                for(let j = 0;j < (list[i].transferList ?? []).length;j++) {
                    applyList(j);
                }
                applyList("to");
                if((list[i].tag ?? []).length > 0) {
                    const tagUl = document.createElement("ul");
                    tagUl.classList.add("tag-ul");
                    const tagDescription = document.createElement("li");
                    tagDescription.textContent = "タグ一覧";
                    tagUl.append(tagDescription);
                    (list[i].tag ?? []).forEach((t) => {
                        const li = document.createElement("li");
                        li.textContent = t;
                        tagUl.append(li);
                    });
                    ulBox.append(tagUl);
                }
                break;
            case "table":
                const tableBox = document.createElement("div");
                tableBox.classList.add("table-box");
                const table = document.createElement("table");
                const caption = document.createElement("caption");
                caption.textContent = t;
                table.append(caption);
                const thead = document.createElement("thead");
                const thTr = document.createElement("tr");
                const thItem = ["場所", "", "詳細"];
                for(let j = 0;j < thItem.length;j++) {
                    const th = document.createElement("th");
                    th.textContent = thItem[j];
                    thTr.append(th);
                }
                thead.append(thTr);
                table.append(thead);
                const tbody = document.createElement("tbody");
                function applyTable(id) {
                    const item = (typeof id === "string") ? list[i][`${id}Station`] : list[i].transferList[id];
                    const nameTr = document.createElement("tr");
                    const station = document.createElement("th");
                    station.textContent = item.name;
                    nameTr.append(station);
                    tbody.append(nameTr);
                    let titleList, itemList;
                    if(id !== "to") {
                        titleList = ["時間", "移動手段", "料金", "メモ"];
                        itemList = [`${getFullDate(item.fromTime)} ~ ${getFullDate(item.toTime)}(${getTime(item.toTime - item.fromTime)})`, (item.line ?? "") === "" ? "データがありません。" : item.line, item.fare, (item.note ?? "") === "" ? "ありません。" : item.note];
                    } else {
                        titleList = ["メモ", "所要時間", "合計料金"];
                        const targetList = list[i];
                        const time = (((targetList.transferList.slice(-1)[0] ?? {}) ?? targetList.fromStation).toTime) - targetList.fromStation.fromTime;
                        let fare = targetList.fromStation.fare;
                        targetList.transferList.forEach((t) => {
                            fare += t.fare;
                        });
                        itemList = [(item.note ?? "") === "" ? "ありません。" : item.note, `${getFullDate(targetList.fromStation.fromTime)} ~ ${getFullDate((targetList.transferList.slice(-1)[0] ?? {}).toTime ?? targetList.fromStation.toTime)}(${getTime(time)})`, fare];
                    }
                    station.rowSpan = Math.min(titleList.length, itemList.length) + 1;
                    for(let j = 0;j < Math.min(titleList.length, itemList.length);j++) {
                        const tr = document.createElement("tr");
                        const th = document.createElement("th");
                        th.textContent = titleList[j];
                        tr.append(th);
                        const td = document.createElement("td");
                        td.textContent = itemList[j];
                        tr.append(td);
                        tbody.append(tr);
                    }
                }
                applyTable("from");
                for(let j = 0;j < (list[i].transferList ?? []).length;j++) {
                    applyTable(j);
                }
                applyTable("to");
                if((list[i].tag ?? []).length > 0) {
                    const tagTr = document.createElement("tr");
                    const nullTh = document.createElement("th");
                    tagTr.append(nullTh);
                    const tagTh = document.createElement("th");
                    tagTh.textContent = "タグ";
                    tagTr.append(tagTh);
                    const tagTd = document.createElement("td");
                    (list[i].tag ?? []).forEach((t) => {
                        const tag = document.createElement("span");
                        tag.classList.add("tag");
                        tag.textContent = t;
                        tagTd.append(tag);
                    });
                    tagTr.append(tagTd);
                    tbody.append(tagTr);
                }
                table.append(tbody);
                tableBox.append(table);
                ulBox.append(tableBox);
                break;
        }
        if(list[i].note) {
            const text = list[i].note.split("\n");
            const note = document.createElement("div");
            note.classList.add("note");
            for(let i = 0;i < text.length;i++) {
                if(i !== 0) {
                    const br = document.createElement("br");
                    note.append(br);
                }
                note.append(text[i]);
            }
            ulBox.append(note);
        }
        if((list[i].url ?? []).length > 0) {
            const urlListEle = document.getElementById("url-list");
            list[i].url.forEach((u) => {
                const div = document.createElement("div");
                const link = document.createElement("a");
                link.classList.add("note-link");
                link.textContent = (u.title ?? "") === "" ? u.link : u.title;
                link.href = u.link;
                link.target = "_blank";
                div.append(link);
                ulBox.append(div);
            });
        }
        if(!(sortList ?? searchList)) {
            const deleteBox = document.createElement("p");
            deleteBox.classList.add("delete-box");
            const deleteButton = document.createElement("button");
            deleteButton.textContent = "-削除";
            deleteButton.classList.add("delete-button");
            deleteButton.addEventListener("click", () => {
                console.log(i);
                toast(`${t}を削除しますか？`, deleteNote, [toast, i]);
            });
            deleteBox.append(deleteButton);
            ulBox.append(deleteBox);
        }
        dataListEle.append(ulBox);
    }
    const closeBox = document.createElement("p");
    closeBox.classList.add("flex-center");
    closeBox.classList.add("bottom-sticky");
    const closeButton = document.createElement("button");
    closeButton.textContent = "とじる";
    closeButton.id = "close-note-button";
    closeButton.addEventListener("click", () => {
        closeNote();
    });
    closeBox.append(closeButton);
    dataListEle.append(closeBox);
    const lookSettingsEle = document.getElementById("look-settings");
    if(noteList.length > 0) {
        lookSettingsEle.style.display = null;
    } else {
        lookSettingsEle.style.display = "none";
    }
    if(look) {
        const lookNoteEle = document.getElementById("look-note");
        lookNoteEle.checked = true;
    }
}

export function search(toast) {
    console.log("search");
    const searchTagSelectEle = document.getElementById("search-tag-select");
    if(searchTagSelectEle.value === "") {
        searchList = null;
    } else {
        searchList = [];
        const tag = searchTagSelectEle.value;
        noteList.forEach((n) => {
            if((n.tag ?? []).some((t) => t === tag)) {
                searchList.push(n);
            }
        });
    }
    lookNote(toast, false);
}

export function sort(toast) {
    const sortSelectEle = document.getElementById("sort-select");
    const sortValue = sortSelectEle.value;
    const orderSelectEle = document.getElementById("order-select");
    const list = searchList ?? noteList;
    if(sortValue === "") {
        sortList = null;
    } else {
        switch(sortValue) {
            case "time":
                sortList = Array.from(list);
                sortList.sort((a, b) => {
                    return (((a.transferList.slice(-1)[0] ?? {}).toTime ?? a.fromStation.toTime) - a.fromStation.fromTime) - (((b.transferList.slice(-1)[0] ?? {}).toTime ?? b.fromStation.toTime) - b.fromStation.fromTime);
                });
                break;
            case "fare":
                sortList = [];
                let fareList = [];
                for(let i = 0;i < list.length;i++) {
                    fareList.push({});
                    let fare = list[i].fromStation.fare;
                    for(let j = 0;j < list[i].transferList.length;j++) {
                        fare += list[i].transferList[j].fare;
                    }
                    fareList[i].fare = fare;
                    fareList[i].id = i;
                }
                fareList.sort((a, b) => {
                    return a.fare - b.fare;
                });
                fareList.forEach((f) => {
                    console.log(f);
                    sortList.push(list[f.id]);
                });
                console.log(sortList);
                break;
        }
        if(orderSelectEle.value === "descending") {
            sortList.reverse();
        }
    }
    console.log(sortList);
    lookNote(toast, false);
}