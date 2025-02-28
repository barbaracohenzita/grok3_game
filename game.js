// Game state
let grid = [];
let score = 0;
let bestScore = localStorage.getItem("bestScore") || 0;
let previousState = null;
const GRID_SIZE = 4;

// Initialize the game on page load
document.addEventListener("DOMContentLoaded", () => {
    initializeGame();
    document.addEventListener("keydown", handleKeyPress);
    document.getElementById("new-game").addEventListener("click", initializeGame);
    document.getElementById("undo").addEventListener("click", undoMove);
    document.getElementById("restart").addEventListener("click", initializeGame);
    updateBestScore();
});

// Initialize or reset the game
function initializeGame() {
    grid = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0));
    score = 0;
    previousState = null;
    updateScore();
    hideGameOver();
    addRandomTile();
    addRandomTile();
    renderGrid();
}

// Add a random tile
function addRandomTile() {
    const emptyCells = [];
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            if (grid[i][j] === 0) emptyCells.push({ x: i, y: j });
        }
    }
    if (emptyCells.length > 0) {
        const { x, y } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        grid[x][y] = Math.random() < 0.9 ? 2 : 4;
        return { x, y, value: grid[x][y] };
    }
    return null;
}

// Render the grid with neomorphic animations
function renderGrid(newTile = null, mergedTiles = []) {
    const gridElement = document.getElementById("grid");
    gridElement.innerHTML = "";
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            const tile = document.createElement("div");
            tile.classList.add("tile");
            if (grid[i][j] !== 0) {
                tile.textContent = grid[i][j];
                tile.classList.add(`tile-${grid[i][j]}`);
                if (newTile && newTile.x === i && newTile.y === j) {
                    tile.classList.add("tile-new");
                }
                if (mergedTiles.some(t => t.x === i && t.y === j)) {
                    tile.classList.add("tile-merged");
                }
            }
            gridElement.appendChild(tile);
        }
    }
}

// Save the current state for undo
function saveState() {
    previousState = { grid: grid.map(row => row.slice()), score };
}

// Handle arrow key presses
function handleKeyPress(event) {
    let moved = false;
    saveState();
    let mergedTiles = [];
    switch (event.key) {
        case "ArrowUp": [moved, mergedTiles] = moveUp(); break;
        case "ArrowDown": [moved, mergedTiles] = moveDown(); break;
        case "ArrowLeft": [moved, mergedTiles] = moveLeft(); break;
        case "ArrowRight": [moved, mergedTiles] = moveRight(); break;
    }
    if (moved) {
        const newTile = addRandomTile();
        renderGrid(newTile, mergedTiles);
        updateBestScore();
        if (isGameOver()) showGameOver();
    }
}

// Undo the last move
function undoMove() {
    if (previousState) {
        grid = previousState.grid.map(row => row.slice());
        score = previousState.score;
        previousState = null;
        updateScore();
        renderGrid();
    }
}

// Movement functions (unchanged except for return structure)
function moveUp() {
    let moved = false;
    let mergedTiles = [];
    for (let j = 0; j < GRID_SIZE; j++) {
        let column = [grid[0][j], grid[1][j], grid[2][j], grid[3][j]];
        let [newColumn, merges] = slideAndMerge(column);
        for (let i = 0; i < GRID_SIZE; i++) {
            if (grid[i][j] !== newColumn[i]) moved = true;
            grid[i][j] = newColumn[i];
        }
        mergedTiles.push(...merges.map(m => ({ x: m, y: j })));
    }
    return [moved, mergedTiles];
}

function moveDown() {
    let moved = false;
    let mergedTiles = [];
    for (let j = 0; j < GRID_SIZE; j++) {
        let column = [grid[3][j], grid[2][j], grid[1][j], grid[0][j]];
        let [newColumn, merges] = slideAndMerge(column);
        for (let i = 0; i < GRID_SIZE; i++) {
            if (grid[3 - i][j] !== newColumn[i]) moved = true;
            grid[3 - i][j] = newColumn[i];
        }
        mergedTiles.push(...merges.map(m => ({ x: 3 - m, y: j })));
    }
    return [moved, mergedTiles];
}

function moveLeft() {
    let moved = false;
    let mergedTiles = [];
    for (let i = 0; i < GRID_SIZE; i++) {
        let row = grid[i].slice();
        let [newRow, merges] = slideAndMerge(row);
        for (let j = 0; j < GRID_SIZE; j++) {
            if (grid[i][j] !== newRow[j]) moved = true;
            grid[i][j] = newRow[j];
        }
        mergedTiles.push(...merges.map(m => ({ x: i, y: m })));
    }
    return [moved, mergedTiles];
}

function moveRight() {
    let moved = false;
    let mergedTiles = [];
    for (let i = 0; i < GRID_SIZE; i++) {
        let row = grid[i].slice().reverse();
        let [newRow, merges] = slideAndMerge(row);
        for (let j = 0; j < GRID_SIZE; j++) {
            if (grid[i][3 - j] !== newRow[j]) moved = true;
            grid[i][3 - j] = newRow[j];
        }
        mergedTiles.push(...merges.map(m => ({ x: i, y: 3 - m })));
    }
    return [moved, mergedTiles];
}

function slideAndMerge(line) {
    let filtered = line.filter(x => x !== 0);
    let result = [];
    let merges = [];
    for (let i = 0; i < filtered.length; i++) {
        if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
            result.push(filtered[i] * 2);
            score += filtered[i] * 2;
            merges.push(result.length - 1);
            i++;
        } else {
            result.push(filtered[i]);
        }
    }
    while (result.length < GRID_SIZE) result.push(0);
    return [result, merges];
}

function updateScore() {
    document.getElementById("score").textContent = score;
}

function updateBestScore() {
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem("bestScore", bestScore);
    }
    document.getElementById("best-score").textContent = bestScore;
}

function showGameOver() {
    document.getElementById("game-over").style.display = "flex";
    document.getElementById("final-score").textContent = score;
}

function hideGameOver() {
    document.getElementById("game-over").style.display = "none";
}

function isGameOver() {
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            if (grid[i][j] === 0) return false;
            if (j < GRID_SIZE - 1 && grid[i][j] === grid[i][j + 1]) return false;
            if (i < GRID_SIZE - 1 && grid[i][j] === grid[i + 1][j]) return false;
        }
    }
    return true;
}
