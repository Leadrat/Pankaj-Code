// script.js - Main Tic Tac Toe logic with IndexedDB integration

let moves = [];
let currentPlayer = 'X';
let board = Array(9).fill(null);
let gameOver = false;

function renderBoard() {
    const boardDiv = document.getElementById('board');
    boardDiv.innerHTML = '';
    board.forEach((cell, idx) => {
        const cellDiv = document.createElement('div');
        cellDiv.className = 'cell';
        cellDiv.dataset.index = idx;
        cellDiv.textContent = cell || '';
        cellDiv.onclick = () => handleCellClick(idx);
        boardDiv.appendChild(cellDiv);
    });
}

function handleCellClick(idx) {
    if (gameOver || board[idx]) return;
    board[idx] = currentPlayer;
    moves.push({ player: currentPlayer, index: idx });
    renderBoard();
    if (checkWin()) {
        endGame(`${currentPlayer} wins!`, currentPlayer);
    } else if (board.every(cell => cell)) {
        endGame("It's a draw!", 'draw');
    } else {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        updateStatus(`${currentPlayer}'s turn`);
    }
}

function checkWin() {
    const wins = [
        [0,1,2],[3,4,5],[6,7,8],
        [0,3,6],[1,4,7],[2,5,8],
        [0,4,8],[2,4,6]
    ];
    return wins.some(comb => comb.every(i => board[i] === currentPlayer));
}

function endGame(message, result) {
    gameOver = true;
    updateStatus(message);
    db.saveScore(currentPlayer, result, moves.map(m => m.index)).then(() => {
        getAndRenderScores();
    });
    document.getElementById('replayBtn').style.display = 'none';
    setTimeout(() => {
        document.getElementById('replayBtn').style.display = 'block';
    }, 500);
}

function updateStatus(msg) {
    document.getElementById('status').textContent = msg;
}

function newGame() {
    board = Array(9).fill(null);
    moves = [];
    currentPlayer = 'X';
    gameOver = false;
    renderBoard();
    updateStatus("X's turn");
    document.getElementById('replayBtn').style.display = 'none';
}

function getAndRenderScores() {
    db.getScores().then(scores => {
        const scoreboard = document.getElementById('scoreboard');
        scoreboard.innerHTML = '';
        scores.forEach(score => {
            const div = document.createElement('div');
            div.className = 'score-row';
            div.innerHTML = `
                <span>${score.player} (${score.result})</span>
                <span>${new Date(score.timestamp).toLocaleString()}</span>
                <button onclick="replayGame(${score.id})">Replay</button>
            `;
            scoreboard.appendChild(div);
        });
    });
}

function replayGame(id) {
    db.getScoreById(id).then(score => {
        if (!score) return;
        board = Array(9).fill(null);
        renderBoard();
        let i = 0;
        function animate() {
            if (i >= score.moves.length) return;
            const idx = score.moves[i];
            board[idx] = i % 2 === 0 ? 'X' : 'O';
            renderBoard();
            i++;
            setTimeout(animate, 500);
        }
        animate();
    });
}

document.addEventListener('DOMContentLoaded', () => {

    renderBoard();
    updateStatus("X's turn");
    getAndRenderScores();
    document.getElementById('newBtn').onclick = newGame;
    document.getElementById('refreshBtn').onclick = getAndRenderScores;
    document.getElementById('replayBtn').onclick = () => replayGame('last');
});
