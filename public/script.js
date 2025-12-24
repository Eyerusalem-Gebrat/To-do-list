const API_URL = "http://localhost:3000/todos";
const taskList = document.getElementById("taskList");
const completedList = document.getElementById("completedList");
const addTaskBtn = document.getElementById("addTaskBtn");
const modal = document.getElementById("taskModal");
const closeModal = document.getElementById("closeModal");
const cancelBtn = document.getElementById("cancelBtn");

addTaskBtn.addEventListener("click", () => {
  modal.classList.add("active");
});

closeModal.addEventListener("click", () => {
  modal.classList.remove("active");
});

cancelBtn.addEventListener("click", () => {
  modal.classList.remove("active");
});

modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.classList.remove("active");
  }
});

async function fetchTasks() {
  try {
    const response = await fetch(API_URL);
    const tasks = await response.json();
    renderTasks(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
  }
}

function renderTasks(tasks) {
  taskList.innerHTML = "";
  completedList.innerHTML = "";

  tasks.forEach(task => {
    const card = document.createElement("div");
    card.className = "task-card"; 
    card.innerHTML = `
      <h3>${task.title}</h3>
      <p>${task.description || ""}</p>
      <span>Category: ${task.category}</span>
      <span>Due: ${task.dueDate}</span>
      <div class="task-actions">
        <label>
          <input type="checkbox" ${task.completed ? "checked" : ""}> Completed
        </label>
        <button class="delete-btn">Delete</button>
      </div>
    `;
    card.querySelector("input").addEventListener("change", (e) => {
      toggleTask(task.id, e.target.checked);
    });
    card.querySelector(".delete-btn").addEventListener("click", () => {
      deleteTask(task.id);
    });
    if (task.completed) {
      completedList.appendChild(card);
    } else {
      taskList.appendChild(card);
    }
  });
}

async function toggleTask(id, completed) {
  console.log("Toggling task:", id, "Completed:", completed);
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed })
    });
    console.log("Response:", res.status);
    fetchTasks(); // Refresh UI
  } catch (error) {
    console.error("Error updating task:", error);
  }
}


async function deleteTask(id) {
  console.log("Deleting task:", id);
  try {
    const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    console.log("Response:", res.status);
    fetchTasks();
  } catch (error) {
    console.error("Error deleting task:", error);
  }
}

fetchTasks();

const taskForm = document.querySelector(".task-form");

taskForm.addEventListener("submit", async (e) => {
  e.preventDefault(); // prevent page reload

  const title = taskForm.querySelector("input[type=text]").value;
  const description = taskForm.querySelector("textarea").value;
  const category = taskForm.querySelector("select").value;
  const dueDate = taskForm.querySelector("input[type=date]").value;

  if (!title || !category || !dueDate) return; // required fields

  const newTask = {
    title,
    description,
    category,
    dueDate,
    completed: false
  };

  try {
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTask)
    });

    fetchTasks(); // refresh UI
    modal.classList.remove("active"); // close modal
    taskForm.reset(); // clear form
  } catch (error) {
    console.error("Error creating task:", error);
  }
});

const searchInput = document.querySelector(".search");
searchInput.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase();
  filterTasks(query);
});

searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    const query = searchInput.value.toLowerCase();
    filterTasks(query);
  }
});

const categorySelect = document.querySelector(".category-select");
searchInput.addEventListener("input", filterTasks);
categorySelect.addEventListener("change", filterTasks);

function filterTasks() {
  const searchText = searchInput.value.toLowerCase();
  const selectedCategory = categorySelect.value;

  fetch(API_URL)
    .then(res => res.json())
    .then(tasks => {
      let filtered = tasks;
      if (searchText) {
        filtered = filtered.filter(task =>
          task.title.toLowerCase().includes(searchText)
        );
      }
      if (selectedCategory && selectedCategory !== "All Categories") {
        filtered = filtered.filter(task => task.category === selectedCategory);
      }

      renderTasks(filtered);
    });
}

const themeToggle = document.getElementById("themeToggle");
const body = document.body;
const icon = themeToggle.querySelector("svg");

/* Apply saved theme on load */
function applyTheme() {
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "dark") {
    body.classList.add("dark-mode");
    icon.innerHTML = `
      <path d="M12 3v2M12 19v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 8a4 4 0 100 8 4 4 0 000-8z"
            stroke="currentColor" stroke-width="2"/>
    `;
  } else {
    body.classList.remove("dark-mode");
    icon.innerHTML = `
      <path d="M21 12.79A9 9 0 0111.21 3 7 7 0 1019 14.79z"
            stroke="currentColor" stroke-width="2"/>
    `;
  }
}

applyTheme();

/* Toggle theme */
themeToggle.addEventListener("click", () => {
  body.classList.toggle("dark-mode");

  const isDark = body.classList.contains("dark-mode");
  localStorage.setItem("theme", isDark ? "dark" : "light");

  applyTheme();
});


const sortSelect = document.querySelectorAll(".sorting select")[0];

sortSelect.addEventListener("change", () => {
  const sortValue = sortSelect.value;

  fetch(API_URL)
    .then(res => res.json())
    .then(tasks => {
      let sortedTasks = [...tasks];

      switch (sortValue) {
        case "Due Date (Earliest)":
          sortedTasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
          break;
        case "Due Date (Latest)":
          sortedTasks.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));
          break;
        case "Title(A-Z)":
          sortedTasks.sort((a, b) => a.title.localeCompare(b.title));
          break;
        case "Title(Z-A)":
          sortedTasks.sort((a, b) => b.title.localeCompare(a.title));
          break;
        default:
          break;
      }

      renderTasks(sortedTasks);
    });
});

