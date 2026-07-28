const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const TILE_SIZE = 40;
const ROWS = 14;
const COLS = 14;

// Initial Maze layout template
const initialMaze = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,1,1,0,0,0,0,0,1],
    [1,0,1,1,0,0,1,1,0,0,1,1,0,1],
    [1,2,1,1,0,0,0,0,0,0,1,1,2,1],
    [1,0,0,0,0,3,3,3,3,0,0,0,0,1],
    [1,0,1,1,0,1,3,3,1,0,1,1,0,1],
    [1,0,0,0,0,1,3,3,1,0,0,0,0,1],
    [1,0,1,1,0,1,1,1,1,0,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,2,1,1,0,1,1,1,1,0,1,1,2,1],
    [1,0,0,1,0,0,0,0,0,0,1,0,0,1],
    [1,1,0,1,0,1,1,1,1,0,1,0,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

let maze = JSON.parse(JSON.stringify(initialMaze));

let score = 0;
let lives = 3;
let gameOver = false;
let gameStarted = false;
let isPaused = false;

// Array of open floor tiles available for player spawning
const playerSpawnPool = [
    { x: 1, y: 1 },
    { x: 12, y: 1 },
    { x: 1, y: 12 },
    { x: 12, y: 12 },
    { x: 6, y: 12 }
];

// Array of guaranteed open floor tiles for enemy spawning (grid x, y)
const enemySpawnPool = [
    { x: 1, y: 1 },  { x: 12, y: 1 },
    { x: 1, y: 12 }, { x: 12, y: 12 },
    { x: 4, y: 1 },  { x: 9, y: 1 },
    { x: 1, y: 8 },  { x: 12, y: 8 },
    { x: 6, y: 5 },  { x: 7, y: 5 }
];

// DOM Elements
const pauseBtn = document.getElementById("pauseBtn");
const startGameBtn = document.getElementById("startGameBtn");
const exitGameBtn = document.getElementById("exitGameBtn");
const instructionModal = document.getElementById("instructionModal");
const modalTitle = document.getElementById("modalTitle");
const countdownOverlay = document.getElementById("countdownOverlay");
const countdownText = document.getElementById("countdownText");

// Player Setup
const player = {
    startX: TILE_SIZE * 1,
    startY: TILE_SIZE * 1,
    x: TILE_SIZE * 1,
    y: TILE_SIZE * 1,
    speed: 2,
    targetSpeed: 2,
    dirX: 0,
    dirY: 0,
    nextDirX: 0,
    nextDirY: 0
};

// Base Enemy Templates
const enemies = [
    { x: 0, y: 0, dirX: 0, dirY: -1, label: '🎤', speed: 2 },
    { x: 0, y: 0, dirX: 0, dirY: -1, label: '💿', speed: 2 },
    { x: 0, y: 0, dirX: 0, dirY: -1, label: '📻', speed: 2 }
];

// Randomize Spawns and ensure distance between player and enemies
function randomizeAllSpawns() {
    // 1. Pick a random player spawn location
    const randomPlayerSpawn = playerSpawnPool[Math.floor(Math.random() * playerSpawnPool.length)];
    player.x = randomPlayerSpawn.x * TILE_SIZE;
    player.y = randomPlayerSpawn.y * TILE_SIZE;
    player.dirX = 0;
    player.dirY = 0;
    player.nextDirX = 0;
    player.nextDirY = 0;

    // 2. Filter enemy spawn pool so enemies don't spawn on top of the player
    const safeEnemyPool = enemySpawnPool.filter(
        spot => !(spot.x === randomPlayerSpawn.x && spot.y === randomPlayerSpawn.y)
    );

    // Shuffle safe enemy pool
    const shuffledEnemyPool = [...safeEnemyPool].sort(() => 0.5 - Math.random());

    enemies.forEach((enemy, index) => {
        const spawn = shuffledEnemyPool[index % shuffledEnemyPool.length];
        enemy.x = spawn.x * TILE_SIZE;
        enemy.y = spawn.y * TILE_SIZE;
        enemy.dirX = 0;
        enemy.dirY = -1;
    });
}
// Assign random unique spawn locations from the pool
function assignRandomEnemySpawns() {
    // Shuffle copy of spawn pool
    const shuffledPool = [...enemySpawnPool].sort(() => 0.5 - Math.random());

    enemies.forEach((enemy, index) => {
        const spawn = shuffledPool[index % shuffledPool.length];
        enemy.x = spawn.x * TILE_SIZE;
        enemy.y = spawn.y * TILE_SIZE;
        enemy.dirX = 0;
        enemy.dirY = -1;
    });
}

// Pause Button Trigger
pauseBtn.addEventListener("click", () => {
    if (!gameStarted || gameOver) return;

    isPaused = true;
    modalTitle.innerText = "GAME PAUSED";
    startGameBtn.innerText = "RESUME GAME";
    exitGameBtn.classList.remove("hidden");
    instructionModal.classList.remove("hidden");
});

// Start / Resume Button Trigger
startGameBtn.addEventListener("click", () => {
    instructionModal.classList.add("hidden");

    if (isPaused) {
        isPaused = false;
    } else {
        countdownOverlay.classList.remove("hidden");
        let count = 3;
        countdownText.innerText = count;

        const interval = setInterval(() => {
            count--;
            if (count > 0) {
                countdownText.innerText = count;
            } else {
                clearInterval(interval);
                countdownOverlay.classList.add("hidden");
                gameStarted = true;
            }
        }, 1000);
    }
});

// Exit Game Button Trigger
exitGameBtn.addEventListener("click", () => {
    window.location.href = "arcade.html"; 
});

// Controls
window.addEventListener("keydown", (e) => {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.key)) {
        e.preventDefault();
    }

    if (gameOver && e.key === " ") {
        restartGame();
        return;
    }

    if (e.key === "p" || e.key === "P") {
        pauseBtn.click();
        return;
    }

    switch(e.key) {
        case "ArrowUp":    player.nextDirX = 0;  player.nextDirY = -1; break;
        case "ArrowDown":  player.nextDirX = 0;  player.nextDirY = 1;  break;
        case "ArrowLeft":  player.nextDirX = -1; player.nextDirY = 0;  break;
        case "ArrowRight": player.nextDirX = 1;  player.nextDirY = 0;  break;
    }
});

function canMove(pixelX, pixelY, dirX, dirY) {
    const currentGridX = Math.round(pixelX / TILE_SIZE);
    const currentGridY = Math.round(pixelY / TILE_SIZE);
    
    const targetGridX = currentGridX + dirX;
    const targetGridY = currentGridY + dirY;

    return maze[targetGridY] && maze[targetGridY][targetGridX] !== 1;
}

function updateSpeed() {
    if (score >= 600) {
        player.targetSpeed = 8;
    } else if (score >= 250) {
        player.targetSpeed = 4;
    } else {
        player.targetSpeed = 2;
    }
}

function updateLivesUI() {
    let hearts = "";
    for (let i = 0; i < lives; i++) hearts += "❤️";
    document.getElementById("lives").innerText = hearts || "💀";
}

function resetPositions() {
   randomizeAllSpawns();
}

function restartGame() {
    maze = JSON.parse(JSON.stringify(initialMaze));
    score = 0;
    lives = 3;
    gameOver = false;
    document.getElementById("score").innerText = score;
    updateLivesUI();
    resetPositions();
}

function movePlayer() {
    const centerGridX = Math.floor((player.x + TILE_SIZE / 2) / TILE_SIZE);
    const centerGridY = Math.floor((player.y + TILE_SIZE / 2) / TILE_SIZE);

    if (maze[centerGridY] && maze[centerGridY][centerGridX] !== undefined) {
        if (maze[centerGridY][centerGridX] === 0) {
            maze[centerGridY][centerGridX] = 3;
            score += 10;
            document.getElementById("score").innerText = score;
            updateSpeed();
        } else if (maze[centerGridY][centerGridX] === 2) {
            maze[centerGridY][centerGridX] = 3;
            score += 50;
            document.getElementById("score").innerText = score;
            updateSpeed();
        }
    }

    if (player.x % TILE_SIZE === 0 && player.y % TILE_SIZE === 0) {
        player.speed = player.targetSpeed;

        if (canMove(player.x, player.y, player.nextDirX, player.nextDirY)) {
            player.dirX = player.nextDirX;
            player.dirY = player.nextDirY;
        } else if (!canMove(player.x, player.y, player.dirX, player.dirY)) {
            player.dirX = 0;
            player.dirY = 0;
        }
    }

    player.x += player.dirX * player.speed;
    player.y += player.dirY * player.speed;
}

function moveEnemies() {
    enemies.forEach(enemy => {
        const isAlignedX = Math.abs(enemy.x % TILE_SIZE) < enemy.speed;
        const isAlignedY = Math.abs(enemy.y % TILE_SIZE) < enemy.speed;

        if (isAlignedX && isAlignedY) {
            enemy.x = Math.round(enemy.x / TILE_SIZE) * TILE_SIZE;
            enemy.y = Math.round(enemy.y / TILE_SIZE) * TILE_SIZE;

            let allValidDirs = [
                { x: 0, y: -1 }, { x: 0, y: 1 },
                { x: -1, y: 0 }, { x: 1, y: 0 }
            ].filter(dir => canMove(enemy.x, enemy.y, dir.x, dir.y));

            let forwardDirs = allValidDirs.filter(dir => !(dir.x === -enemy.dirX && dir.y === -enemy.dirY));
            let availableDirs = forwardDirs.length > 0 ? forwardDirs : allValidDirs;

            if (availableDirs.length > 0) {
                const currentGridX = enemy.x / TILE_SIZE;
                const currentGridY = enemy.y / TILE_SIZE;
                const playerGridX = Math.round(player.x / TILE_SIZE);
                const playerGridY = Math.round(player.y / TILE_SIZE);

                availableDirs.sort((a, b) => {
                    const distA = Math.hypot((currentGridX + a.x) - playerGridX, (currentGridY + a.y) - playerGridY);
                    const distB = Math.hypot((currentGridX + b.x) - playerGridX, (currentGridY + b.y) - playerGridY);
                    return distA - distB;
                });

                if (Math.random() < 0.75 && Math.random() > 0.10) {
                    enemy.dirX = availableDirs[0].x;
                    enemy.dirY = availableDirs[0].y;
                } else {
                    const randomDir = availableDirs[Math.floor(Math.random() * availableDirs.length)];
                    enemy.dirX = randomDir.x;
                    enemy.dirY = randomDir.y;
                }
            }
        }

        if (canMove(enemy.x, enemy.y, enemy.dirX, enemy.dirY)) {
            enemy.x += enemy.dirX * enemy.speed;
            enemy.y += enemy.dirY * enemy.speed;
        } else {
            enemy.x = Math.round(enemy.x / TILE_SIZE) * TILE_SIZE;
            enemy.y = Math.round(enemy.y / TILE_SIZE) * TILE_SIZE;
            enemy.dirX = 0;
            enemy.dirY = 0;
        }

        const dist = Math.hypot((enemy.x + TILE_SIZE / 2) - (player.x + TILE_SIZE / 2), (enemy.y + TILE_SIZE / 2) - (player.y + TILE_SIZE / 2));
        if (dist < TILE_SIZE / 1.5) {
            lives--;
            updateLivesUI();

            if (lives <= 0) {
                gameOver = true;
            } else {
                resetPositions();
            }
        }
    });
}

function drawMaze() {
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const tile = maze[r][c];
            const px = c * TILE_SIZE;
            const py = r * TILE_SIZE;

            if (tile === 1) {
                ctx.strokeStyle = "#00f0ff";
                ctx.lineWidth = 2;
                ctx.strokeRect(px + 2, py + 2, TILE_SIZE - 4, TILE_SIZE - 4);
            } else if (tile === 0) {
                ctx.fillStyle = "#ff00ff";
                ctx.beginPath();
                ctx.arc(px + TILE_SIZE/2, py + TILE_SIZE/2, 4, 0, Math.PI * 2);
                ctx.fill();
            } else if (tile === 2) {
                ctx.fillStyle = "#ffe600";
                ctx.beginPath();
                ctx.arc(px + TILE_SIZE/2, py + TILE_SIZE/2, 8, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
}

function drawPlayer() {
    const px = player.x + TILE_SIZE / 2;
    const py = player.y + TILE_SIZE / 2;
    
    ctx.fillStyle = "#ffe600";
    ctx.beginPath();
    ctx.arc(px, py, TILE_SIZE / 2 - 4, 0, Math.PI * 2);
    ctx.fill();
}

function drawEnemies() {
    enemies.forEach(enemy => {
        ctx.font = "24px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(enemy.label, enemy.x + TILE_SIZE / 2, enemy.y + TILE_SIZE / 2);
    });
}

function drawGameOver() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = "bold 36px monospace";
    ctx.fillStyle = "#ff007f";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "#ff007f";
    ctx.shadowBlur = 15;
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 20);

    ctx.font = "18px monospace";
    ctx.fillStyle = "#ffe600";
    ctx.shadowColor = "#ffe600";
    ctx.shadowBlur = 8;
    ctx.fillText("PRESS SPACE TO RESTART", canvas.width / 2, canvas.height / 2 + 30);
    
    ctx.shadowBlur = 0;
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (gameStarted && !isPaused && !gameOver) {
        movePlayer();
        moveEnemies();
    }

    drawMaze();
    drawPlayer();
    drawEnemies();

    if (gameOver) {
        drawGameOver();
    }

    requestAnimationFrame(gameLoop);
}

// Initial Spawn Setup
randomizeAllSpawns();
requestAnimationFrame(gameLoop);