// Game state
let grid = [];
let score = 0;
const GRID_SIZE = 4;

// Initialize the game on page load
document.addEventListener("DOMContentLoaded", () => {
    initializeGame();
    document.addEventListener("keydown", handleKeyPress);
    document.getElementById("new-game").addEventListener("click", initializeGame);
});

// Initialize the game board and add two starting tiles
function initializeGame() {
    grid = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0));
    score = 0;
    updateScore();
    addRandomTile();
    addRandomTile();
    renderGrid();
}

// Add a random tile (2 or 4) to an empty cell
function addRandomTile() {
    const emptyCells = [];
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            if (grid[i][j] === 0) emptyCells.push({ x: i, y: j });
        }
    }
    if (emptyCells.length > 0) {
        const { x, y } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        grid[x][y] = Math.random() < 0.9 ? 2 : 4; // 90% chance of 2, 10% chance of 4
    }
}

// Render the grid to the DOM
function renderGrid() {
    const gridElement = document.getElementById("grid");
    gridElement.innerHTML = ""; // Clear existing tiles
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            const tile = document.createElement("div");
            tile.classList.add("tile");
            if (grid[i][j] !== 0) {
                tile.textContent = grid[i][j];
                tile.classList.add(`tile-${grid[i][j]}`);
            }
            gridElement.appendChild(tile);
        }
    }
}

// Handle arrow key presses
function handleKeyPress(event) {
    let moved = false;
    switch (event.key) {
        case "ArrowUp": moved = moveUp(); break;
        case "ArrowDown": moved = moveDown(); break;
        case "ArrowLeft": moved = moveLeft(); break;
        case "ArrowRight": moved = moveRight(); break;
    }
    if (moved) {
        addRandomTile();
        renderGrid();
        if (isGameOver()) alert("Game Over! Score: " + score);
    }
}

// Move tiles up
function moveUp() {
    let moved = false;
    for (let j = 0; j < GRID_SIZE; j++) {
        let column = [grid[0][j], grid[1][j], grid[2][j], grid[3][j]];
        let newColumn = slideAndMerge(column);
        for (let i = 0; i < GRID_SIZE; i++) {
            if (grid[i][j] !== newColumn[i]) moved = true;
            grid[i][j] = newColumn[i];
        }
    }
    return moved;
}

// Move tiles down
function moveDown() {
    let moved = false;
    for (let j = 0; j < GRID_SIZE; j++) {
        let column = [grid[3][j], grid[2][j], grid[1][j], grid[0][j]];
        let newColumn = slideAndMerge(column);
        for (let i = 0; i < GRID_SIZE; i++) {
            if (grid[3 - i][j] !== newColumn[i]) moved = true;
            grid[3 - i][j] = newColumn[i];
        }
    }
    return moved;
}

// Move tiles left
function moveLeft() {
    let moved = false;
    for (let i = 0; i < GRID_SIZE; i++) {
        let row = grid[i].slice();
        let newRow = slideAndMerge(row);
        for (let j = 0; j < GRID_SIZE; j++) {
            if (grid[i][j] !== newRow[j]) moved = true;
            grid[i][j] = newRow[j];
        }
    }
    return moved;
}

// Move tiles right
function moveRight() {
    let moved = false;
    for (let i = 0; i < GRID_SIZE; i++) {
        let row = grid[i].slice().reverse();
        let newRow = slideAndMerge(row);
        for (let j = 0; j < GRID_SIZE; j++) {
            if (grid[i][3 - j] !== newRow[j]) moved = true;
            grid[i][3 - j] = newRow[j];
        }
    }
    return moved;
}

// Slide and merge tiles in a row or column
function slideAndMerge(line) {
    // Remove zeros and pad with zeros
    let filtered = line.filter(x => x !== 0);
    let result = [];
    for (let i = 0; i < filtered.length; i++) {
        if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
            result.push(filtered[i] * 2);
            score += filtered[i] * 2;
            updateScore();
            i++; // Skip the merged tile
        } else {
            result.push(filtered[i]);
        }
    }
    while (result.length < GRID_SIZE) result.push(0);
    return result;
}

// Update the score display
function updateScore() {
    document.getElementById("score").textContent = score;
}

// Check if the game is over (no valid moves left)
function isGameOver() {
    // Check for empty cells
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            if (grid[i][j] === 0) return false;
        }
    }
    // Check for possible merges
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE - 1; j++) {
            if (grid[i][j] === grid[i][j + 1]) return false;
            if (grid[j][i] === grid[j + 1][i]) return false;
        }
    }
    return true;
}
