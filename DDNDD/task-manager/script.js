let tasks = [];
let currentFilter = "all";
let sortByName = false;
let nextId = 1;

function loadData() {
    let saved = localStorage.getItem("tasks");
    if (saved) {
        tasks = JSON.parse(saved);
        if (tasks.length > 0) {
            nextId = Math.max(...tasks.map(t => t.id)) + 1;
        }
    } else {
        tasks = [
            { id: nextId++, title: "Сделать домашку по математике", desc: "Задачи 5-10", status: "queue" },
            { id: nextId++, title: "Написать курсовую", desc: "Введение и глава 1", status: "progress" },
            { id: nextId++, title: "Проверить код напарника", desc: "Pull request", status: "review" },
            { id: nextId++, title: "Купить продукты", desc: "Молоко, хлеб, яйца", status: "done" },
            { id: nextId++, title: "Подготовиться к экзамену", desc: "Повторить темы 1-3", status: "queue" },
            { id: nextId++, title: "Сделать презентацию", desc: "Для защиты проекта", status: "progress" },
            { id: nextId++, title: "Записаться к врачу", desc: "Пятница после обеда", status: "queue" }
        ];
    }
    renderBoard();
}

function saveData() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function showMessage(msg) {
    let area = document.getElementById("notifyArea");
    let div = document.createElement("div");
    div.className = "notify";
    div.innerHTML = msg;
    area.appendChild(div);
    setTimeout(() => div.remove(), 2000);
}

function addTask() {
    let title = document.getElementById("taskTitle").value.trim();
    let desc = document.getElementById("taskDesc").value.trim();
    let status = document.getElementById("taskStatus").value;

    if (title === "") {
        showMessage("Введите название задачи!");
        return;
    }

    let newTask = {
        id: nextId++,
        title: title,
        desc: desc || "Без описания",
        status: status
    };

    tasks.push(newTask);
    saveData();
    renderBoard();

    document.getElementById("taskTitle").value = "";
    document.getElementById("taskDesc").value = "";
    
    showMessage("Задача добавлена!");
}

function deleteTask(id) {
    if (confirm("Удалить задачу?")) {
        tasks = tasks.filter(task => task.id !== id);
        saveData();
        renderBoard();
        showMessage("Задача удалена");
    }
}

function editTask(id) {
    let task = tasks.find(t => t.id === id);
    if (!task) return;

    let newTitle = prompt("Новое название:", task.title);
    if (newTitle !== null && newTitle.trim() !== "") {
        task.title = newTitle.trim();
    }

    let newDesc = prompt("Новое описание:", task.desc);
    if (newDesc !== null) {
        task.desc = newDesc.trim() || "Без описания";
    }

    saveData();
    renderBoard();
    showMessage("Задача обновлена");
}

function dragTask(event, id) {
    event.dataTransfer.setData("text/plain", id);
    event.target.classList.add("dragging");
}

function dragEnd(event) {
    event.target.classList.remove("dragging");
    document.querySelectorAll(".column").forEach(col => {
        col.classList.remove("drag-over");
    });
}

function allowDrop(event) {
    event.preventDefault();
    event.currentTarget.classList.add("drag-over");
}

function removeDragOver(event) {
    event.currentTarget.classList.remove("drag-over");
}

function dropTask(event) {
    event.preventDefault();
    let column = event.currentTarget;
    column.classList.remove("drag-over");

    let taskId = parseInt(event.dataTransfer.getData("text/plain"));
    let newStatus = column.getAttribute("data-status");

    let task = tasks.find(t => t.id === taskId);
    if (task && task.status !== newStatus) {
        let oldStatus = task.status;
        task.status = newStatus;
        saveData();
        renderBoard();
        showMessage(`Задача "${task.title}" перемещена в "${getStatusName(newStatus)}"`);
    }
}

function getStatusName(status) {
    let names = {
        queue: "Очередь",
        progress: "В работе",
        review: "Проверка",
        done: "Готово"
    };
    return names[status];
}

function setFilter(filter) {
    currentFilter = filter;
    document.querySelectorAll(".filter-btn").forEach(btn => {
        if (btn.getAttribute("data-filter") === filter) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });
    renderBoard();
}

function toggleSort() {
    sortByName = !sortByName;
    let btn = document.getElementById("sortBtn");
    btn.textContent = sortByName ? "Сбросить сортировку" : "Сортировать по имени";
    renderBoard();
}

function renderBoard() {
    let queueList = document.getElementById("queueList");
    let progressList = document.getElementById("progressList");
    let reviewList = document.getElementById("reviewList");
    let doneList = document.getElementById("doneList");

    queueList.innerHTML = "";
    progressList.innerHTML = "";
    reviewList.innerHTML = "";
    doneList.innerHTML = "";

    let filteredTasks = [...tasks];
    if (currentFilter !== "all") {
        filteredTasks = filteredTasks.filter(t => t.status === currentFilter);
    }

    if (sortByName) {
        filteredTasks.sort((a, b) => a.title.localeCompare(b.title));
    }

    filteredTasks.forEach(task => {
        let card = createTaskCard(task);
        
        if (task.status === "queue") {
            queueList.appendChild(card);
        } else if (task.status === "progress") {
            progressList.appendChild(card);
        } else if (task.status === "review") {
            reviewList.appendChild(card);
        } else if (task.status === "done") {
            doneList.appendChild(card);
        }
    });

    if (queueList.children.length === 0) {
        queueList.innerHTML = '<div class="empty">Нет задач</div>';
    }
    if (progressList.children.length === 0) {
        progressList.innerHTML = '<div class="empty">Нет задач</div>';
    }
    if (reviewList.children.length === 0) {
        reviewList.innerHTML = '<div class="empty">Нет задач</div>';
    }
    if (doneList.children.length === 0) {
        doneList.innerHTML = '<div class="empty">Нет задач</div>';
    }

    document.getElementById("queueCount").innerText = tasks.filter(t => t.status === "queue").length;
    document.getElementById("progressCount").innerText = tasks.filter(t => t.status === "progress").length;
    document.getElementById("reviewCount").innerText = tasks.filter(t => t.status === "review").length;
    document.getElementById("doneCount").innerText = tasks.filter(t => t.status === "done").length;
    document.getElementById("totalCounter").innerHTML = `Всего задач: ${tasks.length}`;
}

function createTaskCard(task) {
    let card = document.createElement("div");
    card.className = "task-card";
    card.setAttribute("draggable", "true");
    card.setAttribute("data-id", task.id);
    
    card.innerHTML = `
        <div class="task-title">${escapeHtml(task.title)}</div>
        <div class="task-desc">${escapeHtml(task.desc)}</div>
        <div class="task-actions">
            <button class="edit-btn" onclick="editTask(${task.id})">Ред.</button>
            <button class="delete-btn" onclick="deleteTask(${task.id})">Удалить</button>
        </div>
    `;
    
    card.addEventListener("dragstart", (e) => dragTask(e, task.id));
    card.addEventListener("dragend", (e) => dragEnd(e));
    
    return card;
}

function escapeHtml(str) {
    if (!str) return "";
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

window.onload = function() {
    loadData();
};