// --- Firebase Firestore Integration (Browser JS) ---
// This code is loaded via <script type="module"> in index.html, so Firestore SDK is available globally
window.saveScore = async function saveScore(player, wins, losses, draws) {
    try {
        const { collection, addDoc } = await import('https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js');
        await addDoc(collection(window.firestore, 'scores'), {
            player,
            wins,
            losses,
            draws,
            timestamp: new Date()
        });
        console.log('Score saved!');
    } catch (error) {
        console.error('Error saving score:', error.message || error);
    }
}

window.getScores = async function getScores() {
    try {
        const { collection, getDocs, query, orderBy } = await import('https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js');
        const q = query(collection(window.firestore, 'scores'), orderBy('wins', 'desc'));
        const querySnapshot = await getDocs(q);
        const scoreboardDiv = document.getElementById('scoreboard');
        if (scoreboardDiv) {
            scoreboardDiv.innerHTML = '';
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                scoreboardDiv.innerHTML += `<div>${data.player}: 🏆 ${data.wins} | ❌ ${data.losses} | 🤝 ${data.draws}</div>`;
            });
        }
    } catch (error) {
        console.error('Error fetching scores:', error.message || error);
    }
}

// --- Integrate with Tic Tac Toe Game Logic ---
document.addEventListener('DOMContentLoaded', () => {
    // Call getScores on page load
    if (typeof window.getScores === 'function') {
        window.getScores();
    }

    // Add event listener for Refresh Scores button
    const refreshBtn = document.querySelector('button[onclick="getScores()"]');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            if (typeof window.getScores === 'function') window.getScores();
        });
    }

    // Patch game logic to call saveScore after each game
    // Wait for game instance to be available
    const waitForGame = setInterval(() => {
        const game = window.ticTacToeGame;
        if (game && typeof game === 'object') {
            clearInterval(waitForGame);
            // Monkey-patch showGameStatus to call saveScore on win/draw
            const origShowGameStatus = game.showGameStatus.bind(game);
            game.showGameStatus = function(message) {
                origShowGameStatus(message);
                if (game.gameState.gameOver) {
                    // Determine player stats
                    const playerX = game.players[0];
                    const playerO = game.players[1];
                    // Save both players' scores
                    window.saveScore(playerX.name, playerX.score, 0, 0);
                    window.saveScore(playerO.name, playerO.score, 0, 0);
                    // Optionally refresh scoreboard
                    if (typeof window.getScores === 'function') window.getScores();
                }
            };
        }
    }, 100);
});
// --- Firebase Firestore Integration (Browser JS) ---
// This code is loaded via <script type="module"> in index.html, so Firestore SDK is available globally
window.saveScore = async function saveScore(player, wins, losses, draws) {
    try {
        const { collection, addDoc } = await import('https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js');
        await addDoc(collection(window.firestore, 'scores'), {
            player,
            wins,
            losses,
            draws,
            timestamp: new Date()
        });
        console.log('Score saved!');
    } catch (error) {
        console.error('Error saving score:', error.message || error);
    }
}

window.getScores = async function getScores() {
    try {
        const { collection, getDocs, query, orderBy } = await import('https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js');
        const q = query(collection(window.firestore, 'scores'), orderBy('wins', 'desc'));
        const querySnapshot = await getDocs(q);
        const scoreboardDiv = document.getElementById('scoreboard');
        if (scoreboardDiv) {
            scoreboardDiv.innerHTML = '';
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                scoreboardDiv.innerHTML += `<div>${data.player}: 🏆 ${data.wins} | ❌ ${data.losses} | 🤝 ${data.draws}</div>`;
            });
        }
    } catch (error) {
        console.error('Error fetching scores:', error.message || error);
    }
}
// Working Tic Tac Toe Game with Dark Mode
// No modules, direct browser compatibility

// Theme Manager Class
class ThemeManager {
    constructor() {
        this.currentTheme = 'light';
        this.themeToggle = null;
        this.themeIcon = null;
        this.loadTheme();
        this.setupThemeToggle();
    }

    setupThemeToggle() {
        this.themeToggle = document.getElementById('themeToggle');
        this.themeIcon = document.querySelector('.theme-icon');
        
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(this.currentTheme);
    }

    setTheme(theme) {
        this.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        this.updateThemeIcon();
        this.saveTheme();
    }

    updateThemeIcon() {
        if (this.themeIcon) {
            this.themeIcon.textContent = this.currentTheme === 'light' ? '🌙' : '☀️';
        }
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('ticTacToeTheme');
        if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
            this.setTheme(savedTheme);
        } else {
            this.setTheme('light');
        }
    }

    saveTheme() {
        localStorage.setItem('ticTacToeTheme', this.currentTheme);
    }
}

// Game Class

class TicTacToeGame {
    constructor() {
        this.players = [
            { name: 'Player X', symbol: 'X', score: 0 },
            { name: 'Player O', symbol: 'O', score: 0 }
        ];

        this.winningCombinations = [
            { indices: [0, 1, 2], type: 'row' },
            { indices: [3, 4, 5], type: 'row' },
            { indices: [6, 7, 8], type: 'row' },
            { indices: [0, 3, 6], type: 'column' },
            { indices: [1, 4, 7], type: 'column' },
            { indices: [2, 5, 8], type: 'column' },
            { indices: [0, 4, 8], type: 'diagonal' },
            { indices: [2, 4, 6], type: 'diagonal' }
        ];

        this.replayInProgress = false; // Track if replay is running
        this.initializeGame();
        this.setupEventListeners();
        this.updateDisplay();
    }

    initializeGame() {
        this.gameState = {
            board: new Array(9).fill(null),
            currentPlayer: this.players[0],
            gameOver: false,
            winner: null,
            isDraw: false,
            winningLine: null,
            moves: [] // Array to record each move: {index, player}
        };
        this.hideReplayButton();
        this.replayInProgress = false;
    }

    setupEventListeners() {
        // Cell click events
        const cells = document.querySelectorAll('.cell');
        cells.forEach((cell, index) => {
            cell.addEventListener('click', () => this.handleCellClick(index));
        });

        // Restart button
        const restartBtn = document.getElementById('restartBtn');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => this.restartGame());
        }

        // Player name input events
        const playerXInput = document.getElementById('playerX');
        const playerOInput = document.getElementById('playerO');

        if (playerXInput) {
            playerXInput.addEventListener('input', (e) => {
                this.players[0].name = e.target.value || 'Player X';
                this.updateDisplay();
            });
        }

        if (playerOInput) {
            playerOInput.addEventListener('input', (e) => {
                this.players[1].name = e.target.value || 'Player O';
                this.updateDisplay();
            });
        }
    }

    handleCellClick(index) {
        // Prevent interaction during replay
        if (this.replayInProgress || this.gameState.gameOver || this.gameState.board[index] !== null) {
            return;
        }
        this.makeMove(index);
    }

    makeMove(index) {
        this.gameState.board[index] = this.gameState.currentPlayer.symbol;
        // Record the move for replay
        this.gameState.moves.push({
            index,
            symbol: this.gameState.currentPlayer.symbol
        });

        this.updateBoard();
        this.checkGameStatus();

        if (!this.gameState.gameOver) {
            this.switchPlayer();
        }

        this.updateDisplay();
    }

    switchPlayer() {
        this.gameState.currentPlayer = this.gameState.currentPlayer === this.players[0] 
            ? this.players[1] 
            : this.players[0];
    }

    checkGameStatus() {
        const winner = this.checkForWinner();
        if (winner) {
            this.gameState.winner = winner;
            this.gameState.gameOver = true;
            this.highlightWinningLine();
            this.updateScore();
            this.showGameStatus(`${winner.name} wins!`);
            return;
        }

        if (this.isBoardFull()) {
            this.gameState.isDraw = true;
            this.gameState.gameOver = true;
            this.showGameStatus("It's a draw!");
        }
    }

    checkForWinner() {
        for (const combination of this.winningCombinations) {
            const [a, b, c] = combination.indices;
            const board = this.gameState.board;

            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                this.gameState.winningLine = combination.indices;
                return this.gameState.currentPlayer;
            }
        }
        return null;
    }

    isBoardFull() {
        return this.gameState.board.every(cell => cell !== null);
    }

    highlightWinningLine() {
        if (!this.gameState.winningLine) return;

        this.gameState.winningLine.forEach(index => {
            const cell = document.querySelector(`[data-index="${index}"]`);
            if (cell) {
                cell.classList.add('winning');
            }
        });
    }

    updateScore() {
        if (this.gameState.winner) {
            this.gameState.winner.score++;
        }
    }

    updateBoard() {
        const cells = document.querySelectorAll('.cell');
        cells.forEach((cell, index) => {
            const value = this.gameState.board[index];
            
            if (value) {
                cell.textContent = value;
                cell.classList.add(value.toLowerCase());
            }
        });
    }

    updateDisplay() {
        this.updateCurrentPlayerDisplay();
        this.updateScoreboard();
        this.updateGameBoard();
    }

    updateCurrentPlayerDisplay() {
        const currentPlayerDisplay = document.getElementById('currentPlayerDisplay');
        if (currentPlayerDisplay && !this.gameState.gameOver) {
            currentPlayerDisplay.textContent = `${this.gameState.currentPlayer.name}'s Turn`;
        }
    }

    updateScoreboard() {
        const playerXScore = document.getElementById('playerXScore');
        const playerOScore = document.getElementById('playerOScore');

        if (playerXScore) {
            playerXScore.textContent = `${this.players[0].name}: ${this.players[0].score}`;
        }
        if (playerOScore) {
            playerOScore.textContent = `${this.players[1].name}: ${this.players[1].score}`;
        }
    }

    updateGameBoard() {
        const gameBoard = document.querySelector('.game-board');
        if (gameBoard) {
            if (this.gameState.gameOver) {
                gameBoard.classList.add('game-over');
            } else {
                gameBoard.classList.remove('game-over');
            }
        }
    }

    showGameStatus(message) {
        const gameStatus = document.getElementById('gameStatus');
        if (gameStatus) {
            gameStatus.textContent = message;
            gameStatus.className = 'status-message';
            if (this.gameState.winner) {
                gameStatus.classList.add('winner');
            } else if (this.gameState.isDraw) {
                gameStatus.classList.add('draw');
            }
        }
        // Show Replay button after game ends
        if (this.gameState.gameOver) {
            this.showReplayButton();
        }
    }

    showReplayButton() {
        const btn = document.getElementById('replayBtn');
        if (btn) btn.style.display = 'block';
    }
    hideReplayButton() {
        const btn = document.getElementById('replayBtn');
        if (btn) btn.style.display = 'none';
    }

    // Animate the replay of the last game
    replayGame() {
        if (!this.gameState.moves.length || this.replayInProgress) return;
        this.replayInProgress = true;
        this.hideReplayButton();
        // Clear the board visually and in state
        this.gameState.board = new Array(9).fill(null);
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.textContent = '';
            cell.className = 'cell';
        });
        // Animate each move
        let i = 0;
        const moves = this.gameState.moves;
        const interval = setInterval(() => {
            if (i >= moves.length) {
                clearInterval(interval);
                this.replayInProgress = false;
                this.showReplayButton();
                return;
            }
            const move = moves[i];
            this.gameState.board[move.index] = move.symbol;
            const cell = document.querySelector(`[data-index="${move.index}"]`);
            if (cell) {
                cell.textContent = move.symbol;
                cell.classList.add(move.symbol.toLowerCase());
            }
            i++;
        }, 800);
    }

    restartGame() {
        this.initializeGame();
        
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.textContent = '';
            cell.className = 'cell';
        });

        const gameStatus = document.getElementById('gameStatus');
        if (gameStatus) {
            gameStatus.textContent = '';
            gameStatus.className = 'status-message';
        }

        const gameBoard = document.querySelector('.game-board');
        if (gameBoard) {
            gameBoard.classList.remove('game-over');
        }

        this.updateDisplay();
    }

    resetScores() {
        this.players.forEach(player => {
            player.score = 0;
        });
        this.restartGame();
    }
}

// Initialize everything when DOM is loaded


document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme manager
    const themeManager = new ThemeManager();
    // Initialize the game
    const game = new TicTacToeGame();
    // Make instances globally available for debugging
    window.ticTacToeGame = game;
    window.themeManager = themeManager;
    // Add Replay button event
    const replayBtn = document.getElementById('replayBtn');
    if (replayBtn) {
        replayBtn.onclick = () => game.replayGame();
    }
    // Add Refresh Scores button event (robust)
    const refreshBtn = document.getElementById('refreshScoresBtn');
    if (refreshBtn) {
        refreshBtn.onclick = () => {
            if (typeof window.getScores === 'function') window.getScores();
        };
    }
    // Always show scoreboard on initial load
    if (typeof window.getScores === 'function') window.getScores();
    console.log('Game and theme manager initialized successfully!');
});
