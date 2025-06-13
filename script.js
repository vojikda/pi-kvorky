const board = document.querySelector('.game-board');
const cells = document.querySelectorAll('.cell');
const status = document.querySelector('.status');
const restartButton = document.getElementById('restart');
const player1Score = document.getElementById('player1-score');
const player2Score = document.getElementById('player2-score');

let currentPlayer = 'X';
let gameActive = true;
let boardState = ['', '', '', '', '', '', '', '', ''];
let scores = {
    player1: 0,
    player2: 0
};

// Load scores from localStorage
function loadScores() {
    const savedScores = localStorage.getItem('tictactoeScores');
    if (savedScores) {
        scores = JSON.parse(savedScores);
        updateScoreDisplay();
    }
}

// Save scores to localStorage
function saveScores() {
    localStorage.setItem('tictactoeScores', JSON.stringify(scores));
}

// Update score display
function updateScoreDisplay() {
    player1Score.textContent = scores.player1;
    player2Score.textContent = scores.player2;
}

// Winning combinations
const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
];

// Check for win
function checkWin() {
    for (const combination of winningCombinations) {
        const [a, b, c] = combination;
        if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
            // Highlight winning cells
            cells[a].classList.add('winning');
            cells[b].classList.add('winning');
            cells[c].classList.add('winning');
            return true;
        }
    }
    return false;
}

// Check for draw
function checkDraw() {
    return boardState.every(cell => cell !== '');
}

// Handle cell click
function handleCellClick(e) {
    const cell = e.target;
    const index = parseInt(cell.getAttribute('data-index'));

    if (boardState[index] !== '' || !gameActive) return;

    // Update board state and UI
    boardState[index] = currentPlayer;
    cell.textContent = currentPlayer === 'X' ? '×' : '○';
    cell.classList.add(currentPlayer.toLowerCase());

    // Play sound effect
    const moveSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');
    moveSound.volume = 0.3;
    moveSound.play();

    if (checkWin()) {
        gameActive = false;
        status.textContent = `Player ${currentPlayer === 'X' ? '1' : '2'} wins!`;
        scores[currentPlayer === 'X' ? 'player1' : 'player2']++;
        saveScores();
        updateScoreDisplay();
        return;
    }

    if (checkDraw()) {
        gameActive = false;
        status.textContent = "It's a draw!";
        return;
    }

    // Switch player
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    status.textContent = `Player ${currentPlayer === 'X' ? '1' : '2'}'s turn (${currentPlayer === 'X' ? 'Blue' : 'Red'})`;
    status.classList.add('player-turn');
}

// Restart game
function restartGame() {
    currentPlayer = 'X';
    gameActive = true;
    boardState = ['', '', '', '', '', '', '', '', ''];
    status.textContent = "Player 1's turn (Blue)";
    status.classList.add('player-turn');
    
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o', 'winning');
    });
}

// Event listeners
cells.forEach(cell => {
    cell.addEventListener('click', handleCellClick);
});

restartButton.addEventListener('click', restartGame);

// Load scores when the game starts
loadScores(); 