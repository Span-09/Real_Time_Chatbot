import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDEpEbOdl7ysRoYZBj3phVcfA5wxE6W37c",
    authDomain: "real-time-chatbot-372f7.firebaseapp.com",
    projectId: "real-time-chatbot-372f7",
    storageBucket: "real-time-chatbot-372f7.appspot.com",
    messagingSenderId: "88476999060",
    appId: "1:88476999060:web:ec54d7298b84333d274381",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- GLOBAL VARIABLES & DOM REFERENCES ---
let currentUser = null;
let lastMessageDate = null; // To track the date for separators

const sendButton = document.querySelector('.send-button');
const messageInput = document.querySelector('.message-input');
const chatArea = document.querySelector('.chat-area');

// --- AUTHENTICATION ---
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        console.log('User signed in:', currentUser.uid);
        sendButton.disabled = false;
    } else {
        currentUser = null;
        console.log('User is signed out.');
        sendButton.disabled = true;
        signInAnonymously(auth).catch((error) => {
            console.error("Anonymous sign-in failed:", error);
        });
    }
});

// --- EVENT LISTENERS ---
sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        sendMessage();
    }
});


// --- CORE FUNCTIONS ---

/**
 * Sends a message to Firestore and displays it in the UI.
 */
async function sendMessage() {
    const text = messageInput.value.trim();

    if (text === '' || !currentUser) {
        alert("Cannot send: Message is empty or user not logged in.");
        return;
    }
    
    sendButton.textContent = 'Sending...';
    const roomId = "general"; // We'll use a hardcoded room ID for now

    try {
        const messageData = {
            senderId: currentUser.uid,
            text: text,
            timestamp: serverTimestamp()
        };

        const messagesRef = collection(db, 'chatrooms', roomId, 'messages');
        const docRef = await addDoc(messagesRef, messageData);
        
        console.log("Message sent with ID:", docRef.id);

        displayMessage({ ...messageData, id: docRef.id }, true);

        messageInput.value = '';
        messageInput.focus();
        sendButton.textContent = 'Send';

    } catch (error) {
        console.error("Error sending message:", error);
    }
}

// --- HELPER FUNCTIONS FOR DATE & UI ---
// THIS SECTION WAS MISSING IN THE PREVIOUS RESPONSE

/**
 * Formats a date for the date separator (e.g., "Today", "Yesterday").
 * @param {Date} date - The date to format.
 * @returns {string} The formatted date string.
 */
function formatDateSeparator(date) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
        return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
    } else {
        return date.toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' });
    }
}

/**
 * Creates and appends a date separator to the chat area.
 * @param {Date} date - The date to display in the separator.
 */
function createAndDisplayDateSeparator(date) {
    const separator = document.createElement('div');
    separator.classList.add('date-separator');

    const separatorText = document.createElement('span');
    separatorText.textContent = formatDateSeparator(date); // This line was causing the error

    separator.appendChild(separatorText);
    chatArea.appendChild(separator);
}

/**
 * Creates and appends a message bubble to the chat area.
 * @param {object} message - The message object from Firestore.
 * @param {boolean} isSent - True if the message was sent by the current user.
 */
function displayMessage(message, isSent) {
    const messageDate = (message.timestamp && typeof message.timestamp.toDate === 'function')
        ? message.timestamp.toDate()
        : new Date();

    if (!lastMessageDate || lastMessageDate.toDateString() !== messageDate.toDateString()) {
        createAndDisplayDateSeparator(messageDate);
    }
    lastMessageDate = messageDate;

    const messageBubble = document.createElement('div');
    messageBubble.classList.add('message-bubble', isSent ? 'sent' : 'received');

    const messageText = document.createElement('div');
    messageText.classList.add('message-text');
    messageText.textContent = message.text;

    const messageTimestamp = document.createElement('div');
    messageTimestamp.classList.add('message-timestamp');
    
    messageTimestamp.textContent = messageDate.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });

    messageBubble.appendChild(messageText);
    messageBubble.appendChild(messageTimestamp);

    chatArea.appendChild(messageBubble);
    chatArea.scrollTop = chatArea.scrollHeight;
}