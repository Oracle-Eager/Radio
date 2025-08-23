import { el } from './dom.js';
import { stations } from './stations.js';
import { selectStation, getCurrentIndex } from './player.js';

export function handleIntro() {
    const splashScreen = document.getElementById('splash-screen');
    const player = document.getElementById('macro-player');
    setTimeout(() => {
        splashScreen.classList.add('hidden');
        player.classList.remove('opacity-0');
        setTimeout(() => player.classList.add('loaded'), 50);
    }, 3800);
}

export function generatePlaylist() {
    stations.forEach((station, index) => {
        const item = document.createElement('div');
        item.className = 'station-item p-5 text-slate-300 cursor-pointer transition-all duration-300 hover:bg-white/5 border-b border-white/10 border-l-4 border-transparent flex justify-between items-center';
        item.dataset.index = index;
        item.innerHTML = `<span class="text-lg font-medium">${station.name}</span><div class="playing-indicator"><span></span><span></span><span></span></div>`;
        item.addEventListener('click', () => { selectStation(index); closePanel(); });
        el.playlistContainer.insertBefore(item, el.noResultsMessage);
    });
}

export function updateActiveStationUI(currentIndex) {
    document.querySelectorAll('.station-item').forEach((item, index) => {
        const isActive = index === currentIndex;
        item.classList.toggle('text-white', isActive);
        item.classList.toggle('font-bold', isActive);
        item.classList.toggle('bg-white/10', isActive);
        item.classList.toggle('border-blue-500', isActive);
    });
}

export function updatePlayingIndicator(isPlaying, currentIndex) {
    document.querySelectorAll('.station-item').forEach((item, index) => {
        const isActiveAndPlaying = index === currentIndex && isPlaying;
        item.classList.toggle('is-playing', isActiveAndPlaying);
        item.classList.toggle('bg-blue-500/10', isActiveAndPlaying);
    });
}

export function updateStatus(text) {
    el.playbackStatus.textContent = text;
}

export function openPanel() {
    el.stationsPanel.classList.remove('invisible');
    el.openPanelBtn.classList.add('panel-open');
    requestAnimationFrame(() => {
        el.stationsPanel.style.opacity = '1';
        el.panelContent.classList.remove('translate-y-full');
    });
}

export function closePanel() {
    el.panelContent.classList.add('translate-y-full');
    el.stationsPanel.style.opacity = '0';
    el.openPanelBtn.classList.remove('panel-open');
}

export function handleSearch() {
    const query = el.searchInput.value.toLowerCase().trim();
    const stationItems = document.querySelectorAll('.station-item');
    let visibleCount = 0;
    stationItems.forEach(item => {
        const stationName = item.querySelector('span').textContent.toLowerCase();
        const isVisible = stationName.includes(query);
        item.style.display = isVisible ? '' : 'none';
        if (isVisible) visibleCount++;
    });
    el.noResultsMessage.style.display = visibleCount === 0 ? 'block' : 'none';
}

export function setupProtection() {
    el.imageProtectionOverlay.addEventListener('contextmenu', e => e.preventDefault());
    el.imageProtectionOverlay.addEventListener('dragstart', e => e.preventDefault());
}

export function setupUIEventListeners() {
    el.openPanelBtn.addEventListener('click', openPanel);
    el.closePanelBtn.addEventListener('click', closePanel);
    el.stationsPanel.addEventListener('click', (e) => {
        if (e.target === el.stationsPanel) closePanel();
    });
    el.searchInput.addEventListener('input', handleSearch);

    el.stationsPanel.addEventListener('transitionend', (e) => {
        if (e.propertyName === 'opacity' && getComputedStyle(el.stationsPanel).opacity === '0') {
            el.stationsPanel.classList.add('invisible');
        }
    });
}
