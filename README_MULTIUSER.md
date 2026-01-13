# Multi-User System Implementation

This project has been updated to support multiple teachers and multiple classes.

## Architecture

The application is structured to support a transition from a local "Mock Backend" to a real Firebase implementation.

### Current Implementation: Mock Backend
Currently, the application runs in a **Demo Mode** using `localStorage` to simulate a database. This allows for:
- Creating Teacher Accounts
- Creating Classes
- Student Joining via Class Code
- Submitting Work
- Teacher Reviewing Work

All data is stored in the browser's `localStorage` under the key `lvlup_v2_db`.

### How to Switch to Firebase

To make this a production-ready multi-device application, follow these steps:

1.  **Create a Firebase Project** at [firebase.google.com](https://firebase.google.com).
2.  **Enable Authentication** (Email/Password).
3.  **Enable Cloud Firestore**.
4.  **Create `src/services/firebase.js`**:
    ```javascript
    import { initializeApp } from "firebase/app";
    import { getFirestore } from "firebase/firestore";
    import { getAuth } from "firebase/auth";

    const firebaseConfig = {
      // Your config from Firebase Console
    };

    const app = initializeApp(firebaseConfig);
    export const db = getFirestore(app);
    export const auth = getAuth(app);
    ```
5.  **Create `src/services/firebaseBackend.js`**:
    - Implement the same methods as `src/services/mockBackend.js` (e.g., `loginTeacher`, `createClass`) but using Firebase SDK calls.
6.  **Update `src/context/AuthContext.jsx`**:
    - Import `backend` from the new firebase backend file instead of `mockBackend`.

## User Guide

### For Teachers
1. Select **"I am a Teacher"** on the home screen.
2. Sign up for an account.
3. Use the **+** button to create a class.
4. Share the **Class Code** with your students.
5. Click on a class to view pending submissions and approve them.

### For Students
1. Select **"I am a Student"** on the home screen.
2. Enter the **Class Code** provided by your teacher.
3. Enter your name.
4. Complete activities and submit them!
