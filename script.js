const board = document.getElementById('board');
const cells = document.querySelectorAll('[data-cell]');
const status = document.getElementById('status');
const restartButton = document.getElementById('restartButton');
const player1Wins = document.getElementById('player1Wins');
const player1Losses = document.getElementById('player1Losses');
const player2Wins = document.getElementById('player2Wins');
const player2Losses = document.getElementById('player2Losses');

let isPlayer1Turn = true;
let gameActive = true;
let scores = {
    player1: { wins: 0, losses: 0 },
    player2: { wins: 0, losses: 0 }
};

const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
];

function handleCellClick(e) {
    const cell = e.target;
    if (!gameActive || cell.classList.contains('circle') || cell.classList.contains('cross')) {
        return;
    }

    const currentClass = isPlayer1Turn ? 'circle' : 'cross';
    placeMark(cell, currentClass);

    if (checkWin(currentClass)) {
        endGame(false);
    } else if (isDraw()) {
        endGame(true);
    } else {
        swapTurns();
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
}

function checkWin(currentClass) {
    return winningCombinations.some(combination => {
        return combination.every(index => {
            return cells[index].classList.contains(currentClass);
        });
    });
}

function isDraw() {
    return [...cells].every(cell => {
        return cell.classList.contains('circle') || cell.classList.contains('cross');
    });
}

function endGame(draw) {
    gameActive = false;
    if (draw) {
        status.textContent = "Game ended in a draw!";
    } else {
        const winner = isPlayer1Turn ? "Player 1" : "Player 2";
        status.textContent = `${winner} wins!`;
        
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

function updateScoreDisplay() {
    player1Wins.textContent = scores.player1.wins;
    player1Losses.textContent = scores.player1.losses;
    player2Wins.textContent = scores.player2.wins;
    player2Losses.textContent = scores.player2.losses;
}

function restartGame() {
    isPlayer1Turn = true;
    gameActive = true;
    status.textContent = "Player 1's turn (Blue)";
    cells.forEach(cell => {
        cell.classList.remove('circle', 'cross');
        cell.textContent = '';
    });
}

cells.forEach(cell => {
    cell.addEventListener('click', handleCellClick);
});

restartButton.addEventListener('click', restartGame); 