import { el } from './dom.js';

const SLIDE_DURATION = 15000;
const CHUNK_SIZE = 30;
const FETCH_THRESHOLD = 5;
let imageList = [], currentImageIndex = 0, picsumPage = 1, isLoadingImages = false, imageInterval;
let activeImage = el.albumArt1;
let inactiveImage = el.albumArt2;

async function fetchImageChunk(page, limit) {
    try {
        const response = await fetch(`https://picsum.photos/v2/list?page=${page}&limit=${limit}`);
        if (!response.ok) throw new Error(`API failed: ${response.status}`);
        const data = await response.json();
        return data.map(p => `https://picsum.photos/id/${p.id}/800/800`);
    } catch (err) {
        console.warn("Picsum fetch failed:", err.message);
        return [];
    }
}

async function loadMoreImages() {
    if (isLoadingImages) return;
    isLoadingImages = true;
    let newImages = await fetchImageChunk(picsumPage, CHUNK_SIZE);
    if (picsumPage === 1 && newImages.length > 10) {
        newImages = newImages.slice(10);
    }
    if (newImages.length > 0) {
        imageList.push(...newImages);
        picsumPage++;
    }
    isLoadingImages = false;
}

function switchImage(newImageUrl) {
    inactiveImage.src = newImageUrl;
    inactiveImage.onload = () => {
        activeImage.classList.remove('visible');
        inactiveImage.classList.add('visible');
        [activeImage, inactiveImage] = [inactiveImage, activeImage];
    };
}

function cycleAndPreloadNextImage() {
    if (imageList.length < 2) return;
    if (imageList.length - currentImageIndex <= FETCH_THRESHOLD) loadMoreImages();
    currentImageIndex = (currentImageIndex + 1) % imageList.length;
    const nextImageUrl = imageList[currentImageIndex];
    const preloader = new Image();
    preloader.src = nextImageUrl;
    preloader.onload = () => switchImage(nextImageUrl);
    preloader.onerror = () => {
        console.warn(`Skipping broken image: ${nextImageUrl}`);
        const badIndex = imageList.indexOf(nextImageUrl);
        if (badIndex > -1) {
            imageList.splice(badIndex, 1);
            if (badIndex <= currentImageIndex) currentImageIndex--;
        }
    };
}

function startImageSlider() {
    if (imageInterval) clearInterval(imageInterval);
    if (imageList.length > 1) {
        imageInterval = setInterval(cycleAndPreloadNextImage, SLIDE_DURATION);
    }
}

export async function initImageSlider() {
    await loadMoreImages();
    if (imageList.length > 0) {
        el.albumArt1.classList.add('visible');
        startImageSlider();
    } else {
        el.albumArt1.classList.add('visible');
    }
}
