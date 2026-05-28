export let insertData = {
    fromStation: {},
    transferList: [],
    toStation: {},
    title: "",
    note: "",
    url: [],
    insertTag: "",
    tag: []
};

export function saveInsertData() {
    let data = localStorage.getItem("train_note");
    if(data) {
        data = JSON.parse(data);
    } else {
        data = {};
    }
    data.insertData = insertData;
    localStorage.setItem("train_note", JSON.stringify(data));
}

function adjustTheDigits(s, n) {
    if(String(s).length >= n) {
        return String(s).slice(0, n);
    } else {
        let result = "";
        for(let i = 0;i < n - String(s).length;i++) {
            result += "0";
        }
        result += String(s);
        return result;
    }
}

function applyTag(toast) {
    const tagListEle = document.getElementById("tag-list");
    tagListEle.innerHTML = "";
    insertData.tag.forEach((t) => {
        const tag = document.createElement("button");
        tag.classList.add("tag");
        tag.textContent = t;
        tag.addEventListener("click", () => {
            toast(`${t}タグを外しますか？`, deleteTag, [toast, t]);
        });
        tagListEle.append(tag);
    });
}

function deleteTag(toast, t) {
    insertData.tag = insertData.tag.filter((tg) => tg !== t);
    saveInsertData();
    applyTag(toast);
}

function applyUrl(toast) {
    const urlListEle = document.getElementById("url-list");
    urlListEle.innerHTML = "";
    insertData.url.forEach((u, i) => {
        const url = document.createElement("button");
        url.classList.add("delete-url");
        console.log(u);
        url.textContent = ((u.title ?? "") === "" ? u.link : u.title);
        url.addEventListener("click", () => {
            toast(`${u.title}(${u.link})を削除しますか？`, deleteUrl, [toast, i]);
        });
        urlListEle.append(url);
    });
}

function deleteUrl(toast, id) {
    let newArray = [];
    for(let i = 0;i < insertData.url.length;i++) {
        if(i !== id) {
            newArray.push(insertData.url[i]);
        }
    }
    insertData.url = newArray;
    saveInsertData();
    applyUrl(toast);
}

export function changeValue(toast, id) {
    const data = {};
    function getTheDate(type) {
        switch(id) {
            case "title":
            case "to":
                return;
        }
        const yearEle = document.getElementById(`${type}-year-select-${id}`);
        const year = Number(yearEle.value);
        const monthEle = document.getElementById(`${type}-month-select-${id}`);
        const month = Number(monthEle.value);
        const dayEle = document.getElementById(`${type}-day-select-${id}`);
        const day = Number(dayEle.value);
        const timeHEle = document.getElementById(`${type}-time-h-select-${id}`);
        const timeH = Number(timeHEle.value);
        const timeMEle = document.getElementById(`${type}-time-m-select-${id}`);
        const timeM = Number(timeMEle.value);
        const date = Number(new Date(`${year}-${adjustTheDigits(month + 1, 2)}-${adjustTheDigits(day, 2)}T${adjustTheDigits(timeH, 2)}:${adjustTheDigits(timeM, 2)}:00`));
        return date;
    }
    const nameEle = document.getElementById(`${id}-station`);
    if(id === "from" || typeof id === "number") {
        data.name = nameEle.value;
        data.fromTime = getTheDate("from");
        data.toTime = getTheDate("to");
        console.log(new Date(getTheDate("from")));
        const lineEle = document.getElementById(`insert-line-${id}`);
        data.line = lineEle.value;
        const fareEle = document.getElementById(`insert-fare-${id}`);
        data.fare = Number(fareEle.value);
    }
    const sNoteEle = document.getElementById(`insert-note-${id}`);
    console.log(sNoteEle);
    switch(true) {
        case id === "from":
        case typeof id === "number":
            data.note = sNoteEle.value;
            break;
        case id === "to":
            insertData[`toStation`].note = sNoteEle.value;
            break;
    }
    switch(id) {
        case "title":
            const titleEle = document.getElementById("insert-title");
            insertData.title = titleEle.value;
            break;
        case "insertTag":
            const insertTagEle = document.getElementById("insert-tag");
            insertData.insertTag = insertTagEle.value;
            break;
        case "tag":
            const tagEle = document.getElementById("insert-tag");
            if(/^\s*$/.test(tagEle.value) || insertData.tag.some((t) => t === tagEle.value)) {
                toast("この名前は登録できません。");
                return;
            } else {
                insertData.tag.push(tagEle.value);
                applyTag(toast);
                tagEle.value = "";
                insertData.insertTag = "";
            }
            break;
        case "note":
            const noteEle = document.getElementById("insert-note");
            insertData.note = noteEle.value;
            break;
        case "url":
            const urlTitleEle = document.getElementById("insert-url-title");
            const urlLinkEle = document.getElementById("insert-url");
            if(/^\s+$/.test(urlTitleEle.value)) {
                toast("無効な名前が入力されています。");
            } else {
                if(URL.canParse(urlLinkEle.value)) {
                    insertData.url.push({
                        title: urlTitleEle.value,
                        link: urlLinkEle.value
                    });
                    applyUrl(toast);
                    urlTitleEle.value = "";
                    urlLinkEle.value = "";
                } else {
                    toast("無効なURLが入力されています。正しいURLを入れてから追加してください。");
                }
            }
            break;
        case "to":
            insertData["toStation"].name = nameEle.value;
            break;
        case "from":
            insertData["fromStation"] = data;
            break;
        default:
            insertData.transferList[id] = data;
            break;
    }
    console.log("insertData");
    console.log(insertData);
    saveInsertData();
}

export function insertReset(toast) {
    insertData = {
        fromStation: {},
        transferList: [],
        toStation: {},
        title: "",
        note: "",
        url: [],
        insertTag: "",
        tag: []
    };
    saveInsertData();
    applyInsert(toast);
    window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth"
    });
}

export function applyInsert(toast) {
    const data = localStorage.getItem("train_note");
    if(data) {
        insertData = JSON.parse(data).insertData ?? insertData;
    }
    const insertEle = document.getElementById("insert");
    insertEle.innerHTML = "";
    function applyFromTo(type) {
        const insertGroup = document.createElement("p");
        insertGroup.classList.add("insert-group");
        const box = document.createElement("div");
        box.classList.add("insert-box");
        const title = document.createElement("span");
        title.classList.add("insert-title");
        title.textContent = type === "from" ? "出発" : "到着";
        box.append(title);
        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = type === "from" ? "出発地" : "目的地";
        input.classList.add("insert-station-name");
        input.id = `${type}-station`;
        input.value = insertData[`${type}Station`].name ?? "";
        input.addEventListener("input", () => {
            changeValue(toast, type);
        });
        box.append(input);
        insertGroup.append(box);
        applyDetailsInsert(type, insertGroup);
    }
    function applyDetailsInsert(id, group) {
        const timeBox = document.createElement("div");
        if(id !== "to") {
            timeBox.classList.add("insert-box");
            const timeTitle = document.createElement("span");
            timeTitle.classList.add("insert-title");
            timeTitle.textContent = "時間";
            timeBox.append(timeTitle);
        }
        function applyDateInsert(type) {
            let selectedDate;
            if(id === "from") {
                selectedDate = new Date((typeof id === "string" ? insertData.fromStation[`${type}Time`] : insertData.transferList[id][`${type}Time`]) ?? Date.now());
            } else if(id > 0) {
                selectedDate = new Date(insertData.transferList[id][`${type}Time`] ?? insertData.transferList[id - 1].toTime);
            } else {
                selectedDate = new Date(insertData.transferList[id][`${type}Time`] ?? insertData.fromStation.toTime);
            }
            console.log(selectedDate);
            const dateTitle = document.createElement("span");
            dateTitle.classList.add("date-title");
            dateTitle.textContent = type === "from" ? "この駅を出発する時間" : "次の駅に到着する時間";
            timeBox.append(dateTitle);
            const yearSelect = document.createElement("select");
            yearSelect.classList.add("date-select");
            yearSelect.id = `${type}-year-select-${id}`;
            yearSelect.addEventListener("change", () => {
                changeValue(toast, id);
            });
            const date = new Date(Date.now());
            const year = date.getFullYear();
            const selectedYear = selectedDate.getFullYear() ?? year;
            for(let i = 2026; i <= year + 1;i++) {
                const opt = document.createElement("option");
                opt.value = i;
                opt.textContent = `${i}年`;
                if(selectedYear === i) {
                    opt.selected = true;
                }
                yearSelect.append(opt);
            }
            timeBox.append(yearSelect);
            const monthSelect = document.createElement("select");
            monthSelect.classList.add("date-select");
            monthSelect.id = `${type}-month-select-${id}`;
            monthSelect.addEventListener("change", () => {
                changeValue(toast, id);
            });
            const month = date.getMonth();
            const selectedMonth = selectedDate.getMonth() ?? month;
            for(let i = 0;i < 12;i++) {
                const opt = document.createElement("option");
                opt.value = i;
                opt.textContent = `${i + 1}月`;
                if(selectedMonth === i) {
                    opt.selected = true;
                }
                monthSelect.append(opt);
            }
            timeBox.append(monthSelect);
            const daySelect = document.createElement("select");
            daySelect.classList.add("date-select");
            daySelect.id = `${type}-day-select-${id}`;
            daySelect.addEventListener("change", () => {
                changeValue(toast, id);
            });
            const day = date.getDate();
            const selectedDay = selectedDate.getDate() ?? day;
            for(let i = 1;i <= 31;i++) {
                const opt = document.createElement("option");
                opt.value = i;
                opt.textContent = `${i}日`;
                if(selectedDay === i) {
                    opt.selected = true;
                }
                daySelect.append(opt);
            }
            timeBox.append(daySelect);
            const timeHSelect = document.createElement("select");
            timeHSelect.classList.add("date-select");
            timeHSelect.id = `${type}-time-h-select-${id}`;
            timeHSelect.addEventListener("change", () => {
                changeValue(toast, id);
            });
            const timeH = date.getHours();
            const selectedTimeH = selectedDate.getHours() ?? timeH;
            for(let i = 0;i < 24;i++) {
                const opt = document.createElement("option");
                opt.value = i;
                opt.textContent = `${i}時`;
                if(selectedTimeH === i) {
                    opt.selected = true;
                }
                timeHSelect.append(opt);
            }
            timeBox.append(timeHSelect);
            const timeMSelect = document.createElement("select");
            timeMSelect.classList.add("date-select");
            timeMSelect.id = `${type}-time-m-select-${id}`;
            timeMSelect.addEventListener("change", () => {
                changeValue(toast, id);
            });
            const timeM = date.getMinutes();
            const selectedTimeM = selectedDate.getMinutes() ?? timeM;
            for(let i = 0;i < 60;i++) {
                const opt = document.createElement("option");
                opt.value = i;
                opt.textContent = `${i}分`;
                if(selectedTimeM === i) {
                    opt.selected = true;
                }
                timeMSelect.append(opt);
            }
            timeBox.append(timeMSelect);
            group.append(timeBox);
        }
        const d = (typeof id === "string") ? insertData[`${id}Station`] : insertData.transferList[id];
        if(id !== "to") {
            applyDateInsert("from");
            applyDateInsert("to");
            const lineBox = document.createElement("div");
            lineBox.classList.add("insert-box");
            const lineTitle = document.createElement("span");
            lineTitle.classList.add("insert-title");
            lineTitle.textContent = "手段";
            lineBox.append(lineTitle);
            const lineInput = document.createElement("input");
            lineInput.type = "text";
            lineInput.placeholder = "移動手段";
            lineInput.classList.add("insert-line");
            lineInput.id = `insert-line-${id}`;
            lineInput.value = (d.line ?? "");
            lineInput.addEventListener("input", () => {
                changeValue(toast, id);
            });
            lineBox.append(lineInput);
            group.append(lineBox);
            const fareBox = document.createElement("div");
            fareBox.classList.add("insert-box");
            const fareTitle = document.createElement("span");
            fareTitle.classList.add("insert-title");
            fareTitle.textContent = "料金";
            fareBox.append(fareTitle);
            const fareInput = document.createElement("input");
            fareInput.type = "number";
            fareInput.placeholder = "料金";
            fareInput.classList.add("insert-fare");
            fareInput.id = `insert-fare-${id}`;
            fareInput.value = d.fare ?? 0;
            fareInput.min = 0;
            fareInput.step = 10;
            fareInput.addEventListener("input", () => {
                if(Number(fareInput.value) < Number(fareInput.min)) {
                    fareInput.value = fareInput.min;
                }
                changeValue(toast, id);
            });
            fareBox.append(fareInput);
            group.append(fareBox);
        }
        const noteBox = document.createElement("div");
        noteBox.classList.add("insert-box");
        const noteTitle = document.createElement("span");
        noteTitle.classList.add("insert-title");
        noteTitle.textContent = "メモ";
        noteBox.append(noteTitle);
        const noteInput = document.createElement("input");
        noteInput.type = "text";
        noteInput.placeholder = "この駅のメモ";
        noteInput.classList.add("insert");
        noteInput.id = `insert-note-${id}`;
        noteInput.value = d.note ?? "";
        noteInput.addEventListener("input", () => {
            changeValue(toast, id);
        });
        noteBox.append(noteInput);
        group.append(noteBox);
        if(typeof id === "number") {
            const deleteBox = document.createElement("div");
            const deleteButton = document.createElement("button");
            deleteButton.classList.add("delete-button");
            deleteButton.textContent = "-この経由地を削除";
            deleteButton.addEventListener("click", () => {
                toast(`${insertData.transferList[id].name === "" ? "指定されていない経由地" : `経由地: ${insertData.transferList[id].name}`}を削除しますか？`, deleteTransfer, [id, toast]);
            });
            deleteBox.append(deleteButton);
            group.append(deleteBox);
        }
        insertEle.append(group);
        const titleEle = document.getElementById("insert-title");
        titleEle.value = insertData.title ?? "";
        changeValue(toast, id);
    }
    applyFromTo("from");
    for(let i = 0;i < insertData.transferList.length;i++) {
        const insertGroup = document.createElement("p");
        insertGroup.classList.add("insert-group");
        const transferBox = document.createElement("div");
        transferBox.classList.add("insert-box");
        const transferTitle = document.createElement("span");
        transferTitle.classList.add("insert-title");
        transferTitle.textContent = "経由";
        transferBox.append(transferTitle);
        const transferInput = document.createElement("input");
        transferInput.type = "text";
        transferInput.placeholder = "経由地";
        transferInput.classList.add("insert-station-name");
        transferInput.id = `${i}-station`;
        transferInput.value = insertData.transferList[i].name ?? "";
        transferInput.addEventListener("input", () => {
            changeValue(toast, i);
        });
        transferBox.append(transferInput);
        insertGroup.append(transferBox);
        applyDetailsInsert(i, insertGroup);
    }
    const placeBox = document.createElement("div");
    const placeButton = document.createElement("button");
    placeButton.id = "place-button";
    placeButton.textContent = "+経由地を追加";
    placeButton.addEventListener("click", () => {
        addTransfer(toast);
    });
    placeBox.append(placeButton);
    insertEle.append(placeBox);
    applyFromTo("to");
    const insertTagEle = document.getElementById("insert-tag");
    insertTagEle.value = insertData.insertTag ?? "";
    const insertNoteEle = document.getElementById("insert-note");
    insertNoteEle.value = insertData.note ?? "";
    const insertUrlTitleEle = document.getElementById("insert-url-title");
    insertUrlTitleEle.value = insertData.url?.title ?? "";
    const insertUrlEle = document.getElementById("insert-url");
    insertUrlEle.value = insertData.url?.link ?? "";
    applyTag(toast);
    applyUrl(toast);
}

function addTransfer(toast) {
    console.log(insertData.transferList);
    insertData.transferList.push({});
    console.log(insertData.transferList);
    saveInsertData();
    applyInsert(toast);
}

export function deleteTransfer(id, toast) {
    let newArray = [];
    const list = insertData.transferList;
    for(let i = 0;i < list.length;i++) {
        if(i !== id) {
            newArray.push(list[i]);
        }
    }
    insertData.transferList = newArray;
    saveInsertData();
    applyInsert(toast);
}