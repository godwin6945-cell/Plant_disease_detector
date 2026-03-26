# 🏗️ PoseAI Suite - Visual Architecture Guide

## 1. System Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                        BROWSER CLIENT LAYER                          │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    UI Layer (index.html)                    │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │    │
│  │  │ Navigation   │  │ Landing Page │  │  Settings    │      │    │
│  │  │   Tabs (6)   │  │  Hero + Info  │  │   Modal      │      │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘      │    │
│  │         │                                                    │    │
│  │         └─────→ Tab Click → Show/Hide Module Section         │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                              │                                       │
│  ┌───────────────────────────▼──────────────────────────────────┐   │
│  │              Camera + Canvas Layer                           │   │
│  │  ┌──────────────────┐   ┌──────────────────┐                │   │
│  │  │  <video> stream  │   │  <canvas>        │                │   │
│  │  │  from webcam     │   │  skeleton drawn  │                │   │
│  │  │  720x480 actual  │   │  here (overlay)  │                │   │
│  │  └──────────────────┘   └──────────────────┘                │   │
│  └──────────▲────────────────────┬──────────────────────────────┘   │
│             │                    │                                   │
│             │                    ▼                                   │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │              CORE ENGINE LAYER (pose_engine.js)             │   │
│  │                                                              │   │
│  │  ┌─────────────────────────────────────────────┐            │   │
│  │  │  1. Capture video frame (33ms interval)     │            │   │
│  │  └─────────────────────────────────────────────┘            │   │
│  │                      │                                       │   │
│  │                      ▼                                       │   │
│  │  ┌─────────────────────────────────────────────┐            │   │
│  │  │  2. Run Inference (MoveNet or MediaPipe)   │            │   │
│  │  │     → 17 keypoints + confidence scores     │            │   │
│  │  └─────────────────────────────────────────────┘            │   │
│  │                      │                                       │   │
│  │                      ▼                                       │   │
│  │  ┌─────────────────────────────────────────────┐            │   │
│  │  │  3. Filter & Smooth (EMA filter)           │            │   │
│  │  │     α=0.6 for smoothing                    │            │   │
│  │  └─────────────────────────────────────────────┘            │   │
│  │                      │                                       │   │
│  │                      ▼                                       │   │
│  │  ┌─────────────────────────────────────────────┐            │   │
│  │  │  4. Draw Skeleton                          │            │   │
│  │  │     → 17 dots + 14 lines on canvas         │            │   │
│  │  └─────────────────────────────────────────────┘            │   │
│  │                      │                                       │   │
│  │                      ▼                                       │   │
│  │  ┌─────────────────────────────────────────────┐            │   │
│  │  │  5. Analyze (Module-Specific)              │            │   │
│  │  │  ├─ analyzePosture()                       │            │   │
│  │  │  ├─ analyzeExercise(type)                  │            │   │
│  │  │  ├─ analyzeSafety()                        │            │   │
│  │  │  ├─ detectJump()                           │            │   │
│  │  │  └─ detectMovement()                       │            │   │
│  │  └─────────────────────────────────────────────┘            │   │
│  └──────────────────────┬──────────────────────────────────────┘   │
│                         │                                           │
│  ┌──────────────────────▼──────────────────────────────────────┐   │
│  │              MODULE LAYER (5 Modules)                       │   │
│  │                                                              │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐             │   │
│  │  │ PosturePro │  │ FitAI      │  │ SafetyAI   │             │   │
│  │  │ (posture.  │  │ Coach      │  │ (safety.   │             │   │
│  │  │ js)        │  │ (fitness.) │  │ js)        │             │   │
│  │  └────────────┘  └────────────┘  └────────────┘             │   │
│  │  ┌────────────┐  ┌────────────┐                             │   │
│  │  │ SportsVis. │  │ PosePlay   │                             │   │
│  │  │ (sports.   │  │ (games.    │                             │   │
│  │  │ js)        │  │ js)        │                             │   │
│  │  └────────────┘  └────────────┘                             │   │
│  │                                                              │   │
│  │  Each Module:                                               │   │
│  │  ├─ Maintains its own state (isActive, data, etc.)          │   │
│  │  ├─ Updates DOM elements with new metrics                  │   │
│  │  ├─ Draws custom canvas visualization                      │   │
│  │  └─ Saves session data to localStorage                     │   │
│  └──────────────────────┬──────────────────────────────────────┘   │
│                         │                                           │
│                         ▼                                           │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │              Storage Layer (Every 30s or on end)            │   │
│  │  ├─ localStorage (browser session data)                      │   │
│  │  └─ Server (POST /api/save_session)                          │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 2. Pose Engine Data Flow

```
INPUT: Video Stream (720x480 @ 30FPS)
         │
         ▼
[Canvas Capture]
         │
         ▼
[Image Buffer]
         │
         └─→ TensorFlow.js (MoveNet) ╭─ REPLACEMENT POINT
             OR MediaPipe Pose        │  (where we swap)
             ╭──────────────────╯
             │
             ▼
[Raw Pose Output]
    17 Keypoints {x, y, score}
    Indices: 0-16 (MoveNet standard)
             │
             ▼
[Confidence Filtering]
    Keep if score > minConfidence (0.3)
             │
             ▼
[EMA Smoothing]
    newValue = 0.6 * current + 0.4 * previous
             │
             ▼
[Skeleton Drawing]
    Draw: 17 dots + 14 connections
    Colors: RGB by body part
    Glow effect: shadowColor + shadowBlur
             │
             ├─→ Update Canvas Display
             │
             ▼
[Analysis Router]
    if (module === 'posture')
        ├─ analyzePosture(pose)
        │    ├─ neck angle
        │    ├─ spine angle  
        │    └─ shoulder tilt
        │
    if (module === 'fitness')
        ├─ analyzeExercise(pose, 'squat'|'bicep'|...)
        │    ├─ joint angle
        │    ├─ form score
        │    └─ rep state
        │
    if (module === 'safety')
        ├─ analyzeSafety(pose)
        │    ├─ fall detection
        │    ├─ dangerous bend
        │    └─ risk score
        │
    if (module === 'sports')
        ├─ detectJump(pose)
        │    └─ jump apex + height
        │
    if (module === 'games')
        ├─ detectMovement(curr, prev)
        │    └─ total movement distance
             │
OUTPUT: Module-Specific Analysis → UI Update + Storage
```

---

## 3. KeyPoint System (Current vs Future)

### MoveNet Lightning (CURRENT)
```
17 Body Keypoints (used by current system):

     0: nose •
     1,2: eyes (•  •)
     3,4: ears (•  •)
     
     5,6: shoulders (•          •)
     7,8: elbows (•       •)
     9,10: wrists (•       •)
     
     11,12: hips (•          •)
     13,14: knees (•       •)
     15,16: ankles (•       •)

Edges (14 connections):
  Face:   0-1, 0-2, 1-3, 2-4
  Arms:   5-7-9 (left), 6-8-10 (right)
  Torso:  5-6, 5-11, 6-12, 11-12
  Legs:   11-13-15 (left), 12-14-16 (right)
```

### MediaPipe Pose (IF UPGRADING)
```
33 Total Landmarks (we USE only 17):

 0-10: Face keypoints (nose, eyes, ears, mouth corners)
11-16: Upper body (shoulders, elbows, wrists) ← These match MoveNet
17-22: Hands (optional, we skip)
23-28: Lower body (hips, knees, ankles) ← These match MoveNet (different indices!)
29-32: Feet (optional, we skip)

MAPPING (MediaPipe → MoveNet):
  0  → 0  (nose)
  1  → 1  (left_eye)
  2  → 2  (right_eye)
  3  → 3  (left_ear)
  4  → 4  (right_ear)
  11 → 5  (left_shoulder)   ← Different!
  12 → 6  (right_shoulder)  ← Different!
  13 → 7  (left_elbow)      ← Different!
  14 → 8  (right_elbow)     ← Different!
  15 → 9  (left_wrist)      ← Different!
  16 → 10 (right_wrist)     ← Different!
  23 → 11 (left_hip)        ← Different!
  24 → 12 (right_hip)       ← Different!
  25 → 13 (left_knee)       ← Different!
  26 → 14 (right_knee)      ← Different!
  27 → 15 (left_ankle)      ← Different!
  28 → 16 (right_ankle)     ← Different!
```

**Key Difference**: MediaPipe uses different indices! That's why we need `convertMediaPipeToMoveNet()`.

---

## 4. Module Integration Points

```
┌─ Module Lifecycle

INITIALIZATION (Page Load):
┌──────────────────────────────────────┐
│  1. init() called by page            │
│     - Cache DOM elements             │
│     - Add event listeners            │
│     - Set up canvas                  │
└──────────────────────────────────────┘
            │
            ▼
┌──────────────────────────────────────┐
│  2. Tab clicked (navigation)         │
│     - onModuleActive() called        │
│     - Show module section            │
│     - Module ready to receive data   │
└──────────────────────────────────────┘


PER-FRAME OPERATION (Every 33ms):
┌──────────────────────────────────────┐
│  1. poseEngine.estimatePose()        │
│     Returns: [{keypoints[], score}]  │
└───────┬──────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────┐
│  2. If module active:                │
│     pose = poseEngine.getPose(poses) │
└───────┬──────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────┐
│  3. Module analyzes:                 │
│     result = poseEngine.analyzeX()   │
│     Module.state = result            │
└───────┬──────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────┐
│  4. Module updates UI:               │
│     elem.textContent = state.metric  │
│     canvas.draw(state)               │
└──────────────────────────────────────┘


END SESSION:
┌──────────────────────────────────────┐
│  1. User clicks "Stop" button        │
│     Module.endSession() called       │
└───────┬──────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────┐
│  2. Compile session data             │
│     { module, metrics, timestamp }   │
└───────┬──────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────┐
│  3. Save to localStorage + Server    │
│     localStorage.setItem()           │
│     POST /api/save_session           │
└──────────────────────────────────────┘
```

---

## 5. Current vs MediaPipe Comparison

```
┌────────────────────┬──────────────────────┬────────────────────┐
│ Aspect             │ MoveNet (Current)    │ MediaPipe (Future) │
├────────────────────┼──────────────────────┼────────────────────┤
│ Keypoints          │ 17 body only         │ 33 (body + face)   │
│ Confidence Field   │ score                │ visibility         │
│ Model Name         │ SinglePoseLightning  │ Pose               │
│ Init Method        │ movenet.SinglePose.  │ new Pose()         │
│                    │ constructors...      │                    │
│ Inference Method   │ estimatePoses()      │ estimatePose()     │
│ FPS (typical)      │ 24-30                │ 25-35              │
│ Accuracy           │ Good                 │ Excellent          │
│ Hand Detection     │ ❌ No                │ ✅ Optional        │
│ Smoothing          │ Manual (EMA)         │ Built-in option    │
│ Coordinate Space   │ pixel (0-640)        │ normalized (0-1)   │
└────────────────────┴──────────────────────┴────────────────────┘
```

---

## 6. Error Handling Flow

```
┌─ Error Recovery Chain

ERROR: Model Load Fails
    ↓
poseEngine.init() throws
    ├─ Caught by try/catch
    ├─ console.error() logs it
    └─ Error shown on page
         └─ "Loading screen" stays visible
         └─ User blocked from using app

ERROR: Camera Permission Denied
    ↓
navigator.mediaDevices.getUserMedia() fails
    ├─ Caught by try/catch
    ├─ Landing page hidden
    └─ Permission screen shown
         └─ User can retry


ERROR: Pose Estimation Fails (frame-by-frame)
    ↓
Error in estimatePose() loop
    ├─ Caught by try/catch
    ├─ console.error() logged
    ├─ Returns [] (empty poses)
    └─ Module skips that frame (graceful degradation)


ERROR: Canvas Drawing Fails
    ↓
drawSkeleton() throws
    ├─ Caught by try/catch
    ├─ console.error() logged
    └─ Skeleton doesn't render
         └─ Module continues updating state
         └─ Metrics still visible (text only)
```

---

## 7. Script Dependency Graph

```
HTML Loads:
    ↓
1. MediaPipe Scripts (async)
   ├─ camera_utils
   ├─ drawing_utils
   └─ pose (← Pose class becomes global)
    ↓
2. Three.js (async)
    ├─ three.js
    └─ OrbitControls
    ↓
3. Chart.js (async)
    ↓
4. Local Scripts (SEQUENTIAL - order matters!)
    ├─ utils.js              ← No deps
    ├─ 3d_renderer.js        ← Depends on: Three.js
    ├─ pose_engine.js        ← Depends on: Utils, MediaPipe/TensorFlow
    ├─ modules/posture.js    ← Depends on: poseEngine, Utils
    ├─ modules/fitness.js    ← Depends on: poseEngine, Utils
    ├─ modules/safety.js     ← Depends on: poseEngine, Utils
    ├─ modules/sports.js     ← Depends on: poseEngine, Utils
    └─ modules/games.js      ← Depends on: poseEngine, Utils, Audio API
    ↓
5. Inline Script
    ├─ DOMContentLoaded
    ├─ → initNavigation()     (setup tab listeners)
    ├─ → initSettings()       (setup settings modal)
    ├─ → poseEngine.init()    (load pose model)
    └─ → startMainLoop()      (begin inference loop)
```

---

## 8. Performance Metrics

```
Typical Runtime Values (per frame @ 30FPS):

Inference Time:        35-40ms  (time in poseEngine.estimatePose)
Drawing Time:          5-10ms   (drawSkeleton)
Analysis Time:         2-5ms    (analyzeX methods)
Module UI Update:      1-2ms    (DOM manipulation)
Total Frame Time:      ~50ms

FPS Calculation:
  1000ms / 50ms = 20 FPS (conservative estimate)
  
Actual Display:
  24-30 FPS (depends on hardware + browser optimization)

Smoothing Impact:
  EMA filtering adds +1ms per frame (negligible)
  
Canvas Redraw:
  clearRect() + drawImage() + pathRendering = ~7ms

Bottleneck:
  Inference (model run) = ~80% of frame time
```

---

## 9. Module State Machines

```
PosturePro State Machine:
┌─────────┐     start      ┌──────────────┐
│  READY  │───────────────→│ MONITORING   │
└─────────┘                └──────┬───────┘
    ▲                             │
    │                          stop
    │                             │
    │           display           ▼
    └─────────────────────┘  ┌──────────┐
                               │ COMPLETE │
                               └──────────┘

FitAI State Machine:
┌──────────────┐  select  ┌──────────────┐
│ READY        │─────────→│ EXERCISE     │
│ (no exercise)│          │ SELECTED     │
└──────────────┘          └──────┬───────┘
                                 │ start
                                 ▼
                          ┌──────────────┐
                          │ EXERCISING   │
                          │ (recording)  │
                          └──────┬───────┘
                                 │ stop
                                 ▼
                          ┌──────────────┐
                          │ SESSION OVER │
                          │ (show stats) │
                          └──────────────┘

Safety State Machine:
┌──────────┐    monitor   ┌──────────────┐
│ IDLE     │─────────────→│ MONITORING   │
└──────────┘              └──────┬───────┘
                                 │
                    ┌────────────┼────────────┐
                    ▼            ▼            ▼
            ┌─────────────┐ ┌──────────┐ ┌────────┐
            │ FALL        │ │ BEND     │ │ NORMAL │
            │ DETECTED    │ │ WARNING  │ │ STATE  │
            └──────┬──────┘ └────┬─────┘ └────────┘
                   │             │
                   └──────┬──────┘
                          ▼
                  ┌────────────────┐
                  │ ALERT LOGGED   │
                  │ (incident)     │
                  └────────────────┘
```

---

## 10. Testing Sequence Flowchart

```
┌─ Start Testing

1. Page Load
   ├─ ✓ No console errors?
   └─ ✓ Sees "Initializing..." message?
        │
        ▼
2. Camera Permission
   ├─ ✓ Browser asks for camera access?
   └─ ✓ After allowing, video stream visible?
        │
        ▼
3. Model Load
   ├─ ✓ Console shows "✅ Pose engine loaded"?
   └─ ✓ FPS counter starts (top right)?
        │
        ▼
4. Skeleton Rendering
   ├─ ✓ Can see 17 dots + lines on video?
   └─ ✓ Skeleton follows body movement with E MA smoothing?
        │
        ▼
5. Per-Module Testing
   ├─ PosturePro:  ✓ Posture score updates? ✓ Angles show?
   ├─ FitAI:       ✓ Can select exercise? ✓ Rep count increments?
   ├─ SafetyAI:    ✓ Can start monitoring? ✓ Falls recorded?
   ├─ SportsVision:✓ Can run tests? ✓ Personal records save?
   └─ PosePlay:    ✓ Can run games? ✓ Score appears?
        │
        ▼
6. Session Saving
   ├─ ✓ Stop session → "Session Report" appears?
   └─ ✓ Data persists in localStorage?
        │
        ▼
✓ READY FOR PRODUCTION
```

---

**End of Visual Architecture Guide**
