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

// Player Setup (Pixel-based positioning)
const player = {
    x: TILE_SIZE * 1, // Current exact X position in pixels
    y: TILE_SIZE * 1, // Current exact Y position in pixels
    speed: 3,         // Pixel movement speed per frame
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

function isCenteredOnTile(x, y) {
    // Checks if player is aligned with the grid tile boundary
    return (x % TILE_SIZE === 0) && (y % TILE_SIZE === 0);
}

function canMove(pixelX, pixelY, dirX, dirY) {
    // Calculate target grid cell based on direction
    const currentGridX = Math.floor(pixelX / TILE_SIZE);
    const currentGridY = Math.floor(pixelY / TILE_SIZE);
    
    const targetGridX = currentGridX + dirX;
    const targetGridY = currentGridY + dirY;

    return maze[targetGridY] && maze[targetGridY][targetGridX] !== 1;
}

function movePlayer() {
    // 1. If centered on a grid tile, try turning in the buffered direction
    if (isCenteredOnTile(player.x, player.y)) {
        // Collect item on current tile
        const gridX = player.x / TILE_SIZE;
        const gridY = player.y / TILE_SIZE;
        
        if (maze[gridY][gridX] === 0) {
            maze[gridY][gridX] = 3;
            score += 10;
        } else if (maze[gridY][gridX] === 2) {
            maze[gridY][gridX] = 3;
            score += 50;
        }
        document.getElementById("score").innerText = score;

        // Try changing direction
        if (canMove(player.x, player.y, player.nextDirX, player.nextDirY)) {
            player.dirX = player.nextDirX;
            player.dirY = player.nextDirY;
        } else if (!canMove(player.x, player.y, player.dirX, player.dirY)) {
            // Stop if continuing ahead hits a wall
            player.dirX = 0;
            player.dirY = 0;
        }
    }

    // 2. Smoothly increment pixel coordinates
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

// 60 FPS Smooth Game Loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    movePlayer();
    drawMaze();
    drawPlayer();
    drawEnemies();

    requestAnimationFrame(gameLoop);
}

// Start smooth animation loop
requestAnimationFrame(gameLoop);