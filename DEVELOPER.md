# 🔧 Developer Documentation — Architecture & Extension Guide

For developers who want to customize or extend PoseAI Suite.

---

## 📐 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│              Browser (Client-Side)                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐      ┌────────────────┐             │
│  │   index.html │      │   style.css    │             │
│  │  (7000 lines)│      │  (2000 lines)  │             │
│  └──────────────┘      └────────────────┘             │
│         ↓                                               │
│  ┌──────────────────────────────────────┐             │
│  │  pose_engine.js                      │             │
│  │  • TensorFlow.js 4.x setup           │             │
│  │  • MoveNet inference loop (24-30 FPS)│             │
│  │  • Canvas skeleton rendering         │             │
│  └──────────────────────────────────────┘             │
│         ↓                                               │
│  ┌──────────────────────────────────────┐             │
│  │  utils.js                            │             │
│  │  • 50+ math/geometry functions       │             │
│  │  • EMA smoothing (α=0.6)             │             │
│  │  • LocalStorage management           │             │
│  └──────────────────────────────────────┘             │
│         ↓                                               │
│  ┌──────────────────────────────────────────────┐     │
│  │  Module Manager (in index.html)              │     │
│  │  • Coordinates pose updates                  │     │
│  │  • Routes skeleton to active module          │     │
│  │  • Manages UI state                          │     │
│  └──────────────────────────────────────────────┘     │
│         ↓                                               │
│  ┌──────────────────────────────────────────────┐     │
│  │  5 Module Instances                          │     │
│  │  ├─ postureModule (posture.js)              │     │
│  │  ├─ fitnessModule (fitness.js)              │     │
│  │  ├─ safetyModule (safety.js)                │     │
│  │  ├─ sportsModule (sports.js)                │     │
│  │  └─ gamesModule (games.js)                  │     │
│  └──────────────────────────────────────────────┘     │
│                                                         │
└─────────────────────────────────────────────────────────┘
                        ↓↑ (WebSocket/HTTPS)
┌─────────────────────────────────────────────────────────┐
│              Flask Backend (Server)                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────┐      │
│  │  app.py                                     │      │
│  │  • Flask server on port 5000                │      │
│  │  • 7 REST API endpoints                     │      │
│  │  • Session data management                  │      │
│  │  • SocketIO for real-time comms             │      │
│  └─────────────────────────────────────────────┘      │
│         ↓                                               │
│  ┌─────────────────────────────────────────────┐      │
│  │  data/sessions.json                         │      │
│  │  • Last 100 sessions (auto-rotating)        │      │
│  │  • Per-module metrics                       │      │
│  │  • Timestamps for trending                  │      │
│  └─────────────────────────────────────────────┘      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🧮 Core Data Flow

### Real-Time Pose Detection Loop

```
Every 33ms (30 FPS):
│
├─ 1. Capture video frame from #webcam
│     (canvas.drawImage + optional mirror)
│
├─ 2. Send to TensorFlow.js
│     (192x192 input → MoveNet Lightning)
│
├─ 3. Get 17 keypoints + confidence scores
│     {x, y, score} for each joint
│
├─ 4. Filter by confidence (default 0.3)
│     Remove low-confidence keypoints
│
├─ 5. Apply EMA smoothing
│     currentValue = 0.6 * newValue + 0.4 * prevValue
│
├─ 6. Analyze pose (module-specific)
│     Calculate angles, distances, movements
│
├─ 7. Draw skeleton on canvas
│     17 dots + 14 connections (RGB color-coded)
│
├─ 8. Broadcast to active module
│     Module receives analyzed pose object
│
├─ 9. Module updates state + UI
│     Update score, rep count, suggestions, etc.
│
└─ 10. Auto-save to localStorage
      Every 30 seconds or on session end
```

### Example Pose Object (After Analysis)

```javascript
{
  // Raw keypoints (17 total)
  keypoints: [
    { name: 'nose', x: 320, y: 180, score: 0.98 },
    { name: 'left_shoulder', x: 280, y: 220, score: 0.97 },
    { name: 'right_shoulder', x: 360, y: 225, score: 0.96 },
    // ... 14 more
  ],
  
  // Module-specific analysis
  module_data: {
    // PosturePro
    neckAngle: 92,
    spineAngle: 85,
    shoulderTilt: 8,
    postureScore: 88,
    
    // FitAI
    exerciseType: 'squat',
    jointAngles: { left_knee: 85, right_knee: 88 },
    repDetected: true,
    formScore: 92,
    
    // SafetyAI
    fallDetected: false,
    dangerousBend: false,
    riskLevel: 'low',
    
    // SportsVision
    jumpApex: true,
    jumpHeightCm: 45,
    
    // PosePlay
    distance_to_target: 15 // pixels
  },
  
  // Metadata
  timestamp: Date.now(),
  confidence: 0.96, // Average keypoint confidence
  fpsCounter: 28
}
```

---

## 📦 File Structure & Dependencies

### index.html Dependencies

```html
<!-- External CDN Libraries -->
<script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.18.0"></script>
<script src="https://cdn.jsdelivr.net/npm/@tensorflow-models/moveNet@2.2.0"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js"></script>

<!-- Internal Scripts (Loaded in Order) -->
<script src="/static/js/utils.js"></script>          <!-- 1. Utilities first
<script src="/static/js/pose_engine.js"></script>    <!-- 2. Core pose detection
<script src="/static/js/modules/posture.js"></script>  <!-- 3. Modules depend on above
<script src="/static/js/modules/fitness.js"></script>
<script src="/static/js/modules/safety.js"></script>
<script src="/static/js/modules/sports.js"></script>
<script src="/static/js/modules/games.js"></script>
```

**Load Order Critical:** Must be bottom-to-top as listed!

---

## 🔌 Module Architecture

Every module follows this pattern:

```javascript
const [moduleType]Module = {
  // State
  isActive: false,
  sessionData: {},
  
  // Initialization
  init() {
    // Setup DOM listeners, initialize state
  },
  
  // Core function - called 30x per second
  onPoseDetected(analyzedPose) {
    // Update metrics based on pose
    // Update UI
    // Save to localStorage
  },
  
  // UI Methods
  startSession() { },
  stopSession() { },
  reset() { },
  showReport() { },
  
  // Data Methods
  save() { /* to localStorage */ },
  load() { /* from localStorage */ }
};
```

### Example: Adding a New Module

**Step 1: Create `/static/js/modules/meditation.js`**

```javascript
const meditationModule = {
  isActive: false,
  sessionData: {
    sessionTime: 0,
    breaths: 0,
    calmScore: 0
  },
  
  init() {
    // Setup meditation UI
    document.getElementById('meditation-btn').addEventListener('click', () => {
      this.startSession();
    });
  },
  
  onPoseDetected(pose) {
    if (!this.isActive) return;
    
    // Analyze stillness
    const stillnessScore = this.analyzeStillness(pose);
    const breathingRate = this.analyzeBreathing(pose);
    
    // Update UI
    document.getElementById('stillness-score').textContent = stillnessScore;
    
    // Calculate "calm" = stillness + regular breathing
    this.sessionData.calmScore = (stillnessScore * 0.6) + (breathingRate * 0.4);
  },
  
  analyzeStillness(pose) {
    // Calculate how still body is (0-100)
    // Lower keypoint movement = higher stillness
    return 85; // Placeholder
  },
  
  analyzeBreathing(pose) {
    // Detect breathing rate from chest keypoints
    // Target: 4-6 breaths per minute (calm)
    return 75; // Placeholder
  },
  
  startSession() {
    this.isActive = true;
    this.sessionData.sessionTime = Date.now();
  },
  
  stopSession() {
    this.isActive = false;
    this.showReport();
  },
  
  showReport() {
    alert(`Calm Score: ${this.sessionData.calmScore}/100`);
  },
  
  save() {
    localStorage.setItem('meditation_session', JSON.stringify(this.sessionData));
  }
};

// Initialize when document loads
document.addEventListener('DOMContentLoaded', () => {
  meditationModule.init();
});
```

**Step 2: Add to index.html**

```html
<!-- Add script tag before </body> -->
<script src="/static/js/modules/meditation.js"></script>

<!-- Add navigation tab -->
<button class="nav-btn" onclick="switchModule('meditation')">
  🧘 Meditation
</button>

<!-- Add module container -->
<section class="module-view" id="meditation-module">
  <canvas id="meditation-canvas"></canvas>
  <div class="meditation-right">
    <div class="calm-score">Calm Score: <span id="calm-score">--</span>%</div>
    <button id="meditation-btn">▶ Start</button>
  </div>
</section>
```

**Step 3: Add CSS styling**

```css
#meditation-module .meditation-right {
  background: rgba(100, 150, 255, 0.1);
  padding: 20px;
  border-radius: 12px;
}

#calm-score {
  font-size: 2em;
  color: #00ff88;
  font-weight: bold;
}
```

---

## 📊 localStorage Schema

Each module stores data in localStorage:

```javascript
// PosturePro
{
  'poseai_posture_session': {
    sessionTime: 1711270200000,
    goodPosturePercent: 82,
    averageScore: 84,
    alertCount: 3,
    savedAt: "2024-03-24T10:30:00Z"
  },
  'poseai_posture_history': [
    // Array of last 20 sessions
  ]
}

// FitAI
{
  'poseai_fitness_session': {
    exerciseType: 'squat',
    totalReps: 15,
    perfectReps: 12,
    duration: 420000, // ms
    savedAt: "2024-03-24T10:30:00Z"
  },
  'poseai_fitness_history': [ /* last 20 */ ]
}

// SafetyAI
{
  'safetyIncidents': [
    {
      type: 'FALL_DETECTED',
      description: 'Person fell near machinery',
      timestamp: 1711270200000,
      riskScore: 95
    },
    // ... last 100 incidents
  ]
}

// SportsVision
{
  'sportsVision_pr_jump': 52, // cm
  'sportsVision_pr_reaction': 210, // ms
  'sportsVision_jump_history': [ /* last 20 scores */ ]
}

// PosePlay
{
  'poseplay_scores_painter': [850, 620, 480, ...],
  'poseplay_scores_theremin': [180, 165, 140, ...],
  'poseplay_scores_reaction': [850, 750, 620, ...]
}
```

---

## 🎯 Key Functions Reference

### utils.js

```javascript
// Angle calculations
getAngle(pointA, pointB, pointC)        // Angle ABC
getDistance(pointA, pointB)              // Euclidean distance
getMidpoint(pointA, pointB)              // Linear midpoint

// Smoothing
applyEMA(current, previous, alpha)      // Exponential Moving Average
SmoothingFilter(windowSize)             // Moving average

// Keypoint access
getKeypointByName(pose, 'nose')         // Get by name, not index
getPoseConnections()                    // All skeleton connections

// Body position
isStanding(pose)                        // Hip > knee height?
isSitting(pose)                         // Knee < hip height?
isLyingDown(pose)                       // All low points?

// Session
SessionManager.save(key, data)          // localStorage helper
SessionManager.load(key)                // localStorage retriever

// Colors
getSkeletonColor(bodyPart)              // RGB for drawing
```

### pose_engine.js

```javascript
PoseEngine.init()                       // Load TF.js + MoveNet
PoseEngine.estimatePose(video)          // Run inference
PoseEngine.analyzePosture(pose)         // {neckAngle, spineAngle, score}
PoseEngine.analyzeExercise(pose, type)  // Route to exercise analyzer
PoseEngine.analyzeSafety(pose)          // {fallDetected, riskScore}
PoseEngine.detectJump(pose)             // {inAir, heightCm}
PoseEngine.drawSkeleton(canvas, poses)  // Render on canvas
```

---

## 🎓 Common Customizations

### 1. Change Color Scheme

**In style.css:**

```css
:root {
  --primary-blue: #00d4ff;      /* Change this */
  --success-green: #00ff88;     /* And this */
  --warning-orange: #ff6b35;    /* And this */
  --danger-red: #ff3366;        /* And this */
}
```

### 2. Adjust Pose Detection Sensitivity

**In .env:**

```
MIN_CONFIDENCE=0.3     # Lower = more sensitive (0.1-0.5 range)
INPUT_SIZE=192         # Keep at 192 for MoveNet Lightning
```

### 3. Add New Exercise

**In fitness.js:**

```javascript
analyzeDeadlift(pose) {
  const hipY = getKeypointByName(pose, 'left_hip').y;
  const kneeY = getKeypointByName(pose, 'left_knee').y;
  const ankleY = getKeypointByName(pose, 'left_ankle').y;
  
  const isDown = hipY < kneeY;  // Hip lower than knee = down
  const isUp = hipY > ankleY;   // Hip higher than ankle = up
  
  // State machine for rep counting
  if (isDown && !this.was_down) {
    this.was_down = true;
  }
  if (isUp && this.was_down) {
    this.repCount++;
    this.was_down = false;
  }
  
  return { repDetected: !this.was_down, formScore: 85 };
}
```

### 4. Implement Leaderboard

**In app.py:**

```python
@app.route('/api/leaderboard', methods=['GET'])
def get_leaderboard():
    game = request.args.get('game', 'all')
    
    # Load all scores from sessions
    scores = []
    for session in load_sessions():
        if session['module'] == game or game == 'all':
            scores.append({
                'score': session['score'],
                'module': session['module'],
                'date': session['saved_at']
            })
    
    # Sort desc, return top 20
    return jsonify(sorted(scores, key=lambda x: x['score'], reverse=True)[:20])
```

### 5. Add Real-Time Notifications

**In any module:**

```javascript
function notify(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  // Auto-dismiss after 3 seconds
  setTimeout(() => toast.remove(), 3000);
}

// Usage
notify('Great posture!', 'success');
notify('Knee angle too high', 'warning');
notify('Fall detected!', 'danger');
```

---

## 🔍 Debugging Tips

### Enable Debug Mode

Press **D** key or in Settings enable "Debug Mode"

Shows real-time:
- Joint angles overlay
- FPS counter
- Inference time
- Confidence scores
- Keypoint indices

### Console Logging

All modules use emoji prefixes:

```javascript
console.log('✅ Posture good');     // Success
console.log('⚠️ Warning detected');  // Warning
console.log('❌ Error in analysis');  // Error
console.log('🔄 Initializing...');    // Process
```

### Inspect localStorage

```javascript
// In browser console
localStorage.getItem('poseai_posture_session')
Object.keys(localStorage)
localStorage.clear() // CAREFUL!
```

### Network Requests

In DevTools → Network tab:
- WebSocket messages every frame (pose updates)
- HTTP POST to `/api/save_session` every 30 sec

---

## 🚀 Performance Optimization Tips

### 1. Reduce Input Size (If Slow)

```javascript
// In pose_engine.js
INPUT_SIZE = 160;  // Instead of 192 (20% faster)
// Trade-off: Slightly less accurate
```

### 2. Lower FPS Target

```javascript
// In index.html main loop
let frameCount = 0;
function mainLoop() {
  frameCount++;
  if (frameCount % 2 === 0) {  // Run analysis every 2 frames = 15 FPS
    PoseEngine.estimatePose(video);
  }
  requestAnimationFrame(mainLoop);
}
```

### 3. Throttle Module Updates

```javascript
// In any module
let lastUpdate = 0;
const UPDATE_INTERVAL = 100; // ms

onPoseDetected(pose) {
  const now = Date.now();
  if (now - lastUpdate < UPDATE_INTERVAL) return;
  
  // Do heavy computation here
  lastUpdate = now;
}
```

### 4. Profile with Chrome DevTools

- Open DevTools (F12)
- Performance tab → Record
- Do action (e.g., start posture session)
- Stop recording
- Check flame chart for bottlenecks

---

## 🔐 Security Notes

**Data Privacy:**
- All pose data stays on device (no server processing)
- Sessions saved locally first, then to Flask backend
- No video uploaded (only pose keypoints)

**CORS:**
- Allow localhost only (production restrict domain)
- WebSocket upgrade requests handled by Flask-SocketIO

**Input Validation:**
- Module data validated before localStorage save
- API endpoints validate JSON input

---

## 📈 Scaling Considerations

**For 1000's of Users:**

1. **Database Migration**
   ```python
   # Replace sessions.json with PostgreSQL
   from sqlalchemy import create_engine
   engine = create_engine('postgresql://user:pass@localhost/poseai')
   ```

2. **Session Rotation**
   ```python
   # Keep last 100 sessions per user
   def prune_old_sessions(user_id):
       sessions = get_user_sessions(user_id)
       if len(sessions) > 100:
           delete_sessions(sessions[100:])
   ```

3. **Caching**
   ```python
   # Cache leaderboards (update every minute)
   from flask_caching import Cache
   cache = Cache(app, config={'CACHE_TYPE': 'simple'})
   
   @app.route('/api/leaderboard')
   @cache.cached(timeout=60)
   def leaderboard():
       ...
   ```

4. **Async Processing**
   ```python
   # For heavy analytics
   from celery import Celery
   celery = Celery(app.name)
   
   @celery.task
   def generate_report(session_id):
       # Long-running task
       pass
   ```

---

## 📚 References

- **TensorFlow.js Docs**: https://js.tensorflow.org/
- **MoveNet Guide**: https://github.com/tensorflow/tfjs-models/tree/master/pose-detection/README.md
- **Web Audio API**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
- **Flask Docs**: https://flask.palletsprojects.com/

---

**Happy coding! 🦴**
