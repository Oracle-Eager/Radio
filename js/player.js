import { el, iconPlay, iconPause } from './dom.js';
import { stations } from './stations.js';
import { setupAudioVisualizer } from './visualizer.js';
import { updateActiveStationUI, updatePlayingIndicator, updateStatus } from './ui.js';

let currentIndex = -1;
let isSwitching = false;

function trySourceOnce(url, timeoutMs = 15000) {
    return new Promise((resolve, reject) => {
        el.audio.pause(); el.audio.removeAttribute('src'); el.audio.load();
        const finalUrl = url + (url.includes('?') ? '&' : '?') + '_=' + Date.now();
        let settled = false;
        const tidy = () => { el.audio.removeEventListener('playing', onPlaying); el.audio.removeEventListener('error', onError); clearTimeout(timer); };
        const onPlaying = () => { if (!settled) { settled = true; tidy(); resolve(finalUrl); } };
        const onError = () => { if (!settled) { settled = true; tidy(); reject(new Error('Audio Error')); } };
        el.audio.addEventListener('playing', onPlaying); el.audio.addEventListener('error', onError);
        el.audio.src = finalUrl;
        const playPromise = el.audio.play();
        if (playPromise !== undefined) { playPromise.catch(err => { if (!settled && err.name === "NotAllowedError") { settled = true; tidy(); reject(new Error('Autoplay Blocked')); } }); }
        const timer = setTimeout(() => { if (!settled) { settled = true; tidy(); reject(new Error('Timeout')); } }, timeoutMs);
    });
}

export async function selectStation(index) {
    if (index === currentIndex && !el.audio.paused) return;
    setupAudioVisualizer();
    isSwitching = true;
    updatePlayingIndicator(false);
    currentIndex = index;
    const station = stations[index];
    updateActiveStationUI(currentIndex);
    updateStatus('Connecting...');
    el.stationName.textContent = station.name;
    el.playPauseBtn.innerHTML = iconPause;
    let connected = false;
    for (const source of station.sources) { try { await trySourceOnce(source); connected = true; break; } catch (err) { console.error(`Source failed for ${station.name}: ${err.message}`); } }
    if (!connected) {
        updateStatus('Station Unavailable');
        el.playPauseBtn.innerHTML = iconPlay;
        el.audio.removeAttribute('src');
        el.albumArtWrapper.classList.add('shake-error');
        setTimeout(() => el.albumArtWrapper.classList.remove('shake-error'), 600);
    }
    isSwitching = false;
}

export async function handlePlayPauseClick() {
    if (currentIndex === -1) {
        selectStation(0);
        return;
    }
    setupAudioVisualizer();
    if (el.audio.paused) {
        if (el.audio.src) {
            try {
                await el.audio.play();
            } catch (e) {
                updateStatus('Play Blocked');
            }
        } else {
            await selectStation(currentIndex);
        }
    } else {
        el.audio.pause();
    }
}

export function handleNextClick() {
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % stations.length;
    selectStation(nextIndex);
}

export function handlePrevClick() {
    const prevIndex = currentIndex <= 0 ? stations.length - 1 : currentIndex - 1;
    selectStation(prevIndex);
}

export function setupAudioEventListeners() {
    el.audio.addEventListener('playing', () => {
        el.playPauseBtn.innerHTML = iconPause;
        updateStatus('Playing');
        updatePlayingIndicator(true, currentIndex);
    });

    el.audio.addEventListener('pause', () => {
        el.playPauseBtn.innerHTML = iconPlay;
        if (!isSwitching && currentIndex !== -1) {
            updateStatus('Paused');
        }
        updatePlayingIndicator(false, currentIndex);
    });

    el.audio.addEventListener('waiting', () => {
        if (!isSwitching) updateStatus('Buffering...');
        updatePlayingIndicator(false, currentIndex);
    });
}

export function getCurrentIndex() {
    return currentIndex;
}

export function isAudioSwitching() {
    return isSwitching;
}
