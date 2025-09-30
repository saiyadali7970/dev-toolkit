// Image to Base64 Converter Tool
document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const uploadSection = document.getElementById('upload-section');
    const fileInput = document.getElementById('file-input');
    const previewSection = document.getElementById('preview-section');
    const imagePreview = document.getElementById('image-preview');
    const base64Output = document.getElementById('base64-output');
    const copyBtn = document.getElementById('copy-btn');
    const copyDataUriBtn = document.getElementById('copy-data-uri-btn');
    const downloadBtn = document.getElementById('download-btn');
    const newImageBtn = document.getElementById('new-image-btn');

    // Info elements
    const infoName = document.getElementById('info-name');
    const infoSize = document.getElementById('info-size');
    const infoDimensions = document.getElementById('info-dimensions');
    const infoType = document.getElementById('info-type');

    let currentFile = null;
    let currentBase64 = '';
    let currentDataUri = '';

    // Click to upload
    uploadSection.addEventListener('click', function() {
        fileInput.click();
    });

    // File input change
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            handleFile(file);
        }
    });

    // Drag and drop
    uploadSection.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadSection.classList.add('dragover');
    });

    uploadSection.addEventListener('dragleave', function(e) {
        e.preventDefault();
        uploadSection.classList.remove('dragover');
    });

    uploadSection.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadSection.classList.remove('dragover');

        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleFile(file);
        } else {
            alert('Please drop a valid image file!');
        }
    });

    // Handle file
    function handleFile(file) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select a valid image file!');
            return;
        }

        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            alert('File size too large! Maximum size is 10MB.');
            return;
        }

        currentFile = file;

        // Show file info
        infoName.textContent = file.name;
        infoSize.textContent = formatFileSize(file.size);
        infoType.textContent = file.type;

        // Read file
        const reader = new FileReader();

        reader.onload = function(e) {
            const dataUrl = e.target.result;
            currentDataUri = dataUrl;

            // Extract base64 part (remove data:image/...;base64, prefix)
            currentBase64 = dataUrl.split(',')[1];

            // Display preview
            imagePreview.src = dataUrl;

            // Get image dimensions
            imagePreview.onload = function() {
                infoDimensions.textContent = `${this.naturalWidth} × ${this.naturalHeight}`;
            };

            // Display base64
            base64Output.value = currentBase64;

            // Show preview section
            uploadSection.style.display = 'none';
            previewSection.classList.add('active');
        };

        reader.onerror = function() {
            alert('Error reading file. Please try again.');
        };

        reader.readAsDataURL(file);
    }

    // Copy base64
    copyBtn.addEventListener('click', async function() {
        if (!currentBase64) {
            alert('No base64 data to copy!');
            return;
        }

        try {
            await navigator.clipboard.writeText(currentBase64);
            showCopiedFeedback(copyBtn, 'Copied!');
        } catch (error) {
            // Fallback
            base64Output.select();
            document.execCommand('copy');
            showCopiedFeedback(copyBtn, 'Copied!');
        }
    });

    // Copy data URI
    copyDataUriBtn.addEventListener('click', async function() {
        if (!currentDataUri) {
            alert('No data URI to copy!');
            return;
        }

        try {
            await navigator.clipboard.writeText(currentDataUri);
            showCopiedFeedback(copyDataUriBtn, 'Copied!');
        } catch (error) {
            alert('Failed to copy data URI. Please try again.');
        }
    });

    // Download base64
    downloadBtn.addEventListener('click', function() {
        if (!currentBase64) {
            alert('No base64 data to download!');
            return;
        }

        // Create download menu
        const menu = document.createElement('div');
        menu.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--bg-secondary);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: var(--radius-lg);
            padding: 1.5rem;
            z-index: 10000;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            min-width: 300px;
        `;

        menu.innerHTML = `
            <h3 style="color: var(--text-primary); margin-bottom: 1rem;">Download As</h3>
            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                <button id="download-txt" class="action-btn" style="width: 100%; justify-content: flex-start;">
                    <i class="fas fa-file-alt"></i>
                    Text File (.txt)
                </button>
                <button id="download-json" class="action-btn" style="width: 100%; justify-content: flex-start;">
                    <i class="fas fa-file-code"></i>
                    JSON File (.json)
                </button>
                <button id="download-html" class="action-btn" style="width: 100%; justify-content: flex-start;">
                    <i class="fas fa-file-code"></i>
                    HTML Example (.html)
                </button>
                <button id="download-cancel" class="action-btn" style="width: 100%; justify-content: flex-start; background: var(--primary-color); color: white;">
                    <i class="fas fa-times"></i>
                    Cancel
                </button>
            </div>
        `;

        document.body.appendChild(menu);

        // Download handlers
        document.getElementById('download-txt').addEventListener('click', function() {
            downloadFile(currentBase64, 'base64.txt', 'text/plain');
            menu.remove();
        });

        document.getElementById('download-json').addEventListener('click', function() {
            const jsonData = {
                filename: currentFile.name,
                type: currentFile.type,
                size: currentFile.size,
                base64: currentBase64
            };
            downloadFile(JSON.stringify(jsonData, null, 2), 'base64.json', 'application/json');
            menu.remove();
        });

        document.getElementById('download-html').addEventListener('click', function() {
            const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Base64 Image Example</title>
</head>
<body>
    <h1>Base64 Encoded Image</h1>
    <img src="${currentDataUri}" alt="${currentFile.name}">

    <h2>CSS Background Example</h2>
    <div style="
        width: 300px;
        height: 200px;
        background-image: url('${currentDataUri}');
        background-size: cover;
        background-position: center;
    "></div>
</body>
</html>`;
            downloadFile(htmlContent, 'base64-example.html', 'text/html');
            menu.remove();
        });

        document.getElementById('download-cancel').addEventListener('click', function() {
            menu.remove();
        });
    });

    // New image button
    newImageBtn.addEventListener('click', function() {
        reset();
    });

    // Reset
    function reset() {
        currentFile = null;
        currentBase64 = '';
        currentDataUri = '';
        fileInput.value = '';
        imagePreview.src = '';
        base64Output.value = '';
        infoName.textContent = '-';
        infoSize.textContent = '-';
        infoDimensions.textContent = '-';
        infoType.textContent = '-';
        uploadSection.style.display = 'block';
        previewSection.classList.remove('active');
    }

    // Helper: Format file size
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    }

    // Helper: Download file
    function downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Helper: Show copied feedback
    function showCopiedFeedback(button, message) {
        const originalHTML = button.innerHTML;
        button.classList.add('copied');
        button.innerHTML = `<i class="fas fa-check"></i> ${message}`;

        setTimeout(() => {
            button.classList.remove('copied');
            button.innerHTML = originalHTML;
        }, 2000);
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + V to paste image from clipboard
        if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
            // This will be handled by paste event
        }

        // Escape to reset
        if (e.key === 'Escape') {
            if (previewSection.classList.contains('active')) {
                reset();
            }
        }
    });

    // Paste from clipboard
    document.addEventListener('paste', function(e) {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const file = items[i].getAsFile();
                handleFile(file);
                break;
            }
        }
    });
});