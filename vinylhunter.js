const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const TILE_SIZE = 40;
const ROWS = 14;
const COLS = 14;

// 1 = Wall, 0 = Vinyl Record, 2 = Gold Record, 3 = Empty
const maze = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,1,1,0,0,0,0,0,1],
    [1,0,1,1,0,0,1,1,0,0,1,1,0,1],
    [1,2,1,1,0,0,0,0,0,0,1,1,2,1],
    [1,0,0,0,0,1,1,1,1,0,0,0,0,1],
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

// Player Setup
const player = {
    x: TILE_SIZE * 1,
    y: TILE_SIZE * 1,
    speed: 2,         // Active movement speed
    targetSpeed: 2,   // Speed to apply when reaching next tile intersection
    dirX: 0,
    dirY: 0,
    nextDirX: 0,
    nextDirY: 0
};

// Enemy Types
const enemies = [
    { x: 6 * TILE_SIZE, y: 5 * TILE_SIZE, label: '🎤' },
    { x: 7 * TILE_SIZE, y: 5 * TILE_SIZE, label: '💿' },
    { x: 6 * TILE_SIZE, y: 6 * TILE_SIZE, label: '📻' }
];

// Controls
window.addEventListener("keydown", (e) => {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.key)) {
        e.preventDefault();
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

// Queue speed updates (using strict factors of 40: 2, 4, 8)
function updateSpeed() {
    if (score >= 600) {
        player.targetSpeed = 8; // Max speed factor
    } else if (score >= 250) {
        player.targetSpeed = 4; // Mid speed factor
    } else {
        player.targetSpeed = 2; // Normal speed factor
    }
}

function movePlayer() {
    // 1. Collect points
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

    // 2. Safe Tile Intersection Check
    if (player.x % TILE_SIZE === 0 && player.y % TILE_SIZE === 0) {
        // Safely apply speed boost at tile center
        player.speed = player.targetSpeed;

        if (canMove(player.x, player.y, player.nextDirX, player.nextDirY)) {
            player.dirX = player.nextDirX;
            player.dirY = player.nextDirY;
        } else if (!canMove(player.x, player.y, player.dirX, player.dirY)) {
            player.dirX = 0;
            player.dirY = 0;
        }
    }

    // 3. Increment position
    player.x += player.dirX * player.speed;
    player.y += player.dirY * player.speed;
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

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    movePlayer();
    drawMaze();
    drawPlayer();
    drawEnemies();

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);