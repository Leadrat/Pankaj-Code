// TypeScript Interfaces and Types
interface Player {
    name: string;
    symbol: 'X' | 'O';
    score: number;
}

interface Move {
    index: number;
    player: Player;
}

interface GameState {
    board: (string | null)[];
    currentPlayer: Player;
    gameOver: boolean;
    winner: Player | null;
    isDraw: boolean;
    winningLine: number[] | null;
    moves: Move[];
}

interface WinningCombination {
    indices: number[];
    type: 'row' | 'column' | 'diagonal';
}

// Theme Management Interface
interface ThemeManager {
    currentTheme: 'light' | 'dark';
    toggleTheme(): void;
    setTheme(theme: 'light' | 'dark'): void;
    loadTheme(): void;
    saveTheme(): void;
}

// Theme Manager Class
class ThemeManager implements ThemeManager {
    public currentTheme: 'light' | 'dark' = 'light';
    private themeToggle: HTMLElement | null = null;
    private themeIcon: HTMLElement | null = null;

    constructor() {
        this.loadTheme();
        this.setupThemeToggle();
    }

    /**
     * Set up theme toggle button event listener
     */
    private setupThemeToggle(): void {
        this.themeToggle = document.getElementById('themeToggle');
        this.themeIcon = document.querySelector('.theme-icon');
        
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    }

    /**
     * Toggle between light and dark themes
     */
    public toggleTheme(): void {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(this.currentTheme);
    }

    /**
     * Set the theme and update UI
     */
    public setTheme(theme: 'light' | 'dark'): void {
        this.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        this.updateThemeIcon();
        this.saveTheme();
    }

    /**
     * Update theme icon based on current theme
     */
    private updateThemeIcon(): void {
        if (this.themeIcon) {
            this.themeIcon.textContent = this.currentTheme === 'light' ? '🌙' : '☀️';
        }
    }

    /**
     * Load theme from localStorage
     */
    public loadTheme(): void {
        const savedTheme = localStorage.getItem('ticTacToeTheme') as 'light' | 'dark' | null;
        if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
            this.setTheme(savedTheme);
        } else {
            // Default to light theme
            this.setTheme('light');
        }
    }

    /**
     * Save theme to localStorage
     */
    public saveTheme(): void {
        localStorage.setItem('ticTacToeTheme', this.currentTheme);
    }
}

// Game Class
class TicTacToeGame {
    private gameState!: GameState;
    private players: Player[];
    private winningCombinations: WinningCombination[];

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
    private initializeGame(): void {
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
    private setupEventListeners(): void {
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
        const playerXInput = document.getElementById('playerX') as HTMLInputElement;
        const playerOInput = document.getElementById('playerO') as HTMLInputElement;

        if (playerXInput) {
            playerXInput.addEventListener('input', (e) => {
                const target = e.target as HTMLInputElement;
                this.players[0].name = target.value || 'Player X';
                this.updateDisplay();
            });
        }

        if (playerOInput) {
            playerOInput.addEventListener('input', (e) => {
                const target = e.target as HTMLInputElement;
                this.players[1].name = target.value || 'Player O';
                this.updateDisplay();
            });
        }
    }

    /**
     * Handle cell click events
     */
    private handleCellClick(index: number): void {
        if (this.gameState.gameOver || this.gameState.board[index] !== null) {
            return;
        }

        this.makeMove(index);
    }

    /**
     * Make a move on the board
     */
    private makeMove(index: number): void {
        // Update board
        this.gameState.board[index] = this.gameState.currentPlayer.symbol;

        // Record move
        const move: Move = {
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
    private switchPlayer(): void {
        this.gameState.currentPlayer = this.gameState.currentPlayer === this.players[0] 
            ? this.players[1] 
            : this.players[0];
    }

    /**
     * Check if the game is over (win or draw)
     */
    private checkGameStatus(): void {
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
    private checkForWinner(): Player | null {
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
    private isBoardFull(): boolean {
        return this.gameState.board.every(cell => cell !== null);
    }

    /**
     * Highlight the winning line
     */
    private highlightWinningLine(): void {
        if (!this.gameState.winningLine) return;

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
    private updateScore(): void {
        if (this.gameState.winner) {
            this.gameState.winner.score++;
        }
    }

    /**
     * Update the visual board
     */
    private updateBoard(): void {
        const cells = document.querySelectorAll('.cell');
        cells.forEach((cell, index) => {
            const cellElement = cell as HTMLElement;
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
    private updateDisplay(): void {
        this.updateCurrentPlayerDisplay();
        this.updateScoreboard();
        this.updateGameBoard();
    }

    /**
     * Update current player display
     */
    private updateCurrentPlayerDisplay(): void {
        const currentPlayerDisplay = document.getElementById('currentPlayerDisplay');
        if (currentPlayerDisplay && !this.gameState.gameOver) {
            currentPlayerDisplay.textContent = `${this.gameState.currentPlayer.name}'s Turn`;
        }
    }

    /**
     * Update scoreboard display
     */
    private updateScoreboard(): void {
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
    private updateGameBoard(): void {
        const gameBoard = document.querySelector('.game-board');
        if (gameBoard) {
            if (this.gameState.gameOver) {
                gameBoard.classList.add('game-over');
            } else {
                gameBoard.classList.remove('game-over');
            }
        }
    }

    /**
     * Show game status message
     */
    private showGameStatus(message: string): void {
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

    /**
     * Restart the game
     */
    public restartGame(): void {
        // Reset game state
        this.initializeGame();
        
        // Clear board visually
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            const cellElement = cell as HTMLElement;
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
    public resetScores(): void {
        this.players.forEach(player => {
            player.score = 0;
        });
        this.restartGame();
    }
}


// --- Game Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme manager first
    const themeManager = new ThemeManager();
    // Then initialize the game
    const game = new TicTacToeGame();
    // Make instances globally available for debugging
    (window as any).ticTacToeGame = game;
    (window as any).themeManager = themeManager;
});

// Export for potential module usage
export { TicTacToeGame, ThemeManager, Player, GameState, Move, WinningCombination };
