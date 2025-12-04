/**
 * Snaps Editor - Main JavaScript
 * AI Background Remover & Editor
 */

// =================================================================
// Constants
// =================================================================
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// =================================================================
// Global State
// =================================================================
let currentMode = 'remove-bg';
let selectedFile = null;
let removedBgBlob = null;
let currentDownloadBlob = null;
let currentDownloadFilename = 'processed.png';

// Dynamic text animation state
const dynamicWords = ['Editor', 'Remover', 'Transformer', 'Enhancer'];
let wordIndex = 0;
let typingTimeout = null;

// =================================================================
// Utility Functions
// =================================================================

/**
 * Debounce function to limit how often a function can be called
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(fn, delay) {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
}

/**
 * Force download a blob with a specific filename
 * This works around browser issues with blob URL downloads
 * @param {Blob} blob - The blob to download
 * @param {string} filename - The filename for the download
 */
function forceDownload(blob, filename) {
    console.log('forceDownload called with:', filename, 'Blob size:', blob.size);

    // Create blob URL
    const url = URL.createObjectURL(blob);
    console.log('Created blob URL:', url);

    // Create and configure anchor element
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;

    // Append to body, click, and remove
    document.body.appendChild(a);
    a.click();

    // Clean up after a delay
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        console.log('Download cleanup complete');
    }, 250);
}

// =================================================================
// Hero Text Updates
// =================================================================

/**
 * Update hero section text based on current mode
 * @param {string} mode - Current tool mode
 */
function updateHeroText(mode) {
    const heroTitle = document.querySelector('.hero h1');
    const heroDesc = document.querySelector('.hero p');

    const content = {
        home: {
            title: 'Snaps <span>Editor</span>',
            desc: 'Upload an image and let our AI automatically extract the subject with pixel-perfect precision.'
        },
        'remove-bg': {
            title: 'Remove <span>Background</span>',
            desc: 'Instantly remove backgrounds from your images using advanced AI technology. Get professional results in seconds.'
        },
        blur: {
            title: 'Blur <span>Background</span>',
            desc: 'Create stunning portrait-style effects by blurring the background while keeping your subject sharp and in focus.'
        },
        'ai-background': {
            title: 'AI <span>Background</span>',
            desc: 'Transform your images with AI-generated backgrounds. Describe what you want and watch the magic happen.'
        }
    };

    if (content[mode]) {
        heroTitle.innerHTML = content[mode].title;
        heroDesc.textContent = content[mode].desc;
    }
}

// =================================================================
// Typing Animation
// =================================================================

/**
 * Start the typing animation on the hero title
 */
function startTyping() {
    if (typingTimeout) clearTimeout(typingTimeout);

    const span = document.querySelector('.hero h1 span');
    const homeView = document.getElementById('home-view');

    if (!span || !homeView || homeView.classList.contains('hidden')) return;

    let charIndex = 0;
    let deleting = false;

    function type() {
        const word = dynamicWords[wordIndex];

        if (deleting) {
            span.textContent = word.substring(0, charIndex);
            charIndex--;
        } else {
            span.textContent = word.substring(0, charIndex + 1);
            charIndex++;
        }

        let speed = deleting ? 40 : 120;

        if (!deleting && charIndex > word.length) {
            speed = 2000;
            deleting = true;
        } else if (deleting && charIndex === 0) {
            deleting = false;
            wordIndex = (wordIndex + 1) % dynamicWords.length;
            speed = 500;
        }

        typingTimeout = setTimeout(type, speed);
    }

    type();
}

/**
 * Stop the typing animation
 */
function stopTyping() {
    if (typingTimeout) {
        clearTimeout(typingTimeout);
        typingTimeout = null;
    }
}

// =================================================================
// View Navigation
// =================================================================

/**
 * Show the home view
 */
function showHome() {
    document.getElementById('home-view').classList.remove('hidden');
    document.getElementById('tool-view').classList.add('hidden');
    document.getElementById('ai-background-section').classList.add('hidden');

    // Update nav active state
    const navLinks = document.querySelectorAll('nav ul li a');
    navLinks.forEach(link => link.classList.remove('active'));
    if (navLinks[0]) navLinks[0].classList.add('active');

    updateHeroText('home');
    setTimeout(startTyping, 200);
}

/**
 * Show a specific tool view
 * @param {string} tool - Tool to show ('remove-bg', 'blur', 'ai-background')
 */
function showTool(tool) {
    currentMode = tool;
    stopTyping();
    updateHeroText(tool);

    document.getElementById('home-view').classList.add('hidden');
    const toolView = document.getElementById('tool-view');
    const aiSection = document.getElementById('ai-background-section');

    toolView.classList.add('hidden');
    aiSection.classList.add('hidden');

    // Update nav active state
    const navLinks = document.querySelectorAll('nav ul li a');
    navLinks.forEach(link => link.classList.remove('active'));

    if (tool === 'remove-bg' && navLinks[0]) navLinks[0].classList.add('active');
    else if (tool === 'blur' && navLinks[1]) navLinks[1].classList.add('active');
    else if (tool === 'ai-background' && navLinks[2]) navLinks[2].classList.add('active');

    if (tool === 'ai-background') {
        aiSection.classList.remove('hidden');
    } else {
        toolView.classList.remove('hidden');
        const title = document.querySelector('#tool-view .tool-title');
        const uploadText = document.querySelector('.upload-text');

        if (tool === 'blur') {
            title.textContent = 'Blur Image Background';
            uploadText.textContent = 'Upload image to blur background';
        } else {
            title.textContent = 'Remove Background';
            uploadText.textContent = 'Drop your image here';
        }

        // Reset tool state when switching tools
        resetToolState();
    }
}

/**
 * Reset tool state to initial upload view
 */
function resetToolState() {
    // Reset global state
    selectedFile = null;
    removedBgBlob = null;
    currentDownloadBlob = null;
    currentDownloadFilename = 'processed.png';

    // Get DOM elements
    const fileInput = document.getElementById('file-input');
    const fileInfo = document.getElementById('file-info');
    const processBtn = document.getElementById('process-btn');
    const uploadSection = document.getElementById('upload-section');
    const processingSection = document.getElementById('processing-section');
    const resultSection = document.getElementById('result-section');
    const resultActions = document.getElementById('result-actions');
    const errorMessage = document.getElementById('error-message');
    const processedImg = document.getElementById('processed-img');
    const blurControls = document.getElementById('blur-controls');
    const blurComposite = document.getElementById('blur-composite');
    const blurFg = document.getElementById('blur-fg');

    // Reset file input
    if (fileInput) fileInput.value = '';
    if (fileInfo) fileInfo.textContent = '';

    // Show upload, hide others
    if (uploadSection) uploadSection.classList.remove('hidden');
    if (processingSection) processingSection.classList.add('hidden');
    if (resultSection) resultSection.classList.add('hidden');
    if (resultActions) resultActions.classList.add('hidden');
    if (processBtn) processBtn.classList.add('hidden');
    if (errorMessage) errorMessage.classList.add('hidden');
    if (blurControls) blurControls.classList.add('hidden');
    if (blurComposite) blurComposite.classList.add('hidden');

    // Clean up blob URLs
    if (processedImg && processedImg.src && processedImg.src.startsWith('blob:')) {
        URL.revokeObjectURL(processedImg.src);
        processedImg.src = '';
    }
    if (blurFg && blurFg.src && blurFg.src.startsWith('blob:')) {
        URL.revokeObjectURL(blurFg.src);
        blurFg.src = '';
    }

    // Show processed image element (hidden during blur mode)
    if (processedImg) processedImg.classList.remove('hidden');
}

// =================================================================
// DOM Ready - Main Initialization
// =================================================================
document.addEventListener('DOMContentLoaded', () => {
    // Start typing animation after delay
    setTimeout(startTyping, 800);

    // -----------------------------------------------------------------
    // Hamburger Menu
    // -----------------------------------------------------------------
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // -----------------------------------------------------------------
    // Navigation Link Handling - Using event delegation for reliability
    // -----------------------------------------------------------------
    const navLinks = document.querySelectorAll('nav ul li a');
    navLinks.forEach((link, index) => {
        // Assign a data attribute to each link for identification
        if (index === 0) link.dataset.tool = 'remove-bg';
        else if (index === 1) link.dataset.tool = 'blur';
        else if (index === 2) link.dataset.tool = 'ai-background';

        link.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation(); // Prevent any parent handlers from interfering

            const tool = this.dataset.tool;
            console.log('Nav link clicked:', tool);

            // Close mobile menu if open
            if (hamburger && navMenu) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }

            // Navigate to the tool
            if (tool) {
                showTool(tool);
            }
        });
    });

    // -----------------------------------------------------------------
    // DOM Element References
    // -----------------------------------------------------------------
    const fileInput = document.getElementById('file-input');
    const uploadBtn = document.getElementById('upload-btn');
    const dropZone = document.getElementById('drop-zone');
    const fileInfo = document.getElementById('file-info');
    const processBtn = document.getElementById('process-btn');
    const uploadSection = document.getElementById('upload-section');
    const processingSection = document.getElementById('processing-section');
    const resultSection = document.getElementById('result-section');
    const resultActions = document.getElementById('result-actions');
    const originalImg = document.getElementById('original-img');
    const processedImg = document.getElementById('processed-img');
    const downloadBtn = document.getElementById('download-btn');
    const resetBtn = document.getElementById('reset-btn');
    const errorMessage = document.getElementById('error-message');
    const blurControls = document.getElementById('blur-controls');
    const blurSlider = document.getElementById('blur-slider');
    const blurValue = document.getElementById('blur-value');

    // Feature card triggers
    const removeBgTrigger = document.getElementById('remove-bg-trigger');
    const blurTrigger = document.getElementById('blur-trigger');
    const aiBgTrigger = document.getElementById('ai-bg-trigger');

    // -----------------------------------------------------------------
    // Blur Composite Elements (for blur preview)
    // -----------------------------------------------------------------
    const imgWrapper = processedImg.parentElement;
    const blurComposite = document.createElement('div');
    blurComposite.id = 'blur-composite';
    blurComposite.className = 'hidden';
    blurComposite.style.position = 'absolute';
    blurComposite.style.top = '0';
    blurComposite.style.left = '0';
    blurComposite.style.width = '100%';
    blurComposite.style.height = '100%';

    const blurBg = document.createElement('img');
    blurBg.id = 'blur-bg';
    blurBg.style.position = 'absolute';
    blurBg.style.top = '50%';
    blurBg.style.left = '50%';
    blurBg.style.transform = 'translate(-50%, -50%)';
    blurBg.style.maxWidth = '100%';
    blurBg.style.maxHeight = '100%';
    blurBg.style.objectFit = 'contain';

    const blurFg = document.createElement('img');
    blurFg.id = 'blur-fg';
    blurFg.style.position = 'absolute';
    blurFg.style.top = '50%';
    blurFg.style.left = '50%';
    blurFg.style.transform = 'translate(-50%, -50%)';
    blurFg.style.maxWidth = '100%';
    blurFg.style.maxHeight = '100%';
    blurFg.style.objectFit = 'contain';

    blurComposite.appendChild(blurBg);
    blurComposite.appendChild(blurFg);
    imgWrapper.appendChild(blurComposite);

    // -----------------------------------------------------------------
    // Feature Card Events
    // -----------------------------------------------------------------
    if (removeBgTrigger) removeBgTrigger.addEventListener('click', () => showTool('remove-bg'));
    if (blurTrigger) blurTrigger.addEventListener('click', () => showTool('blur'));
    if (aiBgTrigger) aiBgTrigger.addEventListener('click', () => showTool('ai-background'));

    // -----------------------------------------------------------------
    // AI Background Chat Elements
    // -----------------------------------------------------------------
    const chatMessages = document.getElementById('chat-messages');
    const chatFileInput = document.getElementById('chat-file-input');
    const chatFileBtn = document.getElementById('chat-file-btn');
    const chatPromptInput = document.getElementById('chat-prompt-input');
    const chatSendBtn = document.getElementById('chat-send-btn');
    let chatImage = null;

    /**
     * Add a user message to the chat
     */
    function addUserMessage(text, imageUrl = null) {
        const div = document.createElement('div');
        div.className = 'message user';
        let html = '';
        if (imageUrl) html += `<img src="${imageUrl}" class="message-img" alt="User Upload">`;
        if (text) html += `<div class="message-bubble">${text}</div>`;
        div.innerHTML = html;
        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    /**
     * Add a bot message to the chat
     * @param {Blob|null} imageBlob - The blob to enable download (if showDownload is true)
     */
    function addBotMessage(text, imageUrl = null, showDownload = false, imageBlob = null) {
        const msgId = 'msg-' + Date.now();
        const div = document.createElement('div');
        div.className = 'message bot';
        div.id = msgId;
        let html = '';
        if (imageUrl) {
            html += `<img src="${imageUrl}" class="message-img" alt="Generated Image">`;
            if (showDownload) {
                html += `<div style="margin-top: 0.5rem;"><button class="btn btn-primary ai-download-btn" style="padding: 0.5rem 1rem; font-size: 0.85rem;">Download</button></div>`;
            }
        }
        if (text) html += `<div class="message-bubble">${text}</div>`;
        div.innerHTML = html;
        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Attach download handler if needed
        if (showDownload && imageBlob) {
            const downloadBtn = div.querySelector('.ai-download-btn');
            if (downloadBtn) {
                downloadBtn.addEventListener('click', () => {
                    forceDownload(imageBlob, 'ai-background.png');
                });
            }
        }

        return msgId;
    }

    // Chat file upload
    if (chatFileBtn) chatFileBtn.addEventListener('click', () => chatFileInput.click());

    if (chatFileInput) {
        chatFileInput.addEventListener('change', (e) => {
            if (e.target.files.length) {
                const file = e.target.files[0];
                if (!file.type.match('image.*')) {
                    addBotMessage('Please select a valid image file (JPG or PNG).');
                    return;
                }
                chatImage = file;
                chatPromptInput.disabled = false;
                chatSendBtn.disabled = false;
                chatPromptInput.focus();

                const reader = new FileReader();
                reader.onload = (e) => {
                    addUserMessage(null, e.target.result);
                    addBotMessage('Great! Now describe the background you want.');
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Chat send on Enter
    if (chatPromptInput) {
        chatPromptInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !chatSendBtn.disabled) chatSendBtn.click();
        });
    }

    // Chat send button
    if (chatSendBtn) {
        chatSendBtn.addEventListener('click', async () => {
            const prompt = chatPromptInput.value.trim();
            if (prompt && chatImage) {
                chatPromptInput.value = '';
                chatPromptInput.disabled = true;
                chatSendBtn.disabled = true;

                addUserMessage(prompt);
                const loadingMsgId = addBotMessage('Generating background... 🎨');

                const formData = new FormData();
                formData.append('image', chatImage);
                formData.append('prompt', prompt);

                try {
                    const response = await fetch('/ai-background', { method: 'POST', body: formData });
                    if (!response.ok) throw new Error(await response.text() || 'Failed to generate background');

                    const blob = await response.blob();
                    const url = URL.createObjectURL(blob);

                    const loadingMsg = document.getElementById(loadingMsgId);
                    if (loadingMsg) loadingMsg.remove();

                    // Pass the blob for proper download
                    addBotMessage('Here is your image with the new background!', url, true, blob);
                    chatImage = null;
                    chatFileInput.value = '';
                    addBotMessage('Upload another image to try again!');
                } catch (err) {
                    console.error('Error:', err);
                    const loadingMsg = document.getElementById(loadingMsgId);
                    if (loadingMsg) loadingMsg.remove();
                    addBotMessage('Sorry, something went wrong: ' + err.message);
                    chatPromptInput.disabled = false;
                    chatSendBtn.disabled = false;
                }
            }
        });
    }

    // -----------------------------------------------------------------
    // File Handling
    // -----------------------------------------------------------------

    /**
     * Handle selected file
     */
    function handleFile(file) {
        if (!file.type.match('image.*')) {
            showError('Please select a valid image file (JPG or PNG).');
            return;
        }
        if (file.size > MAX_FILE_SIZE) {
            showError('File size too large. Please select an image under 10MB.');
            return;
        }

        selectedFile = file;
        fileInfo.textContent = `Selected: ${file.name}`;
        processBtn.classList.remove('hidden');
        errorMessage.classList.add('hidden');

        const reader = new FileReader();
        reader.onload = (e) => {
            originalImg.src = e.target.result;
            blurBg.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    /**
     * Show error message
     */
    function showError(msg) {
        errorMessage.textContent = msg;
        errorMessage.classList.remove('hidden');
    }

    /**
     * Update blur download link
     */
    async function updateBlurDownload() {
        if (currentMode !== 'blur' || !selectedFile || !removedBgBlob) return;

        downloadBtn.textContent = 'Generating...';
        downloadBtn.style.opacity = '0.6';

        try {
            const formData = new FormData();
            formData.append('original', selectedFile);
            formData.append('subject', removedBgBlob);
            formData.append('blur', blurSlider.value);

            const response = await fetch('/blur-background', { method: 'POST', body: formData });
            if (!response.ok) throw new Error('Failed: ' + await response.text());

            const blob = await response.blob();

            // Store blob and filename for download
            currentDownloadBlob = blob;
            currentDownloadFilename = 'blurred-background.png';

            downloadBtn.textContent = 'Download HD';
            downloadBtn.style.opacity = '1';
        } catch (err) {
            console.error('Download error:', err);
            downloadBtn.textContent = 'Download HD';
            downloadBtn.style.opacity = '1';
            showError('Failed: ' + err.message);
        }
    }

    // -----------------------------------------------------------------
    // Upload Events
    // -----------------------------------------------------------------
    uploadBtn.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) handleFile(e.target.files[0]);
    });

    // -----------------------------------------------------------------
    // Blur Slider
    // -----------------------------------------------------------------
    // Debounced version for API calls (prevents excessive requests)
    const debouncedBlurDownload = debounce(updateBlurDownload, 300);

    blurSlider.addEventListener('input', (e) => {
        const value = e.target.value;
        blurValue.textContent = value;
        blurBg.style.filter = `blur(${value * 2}px)`;
        // Visual preview updates immediately, but API call is debounced
        debouncedBlurDownload();
    });

    // -----------------------------------------------------------------
    // Download Button Click Handler
    // -----------------------------------------------------------------
    downloadBtn.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Download button clicked!');
        console.log('currentDownloadBlob:', currentDownloadBlob);
        console.log('currentDownloadFilename:', currentDownloadFilename);

        if (currentDownloadBlob) {
            forceDownload(currentDownloadBlob, currentDownloadFilename);
        } else {
            console.error('No blob available for download!');
            alert('No image ready to download. Please process an image first.');
        }
    });

    // -----------------------------------------------------------------
    // Process Image
    // -----------------------------------------------------------------
    processBtn.addEventListener('click', async () => {
        if (!selectedFile) return;

        uploadSection.classList.add('hidden');
        processingSection.classList.remove('hidden');
        errorMessage.classList.add('hidden');

        const formData = new FormData();
        formData.append('image', selectedFile);

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 60000);

        try {
            const response = await fetch('/remove-bg', {
                method: 'POST',
                body: formData,
                signal: controller.signal
            });
            clearTimeout(timeout);

            if (!response.ok) throw new Error(await response.text() || 'Failed to process image');

            const blob = await response.blob();
            removedBgBlob = blob;
            const url = URL.createObjectURL(blob);

            if (currentMode === 'blur') {
                processedImg.classList.add('hidden');
                blurComposite.classList.remove('hidden');
                blurControls.classList.remove('hidden');

                if (!blurBg.src || blurBg.src === window.location.href) {
                    blurBg.src = originalImg.src;
                }

                blurFg.onload = () => updateBlurDownload();
                blurFg.src = url;

                const blurVal = blurSlider.value;
                blurBg.style.filter = `blur(${blurVal * 2}px)`;
            } else {
                processedImg.classList.remove('hidden');
                blurComposite.classList.add('hidden');
                blurControls.classList.add('hidden');
                processedImg.src = url;

                // Store blob for download
                currentDownloadBlob = blob;
                currentDownloadFilename = 'removed-background.png';
                console.log('Blob stored for download:', currentDownloadFilename, 'Size:', blob.size);
            }

            processingSection.classList.add('hidden');
            resultSection.classList.remove('hidden');
            resultActions.classList.remove('hidden');
        } catch (err) {
            console.error('Error:', err);
            processingSection.classList.add('hidden');
            uploadSection.classList.remove('hidden');
            processBtn.classList.remove('hidden');

            if (err.name === 'AbortError') {
                showError('Request timed out.');
            } else {
                showError('An error occurred: ' + err.message);
            }
        }
    });

    // -----------------------------------------------------------------
    // Reset / Try Another
    // -----------------------------------------------------------------
    resetBtn.addEventListener('click', () => {
        selectedFile = null;
        removedBgBlob = null;
        fileInput.value = '';
        fileInfo.textContent = '';
        processBtn.classList.add('hidden');
        resultSection.classList.add('hidden');
        resultActions.classList.add('hidden');
        uploadSection.classList.remove('hidden');
        errorMessage.classList.add('hidden');

        if (processedImg.src) {
            URL.revokeObjectURL(processedImg.src);
            processedImg.src = '';
        }
        if (blurFg.src) {
            URL.revokeObjectURL(blurFg.src);
            blurFg.src = '';
        }
    });
});
