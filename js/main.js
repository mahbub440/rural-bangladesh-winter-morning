/**
 * main.js — Entry point, game loop, canvas setup, and procedural audio synthesis
 */

import { Camera, WORLD } from './scene.js';
import { Environment } from './environment.js';
import { CharacterManager } from './characters.js';

// ─── State ───────────────────────────────────────────────────────────
const canvas = document.getElementById('scene-canvas');
const ctx = canvas.getContext('2d');
const camera = new Camera();
const environment = new Environment();
const characters = new CharacterManager();

let paused = false;
let lastTimestamp = 0;
let totalTime = 0;
let soundEnabled = false;

// ─── Authentic Rural Audio Synthesis ─────────────────────────────────
let audioCtx = null;
let masterGain = null;
let breezeSource = null;
let birdTimerId = null;

function initAudio() {
    if (audioCtx) return;
    try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        masterGain = audioCtx.createGain();
        masterGain.gain.value = 0;
        masterGain.connect(audioCtx.destination);

        startWinterBreeze();
        startProceduralBirds();
    } catch (e) {
        console.warn('Audio not available:', e);
    }
}

/**
 * Soft, gentle winter morning breeze blowing through trees and bamboo
 */
function startWinterBreeze() {
    if (!audioCtx) return;

    // Pink-like soothing noise buffer for wind
    const bufferSize = audioCtx.sampleRate * 3;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Simple 1-pole filter to make gentle pink/brown noise
        lastOut = (lastOut * 0.96) + (white * 0.04);
        data[i] = lastOut * 0.45;
    }

    breezeSource = audioCtx.createBufferSource();
    breezeSource.buffer = noiseBuffer;
    breezeSource.loop = true;

    // Lowpass filter for soft warm ambient wind
    const windFilter = audioCtx.createBiquadFilter();
    windFilter.type = 'lowpass';
    windFilter.frequency.value = 240;

    // Slow breath modulation for natural wind gusts
    const windLFO = audioCtx.createOscillator();
    windLFO.type = 'sine';
    windLFO.frequency.value = 0.15; // slow breathing cycle (6.6 seconds)
    const windLFOGain = audioCtx.createGain();
    windLFOGain.gain.value = 90;
    windLFO.connect(windLFOGain);
    windLFOGain.connect(windFilter.frequency);
    windLFO.start();

    const breezeGain = audioCtx.createGain();
    breezeGain.gain.value = 0.35;

    breezeSource.connect(windFilter);
    windFilter.connect(breezeGain);
    breezeGain.connect(masterGain);
    breezeSource.start();
}

/**
 * Authentic, intermittent Bengali village birds (চড়ুই / দোয়েল / পাখির মিষ্টি ডাক)
 * Discrete, realistic calls triggered periodically with natural silence in between.
 * NO continuous siren or ambulance-like frequency modulation!
 */
function startProceduralBirds() {
    if (!audioCtx) return;

    function playBirdChirp() {
        if (!soundEnabled || !audioCtx || audioCtx.state !== 'running') {
            scheduleNextChirp();
            return;
        }

        const now = audioCtx.currentTime;
        const pattern = Math.floor(Math.random() * 4);

        if (pattern === 0) {
            // Pattern 0: Quick two-note Sparrow "চিঁক... চিঁক"
            playSingleNote(now, 3200, 2600, 0.065, 0.12);
            playSingleNote(now + 0.12, 3400, 2700, 0.075, 0.14);
        } else if (pattern === 1) {
            // Pattern 1: High sweet morning Pip
            playSingleNote(now, 3600, 3100, 0.05, 0.10);
            playSingleNote(now + 0.09, 3800, 3200, 0.06, 0.12);
            playSingleNote(now + 0.22, 3500, 2900, 0.08, 0.15);
        } else if (pattern === 2) {
            // Pattern 2: Melodic Doel / Songbird sweet falling whistle
            playMelodicTrill(now, [2900, 3400, 3100, 2700], 0.06);
        } else {
            // Pattern 3: Soft distant single chirp
            playSingleNote(now, 2800, 2400, 0.08, 0.08);
        }

        scheduleNextChirp();
    }

    function scheduleNextChirp() {
        // Natural pause of 2.2 to 5.5 seconds between chirps
        const delay = 2200 + Math.random() * 3300;
        birdTimerId = setTimeout(playBirdChirp, delay);
    }

    scheduleNextChirp();
}

/**
 * Synthesizes a single organic bird note with swift exponential pitch decay
 */
function playSingleNote(startTime, startFreq, endFreq, duration, volume) {
    if (!audioCtx || !masterGain) return;

    const osc = audioCtx.createOscillator();
    const noteGain = audioCtx.createGain();

    osc.type = 'sine';
    // Frequency sweep
    osc.frequency.setValueAtTime(startFreq, startTime);
    osc.frequency.exponentialRampToValueAtTime(Math.max(100, endFreq), startTime + duration);

    // Amplitude envelope: instant soft attack, gentle bell decay
    noteGain.gain.setValueAtTime(0.0001, startTime);
    noteGain.gain.exponentialRampToValueAtTime(volume, startTime + 0.006);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(noteGain);
    noteGain.connect(masterGain);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.02);
}

/**
 * Synthesizes a connected melodic warble/trill
 */
function playMelodicTrill(startTime, freqs, noteDuration) {
    if (!audioCtx || !masterGain) return;

    freqs.forEach((f, idx) => {
        const t = startTime + idx * (noteDuration + 0.03);
        const osc = audioCtx.createOscillator();
        const g = audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, t);
        osc.frequency.exponentialRampToValueAtTime(f * 0.88, t + noteDuration);

        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.09, t + 0.005);
        g.gain.exponentialRampToValueAtTime(0.0001, t + noteDuration);

        osc.connect(g);
        g.connect(masterGain);

        osc.start(t);
        osc.stop(t + noteDuration + 0.02);
    });
}

function setAudioEnabled(enabled) {
    soundEnabled = enabled;
    if (enabled) {
        initAudio();
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        if (masterGain && audioCtx) {
            masterGain.gain.setTargetAtTime(0.65, audioCtx.currentTime, 0.4);
        }
    } else {
        if (masterGain && audioCtx) {
            masterGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.3);
        }
    }
}

// ─── Canvas Setup ────────────────────────────────────────────────────
function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';

    camera.resize(w * dpr, h * dpr);
}

// ─── Game Loop ───────────────────────────────────────────────────────
function gameLoop(timestamp) {
    requestAnimationFrame(gameLoop);

    if (lastTimestamp === 0) lastTimestamp = timestamp;
    let dt = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;

    if (dt > 0.1) dt = 0.016;

    if (!paused) {
        totalTime += dt;
        environment.update(dt, totalTime);
        characters.update(dt, totalTime);
    }

    // Clear
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply camera transform (maps virtual 1920×1080 to screen)
    camera.applyTransform(ctx);

    // Draw layers with correct cinematic depth
    environment.drawBackground(ctx);
    environment.drawRiver(ctx);
    environment.drawMidground(ctx);
    characters.draw(ctx);
    environment.drawForeground(ctx);
    environment.drawAtmosphere(ctx);

    // Reset transform
    camera.resetTransform(ctx);
}

// ─── UI Controls ─────────────────────────────────────────────────────
function setupControls() {
    const soundBtn = document.getElementById('sound-toggle');
    const pauseBtn = document.getElementById('pause-toggle');

    soundBtn.addEventListener('click', () => {
        const newState = !soundEnabled;
        setAudioEnabled(newState);
        soundBtn.querySelector('.icon').textContent = newState ? '🔊' : '🔇';
    });

    pauseBtn.addEventListener('click', () => {
        paused = !paused;
        pauseBtn.querySelector('.icon').textContent = paused ? '▶️' : '⏸';
        if (!paused) {
            lastTimestamp = 0;
        }
    });
}

// ─── Init ────────────────────────────────────────────────────────────
function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    canvas.addEventListener('contextmenu', e => e.preventDefault());

    setupControls();
    requestAnimationFrame(gameLoop);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
