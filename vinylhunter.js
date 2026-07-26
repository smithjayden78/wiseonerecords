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
    x: 1,
    y: 1,
    dirX: 0,
    dirY: 0,
    nextDirX: 0,
    nextDirY: 0
};

// Enemy Types
const enemies = [
    { x: 6, y: 5, color: '#ff0055', label: '🎤', name: 'Bad Review' },
    { x: 7, y: 5, color: '#00f0ff', label: '💿', name: 'Piracy' },
    { x: 6, y: 6, color: '#00ff66', label: '📻', name: 'Radio Station' }
];

// Controls
window.addEventListener("keydown", (e) => {
    switch(e.key) {
        case "ArrowUp":    player.nextDirX = 0;  player.nextDirY = -1; break;
        case "ArrowDown":  player.nextDirX = 0;  player.nextDirY = 1;  break;
        case "ArrowLeft":  player.nextDirX = -1; player.nextDirY = 0;  break;
        case "ArrowRight": player.nextDirX = 1;  player.nextDirY = 0;  break;
    }
});

function movePlayer() {
    // Try moving in intended direction
    if (canMove(player.x + player.nextDirX, player.y + player.nextDirY)) {
        player.dirX = player.nextDirX;
        player.dirY = player.nextDirY;
    }
    
    // Execute movement if path is clear
    if (canMove(player.x + player.dirX, player.y + player.dirY)) {
        player.x += player.dirX;
        player.y += player.dirY;
    }

    // Collectibles logic
    const currentTile = maze[player.y][player.x];
    if (currentTile === 0) { // Regular Vinyl
        maze[player.y][player.x] = 3;
        score += 10;
    } else if (currentTile === 2) { // Gold Record
        maze[player.y][player.x] = 3;
        score += 50;
    }
    
    document.getElementById("score").innerText = score;
}

function canMove(targetX, targetY) {
    return maze[targetY] && maze[targetY][targetX] !== 1;
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
    const px = player.x * TILE_SIZE + TILE_SIZE / 2;
    const py = player.y * TILE_SIZE + TILE_SIZE / 2;
    
    ctx.fillStyle = "#ffe600";
    ctx.beginPath();
    ctx.arc(px, py, TILE_SIZE / 2 - 4, 0, Math.PI * 2);
    ctx.fill();
}

function drawEnemies() {
    enemies.forEach(enemy => {
        const px = enemy.x * TILE_SIZE;
        const py = enemy.y * TILE_SIZE;
        
        ctx.font = "24px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(enemy.label, px + TILE_SIZE / 2, py + TILE_SIZE / 2);
    });
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    movePlayer();
    drawMaze();
    drawPlayer();
    drawEnemies();
}

// Game loop tick rate (200ms per grid movement)
setInterval(gameLoop, 180);