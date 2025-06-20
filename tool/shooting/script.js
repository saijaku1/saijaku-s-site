const gameWidth = 600;
const gameHeight = 600;
const playerWidth = 40;
const playerHeight = 40;

const gameArea = document.getElementById("gameArea");
const playerElem = document.getElementById("player");
const scoreElem = document.getElementById("score");
const levelElem = document.getElementById("level");
const heartsElem = document.getElementById("hearts");
const messageElem = document.getElementById("message");
const startButton = document.getElementById("startButton");
const superShotBar = document.getElementById("superShotBar");
const rankingElem = document.getElementById("ranking");
const clearRankingBtn = document.getElementById("clearRankingBtn");

let playerX = (gameWidth - playerWidth) / 2;
let playerY = gameHeight - playerHeight - 20;

let keysPressed = {};
let bullets = [];
let enemies = [];
let enemyBullets = [];
let score = 0;
let level = 1;
let lives = 15;
let gameRunning = false;
let enemySpawnTimer = null;
let animationFrameId = null;

// --- 必殺技関連 ---
let superShotReady = false;
let superShotGauge = 0;
const maxSuperShotGauge = 100;
let superShotActive = false;
const superShotDuration = 3000;
let superShotTimeoutId = null;

// --- ランキング ---
const RANKING_KEY = "myGameRanking";

// 初期表示
updateUI();
showRanking();

function updateUI() {
  scoreElem.textContent = `スコア: ${score}`;
  levelElem.textContent = `レベル: ${level}`;
  updateHearts();
  updateSuperShotBar();
}

function updateHearts() {
  heartsElem.innerHTML = "";
  for (let i = 0; i < lives; i++) {
    const heart = document.createElement("div");
    heart.className = "heart";
    heartsElem.appendChild(heart);
  }
}

function updateSuperShotBar() {
  if (superShotBar) {
    superShotBar.style.width = (superShotGauge / maxSuperShotGauge) * 100 + "%";
  }
}

function increaseSuperShotGauge(amount = 10) {
  if (superShotActive) return;
  superShotGauge += amount;
  if (superShotGauge >= maxSuperShotGauge) {
    superShotGauge = maxSuperShotGauge;
    superShotReady = true;
    messageElem.textContent = "必殺技が使用可能！スペースキーで発動";
  }
  updateSuperShotBar();
}

function activateSuperShot() {
  if (superShotActive || !superShotReady) return;
  superShotActive = true;
  superShotReady = false;
  superShotGauge = 0;
  updateSuperShotBar();
  messageElem.textContent = "必殺技発動！";

  const intervalId = setInterval(() => {
    if (!superShotActive) {
      clearInterval(intervalId);
      return;
    }
    // 強力ショット
    bullets.push({
      x: playerX + Math.random() * 100,
      y: playerY - 20,
      speed: 30,
      power: 20,
      elem: null,
      width: 30,
    });
    playSound("shoot");
  }, 10);

  superShotTimeoutId = setTimeout(() => {
    superShotActive = false;
    messageElem.textContent = "";
    clearInterval(intervalId);
  }, superShotDuration);
}

// 敵の種類バリエーション用カラークラス
const enemyTypes = ["enemy1", "enemy2", "enemy3"];

// 敵弾の発射間隔（ミリ秒）ランダムに調整
const enemyBulletIntervalMin = 500;
const enemyBulletIntervalMax = 2500;

// 初期設定
function initGame() {
  playerX = (gameWidth - playerWidth) / 2;
  lives = 15;
  score = 0;
  level = 1;
  bullets = [];
  enemies = [];
  enemyBullets = [];
  gameRunning = true;
  superShotGauge = 0;
  superShotReady = false;
  superShotActive = false;
  messageElem.textContent = "";
  updateUI();
  playerElem.style.left = playerX + "px";
  playerElem.style.bottom = "20px";
  playerElem.classList.remove("player-hit");

  if (enemySpawnTimer) clearInterval(enemySpawnTimer);
  enemySpawnTimer = setInterval(spawnEnemy, Math.max(300 - level * 15,10));
  spawnEnemy(); // 最初に敵をすぐ生成
  gameLoop();
}

// 敵をスポーンさせる関数
function spawnEnemy() {
  if (!gameRunning) return;
  // 敵数はレベルにより最大増加
  if (enemies.length >= Math.min(80 + level, 120)) return;

  const enemyX = Math.random() * (gameWidth - 20);
  const enemyY = -40;
  const enemyTypeIndex = Math.floor(Math.random() * enemyTypes.length);
  const enemy = {
    x: enemyX,
    y: enemyY,
    width: 40,
    height: 40,
    speedY: 1 + level * 0.1,
    speedX: (Math.random() - 0.5) * 1.5,
    elem: null,
    hp: level,
    type: enemyTypes[enemyTypeIndex],
    lastShotTime: 0,
    shotInterval:
      enemyBulletIntervalMin +
      Math.random() * (enemyBulletIntervalMax - enemyBulletIntervalMin),
  };
  enemies.push(enemy);
}

// ゲームループ
function gameLoop() {
  if (!gameRunning) return;

  // プレイヤー移動
  if (keysPressed["ArrowLeft"]) playerX -= 7;
  if (keysPressed["ArrowRight"]) playerX += 7;
  if (playerX < 0) playerX = 0;
  if (playerX > gameWidth - playerWidth) playerX = gameWidth - playerWidth;
  playerElem.style.left = playerX + "px";

  // 弾発射
  if (keysPressed["z"] || keysPressed["Z"]) {
    fireBullet();
  }

  // 必殺技発動判定
  if (keysPressed[" "]) {
    activateSuperShot();
  }

  // 弾の更新
  updateBullets();

  // 敵の更新
  updateEnemies();

  // 敵弾の更新
  updateEnemyBullets();

  // 衝突判定
  checkCollisions();

  // レベルアップ判定（スコアで）
  checkLevelUp();

  updateUI();

  animationFrameId = requestAnimationFrame(gameLoop);
}

// プレイヤー弾発射制御用変数
let lastBulletTime = 0;
const bulletCooldown = 150; // ミリ秒

function fireBullet() {
  const now = Date.now();
  if (now - lastBulletTime < bulletCooldown) return;
  lastBulletTime = now;
  bullets.push({
    x: playerX + 18,
    y: playerY - 10,
    speed: 15,
    power: 1 + level,
    elem: null,
    width: 10,
  });
  playSound("shoot");
}

// 弾の更新
function updateBullets() {
  bullets.forEach((b, i) => {
    b.y -= b.speed;
    if (!b.elem) {
      b.elem = document.createElement("div");
      b.elem.className = "bullet";
      gameArea.appendChild(b.elem);
    }
    b.elem.style.left = b.x + "px";
    b.elem.style.top = b.y + "px";
    if (b.y < -10) {
      // 画面外になったら消す
      if (b.elem) gameArea.removeChild(b.elem);
      bullets.splice(i, 1);
    }
  });
}

// 敵の更新
function updateEnemies() {
  const now = Date.now();
  enemies.forEach((enemy, i) => {
    enemy.x += enemy.speedX;
    enemy.y += enemy.speedY;

    // 横の壁で反転
    if (enemy.x < 0 || enemy.x > gameWidth - enemy.width) enemy.speedX *= -1;

    if (!enemy.elem) {
      enemy.elem = document.createElement("div");
      enemy.elem.className = "enemy " + enemy.type;
      gameArea.appendChild(enemy.elem);
    }
    enemy.elem.style.left = enemy.x + "px";
    enemy.elem.style.top = enemy.y + "px";

    // 敵が画面外に出たらライフ減少
    if (enemy.y > gameHeight) {
      lives--;
      damagePlayer();
      removeEnemy(i);
    }

    // 敵が攻撃（敵弾発射）
    if (now - enemy.lastShotTime > enemy.shotInterval) {
      enemy.lastShotTime = now;
      enemyBullets.push({
        x: enemy.x + enemy.width / 2 - 3,
        y: enemy.y + enemy.height,
        speed: 6 + level * 0.3,
        elem: null,
      });
      playSound("enemyShoot");
    }
  });
}

// 敵を削除し画面からも消す
function removeEnemy(i) {
  const enemy = enemies[i];
  if (enemy && enemy.elem) {
    gameArea.removeChild(enemy.elem);
  }
  enemies.splice(i, 1);
}

// 敵弾更新
function updateEnemyBullets() {
  enemyBullets.forEach((b, i) => {
    b.y += b.speed;
    if (!b.elem) {
      b.elem = document.createElement("div");
      b.elem.className = "enemyBullet";
      gameArea.appendChild(b.elem);
    }
    b.elem.style.left = b.x + "px";
    b.elem.style.top = b.y + "px";
    if (b.y > gameHeight + 10) {
      if (b.elem) gameArea.removeChild(b.elem);
      enemyBullets.splice(i, 1);
    }
  });
}

// 衝突判定
function checkCollisions() {
  // 弾と敵の当たり判定
  bullets.forEach((b, bi) => {
    enemies.forEach((enemy, ei) => {
      if (isColliding(b, enemy)) {
        // ダメージ処理
        enemy.hp -= b.power;
        if (enemy.hp <= 0) {
          score += 100 * level;
          removeEnemy(ei);
          increaseSuperShotGauge(40);
        } else {
          score += 50;
          increaseSuperShotGauge(15);
        }
        // 弾は消える
        if (b.elem) gameArea.removeChild(b.elem);
        bullets.splice(bi, 1);
      }
    });
  });

  // 敵弾とプレイヤーの当たり判定
  enemyBullets.forEach((b, bi) => {
    const playerRect = {
      x: playerX,
      y: playerY,
      width: playerWidth,
      height: playerHeight,
    };
    if (isColliding(b, playerRect)) {
      // ダメージ処理
      lives--;
      damagePlayer();
      if (b.elem) gameArea.removeChild(b.elem);
      enemyBullets.splice(bi, 1);
    }
  });
}

// プレイヤーダメージ処理
function damagePlayer() {
  if (lives <= 0) {
    gameOver();
    return;
  }
  playerElem.classList.add("player-hit");
  setTimeout(() => {
    playerElem.classList.remove("player-hit");
  }, 500);
}

// 矩形同士の当たり判定簡易版
function isColliding(a, b) {
  const ax = a.x,
    ay = a.y,
    aw = a.width || 4,
    ah = a.height || 10;
  const bx = b.x,
    by = b.y,
    bw = b.width,
    bh = b.height;
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

// レベルアップ判定
function checkLevelUp() {
  const nextLevelScore = level * 1000;
  if (score >= nextLevelScore) {
    level++;
    messageElem.textContent = `レベルアップ！レベル ${level}`;
    // 敵スポーン速度アップ
    clearInterval(enemySpawnTimer);
    enemySpawnTimer = setInterval(
      spawnEnemy,
      Math.max(2000 - level * 300, 600)
    );
    setTimeout(() => {
      if (messageElem.textContent.startsWith("レベルアップ"))
        messageElem.textContent = "";
    }, 3000);
  }
}

// ゲームオーバー処理
function gameOver() {
  gameRunning = false;
  messageElem.textContent =
    "ゲームオーバー！スコアをランキングに登録しました。";
  if (enemySpawnTimer) clearInterval(enemySpawnTimer);
  if (animationFrameId) cancelAnimationFrame(animationFrameId);

  // 全エレメントクリア
  bullets.forEach((b) => b.elem && gameArea.removeChild(b.elem));
  enemies.forEach((e) => e.elem && gameArea.removeChild(e.elem));
  enemyBullets.forEach((b) => b.elem && gameArea.removeChild(b.elem));
  bullets = [];
  enemies = [];
  enemyBullets = [];

  // ランキング登録
  saveRanking(score);
  showRanking();

  startButton.disabled = false;
}

// ランキング保存
function saveRanking(score) {
  let ranking = JSON.parse(localStorage.getItem(RANKING_KEY)) || [];
  ranking.push({ score: score, date: new Date().toISOString() });
  ranking.sort((a, b) => b.score - a.score);
  if (ranking.length > 10) ranking = ranking.slice(0, 10);
  localStorage.setItem(RANKING_KEY, JSON.stringify(ranking));
}

// ランキング表示
function showRanking() {
  let ranking = JSON.parse(localStorage.getItem(RANKING_KEY)) || [];
  const listElem = rankingElem.querySelector("ul");
  if (listElem) listElem.remove();
  if (ranking.length === 0) {
    rankingElem.querySelector("p").style.display = "block";
    return;
  }
  rankingElem.querySelector("p").style.display = "none";
  const ul = document.createElement("ul");
  ranking.forEach((item, i) => {
    const li = document.createElement("li");
    const date = new Date(item.date);
    li.textContent = `${i + 1}位: ${
      item.score
    }点 (${date.toLocaleDateString()} ${date.toLocaleTimeString()})`;
    ul.appendChild(li);
  });
  rankingElem.appendChild(ul);
}

// ランキングリセット
clearRankingBtn.addEventListener("click", () => {
  if (confirm("ランキングをリセットしますか？")) {
    localStorage.removeItem(RANKING_KEY);
    showRanking();
  }
});

// キー入力管理
window.addEventListener("keydown", (e) => {
  keysPressed[e.key] = true;
  if (e.key === " " || e.key === "Spacebar") e.preventDefault();
});
window.addEventListener("keyup", (e) => {
  keysPressed[e.key] = false;
});

// スタートボタン
startButton.addEventListener("click", () => {
  startButton.disabled = true;
  initGame();
});

// 簡易音再生（効果音）
function playSound(type) {
  // Web Audio APIを使う簡易ビープ音
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!playSound.ctx) playSound.ctx = new AudioContext();
    const ctx = playSound.ctx;

    let osc = ctx.createOscillator();
    let gainNode = ctx.createGain();
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    switch (type) {
      case "shoot":
        osc.frequency.value = 800;
        gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
        break;
      case "enemyShoot":
        osc.frequency.value = 300;
        gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
        break;
      default:
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    }

    osc.type = "square";
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
    osc.onended = () => {
      osc.disconnect();
      gainNode.disconnect();
    };
  } catch (e) {
    // 音が鳴らない環境もあるので無視
  }
}
