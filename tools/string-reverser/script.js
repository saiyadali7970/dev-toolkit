document.addEventListener('DOMContentLoaded', function() {
    const input = document.getElementById('string-input');
    const output = document.getElementById('reversed-output');

    // Auto-focus on input
    if (input) input.focus();

    // Reverse string in real-time as user types
    input.addEventListener('input', function() {
        const text = input.value;
        if (text.trim() === "") {
            output.textContent = "---"; // Show placeholder when empty
        } else {
            output.textContent = text.split("").reverse().join("");
        }
    });
});
