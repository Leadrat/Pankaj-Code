"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicTacToeGame = void 0;
// Game Class
class TicTacToeGame {
    constructor() {
        this.players = [
            { name: 'Player X', symbol: 'X', score: 0 },
            { name: 'Player O', symbol: 'O', score: 0 }
        ];
        this.winningCombinations = [
            // Rows
            { indices: [0, 1, 2], type: 'row' },
            { indices: [3, 4, 5], type: 'row' },
            { indices: [6, 7, 8], type: 'row' },
            // Columns
            { indices: [0, 3, 6], type: 'column' },
            { indices: [1, 4, 7], type: 'column' },
            { indices: [2, 5, 8], type: 'column' },
            // Diagonals
            { indices: [0, 4, 8], type: 'diagonal' },
            { indices: [2, 4, 6], type: 'diagonal' }
        ];
        this.initializeGame();
        this.setupEventListeners();
        this.updateDisplay();
    }
    /**
     * Initialize a new game state
     */
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
    /**
     * Set up all event listeners for the game
     */
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
                const target = e.target;
                this.players[0].name = target.value || 'Player X';
                this.updateDisplay();
            });
        }
        if (playerOInput) {
            playerOInput.addEventListener('input', (e) => {
                const target = e.target;
                this.players[1].name = target.value || 'Player O';
                this.updateDisplay();
            });
        }
    }
    /**
     * Handle cell click events
     */
    handleCellClick(index) {
        if (this.gameState.gameOver || this.gameState.board[index] !== null) {
            return;
        }
        this.makeMove(index);
    }
    /**
     * Make a move on the board
     */
    makeMove(index) {
        // Update board
        this.gameState.board[index] = this.gameState.currentPlayer.symbol;
        // Record move
        const move = {
            index,
            player: this.gameState.currentPlayer
        };
        this.gameState.moves.push(move);
        // Update UI
        this.updateBoard();
        this.checkGameStatus();
        if (!this.gameState.gameOver) {
            this.switchPlayer();
        }
        this.updateDisplay();
    }
    /**
     * Switch to the next player
     */
    switchPlayer() {
        this.gameState.currentPlayer = this.gameState.currentPlayer === this.players[0]
            ? this.players[1]
            : this.players[0];
    }
    /**
     * Check if the game is over (win or draw)
     */
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
    /**
     * Check for a winning combination
     */
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
    /**
     * Check if the board is full (draw condition)
     */
    isBoardFull() {
        return this.gameState.board.every(cell => cell !== null);
    }
    /**
     * Highlight the winning line
     */
    highlightWinningLine() {
        if (!this.gameState.winningLine)
            return;
        this.gameState.winningLine.forEach(index => {
            const cell = document.querySelector(`[data-index="${index}"]`);
            if (cell) {
                cell.classList.add('winning');
            }
        });
    }
    /**
     * Update the scoreboard
     */
    updateScore() {
        if (this.gameState.winner) {
            this.gameState.winner.score++;
        }
    }
    /**
     * Update the visual board
     */
    updateBoard() {
        const cells = document.querySelectorAll('.cell');
        cells.forEach((cell, index) => {
            const cellElement = cell;
            const value = this.gameState.board[index];
            if (value) {
                cellElement.textContent = value;
                cellElement.classList.add(value.toLowerCase());
            }
        });
    }
    /**
     * Update all display elements
     */
    updateDisplay() {
        this.updateCurrentPlayerDisplay();
        this.updateScoreboard();
        this.updateGameBoard();
    }
    /**
     * Update current player display
     */
    updateCurrentPlayerDisplay() {
        const currentPlayerDisplay = document.getElementById('currentPlayerDisplay');
        if (currentPlayerDisplay && !this.gameState.gameOver) {
            currentPlayerDisplay.textContent = `${this.gameState.currentPlayer.name}'s Turn`;
        }
    }
    /**
     * Update scoreboard display
     */
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
    /**
     * Update game board visual state
     */
    updateGameBoard() {
        const gameBoard = document.querySelector('.game-board');
        if (gameBoard) {
            if (this.gameState.gameOver) {
                gameBoard.classList.add('game-over');
            }
            else {
                gameBoard.classList.remove('game-over');
            }
        }
    }
    /**
     * Show game status message
     */
    showGameStatus(message) {
        const gameStatus = document.getElementById('gameStatus');
        if (gameStatus) {
            gameStatus.textContent = message;
            gameStatus.className = 'status-message';
            if (this.gameState.winner) {
                gameStatus.classList.add('winner');
            }
            else if (this.gameState.isDraw) {
                gameStatus.classList.add('draw');
            }
        }
    }
    /**
     * Restart the game
     */
    restartGame() {
        // Reset game state
        this.initializeGame();
        // Clear board visually
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            const cellElement = cell;
            cellElement.textContent = '';
            cellElement.className = 'cell';
        });
        // Clear game status
        const gameStatus = document.getElementById('gameStatus');
        if (gameStatus) {
            gameStatus.textContent = '';
            gameStatus.className = 'status-message';
        }
        // Remove game-over class from board
        const gameBoard = document.querySelector('.game-board');
        if (gameBoard) {
            gameBoard.classList.remove('game-over');
        }
        // Update display
        this.updateDisplay();
    }
    /**
     * Reset scores and restart
     */
    resetScores() {
        this.players.forEach(player => {
            player.score = 0;
        });
        this.restartGame();
    }
}
exports.TicTacToeGame = TicTacToeGame;
// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new TicTacToeGame();
    // Make game instance globally available for debugging
    window.ticTacToeGame = game;
});
