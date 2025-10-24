// db.js - IndexedDB logic for Tic Tac Toe

const DB_NAME = 'TicTacToeDB';
const STORE_NAME = 'scores';
const DB_VERSION = 1;

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function saveScore(player, result, moves) {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const record = {
        player,
        result,
        moves,
        timestamp: new Date().toISOString()
    };
    await store.add(record);
    return tx.complete;
}

async function getScores() {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    return new Promise((resolve, reject) => {
        const scores = [];
        const req = store.openCursor(null, 'prev');
        req.onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
                scores.push({ id: cursor.primaryKey, ...cursor.value });
                cursor.continue();
            } else {
                resolve(scores);
            }
        };
        req.onerror = () => reject(req.error);
    });
}

async function getScoreById(id) {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    return new Promise((resolve, reject) => {
        const req = store.get(id);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

window.db = { openDB, saveScore, getScores, getScoreById };
