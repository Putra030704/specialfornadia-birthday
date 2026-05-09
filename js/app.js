/* ===== STATE MANAGEMENT ===== */
let currentScreen = 0;
let enteredPin = '';
const CORRECT_PIN = '100505';
const MAX_PIN_LENGTH = 6;

/* ===== AUDIO CONTEXT ===== */
let audioContext = null;

/* ===== LIGHTBOX ===== */
const memoryPhotos = [
    { src: 'img/src1.jpg', caption: 'This was our first picture, a moment I\'ll always remember' },
    { src: 'img/src2.jpg', caption: 'I\'m so grateful for every moment we\'ve shared since then' },
    { src: 'img/src3.jpg', caption: 'Thank you for being part of my days and making them special' },
    { src: 'img/src4.jpg', caption: 'I hope we keep creating memories, big and small, together' },
    { src: 'img/src5.jpg', caption: 'you deserve the world and i\'ll always love you...' }
];

const flowersPhotos = [
    { 
        src: 'img/flower1.jpg', 
        name: 'White Rose', 
        description: 'Like this white rose, our love is pure and untainted. Untouched by time.' 
    },
    { 
        src: 'img/flower2.jpg', 
        name: 'Red Rose', 
        description: 'Red rose for my deepest passion. The most beautiful love I have ever known.' 
    },
    { 
        src: 'img/flower3.jpg', 
        name: 'Pink Rose', 
        description: 'Pink rose for the gentle love. It grows stronger each day in my heart.' 
    },
    { 
        src: 'img/flower4.jpg', 
        name: 'Sunflower', 
        description: 'Like the sunflower always facing the sun, you are my light that guides me home.' 
    }
];

let currentLightboxIndex = 0;
let currentFlowerIndex = 0;
let lightboxTouchStartX = 0;

/* ===== SWIPE STATE ===== */
let touchStartX = 0;
let touchEndX = 0;

/* ===== SOUND EFFECTS ===== */
const sounds = {
    click: new Audio('audio/click.mp3'),
    success: new Audio('audio/success.mp3'),
    error: new Audio('audio/error.mp3'),
    bgm: new Audio('audio/bgm.mp3')
};

/* ===== MUSIC PLAYER ===== */
const playlist = [
    { title: 'Perfect', artist: 'Ed Sheeran', src: 'audio/song1.mp3' },
    { title: 'About You', artist: 'The 1975', src: 'audio/song2.mp3' },
    { title: 'Love Story', artist: 'Taylor Swift', src: 'audio/song3.mp3' },
    { title: 'My Love Mine All Mine', artist: 'Mitski', src: 'audio/song4.mp3' },
    { title: 'Mine', artist: 'Taylor Swift', src: 'audio/song5.mp3' },
    { title: 'Begin Again', artist: 'Taylor Swift', src: 'audio/song6.mp3' }
];

let currentSongIndex = 0;
let isPlaying = false;
let audioPlayer = new Audio();

/* ===== EASTER EGG ===== */
let capooTapCount = 0;
let easterEggTimer = null;

/* ===== DOM ELEMENTS ===== */
const screens = document.querySelectorAll('.screen');
const pinDots = document.querySelectorAll('.pin-dot');
const numpadButtons = document.querySelectorAll('.num-btn');
const progressDots = document.querySelectorAll('.progress-dots .dot');

/* ===== INITIALIZE ===== */
document.addEventListener('DOMContentLoaded', () => {
    initNumpad();
    initMusicPlayer();
    initFloatingBackground();
    initAudioContext();
    initSwipeGestures();
    
    // Hide loading screen after assets load
    setTimeout(() => {
        document.getElementById('loading-screen').classList.add('hidden');
    }, 2500);
});

/* ===== SWIPE GESTURES ===== */
function initSwipeGestures() {
    document.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    document.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });
}

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    // Only handle swipe in memory lane screens (6-10) and flowers screen (15)
    if (currentScreen >= 6 && currentScreen <= 10 || currentScreen === 15) {
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe left - next
                goToScreen(currentScreen + 1);
            } else {
                // Swipe right - back
                goToScreen(currentScreen - 1);
            }
        }
    }
}

/* ===== MEMORY LIGHTBOX ===== */
function openLightbox(index) {
    playSynthSound('button');
    currentLightboxIndex = index;
    
    const photo = memoryPhotos[index];
    document.getElementById('lightbox-img').src = photo.src;
    document.getElementById('lightbox-caption').textContent = photo.caption;
    
    document.getElementById('lightbox').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    playSynthSound('transition');
    document.getElementById('lightbox').classList.remove('active');
    document.body.style.overflow = '';
}

function prevLightbox() {
    playSynthSound('click');
    currentLightboxIndex = (currentLightboxIndex - 1 + memoryPhotos.length) % memoryPhotos.length;
    updateLightbox();
}

function nextLightbox() {
    playSynthSound('click');
    currentLightboxIndex = (currentLightboxIndex + 1) % memoryPhotos.length;
    updateLightbox();
}

function updateLightbox() {
    const photo = memoryPhotos[currentLightboxIndex];
    document.getElementById('lightbox-img').src = photo.src;
    document.getElementById('lightbox-caption').textContent = photo.caption;
}

/* ===== FLOWER LIGHTBOX ===== */
function openLightboxFlowers(index) {
    playSynthSound('button');
    currentFlowerIndex = index;
    updateFlowerLightbox();
    document.getElementById('lightbox-flower').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightboxFlower() {
    playSynthSound('transition');
    document.getElementById('lightbox-flower').classList.remove('active');
    document.body.style.overflow = '';
}

function prevLightboxFlower() {
    playSynthSound('click');
    currentFlowerIndex = (currentFlowerIndex - 1 + flowersPhotos.length) % flowersPhotos.length;
    updateFlowerLightbox();
}

function nextLightboxFlower() {
    playSynthSound('click');
    currentFlowerIndex = (currentFlowerIndex + 1) % flowersPhotos.length;
    updateFlowerLightbox();
}

function updateFlowerLightbox() {
    const flower = flowersPhotos[currentFlowerIndex];
    document.getElementById('lightbox-img-flower').src = flower.src;
    document.getElementById('lightbox-title-flower').textContent = flower.name;
    document.getElementById('lightbox-caption-flower').textContent = flower.description;
}

/* ===== AUDIO CONTEXT FOR SOUND ===== */
function initAudioContext() {
    // Mobile: need touchend event for audio context
    const startAudio = () => {
        if (!audioContext) {
            try {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {}
        }
        if (audioContext && audioContext.state === 'suspended') {
            audioContext.resume();
        }
    };
    
    document.addEventListener('click', startAudio, { once: true });
    document.addEventListener('touchend', startAudio, { once: true });
}

/* ===== PLAY SOUND EFFECT ===== */
function playSound(soundName) {
    try {
        const sound = sounds[soundName];
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(() => {});
        }
    } catch (e) {}
}

/* ===== GENERATE SYNTH SOUND ===== */
function playSynthSound(type) {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    if (type === 'click') {
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(1.5, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    } else if (type === 'success') {
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2);
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(1.5, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.4);
    } else if (type === 'error') {
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        oscillator.type = 'sawtooth';
        gainNode.gain.setValueAtTime(1.5, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    } else if (type === 'button') {
        // Cute button click - higher pitch pop sound
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(900, audioContext.currentTime + 0.05);
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(1.5, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.15);
    } else if (type === 'celebrate') {
        // Birthday celebration sound - ascending melody
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2);
        oscillator.frequency.setValueAtTime(1046.50, audioContext.currentTime + 0.3);
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(1.5, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } else if (type === 'love') {
        // Romantic soft sound - gentle chime
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(554.37, audioContext.currentTime + 0.15);
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.3);
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(1.5, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.45);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.45);
    } else if (type === 'transition') {
        // Whoosh/slide transition sound
        oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.2);
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(1.5, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.25);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.25);
    }
}

/* ===== NUMPAD FUNCTIONALITY ===== */
let numpadClickFlag = false;

function initNumpad() {
    numpadButtons.forEach(btn => {
        btn.addEventListener('click', handleNumBtnClick);
    });
}

function handleNumBtnClick(e) {
    // Prevent double-click on mobile
    if (numpadClickFlag) return;
    numpadClickFlag = true;
    setTimeout(() => { numpadClickFlag = false; }, 300);
    
    e.preventDefault();
    playSynthSound('click');
    
    const btn = e.currentTarget;
    const num = btn.dataset.num;
    const action = btn.dataset.action;
    
    if (num !== undefined) {
        enterDigit(num);
    } else if (action === 'backspace') {
        deleteDigit();
    } else if (action === 'clear') {
        clearPin();
    }
}

function enterDigit(digit) {
    if (enteredPin.length >= MAX_PIN_LENGTH) return;
    
    enteredPin += digit;
    updatePinDots();
    checkPassword();
}

function deleteDigit() {
    if (enteredPin.length === 0) return;
    
    enteredPin = enteredPin.slice(0, -1);
    updatePinDots();
}

function clearPin() {
    enteredPin = '';
    updatePinDots();
}

function updatePinDots() {
    pinDots.forEach((dot, index) => {
        if (index < enteredPin.length) {
            dot.classList.add('filled');
            dot.classList.remove('error');
        } else {
            dot.classList.remove('filled', 'error');
        }
    });
}

function checkPassword() {
    if (enteredPin.length === MAX_PIN_LENGTH) {
        if (enteredPin === CORRECT_PIN) {
            setTimeout(() => {
                playSynthSound('success');
                goToScreen(1);
            }, 300);
        } else {
            setTimeout(() => {
                showError();
            }, 400);
        }
    }
}

function showError() {
    playSynthSound('error');
    
    pinDots.forEach(dot => {
        dot.classList.add('error');
        dot.classList.remove('filled');
    });
    
    setTimeout(() => {
        enteredPin = '';
        updatePinDots();
    }, 500);
}

/* ===== SCREEN TRANSITIONS ===== */
function goToScreen(screenIndex) {
    if (screenIndex < 0 || screenIndex >= screens.length) return;
    
    const currentScreenEl = document.querySelector('.screen:not(.hidden)');
    const nextScreenEl = document.getElementById(`screen-${screenIndex}`);
    
    // Play transition sound
    playSynthSound('transition');
    
    if (currentScreenEl) {
        currentScreenEl.classList.add('hidden');
    }
    
    setTimeout(() => {
        nextScreenEl.classList.remove('hidden');
        currentScreen = screenIndex;
        
        updateProgressDots();
        
        // Screen-specific effects and sounds
        switch(screenIndex) {
            case 2: // Ready screen
                playSynthSound('button');
                break;
            case 3: // Mad screen
                playSynthSound('error');
                break;
            case 4: // Birthday Wish (Early)
                playSynthSound('celebrate');
                break;
            case 6: // Memory Lane starts
            case 7:
            case 8:
            case 9:
            case 10:
                playSynthSound('button');
                // Reset and animate polaroids
                resetPolaroidAnimation();
                animatePolaroid();
                break;
            case 11: // Galaxy Link
                playSynthSound('button');
                break;
            case 12: // Our Song
                playSynthSound('love');
                break;
            case 13: // Spotify Card
                playSynthSound('love');
                break;
            case 14: // Happy Birthday Letter (FINAL LETTER)
                playSynthSound('celebrate');
                startTypingEffect();
                startFloatingElements();
                showLetterConfetti(); // Confetti for birthday!
                break;
            case 15: // Flowers Screen
                playSynthSound('button');
                resetPolaroidAnimation();
                animatePolaroid();
                break;
            case 16: // End Screen
                playSynthSound('celebrate');
                showEndConfetti();
                break;
        }
        
        // Update mini player visibility
        const miniPlayer = document.getElementById('floating-mini-player');
        if (miniPlayer) {
            if (screenIndex === 0) {
                miniPlayer.classList.remove('active');
            } else if (screenIndex >= 1 && screenIndex <= 12) {
                miniPlayer.classList.add('active');
            } else {
                miniPlayer.classList.remove('active');
                // Close panel if open
                const panel = document.getElementById('mini-player-panel');
                if (panel) panel.classList.remove('active');
            }
        }
    }, 100);
}

function updateProgressDots() {
    const dots = document.querySelectorAll('.progress-dots .dot');
    dots.forEach((dot, index) => {
        if (index === currentScreen) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

function restart() {
    enteredPin = '';
    updatePinDots();
    goToScreen(0);
}

/* ===== TYPING EFFECT ===== */
const letterContent = `Happy 21st Birthday, my love! 🎂

It feels like time is moving so fast, and I am beyond grateful to be standing right here by your side as you take this big step into a new chapter. Turning 21 is a huge milestone, but to me, you are far more special than any number or age could ever represent.

Every single day spent with you feels like a gift that I never get tired of opening. Thank you for making my world so much brighter just by being yourself. Thank you for being the Nadia I know the one who is so kind-hearted, so caring, and who always finds a way to make me smile, even on my most exhausting days. You are beautiful, Nad, but what truly amazes me is how beautiful your heart is and how you see the best in the world around you.

In this new, more mature chapter of your life, my wish for you is simple: I hope the world treats you as kindly as you have always treated me. I hope this year brings every single dream you’ve kept in your heart to life. You deserve all the happiness this world has to offer, and I want to be the one right there beside you, making sure you get every bit of it.

I love you more than these words on a screen could ever express. It will always be this way. Always and forever 💙

With all my love,

Putra`;

let typingIndex = 0;
let typingInterval = null;

function startTypingEffect() {
    const letterText = document.getElementById('letter-text');
    if (!letterText) return;
    
    letterText.textContent = '';
    typingIndex = 0;
    
    if (typingInterval) clearInterval(typingInterval);
    
    typingInterval = setInterval(() => {
        if (typingIndex < letterContent.length) {
            letterText.textContent += letterContent[typingIndex];
            typingIndex++;
        } else {
            clearInterval(typingInterval);
        }
    }, 40);
}

/* ===== POLAROID ANIMATION ===== */
function animatePolaroid() {
    setTimeout(() => {
        const polaroids = document.querySelectorAll('.polaroid');
        polaroids.forEach((polaroid) => {
            polaroid.classList.add('visible');
        });
        
        // Animate buttons with delay
        const btnGroup = document.querySelector('.btn-group');
        if (btnGroup) {
            btnGroup.style.opacity = '0';
            setTimeout(() => {
                btnGroup.style.opacity = '1';
            }, 600);
        }
    }, 100);
}

function resetPolaroidAnimation() {
    const polaroids = document.querySelectorAll('.polaroid');
    polaroids.forEach((polaroid) => {
        polaroid.classList.remove('visible');
    });
    
    const btnGroup = document.querySelector('.btn-group');
    if (btnGroup) {
        btnGroup.style.opacity = '0';
    }
}

/* ===== CONFETTI & FLOATING ELEMENTS ===== */
function initFloatingBackground() {
    const container = document.getElementById('floating-bg');
    if (!container) return;
    
    for (let i = 0; i < 15; i++) {
        createFloatingBgElement(container, 'heart', i * 800);
        createFloatingBgElement(container, 'star', i * 800 + 400);
    }
}

function createFloatingBgElement(container, type, delay) {
    setTimeout(() => {
        const el = document.createElement('div');
        el.className = type === 'heart' ? 'floating-heart-bg' : 'floating-star-bg';
        el.innerHTML = type === 'heart' ? '❤' : '★';
        el.style.left = Math.random() * 100 + '%';
        el.style.animationDuration = (4 + Math.random() * 3) + 's';
        el.style.animationDelay = Math.random() * 2 + 's';
        
        container.appendChild(el);
        
        setTimeout(() => {
            el.remove();
        }, 7000);
    }, delay);
}

function startFloatingElements() {
    const container = document.getElementById('confetti-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    for (let i = 0; i < 10; i++) {
        createFloatingHeart(i * 400);
    }
    
    for (let i = 0; i < 8; i++) {
        createFloatingStar(i * 500 + 200);
    }
    
    setTimeout(() => {
        triggerConfetti();
    }, 1000);
}

function createFloatingHeart(delay) {
    const container = document.getElementById('confetti-container');
    if (!container) return;
    
    setTimeout(() => {
        const heart = document.createElement('div');
        heart.className = 'floating-heart';
        heart.innerHTML = '❤';
        heart.style.left = Math.random() * 100 + '%';
        heart.style.animationDelay = Math.random() * 2 + 's';
        heart.style.animationDuration = (3 + Math.random() * 2) + 's';
        
        container.appendChild(heart);
        
        setTimeout(() => {
            heart.remove();
        }, 5000);
    }, delay);
}

function createFloatingStar(delay) {
    const container = document.getElementById('confetti-container');
    if (!container) return;
    
    setTimeout(() => {
        const star = document.createElement('div');
        star.className = 'floating-star';
        star.innerHTML = '★';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 50 + '%';
        star.style.animationDelay = Math.random() * 2 + 's';
        star.style.animationDuration = (2 + Math.random() * 2) + 's';
        
        container.appendChild(star);
        
        setTimeout(() => {
            star.remove();
        }, 4000);
    }, delay);
}

function triggerConfetti() {
    if (typeof confetti === 'function') {
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, shapes: ['circle', 'square'] };
        
        const randomInRange = (min, max) => Math.random() * (max - min) + min;
        
        const interval = setInterval(() => {
            const timeLeft = animationEnd - Date.now();
            
            if (timeLeft <= 0) {
                return clearInterval(interval);
            }
            
            const particleCount = 50 * (timeLeft / duration);
            
            confetti(Object.assign({}, defaults, {
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
                colors: ['#4169E1', '#FFD700', '#FF69B4', '#FFFFFF']
            }));
            
            confetti(Object.assign({}, defaults, {
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
                colors: ['#4169E1', '#FFD700', '#FF69B4', '#FFFFFF']
            }));
        }, 250);
    }
}

function showLetterConfetti() {
    // Special confetti for birthday letter - pink/gold theme
    if (typeof confetti === 'function') {
        const duration = 8000;
        const end = Date.now() + duration;
        
        const frame = () => {
            confetti({
                particleCount: 5,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#FF69B4', '#FFD700', '#FF1493', '#FFB6C1']
            });
            
            confetti({
                particleCount: 5,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#FF69B4', '#FFD700', '#FF1493', '#FFB6C1']
            });
            
            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        };
        
        frame();
    }
}

function showEndConfetti() {
    if (typeof confetti === 'function') {
        const duration = 5000;
        const end = Date.now() + duration;
        
        const frame = () => {
            confetti({
                particleCount: 7,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#4169E1', '#FFD700', '#FF69B4']
            });
            
            confetti({
                particleCount: 7,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#4169E1', '#FFD700', '#FF69B4']
            });
            
            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        };
        
        frame();
    }
}

/* ===== MUSIC PLAYER ===== */
function initMusicPlayer() {
    audioPlayer.addEventListener('ended', () => {
        // Loop lagu yang sedang diputar, tidak berpindah
        if (audioPlayer.src) {
            playSong(currentSongIndex, true);
        }
    });
    
    audioPlayer.addEventListener('timeupdate', updateProgress);
    
    audioPlayer.addEventListener('loadedmetadata', () => {
        document.getElementById('duration').textContent = formatTime(audioPlayer.duration);
        document.getElementById('spotify-duration').textContent = formatTime(audioPlayer.duration);
        document.getElementById('mini-duration').textContent = formatTime(audioPlayer.duration);
    });
}

function togglePlayer() {
    const panel = document.getElementById('player-panel');
    panel.classList.toggle('active');
}

function togglePlay() {
    if (isPlaying) {
        audioPlayer.pause();
        document.getElementById('main-play-btn').textContent = '▶';
        document.getElementById('mini-play-btn').textContent = '▶';
    } else {
        if (audioPlayer.src) {
            audioPlayer.play();
        } else {
            playSong(0);
        }
        document.getElementById('main-play-btn').textContent = '⏸';
        document.getElementById('mini-play-btn').textContent = '⏸';
    }
    isPlaying = !isPlaying;
}

function playSong(index, autoPlay = false) {
    currentSongIndex = index;
    const song = playlist[index];
    
    audioPlayer.src = song.src;
    document.getElementById('spotify-song-title').textContent = song.title;
    document.getElementById('spotify-song-artist').textContent = song.artist;
    
    // Auto-play if specified (from nextSong/loop) OR if was already playing
    if (autoPlay || isPlaying) {
        audioPlayer.play().then(() => {
            isPlaying = true;
            document.getElementById('main-play-btn').textContent = '⏸';
            document.getElementById('mini-play-btn').textContent = '⏸';
        }).catch(() => {});
    } else {
        isPlaying = false;
        document.getElementById('main-play-btn').textContent = '▶';
        document.getElementById('mini-play-btn').textContent = '▶';
    }
    
    updatePlaylistUI();
    updateSpotifyTrackUI();
    updateMiniPlayerUI();
    
    if (!autoPlay) {
        playSynthSound('click');
    }
}

function updateSpotifyTrackUI() {
    // Update Spotify playlist UI
    for (let i = 0; i < playlist.length; i++) {
        const trackEl = document.getElementById(`spotify-track-${i}`);
        if (trackEl) {
            if (i === currentSongIndex) {
                trackEl.classList.add('active');
            } else {
                trackEl.classList.remove('active');
            }
        }
    }
}

function prevSong(autoPlay = true) {
    currentSongIndex = (currentSongIndex - 1 + playlist.length) % playlist.length;
    playSong(currentSongIndex, autoPlay);
}

function nextSong(autoPlay = true) {
    currentSongIndex = (currentSongIndex + 1) % playlist.length;
    playSong(currentSongIndex, autoPlay);
}

function updateProgress() {
    const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100 || 0;
    
    // Update floating player progress
    document.getElementById('progress-fill').style.width = progress + '%';
    document.getElementById('current-time').textContent = formatTime(audioPlayer.currentTime);
    
    // Update Spotify player progress
    document.getElementById('spotify-progress-fill').style.width = progress + '%';
    document.getElementById('spotify-current-time').textContent = formatTime(audioPlayer.currentTime);
    document.getElementById('spotify-duration').textContent = formatTime(audioPlayer.duration);
    
    // Sync with mini player
    document.getElementById('mini-progress-fill').style.width = progress + '%';
    document.getElementById('mini-current-time').textContent = formatTime(audioPlayer.currentTime);
}

function setVolume(value) {
    audioPlayer.volume = value / 100;
}

function updatePlaylistUI() {
    const items = document.querySelectorAll('.playlist-item');
    items.forEach((item, index) => {
        if (index === currentSongIndex) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins + ':' + (secs < 10 ? '0' : '') + secs;
}

/* ===== MINI PLAYER ===== */
let miniPlayerOpen = false;

function toggleMiniPlayer() {
    const panel = document.getElementById('mini-player-panel');
    panel.classList.toggle('active');
    miniPlayerOpen = !miniPlayerOpen;
}

function togglePlayMini() {
    if (isPlaying) {
        audioPlayer.pause();
        document.getElementById('mini-play-btn').textContent = '▶';
        document.getElementById('main-play-btn').textContent = '▶';
    } else {
        if (audioPlayer.src) {
            audioPlayer.play();
            document.getElementById('mini-play-btn').textContent = '⏸';
            document.getElementById('main-play-btn').textContent = '⏸';
        } else {
            playSong(0, true);
        }
    }
    isPlaying = !isPlaying;
}

function prevSongMini() {
    prevSong(true);
    updateMiniPlayerUI();
}

function nextSongMini() {
    nextSong(true);
    updateMiniPlayerUI();
}

function updateMiniPlayerUI() {
    const song = playlist[currentSongIndex];
    document.getElementById('mini-song-title').textContent = song.title;
    document.getElementById('mini-song-artist').textContent = song.artist;
}

/* ===== EASTER EGG ===== */
function easterEgg() {
    capooTapCount++;
    
    if (easterEggTimer) clearTimeout(easterEggTimer);
    
    easterEggTimer = setTimeout(() => {
        capooTapCount = 0;
    }, 2000);
    
    if (capooTapCount >= 5) {
        capooTapCount = 0;
        triggerEasterEgg();
    }
}

function triggerEasterEgg() {
    playSynthSound('success');
    
    const capoo = document.querySelector('.capoo-gif');
    if (capoo) {
        capoo.style.animation = 'none';
        setTimeout(() => {
            capoo.style.animation = 'float 0.5s ease infinite, shake 0.5s ease infinite';
        }, 10);
        
        setTimeout(() => {
            capoo.style.animation = 'float 3s ease-in-out infinite';
        }, 3000);
    }
    
    if (typeof confetti === 'function') {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#4169E1', '#FFD700', '#FF69B4']
        });
    }
}

/* ===== BUTTON CLICK Sounds ===== */
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('action-btn') || e.target.classList.contains('control-btn') || e.target.classList.contains('playlist-item')) {
        // Use different sounds based on button text/context
        const btnText = e.target.textContent.toLowerCase();
        
        if (btnText.includes('yess') || btnText.includes('yes')) {
            playSynthSound('success');
        } else if (btnText.includes('noo') || btnText.includes('no')) {
            playSynthSound('error');
        } else if (btnText.includes('open it') || btnText.includes('tap')) {
            playSynthSound('button');
        } else if (btnText.includes('next') || btnText.includes('back')) {
            playSynthSound('transition');
        } else if (btnText.includes('heart') || btnText.includes('❤️')) {
            playSynthSound('love');
        } else {
            playSynthSound('click');
        }
    }
});

/* ===== KEYBOARD SUPPORT ===== */
document.addEventListener('keydown', (e) => {
    if (currentScreen !== 0) return;
    
    const key = e.key;
    
    if (key >= '0' && key <= '9') {
        playSynthSound('click');
        enterDigit(key);
    } else if (key === 'Backspace') {
        deleteDigit();
    } else if (key === 'Escape' || key === 'Delete') {
        clearPin();
    } else if (key === 'Enter') {
        if (enteredPin.length === MAX_PIN_LENGTH) {
            checkPassword();
        }
    }
});

/* ===== PREVENT SCROLL ON MOBILE - BLOCK ONLY ON SPECIFIC ELEMENTS THAT NEED IT ===== */
// Hapus scroll hijacking yang memblokir semua scroll. 
// Sekarang scroll hanya dicegah pada elemen spesifik yang memang perlu:
// - numpad (untuk mencegah zoom saat double-tap)
// - lightbox (saat melihat foto penuh)
// Element lain bebas untuk di-scroll

/* ===== EXPORT FUNCTIONS ===== */
window.goToScreen = goToScreen;
window.restart = restart;
window.togglePlayer = togglePlayer;
window.togglePlay = togglePlay;
window.playSong = playSong;
window.prevSong = prevSong;
window.nextSong = nextSong;
window.setVolume = setVolume;
window.easterEgg = easterEgg;
window.openLightbox = openLightbox;
window.openLightboxFlowers = openLightboxFlowers;
window.closeLightbox = closeLightbox;
window.closeLightboxFlower = closeLightboxFlower;
window.prevLightbox = prevLightbox;
window.nextLightbox = nextLightbox;
window.prevLightboxFlower = prevLightboxFlower;
window.nextLightboxFlower = nextLightboxFlower;
window.toggleMiniPlayer = toggleMiniPlayer;
window.togglePlayMini = togglePlayMini;
window.prevSongMini = prevSongMini;
window.nextSongMini = nextSongMini;