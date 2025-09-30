document.addEventListener('DOMContentLoaded', function () {
    const lengthSlider = document.getElementById("length-slider");
    const lengthValue = document.getElementById("length-value");
    const includeUppercase = document.getElementById("include-uppercase");
    const includeNumbers = document.getElementById("include-numbers");
    const includeSymbols = document.getElementById("include-symbols");
    const generateBtn = document.getElementById("generate-btn");
    const generatedPasswordDisplay = document.getElementById("generated-password-display");
    const copyBtn = document.getElementById("copy-btn");
    const statsGrid = document.getElementsByClassName("stats-grid")

    //change slider value base on sliding
    lengthSlider.addEventListener('input', async function () {
        const lengthValueSlider = lengthSlider.value;
        lengthValue.innerHTML = `<span id="length-value">${lengthValueSlider}</span>`
    })
    // Generate Password on click of generate password button
    function generatePassword() {
        statsGrid[0].style.display = 'block'
        const length = parseInt(lengthValue.textContent) || 4;

        let lower = "abcdefghijklmnopqrstuvwxyz";
        let upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        let numbers = "0123456789";
        let symbols = "!@#$%^&*()_+[]{}|;:,.<>?";

        // start with only lowercase letters
        let characters = lower;

        if (includeUppercase.checked) characters += upper;
        if (includeNumbers.checked) characters += numbers;
        if (includeSymbols.checked) characters += symbols;

        // Generate password
        let password = "";
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            password += characters[randomIndex];
        }

        generatedPasswordDisplay.textContent = password;
        copyBtn.disabled = false;
    }


    // Generate password based on the click of generate btn
    generateBtn.addEventListener('click', generatePassword)

    // Copy to clipboard functionality
    copyBtn.addEventListener('click', async function () {
        const password = generatedPasswordDisplay.textContent;
        try {
            await navigator.clipboard.writeText(password);
            copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            copyBtn.classList.add('copied');
            copyBtn.style.background = 'var(--success-color)';
            copyBtn.style.borderColor = 'var(--success-color)';

            // Reset button after 2 seconds
            setTimeout(() => {
                copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy to Clipboard';
                copyBtn.classList.remove('copied');
                copyBtn.style.background = '';
                copyBtn.style.borderColor = '';
            }, 2000);
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = password;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);

            copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            copyBtn.classList.add('copied');
            setTimeout(() => {
                copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy to Clipboard';
                copyBtn.classList.remove('copied');
            }, 2000);
        }
    });
});