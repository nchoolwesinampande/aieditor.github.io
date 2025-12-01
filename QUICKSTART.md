# Quick Start Guide

## First Time Setup

1. **Activate Virtual Environment**
   ```bash
   .venv\Scripts\activate
   ```

2. **Verify Dependencies Installed**
   ```bash
   pip list
   ```
   Should show: Flask, rembg, Pillow, etc.

3. **Run the Application**
   ```bash
   python app.py
   ```

4. **Open in Browser**
   ```
   http://localhost:5000
   ```

## Using the Features

### Remove Background
1. Click "Remove Background" card
2. Upload JPG/PNG image (up to 10MB)
3. Click "Process Image"
4. Download transparent PNG

### Blur Background
1. Click "Blur Image" card
2. Upload image
3. Click "Process Image"
4. Adjust slider (0-10) to set blur intensity
5. Download blurred image with current intensity

### AI Background (Mock)
1. Click "AI Background" card
2. Upload image
3. Type background description
4. Get AI-generated background (mock colored background)

## Troubleshooting

### Port Already in Use
```bash
# Change port in app.py line:
app.run(debug=True, port=5001)  # Change 5000 to 5001
```

### Dependencies Missing
```bash
pip install -r requirements.txt
```

### Virtual Environment Not Activated
Look for `(.venv)` at start of command prompt

## Development

### Debug Mode
Already enabled in `app.py`:
```python
app.run(debug=True, port=5000)
```

### File Structure
- `app.py` - Backend routes
- `templates/index.html` - Frontend (all CSS/JS included)
- `static/` - Feature preview images

Enjoy! 🚀
