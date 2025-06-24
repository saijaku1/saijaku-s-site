const lanes = ['d', 'f', 'j', 'k'];
const laneElements = {
  d: document.getElementById('lane-d'),
  f: document.getElementById('lane-f'),
  j: document.getElementById('lane-j'),
  k: document.getElementById('lane-k')
};

const bgm = document.getElementById('bgm');
const scoreDisplay = document.getElementById('score');
const comboDisplay = document.getElementById('combo');
const judgementDisplay = document.getElementById('judgement');

const difficultySelect = document.getElementById('difficulty');
const startButton = document.getElementById('start-button');
const resultPanel = document.getElementById('result');
const finalScore = document.getElementById('final-score');
const maxComboDisplay = document.getElementById('max-combo');
const perfectCountDisplay = document.getElementById('perfect-count');
const goodCountDisplay = document.getElementById('good-count');
const missCountDisplay = document.getElementById('miss-count');
const restartButton = document.getElementById('restart-button');

const rankingList = document.getElementById('ranking-list');
const resetRankingBtn = document.getElementById('reset-ranking');

let score = 0;
let combo = 0;
let maxCombo = 0;
let perfectCount = 0;
let goodCount = 0;
let missCount = 0;
let notes = [];
let noteSpeed = 4000;
let startTime = 0;

startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', () => location.reload());
resetRankingBtn.addEventListener('click', () => {
  localStorage.removeItem('rhythmRanking');
  updateRanking();
});

document.addEventListener('keydown', (e) => {
  const key = e.key.toLowerCase();
  if (!lanes.includes(key)) return;

  const lane = laneElements[key];
  const activeNotes = [...lane.querySelectorAll('.note')];

  for (let note of activeNotes) {
    const rect = note.getBoundingClientRect();
    if (rect.top > 340 && rect.top < 380) {
      hitNote(note, 'perfect');
      return;
    } else if (rect.top >= 300 && rect.top <= 400) {
      hitNote(note, 'good');
      return;
    }
  }

  // ミス判定
  combo = 0;
  missCount++;
  updateDisplay();
  judgementDisplay.textContent = 'Miss';
});

function hitNote(note, type) {
  note.classList.add('hit-effect');
  setTimeout(() => note.remove(), 100);
  note.hit = true;

  if (type === 'perfect') {
    score += 100;
    perfectCount++;
    judgementDisplay.textContent = 'Perfect';
  } else if (type === 'good') {
    score += 50;
    goodCount++;
    judgementDisplay.textContent = 'Good';
  }

  combo++;
  if (combo > maxCombo) maxCombo = combo;
  updateDisplay();
}

function updateDisplay() {
  scoreDisplay.textContent = score;
  comboDisplay.textContent = combo;
}

function setDifficulty(level) {
  const settings = {
    easy: 5000,
    normal: 4000,
    hard: 3000,
    veryhard: 2000,
    oni: 1500
  };
  noteSpeed = settings[level] || 4000;
}

async function startGame() {
  const difficulty = difficultySelect.value;
  setDifficulty(difficulty);
  notes = await loadNotes();
  score = combo = maxCombo = perfectCount = goodCount = missCount = 0;
  updateDisplay();
  judgementDisplay.textContent = '---';

  startTime = performance.now();
  bgm.currentTime = 0;
  bgm.play();

  requestAnimationFrame(update);
  bgm.onended = showResult;
}

async function loadNotes() {
  const res = await fetch('./data/notes.json');
  const data = await res.json();
  return data;
}

function update(timestamp) {
  const currentTime = timestamp - startTime;

  while (notes.length && currentTime >= notes[0].time - noteSpeed) {
    const noteData = notes.shift();
    spawnNote(noteData.lane);
  }

  if (!bgm.paused) {
    requestAnimationFrame(update);
  }
}

function spawnNote(lane) {
  const note = document.createElement('div');
  note.classList.add('note');
  note.style.animationDuration = `${noteSpeed}ms`;
  laneElements[lane].appendChild(note);

  // Miss判定処理
  setTimeout(() => {
    if (!note.hit && document.body.contains(note)) {
      note.remove();
      missCount++;
      combo = 0;
      updateDisplay();
      judgementDisplay.textContent = 'Miss';
    }
  }, noteSpeed);
}

function showResult() {
  finalScore.textContent = score;
  maxComboDisplay.textContent = maxCombo;
  perfectCountDisplay.textContent = perfectCount;
  goodCountDisplay.textContent = goodCount;
  missCountDisplay.textContent = missCount;

  saveRanking(score);
  updateRanking();
  resultPanel.classList.add('show');
}

function saveRanking(score) {
  let rankings = JSON.parse(localStorage.getItem('rhythmRanking')) || [];
  rankings.push(score);
  rankings.sort((a, b) => b - a);
  rankings = rankings.slice(0, 5);
  localStorage.setItem('rhythmRanking', JSON.stringify(rankings));
}

function updateRanking() {
  const rankings = JSON.parse(localStorage.getItem('rhythmRanking')) || [];
  rankingList.innerHTML = '';
  rankings.forEach((score, i) => {
    const li = document.createElement('li');
    li.textContent = `${i + 1}. ${score}点`;
    rankingList.appendChild(li);
  });
}
