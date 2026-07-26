const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const TILE_SIZE = 40;
const ROWS = 14;
const COLS = 14;

// 1 = Wall, 0 = Vinyl Record, 2 = Gold Record, 3 = Empty/Open Way
// Note: Rows 4 and 5 updated to open up the center spawn box top door
const maze = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,1,1,0,0,0,0,0,1],
    [1,0,1,1,0,0,1,1,0,0,1,1,0,1],
    [1,2,1,1,0,0,0,0,0,0,1,1,2,1],
    [1,0,0,0,0,3,3,3,3,0,0,0,0,1], // Opened door above ghost house
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

let score = 0;
let lives = 3;
let gameOver = false;

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

// Enemy Setup
const enemies = [
    { startX: 6 * TILE_SIZE, startY: 5 * TILE_SIZE, x: 6 * TILE_SIZE, y: 5 * TILE_SIZE, dirX: 0, dirY: -1, label: '🎤', speed: 2 },
    { startX: 7 * TILE_SIZE, startY: 5 * TILE_SIZE, x: 7 * TILE_SIZE, y: 5 * TILE_SIZE, dirX: 0, dirY: -1, label: '💿', speed: 2 },
    { startX: 6 * TILE_SIZE, startY: 6 * TILE_SIZE, x: 6 * TILE_SIZE, y: 6 * TILE_SIZE, dirX: 0, dirY: -1, label: '📻', speed: 2 }
];

// Controls
window.addEventListener("keydown", (e) => {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.key)) {
        e.preventDefault();
    }

    if (gameOver && e.key === " ") {
        restartGame();
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
    player.x = player.startX;
    player.y = player.startY;
    player.dirX = 0;
    player.dirY = 0;
    player.nextDirX = 0;
    player.nextDirY = 0;

    enemies.forEach(enemy => {
        enemy.x = enemy.startX;
        enemy.y = enemy.startY;
        enemy.dirX = 0;
        enemy.dirY = -1;
    });
}

function restartGame() {
    score = 0;
    lives = 3;
    gameOver = false;
    document.getElementById("score").innerText = score;
    updateLivesUI();
    resetPositions();
}

function movePlayer() {
    // Collect points
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

    // Grid center turn check
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
        if (enemy.x % TILE_SIZE === 0 && enemy.y % TILE_SIZE === 0) {
            // Get valid paths
            let possibleDirs = [
                { x: 0, y: -1 },
                { x: 0, y: 1 },
                { x: -1, y: 0 },
                { x: 1, y: 0 }
            ].filter(dir => canMove(enemy.x, enemy.y, dir.x, dir.y));

            // Prevent enemy from turning 180 degrees backward unless stuck at a dead end
            if (possibleDirs.length > 1) {
                possibleDirs = possibleDirs.filter(dir => !(dir.x === -enemy.dirX && dir.y === -enemy.dirY));
            }

            if (possibleDirs.length > 0) {
                const currentGridX = enemy.x / TILE_SIZE;
                const currentGridY = enemy.y / TILE_SIZE;
                const playerGridX = Math.round(player.x / TILE_SIZE);
                const playerGridY = Math.round(player.y / TILE_SIZE);

                // Target-focused path choice
                possibleDirs.sort((a, b) => {
                    const distA = Math.hypot((currentGridX + a.x) - playerGridX, (currentGridY + a.y) - playerGridY);
                    const distB = Math.hypot((currentGridX + b.x) - playerGridX, (currentGridY + b.y) - playerGridY);
                    return distA - distB;
                });

                // 75% chance to follow best path toward player, 25% random direction
                if (Math.random() < 0.75) {
                    enemy.dirX = possibleDirs[0].x;
                    enemy.dirY = possibleDirs[0].y;
                } else {
                    const randomDir = possibleDirs[Math.floor(Math.random() * possibleDirs.length)];
                    enemy.dirX = randomDir.x;
                    enemy.dirY = randomDir.y;
                }
            }
        }

        enemy.x += enemy.dirX * enemy.speed;
        enemy.y += enemy.dirY * enemy.speed;

        // Collision Check with Player
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

            if (tile === 1) { // Wall
                ctx.strokeStyle = "#00f0ff";
                ctx.lineWidth = 2;
                ctx.strokeRect(px + 2, py + 2, TILE_SIZE - 4, TILE_SIZE - 4);
            } else if (tile === 0) { // Vinyl
                ctx.fillStyle = "#ff00ff";
                ctx.beginPath();
                ctx.arc(px + TILE_SIZE/2, py + TILE_SIZE/2, 4, 0, Math.PI * 2);
                ctx.fill();
            } else if (tile === 2) { // Gold Record
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
    
    if (!gameOver) {
        movePlayer();
        moveEnemies();
        drawMaze();
        drawPlayer();
        drawEnemies();
    } else {
        drawMaze();
        drawPlayer();
        drawEnemies();
        drawGameOver();
    }

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);