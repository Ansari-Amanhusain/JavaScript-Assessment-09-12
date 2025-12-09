const STORAGE_KEY = "simple_task_manager";

let tasks = [];

    document.addEventListener("DOMContentLoaded", () => {
    const taskForm = document.getElementById("taskForm");
    const taskIdInput = document.getElementById("taskId");
    const titleInput = document.getElementById("title");
    const descriptionInput = document.getElementById("description");
    const dueDateInput = document.getElementById("dueDate");
    const priorityInput = document.getElementById("priority");
    const statusInput = document.getElementById("status");

    const formModeChip = document.getElementById("formModeChip");
    const submitText = document.getElementById("submitText");
    const resetBtn = document.getElementById("resetBtn");

    const taskListEl = document.getElementById("taskList");
    const totalCountEl = document.getElementById("totalCount");
    const pendingCountEl = document.getElementById("pendingCount");

    function loadTasks() {
        const data = localStorage.getItem(STORAGE_KEY);
        tasks = data ? JSON.parse(data) : [];
    }
    function saveTasks() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }

    function resetForm() {
        taskForm.reset();
        taskIdInput.value = "";
        formModeChip.textContent = "New Task";
        submitText.textContent = "Add Task";
    }

    function validateForm() {
        if (!titleInput.value.trim()) {
        alert("Task Title is required");
        return false;
        }
        if (!dueDateInput.value) {
        alert("Due Date is required");
        return false;
        }
        if (!priorityInput.value) {
        alert("Priority is required");
        return false;
        }
        if (!statusInput.value) {
        alert("Status is required");
        return false;
        }
        return true;
    }

    function formatDate(dateStr) {
        if (!dateStr) return "";
        const d = new Date(dateStr + "T00:00:00");
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
        });
    }

    function updateCounters() {
        totalCountEl.textContent = tasks.length;
        const pending = tasks.filter(
        (t) => t.status === "To Do" || t.status === "In Progress"
        ).length;
        pendingCountEl.textContent = pending;
    }

    function getPriorityColor(priority) {
        if (priority === "High") return "bg-red-100 text-red-700 border-red-300";
        if (priority === "Medium") return "bg-yellow-100 text-yellow-800 border-yellow-300";
        return "bg-green-100 text-green-700 border-green-300";
    }

    function getStatusColor(status) {
        if (status === "To Do") return "bg-gray-100 text-gray-700 border-gray-300";
        if (status === "In Progress") return "bg-blue-100 text-blue-700 border-blue-300";
        return "bg-green-100 text-green-700 border-green-300";
    }

    function renderTasks() {
        taskListEl.innerHTML = "";

        if (!tasks.length) {
        const empty = document.createElement("p");
        empty.className = "text-sm text-gray-500 text-center pt-4";
        empty.textContent = "No tasks yet. Add a new task using the form.";
        taskListEl.appendChild(empty);
        updateCounters();
        return;
        }

        tasks
        .slice()
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .forEach((task) => {
            const card = document.createElement("div");
            card.className =
            "border rounded-md p-3 text-sm flex flex-col gap-1 bg-gray-50";

            const topRow = document.createElement("div");
            topRow.className = "flex justify-between items-start gap-2";

            const titleDiv = document.createElement("div");
            titleDiv.className = "font-medium text-gray-800 break-words";
            titleDiv.textContent = task.title;

            const tags = document.createElement("div");
            tags.className = "flex flex-wrap gap-1 justify-end";

            const prioSpan = document.createElement("span");
            prioSpan.className =
            "px-2 py-0.5 rounded-full border text-xs " + getPriorityColor(task.priority);
            prioSpan.textContent = task.priority;

            const statusSpan = document.createElement("span");
            statusSpan.className =
            "px-2 py-0.5 rounded-full border text-xs " + getStatusColor(task.status);
            statusSpan.textContent = task.status;

            tags.appendChild(prioSpan);
            tags.appendChild(statusSpan);

            topRow.appendChild(titleDiv);
            topRow.appendChild(tags);

            const desc = document.createElement("p");
            desc.className = "text-xs text-gray-600 mt-1 whitespace-pre-wrap";
            desc.textContent = task.description || "No description";

            const bottomRow = document.createElement("div");
            bottomRow.className = "flex justify-between items-center mt-2";

            const dateDiv = document.createElement("div");
            dateDiv.className = "text-xs text-gray-500";
            dateDiv.textContent = "Due: " + formatDate(task.dueDate);

            const btnGroup = document.createElement("div");
            btnGroup.className = "flex gap-2";

            const editBtn = document.createElement("button");
            editBtn.className =
            "px-2 py-0.5 text-xs border rounded-md text-gray-600 hover:bg-gray-100";
            editBtn.textContent = "Edit";
            editBtn.addEventListener("click", () => handleEdit(task.id));

            const deleteBtn = document.createElement("button");
            deleteBtn.className =
            "px-2 py-0.5 text-xs border rounded-md text-red-600 hover:bg-red-50";
            deleteBtn.textContent = "Delete";
            deleteBtn.addEventListener("click", () => handleDelete(task.id));

            btnGroup.appendChild(editBtn);
            btnGroup.appendChild(deleteBtn);

            bottomRow.appendChild(dateDiv);
            bottomRow.appendChild(btnGroup);

            card.appendChild(topRow);
            card.appendChild(desc);
            card.appendChild(bottomRow);

            taskListEl.appendChild(card);
        });

        updateCounters();
    }

    function handleEdit(id) {
        const task = tasks.find((t) => t.id === id);
        if (!task) return;

        taskIdInput.value = task.id;
        titleInput.value = task.title;
        descriptionInput.value = task.description || "";
        dueDateInput.value = task.dueDate;
        priorityInput.value = task.priority;
        statusInput.value = task.status;

        formModeChip.textContent = "Edit Task";
        submitText.textContent = "Update Task";
    }

    function handleDelete(id) {
        if (!confirm("Delete this task?")) return;
        tasks = tasks.filter((t) => t.id !== id);
        saveTasks();
        renderTasks();
    }

    taskForm.addEventListener("submit", (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const data = {
        id: taskIdInput.value || Date.now().toString(),
        title: titleInput.value.trim(),
        description: descriptionInput.value.trim(),
        dueDate: dueDateInput.value,
        priority: priorityInput.value,
        status: statusInput.value,
        };

        if (taskIdInput.value) {
        tasks = tasks.map((t) => (t.id === data.id ? data : t));
        } else {
        tasks.push(data);
        }

        saveTasks();
        renderTasks();
        resetForm();
    });

    resetBtn.addEventListener("click", () => {
        resetForm();
    });

    window.handleEdit = handleEdit;
    window.handleDelete = handleDelete;
    
    loadTasks();
    renderTasks();
});
