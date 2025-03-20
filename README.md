# E-Commerce Web Application

A modern e-commerce web application built with React and Firebase. This project provides a complete shopping experience with product filtering, search, cart functionality, and admin features.

## Features

- User authentication (login, registration)
- Role-based access control (admin, editor, viewer, user)
- Product browsing with filtering by:
  - Price range
  - Availability
- Product search
- Shopping cart
- Admin dashboard
- Product management (add, edit, delete)
- Responsive design

## Tech Stack

- **Frontend**: React, React Router
- **Backend**: Firebase (Authentication, Firestore)
- **Styling**: CSS with responsive design

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account

### Installation

1. Clone the repository
   ```
   git clone https://github.com/your-username/e-commerce.git
   cd e-commerce
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with your Firebase config:
   ```
   REACT_APP_FIREBASE_API_KEY=your-api-key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your-auth-domain
   REACT_APP_FIREBASE_PROJECT_ID=your-project-id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   REACT_APP_FIREBASE_APP_ID=your-app-id
   ```

4. Start the development server
   ```
   npm start
   ```

## Firebase Setup

1. Create a new Firebase project
2. Enable Authentication (Email/Password and Google)
3. Create a Firestore database
4. Set up your security rules
5. Create the required collections:
   - users
   - products
   - orders
   - categories

## Admin Account Setup

1. Register a new user account
2. In Firebase console, go to Firestore and find the user document
3. Add the field `isAdmin: true` or `role: "admin"` to grant admin privileges

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
