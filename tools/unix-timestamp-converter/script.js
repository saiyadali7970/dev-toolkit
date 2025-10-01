document.addEventListener('DOMContentLoaded', function () {
    const dateTimePicker = document.getElementById('datetime-picker');
    const unixTimestampInput = document.getElementById('unix-timestamp-input');
    const conversionResults = document.getElementById('conversion-results');
    const humanDateResult = document.getElementById('human-date-result');
    const unixTimestampResult = document.getElementById('unix-timestamp-result');
    const copyBtn = document.getElementById('copy-btn');
    const liveUnixTimestampResult = document.getElementById('live-unix-timestamp-result');
    const liveDateTimeResult = document.getElementById('live-datetime-result');
    const copyBtnLive = document.getElementById('copy-btn-live');


    async function copyToClipboard(textToCopy, button) {
        try {
            await navigator.clipboard.writeText(textToCopy);
            button.innerHTML = '<i class="fas fa-check"></i> Copied!';
            button.classList.add('copied');
            button.style.background = 'var(--success-color)';
            button.style.borderColor = 'var(--success-color)';
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = textToCopy;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            button.innerHTML = '<i class="fas fa-check"></i> Copied!';
            button.classList.add('copied');
        } finally {
            // Reset button state after 2 seconds
            setTimeout(() => {
                button.innerHTML = '<i class="fas fa-copy"></i> Copy to Clipboard';
                button.classList.remove('copied');
                button.style.background = '';
                button.style.borderColor = '';
            }, 2000);
        }
    }

    function showResults() {
        conversionResults.style.display = 'grid';
        copyBtn.disabled = false;
    }

    function hideResults() {
        conversionResults.style.display = 'none';
        copyBtn.disabled = true;
    }

    // Initialize flatpickr for date and time selection
    const flatpickrInstance = flatpickr(dateTimePicker, {
        enableTime: true,
        dateFormat: "Y-m-d H:i",
        onChange: function (selectedDates) {
            if (selectedDates.length > 0) {
                const date = selectedDates[0];
                const unixTimestamp = Math.floor(date.getTime() / 1000);

                humanDateResult.textContent = date.toLocaleString();
                unixTimestampResult.textContent = unixTimestamp;
                unixTimestampInput.value = ''; // Clear the other input
                showResults();
            }
        }
    });

    // Listen for input on the Unix timestamp field
    unixTimestampInput.addEventListener('input', function () {
        const timestamp = this.value.trim();
        if (timestamp && /^\d+$/.test(timestamp)) {
            const date = new Date(parseInt(timestamp, 10) * 1000);
            if (!isNaN(date.getTime())) {
                humanDateResult.textContent = date.toLocaleString();
                unixTimestampResult.textContent = timestamp;
                flatpickrInstance.clear(); // Clear the other input
                showResults();
            } else {
                hideResults();
            }
        } else {
            hideResults();
        }
    });

    // Listen for clicks on the main copy button
    copyBtn.addEventListener('click', function () {
        copyToClipboard(unixTimestampResult.textContent, this);
    });

    // Listen for clicks on the live copy button
    copyBtnLive.addEventListener('click', function () {
        copyToClipboard(liveUnixTimestampResult.textContent, this);
    });

    // Update the live timestamp every second
    setInterval(() => {
        const now = new Date();
        const currentUnixTimestamp = Math.floor(now.getTime() / 1000);

        liveUnixTimestampResult.textContent = currentUnixTimestamp;
        liveDateTimeResult.textContent = now.toLocaleString();

        if (copyBtnLive.disabled) {
            copyBtnLive.disabled = false;
        }
    }, 1000);

    // Auto-focus on the first input field for better UX
    dateTimePicker.focus();
});