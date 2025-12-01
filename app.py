"""
Snaps Editor - AI Background Remover & Editor
A Flask web application for AI-powered image background manipulation.

Features:
- Remove Background: AI-powered background removal using rembg
- Blur Background: Adjustable background blur with server-side rendering
- AI Background: Mock AI background generation

Author: Built with Flask and AI
License: MIT
"""

import os
from flask import Flask, render_template, request, send_file
from rembg import remove
from PIL import Image, ImageDraw, ImageFilter
import io
import random

app = Flask(__name__)

@app.route('/')
def index():
    """Render the main application page."""
    return render_template('index.html')

@app.route('/remove-bg', methods=['POST'])
def remove_bg():
    """
    Remove background from uploaded image using AI.
    
    Expects:
        image: Image file in request.files
    
    Returns:
        PNG image with transparent background
    """
    if 'image' not in request.files:
        return 'No image uploaded', 400
    
    file = request.files['image']
    if file.filename == '':
        return 'No image selected', 400

    try:
        import datetime
        def log(msg):
            with open('debug.log', 'a') as f: f.write(f"{datetime.datetime.now()}: {msg}\n")
            
        log("Processing started...")
        input_image = Image.open(file.stream)
        log("Image opened, removing background...")
        output_image = remove(input_image)
        log("Background removed, saving...")
        
        img_io = io.BytesIO()
        output_image.save(img_io, 'PNG')
        img_io.seek(0)
        log(f"Processing complete, sending response. Size: {img_io.getbuffer().nbytes} bytes")
        
        return send_file(
            img_io,
            mimetype='image/png',
            as_attachment=True,
            download_name='removed-background.png'
        )
    except Exception as e:
        with open('debug.log', 'a') as f: f.write(f"Error: {e}\n")
        return str(e), 500

@app.route('/ai-background', methods=['POST'])
def ai_background():
    """
    Generate AI background using Pollinations.ai (free Stable Diffusion API).
    
    Expects:
        image: Image file in request.files
        prompt: Background description in request.form
    
    Returns:
        PNG image with AI-generated photorealistic background
    """
    print("=" * 50)
    print("AI BACKGROUND ENDPOINT CALLED")
    print(f"Request files: {request.files}")
    print(f"Request form: {request.form}")
    print("=" * 50)
    
    if 'image' not in request.files:
        print("ERROR: No image uploaded")
        return 'No image uploaded', 400
    
    file = request.files['image']
    prompt = request.form.get('prompt', '')
    
    print(f"File: {file.filename}")
    print(f"Prompt: {prompt}")
    
    if file.filename == '':
        print("ERROR: No image selected")
        return 'No image selected', 400

    # Debug logging
    try:
        with open('backend_debug.log', 'a') as f:
            import datetime
            f.write(f"[{datetime.datetime.now()}] Request received. File: {file.filename}, Prompt: {prompt}\n")
    except:
        pass

    try:
        print("Starting image processing...")

        # Load the input image
        input_image = Image.open(file.stream).convert("RGBA")
        
        # 1. Remove Background from subject
        print("Removing background from subject...")
        subject = remove(input_image)
        
        # 2. Generate AI background using Pollinations.ai (free Stable Diffusion API)
        import requests
        
        # Enhance the prompt for better background generation
        enhanced_prompt = f"professional photography background scene, {prompt}, high quality, detailed, 8k, photorealistic, no people, no text, landscape background"
        
        print(f"Generating AI background with prompt: '{enhanced_prompt}'")
        
        try:
            # Pollinations.ai API - completely free, no key needed
            # Generates 1024x1024 images using Stable Diffusion
            api_url = "https://image.pollinations.ai/prompt/" + requests.utils.quote(enhanced_prompt)
            
            # Add parameters for better quality
            api_url += "?width=1024&height=1024&seed=-1&nologo=true"
            
            print(f"Calling Pollinations.ai API...")
            
            # Download the generated image
            response = requests.get(api_url, timeout=30)
            
            if response.status_code == 200:
                print("AI image generated successfully!")
                
                # Load the AI-generated background
                ai_background = Image.open(io.BytesIO(response.content)).convert('RGBA')
                
                # Resize to match input image dimensions
                ai_background = ai_background.resize(input_image.size, Image.Resampling.LANCZOS)
                
                # 3. Composite subject over AI background
                print("Compositing subject over AI background...")
                final_image = Image.alpha_composite(ai_background, subject)
                
                # Return the final image
                img_io = io.BytesIO()
                final_image.save(img_io, 'PNG')
                img_io.seek(0)
                
                print("Success! Sending AI-generated image")
                return send_file(
                    img_io,
                    mimetype='image/png',
                    as_attachment=True,
                    download_name='ai-background.png'
                )
            else:
                print(f"API returned status code: {response.status_code}")
                raise Exception("Failed to generate AI image")
                
        except Exception as api_error:
            print(f"AI generation error: {api_error}")
            print("Falling back to gradient background...")
            
            # FALLBACK: Create gradient if API fails
            from PIL import ImageDraw
            
            prompt_lower = prompt.lower()
            print(f"Generating gradient background for: '{prompt_lower}'")
            
            # Create a gradient background based on keywords
            background = Image.new('RGBA', input_image.size, (255, 255, 255, 255))
            draw = ImageDraw.Draw(background)
            
            width, height = input_image.size
            
            # Detect scene type and create appropriate background
            if ('sunset' in prompt_lower or 'sunrise' in prompt_lower) and ('beach' in prompt_lower or 'ocean' in prompt_lower):
                print("Creating sunset beach gradient")
                for y in range(height):
                    ratio = y / height
                    r = int(255 - (ratio * 80))
                    g = int(140 + (ratio * 40))
                    b = int(80 + (ratio * 150))
                    draw.line([(0, y), (width, y)], fill=(r, g, b, 255))
                    
            elif any(word in prompt_lower for word in ['sunset', 'sunrise', 'dusk', 'dawn']):
                print("Creating sunset gradient")
                for y in range(height):
                    ratio = y / height
                    r = int(255 - (ratio * 135))
                    g = int(120 - (ratio * 70))
                    b = int(60 + (ratio * 140))
                    draw.line([(0, y), (width, y)], fill=(r, g, b, 255))
            
            elif any(word in prompt_lower for word in ['sky', 'blue', 'ocean', 'sea', 'water']):
                print("Creating sky/ocean gradient")
                for y in range(height):
                    brightness = int(255 - (y / height * 120))
                    color = (max(100, brightness - 100), max(150, brightness - 50), brightness, 255)
                    draw.line([(0, y), (width, y)], fill=color)
                    
            elif any(word in prompt_lower for word in ['night', 'dark', 'space', 'stars', 'galaxy']):
                print("Creating night sky with stars")
                for y in range(height):
                    brightness = int(30 + (y / height * 20))
                    draw.line([(0, y), (width, y)], fill=(brightness - 10, brightness - 5, brightness, 255))
                for _ in range(100):
                    x, y = random.randint(0, width), random.randint(0, height)
                    draw.ellipse([(x, y), (x + 2, y + 2)], fill=(255, 255, 255, random.randint(150, 255)))
                    
            else:
                print("Creating random pastel gradient")
                color1 = (random.randint(200, 255), random.randint(200, 255), random.randint(200, 255))
                color2 = (random.randint(150, 220), random.randint(150, 220), random.randint(150, 220))
                for y in range(height):
                    ratio = y / height
                    r = int(color1[0] * (1 - ratio) + color2[0] * ratio)
                    g = int(color1[1] * (1 - ratio) + color2[1] * ratio)
                    b = int(color1[2] * (1 - ratio) + color2[2] * ratio)
                    draw.line([(0, y), (width, y)], fill=(r, g, b, 255))
            
            print("Compositing subject over gradient background...")
            final_image = Image.alpha_composite(background, subject)
            
            img_io = io.BytesIO()
            final_image.save(img_io, 'PNG')
            img_io.seek(0)
            
            return send_file(
                img_io,
                mimetype='image/png',
                as_attachment=True,
                download_name='ai-background.png'
            )
        
    except Exception as e:
        error_msg = f"Error in ai_background: {str(e)}"
        print(error_msg)
        import traceback
        traceback_str = traceback.format_exc()
        print(traceback_str)
        
        # Write to error log file
        try:
            with open('backend_error.log', 'a') as f:
                import datetime
                f.write(f"\n[{datetime.datetime.now()}] {error_msg}\n")
                f.write(traceback_str)
        except:
            pass
            
        return str(e), 500

@app.route('/blur-background', methods=['POST'])
def blur_background():
    """
    Create composite image with blurred background.
    
    Expects:
        original: Original image file
        subject: Removed background image file
        blur: Blur intensity (0-10)
    
    Returns:
        PNG image with blurred background and sharp subject
    """
    if 'original' not in request.files or 'subject' not in request.files:
        return 'Missing image files', 400
    
    try:
        original_file = request.files['original']
        subject_file = request.files['subject']
        blur_intensity = int(request.form.get('blur', 5))
        
        # Open images
        original = Image.open(original_file.stream).convert('RGB')
        subject = Image.open(subject_file.stream).convert('RGBA')
        
        # Apply Gaussian blur to original
        blurred_bg = original.filter(ImageFilter.GaussianBlur(radius=blur_intensity * 2))
        
        # Convert to RGBA for compositing
        blurred_bg = blurred_bg.convert('RGBA')
        
        # Composite subject over blurred background
        result = Image.alpha_composite(blurred_bg, subject)
        
        # Save to bytes
        img_io = io.BytesIO()
        result.save(img_io, 'PNG')
        img_io.seek(0)
        
        return send_file(
            img_io, 
            mimetype='image/png',
            as_attachment=True,
            download_name='blurred-background.png'
        )
        
    except Exception as e:
        return str(e), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)
