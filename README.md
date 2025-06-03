# DaBubble

**DaBubble** is a lightweight Slack-style chat application built with Angular, TypeScript, Firebase, and RxJS. It provides a familiar and intuitive messaging experience with support for direct messages, threads, reactions, and channel management.

## 🔧 Tech Stack

- **Angular** (Frontend framework)
- **TypeScript** (Language)
- **Firebase** (Authentication & Firestore database)
- **RxJS** (Reactive programming)
- **HTML & CSS** (UI design)

## ✨ Features

- 🔐 **Firebase Authentication** – Secure user sign-in
- 💬 **Direct Messages** – One-on-one conversations
- 🧵 **Threads** – Threaded discussions inside channels
- 📢 **Channels** – Group chats organized by topic
- 🎯 **Real-time Updates** – Messages, users, and channels update instantly
- 👍 **Reactions** – Respond to messages with emoji
- 👥 **User Presence** – Track which users are part of which channels

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/BayerTobias/DABubble.git
cd dabubble
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set up Firebase

Replace the contents of `src/environments/environment.ts` with your own Firebase configuration:

```ts
export const environment = {
  firebase: {
    projectId: "your-project-id",
    appId: "your-app-id",
    storageBucket: "your-bucket",
    apiKey: "your-api-key",
    authDomain: "your-auth-domain",
    messagingSenderId: "your-messaging-sender-id",
  },
};
```

> 🔐 You can find these values in your Firebase Console under Project Settings > General > Your apps.

### 4. Run the App

```bash
ng serve
```

The app will be available at `http://localhost:4200`.

## 🌍 Deployment

DaBubble is deployable on any static hosting provider or web server. Make sure your Firebase backend is correctly configured and accessible.

### Example FTP Deployment

Simply build the project and upload the `dist/` folder to your server:

```bash
ng build --configuration=production
```

## 👤 Author

- **Tobias Bayer**

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE.txt) file for details.
