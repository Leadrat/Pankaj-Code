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
            moves: []
        };
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
        if (this.gameState.gameOver || this.gameState.board[index] !== null) {
            return;
        }
        this.makeMove(index);
    }

    makeMove(index) {
        this.gameState.board[index] = this.gameState.currentPlayer.symbol;
        
        const move = {
            index,
            player: this.gameState.currentPlayer
        };
        this.gameState.moves.push(move);

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
    
    console.log('Game and theme manager initialized successfully!');
});
