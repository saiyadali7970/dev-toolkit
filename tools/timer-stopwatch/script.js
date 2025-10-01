document.addEventListener('DOMContentLoaded', function() {
    // Mode Switching
    const modeBtns = document.querySelectorAll('.mode-btn');
    const stopwatchSection = document.querySelector('.stopwatch-section');
    const timerSection = document.querySelector('.timer-section');

    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const mode = btn.dataset.mode;
            if (mode === 'stopwatch') {
                stopwatchSection.classList.add('active');
                timerSection.classList.remove('active');
                resetStopwatch();
            } else {
                timerSection.classList.add('active');
                stopwatchSection.classList.remove('active');
                resetTimer();
            }
        });
    });

    // Stopwatch
    let stopwatchInterval = null;
    let stopwatchTime = 0;
    let stopwatchRunning = false;
    let laps = [];

    const stopwatchDisplay = document.getElementById('stopwatch-display');
    const stopwatchStartBtn = document.getElementById('stopwatch-start');
    const stopwatchLapBtn = document.getElementById('stopwatch-lap');
    const stopwatchResetBtn = document.getElementById('stopwatch-reset');
    const lapsContainer = document.getElementById('laps-container');
    const lapsList = document.getElementById('laps-list');
    const clearLapsBtn = document.getElementById('clear-laps');

    function formatTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        const milliseconds = Math.floor((ms % 1000) / 10);

        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    function formatTimeWithMs(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        const milliseconds = Math.floor((ms % 1000) / 10);

        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(2, '0')}`;
    }

    function updateStopwatchDisplay() {
        stopwatchDisplay.textContent = formatTime(stopwatchTime);
    }

    function startStopwatch() {
        if (!stopwatchRunning) {
            const startTime = Date.now() - stopwatchTime;
            stopwatchInterval = setInterval(() => {
                stopwatchTime = Date.now() - startTime;
                updateStopwatchDisplay();
            }, 10);
            stopwatchRunning = true;
            stopwatchStartBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
            stopwatchLapBtn.disabled = false;
        } else {
            clearInterval(stopwatchInterval);
            stopwatchRunning = false;
            stopwatchStartBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
        }
    }

    function resetStopwatch() {
        clearInterval(stopwatchInterval);
        stopwatchTime = 0;
        stopwatchRunning = false;
        updateStopwatchDisplay();
        stopwatchStartBtn.innerHTML = '<i class="fas fa-play"></i> Start';
        stopwatchLapBtn.disabled = true;
        laps = [];
        updateLapsDisplay();
    }

    function recordLap() {
        const lapTime = stopwatchTime;
        const lapNumber = laps.length + 1;
        const previousLapTime = laps.length > 0 ? laps[laps.length - 1].time : 0;
        const lapDiff = lapTime - previousLapTime;

        laps.push({ number: lapNumber, time: lapTime, diff: lapDiff });
        updateLapsDisplay();
    }

    function updateLapsDisplay() {
        if (laps.length === 0) {
            lapsContainer.style.display = 'none';
            lapsList.innerHTML = '<div class="empty-laps">No laps recorded yet</div>';
        } else {
            lapsContainer.style.display = 'block';
            lapsList.innerHTML = '';

            // Show laps in reverse order (newest first)
            for (let i = laps.length - 1; i >= 0; i--) {
                const lap = laps[i];
                const lapItem = document.createElement('div');
                lapItem.className = 'lap-item';
                lapItem.innerHTML = `
                    <span class="lap-number">Lap ${lap.number}</span>
                    <span class="lap-time">${formatTimeWithMs(lap.time)}</span>
                    <span class="lap-diff">+${formatTimeWithMs(lap.diff)}</span>
                `;
                lapsList.appendChild(lapItem);
            }
        }
    }

    stopwatchStartBtn.addEventListener('click', startStopwatch);
    stopwatchResetBtn.addEventListener('click', resetStopwatch);
    stopwatchLapBtn.addEventListener('click', recordLap);
    clearLapsBtn.addEventListener('click', () => {
        laps = [];
        updateLapsDisplay();
    });

    // Timer
    let timerInterval = null;
    let timerTime = 0;
    let timerDuration = 0;
    let timerRunning = false;

    const timerDisplay = document.getElementById('timer-display');
    const timerStartBtn = document.getElementById('timer-start');
    const timerResetBtn = document.getElementById('timer-reset');
    const hoursInput = document.getElementById('hours');
    const minutesInput = document.getElementById('minutes');
    const secondsInput = document.getElementById('seconds');
    const timerRing = document.getElementById('timer-ring');
    const timerCircle = timerRing.querySelector('circle');

    function updateTimerDisplay() {
        timerDisplay.textContent = formatTime(timerTime);
        updateTimerProgress();
    }

    function updateTimerProgress() {
        if (timerDuration > 0) {
            const progress = (timerDuration - timerTime) / timerDuration;
            const offset = 880 - (880 * progress);
            timerCircle.style.strokeDashoffset = offset;
        }
    }

    function setTimerInputs(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        hoursInput.value = hours;
        minutesInput.value = minutes;
        secondsInput.value = seconds;
    }

    function getTimerInputs() {
        const hours = parseInt(hoursInput.value) || 0;
        const minutes = parseInt(minutesInput.value) || 0;
        const seconds = parseInt(secondsInput.value) || 0;
        return (hours * 3600 + minutes * 60 + seconds) * 1000;
    }

    function startTimer() {
        if (!timerRunning) {
            const inputTime = getTimerInputs();
            if (timerTime === 0 && inputTime === 0) {
                alert('Please set a timer duration');
                return;
            }

            if (timerTime === 0) {
                timerTime = inputTime;
                timerDuration = inputTime;
            }

            const startTime = Date.now();
            const initialTime = timerTime;

            timerInterval = setInterval(() => {
                const elapsed = Date.now() - startTime;
                timerTime = Math.max(0, initialTime - elapsed);
                updateTimerDisplay();

                if (timerTime === 0) {
                    clearInterval(timerInterval);
                    timerRunning = false;
                    timerStartBtn.innerHTML = '<i class="fas fa-play"></i> Start';
                    playTimerAlert();
                }
            }, 10);

            timerRunning = true;
            timerStartBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
            hoursInput.disabled = true;
            minutesInput.disabled = true;
            secondsInput.disabled = true;
        } else {
            clearInterval(timerInterval);
            timerRunning = false;
            timerStartBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
        }
    }

    function resetTimer() {
        clearInterval(timerInterval);
        timerTime = 0;
        timerDuration = 0;
        timerRunning = false;
        timerCircle.style.strokeDashoffset = 880;
        updateTimerDisplay();
        timerStartBtn.innerHTML = '<i class="fas fa-play"></i> Start';
        hoursInput.disabled = false;
        minutesInput.disabled = false;
        secondsInput.disabled = false;
        hoursInput.value = 0;
        minutesInput.value = 0;
        secondsInput.value = 0;
    }

    function playTimerAlert() {
        // Create a simple beep sound
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
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

        // Also show notification if supported
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Timer Complete!', {
                body: 'Your countdown timer has finished.',
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">⏰</text></svg>'
            });
        }
    }

    // Input validation
    [hoursInput, minutesInput, secondsInput].forEach(input => {
        input.addEventListener('input', () => {
            if (input.value < 0) input.value = 0;
            if (input === hoursInput && input.value > 23) input.value = 23;
            if ((input === minutesInput || input === secondsInput) && input.value > 59) input.value = 59;
        });

        input.addEventListener('blur', () => {
            if (input.value === '') input.value = 0;
        });
    });

    timerStartBtn.addEventListener('click', startTimer);
    timerResetBtn.addEventListener('click', resetTimer);

    // Request notification permission for timer
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Space bar to start/pause (only if not typing in inputs)
        if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
            e.preventDefault();
            if (stopwatchSection.classList.contains('active')) {
                startStopwatch();
            } else {
                startTimer();
            }
        }

        // 'L' key for lap (only in stopwatch mode)
        if (e.key === 'l' && stopwatchSection.classList.contains('active') && !stopwatchLapBtn.disabled && e.target.tagName !== 'INPUT') {
            recordLap();
        }

        // 'R' key for reset
        if (e.key === 'r' && e.target.tagName !== 'INPUT') {
            if (stopwatchSection.classList.contains('active')) {
                resetStopwatch();
            } else {
                resetTimer();
            }
        }
    });
});
