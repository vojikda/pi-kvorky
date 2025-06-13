const board = document.getElementById('board');
const cells = document.querySelectorAll('[data-cell]');
const status = document.getElementById('status');
const restartButton = document.getElementById('restartButton');
const player1Wins = document.getElementById('player1Wins');
const player1Losses = document.getElementById('player1Losses');
const player2Wins = document.getElementById('player2Wins');
const player2Losses = document.getElementById('player2Losses');
const pvpMode = document.getElementById('pvpMode');
const pvcMode = document.getElementById('pvcMode');
const computerSettings = document.getElementById('computerSettings');

let isPlayer1Turn = true;
let gameActive = true;
let isComputerMode = false;
let computerDifficulty = 'easy';
let scores = {
    player1: { wins: 0, losses: 0 },
    player2: { wins: 0, losses: 0 }
};

// Sound effects
const sounds = {
    click: new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'),
    win: new Audio('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3'),
    draw: new Audio('https://assets.mixkit.co/active_storage/sfx/1434/1434-preview.mp3')
};

const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
];

// Game mode handling
pvpMode.addEventListener('click', () => {
    isComputerMode = false;
    pvpMode.classList.add('active');
    pvcMode.classList.remove('active');
    computerSettings.classList.add('hidden');
    restartGame();
});

pvcMode.addEventListener('click', () => {
    isComputerMode = true;
    pvcMode.classList.add('active');
    pvpMode.classList.remove('active');
    computerSettings.classList.remove('hidden');
    restartGame();
});

// Difficulty selection
document.querySelectorAll('input[name="difficulty"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        computerDifficulty = e.target.value;
    });
});

function handleCellClick(e) {
    const cell = e.target;
    if (!gameActive || cell.classList.contains('circle') || cell.classList.contains('cross')) {
        return;
    }

    const currentClass = isPlayer1Turn ? 'circle' : 'cross';
    placeMark(cell, currentClass);
    sounds.click.play();

    if (checkWin(currentClass)) {
        endGame(false);
    } else if (isDraw()) {
        endGame(true);
    } else {
        swapTurns();
        if (isComputerMode && !isPlayer1Turn) {
            setTimeout(makeComputerMove, 500);
        }
    }
}

function placeMark(cell, currentClass) {
    if (currentClass === 'circle') {
        cell.textContent = '○';
    } else {
        cell.textContent = '×';
    }
    cell.classList.add(currentClass);
}

function swapTurns() {
    isPlayer1Turn = !isPlayer1Turn;
    status.textContent = isPlayer1Turn ? "Player 1's turn (Blue)" : "Player 2's turn (Red)";
    status.style.color = isPlayer1Turn ? '#007bff' : '#dc3545';
}

function checkWin(currentClass) {
    return winningCombinations.some(combination => {
        if (combination.every(index => cells[index].classList.contains(currentClass))) {
            // Highlight winning combination
            combination.forEach(index => {
                cells[index].classList.add('winning-cell');
            });
            return true;
        }
        return false;
    });
}

function isDraw() {
    return [...cells].every(cell => {
        return cell.classList.contains('circle') || cell.classList.contains('cross');
    });
}

function updateScoreDisplay() {
    player1Wins.textContent = scores.player1.wins;
    player1Losses.textContent = scores.player1.losses;
    player2Wins.textContent = scores.player2.wins;
    player2Losses.textContent = scores.player2.losses;
}

function endGame(draw) {
    gameActive = false;
    if (draw) {
        status.textContent = "Game ended in a draw!";
        status.style.color = '#6c757d';
        sounds.draw.play();
    } else {
        const winner = isPlayer1Turn ? "Player 1" : "Player 2";
        status.textContent = `${winner} wins!`;
        status.style.color = winner === "Player 1" ? '#007bff' : '#dc3545';
        sounds.win.play();
        
        // Update scores
        if (winner === "Player 1") {
            scores.player1.wins++;
            scores.player2.losses++;
        } else {
            scores.player2.wins++;
            scores.player1.losses++;
        }
        updateScoreDisplay();
    }
}

function restartGame() {
    isPlayer1Turn = true;
    gameActive = true;
    status.textContent = "Player 1's turn (Blue)";
    status.style.color = '#007bff';
    cells.forEach(cell => {
        cell.classList.remove('circle', 'cross', 'winning-cell');
        cell.textContent = '';
    });
}

function makeComputerMove() {
    if (!gameActive) return;

    let move;
    switch (computerDifficulty) {
        case 'veryEasy':
            move = getVeryEasyMove();
            break;
        case 'easy':
            move = getRandomMove();
            break;
        case 'medium':
            move = Math.random() < 0.5 ? getRandomMove() : getSmartMove();
            break;
        case 'hard':
            move = getSmartMove();
            break;
        case 'expert':
            move = getExpertMove();
            break;
        case 'master':
            move = getMasterMove();
            break;
    }

    if (move !== null) {
        const cell = cells[move];
        handleCellClick({ target: cell });
    }
}

function getVeryEasyMove() {
    // Sometimes makes mistakes by not blocking obvious wins
    if (Math.random() < 0.3) {
        return getRandomMove();
    }
    return getSmartMove();
}

function getRandomMove() {
    const emptyCells = [...cells].filter(cell => 
        !cell.classList.contains('circle') && !cell.classList.contains('cross')
    );
    if (emptyCells.length === 0) return null;
    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    return [...cells].indexOf(randomCell);
}

function getSmartMove() {
    // First, check if computer can win
    for (let i = 0; i < cells.length; i++) {
        if (!cells[i].classList.contains('circle') && !cells[i].classList.contains('cross')) {
            cells[i].classList.add('cross');
            if (checkWin('cross')) {
                cells[i].classList.remove('cross');
                return i;
            }
            cells[i].classList.remove('cross');
        }
    }

    // Then, check if need to block player
    for (let i = 0; i < cells.length; i++) {
        if (!cells[i].classList.contains('circle') && !cells[i].classList.contains('cross')) {
            cells[i].classList.add('circle');
            if (checkWin('circle')) {
                cells[i].classList.remove('circle');
                return i;
            }
            cells[i].classList.remove('circle');
        }
    }

    // Try to take center
    if (!cells[4].classList.contains('circle') && !cells[4].classList.contains('cross')) {
        return 4;
    }

    // Take any available corner
    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter(i => 
        !cells[i].classList.contains('circle') && !cells[i].classList.contains('cross')
    );
    if (availableCorners.length > 0) {
        return availableCorners[Math.floor(Math.random() * availableCorners.length)];
    }

    // Take any available side
    const sides = [1, 3, 5, 7];
    const availableSides = sides.filter(i => 
        !cells[i].classList.contains('circle') && !cells[i].classList.contains('cross')
    );
    if (availableSides.length > 0) {
        return availableSides[Math.floor(Math.random() * availableSides.length)];
    }

    return getRandomMove();
}

function getExpertMove() {
    // First, check if computer can win
    for (let i = 0; i < cells.length; i++) {
        if (!cells[i].classList.contains('circle') && !cells[i].classList.contains('cross')) {
            cells[i].classList.add('cross');
            if (checkWin('cross')) {
                cells[i].classList.remove('cross');
                return i;
            }
            cells[i].classList.remove('cross');
        }
    }

    // Then, check if need to block player
    for (let i = 0; i < cells.length; i++) {
        if (!cells[i].classList.contains('circle') && !cells[i].classList.contains('cross')) {
            cells[i].classList.add('circle');
            if (checkWin('circle')) {
                cells[i].classList.remove('circle');
                return i;
            }
            cells[i].classList.remove('circle');
        }
    }

    // Look for fork opportunities (creating multiple winning possibilities)
    const forkMove = findForkMove();
    if (forkMove !== null) {
        return forkMove;
    }

    // Block opponent's fork
    const blockForkMove = blockForkMove();
    if (blockForkMove !== null) {
        return blockForkMove;
    }

    // Try to take center
    if (!cells[4].classList.contains('circle') && !cells[4].classList.contains('cross')) {
        return 4;
    }

    // Take opposite corner if player has a corner
    const oppositeCorner = getOppositeCorner();
    if (oppositeCorner !== null) {
        return oppositeCorner;
    }

    // Take any available corner
    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter(i => 
        !cells[i].classList.contains('circle') && !cells[i].classList.contains('cross')
    );
    if (availableCorners.length > 0) {
        return availableCorners[Math.floor(Math.random() * availableCorners.length)];
    }

    // Take any available side
    const sides = [1, 3, 5, 7];
    const availableSides = sides.filter(i => 
        !cells[i].classList.contains('circle') && !cells[i].classList.contains('cross')
    );
    if (availableSides.length > 0) {
        return availableSides[Math.floor(Math.random() * availableSides.length)];
    }

    return getRandomMove();
}

function getMasterMove() {
    // Use minimax algorithm for perfect play
    return getMinimaxMove();
}

function findForkMove() {
    // Check for moves that create multiple winning possibilities
    for (let i = 0; i < cells.length; i++) {
        if (!cells[i].classList.contains('circle') && !cells[i].classList.contains('cross')) {
            cells[i].classList.add('cross');
            let winningPaths = 0;
            
            // Check how many winning paths this move creates
            for (const combination of winningCombinations) {
                if (combination.every(index => 
                    cells[index].classList.contains('cross') || index === i
                )) {
                    winningPaths++;
                }
            }
            
            cells[i].classList.remove('cross');
            if (winningPaths >= 2) {
                return i;
            }
        }
    }
    return null;
}

function blockForkMove() {
    // Check for moves that block opponent's fork
    for (let i = 0; i < cells.length; i++) {
        if (!cells[i].classList.contains('circle') && !cells[i].classList.contains('cross')) {
            cells[i].classList.add('circle');
            let winningPaths = 0;
            
            // Check how many winning paths this move creates for opponent
            for (const combination of winningCombinations) {
                if (combination.every(index => 
                    cells[index].classList.contains('circle') || index === i
                )) {
                    winningPaths++;
                }
            }
            
            cells[i].classList.remove('circle');
            if (winningPaths >= 2) {
                return i;
            }
        }
    }
    return null;
}

function getOppositeCorner() {
    const corners = [
        [0, 8], // top-left and bottom-right
        [2, 6]  // top-right and bottom-left
    ];
    
    for (const [corner1, corner2] of corners) {
        if (cells[corner1].classList.contains('circle') && 
            !cells[corner2].classList.contains('circle') && 
            !cells[corner2].classList.contains('cross')) {
            return corner2;
        }
        if (cells[corner2].classList.contains('circle') && 
            !cells[corner1].classList.contains('circle') && 
            !cells[corner1].classList.contains('cross')) {
            return corner1;
        }
    }
    return null;
}

function getMinimaxMove() {
    let bestScore = -Infinity;
    let bestMove = null;
    
    for (let i = 0; i < cells.length; i++) {
        if (!cells[i].classList.contains('circle') && !cells[i].classList.contains('cross')) {
            cells[i].classList.add('cross');
            let score = minimax(0, false);
            cells[i].classList.remove('cross');
            
            if (score > bestScore) {
                bestScore = score;
                bestMove = i;
            }
        }
    }
    
    return bestMove;
}

function minimax(depth, isMaximizing) {
    // Check for terminal states
    if (checkWin('cross')) return 10 - depth;
    if (checkWin('circle')) return depth - 10;
    if (isDraw()) return 0;
    
    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < cells.length; i++) {
            if (!cells[i].classList.contains('circle') && !cells[i].classList.contains('cross')) {
                cells[i].classList.add('cross');
                let score = minimax(depth + 1, false);
                cells[i].classList.remove('cross');
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < cells.length; i++) {
            if (!cells[i].classList.contains('circle') && !cells[i].classList.contains('cross')) {
                cells[i].classList.add('circle');
                let score = minimax(depth + 1, true);
                cells[i].classList.remove('circle');
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

// Initialize the game
cells.forEach(cell => {
    cell.addEventListener('click', handleCellClick);
});

restartButton.addEventListener('click', restartGame);

// Initialize score display
updateScoreDisplay(); 