const saveSubjectBtn = document.getElementById('save-subject-btn');
const subjectNameInput = document.getElementById('subject-name');
const subjectGoalInput = document.getElementById('subject-goal');
const subjectProgressInput = document.getElementById('subject-progress');
const subjectDueDateInput = document.getElementById('subject-due-date');
const subjectList = document.getElementById('subject-items');
const progressChartCanvas = document.getElementById('progress-chart');

let subjects = JSON.parse(localStorage.getItem('subjects')) || [];

// 保存ボタン
saveSubjectBtn.addEventListener('click', () => {
  const name = subjectNameInput.value;
  const goal = subjectGoalInput.value;
  const progress = parseInt(subjectProgressInput.value, 10);
  const dueDate = subjectDueDateInput.value;

  if (name && goal && !isNaN(progress) && dueDate) {
    const newSubject = {
      id: Date.now(),
      name,
      goal,
      progress,
      due_date: dueDate
    };

    subjects.push(newSubject);
    saveSubjectsToLocalStorage();
    clearSubjectForm();
    displaySubjects();
    updateProgressChart();
  } else {
    alert('すべての項目を入力してください。');
  }
});

// フォームクリア
function clearSubjectForm() {
  subjectNameInput.value = '';
  subjectGoalInput.value = '';
  subjectProgressInput.value = '';
  subjectDueDateInput.value = '';
}

// 表示
function displaySubjects() {
  subjectList.innerHTML = '';
  subjects.forEach(subject => {
    const li = document.createElement('li');
    li.classList.add('subject-item');

    li.innerHTML = `
      <span>${subject.name} - 目標: ${subject.goal} - 進捗: ${subject.progress}%</span>
      <button class="edit-btn" data-id="${subject.id}">編集</button>
      <button class="delete-btn" data-id="${subject.id}">削除</button>
    `;

    subjectList.appendChild(li);

    const editBtn = li.querySelector('.edit-btn');
    editBtn.addEventListener('click', () => editSubject(subject.id));

    const deleteBtn = li.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', () => deleteSubject(subject.id));
  });
}

// 削除
function deleteSubject(subjectId) {
  subjects = subjects.filter(subject => subject.id !== subjectId);
  saveSubjectsToLocalStorage();
  displaySubjects();
  updateProgressChart();
}

// 編集
function editSubject(subjectId) {
  const subject = subjects.find(subject => subject.id === subjectId);

  if (subject) {
    subjectNameInput.value = subject.name;
    subjectGoalInput.value = subject.goal;
    subjectProgressInput.value = subject.progress;
    subjectDueDateInput.value = subject.due_date;

    saveSubjectBtn.textContent = '更新';
    saveSubjectBtn.removeEventListener('click', saveSubject);
    saveSubjectBtn.addEventListener('click', () => updateSubject(subjectId));
  }
}

// 更新
function updateSubject(subjectId) {
  const subjectIndex = subjects.findIndex(subject => subject.id === subjectId);

  if (subjectIndex !== -1) {
    const updatedSubject = {
      id: subjectId,
      name: subjectNameInput.value,
      goal: subjectGoalInput.value,
      progress: parseInt(subjectProgressInput.value, 10),
      due_date: subjectDueDateInput.value
    };

    subjects[subjectIndex] = updatedSubject;
    saveSubjectsToLocalStorage();
    clearSubjectForm();
    displaySubjects();
    updateProgressChart();
  }
}

// ローカルストレージ保存
function saveSubjectsToLocalStorage() {
  localStorage.setItem('subjects', JSON.stringify(subjects));
}

// グラフ更新
function updateProgressChart() {
  const progressData = subjects.map(subject => subject.progress);

  new Chart(progressChartCanvas, {
    type: 'bar',
    data: {
      labels: subjects.map(subject => subject.name),
      datasets: [{
        label: '進捗状況',
        data: progressData,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

// 初期ロード
window.onload = function() {
  displaySubjects();
  updateProgressChart();
};
