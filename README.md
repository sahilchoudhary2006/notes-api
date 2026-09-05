# 📝 NoteFlow

A modern, highly interactive, full-stack notes application designed to handle everything from simple text notes to complex to-do lists and hand-drawn whiteboards. Built with the MERN stack and polished with beautiful micro-interactions.

## ✨ Features

- **Rich Note Types**: Support for Text Notes, interactive Checklists, and free-hand Whiteboard Drawings.
- **Smart Filtering**: Seamlessly filter your dashboard to view only Drawings, Lists, or Text notes with a single click.
- **Context-Aware Creation**: The Floating Action Button (FAB) intelligently adapts to your current filter (e.g., clicking '+' while on the Drawings tab instantly opens a new whiteboard).
- **Google OAuth Integration**: Secure, frictionless login using your Google Account.
- **Optimistic UI Updates**: Check off list items instantly without waiting for network requests.
- **Beautiful & Dynamic UI**: Built with Tailwind CSS and Framer Motion for a sleek dark/light mode experience with smooth page transitions.

## 🛠️ Technology Stack

**Frontend:**
- React (Vite)
- Tailwind CSS (Styling)
- Framer Motion (Animations)
- React Hook Form & Zod (Form Validation)
- React Sketch Canvas (Drawing capabilities)

**Backend:**
- Node.js & Express.js
- MongoDB & Mongoose (Database)
- JSON Web Tokens (JWT) & Google OAuth (Authentication)

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB Atlas account (or local MongoDB)
- Google Cloud Console account (for OAuth Credentials)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sahilchoudhary2006/notes-api.git
   cd notes-api
   ```

2. **Setup the Backend**
   ```bash
   # Install dependencies
   npm install

   # Create a .env file and add:
   PORT=8000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CORS_ORIGIN=http://localhost:5173
   GOOGLE_CLIENT_ID=your_google_client_id
   
   # Start the development server
   npm run dev
   ```

3. **Setup the Frontend**
   ```bash
   cd frontend
   npm install

   # Create a .env file and add:
   VITE_API_URL=http://localhost:8000/api/v1
   VITE_GOOGLE_CLIENT_ID=your_google_client_id

   # Start the Vite development server
   npm run dev
   ```

## 🌐 Live Demo
- **Frontend**: [NoteFlow on Vercel](https://noteflow-black-nu.vercel.app/)
- **Backend API**: [Hosted on Render](https://notes-api-h3ha.onrender.com)

## 🤝 Contributing
Contributions, issues and feature requests are welcome! Feel free to check the issues page.

## 📝 License
This project is open-source and available under the MIT License.
