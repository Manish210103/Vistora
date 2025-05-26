# 🎥 Vistora — Video Summarization Platform

**Vistora** is a full-stack video summarization web application that allows users to upload videos, processes them using an ML pipeline, and displays summarized insights.

---

## 🧩 Project Structure

## vistora/

├── frontend/ # React app for UI

├── server/ # Express.js backend for API & auth

├── ml-pipeline/ # Python-based video summarization logic

├── .gitignore

└── README.md



---

## 🚀 Features

- 🔐 User authentication (Login/Register)
- ⬆️ Video upload with preview & removal
- 🤖 ML pipeline for video highlight/summarization
- 📝 Summarized text display (based on model output)
- 📊 Placeholder for analytics dashboard (coming soon)
- 📱 Responsive & clean UI (modular with header/footer layout)

---

## 🛠️ Tech Stack

### Frontend (`/frontend`)
- React + Vite
- Axios
- React Router
- Tailwind CSS or Custom CSS (with violet theme)

### Backend (`/server`)
- Node.js + Express
- JWT Authentication
- Multer (video file handling)
- MongoDB (user & video metadata)

### ML Pipeline (`/ml-pipeline`)
- Python
- OpenCV, ffmpeg, Librosa, PyTorch/TensorFlow (for models)
- Pretrained models for highlight extraction

---

## ⚙️ Setup Instructions

### 1. Clone the repository

```
git clone https://github.com/yourusername/vistora.git
cd vistora
```
### 2. Backend Setup (/server)
```
cd server
npm install
# Add your MongoDB URI and JWT secret to .env
npm start
```
### 3. Frontend Setup (/frontend)
```
cd ../frontend
npm install
npm run dev
```
### 4. ML Pipeline Setup (/ml-pipeline)
```
cd ../ml-pipeline
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
# Run your processing script or setup Flask/FastAPI if it's exposed via API
```
### 📂 Environment Variables
Create .env files in relevant folders:

/server/.env
```
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

## 📝 License
This project is licensed under the MIT License. See the LICENSE file for details.
Let me know if you'd like to auto-generate badges, add screenshots, or support Docker.
