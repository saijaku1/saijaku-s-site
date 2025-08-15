let tasks = [];

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasks() {
  const savedTasks = localStorage.getItem("tasks");
  if (savedTasks) {
    tasks = JSON.parse(savedTasks);
    tasks.forEach(task => {
      const taskItem = createTaskItem(task);
      document.querySelector("#taskList").append(taskItem);
    });
  }
}

function addTask() {
  const taskField = document.querySelector("#taskField");
  const timeField = document.querySelector("#timeField");
  const deadlineField = document.querySelector("#deadlineField");

  if (taskField.value !== "") {
    const task = {
      text: taskField.value,
      time: timeField.value ? timeField.value : 0,  // 時間が空の場合0分に設定
      deadline: deadlineField.value ? deadlineField.value : "未設定",  // 締切が空の場合「未設定」にする
      done: false
    };

    tasks.push(task);
    saveTasks();

    const taskItem = createTaskItem(task);
    document.querySelector("#taskList").append(taskItem);

    taskField.value = "";
    timeField.value = "";
    deadlineField.value = "";

    alert("タスクが追加されました！");
  } else {
    alert("タスク内容を入力してください！");
  }
}

function createTaskItem(task) {
  const taskItem = document.createElement("li");

  const taskContent = document.createElement("p");
  taskContent.textContent = `内容: ${task.text}`;
  taskItem.append(taskContent);

  if (task.time) {
    const timeContent = document.createElement("p");
    timeContent.textContent = `勉強時間: ${task.time} 分`;
    taskItem.append(timeContent);

    const timerButton = createButton("タイマー開始", "timerButton", () => {
      startTimer(task.time, taskItem);
    });
    taskItem.append(timerButton);
  }

  if (task.deadline) {
    const deadlineContent = document.createElement("p");
    deadlineContent.textContent = `締切: ${task.deadline}`;
    taskItem.append(deadlineContent);
  }

  if (!task.done) {
    const doneButton = createButton("完了", "doneButton", () => {
      taskItem.classList.add("done");
      task.done = true;
      saveTasks();
      doneButton.remove();
    });
    taskItem.append(doneButton);
  }

  const deleteButton = createButton("×", "deleteButton", () => {
    tasks = tasks.filter(t => t !== task);
    saveTasks();
    taskItem.remove();
  });
  taskItem.append(deleteButton);

  return taskItem;
}

function createButton(text, className, onClick) {
  const button = document.createElement("button");
  button.textContent = text;
  button.className = className;
  button.addEventListener("click", onClick);
  return button;
}

function startTimer(minutes, taskItem) {
  if (taskItem.getAttribute("data-timer-running") === "true") {
    alert("この宿題には既にタイマーが設定されています！");
    return;
  }

  taskItem.setAttribute("data-timer-running", "true");

  let timeLeft = minutes * 60;
  const timerDisplay = document.createElement("p");
  timerDisplay.classList.add("timerDisplay");
  taskItem.append(timerDisplay);

  const interval = setInterval(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `残り時間: ${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    timeLeft--;

    if (timeLeft < 0) {
      clearInterval(interval);
      timerDisplay.textContent = "タイムアップ！お疲れ様です！";
      alert(`宿題「${taskItem.querySelector("p").textContent}」の時間が終了しました！`);
      taskItem.removeAttribute("data-timer-running");
    }
  }, 1000);
}

function allDone() {
  tasks.forEach(task => task.done = true);
  saveTasks();
  document.querySelector("#taskList").innerHTML = "";
  loadTasks();
  alert("すべてのタスクが完了しました！");
}

function allDelete() {
  tasks = [];
  saveTasks();
  document.querySelector("#taskList").innerHTML = "";
  alert("すべてのタスクが削除されました！");
}

document.querySelector("#taskAddButton").addEventListener("click", addTask);
document.querySelector("#allDoneButton").addEventListener("click", allDone);
document.querySelector("#allDeleteButton").addEventListener("click", allDelete);

loadTasks();
