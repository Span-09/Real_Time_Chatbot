Real-Time Chat Web App
This project is a production-ready, real-time web chat application built using only Vanilla JavaScript, HTML, and CSS. The backend services, including the database and authentication, are handled by Firebase.

Daily Progress
Day 1: Static UI Layout
  What was implemented:
    Created the complete static layout for the chat screen (
    chat.html) with a responsive design.
    The UI includes a fixed header, a scrollable message area, styled message bubbles, and a message input form.
    Added static versions of stretch task features: date separators and a typing indicator.
    Firebase collections and data format used:
    No Firebase features were used for the Day 1 static layout.
    
  How to run and test the app:
    Place the chat.html and styles.css files in the same project directory.
    Open the chat.html file in a modern web browser.

Day 2: Firebase Setup & Message Sending
  What was implemented today:
    Firebase Integration: Initialized a Firebase project and configured the app with Firestore and Authentication.
    Anonymous Authentication: Implemented anonymous user sign-in to provide a unique senderId for each session.
    Message Sending: Enabled message sending on "Send" button click, creating a ChatMessage object and saving it to Firestore.  
    Stretch Tasks: Added input validation (300-character limit, no empty sends), a "Sending..." indicator for UX, and error handling with user feedback.
  
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
    Open the chat.html file in a web browser.
    Type a message and click "Send".
    Verify the message was saved in your Firestore database under the chatrooms/general/messages collection.

Day 3: Real-Time Listener & Read Status
  What was implemented today:
    Real-Time Messages: Implemented an onSnapshot listener to display new messages in real-time without needing a page refresh.    
    Read Status Tracking: Created a markAsRead function that continuously updates a lastReadTimestamp for the current user in the /reads/{userId}/{roomId} path as long as the chat screen is open.
    UI Enhancements: Added dynamic date separators and a "New Messages" separator to improve the user experience. The app also now auto-scrolls to the first unread message.
    Stretch Task - Read Receipts: A single gray tick (✓) appears on sent messages. The tick turns blue when the other user in the chat has read the message.
    Stretch Task - Offline Handling: Added a banner that appears at the top of the chat to notify the user if their connection to the backend is lost.
    
  Firebase collections and data format used:
    Path: /reads/{userId}/{roomId} 
    Data Format:
    JSON
    {
      "lastReadTimestamp": "serverTimestamp"
    }

  How to run and test the app:
    Open chat.html in a normal browser window (User A).
    Open chat.html in a new Incognito Window (User B).
    From User A, send a message. It will appear instantly in User B's window.
    The message from User A will have a gray tick. Once User B sees the message, the tick in User A's window will turn blue.
    Disconnect from the internet to see the "offline" banner appear.
