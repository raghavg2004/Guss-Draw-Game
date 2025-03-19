const firebaseConfig = {
    apiKey: "AIzaSyC9O8ItYPi13F1BXn123HG_U5KVnuXrKWw",
    authDomain: "gussgame-3781c.firebaseapp.com",
    databaseURL: "https://gussgame-3781c-default-rtdb.firebaseio.com/",
    projectId: "gussgame-3781c",
    storageBucket: "gussgame-3781c.appspot.com",
    messagingSenderId: "567582107940",
    appId: "1:567582107940:web:63e477503c4cc038b8abb1",
    measurementId: "G-WWMC1KKN6L"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let roomCode = "";
let playerName = prompt("Enter your name:");

function createRoom() {
    roomCode = Math.random().toString(36).substr(2, 5).toUpperCase();
    db.ref(`rooms/${roomCode}`).set({ players: {}, round: 1, turnIndex: 0, words: [] });
    joinRoom(roomCode);
}

function joinRoom(code) {
    roomCode = code;
    db.ref(`rooms/${roomCode}/players`).push({ name: playerName, score: 0 });
    document.getElementById("roomInfo").innerText = `Room Code: ${roomCode}`;
    startGameListener();
}

document.getElementById("createRoomBtn").addEventListener("click", createRoom);
document.getElementById("joinRoomBtn").addEventListener("click", () => {
    const code = document.getElementById("roomCodeInput").value;
    joinRoom(code);
});

document.getElementById("sendGuessBtn").addEventListener("click", () => {
    const guess = document.getElementById("guessInput").value;
    sendGuess(guess);
});

function startGameListener() {
    db.ref(`rooms/${roomCode}`).on("value", (snapshot) => {
        const data = snapshot.val();
        if (data) updateGameState(data);
    });
}

function updateGameState(data) {
    // Handle turn-based drawing and guessing logic
}

function sendGuess(guess) {
    db.ref(`rooms/${roomCode}/chat`).push({ player: playerName, message: guess });
}

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let drawing = false;
canvas.addEventListener("mousedown", () => (drawing = true));
canvas.addEventListener("mouseup", () => (drawing = false));
canvas.addEventListener("mousemove", draw);

function draw(event) {
    if (!drawing) return;
    ctx.lineTo(event.clientX, event.clientY);
    ctx.stroke();
    saveDrawingData();
}

function saveDrawingData() {
    db.ref(`rooms/${roomCode}/drawing`).set(canvas.toDataURL());
}
