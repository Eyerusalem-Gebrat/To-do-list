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

