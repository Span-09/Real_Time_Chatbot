Real-Time Chat Web App: 
This project is a production-ready, real-time web chat application built using only Vanilla JavaScript, HTML, and CSS. The backend services, including the database and authentication, are handled by Firebase.

Daily Progress
Day 1: Static UI Layout
What was implemented:

Created the complete static layout for the chat screen (chat.html) using HTML and CSS.
The layout includes a fixed header, a scrollable message area, and a message input footer.
Implemented distinct styling for sent (right-aligned) and received (left-aligned) message bubbles.
Used Flexbox for the primary layout structure and media queries to ensure responsiveness.
Added static versions of stretch task features: date separators and a typing indicator.
Firebase collections and data format used:
No Firebase features were used for the Day 1 static layout.
How to run and test the app:
Place the chat.html and styles.css files in the same project directory.
Open the chat.html file in a modern web browser.

Day 2: Firebase Setup & Message Sending
What was implemented today:

Firebase Integration: Initialized a Firebase project and configured the app with the necessary SDKs for Authentication and Firestore.
Anonymous Authentication: Implemented anonymous user sign-in using signInAnonymously() to provide a unique senderId for each user session.
Message Sending: Added an event listener to the "Send" button that creates a ChatMessage object and saves it to a Firestore sub-collection.
Stretch Task - Input Validation: The maxlength="300" attribute was added to the input field, and a JavaScript check was implemented to prevent sending empty messages.
Stretch Task - UX Feedback: The "Send" button is disabled and its text changes to "Sending..." during the write operation to give the user immediate feedback.
Stretch Task - Error Handling: The entire message sending process is wrapped in a try...catch block. If an error occurs while writing to Firestore, an alert notifies the user, and the button is re-enabled.
Firebase collections and data format used:

Path: /chatrooms/{roomId}/messages/{messageId}

Data Format:

JSON

{
  "senderId": "string",
  "text": "string",
  "timestamp": "serverTimestamp"
}

How to run and test the app:

Open the chat.html file in a web browser. The app will automatically sign you in anonymously.
Type a message in the input box at the bottom and click "Send".
Observe the "Sending..." indicator on the button.
To verify the message was saved, open your Firebase project console, navigate to Firestore Database, and check for the new message document inside the chatrooms/general/messages collection.
Try to send an empty message or a message longer than 300 characters to test the validation.
