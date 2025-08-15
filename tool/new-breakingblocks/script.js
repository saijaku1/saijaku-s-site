const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const hud = {
  score: document.getElementById("score"),
  health: document.getElementById("health"),
  ammo: document.getElementById("ammo"),
  weapon: document.getElementById("weaponName"),
  stage: document.getElementById("stageNum"),
};
const reloadBtn = document.getElementById("reloadBtn");
const weaponSelect = document.getElementById("weaponSelect");

let gameState = "title";
let player, bullets, enemyBullets, enemies, boss, items, particles, walls;
let score = 0,
  stageNum = 1;
let currentWeaponIndex = 0,
  currentAmmo = 0,
  lastShotTime = 0,
  lastSkillTime = 0;
const skillCooldown = 10000;
const mapSize = { w: 2000, h: 2000 };
let keys = {};
let lastHitTime = 0;
const hitCooldown = 1000;
let mouseX = canvas.width / 2;
let mouseY = canvas.height / 2;

canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;
});


const weapons = [
  {
    name: "ピストル",
    maxAmmo: 20,
    reloadTime: 1000,
    shotDelay: 500,
    power: 1.5,
    type: "normal",
    sound: "pistol.mp3",
  },
  {
    name: "ライフル",
    maxAmmo: 50,
    reloadTime: 2000,
    shotDelay: 100,
    power: 1,
    type: "normal",
    sound: "rifle.mp3",
  },
  {
    name: "ショットガン",
    maxAmmo: 5,
    reloadTime: 1500,
    shotDelay: 800,
    power: 8,
    type: "spread",
    sound: "shotgun.mp3",
  },
  {
    name: "貫通弾",
    maxAmmo: 15,
    reloadTime: 1500,
    shotDelay: 600,
    power: 2.5,
    type: "pierce",
    sound: "powerup.mp3",
  },
  {
    name: "爆発弾",
    maxAmmo: 7,
    reloadTime: 2000,
    shotDelay: 1000,
    power: 2,
    type: "explosive",
    sound: "powerup.mp3",
  },
];

function initGame() {
  player = { worldX: 1000, worldY: 1000, size: 20, speed: 4, health: 100 };
  bullets = [];
  enemyBullets = [];
  enemies = [];
  boss = null;
  items = [];
  particles = [];
  walls = [];
  score = 0;
  stageNum = 1;
  currentWeaponIndex = 0;
  currentAmmo = weapons[0].maxAmmo;
  spawnEnemies(5);
  spawnWalls(15);
}

document.addEventListener("keydown", (e) => {
  keys[e.key] = true;
  if (gameState === "title" && e.key === "Enter") {
    gameState = "playing";
    initGame();
  }
  if (gameState === "gameover" && e.key === "Enter") {
    gameState = "title";
  }
});
document.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});
canvas.addEventListener("click", () => {
  if (gameState === "playing") shoot();
});
reloadBtn.onclick = reloadAmmo;
weaponSelect.onchange = (e) => {
  currentWeaponIndex = Number(e.target.value);
  currentAmmo = weapons[currentWeaponIndex].maxAmmo;
};

weapons.forEach((w, i) => {
  const opt = document.createElement("option");
  opt.value = i;
  opt.textContent = w.name;
  weaponSelect.appendChild(opt);
});

requestAnimationFrame(loop);
function loop() {
  if (gameState === "playing") update();
  draw();
  requestAnimationFrame(loop);
}

function update() {
  const now = Date.now();
  const dx = (keys["d"] ? 1 : 0) - (keys["a"] ? 1 : 0);
  const dy = (keys["s"] ? 1 : 0) - (keys["w"] ? 1 : 0);
  movePlayer(dx, dy);

  bullets.forEach((b, i) => {
    b.x += Math.cos(b.angle) * b.speed;
    b.y += Math.sin(b.angle) * b.speed;
    if (b.explosive && --b.lifetime <= 0) {
      explode(b);
      bullets.splice(i, 1);
    } else if (b.x < 0 || b.x > mapSize.w || b.y < 0 || b.y > mapSize.h) {
      bullets.splice(i, 1);
    }
  });

  enemies.forEach((e, ei) => {
    const angle = Math.atan2(player.worldY - e.y, player.worldX - e.x);
    e.x += Math.cos(angle) * e.speed;
    e.y += Math.sin(angle) * e.speed;

    bullets.forEach((b, bi) => {
      const dx = e.x - b.x,
        dy = e.y - b.y;
      if (dx * dx + dy * dy < e.size * e.size) {
        e.hp -= weapons[currentWeaponIndex].power;
        if (b.type !== "pierce") bullets.splice(bi, 1);
        playSound("hit.mp3");
        if (e.hp <= 0) {
          enemies.splice(ei, 1);
          score += 10;
          dropItem(e.x, e.y);
        }
      }
    });

    const pdx = e.x - player.worldX,
      pdy = e.y - player.worldY;
    if (pdx * pdx + pdy * pdy < (e.size + player.size) ** 2) {
      if (now - lastHitTime > hitCooldown) {
        player.health -= 5;
        lastHitTime = now;
        if (player.health <= 0) gameOver();
      }
    }
  });

  items.forEach((it, ii) => {
    const dx = it.x - player.worldX,
      dy = it.y - player.worldY;
    if (dx * dx + dy * dy < (player.size + 10) ** 2) {
      applyItem(it);
      items.splice(ii, 1);
    }
  });

  if (boss) {
    const angle = Math.atan2(player.worldY - boss.y, player.worldX - boss.x);
    boss.x += Math.cos(angle) * boss.speed;
    boss.y += Math.sin(angle) * boss.speed;

    if (now - boss.lastShot > 1000) {
      boss.lastShot = now;
      enemyBullets.push({ x: boss.x, y: boss.y, angle, speed: 6, size: 8 });
    }

    bullets.forEach((b, bi) => {
      const dx = boss.x - b.x,
        dy = boss.y - b.y;
      if (dx * dx + dy * dy < boss.size * boss.size) {
        boss.hp -= weapons[currentWeaponIndex].power;
        if (b.type !== "pierce") bullets.splice(bi, 1);
        playSound("hit.mp3");
        if (boss.hp <= 0) {
          boss = null;
          score += 200;
          stageNum++;
          spawnEnemies(5 + stageNum * 2);
        }
      }
    });

    const pdx = boss.x - player.worldX,
      pdy = boss.y - player.worldY;
    if (pdx * pdx + pdy * pdy < (boss.size + player.size) ** 2) {
      if (now - lastHitTime > hitCooldown) {
        player.health -= 10;
        lastHitTime = now;
        if (player.health <= 0) gameOver();
      }
    }
  }

  if (enemies.length === 0 && !boss) {
    if (stageNum % 3 === 0) spawnBoss();
    else spawnEnemies(5 + stageNum * 2);
  }

  enemyBullets.forEach((b, i) => {
    b.x += Math.cos(b.angle) * b.speed;
    b.y += Math.sin(b.angle) * b.speed;
    const dx = b.x - player.worldX,
      dy = b.y - player.worldY;
    if (dx * dx + dy * dy < player.size * player.size) {
      player.health -= 10;
      enemyBullets.splice(i, 1);
      if (player.health <= 0) gameOver();
    }
  });

  if (keys[" "] && now - lastSkillTime > skillCooldown) {
    lastSkillTime = now;
    enemies.forEach((e) => (e.hp = 0));
    if (boss) boss.hp -= 10;
    playSound("powerup.mp3");
    particles.push({
      x: player.worldX,
      y: player.worldY,
      life: 30,
      color: "white",
    });
  }

  particles = particles.filter((p) => --p.life > 0);

  hud.score.textContent = score;
  hud.health.textContent = player.health;
  hud.ammo.textContent = currentAmmo;
  hud.weapon.textContent = weapons[currentWeaponIndex].name;
  hud.stage.textContent = stageNum;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (gameState === "title") drawTitle();
  else if (gameState === "gameover") drawGameOver();
  else if (gameState === "playing") drawGame();
}

function drawTitle() {
  ctx.fillStyle = "white";
  ctx.font = "30px sans-serif";
  ctx.fillText(
    "New シューティング",
    canvas.width / 2 - 120,
    canvas.height / 2 - 30
  );
  ctx.font = "20px sans-serif";
  ctx.fillText(
    "Enterキーでスタート",
    canvas.width / 2 - 80,
    canvas.height / 2 + 10
  );
  getRanks().forEach((s, i) =>
    ctx.fillText(
      `TOP${i + 1}: ${s}`,
      canvas.width / 2 - 50,
      canvas.height / 2 + 40 + i * 20
    )
  );
}

function drawGameOver() {
  ctx.fillStyle = "red";
  ctx.font = "30px sans-serif";
  ctx.fillText("Game Over", canvas.width / 2 - 70, canvas.height / 2);
  ctx.font = "20px sans-serif";
  ctx.fillText(
    `スコア: ${score}`,
    canvas.width / 2 - 40,
    canvas.height / 2 + 30
  );
  ctx.fillText(
    "Enterキーでタイトルへ",
    canvas.width / 2 - 90,
    canvas.height / 2 + 60
  );
}

function drawGame() {
  const ox = player.worldX - canvas.width / 2,
    oy = player.worldY - canvas.height / 2;
  ctx.fillStyle = "#444";
  ctx.fillRect(-ox, -oy, mapSize.w, mapSize.h);
  ctx.fillStyle = "#888";
  walls.forEach((w) => ctx.fillRect(w.x - ox, w.y - oy, w.w, w.h));
  ctx.fillStyle = "yellow";
  bullets.forEach((b) => {
    ctx.beginPath();
    ctx.arc(b.x - ox, b.y - oy, 9, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.fillStyle = "orange";
  enemyBullets.forEach((b) => {
    ctx.beginPath();
    ctx.arc(b.x - ox, b.y - oy, b.size || 9, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.fillStyle = "red";
  enemies.forEach((e) => {
    ctx.beginPath();
    ctx.arc(e.x - ox, e.y - oy, e.size, 0, Math.PI * 2);
    ctx.fill();
  });
  if (boss) {
    ctx.fillStyle = "purple";
    ctx.beginPath();
    ctx.arc(boss.x - ox, boss.y - oy, boss.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "lime";
  items.forEach((it) => {
    ctx.beginPath();
    ctx.arc(it.x - ox, it.y - oy, 8, 0, Math.PI * 2);
    ctx.fill();
  });
  particles.forEach((p) => {
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - ox - 2, p.y - oy - 2, 4, 4);
  });
  ctx.fillStyle = "cyan";
  ctx.beginPath();
  ctx.arc(canvas.width / 2, canvas.height / 2, player.size, 0, Math.PI * 2);
  ctx.fill();
  drawMinimap();
}

function shoot() {
  const now = Date.now();
  const w = weapons[currentWeaponIndex];
  if (now - lastShotTime < w.shotDelay) return;
  if (currentAmmo <= 0) {
    alert("弾切れ！リロードしてください");
    return;
  }
  lastShotTime = now;
  currentAmmo--;
  playSound(w.sound);

  // プレイヤーの中心からマウス位置への角度を計算
  const angle = Math.atan2(
    mouseY - canvas.height / 2,
    mouseX - canvas.width / 2
  );

  if (w.type === "spread")
    [-0.2, 0, 0.2].forEach((d) =>
      bullets.push({
        x: player.worldX,
        y: player.worldY,
        angle: angle + d,
        speed: 6,
      })
    );
  else if (w.type === "pierce")
    bullets.push({
      x: player.worldX,
      y: player.worldY,
      angle,
      speed: 6,
      type: "pierce",
    });
  else if (w.type === "explosive")
    bullets.push({
      x: player.worldX,
      y: player.worldY,
      angle,
      speed: 5,
      explosive: true,
      lifetime: 50,
    });
  else bullets.push({ x: player.worldX, y: player.worldY, angle, speed: 6 });
}


function reloadAmmo() {
  reloadBtn.disabled = true;
  playSound("reload.mp3");
  setTimeout(() => {
    currentAmmo = weapons[currentWeaponIndex].maxAmmo;
    reloadBtn.disabled = false;
  }, weapons[currentWeaponIndex].reloadTime);
}

function movePlayer(dx, dy) {
  const nx = player.worldX + dx * player.speed;
  const ny = player.worldY + dy * player.speed;
  const collides = walls.some(
    (w) => nx > w.x && nx < w.x + w.w && ny > w.y && ny < w.y + w.h
  );
  if (!collides && nx >= 0 && ny >= 0 && nx <= mapSize.w && ny <= mapSize.h) {
    player.worldX = nx;
    player.worldY = ny;
  }
}

function spawnEnemies(n) {
  for (let i = 0; i < n; i++) {
    enemies.push({
      x: Math.random() * mapSize.w,
      y: Math.random() * mapSize.h,
      size: 15,
      speed: 4 + Math.random(),
      hp: 6,
    });
  }
}

function spawnBoss() {
  boss = {
    x: Math.random() * mapSize.w,
    y: Math.random() * mapSize.h,
    size: 40,
    speed: 1,
    hp: 30 + stageNum * 10,
    lastShot: 0,
  };
  playSound("boss.mp3");
}

function spawnWalls(n) {
  for (let i = 0; i < n; i++) {
    walls.push({
      x: Math.random() * mapSize.w,
      y: Math.random() * mapSize.h,
      w: 50,
      h: 50,
    });
  }
}

function dropItem(x, y) {
  if (Math.random() < 0.3) {
    const types = ["heal", "ammo", "power"];
    items.push({ x, y, type: types[(Math.random() * 3) | 0] });
  }
}

function applyItem(it) {
  playSound("item.mp3");
  if (it.type === "heal") player.health += 20;
  if (it.type === "ammo") currentAmmo = weapons[currentWeaponIndex].maxAmmo;
  if (it.type === "power") score += 50;
}

function explode(b) {
  enemies.forEach((e, ei) => {
    const dx = e.x - b.x,
      dy = e.y - b.y;
    if (dx * dx + dy * dy < 10000) {
      e.hp -= 2;
      if (e.hp <= 0) {
        enemies.splice(ei, 1);
        score += 10;
        dropItem(e.x, e.y);
      }
    }
  });
}

function gameOver() {
  saveScore(score);
  gameState = "gameover";
}

function drawMinimap() {
  const mw = 150,
    mh = 150;
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.fillRect(canvas.width - mw - 10, 10, mw, mh);
  const sx = mw / mapSize.w,
    sy = mh / mapSize.h;
  ctx.fillStyle = "cyan";
  ctx.fillRect(
    canvas.width - mw - 10 + player.worldX * sx - 2,
    10 + player.worldY * sy - 2,
    4,
    4
  );
}

const audioCache = {};
function playSound(src) {
  if (!audioCache[src]) audioCache[src] = new Audio(src);
  audioCache[src].currentTime = 0;
  audioCache[src].play();
}

function saveScore(newScore) {
  let ranks = JSON.parse(localStorage.getItem("ranks") || "[]");
  ranks.push(newScore);
  ranks.sort((a, b) => b - a);
  ranks = ranks.slice(0, 5);
  localStorage.setItem("ranks", JSON.stringify(ranks));
}

function getRanks() {
  return JSON.parse(localStorage.getItem("ranks") || "[]");
}
