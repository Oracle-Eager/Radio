export const el = {
    audio: document.getElementById('audio-player'),
    playPauseBtn: document.getElementById('play-pause-btn'),
    prevBtn: document.getElementById('prev-btn'),
    nextBtn: document.getElementById('next-btn'),
    playlistContainer: document.getElementById('playlist'),
    stationName: document.getElementById('station-name'),
    playbackStatus: document.getElementById('playback-status'),
    openPanelBtn: document.getElementById('open-panel-btn'),
    closePanelBtn: document.getElementById('close-panel-btn'),
    stationsPanel: document.getElementById('stations-panel'),
    panelContent: document.getElementById('panel-content'),
    albumArt1: document.getElementById('album-art-1'),
    albumArt2: document.getElementById('album-art-2'),
    albumArtWrapper: document.querySelector('.album-art-container-wrapper'),
    imageProtectionOverlay: document.getElementById('image-protection-overlay'),
    searchInput: document.getElementById('station-search'),
    noResultsMessage: document.getElementById('no-results-message'),
    wavePath: document.getElementById('wave-path'),
    visualizerSvg: document.getElementById('audio-visualizer-svg'),
};

export const iconPlay = `<i class="fa-solid fa-play fa-2x ml-1 text-slate-900"></i>`;
export const iconPause = `<i class="fa-solid fa-pause fa-2x text-slate-900"></i>`;
