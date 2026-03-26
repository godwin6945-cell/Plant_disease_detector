/* ============================================
   PoseAI Suite — Utility Functions
   ============================================ */

// Angle Calculation (Core Math)
function getAngle(A, B, C) {
    const BA = { x: A.x - B.x, y: A.y - B.y };
    const BC = { x: C.x - B.x, y: C.y - B.y };
    const dot = BA.x * BC.x + BA.y * BC.y;
    const mag = Math.sqrt((BA.x ** 2 + BA.y ** 2) * (BC.x ** 2 + BC.y ** 2));
    return Math.acos(Math.max(-1, Math.min(1, dot / mag))) * (180 / Math.PI);
}

// Distance between two points
function getDistance(A, B) {
    return Math.sqrt((A.x - B.x) ** 2 + (A.y - B.y) ** 2);
}

// Vector operations
function getVector(A, B) {
    return { x: B.x - A.x, y: B.y - A.y };
}

function getMagnitude(v) {
    return Math.sqrt(v.x ** 2 + v.y ** 2);
}

function normalize(v) {
    const mag = getMagnitude(v);
    return mag === 0 ? { x: 0, y: 0 } : { x: v.x / mag, y: v.y / mag };
}

// Midpoint
function getMidpoint(A, B) {
    return { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 };
}

// Check if point is within bounds
function isPointInBounds(point, width, height) {
    return point && point.x >= 0 && point.x <= width && point.y >= 0 && point.y <= height;
}

// Exponential Moving Average (smoothing)
function applyEMA(current, previous, alpha = 0.6) {
    if (!previous) return current;
    return current * alpha + previous * (1 - alpha);
}

// Clamp value
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

// Map value from one range to another
function map(value, inMin, inMax, outMin, outMax) {
    return outMin + (value - inMin) * (outMax - outMin) / (inMax - inMin);
}

// Interpolate between two values
function lerp(a, b, t) {
    return a + (b - a) * t;
}

// Get skeleton keypoint by position
const KEYPOINT_NAMES = [
    'nose', 'left_eye', 'right_eye', 'left_ear', 'right_ear',
    'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow',
    'left_wrist', 'right_wrist', 'left_hip', 'right_hip',
    'left_knee', 'right_knee', 'left_ankle', 'right_ankle'
];

const KEYPOINT_INDEX = {
    'nose': 0, 'left_eye': 1, 'right_eye': 2,
    'left_ear': 3, 'right_ear': 4,
    'left_shoulder': 5, 'right_shoulder': 6,
    'left_elbow': 7, 'right_elbow': 8,
    'left_wrist': 9, 'right_wrist': 10,
    'left_hip': 11, 'right_hip': 12,
    'left_knee': 13, 'right_knee': 14,
    'left_ankle': 15, 'right_ankle': 16
};

function getKeypointByName(pose, name) {
    const idx = KEYPOINT_INDEX[name];
    return pose && pose.keypoints && pose.keypoints[idx] ? pose.keypoints[idx] : null;
}

// Skeleton connections (for drawing)
const SKELETON_CONNECTIONS = [
    // Face
    ['left_eye', 'right_eye'],
    ['nose', 'left_eye'],
    ['nose', 'right_eye'],
    
    // Arms
    ['left_shoulder', 'left_elbow'],
    ['left_elbow', 'left_wrist'],
    ['right_shoulder', 'right_elbow'],
    ['right_elbow', 'right_wrist'],
    
    // Torso
    ['left_shoulder', 'right_shoulder'],
    ['left_shoulder', 'left_hip'],
    ['right_shoulder', 'right_hip'],
    ['left_hip', 'right_hip'],
    
    // Legs
    ['left_hip', 'left_knee'],
    ['left_knee', 'left_ankle'],
    ['right_hip', 'right_knee'],
    ['right_knee', 'right_ankle']
];

// Color mapping for skeleton parts
const SKELETON_COLORS = {
    'nose': [0, 255, 255],
    'left_eye': [0, 255, 255],
    'right_eye': [0, 255, 255],
    'left_ear': [0, 255, 255],
    'right_ear': [0, 255, 255],
    'left_shoulder': [255, 255, 0],
    'right_shoulder': [255, 255, 0],
    'left_elbow': [255, 0, 255],
    'right_elbow': [255, 165, 0],
    'left_wrist': [255, 0, 255],
    'right_wrist': [255, 165, 0],
    'left_hip': [255, 255, 0],
    'right_hip': [255, 255, 0],
    'left_knee': [255, 255, 0],
    'right_knee': [255, 0, 0],
    'left_ankle': [255, 255, 0],
    'right_ankle': [255, 0, 0]
};

// Determine body part color
function getPartColor(name, style = 'neon') {
    if (style === 'minimal') return [100, 200, 255];
    if (style === 'classic') return [100, 255, 100];
    
    const idx = KEYPOINT_INDEX[name];
    
    // Face - cyan
    if (idx <= 4) return [0, 255, 255];
    // Right arm - orange
    if ([6, 8, 10].includes(idx)) return [255, 165, 0];
    // Left arm - magenta
    if ([5, 7, 9].includes(idx)) return [255, 0, 255];
    // Torso - green
    if ([5, 6, 11, 12].includes(idx)) return [0, 255, 0];
    // Left leg - yellow
    if ([11, 13, 15].includes(idx)) return [255, 255, 0];
    // Right leg - red
    if ([12, 14, 16].includes(idx)) return [255, 0, 0];
    
    return [100, 200, 255]; // Default
}

// Drawing utilities
function drawKeypoints(canvas, poses, minConfidence = 0.3, style = 'neon') {
    const ctx = canvas.getContext('2d');
    poses.forEach(pose => {
        pose.keypoints.forEach((point, idx) => {
            if (point.score > minConfidence) {
                const color = getPartColor(KEYPOINT_NAMES[idx], style);
                ctx.fillStyle = `rgb(${color[0]},${color[1]},${color[2]})`;
                ctx.beginPath();
                ctx.arc(point.x, point.y, 5, 0, 6.283);
                ctx.fill();
            }
        });
    });
}

function drawSkeleton(canvas, poses, minConfidence = 0.3, style = 'neon') {
    const ctx = canvas.getContext('2d');
    poses.forEach(pose => {
        SKELETON_CONNECTIONS.forEach(([nameA, nameB]) => {
            const pointA = getKeypointByName(pose, nameA);
            const pointB = getKeypointByName(pose, nameB);
            if (pointA && pointB && pointA.score > minConfidence && pointB.score > minConfidence) {
                const color = getPartColor(nameA, style);
                ctx.strokeStyle = `rgba(${color[0]},${color[1]},${color[2]},0.9)`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(pointA.x, pointA.y);
                ctx.lineTo(pointB.x, pointB.y);
                ctx.stroke();
            }
        });
        drawKeypoints(canvas, poses, minConfidence, style);
    });
}

// Session data management
class SessionManager {
    constructor(moduleName) {
        this.moduleName = moduleName;
        this.sessionKey = `poseai_${moduleName}_session`;
        this.historyKey = `poseai_${moduleName}_history`;
    }

    startSession() {
        const session = {
            startTime: Date.now(),
            data: [],
            module: this.moduleName
        };
        localStorage.setItem(this.sessionKey, JSON.stringify(session));
        return session;
    }

    getCurrentSession() {
        const stored = localStorage.getItem(this.sessionKey);
        return stored ? JSON.parse(stored) : null;
    }

    addDataPoint(data) {
        const session = this.getCurrentSession();
        if (session) {
            session.data.push({
                timestamp: Date.now(),
                ...data
            });
            localStorage.setItem(this.sessionKey, JSON.stringify(session));
        }
    }

    endSession() {
        const session = this.getCurrentSession();
        if (session) {
            session.endTime = Date.now();
            session.duration = session.endTime - session.startTime;
            
            // Save to history
            const history = this.getHistory();
            history.push(session);
            // Keep last 30 sessions
            localStorage.setItem(this.historyKey, JSON.stringify(history.slice(-30)));
            
            // Clear current session
            localStorage.removeItem(this.sessionKey);
            
            return session;
        }
        return null;
    }

    getHistory() {
        const stored = localStorage.getItem(this.historyKey);
        return stored ? JSON.parse(stored) : [];
    }

    clearHistory() {
        localStorage.removeItem(this.historyKey);
    }
}

// Time formatting
function formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function formatSeconds(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Statistics
function getAverage(values) {
    return values.length > 0 ? values.reduce((a, b) => a + b) / values.length : 0;
}

function getMax(values) {
    return values.length > 0 ? Math.max(...values) : 0;
}

function getMin(values) {
    return values.length > 0 ? Math.min(...values) : 0;
}

// Smoothing filter (moving average)
class SmoothingFilter {
    constructor(windowSize = 5) {
        this.windowSize = windowSize;
        this.values = [];
    }

    addValue(value) {
        this.values.push(value);
        if (this.values.length > this.windowSize) {
            this.values.shift();
        }
    }

    getSmoothed() {
        return getAverage(this.values);
    }

    reset() {
        this.values = [];
    }
}

// Pose confidence checker
function isPoseDetected(pose, minConfidence = 0.3) {
    return pose && pose.keypoints && pose.keypoints.some(kp => kp.score > minConfidence);
}

function getConfidentKeypoints(pose, minConfidence = 0.3) {
    return pose && pose.keypoints ? pose.keypoints.filter(kp => kp.score > minConfidence) : [];
}

// Body position detection
function isStanding(pose) {
    const leftHip = getKeypointByName(pose, 'left_hip');
    const rightHip = getKeypointByName(pose, 'right_hip');
    const leftAnkle = getKeypointByName(pose, 'left_ankle');
    const rightAnkle = getKeypointByName(pose, 'right_ankle');
    
    if (!leftHip || !rightHip || !leftAnkle || !rightAnkle) return false;
    
    return leftHip.score > 0.3 && rightHip.score > 0.3 &&
           leftAnkle.score > 0.3 && rightAnkle.score > 0.3 &&
           Math.abs(leftHip.y - rightHip.y) < 100;
}

function isSitting(pose) {
    const leftHip = getKeypointByName(pose, 'left_hip');
    const leftKnee = getKeypointByName(pose, 'left_knee');
    
    if (!leftHip || !leftKnee) return false;
    
    return leftHip.score > 0.5 && leftKnee.score > 0.5 &&
           leftHip.y < leftKnee.y;
}

function isLyingDown(pose) {
    const nose = getKeypointByName(pose, 'nose');
    const leftShoulder = getKeypointByName(pose, 'left_shoulder');
    const rightHip = getKeypointByName(pose, 'right_hip');
    
    if (!nose || !leftShoulder || !rightHip) return false;
    
    const horizontalSpread = Math.abs(leftShoulder.x - rightHip.x);
    const verticalSpread = Math.abs(leftShoulder.y - rightHip.y);
    
    return horizontalSpread > verticalSpread * 2;
}

// Posture scoring helper
function calculatePostureScore(pose) {
    let score = 100;
    
    // Check key angles
    const leftShoulder = getKeypointByName(pose, 'left_shoulder');
    const rightShoulder = getKeypointByName(pose, 'right_shoulder');
    const leftHip = getKeypointByName(pose, 'left_hip');
    const nose = getKeypointByName(pose, 'nose');
    const leftEar = getKeypointByName(pose, 'left_ear');
    
    if (leftShoulder && rightShoulder) {
        const shoulderTilt = Math.abs(leftShoulder.y - rightShoulder.y);
        if (shoulderTilt > 30) score -= 15;
    }
    
    if (leftShoulder && leftHip && nose && leftEar) {
        const neckAngle = getAngle(leftShoulder, leftEar, nose);
        if (neckAngle > 100) score -= 20;
    }
    
    return Math.max(0, Math.min(100, score));
}

// Export utilities
window.Utils = {
    getAngle,
    getDistance,
    getVector,
    getMagnitude,
    normalize,
    getMidpoint,
    isPointInBounds,
    applyEMA,
    clamp,
    map,
    lerp,
    getKeypointByName,
    KEYPOINT_NAMES,
    KEYPOINT_INDEX,
    SKELETON_CONNECTIONS,
    getPartColor,
    drawKeypoints,
    drawSkeleton,
    SessionManager,
    formatTime,
    formatSeconds,
    getAverage,
    getMax,
    getMin,
    SmoothingFilter,
    isPoseDetected,
    getConfidentKeypoints,
    isStanding,
    isSitting,
    isLyingDown,
    calculatePostureScore
};
