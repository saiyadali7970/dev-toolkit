// URL Encoder/Decoder Tool
document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const encodeModeBtn = document.getElementById('encode-mode');
    const decodeModeBtn = document.getElementById('decode-mode');
    const inputText = document.getElementById('input-text');
    const outputText = document.getElementById('output-text');
    const convertBtn = document.getElementById('convert-btn');
    const clearBtn = document.getElementById('clear-btn');
    const pasteBtn = document.getElementById('paste-btn');
    const copyBtn = document.getElementById('copy-btn');
    const inputLabelText = document.getElementById('input-label-text');
    const outputLabelText = document.getElementById('output-label-text');
    const convertBtnText = document.getElementById('convert-btn-text');
    const infoList = document.getElementById('info-list');

    let currentMode = 'encode'; // 'encode' or 'decode'

    // Mode switching
    encodeModeBtn.addEventListener('click', function() {
        switchMode('encode');
    });

    decodeModeBtn.addEventListener('click', function() {
        switchMode('decode');
    });

    function switchMode(mode) {
        currentMode = mode;

        if (mode === 'encode') {
            encodeModeBtn.classList.add('active');
            decodeModeBtn.classList.remove('active');
            inputLabelText.textContent = 'Enter URL to Encode';
            outputLabelText.textContent = 'Encoded Result';
            convertBtnText.textContent = 'Encode URL';
            inputText.placeholder = 'https://example.com/search?q=hello world&category=tech';

            infoList.innerHTML = `
                <li><strong>URL Encoding:</strong> Converts special characters to percent-encoded format (%XX)</li>
                <li><strong>Safe Characters:</strong> Letters, numbers, and -_.~ remain unchanged</li>
                <li><strong>Spaces:</strong> Converted to %20 or + in query strings</li>
                <li><strong>Use Case:</strong> Ensure URLs work correctly when passed as parameters or in APIs</li>
            `;
        } else {
            encodeModeBtn.classList.remove('active');
            decodeModeBtn.classList.add('active');
            inputLabelText.textContent = 'Enter URL to Decode';
            outputLabelText.textContent = 'Decoded Result';
            convertBtnText.textContent = 'Decode URL';
            inputText.placeholder = 'https://example.com/search?q=hello%20world&category=tech';

            infoList.innerHTML = `
                <li><strong>URL Decoding:</strong> Converts percent-encoded characters (%XX) back to their original form</li>
                <li><strong>Special Characters:</strong> Restores spaces, symbols, and international characters</li>
                <li><strong>Plus Signs:</strong> Converts + back to spaces in query strings</li>
                <li><strong>Use Case:</strong> Read and understand encoded URLs or API responses</li>
            `;
        }

        // Clear outputs when switching modes
        outputText.value = '';

        // Auto-convert if there's input
        if (inputText.value.trim()) {
            performConversion();
        }
    }

    // Convert button
    convertBtn.addEventListener('click', function() {
        performConversion();
    });

    // Real-time conversion on input
    inputText.addEventListener('input', function() {
        if (this.value.trim()) {
            performConversion();
        } else {
            outputText.value = '';
        }
    });

    function performConversion() {
        const input = inputText.value.trim();

        if (!input) {
            outputText.value = '';
            return;
        }

        try {
            if (currentMode === 'encode') {
                outputText.value = encodeURL(input);
            } else {
                outputText.value = decodeURL(input);
            }
        } catch (error) {
            outputText.value = `Error: ${error.message}`;
        }
    }

    function encodeURL(url) {
        try {
            // Check if it's a full URL or just a component
            if (url.includes('://')) {
                // Parse URL and encode only the necessary parts
                const urlObj = new URL(url);
                let encoded = urlObj.protocol + '//' + urlObj.host;

                if (urlObj.pathname && urlObj.pathname !== '/') {
                    // Encode pathname - each segment separately but preserve slashes
                    const pathParts = urlObj.pathname.split('/');
                    encoded += pathParts.map(part => {
                        if (part === '') return '';
                        // Encode but keep it readable for already safe characters
                        return encodeURIComponent(decodeURIComponent(part));
                    }).join('/');
                }

                if (urlObj.search) {
                    // Encode search parameters
                    const params = new URLSearchParams(urlObj.search);
                    const encodedParams = [];
                    params.forEach((value, key) => {
                        encodedParams.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
                    });
                    encoded += '?' + encodedParams.join('&');
                }

                if (urlObj.hash) {
                    encoded += '#' + encodeURIComponent(urlObj.hash.substring(1));
                }

                return encoded;
            } else {
                // Just encode the component
                return encodeURIComponent(url);
            }
        } catch (error) {
            // If URL parsing fails, just encode the whole string
            return encodeURIComponent(url);
        }
    }

    function decodeURL(url) {
        try {
            // Replace + with space for query string compatibility
            url = url.replace(/\+/g, ' ');

            // Check if it's a full URL
            if (url.includes('://')) {
                const urlObj = new URL(url);
                let decoded = urlObj.protocol + '//' + urlObj.host;

                if (urlObj.pathname) {
                    decoded += decodeURIComponent(urlObj.pathname);
                }

                if (urlObj.search) {
                    const params = new URLSearchParams(urlObj.search);
                    const decodedParams = [];
                    params.forEach((value, key) => {
                        decodedParams.push(`${decodeURIComponent(key)}=${decodeURIComponent(value)}`);
                    });
                    decoded += '?' + decodedParams.join('&');
                }

                if (urlObj.hash) {
                    decoded += '#' + decodeURIComponent(urlObj.hash.substring(1));
                }

                return decoded;
            } else {
                // Just decode the component
                return decodeURIComponent(url);
            }
        } catch (error) {
            // If decoding fails, try basic decodeURIComponent
            return decodeURIComponent(url);
        }
    }

    // Clear button
    clearBtn.addEventListener('click', function() {
        inputText.value = '';
        outputText.value = '';
        inputText.focus();
    });

    // Paste button
    pasteBtn.addEventListener('click', async function() {
        try {
            const text = await navigator.clipboard.readText();
            inputText.value = text;
            performConversion();

            // Visual feedback
            pasteBtn.innerHTML = '<i class="fas fa-check"></i> Pasted';
            setTimeout(() => {
                pasteBtn.innerHTML = '<i class="fas fa-paste"></i> Paste';
            }, 2000);
        } catch (error) {
            alert('Failed to read clipboard. Please paste manually using Ctrl+V.');
        }
    });

    // Copy button
    copyBtn.addEventListener('click', async function() {
        if (!outputText.value) {
            alert('Nothing to copy!');
            return;
        }

        try {
            await navigator.clipboard.writeText(outputText.value);

            // Visual feedback
            copyBtn.classList.add('copied');
            copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';

            setTimeout(() => {
                copyBtn.classList.remove('copied');
                copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
            }, 2000);
        } catch (error) {
            // Fallback for older browsers
            outputText.select();
            document.execCommand('copy');

            copyBtn.classList.add('copied');
            copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';

            setTimeout(() => {
                copyBtn.classList.remove('copied');
                copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
            }, 2000);
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + Enter to convert
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            performConversion();
        }

        // Ctrl/Cmd + K to clear
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            clearBtn.click();
        }

        // Ctrl/Cmd + Shift + C to copy
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
            e.preventDefault();
            copyBtn.click();
        }
    });

    // Example URLs
    const examples = [
        {
            mode: 'encode',
            input: 'https://example.com/search?q=hello world&category=web development'
        },
        {
            mode: 'decode',
            input: 'https://example.com/search?q=hello%20world&category=web%20development'
        }
    ];

    // Add example button functionality (optional)
    // You can add this to the HTML if needed
    window.loadExample = function() {
        const example = examples.find(ex => ex.mode === currentMode);
        if (example) {
            inputText.value = example.input;
            performConversion();
        }
    };

    // Auto-focus input on load
    inputText.focus();

    // Add animation to convert button
    convertBtn.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-3px) scale(1.05)';
    });

    convertBtn.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});