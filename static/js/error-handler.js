/* Error Fixes and Safety Checks */
'use strict';

// Global error handler
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
    if (e.error && e.error.message) {
        if (e.error.message.includes('Tone')) {
            console.warn('Tone.js error - music may not play');
        }
    }
});

// Ensure Utils exists
if (typeof Utils === 'undefined') {
    window.Utils = {
        KEYPOINT_NAMES: ['nose','left_eye','right_eye','left_ear','right_ear','left_shoulder','right_shoulder','left_elbow','right_elbow','left_wrist','right_wrist','left_hip','right_hip','left_knee','right_knee','left_ankle','right_ankle'],
        KEYPOINT_INDEX: {},
        SKELETON_CONNECTIONS: [
            ['left_shoulder','right_shoulder'],['left_shoulder','left_elbow'],['left_elbow','left_wrist'],
            ['right_shoulder','right_elbow'],['right_elbow','right_wrist'],['left_shoulder','left_hip'],
            ['right_shoulder','right_hip'],['left_hip','right_hip'],['left_hip','left_knee'],
            ['left_knee','left_ankle'],['right_hip','right_knee'],['right_knee','right_ankle']
        ],
        getKeypointByName: (pose, name) => {
            if (!pose || !pose.keypoints) return null;
            return pose.keypoints.find(kp => kp.name === name);
        },
        getMidpoint: (p1, p2) => {
            if (!p1 || !p2) return null;
            return { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
        },
        getAngle: (p1, p2, p3) => {
            if (!p1 || !p2 || !p3) return null;
            const a = Math.atan2(p3.y - p2.y, p3.x - p2.x);
            const b = Math.atan2(p1.y - p2.y, p1.x - p2.x);
            let angle = Math.abs(a - b) * (180 / Math.PI);
            if (angle > 180) angle = 360 - angle;
            return angle;
        },
        getDistance: (p1, p2) => {
            if (!p1 || !p2) return 0;
            return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
        },
        getAverage: (arr) => {
            if (!arr || !arr.length) return 0;
            return arr.reduce((a, b) => a + b, 0) / arr.length;
        },
        formatTime: (ms) => {
            const s = Math.floor(ms / 1000);
            const m = Math.floor(s / 60);
            return `${m}:${(s % 60).toString().padStart(2, '0')}`;
        },
        getPartColor: (name, style) => {
            const colors = {
                neon: [0, 212, 255],
                classic: [255, 255, 255],
                minimal: [100, 100, 100]
            };
            return colors[style] || colors.neon;
        },
        SmoothingFilter: class {
            constructor(size) {
                this.size = size;
                this.values = [];
            }
            addValue(v) {
                this.values.push(v);
                if (this.values.length > this.size) this.values.shift();
            }
            getSmoothed() {
                if (!this.values.length) return 0;
                return this.values.reduce((a, b) => a + b, 0) / this.values.length;
            }
        }
    };
    
    // Build index
    Utils.KEYPOINT_NAMES.forEach((name, i) => {
        Utils.KEYPOINT_INDEX[name] = i;
    });
}

// Ensure showToast exists
if (typeof window.showToast === 'undefined') {
    window.showToast = (msg, duration = 3000) => {
        console.log('Toast:', msg);
        const toast = document.getElementById('errorToast');
        if (toast) {
            toast.textContent = msg;
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), duration);
        }
    };
}

// Safe Tone.js initialization
if (typeof Tone !== 'undefined') {
    try {
        // Don't set read-only properties
        console.log('Tone.js ready');
    } catch (e) {
        console.warn('Tone.js initialization warning:', e);
    }
} else {
    console.warn('Tone.js not loaded - music will not play');
    window.hymnPlayer = {
        play: () => false,
        stop: () => {},
        pause: () => {},
        resume: () => {},
        getSongList: () => []
    };
}

// Safe mobile webcam fallback
if (typeof window.mobileWebcam === 'undefined') {
    window.mobileWebcam = {
        init: () => {},
        connect: () => Promise.resolve(false),
        disconnect: () => {},
        getStatus: () => ({ connected: false, url: null })
    };
}

// Ensure poseEngine exists
if (typeof window.poseEngine === 'undefined') {
    console.error('PoseEngine not loaded!');
}

// Ensure ModuleManager exists
if (typeof window.ModuleManager === 'undefined') {
    console.error('ModuleManager not loaded!');
}

// Check MediaPipe
if (typeof Pose === 'undefined') {
    console.error('MediaPipe Pose not loaded!');
    window.showToast('MediaPipe Pose failed to load. Check internet connection.', 5000);
}

// Canvas safety check
document.addEventListener('DOMContentLoaded', () => {
    const canvases = ['canvas', 'postureCanvas', 'fitnessCanvas', 'safetyCanvas', 'sportsCanvas', 'gamesCanvas'];
    canvases.forEach(id => {
        const c = document.getElementById(id);
        if (c) {
            const ctx = c.getContext('2d');
            if (!ctx) {
                console.error(`Failed to get 2D context for ${id}`);
            }
        }
    });
});

// Prevent context menu on canvas
document.addEventListener('contextmenu', (e) => {
    if (e.target.tagName === 'CANVAS') {
        e.preventDefault();
    }
});

// Auto-start Tone.js on user interaction
let toneStarted = false;
document.addEventListener('click', async () => {
    if (!toneStarted && typeof Tone !== 'undefined') {
        try {
            await Tone.start();
            toneStarted = true;
            console.log('Tone.js audio context started');
        } catch (e) {
            console.warn('Failed to start Tone.js:', e);
        }
    }
}, { once: true });

// Check all modules loaded
setTimeout(() => {
    const modules = ['postureModule', 'fitnessModule', 'safetyModule', 'sportsModule', 'gamesModule'];
    modules.forEach(mod => {
        if (typeof window[mod] === 'undefined') {
            console.error(`${mod} not loaded!`);
        }
    });
}, 2000);

console.log('Error fixes and safety checks loaded');
