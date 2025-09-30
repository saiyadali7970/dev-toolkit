// Markdown Previewer Tool
document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const markdownInput = document.getElementById('markdown-input');
    const previewContent = document.getElementById('preview-content');
    const clearBtn = document.getElementById('clear-btn');
    const copyMdBtn = document.getElementById('copy-md-btn');
    const copyHtmlBtn = document.getElementById('copy-html-btn');
    const downloadBtn = document.getElementById('download-btn');

    // Simple Markdown Parser
    function parseMarkdown(markdown) {
        if (!markdown.trim()) {
            return '<div class="empty-state"><i class="fas fa-file-alt"></i><p>Start typing to see the preview...</p></div>';
        }

        let html = markdown;

        // Escape HTML
        html = html.replace(/&/g, '&amp;')
                   .replace(/</g, '&lt;')
                   .replace(/>/g, '&gt;');

        // Headers (must come before other rules)
        html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
        html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
        html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');

        // Bold
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');

        // Italic
        html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
        html = html.replace(/_(.+?)_/g, '<em>$1</em>');

        // Strikethrough
        html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');

        // Code blocks (must come before inline code)
        html = html.replace(/```(\w+)?\n([\s\S]+?)```/g, function(match, lang, code) {
            return '<pre><code>' + code.trim() + '</code></pre>';
        });

        // Inline code
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

        // Images
        html = html.replace(/!\[([^\]]*)\]\(([^\)]+)\)/g, '<img src="$2" alt="$1" />');

        // Links
        html = html.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

        // Blockquotes
        html = html.replace(/^&gt; (.+$)/gm, '<blockquote>$1</blockquote>');

        // Horizontal rule
        html = html.replace(/^(---|\*\*\*|___)$/gm, '<hr>');

        // Unordered lists
        html = html.replace(/^\* (.+$)/gm, '<li>$1</li>');
        html = html.replace(/^- (.+$)/gm, '<li>$1</li>');
        html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

        // Ordered lists
        html = html.replace(/^\d+\. (.+$)/gm, '<li>$1</li>');

        // Tables (simple version)
        html = html.replace(/\|(.+)\|/g, function(match) {
            const cells = match.split('|').filter(cell => cell.trim());
            const cellTags = cells.map(cell => `<td>${cell.trim()}</td>`).join('');
            return `<tr>${cellTags}</tr>`;
        });
        html = html.replace(/(<tr>.*<\/tr>)/s, '<table>$1</table>');

        // Line breaks
        html = html.replace(/\n\n/g, '</p><p>');
        html = html.replace(/\n/g, '<br>');

        // Wrap in paragraphs
        html = '<p>' + html + '</p>';

        // Clean up multiple paragraph tags
        html = html.replace(/<p><\/p>/g, '');
        html = html.replace(/<p>(<h[1-6]>)/g, '$1');
        html = html.replace(/(<\/h[1-6]>)<\/p>/g, '$1');
        html = html.replace(/<p>(<ul>)/g, '$1');
        html = html.replace(/(<\/ul>)<\/p>/g, '$1');
        html = html.replace(/<p>(<ol>)/g, '$1');
        html = html.replace(/(<\/ol>)<\/p>/g, '$1');
        html = html.replace(/<p>(<blockquote>)/g, '$1');
        html = html.replace(/(<\/blockquote>)<\/p>/g, '$1');
        html = html.replace(/<p>(<pre>)/g, '$1');
        html = html.replace(/(<\/pre>)<\/p>/g, '$1');
        html = html.replace(/<p>(<table>)/g, '$1');
        html = html.replace(/(<\/table>)<\/p>/g, '$1');
        html = html.replace(/<p>(<hr>)<\/p>/g, '$1');

        return html;
    }

    // Update preview
    function updatePreview() {
        const markdown = markdownInput.value;
        const html = parseMarkdown(markdown);
        previewContent.innerHTML = html;
    }

    // Real-time preview
    markdownInput.addEventListener('input', updatePreview);

    // Clear button
    clearBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to clear all content?')) {
            markdownInput.value = '';
            updatePreview();
            markdownInput.focus();
        }
    });

    // Copy Markdown button
    copyMdBtn.addEventListener('click', async function() {
        const markdown = markdownInput.value;

        if (!markdown.trim()) {
            alert('Nothing to copy!');
            return;
        }

        try {
            await navigator.clipboard.writeText(markdown);
            showCopiedFeedback(copyMdBtn, 'Copied!');
        } catch (error) {
            // Fallback
            markdownInput.select();
            document.execCommand('copy');
            showCopiedFeedback(copyMdBtn, 'Copied!');
        }
    });

    // Copy HTML button
    copyHtmlBtn.addEventListener('click', async function() {
        const markdown = markdownInput.value;

        if (!markdown.trim()) {
            alert('Nothing to copy!');
            return;
        }

        const html = parseMarkdown(markdown);

        try {
            await navigator.clipboard.writeText(html);
            showCopiedFeedback(copyHtmlBtn, 'HTML Copied!');
        } catch (error) {
            alert('Failed to copy HTML. Please try again.');
        }
    });

    // Download button
    downloadBtn.addEventListener('click', function() {
        const markdown = markdownInput.value;

        if (!markdown.trim()) {
            alert('Nothing to download!');
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
        `;

        menu.innerHTML = `
            <h3 style="color: var(--text-primary); margin-bottom: 1rem;">Download As</h3>
            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                <button id="download-md" class="action-btn" style="justify-content: flex-start;">
                    <i class="fas fa-file-code"></i>
                    Markdown (.md)
                </button>
                <button id="download-html" class="action-btn" style="justify-content: flex-start;">
                    <i class="fas fa-file-code"></i>
                    HTML (.html)
                </button>
                <button id="download-txt" class="action-btn" style="justify-content: flex-start;">
                    <i class="fas fa-file-alt"></i>
                    Plain Text (.txt)
                </button>
                <button id="download-cancel" class="action-btn" style="justify-content: flex-start; background: var(--primary-color); color: white;">
                    <i class="fas fa-times"></i>
                    Cancel
                </button>
            </div>
        `;

        document.body.appendChild(menu);

        // Download handlers
        document.getElementById('download-md').addEventListener('click', function() {
            downloadFile(markdown, 'document.md', 'text/markdown');
            menu.remove();
        });

        document.getElementById('download-html').addEventListener('click', function() {
            const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Markdown Document</title>
    <style>
        body { font-family: sans-serif; max-width: 800px; margin: 2rem auto; padding: 1rem; line-height: 1.6; }
        code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; }
        pre { background: #f4f4f4; padding: 1rem; border-radius: 5px; overflow-x: auto; }
        blockquote { border-left: 4px solid #ddd; padding-left: 1rem; color: #666; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background: #f4f4f4; }
    </style>
</head>
<body>
${parseMarkdown(markdown)}
</body>
</html>`;
            downloadFile(html, 'document.html', 'text/html');
            menu.remove();
        });

        document.getElementById('download-txt').addEventListener('click', function() {
            downloadFile(markdown, 'document.txt', 'text/plain');
            menu.remove();
        });

        document.getElementById('download-cancel').addEventListener('click', function() {
            menu.remove();
        });
    });

    // Download file helper
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

    // Show copied feedback
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
        // Ctrl/Cmd + S to download
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            downloadBtn.click();
        }

        // Ctrl/Cmd + K to clear
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            clearBtn.click();
        }

        // Tab key in textarea
        if (e.key === 'Tab' && e.target === markdownInput) {
            e.preventDefault();
            const start = markdownInput.selectionStart;
            const end = markdownInput.selectionEnd;
            markdownInput.value = markdownInput.value.substring(0, start) + '    ' + markdownInput.value.substring(end);
            markdownInput.selectionStart = markdownInput.selectionEnd = start + 4;
            updatePreview();
        }
    });

    // Load example content on first visit
    if (!markdownInput.value.trim()) {
        markdownInput.value = `# Welcome to Markdown Previewer

This is a **simple** and *powerful* markdown editor with live preview.

## Features

- Real-time markdown rendering
- Export to Markdown, HTML, or Plain Text
- Support for common markdown syntax
- Clean and modern interface

## Try These Examples

### Text Formatting
**Bold text** or __also bold__
*Italic text* or _also italic_
~~Strikethrough text~~

### Code
Inline code: \`const x = 42;\`

Code block:
\`\`\`javascript
function greet(name) {
    return \`Hello, \${name}!\`;
}
\`\`\`

### Lists
- Unordered item 1
- Unordered item 2
  - Nested item

1. Ordered item 1
2. Ordered item 2

### Links & Images
[Visit DevToolkit](https://github.com/heysaiyad/dev-toolkit)

### Blockquote
> This is a quote
> It can span multiple lines

### Horizontal Rule
---

Start editing to see your changes live!`;
        updatePreview();
    }

    // Auto-focus textarea
    markdownInput.focus();
});