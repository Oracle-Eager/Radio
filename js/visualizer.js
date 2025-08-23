import { el } from './dom.js';

let audioVisualizerInitialized = false;

export function setupAudioVisualizer() {
    if (audioVisualizerInitialized) return;
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioCtx.createMediaElementSource(el.audio);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);

    const numPoints = 5; // Fewer points for a broader, more rolling wave
    let smoothedPoints = new Array(numPoints).fill(0);
    const smoothingFactor = 0.12; // Finely tuned smoothing

    function draw() {
        requestAnimationFrame(draw);
        const svgHeight = el.visualizerSvg.clientHeight;
        const svgWidth = el.visualizerSvg.clientWidth;

        analyser.getByteFrequencyData(dataArray);

        const pointWidth = Math.floor(bufferLength / numPoints);
        let points = [];

        for (let i = 0; i < numPoints; i++) {
            let sum = 0;
            for (let j = 0; j < pointWidth; j++) {
                sum += dataArray[i * pointWidth + j];
            }
            const average = sum / pointWidth;
            const normalized = average / 255;
            smoothedPoints[i] += (normalized - smoothedPoints[i]) * smoothingFactor;
            points.push(smoothedPoints[i]);
        }

        // When paused, gently animate the points back to zero
        if (el.audio.paused) {
            points = points.map((p, i) => {
                smoothedPoints[i] += (0 - smoothedPoints[i]) * 0.1;
                return smoothedPoints[i];
            });
        }

        // --- Build the SVG path string with smooth quadratic Bézier curves ---
        let pathD = `M -2,${svgHeight}`; // Start off-screen left

        // The first point is the control point for the first curve
        let controlX = 0;
        let controlY = svgHeight - points[0] * svgHeight * 0.9;
        pathD += ` Q ${controlX},${controlY}`;

        // Calculate midpoints and create curves
        for (let i = 0; i < numPoints - 1; i++) {
            const p1_x = (svgWidth / (numPoints - 1)) * i;
            const p1_y = svgHeight - points[i] * svgHeight * 0.9;
            const p2_x = (svgWidth / (numPoints - 1)) * (i + 1);
            const p2_y = svgHeight - points[i+1] * svgHeight * 0.9;

            const midX = (p1_x + p2_x) / 2;
            const midY = (p1_y + p2_y) / 2;

            pathD += ` ${midX},${midY}`; // The end point of the curve is the midpoint
            pathD += ` T ${p2_x},${p2_y}`; // Smoothly continue to the next actual point
        }

        pathD += ` L ${svgWidth + 2},${svgHeight}`; // End off-screen right
        pathD += ` Z`;

        el.wavePath.setAttribute('d', pathD);
    }
    draw();
    audioVisualizerInitialized = true;
}
