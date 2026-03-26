# 📖 Module Deep Dive Guide

Comprehensive instructions for each of the 5 modules.

---

## 1️⃣ PosturePro — AI Physiotherapy Assistant

**Problem being solved:** Office workers in India spend 8+ hours seated with poor posture, leading to neck pain, back issues, and reduced productivity.

### How It Works

PosturePro continuously analyzes your **neck angle**, **spine angle**, and **shoulder alignment** in real-time:

```
Neck Angle: 90° = Straight, 110° = Hunched (bad)
Spine Angle: 90° = Upright, 45° = Slouched (bad)
Shoulder Tilt: 0° = Level, 30° = Uneven (bad)

Score = (goodAngles / totalAngles) × 100
```

### Step-by-Step Usage

```
1. Click "PosturePro" tab
   → Shows large posture score gauge in center

2. Click "▶ Start Session"
   → 30-minute timer begins
   → Green zone = good posture (score > 75)
   → Yellow zone = warning (score 50-75)
   → Red zone = bad posture (score < 50)

3. Sit or stand normally
   → AI tracks your posture every frame
   → Real-time coaching tips appear

4. Maintain good posture
   → Green = continue doing this!
   → Red + beep sound = posture is bad (alert after 10 sec)

5. After 30 min or manual "▢ Stop":
   → View Session Report:
      - Good posture %: How many sec in green zone
      - Average score: Overall session quality
      - Alert count: How many times you slouched
      - Tips: What to improve
```

### Coaching Tips Generator

When your posture is bad, you get AI-generated tips:

| Condition | Tip |
|-----------|-----|
| Neck too forward | "Straighten your neck — align chin with collarbone" |
| Shoulders hunched | "Pull your shoulders back and down" |
| Spine curved | "Straighten your spine — sit against chair back" |
| Asymmetric shoulders | "Level your shoulders — don't favor one side" |

### Session Report Breakdown

```
Duration: 30:00
Good Posture Time: 24:30 (82%)
Average Score: 84/100
Alert Count: 3 times

Improvement Areas:
→ Neck alignment (+5%)
→ Shoulder leveling (+3%)
```

### Best Practices

✅ **Optimal Setup:**
- Sit with monitor at eye level
- Seat back support at lumbar region
- Feet flat on ground
- Elbows at 90°

✅ **Daily Routine:**
- One 30-min session after lunch
- One session at end of day
- Track weekly improvement %

### Tips from Physiotherapists

1. **Before Session:** Stretch neck and shoulders for 2 min
2. **During Session:** Move every 5 min (stand, walk, arm circles)
3. **After Session:** Review tips and consciously apply them next day
4. **Tracking:** Open yesterday's report + today's side-by-side

---

## 2️⃣ FitAI Coach — Personal AI Trainer

**Problem being solved:** Gym memberships in India are expensive (₹3,000-5,000/month). FitAI enables home workouts with form verification.

### Supported Exercises

| Exercise | How It Works | Perfect Form |
|----------|-------------|--------------|
| **Squat** | Knee bends down/up | Knees 90°→160°, back straight |
| **Bicep Curl** | Arm bends at elbow | Elbow 150°→50°, shoulder still |
| **Shoulder Press** | Lift arms overhead | Wrist above shoulder, core tight |
| **Jumping Jack** | Arms up, legs jump | Full extend, synchronized |
| **Push-up** | Body press to ground | Elbows 45°, wrist aligned |
| **Plank** | Static horizontal hold | Straight line, 30+ sec |

### Step-by-Step Usage

```
1. Click "FitAI Coach" tab
   → Shows 6 exercise buttons with icons

2. Select exercise (e.g., "Squat")
   → Camera focuses on lower body
   → Instructions appear: "Stand with feet shoulder-width apart"

3. Click "▶ Start Workout"
   → Rep counter starts at 0
   → Form score bar appears (red-yellow-green)

4. Perform reps
   → System auto-counts: Rep 1, Rep 2, . . .
   → Each rep scored 0-100%:
      ✅ 100% = perfect form (green)
      ⚠️  70% = some form issue (yellow)
      ❌ < 50% = major form issue (red)

5. Complete set (e.g., 10 reps)
   → Beep sound on rep complete
   → Can continue or finish

6. Click "■ Stop Workout"
   → Session Summary:
      Total Reps: 10
      Perfect Form Reps: 8 (80%)
      Duration: 4:20
      Personal Record: 👍 New PR!
```

### Form Scoring Details

**Squat Example:**

```
Rep 1: Score 95%
  ✅ Knee angle: 89° (perfect, target 90°)
  ⚠️ Back angle: 15° (slight lean, ideal 0°)
  ✅ Foot position: Shoulder-width
  → Overall: 95%

Rep 2: Score 72%
  ✅ Knee angle: 92° (good)
  ❌ Back angle: 35° (too much lean)
  ⚠️ Uneven weight (left leg more)
  → Overall: 72% (needs correction)

Rep 3: Score 98%
  ✅ Knee angle: 88° (perfect)
  ✅ Back angle: 2° (straight)
  ✅ Even weight distribution
  → Overall: 98% (excellent!)
```

### Personal Records

Every time you beat your previous best:
```
🏆 NEW PERSONAL RECORD!
Squat: 15 reps (previous: 12)
Perfect Form: 85% (previous: 78%)
```

Saved to localStorage with timestamp.

### Sample Workout Plan

**Day 1 - Upper Body:**
```
Bicep Curls: 3 sets × 15 reps
  Set 1: 15 reps, 87% perfect form
  Set 2: 14 reps, 89% perfect form
  Set 3: 12 reps, 91% perfect form (tired but best form!)

Shoulder Press: 3 sets × 12 reps
  Set 1: 12 reps, 82% perfect form
  Set 2: 10 reps, 85% perfect form
  Set 3: 9 reps, 88% perfect form (best form when fresh)

Push-ups: 3 sets × 10 reps
  Set 1: 10 reps, 79% perfect form
  Set 2: 8 reps, 85% perfect form
  Set 3: 6 reps, 88% perfect form
```

---

## 3️⃣ SafetyAI — Workplace Safety Monitor

**Problem being solved:** Construction/warehouse accidents in India kill 50,000+ workers yearly. Real-time monitoring can prevent 70% of incidents.

### Hazard Detection

| Hazard | Detection Method | Alert Level |
|--------|------------------|------------|
| **Fall** | Hip drops below knee rapidly | 🔴 CRITICAL |
| **Dangerous Bend** | Spine angle > 45° | 🟠 HIGH |
| **Zone Violation** | Keypoint enters drawn zone | 🟠 HIGH |
| **Static Posture** | No movement > 5 min | 🟡 MEDIUM |

### Usage Scenario: Factory Floor

```
1. Click "SafetyAI" tab
   → Shows safety score gauge (0-100, 100 = safest)

2. Click "▶ Start Monitoring"
   → Status: "Monitoring active"
   → LiveFeed shows skeleton with contact zones

3. Safety AI watches:
   
   00:15 → Worker leans > 45° to pick item
           Alert: "Dangerous bend detected!"
           Incident logged: DANGEROUS_BEND + timestamp
   
   02:30 → Worker bends correctly (< 30°)
           Score: ✅ Good (risk 20%)
   
   05:00 → Worker slips! Hip drops suddenly
           Alert: 🔴 RED + 3-beep alarm sound
           Incident logged: FALL_DETECTED
           Previous location saved for investigation

4. Incident Log grows:
   │ Time     │ Type          │ Risk │ Action  │
   │ 00:15    │ Dangerous Bend │ High  │ Logged  │
   │ 05:00    │ Fall Detected  │ Crit  │ Logged  │

5. End of shift → Export CSV
   → Email safety report to supervisor
   → 0 falls, 1 bend incident, 100% monitoring uptime
```

### Advanced: Draw Danger Zones

```
1. In SafetyAI dashboard, click "Draw Zone"
2. Mouse drag: Creates rectangle
3. Any keypoint entering → Instant alert
4. Use case: Mark exposed machinery, electrical boxes, etc.
```

### Risk Level Scoring

```
Risk Score 0-100:
  0-20    = 🟢 LOW (good posture)
  20-50   = 🟡 MEDIUM (some risk)
  50-80   = 🟠 HIGH (multiple issues)
  80-100  = 🔴 CRITICAL (immediate danger)

Formula:
  riskScore = (40% arm angles) + (30% spine angle) + (30% leg alignment)
```

### RULA (Rapid Upper Limb Assessment) Simplified

```
Assessment Level:
  1-2 = Acceptable (green)
  3-4 = Investigation needed (yellow)
  5-7 = Investigate/Change soon (red)
```

### Daily Safety Report

```
Date: 2024-03-24
Monitoring Time: 8 hours
Incidents: 3
  - Dangerous bend: 2 times
  - Fall detected: 0 times
  - Zone violation: 1 time

Risk Level Breakdown:
  - 85% of time: Low risk (green)
  - 12% of time: Medium risk (yellow)
  - 3% of time: High risk (orange)

Status: ✅ SAFE WORK COMPLETED
```

---

## 4️⃣ SportsVision — Performance Analyzer

**Problem being solved:** Sports coaches in India lack affordable biomechanical analysis tools. SportsVision provides instant feedback.

### Test Types

#### Test 1: Jump Height
```
Setup:
  - Stand 2-3 feet from camera
  - Full body visible
  
Execution:
  - Click "Jump Height Test"
  - Click "▶ Start Test"
  - Stand still (establishing baseline)
  - JUMP as high as you can!
  - Land and stand still
  
Result:
  Jump Height: 45 cm
  Hang Time: 0.68 seconds
  Power Index: 85/100
  
Personal Records:
  Best: 52 cm (yesterday)
  Average: 43 cm
  Trend: ⬆️ Improving
  
Comparison vs Best:
  Today: 45 cm (86% of best)
  Form: Good takeoff, slight lean on landing
```

#### Test 2: Reaction Time
```
Setup:
  - Focus on screen
  - Hand ready to move
  
Execution:
  - Click "Reaction Test"
  - Click "▶ Start Test"
  - Random delay (1-4 seconds)
  - ⚫ RED DOT appears at random position
  - MOVE your hand to touch it FAST
  - System measures response time
  
Result:
  Reaction Time: 285 ms
  Movement Speed: Fast
  Accuracy: Hit on 1st attempt
  
Leaderboard:
  1. 210 ms (best ever)
  2. 267 ms (3 days ago)
  3. 285 ms (TODAY) ← You are here
  
Feedback: "Good! Average 285ms is faster than 78% of users."
```

#### Test 3: Batting Stance
```
Setup:
  - Assume cricket/baseball batting stance
  - 2-3 feet from camera
  
Execution:
  - Click "Batting Stance"
  - Click "▶ Start Test"
  - Hold stance for 2 seconds
  - System analyzes
  
Analysis:
  Stance Width: 98 cm (target: 90-110 cm) ✅
  Knee Bend: 25° (target: 20-40°) ✅
  Head Position: Facing pitcher ✅
  Front Arm: Parallel to ground ✅
  Back Arm: Bent at elbow ✅
  
Overall Score: 94/100 ✅ EXCELLENT
  
Feedback:
  • Stance width is perfect
  • Head position excellent
  • ⚠️ Slight weight imbalance (left 52%, right 48%)
    → Distribute weight more evenly
```

#### Test 4: Running Form
```
Setup:
  - Side view (profile) 2-3 feet away
  - Full body visible
  
Execution:
  - Click "Running Form"
  - Click "▶ Start Test"
  - Run in place or treadmill
  - System analyzes for 10 seconds
  
Analysis:
  Arm Swing Symmetry: 87% ✅
  Stride Length: 65 cm
  Cadence: 165 steps/min (good)
  Knee Height: 78 cm (high)
  Posture: Forward lean 8° (optimal)
  
Overall Score: 89/100 GOOD
  
Feedback:
  ✅ Excellent arm swing
  ✅ Good knee drive
  ⚠️ Slight right shoulder drop
  → Strengthen stabilizer muscles
```

### Personal Records (PR) Feature

```
Jump Height:
  All-Time Best: 52 cm
  This Week: 45 cm
  Trend: 📊 Chart shows daily progress
  
When you break a PR:
  🏆 NEW PERSONAL RECORD!
  Jump Height: 53 cm (previous: 52 cm)
  
  Saved to: localStorage + Flask backend
  Share: Export to CSV for coach
```

### Leaderboard

```
PoseAI SportsVision Leaderboard

JUMP HEIGHT (Top 5):
1. 🥇 52 cm (2024-03-23)
2. 🥈 50 cm (2024-03-22)
3. 🥉 48 cm (2024-03-20)
4.   47 cm (2024-03-19)
5.   45 cm (2024-03-24) ← You are here

REACTION TIME (Top 5):
1. 🥇 210 ms
2. 🥈 267 ms
3. 🥉 285 ms ← You are here

```

---

## 5️⃣ PosePlay — Interactive Games

**Problem being solved:** Engaging way to practice pose detection accuracy and have fun with pose technology.

### Game 1: Pose Mirror 🪞

```
Objective: Match the target pose

1. Click "Pose Mirror" game
2. Left side: YOU (real-time skeleton)
3. Right side: TARGET (static pose to match)

Scoring:
  • Head position match: +10 points
  • Arm position match: +10 points
  • Leg position match: +10 points
  • Full body match: +50 bonus points
  
  Max per pose: 100 points
  Target duration: 2-3 seconds hold
  
Challenge Mode:
  Harder poses unlock as you level up
  Level 1: T-pose
  Level 2: Warrior pose
  Level 3: Pistol squat
  Level 4: Handstand (optional)
  
Score: 850 points (Level 2)
```

### Game 2: Skeleton Painter 🎨

```
Objective: Draw pictures using your hands as brushes

Controls:
  • Right wrist = Magenta brush
  • Left wrist = Orange brush
  • T-pose = ERASER

Features:
  • Brush size: 2-20 px (adjustable slider)
  • Elbow angle affects brush thickness
    - Full extension: 2px thin line
    - Bent: 15px thick line
  
  • Clear Canvas button (wipes all)
  • Save as PNG (downloads image)

Challenge:
  • Paint a star (100 points)
  • Draw a face (200 points)
  • Paint your name (300 points)
  
Score: Creating custom art + score based on complexity

Tips:
  ✅ Extend arms fully for thin details
  ✅ Bend elbows for thick strokes
  ✅ Use both hands simultaneously
```

### Game 3: Body Theremin 🎵

```
Objective: Play music using body position

Controls:
  • Right wrist Y position = PITCH
    - Top (head height): 2000 Hz (high note)
    - Bottom (waist): 100 Hz (low note)
    
  • Left wrist X position = VOLUME
    - Left (extend left): 0.0 (muted)
    - Right (cross body): 0.3 (loud)
    
  • Hands together: Full volume

How to Play:
  1. Click "Body Theremin" game
  2. Sound starts: Web Audio API oscillator
  3. Move right wrist up/down → Pitch changes
  4. Move left wrist left/right → Volume changes
  5. Make a melody!

Famous Theremin Songs:
  • Theme from The Twilight Zone
  • Good Vibrations (Beach Boys)
  • Star Trek theme

Scoring:
  • Duration: Seconds of continuous play
  • Note transitions: Smooth glide vs jumps
  • Dynamic range: Min-max pitch used
  
Challenges:
  • Play "Mary Had a Little Lamb"
  • Create your own 30-second composition
```

### Game 4: Avatar Control 🤖

```
Objective: Live avatar mirroring

Avatar Modes (5 skins):
  1. 🤖 Robot: Silver + cyan joints
  2. 💀 Skeleton: White bones + black outline
  3. 🔥 Fire: Orange-red with glow effect
  4. 💎 Neon: Bright cyan + magenta grid
  5. 🪐 Space: Stars + galaxy colors

How It Works:
  1. Select avatar skin (5 buttons)
  2. Click "▶ Start Game"
  3. Your skeleton appears on screen in that skin
  4. Move → Avatar moves in real-time (0ms lag)

Features:
  • No scoring (pure entertainment)
  • Animations per avatar type (walk, idle state)
  • Size adjustment (small/normal/large)
  • Save avatar screenshot
  
Use Cases:
  • Tech expo booth demo
  • Social media content
  • Birthday party entertainment
  • Gaming arcade experience
```

### Game 5: Reaction Game 🎯

```
Objective: Touch targets before they disappear

Gameplay:
  1. Click "Reaction Game"
  2. Click "▶ Start Game"
  3. Colored circles appear randomly on screen
  4. Each circle shrinks over 3 seconds
  5. Move your hand (any hand) to touch before 0 seconds
  
Scoring:
  • Touch within 3 sec: +10 points
  • Touch within 1 sec: +30 points
  • Touch within 0.5 sec: +50 points
  • 3 misses in a row → Game Over

Difficulty Progression:
  Score 0-100:    1 target at a time, 4 sec timer
  Score 100-300:  2 targets, 3 sec timer
  Score 300-500:  3 targets, 2.5 sec timer
  Score 500+:     4 targets, 2 sec timer (hard!)

Leaderboard:
  All-Time Best: 850 points
  Session Best: 620 points (today)
  
Challenge Mode:
  • Special targets (2x points)
  • Blind mode (targets appear but not visible)
  • Time rush (30 second limit)
```

### Multi-Game Leaderboard

```
PosePlay Overall Leaderboard

PAINTER:
  Best: 5000 points (complex artwork)

THEREMIN:
  Best: 180 seconds (continuous play)
  
AVATAR:
  Best: 300 seconds (longest engagement)
  
REACTION:
  Best: 850 points (fastest reflexes)
  
MIRROR:
  Best: 2800 points (8 poses matched)
```

---

## 🎯 Combining Modules: Sample Week

### Monday - Fitness Focus
```
FitAI Coach: Squats 3×15
→ Great form (90% perfect)
→ New PR: 15 reps
```

### Tuesday - Posture Focus
```
PosturePro: 30-min session
→ 85% good posture time
→ 3 slouch alerts
→ Improvement: More neck awareness
```

### Wednesday - Sports
```
SportsVision: Jump Height Test
→ 48 cm (beating previous 45 cm)
→ Running Form Test
→ 88% arm swing symmetry
```

### Thursday - Safety Training
```
SafetyAI: 1 hour shift simulation
→ 0 falls detected
→ 2 bench mark bend alerts (corrected)
→ Risk Level: 15 (low)
```

### Friday - Fun
```
PosePlay: All 5 games
→ Painter: Drew digital art
→ Theremin: Played Star Trek theme
→ Reaction: Scored 750 points
→ Avatar: Tried all 5 skins
```

### Saturday - Recovery/Review
```
Analytics Dashboard:
→ Week summary
→ Best sessions
→ Personal records achieved
→ Trends (posture improving 3% per day)
```

---

## 📊 Viewing Your Data

All modules auto-save to:
- **Real-time**: Browser localStorage
- **Historical**: `data/sessions.json` (Flask backend)
- **Export**: CSV per session

To access:
1. Settings (⚙️) → Reset → no, just view history
2. Each module shows "📊 History" (partial)
3. Full data via `/api/export_session/<id>`

---

**Ready to start? Open `QUICKSTART.md` or jump into any module! 🚀**
