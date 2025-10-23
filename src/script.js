"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicTacToeGame = void 0;
// Game Class
var TicTacToeGame = /** @class */ (function () {
    function TicTacToeGame() {
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
    TicTacToeGame.prototype.initializeGame = function () {
        this.gameState = {
            board: new Array(9).fill(null),
            currentPlayer: this.players[0],
            gameOver: false,
            winner: null,
            isDraw: false,
            winningLine: null,
            moves: []
        };
    };
    /**
     * Set up all event listeners for the game
     */
    TicTacToeGame.prototype.setupEventListeners = function () {
        var _this = this;
        // Cell click events
        var cells = document.querySelectorAll('.cell');
        cells.forEach(function (cell, index) {
            cell.addEventListener('click', function () { return _this.handleCellClick(index); });
        });
        // Restart button
        var restartBtn = document.getElementById('restartBtn');
        if (restartBtn) {
            restartBtn.addEventListener('click', function () { return _this.restartGame(); });
        }
        // Player name input events
        var playerXInput = document.getElementById('playerX');
        var playerOInput = document.getElementById('playerO');
        if (playerXInput) {
            playerXInput.addEventListener('input', function (e) {
                var target = e.target;
                _this.players[0].name = target.value || 'Player X';
                _this.updateDisplay();
            });
        }
        if (playerOInput) {
            playerOInput.addEventListener('input', function (e) {
                var target = e.target;
                _this.players[1].name = target.value || 'Player O';
                _this.updateDisplay();
            });
        }
    };
    /**
     * Handle cell click events
     */
    TicTacToeGame.prototype.handleCellClick = function (index) {
        if (this.gameState.gameOver || this.gameState.board[index] !== null) {
            return;
        }
        this.makeMove(index);
    };
    /**
     * Make a move on the board
     */
    TicTacToeGame.prototype.makeMove = function (index) {
        // Update board
        this.gameState.board[index] = this.gameState.currentPlayer.symbol;
        // Record move
        var move = {
            index: index,
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
    };
    /**
     * Switch to the next player
     */
    TicTacToeGame.prototype.switchPlayer = function () {
        this.gameState.currentPlayer = this.gameState.currentPlayer === this.players[0]
            ? this.players[1]
            : this.players[0];
    };
    /**
     * Check if the game is over (win or draw)
     */
    TicTacToeGame.prototype.checkGameStatus = function () {
        var winner = this.checkForWinner();
        if (winner) {
            this.gameState.winner = winner;
            this.gameState.gameOver = true;
            this.highlightWinningLine();
            this.updateScore();
            this.showGameStatus("".concat(winner.name, " wins!"));
            return;
        }
        if (this.isBoardFull()) {
            this.gameState.isDraw = true;
            this.gameState.gameOver = true;
            this.showGameStatus("It's a draw!");
        }
    };
    /**
     * Check for a winning combination
     */
    TicTacToeGame.prototype.checkForWinner = function () {
        for (var _i = 0, _a = this.winningCombinations; _i < _a.length; _i++) {
            var combination = _a[_i];
            var _b = combination.indices, a = _b[0], b = _b[1], c = _b[2];
            var board = this.gameState.board;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                this.gameState.winningLine = combination.indices;
                return this.gameState.currentPlayer;
            }
        }
        return null;
    };
    /**
     * Check if the board is full (draw condition)
     */
    TicTacToeGame.prototype.isBoardFull = function () {
        return this.gameState.board.every(function (cell) { return cell !== null; });
    };
    /**
     * Highlight the winning line
     */
    TicTacToeGame.prototype.highlightWinningLine = function () {
        if (!this.gameState.winningLine)
            return;
        this.gameState.winningLine.forEach(function (index) {
            var cell = document.querySelector("[data-index=\"".concat(index, "\"]"));
            if (cell) {
                cell.classList.add('winning');
            }
        });
    };
    /**
     * Update the scoreboard
     */
    TicTacToeGame.prototype.updateScore = function () {
        if (this.gameState.winner) {
            this.gameState.winner.score++;
        }
    };
    /**
     * Update the visual board
     */
    TicTacToeGame.prototype.updateBoard = function () {
        var _this = this;
        var cells = document.querySelectorAll('.cell');
        cells.forEach(function (cell, index) {
            var cellElement = cell;
            var value = _this.gameState.board[index];
            if (value) {
                cellElement.textContent = value;
                cellElement.classList.add(value.toLowerCase());
            }
        });
    };
    /**
     * Update all display elements
     */
    TicTacToeGame.prototype.updateDisplay = function () {
        this.updateCurrentPlayerDisplay();
        this.updateScoreboard();
        this.updateGameBoard();
    };
    /**
     * Update current player display
     */
    TicTacToeGame.prototype.updateCurrentPlayerDisplay = function () {
        var currentPlayerDisplay = document.getElementById('currentPlayerDisplay');
        if (currentPlayerDisplay && !this.gameState.gameOver) {
            currentPlayerDisplay.textContent = "".concat(this.gameState.currentPlayer.name, "'s Turn");
        }
    };
    /**
     * Update scoreboard display
     */
    TicTacToeGame.prototype.updateScoreboard = function () {
        var playerXScore = document.getElementById('playerXScore');
        var playerOScore = document.getElementById('playerOScore');
        if (playerXScore) {
            playerXScore.textContent = "".concat(this.players[0].name, ": ").concat(this.players[0].score);
        }
        if (playerOScore) {
            playerOScore.textContent = "".concat(this.players[1].name, ": ").concat(this.players[1].score);
        }
    };
    /**
     * Update game board visual state
     */
    TicTacToeGame.prototype.updateGameBoard = function () {
        var gameBoard = document.querySelector('.game-board');
        if (gameBoard) {
            if (this.gameState.gameOver) {
                gameBoard.classList.add('game-over');
            }
            else {
                gameBoard.classList.remove('game-over');
            }
        }
    };
    /**
     * Show game status message
     */
    TicTacToeGame.prototype.showGameStatus = function (message) {
        var gameStatus = document.getElementById('gameStatus');
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
    };
    /**
     * Restart the game
     */
    TicTacToeGame.prototype.restartGame = function () {
        // Reset game state
        this.initializeGame();
        // Clear board visually
        var cells = document.querySelectorAll('.cell');
        cells.forEach(function (cell) {
            var cellElement = cell;
            cellElement.textContent = '';
            cellElement.className = 'cell';
        });
        // Clear game status
        var gameStatus = document.getElementById('gameStatus');
        if (gameStatus) {
            gameStatus.textContent = '';
            gameStatus.className = 'status-message';
        }
        // Remove game-over class from board
        var gameBoard = document.querySelector('.game-board');
        if (gameBoard) {
            gameBoard.classList.remove('game-over');
        }
        // Update display
        this.updateDisplay();
    };
    /**
     * Reset scores and restart
     */
    TicTacToeGame.prototype.resetScores = function () {
        this.players.forEach(function (player) {
            player.score = 0;
        });
        this.restartGame();
    };
    return TicTacToeGame;
}());
exports.TicTacToeGame = TicTacToeGame;
// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    var game = new TicTacToeGame();
    // Make game instance globally available for debugging
    window.ticTacToeGame = game;
});
