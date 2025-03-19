// Initialize Firebase
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
console.log("Firebase Initialized");

// Global Variables
let roomId = "";
let playerName = "";
let selectedWord = "";
let isDrawing = false;

// UI Elements
const createRoomBtn = document.getElementById("createRoom");
const joinRoomBtn = document.getElementById("joinRoom");
const startGameBtn = document.getElementById("startGame");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const messageInput = document.getElementById("messageInput");
const sendMessageBtn = document.getElementById("sendMessage");
const chatBox = document.getElementById("chatBox");
const guessInput = document.getElementById("guessInput");
const guessBtn = document.getElementById("guessBtn");

// Create Room
createRoomBtn.addEventListener("click", () => {
    roomId = Math.random().toString(36).substr(2, 6);
    playerName = prompt("Enter your name:");
    if (!playerName) return;

    db.ref(`rooms/${roomId}`).set({
        players: { [playerName]: 0 },
        currentTurn: playerName,
        word: "",
        chat: []
    });

    document.getElementById("roomInfo").textContent = `Room Code: ${roomId}`;
    alert(`Room Created! Share this code: ${roomId}`);
});

// Join Room
joinRoomBtn.addEventListener("click", () => {
    roomId = document.getElementById("roomCodeInput").value.trim();
    playerName = prompt("Enter your name:");
    if (!roomId || !playerName) return;

    db.ref(`rooms/${roomId}/players/${playerName}`).set(0);
    document.getElementById("roomInfo").textContent = `Joined Room: ${roomId}`;
    alert("Joined Room Successfully!");
});

// Start Game
startGameBtn.addEventListener("click", () => {
    if (!roomId) {
        alert("You must be in a room to start the game.");
        return;
    }

    const wordOptions = ["apple", "banana", "car", "dog", "elephant"];
    selectedWord = prompt(`Choose a word: ${wordOptions.join(", ")}`);
    db.ref(`rooms/${roomId}/word`).set(selectedWord);
});

// Drawing on Canvas
canvas.addEventListener("mousedown", () => (isDrawing = true));
canvas.addEventListener("mouseup", () => (isDrawing = false));
canvas.addEventListener("mousemove", (event) => {
    if (!isDrawing) return;

    const x = event.offsetX;
    const y = event.offsetY;
    ctx.fillRect(x, y, 5, 5);

    db.ref(`rooms/${roomId}/drawing`).push({ x, y });
});

// Sync Drawing
db.ref(`rooms/${roomId}/drawing`).on("child_added", (snapshot) => {
    const data = snapshot.val();
    ctx.fillRect(data.x, data.y, 5, 5);
});

// Chat Functionality
sendMessageBtn.addEventListener("click", () => {
    const message = messageInput.value.trim();
    if (message) {
        db.ref(`rooms/${roomId}/chat`).push({ player: playerName, text: message });
        messageInput.value = "";
    }
});

db.ref(`rooms/${roomId}/chat`).on("child_added", (snapshot) => {
    const msg = snapshot.val();
    const msgElement = document.createElement("p");
    msgElement.textContent = `${msg.player}: ${msg.text}`;
    chatBox.appendChild(msgElement);
});

// Guessing Mechanism
guessBtn.addEventListener("click", () => {
    const guess = guessInput.value.toLowerCase();
    if (guess === selectedWord) {
        alert("Correct Guess! You win this round.");
        db.ref(`rooms/${roomId}/scores/${playerName}`).set((prevScore) => (prevScore || 0) + 1);
    }
    guessInput.value = "";
});
