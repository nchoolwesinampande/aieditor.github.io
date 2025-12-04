# Snaps Editor - AI Background Remover & Editor

A powerful web application for AI-powered image background removal, blurring, and AI background generation.

![Snaps Editor](https://img.shields.io/badge/Snaps-Editor-purple) ![Python](https://img.shields.io/badge/Python-3.8+-blue) ![Flask](https://img.shields.io/badge/Flask-3.0+-green)

## ✨ Features

### 1. Remove Background
- AI-powered background removal using `rembg`
- Supports JPG and PNG images up to 10MB
- Download high-quality PNG with transparent background
- Drag-and-drop support

### 2. Blur Background
- Adjustable blur intensity slider (0-10)
- Real-time visual preview
- Server-side blur rendering for reliable downloads
- Blur applied only to background, subject stays sharp

### 3. AI Background
- Chat-based interface
- Upload image and describe desired background
- AI-powered background generation

## 🛠 Technology Stack

### Backend
- **Flask**: Python web framework
- **rembg**: AI background removal library
- **Pillow (PIL)**: Image processing and Gaussian blur

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with custom properties
- **Vanilla JavaScript**: No framework dependencies

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/snaps-editor.git
   cd snaps-editor
   ```

2. **Create virtual environment**
   ```bash
   python -m venv .venv
   
   # Windows
   .venv\Scripts\activate
   
   # Mac/Linux
   source .venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the application**
   ```bash
   python app.py
   ```

5. **Open in browser**
   ```
   http://localhost:5000
   ```

## 📁 Project Structure

```
snaps-editor/
├── app.py                      # Flask application
├── requirements.txt            # Python dependencies
├── README.md                   # Documentation
├── QUICKSTART.md               # Quick start guide
├── .gitignore                  # Git ignore file
├── templates/
│   └── index.html              # Single-page application
└── static/
    ├── style.css               # Application styles
    ├── script.js               # Application logic
    ├── remove-background.png   # Feature preview image
    ├── blur-image.jpg          # Feature preview image
    └── ai-background.png       # Feature preview image
```

## 🔌 API Endpoints

### POST /remove-bg
Removes background from uploaded image.
- **Input**: `image` (multipart/form-data)
- **Output**: PNG image with transparent background

### POST /blur-background
Creates blurred background composite.
- **Input**: 
  - `original` (original image)
  - `subject` (removed background image)
  - `blur` (intensity 0-10)
- **Output**: PNG image with blurred background

### POST /ai-background
AI background generation.
- **Input**: 
  - `image` (multipart/form-data)
  - `prompt` (text description)
- **Output**: PNG image with AI-generated background

## 🎨 Design Highlights

- **Viewport-fitted**: All content fits without scrolling
- **Modern gradient UI**: Purple-gradient feature cards
- **Responsive**: Works on mobile and desktop
- **Glassmorphism**: Frosted glass effect on cards
- **Smooth animations**: Hover effects and transitions

## 📝 License

MIT License - feel free to use for any purpose.

## 👤 Author

Built by **Nchoolwe Progress Sinampande**

---

© 2025 Snaps Editor. All rights reserved.
