document.addEventListener('DOMContentLoaded', function() {
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');
    const previewSection = document.getElementById('preview-section');
    const outputSection = document.getElementById('output-section');
    const previewImage = document.getElementById('preview-image');
    const outputTextarea = document.getElementById('output-textarea');
    const copyBtn = document.getElementById('copy-btn');
    const downloadBtn = document.getElementById('download-btn');
    const newImageBtn = document.getElementById('new-image-btn');
    const formatBtns = document.querySelectorAll('.format-btn');
    const sizeWarning = document.getElementById('size-warning');

    let currentFile = null;
    let currentBase64 = '';
    let currentFormat = 'data-uri';

    // File size limit (10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024;

    // Click to upload
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });

    // File input change
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFile(file);
        }
    });

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');

        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleFile(file);
        } else {
            alert('Please drop an image file');
        }
    });

    // Handle file
    function handleFile(file) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            alert('File size exceeds 10MB limit');
            return;
        }

        currentFile = file;

        // Show size warning for large files
        if (file.size > 1024 * 1024) { // > 1MB
            sizeWarning.style.display = 'flex';
        } else {
            sizeWarning.style.display = 'none';
        }

        // Display file info
        displayFileInfo(file);

        // Convert to base64
        convertToBase64(file);
    }

    // Display file information
    function displayFileInfo(file) {
        document.getElementById('file-name').textContent = file.name;
        document.getElementById('file-size').textContent = formatFileSize(file.size);
        document.getElementById('file-format').textContent = file.type.split('/')[1].toUpperCase();

        // Load image to get dimensions
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImage.src = e.target.result;
            previewImage.onload = () => {
                document.getElementById('dimensions').textContent =
                    `${previewImage.naturalWidth} × ${previewImage.naturalHeight}`;
            };
        };
        reader.readAsDataURL(file);

        previewSection.classList.add('active');
    }

    // Convert image to base64
    function convertToBase64(file) {
        const reader = new FileReader();

        reader.onload = (e) => {
            currentBase64 = e.target.result;
            updateOutput();
            outputSection.style.display = 'block';
        };

        reader.onerror = () => {
            alert('Error reading file. Please try again.');
        };

        reader.readAsDataURL(file);
    }

    // Update output based on format
    function updateOutput() {
        if (currentFormat === 'data-uri') {
            outputTextarea.value = currentBase64;
        } else {
            // Extract base64 string without data URI prefix
            const base64String = currentBase64.split(',')[1];
            outputTextarea.value = base64String;
        }
    }

    // Format toggle
    formatBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            formatBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFormat = btn.dataset.format;
            updateOutput();
        });
    });

    // Copy to clipboard
    copyBtn.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(outputTextarea.value);

            // Visual feedback
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            copyBtn.classList.add('btn-success');

            setTimeout(() => {
                copyBtn.innerHTML = originalText;
                copyBtn.classList.remove('btn-success');
            }, 2000);
        } catch (err) {
            // Fallback for older browsers
            outputTextarea.select();
            document.execCommand('copy');

            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            copyBtn.classList.add('btn-success');

            setTimeout(() => {
                copyBtn.innerHTML = originalText;
                copyBtn.classList.remove('btn-success');
            }, 2000);
        }
    });

    // Download as text file
    downloadBtn.addEventListener('click', () => {
        const blob = new Blob([outputTextarea.value], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${currentFile.name.split('.')[0]}_base64.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    // New image button
    newImageBtn.addEventListener('click', () => {
        fileInput.value = '';
        currentFile = null;
        currentBase64 = '';
        previewSection.classList.remove('active');
        outputSection.style.display = 'none';
        sizeWarning.style.display = 'none';
    });

    // Format file size
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + V to paste image from clipboard
        if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
            navigator.clipboard.read().then(items => {
                for (const item of items) {
                    for (const type of item.types) {
                        if (type.startsWith('image/')) {
                            item.getType(type).then(blob => {
                                const file = new File([blob], 'pasted-image.png', { type });
                                handleFile(file);
                            });
                            break;
                        }
                    }
                }
            }).catch(err => {
                console.log('Clipboard paste not supported or permission denied');
            });
        }

        // Ctrl/Cmd + C to copy (when output is visible)
        if ((e.ctrlKey || e.metaKey) && e.key === 'c' && outputSection.style.display === 'block' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
            copyBtn.click();
        }
    });

    // Paste event for images
    document.addEventListener('paste', (e) => {
        const items = e.clipboardData.items;

        for (const item of items) {
            if (item.type.startsWith('image/')) {
                const file = item.getAsFile();
                if (file) {
                    handleFile(file);
                    e.preventDefault();
                }
                break;
            }
        }
    });
});
