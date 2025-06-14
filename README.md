# Real-Time Chat App

A real-time chat application built with React Native, Expo, and Firebase.

## Features

- ✅ **User Authentication**: Secure login and signup with Firebase Auth
- ✅ **Real-time Messaging**: Instant messaging with Firebase Firestore
- ✅ **Chat List**: View all your conversations in real-time
- ✅ **Direct Messages**: One-on-one conversations with other users
- ✅ **User Profiles**: Update your display name and profile information
- ✅ **Auto-sync**: Messages sync across all devices in real-time
- ✅ **Beautiful UI**: Modern, responsive design with smooth animations

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- Expo CLI (`npm install -g expo-cli`)
- Firebase project with Firestore and Authentication enabled

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your Firebase configuration:
   - Create a `.env` file in the root directory
   - Add your Firebase configuration:
     ```
     EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
     EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
     EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
     EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
     EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
     EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
     ```

4. Start the development server:
   ```bash
   npm start
   ```

## Firebase Setup

### 1. Firestore Database Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null; // Allow reading other users for chat list
    }
    
    // Chat rooms - users can read/write if they're participants
    match /chats/{chatId} {
      allow read, write: if request.auth != null && 
        request.auth.uid in resource.data.participants;
      allow create: if request.auth != null && 
        request.auth.uid in request.resource.data.participants;
      
      // Messages within chats
      match /messages/{messageId} {
        allow read, write: if request.auth != null && 
          request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.participants;
      }
    }
  }
}
```

### 2. Authentication Settings

- Enable Email/Password authentication in Firebase Console
- Configure authorized domains for your app

### 3. Firestore Indexes (Optional)

If you encounter index errors, you may need to create composite indexes in Firebase Console:

1. Go to Firebase Console → Firestore → Indexes
2. Create composite indexes if prompted by error messages
3. Most common index needed:
   - Collection: `chats`
   - Fields: `participants` (Arrays), `lastMessageTime` (Descending)

Note: The app is designed to work without most indexes by sorting data client-side, but creating indexes can improve performance.

## App Structure

```
screens/
├── auth/
│   ├── Login.jsx          # Login screen
│   └── Signup.jsx         # Signup screen
└── main/
    ├── ChatList.jsx       # List of all chats
    ├── ChatRoom.jsx       # Individual chat conversation
    ├── NewChat.jsx        # Find users to start new chats
    └── Profile.jsx        # User profile management

services/
├── authService.jsx        # Firebase Auth operations
├── chatService.jsx        # Chat and messaging operations
└── firestoreService.jsx   # General Firestore operations

hooks/
├── useAuth.jsx           # Authentication state management
├── useChat.jsx           # Chat functionality hooks
└── ...

navigation/
├── AppNavigator.jsx      # Main app navigation
├── AuthStack.jsx         # Authentication flow
└── MainStack.jsx         # Main app screens
```

## How to Use

### 1. Sign Up / Login
- Create a new account with email and password
- Or login with existing credentials

### 2. Start Chatting
- Tap the chat bubble (💬) button to find users
- Search for users by name or email
- Tap on a user to start a conversation

### 3. Chat Features
- Send and receive messages in real-time
- Messages are automatically synced across devices
- View conversation history
- See message timestamps

### 4. Profile Management
- Access your profile from the chat list
- Update your display name
- Sign out securely

## Database Structure

### Users Collection (`/users/{userId}`)
```javascript
{
  uid: "user_id",
  email: "user@example.com",
  firstName: "John",
  lastName: "Doe",
  displayName: "John Doe",
  createdAt: "timestamp",
  updatedAt: "timestamp"
}
```

### Chats Collection (`/chats/{chatId}`)
```javascript
{
  participants: ["user1_id", "user2_id"],
  isGroup: false,
  chatName: null, // or group name
  lastMessage: "Hello there!",
  lastMessageTime: "timestamp",
  lastMessageSenderId: "user1_id",
  unreadCount: {
    "user1_id": 0,
    "user2_id": 1
  },
  createdAt: "timestamp"
}
```

### Messages Subcollection (`/chats/{chatId}/messages/{messageId}`)
```javascript
{
  text: "Hello there!",
  senderId: "user1_id",
  messageType: "text",
  timestamp: "timestamp",
  edited: false,
  editedAt: null
}
```

## Technology Stack

- **Frontend**: React Native, Expo
- **Navigation**: React Navigation
- **Backend**: Firebase (Firestore, Authentication)
- **State Management**: React Hooks
- **Styling**: React Native StyleSheet
- **Form Validation**: Formik + Yup
- **Real-time Updates**: Firestore real-time listeners

## Next Steps (Future Enhancements)

- [ ] Group chat functionality
- [ ] Image/media message support
- [ ] Push notifications
- [ ] Message reactions
- [ ] Message search
- [ ] Online status indicators
- [ ] Message encryption
- [ ] Voice messages
- [ ] Video calling

## Troubleshooting

### Common Issues

1. **Firebase not connecting**: Check your `.env` file and Firebase configuration
2. **Authentication errors**: Verify Firebase Auth is enabled and configured
3. **Firestore permission errors**: Check your Firestore security rules
4. **Metro bundler issues**: Try clearing cache with `expo r -c`

### Development Tips

- Use Expo DevTools for debugging
- Check Firebase console for authentication and database logs
- Use Chrome DevTools for web debugging
- Test on multiple devices to verify real-time sync

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
