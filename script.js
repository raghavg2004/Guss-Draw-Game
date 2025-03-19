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

// Game variables
let roomId = "";
let playerName = "";
let players = [];
let currentTurn = 0;
let words = ["apple", "banana", "car", "dog", "elephant"];
let selectedWord = "";
let gameRounds = 3;
let scores = {};

// UI Elements
const createRoomBtn = document.getElementById("createRoom");
const joinRoomBtn = document.getElementById("joinRoom");
const startGameBtn = document.getElementById("startGame");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const chatBox = document.getElementById("chatBox");
const messageInput = document.getElementById("messageInput");
const sendMessageBtn = document.getElementById("sendMessage");
const guessInput = document.getElementById("guessInput");
const guessBtn = document.getElementById("guessBtn");

// Create a game room
createRoomBtn.addEventListener("click", () => {
    roomId = Math.random().toString(36).substr(2, 6);
    playerName = prompt("Enter your name:");
    if (!playerName) return;
    db.ref(`rooms/${roomId}`).set({ players: { [playerName]: 0 }, currentTurn: 0, word: "" });
    alert(`Room Created! Share this code: ${roomId}`);
});

// Join an existing room
joinRoomBtn.addEventListener("click", () => {
    roomId = prompt("Enter Room Code:");
    playerName = prompt("Enter your name:");
    if (!roomId || !playerName) return;
    db.ref(`rooms/${roomId}/players/${playerName}`).set(0);
    alert("Joined Room: " + roomId);
});

// Start game
startGameBtn.addEventListener("click", () => {
    db.ref(`rooms/${roomId}/word`).set(words[Math.floor(Math.random() * words.length)]);
    db.ref(`rooms/${roomId}/currentTurn`).set(0);
});

// Listen for word selection
if (roomId) {
    db.ref(`rooms/${roomId}/word`).on("value", (snapshot) => {
        selectedWord = snapshot.val();
    });
}

// Handle drawing
let drawing = false;
canvas.addEventListener("mousedown", () => (drawing = true));
canvas.addEventListener("mouseup", () => (drawing = false));
canvas.addEventListener("mousemove", (event) => {
    if (!drawing) return;
    let x = event.offsetX;
    let y = event.offsetY;
    ctx.fillRect(x, y, 5, 5);
    db.ref(`rooms/${roomId}/drawing`).set({ x, y });
});

// Listen for drawing updates
if (roomId) {
    db.ref(`rooms/${roomId}/drawing`).on("value", (snapshot) => {
        let data = snapshot.val();
        if (data) ctx.fillRect(data.x, data.y, 5, 5);
    });
}

// Chat functionality
sendMessageBtn.addEventListener("click", () => {
    let message = messageInput.value;
    if (message) {
        db.ref(`rooms/${roomId}/chat`).push({ player: playerName, text: message });
        messageInput.value = "";
    }
});

// Listen for chat messages
if (roomId) {
    db.ref(`rooms/${roomId}/chat`).on("child_added", (snapshot) => {
        let msg = snapshot.val();
        let msgElement = document.createElement("p");
        msgElement.textContent = `${msg.player}: ${msg.text}`;
        chatBox.appendChild(msgElement);
    });
}

// Handle guessing
guessBtn.addEventListener("click", () => {
    let guess = guessInput.value.toLowerCase();
    if (guess === selectedWord) {
        alert("Correct Guess! You win this round.");
        db.ref(`rooms/${roomId}/scores/${playerName}`).set((scores[playerName] || 0) + 1);
    }
    guessInput.value = "";
});

// Listen for score updates
if (roomId) {
    db.ref(`rooms/${roomId}/scores`).on("value", (snapshot) => {
        scores = snapshot.val() || {};
        console.log("Scores:", scores);
    });
}
