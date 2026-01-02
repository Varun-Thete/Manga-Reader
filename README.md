# 📖 Manga Reader

A self-hosted, web-based comic and manga reader for your `.cbz` collection. Built with a modern **Vue 3** frontend and a robust **Node.js** backend.

## ✨ Features

- **📂 Automatic Library Scanning**: Recursively scans your `library` folder for `.cbz` files and organizes them by series.
- **📖 Flexible Reading Modes**: Switch seamlessly between **Single Page** and **Double Page** views.
- **💾 Progress Tracking**: Automatically remembers the last page you read for every comic.
- **⚡ Fast Streaming**: Pages are extracted from archives on-the-fly, ensuring quick load times without unzipping the entire file.
- **⌨️ Keyboard Navigation**: Use `Left Arrow` and `Right Arrow` to navigate pages effortlessly.
- **👆 Intuitive Controls**: Click the left/right sides of the screen to turn pages, or use the built-in slider.

## 🛠️ Tech Stack

- **Frontend**: Vue 3, Vite, Vue Router, Axios
- **Backend**: Node.js, Express, SQLite, Yauzl (Zip extraction)
- **Database**: SQLite (for storing metadata and reading progress)

## 🚀 Getting Started

Follow these instructions to set up the project locally.

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+ recommended)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/manga-reader.git
cd manga-reader
```

### 2. Setup Backend

Navigate to the backend folder and install dependencies:

```bash
cd backend
npm install
```

### 3. Setup Frontend

Open a new terminal, navigate to the frontend folder, and install dependencies:

```bash
cd frontend
npm install
```

### 4. Configure Library

1. Create a folder named `library` in the **root** execution directory (one level above `backend` and `frontend`).
2. Add your `.cbz` files into this folder. You can organize them into subfolders (e.g., `library/One Piece/Vol1.cbz`), which will be treated as Series names.

Directory Structure Example:
```
Manga-Reader/
├── backend/
├── frontend/
├── library/          <-- Create this folder
│   ├── Naruto/       <-- Series Name
│   │   ├── vol1.cbz
│   │   └── vol2.cbz
│   └── Solo Leveling.cbz
└── README.md
```

## 🏃 Usage

### Start the Backend
From the `backend` directory:
```bash
npm start
```
*The backend will start at `http://localhost:3000` and perform an initial scan of your library.*

### Start the Frontend
From the `frontend` directory:
```bash
npm run dev
```
*The frontend will start (usually at `http://localhost:5173`).*

Open your browser and navigate to the frontend URL to start reading!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

[MIT](LICENSE)
