- Download high-quality PNG with transparent background
- Drag-and-drop support

### 2. Blur Background
- Adjustable blur intensity slider (0-10)
- Real-time visual preview
- Server-side blur rendering for reliable downloads
- Blur applied only to background, subject stays sharp

### 3. AI Background (Mock)
- Chat-based interface
- Upload image and describe desired background
- Generates mock AI backgrounds

## Technology Stack

### Backend
- **Flask**: Python web framework
- **rembg**: AI background removal library
- **Pillow (PIL)**: Image processing and Gaussian blur
- **ImageFilter**: Server-side blur effects

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with custom properties
- **Vanilla JavaScript**: No framework dependencies
- **Canvas API**: Image compositing

## Installation

1. **Clone the repository**
   ```bash
   cd backgroundremover
   ```

2. **Create virtual environment**
   ```bash
   python -m venv .venv
   .venv\Scripts\activate  # Windows
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

## Project Structure

```
backgroundremover/
├── app.py                      # Flask application
├── requirements.txt            # Python dependencies
├── templates/
│   └── index.html             # Single-page application
├── static/
│   ├── remove-background.png  # Feature preview image
│   ├── blur-image.jpg         # Feature preview image
│   └── ai-background.png      # Feature preview image
└── .venv/                     # Virtual environment (not in repo)
```

## API Endpoints

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
Mock AI background generation.
- **Input**: 
  - `image` (multipart/form-data)
  - `prompt` (text description)
- **Output**: PNG image with colored background (mock)

## Features in Detail

### Blur Feature Workflow
1. User uploads image
2. Backend removes background using `rembg`
3. Frontend displays:
   - Original image
   - Subject overlaid on blurred background
4. User adjusts blur slider (0-10)
5. Visual blur updates in real-time (CSS filter)
6. On download:
   - Frontend sends original + subject + blur intensity to backend
   - Backend applies Gaussian blur to original
   - Backend composites blurred background with sharp subject
   - Returns final PNG

### Design Highlights
- **Viewport-fitted**: All content fits without scrolling
- **Modern gradient UI**: Purple-gradient feature cards
- **Responsive**: Works on mobile and desktop
- **Glassmorphism**: Frosted glass effect on cards
- **Smooth animations**: Hover effects and transitions

## Development Notes

- All JavaScript is minified in production HTML
- Server-side blur ensures cross-browser compatibility
- No external CSS/JS files - everything in one HTML file
- Uses modern CSS (grid, flexbox, custom properties)

## License

MIT License - feel free to use for any purpose.

## Author

Built with ❤️ using Flask and AI
