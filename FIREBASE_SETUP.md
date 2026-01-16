# How to Deploy to Firebase Hosting

You have switched to Firebase Hosting! This is a great choice as it integrates perfectly with your backend.

## Prerequisites

I have already created the necessary configuration files for you:
- `firebase.json`: Tells Firebase to serve the `dist` folder and handle Single Page App (SPA) routing.
- `.firebaserc`: Links this folder to your project ID (`level-up-choice-board-game`).
- `.github/workflows/firebase-hosting.yml`: An automated script to deploy your app whenever you update the code.

## 🚀 Option 1: Automated Deployment (Recommended)

This sets up your GitHub repository to automatically deploy to Firebase whenever you push changes to the `main` branch.

**You need to do ONE step to enable this:**

1.  **Generate a Service Account Key:**
    *   Go to the Google Cloud Console for your project: [https://console.cloud.google.com/iam-admin/serviceaccounts?project=level-up-choice-board-game](https://console.cloud.google.com/iam-admin/serviceaccounts?project=level-up-choice-board-game)
    *   Select your project (`level-up-choice-board-game`) if asked.
    *   Look for a service account named `firebase-adminsdk` or create a new one with "Firebase Admin" or "Editor" role.
    *   Click the **three dots** (actions) -> **Manage keys**.
    *   Click **Add Key** -> **Create new key** -> **JSON**.
    *   A file will download to your computer.

2.  **Add the Secret to GitHub:**
    *   Go to your GitHub Repository page.
    *   Click **Settings** > **Secrets and variables** > **Actions**.
    *   Click **New repository secret**.
    *   **Name:** `FIREBASE_SERVICE_ACCOUNT_LEVEL_UP_CHOICE_BOARD_GAME`
    *   **Value:** Paste the *entire content* of the JSON file you just downloaded.
    *   Click **Add secret**.

**That's it!** The next time you push code, the "Deploy to Firebase Hosting" action will run and your site will be live.

## 💻 Option 2: Manual Deployment (From your computer)

If you prefer to deploy manually from your terminal:

1.  **Install Firebase CLI:**
    ```bash
    npm install -g firebase-tools
    ```

2.  **Login:**
    ```bash
    firebase login
    ```

3.  **Build your app:**
    ```bash
    npm run build
    ```

4.  **Deploy:**
    ```bash
    firebase deploy --only hosting
    ```

## Your Live URL
Once deployed, your app will be available at:
**https://level-up-choice-board-game.web.app**
