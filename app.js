const FULL_DASH_ARRAY = 2 * Math.PI * 100; // SVG circle r=100
const TIMER_DURATION = 30 * 60; // 30 minutes in seconds
let timeLeft = TIMER_DURATION;
let timerInterval = null;
let running = false;
let currentPlaylist = null;
let currentPlaylistIndex = 0;

const timerDisplay = document.getElementById('timer-display');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const repeatBtn = document.getElementById('repeat-btn');
const timerProgress = document.querySelector('.timer-progress');
const audioPlayer = document.getElementById('audio-player');
const playMusicBtn = document.getElementById('play-music-btn');
const pauseMusicBtn = document.getElementById('pause-music-btn');

// Timer setup overlay logic
const timerSetupOverlay = document.getElementById('timer-setup-overlay');
const setupHours = document.getElementById('setup-hours');
const setupMinutes = document.getElementById('setup-minutes');
const setupSeconds = document.getElementById('setup-seconds');
const incHours = document.getElementById('inc-hours');
const incMinutes = document.getElementById('inc-minutes');
const incSeconds = document.getElementById('inc-seconds');
const decHours = document.getElementById('dec-hours');
const decMinutes = document.getElementById('dec-minutes');
const decSeconds = document.getElementById('dec-seconds');
const setupPlayBtn = document.getElementById('setup-play-btn');
const timerCircle = document.querySelector('.timer-circle-container');
const closeSetupBtn = document.getElementById('close-setup-btn');

let setupH = 0, setupM = 30, setupS = 0;

function formatTime(seconds) {
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${m}:${s}`;
}

function updateTimerDisplay() {
    timerDisplay.textContent = formatTime(timeLeft);
}

function setCircleDashoffset() {
    const percent = timeLeft / TIMER_DURATION;
    timerProgress.style.strokeDashoffset = (1 - percent) * FULL_DASH_ARRAY;
}

function setPausePlayIcon() {
    const iconSpan = document.getElementById('pause-play-icon');
    if (running) {
        iconSpan.innerHTML = `
            <svg width="64" height="64" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="28" fill="none" stroke="#f97316" stroke-width="4"/>
                <rect x="24" y="20" width="6" height="24" rx="2" fill="#f97316"/>
                <rect x="34" y="20" width="6" height="24" rx="2" fill="#f97316"/>
            </svg>
        `;
    } else {
        iconSpan.innerHTML = `
            <svg width="64" height="64" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="28" fill="none" stroke="#f97316" stroke-width="4"/>
                <polygon points="26,20 46,32 26,44" fill="#f97316"/>
            </svg>
        `;
    }
}

function playNextInPlaylist() {
    if (currentPlaylist && currentPlaylistIndex < currentPlaylist.length - 1) {
        currentPlaylistIndex++;
        audioPlayer.src = currentPlaylist[currentPlaylistIndex];
        audioPlayer.play();
    }
}

function startTimer() {
    if (running) return;
    running = true;
    setPausePlayIcon();
    
    // Initialize playlist if needed
    const savedSound = localStorage.getItem('currentTimerSound');
    if (savedSound && savedSound.startsWith('[')) {
        currentPlaylist = JSON.parse(savedSound);
        currentPlaylistIndex = 0;
        audioPlayer.src = currentPlaylist[0];
    } else {
        currentPlaylist = null;
        currentPlaylistIndex = 0;
    }
    
    timerInterval = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            updateTimerDisplay();
            setCircleDashoffset();
            if (audioPlayer.paused) audioPlayer.play();
        } else {
            clearInterval(timerInterval);
            running = false;
            setPausePlayIcon();
            audioPlayer.pause();
            audioPlayer.currentTime = 0;
        }
    }, 1000);
}

function pauseTimer() {
    running = false;
    setPausePlayIcon();
    clearInterval(timerInterval);
    audioPlayer.pause();
}

function resetTimer() {
    running = false;
    setPausePlayIcon();
    clearInterval(timerInterval);
    timeLeft = TIMER_DURATION;
    updateTimerDisplay();
    setCircleDashoffset();
    audioPlayer.pause();
    audioPlayer.currentTime = 0;
}

pauseBtn.onclick = function() {
    if (running) {
        pauseTimer();
    } else {
        startTimer();
    }
};
resetBtn.onclick = resetTimer;
repeatBtn.onclick = resetTimer;

playMusicBtn.onclick = function() {
    audioPlayer.play();
};
pauseMusicBtn.onclick = function() {
    audioPlayer.pause();
};

function updateSetupDisplay() {
    setupHours.textContent = String(setupH).padStart(2, '0');
    setupMinutes.textContent = String(setupM).padStart(2, '0');
    setupSeconds.textContent = String(setupS).padStart(2, '0');
}

function clamp(val, min, max) { return Math.max(min, Math.min(max, val)); }

incHours.onclick = () => { setupH = clamp(setupH + 1, 0, 23); updateSetupDisplay(); };
decHours.onclick = () => { setupH = clamp(setupH - 1, 0, 23); updateSetupDisplay(); };
incMinutes.onclick = () => { setupM = clamp(setupM + 1, 0, 59); updateSetupDisplay(); };
decMinutes.onclick = () => { setupM = clamp(setupM - 1, 0, 59); updateSetupDisplay(); };
incSeconds.onclick = () => { setupS = clamp(setupS + 1, 0, 59); updateSetupDisplay(); };
decSeconds.onclick = () => { setupS = clamp(setupS - 1, 0, 59); updateSetupDisplay(); };

timerCircle.onclick = () => {
    setupH = Math.floor(timeLeft / 3600);
    setupM = Math.floor((timeLeft % 3600) / 60);
    setupS = timeLeft % 60;
    updateSetupDisplay();
    timerSetupOverlay.style.display = 'flex';
};

setupPlayBtn.onclick = () => {
    timeLeft = setupH * 3600 + setupM * 60 + setupS;
    updateTimerDisplay();
    setCircleDashoffset();
    timerSetupOverlay.style.display = 'none';
};

closeSetupBtn.onclick = () => {
    timerSetupOverlay.style.display = 'none';
};

// Add event listener for audio ended
audioPlayer.addEventListener('ended', function() {
    if (currentPlaylist) {
        playNextInPlaylist();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // Show loading overlay every time the app is opened
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        setTimeout(() => {
            loadingOverlay.style.display = 'none';
        }, 1500);
    }
    updateTimerDisplay();
    setCircleDashoffset();
    setPausePlayIcon();
}); 