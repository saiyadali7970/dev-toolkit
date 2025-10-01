document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  const inputText = document.getElementById("input-text");
  const outputText = document.getElementById("output-text");
  const encodeMode = document.getElementById("encode-mode");
  const decodeMode = document.getElementById("decode-mode");
  const convertBtn = document.getElementById("convert-btn");
  const convertBtnText = document.getElementById("convert-btn-text");
  const swapBtn = document.getElementById("swap-btn");
  const clearAllBtn = document.getElementById("clear-all");
  const clearInputBtn = document.getElementById("clear-input");
  const pasteBtn = document.getElementById("paste-btn");
  const copyBtn = document.getElementById("copy-btn");
  const inputLabel = document.getElementById("input-label");
  const outputLabel = document.getElementById("output-label");
  const errorMessage = document.getElementById("error-message");
  const errorText = document.getElementById("error-text");

  // Stats
  const inputLengthStat = document.getElementById("input-length");
  const outputLengthStat = document.getElementById("output-length");
  const sizeChangeStat = document.getElementById("size-change");
  const currentModeStat = document.getElementById("current-mode");

  let isEncodeMode = true;

  // Auto-focus on input
  inputText.focus();

  // Mode switching
  encodeMode.addEventListener("click", function () {
    if (!isEncodeMode) {
      isEncodeMode = true;
      updateMode();
    }
  });

  decodeMode.addEventListener("click", function () {
    if (isEncodeMode) {
      isEncodeMode = false;
      updateMode();
    }
  });

  function updateMode() {
    if (isEncodeMode) {
      encodeMode.classList.add("active");
      decodeMode.classList.remove("active");
      inputLabel.textContent = "Plain Text";
      outputLabel.textContent = "Base64";
      inputText.placeholder = "Enter text to encode...";
      outputText.placeholder = "Encoded result will appear here...";
      convertBtnText.textContent = "Encode";
      currentModeStat.textContent = "Encode";
    } else {
      encodeMode.classList.remove("active");
      decodeMode.classList.add("active");
      inputLabel.textContent = "Base64";
      outputLabel.textContent = "Plain Text";
      inputText.placeholder = "Enter Base64 to decode...";
      outputText.placeholder = "Decoded result will appear here...";
      convertBtnText.textContent = "Decode";
      currentModeStat.textContent = "Decode";
    }

    // Clear previous results
    inputText.value = "";
    outputText.value = "";
    hideError();
    updateStats();
  }

  // Convert function
  function convert() {
    const input = inputText.value;

    if (!input) {
      outputText.value = "";
      hideError();
      updateStats();
      return;
    }

    try {
      if (isEncodeMode) {
        // Encode to Base64
        const encoded = btoa(unescape(encodeURIComponent(input)));
        outputText.value = encoded;
        hideError();
      } else {
        // Decode from Base64
        const decoded = decodeURIComponent(escape(atob(input)));
        outputText.value = decoded;
        hideError();
      }
    } catch (error) {
      if (isEncodeMode) {
        showError("Error encoding text. Please check your input.");
      } else {
        showError("Invalid Base64 string. Please check your input.");
      }
      outputText.value = "";
    }

    updateStats();
  }

  // Real-time conversion with debouncing
  let conversionTimeout;
  inputText.addEventListener("input", function () {
    clearTimeout(conversionTimeout);
    conversionTimeout = setTimeout(convert, 150);
  });

  // Convert button
  convertBtn.addEventListener("click", convert);

  // Swap input and output
  swapBtn.addEventListener("click", function () {
    const temp = inputText.value;
    inputText.value = outputText.value;
    outputText.value = temp;
    convert();

    // Add animation
    swapBtn.style.transform = "rotate(180deg)";
    setTimeout(() => {
      swapBtn.style.transform = "rotate(0deg)";
    }, 300);
  });

  // Clear all
  clearAllBtn.addEventListener("click", function () {
    inputText.value = "";
    outputText.value = "";
    hideError();
    updateStats();
    inputText.focus();
  });

  // Clear input
  clearInputBtn.addEventListener("click", function () {
    inputText.value = "";
    outputText.value = "";
    hideError();
    updateStats();
    inputText.focus();
  });

  // Paste from clipboard
  pasteBtn.addEventListener("click", async function () {
    try {
      const text = await navigator.clipboard.readText();
      inputText.value = text;
      convert();

      // Visual feedback
      pasteBtn.innerHTML = '<i class="fas fa-check"></i> Pasted';
      setTimeout(() => {
        pasteBtn.innerHTML = '<i class="fas fa-paste"></i> Paste';
      }, 2000);
    } catch (error) {
      showError("Failed to paste from clipboard. Please paste manually.");
    }
  });

  // Copy to clipboard
  copyBtn.addEventListener("click", async function () {
    const text = outputText.value;

    if (!text) {
      return;
    }

    try {
      await navigator.clipboard.writeText(text);

      // Visual feedback
      copyBtn.classList.add("copied");
      copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied';

      setTimeout(() => {
        copyBtn.classList.remove("copied");
        copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
      }, 2000);
    } catch (error) {
      // Fallback for older browsers
      outputText.select();
      document.execCommand("copy");

      copyBtn.classList.add("copied");
      copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied';

      setTimeout(() => {
        copyBtn.classList.remove("copied");
        copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
      }, 2000);
    }
  });

  // Error handling
  function showError(message) {
    errorText.textContent = message;
    errorMessage.classList.add("show");
  }

  function hideError() {
    errorMessage.classList.remove("show");
  }

  // Update statistics
  function updateStats() {
    const inputLength = inputText.value.length;
    const outputLength = outputText.value.length;

    // Animate value changes
    animateValue(
      inputLengthStat,
      parseInt(inputLengthStat.textContent) || 0,
      inputLength,
      300
    );
    animateValue(
      outputLengthStat,
      parseInt(outputLengthStat.textContent) || 0,
      outputLength,
      300
    );

    // Calculate size change
    let sizeChange = 0;
    if (inputLength > 0) {
      sizeChange = Math.round(
        ((outputLength - inputLength) / inputLength) * 100
      );
    }

    // Update size change with color
    const sizeChangeText =
      sizeChange >= 0 ? `+${sizeChange}%` : `${sizeChange}%`;
    sizeChangeStat.textContent = sizeChangeText;
  }

  // Animate number values
  function animateValue(element, start, end, duration) {
    const startTime = performance.now();

    function updateValue(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const current = start + (end - start) * progress;
      element.textContent = Math.round(current);

      if (progress < 1) {
        requestAnimationFrame(updateValue);
      }
    }

    requestAnimationFrame(updateValue);
  }

  // Keyboard shortcuts
  document.addEventListener("keydown", function (e) {
    // Ctrl/Cmd + Enter to convert
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      convert();
    }

    // Ctrl/Cmd + K to clear all
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      inputText.value = "";
      outputText.value = "";
      hideError();
      updateStats();
      inputText.focus();
    }

    // Ctrl/Cmd + S to swap
    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
      e.preventDefault();
      swapBtn.click();
    }
  });

  // Initialize stats
  updateStats();
});
