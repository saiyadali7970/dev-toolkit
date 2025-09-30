// Timer & Stopwatch Tool
document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const timerModeBtn = document.getElementById('timer-mode-btn');
    const stopwatchModeBtn = document.getElementById('stopwatch-mode-btn');
    const timerDisplay = document.getElementById('timer-display');
    const timerInputs = document.getElementById('timer-inputs');
    const hoursInput = document.getElementById('hours-input');
    const minutesInput = document.getElementById('minutes-input');
    const secondsInput = document.getElementById('seconds-input');
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const resetBtn = document.getElementById('reset-btn');
    const lapBtn = document.getElementById('lap-btn');
    const lapTimes = document.getElementById('lap-times');
    const lapList = document.getElementById('lap-list');

    // State
    let currentMode = 'timer'; // 'timer' or 'stopwatch'
    let isRunning = false;
    let isPaused = false;
    let interval = null;
    let timeInSeconds = 0;
    let lapCounter = 0;

    // Audio for timer completion
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // Mode switching
    timerModeBtn.addEventListener('click', function() {
        if (currentMode !== 'timer') {
            switchMode('timer');
        }
    });

    stopwatchModeBtn.addEventListener('click', function() {
        if (currentMode !== 'stopwatch') {
            switchMode('stopwatch');
        }
    });

    function switchMode(mode) {
        // Stop current timer/stopwatch
        stop();
        reset();

        currentMode = mode;

        if (mode === 'timer') {
            timerModeBtn.classList.add('active');
            stopwatchModeBtn.classList.remove('active');
            timerInputs.classList.remove('hidden');
            lapBtn.classList.add('hidden');
            lapTimes.classList.add('hidden');
        } else {
            timerModeBtn.classList.remove('active');
            stopwatchModeBtn.classList.add('active');
            timerInputs.classList.add('hidden');
            lapBtn.classList.remove('hidden');
        }
    }

    // Start button
    startBtn.addEventListener('click', function() {
        if (currentMode === 'timer') {
            startTimer();
        } else {
            startStopwatch();
        }
    });

    // Pause button
    pauseBtn.addEventListener('click', function() {
        pause();
    });

    // Reset button
    resetBtn.addEventListener('click', function() {
        reset();
    });

    // Lap button
    lapBtn.addEventListener('click', function() {
        addLap();
    });

    // Timer functionality
    function startTimer() {
        if (isPaused) {
            // Resume from pause
            isPaused = false;
            isRunning = true;
            startBtn.classList.add('hidden');
            pauseBtn.classList.remove('hidden');
            timerDisplay.classList.remove('paused');
            timerDisplay.classList.add('running');
            runTimer();
            return;
        }

        // Get input values
        const hours = parseInt(hoursInput.value) || 0;
        const minutes = parseInt(minutesInput.value) || 0;
        const seconds = parseInt(secondsInput.value) || 0;

        timeInSeconds = hours * 3600 + minutes * 60 + seconds;

        if (timeInSeconds <= 0) {
            alert('Please set a valid time!');
            return;
        }

        isRunning = true;
        startBtn.classList.add('hidden');
        pauseBtn.classList.remove('hidden');
        timerInputs.classList.add('hidden');
        timerDisplay.classList.add('running');

        runTimer();
    }

    function runTimer() {
        interval = setInterval(() => {
            if (timeInSeconds > 0) {
                timeInSeconds--;
                updateDisplay();
            } else {
                // Timer completed
                stop();
                timerComplete();
            }
        }, 1000);
    }

    function timerComplete() {
        timerDisplay.textContent = '00:00:00';
        timerDisplay.classList.remove('running');

        // Play sound
        playBeep();

        // Show notification if supported
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Timer Complete!', {
                body: 'Your countdown timer has finished.',
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">⏰</text></svg>'
            });
        }

        // Visual feedback
        timerDisplay.style.color = '#00d084';
        setTimeout(() => {
            timerDisplay.style.color = '';
        }, 3000);

        alert('Timer Complete! ⏰');
    }

    // Stopwatch functionality
    function startStopwatch() {
        if (isPaused) {
            // Resume from pause
            isPaused = false;
            isRunning = true;
            startBtn.classList.add('hidden');
            pauseBtn.classList.remove('hidden');
            timerDisplay.classList.remove('paused');
            timerDisplay.classList.add('running');
            runStopwatch();
            return;
        }

        isRunning = true;
        timeInSeconds = 0;
        startBtn.classList.add('hidden');
        pauseBtn.classList.remove('hidden');
        timerDisplay.classList.add('running');
        lapTimes.classList.remove('hidden');

        runStopwatch();
    }

    function runStopwatch() {
        interval = setInterval(() => {
            timeInSeconds++;
            updateDisplay();
        }, 1000);
    }

    // Pause
    function pause() {
        if (isRunning) {
            clearInterval(interval);
            isRunning = false;
            isPaused = true;
            pauseBtn.classList.add('hidden');
            startBtn.classList.remove('hidden');
            startBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
            timerDisplay.classList.remove('running');
            timerDisplay.classList.add('paused');
        }
    }

    // Stop
    function stop() {
        clearInterval(interval);
        isRunning = false;
        isPaused = false;
    }

    // Reset
    function reset() {
        stop();
        timeInSeconds = 0;
        lapCounter = 0;

        updateDisplay();

        startBtn.classList.remove('hidden');
        pauseBtn.classList.add('hidden');
        startBtn.innerHTML = '<i class="fas fa-play"></i> Start';

        timerDisplay.classList.remove('running', 'paused');

        if (currentMode === 'timer') {
            timerInputs.classList.remove('hidden');
            hoursInput.value = '0';
            minutesInput.value = '0';
            secondsInput.value = '0';
        } else {
            lapList.innerHTML = '';
            lapTimes.classList.add('hidden');
        }
    }

    // Add lap
    function addLap() {
        if (!isRunning && !isPaused) return;

        lapCounter++;
        const lapTime = formatTime(timeInSeconds);

        const lapItem = document.createElement('div');
        lapItem.className = 'lap-item';
        lapItem.innerHTML = `
            <span class="lap-number">Lap ${lapCounter}</span>
            <span class="lap-time">${lapTime}</span>
        `;

        lapList.insertBefore(lapItem, lapList.firstChild);
    }

    // Update display
    function updateDisplay() {
        timerDisplay.textContent = formatTime(timeInSeconds);
    }

    // Format time
    function formatTime(totalSeconds) {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    // Play beep sound
    function playBeep() {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    }

    // Input validation
    function validateInput(input, max) {
        let value = parseInt(input.value);
        if (isNaN(value) || value < 0) {
            input.value = '0';
        } else if (value > max) {
            input.value = max;
        }
    }

    hoursInput.addEventListener('blur', function() {
        validateInput(this, 99);
    });

    minutesInput.addEventListener('blur', function() {
        validateInput(this, 59);
    });

    secondsInput.addEventListener('blur', function() {
        validateInput(this, 59);
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Space to start/pause
        if (e.code === 'Space') {
            e.preventDefault();
            if (isRunning) {
                pauseBtn.click();
            } else {
                startBtn.click();
            }
        }

        // R to reset
        if (e.key === 'r' || e.key === 'R') {
            e.preventDefault();
            resetBtn.click();
        }

        // L to lap (in stopwatch mode)
        if ((e.key === 'l' || e.key === 'L') && currentMode === 'stopwatch') {
            e.preventDefault();
            lapBtn.click();
        }

        // T to switch to timer
        if (e.key === 't' || e.key === 'T') {
            e.preventDefault();
            timerModeBtn.click();
        }

        // S to switch to stopwatch
        if (e.key === 's' || e.key === 'S') {
            e.preventDefault();
            stopwatchModeBtn.click();
        }
    });

    // Request notification permission on load
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }

    // Prevent page unload when timer is running
    window.addEventListener('beforeunload', function(e) {
        if (isRunning) {
            e.preventDefault();
            e.returnValue = 'Timer is still running. Are you sure you want to leave?';
            return e.returnValue;
        }
    });

    // Update page title with time when running
    setInterval(() => {
        if (isRunning) {
            document.title = `${formatTime(timeInSeconds)} - ${currentMode === 'timer' ? 'Timer' : 'Stopwatch'}`;
        } else {
            document.title = 'Timer & Stopwatch - DevToolkit';
        }
    }, 1000);
});