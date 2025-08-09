// Day-3    

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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
let lastMessageDate = null;
const roomId = "general"; // Hardcode room ID for now

const sendButton = document.querySelector('.send-button');
const messageInput = document.querySelector('.message-input');
const chatArea = document.querySelector('.chat-area');

// --- AUTHENTICATION ---
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        console.log('User signed in:', currentUser.uid);
        sendButton.disabled = false;
        // Start listening for real-time messages
        listenForMessages(roomId);
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
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
});

// --- CORE FUNCTIONS ---

/**
 * Sends a message to Firestore.
 */
async function sendMessage() {
    const text = messageInput.value.trim();
    if (text === '' || !currentUser) {
        alert("Cannot send: Message is empty or user not logged in.");
        return;
    }

    sendButton.disabled = true;
    sendButton.textContent = 'Sending...';

    try {
        const messagesRef = collection(db, 'chatrooms', roomId, 'messages');
        await addDoc(messagesRef, {
            senderId: currentUser.uid,
            text: text,
            timestamp: serverTimestamp()
        });
        messageInput.value = '';
    } catch (error) {
        console.error("Error sending message:", error);
        alert("Failed to send message. Please try again.");
    } finally {
        sendButton.disabled = false;
        sendButton.textContent = 'Send';
        messageInput.focus();
    }
}

/**
 * Sets up a real-time listener for messages in a chat room.
 */
function listenForMessages(roomId) {
    const messagesRef = collection(db, 'chatrooms', roomId, 'messages');
    const q = query(messagesRef, orderBy('timestamp'));
    const offlineIndicator = document.getElementById('offline-indicator');

    onSnapshot(q, (snapshot) => {
        // --- Offline Detection Logic ---
        if (snapshot.metadata.fromCache) {
            offlineIndicator.style.display = 'block';
        } else {
            offlineIndicator.style.display = 'none';
        }

        chatArea.innerHTML = ''; // Clear chat for fresh render
        lastMessageDate = null;

        snapshot.docs.forEach(doc => {
            const message = { ...doc.data(), id: doc.id };
            const isSent = message.senderId === currentUser?.uid;
            displayMessage(message, isSent);
        });

        if (currentUser) {
            markAsRead(currentUser.uid, roomId);
        }

        chatArea.scrollTop = chatArea.scrollHeight;
    });
}

/**
 * Updates the last read timestamp for the current user in the current room.
 * This fulfills the requirement to track read status. [cite: 40, 41]
 */
function markAsRead(userId, roomId) {
    if (!userId || !roomId) return;
    const readStatusRef = doc(db, 'reads', userId, 'rooms', roomId);
    setDoc(readStatusRef, {
        lastReadTimestamp: serverTimestamp()
    }, { merge: true });
}


// --- UI HELPER FUNCTIONS ---

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

function createAndDisplayDateSeparator(date) {
    const separator = document.createElement('div');
    separator.classList.add('date-separator');
    const separatorText = document.createElement('span');
    separatorText.textContent = formatDateSeparator(date);
    separator.appendChild(separatorText);
    chatArea.appendChild(separator);
}

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
    
    const timestampText = document.createElement('span'); // Span for the time text
    timestampText.textContent = messageDate.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
    
    messageTimestamp.appendChild(timestampText);

    // --- Read Receipt Logic ---
    if (isSent) {
        const readReceipts = document.createElement('span');
        readReceipts.classList.add('read-receipts');
        readReceipts.textContent = '✓'; // Single tick for "sent"
        
        // FUTURE LOGIC: To implement a double tick for "read", you would check
        // if another user's lastReadTimestamp is greater than this message's timestamp.
        // For now, we'll just show a single tick.

        messageTimestamp.appendChild(readReceipts);
    }

    messageBubble.appendChild(messageText);
    messageBubble.appendChild(messageTimestamp);
    chatArea.appendChild(messageBubble);
}