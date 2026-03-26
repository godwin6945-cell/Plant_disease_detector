# ❓ FAQ & Troubleshooting Guide

Common issues and solutions for PoseAI Suite.

---

## 🚀 Startup Issues

### "Port 5000 already in use"

**Problem:** Flask can't start because another app is using port 5000.

**Solutions:**

1. **Kill the blocking process**
   ```powershell
   # Find what's using port 5000
   netstat -ano | findstr :5000
   
   # Kill it by PID
   taskkill /PID [PID] /F
   
   # Then restart Flask
   python app.py
   ```

2. **Use different port**
   ```powershell
   # In .env file, change:
   PORT=5001
   
   # Then Flask runs on: http://localhost:5001
   ```

3. **Restart computer**
   ```powershell
   # Nuclear option - clears all processes
   shutdown /r /t 0
   ```

---

### "ModuleNotFoundError: No module named 'flask'"

**Problem:** Python dependencies not installed.

**Solution:**

```powershell
# Activate environment
pose_env\Scripts\activate

# Install all dependencies
pip install -r requirements.txt

# Verify
pip list | findstr flask

# Should show: Flask 3.0.3
```

---

### "Python not found" or "pose_env not found"

**Problem:** Virtual environment doesn't exist or Python not in PATH.

**Solutions:**

1. **Recreate environment**
   ```powershell
   # Navigate to project
   cd "C:\Users\godwi\Downloads\pose dectection 2"
   
   # Create new env
   python -m venv pose_env
   
   # Activate
   pose_env\Scripts\activate
   
   # Install dependencies
   pip install -r requirements.txt
   ```

2. **Check Python installation**
   ```powershell
   python --version
   # Should show: Python 3.8+
   
   # If not found, install from python.org
   ```

---

## 🎥 Camera Issues

### "Browser doesn't ask for camera permission"

**Problem:** Permission dialog doesn't appear.

**Reasons & Fixes:**

| Issue | Fix |
|-------|-----|
| HTTPS required | Use Chrome DevTools, not production HTTPS |
| Camera already denied | Settings 🔒 → Camera → Allow http://localhost:5000 |
| Camera in use | Close other camera apps (Zoom, Teams, etc.) |
| Wrong protocol | Use `http://` not `https://` for localhost |

**Reset Permissions (Chrome):**
```
1. Click 🔒 icon (left of address bar)
2. Click "Camera" → Clear
3. Refresh page
4. Click "Allow"
```

---

### "Camera shows black square, no video"

**Problem:** Camera connected but not streaming.

**Diagnostics:**

```powershell
# Test camera on Windows
# Open: Settings → Devices → Camera → Allow apps to use camera
# Verify at least one camera shows "On"

# Restart browser (full close + reopen)
# Try different browser: Chrome, Edge, Firefox
```

**In Application:**

1. Open Settings ⚙️
2. Camera dropdown → Try each device listed
3. If "No cameras found":
   - Close all other camera apps
   - Disconnect/reconnect USB camera
   - Restart browser

4. Check browser console (F12):
   - Look for error: "NotAllowedError: Permission denied"
   - Solution: Click camera icon 🔒 and set to "Allow"

---

### "Skeleton not showing (black canvas)"

**Problem:** Camera works but pose detection fails.

**Checklist:**

- [ ] Camera video shows (green dot ✓ appears)
- [ ] FPS counter visible (top-right badge)
- [ ] Entire body visible in frame
- [ ] Good lighting (not backlit)
- [ ] Standing 2-3 feet from camera

**Debug:**

1. Press **D** key for debug mode
2. Open console (F12 → Console)
3. Look for:
   - `❌ MoveNet initialization failed` → Model didn't load
   - `⚠️ Pose confidence low` → Lighting issue
   - `✅ Pose detected` → System working

---

### "Only upper body detected, legs missing"

**Problem:** Pose detection only sees partial skeleton.

**Causes:**

1. **Too close to camera** → Stand 3-4 feet back
2. **Cropped in frame** → Ensure full body visible
3. **Lighting** → Move to brighter area
4. **Camera angle** → Face camera directly

**Test:**

1. Settings ⚙️ → Skeleton → "Default" 
2. Should see all 17 dots colored:
   - Face (cyan), Arms (magenta/orange), Torso (green), Legs (yellow/red)

If not visible:
```
→ Adjust distance/lighting
→ Clear browser cache (Ctrl+Shift+Del)
→ Reload page (Ctrl+R)
```

---

## 📊 Module Issues

### PosturePro

**"Score not updating"**
- [ ] Session started (see timer counting down)
- [ ] Check if confidence threshold too high → Settings → 0.3 recommended
- [ ] Move head/shoulders to trigger analysis

**"Alert sound not working"**
```powershell
# Check browser audio
1. Open DevTools (F12)
2. Console tab
3. Type: new Audio().play()
# Should hear beep if audio working

# If not:
→ Unmute browser (look for speaker icon)
→ Check Windows volume
→ Try different browser
```

---

### FitAI Coach

**"Reps not counting"**

Checklist:
- [ ] Selected correct exercise
- [ ] Rep counting enabled (visual indicator)
- [ ] Perform full range of motion
- [ ] Move slowly (fast movements missed)

Example squat:
```
❌ TOO FAST: Jump down-up = misses the count
✅ CORRECT: Slow squat (2 sec down, 2 sec up) = counted
```

**"Form score always red"**
- Check if joint angles correct (press D for debug)
- Example: Squat needs knee angle 90°
- If you're only bending 45°, form score will be low

---

### SafetyAI

**"Incidents logged but shouldn't be"**

Incidents saved if:
- Hip drops suddenly (fall detection)
- Spine angles > 45° (dangerous bend)
- Keypoint enters drawn zone

**False alerts?**
→ Increase MIN_CONFIDENCE in .env (higher = only strong poses)

**"Risk score always high"**
- Check if standing upright (straight spine)
- Adjust min confidence if jitter detected
- Try better lighting

---

### SportsVision

**"Jump height shows 0 cm"**

Requirements:
- [ ] Stand still first (1 second baseline)
- [ ] JUMP straight up
- [ ] Land and stand still
- [ ] Be 2-3 feet from camera

If still failing:
1. Check debug mode (press D)
2. Look for "🚀 Jump apex detected"
3. If not appearing, try taller jump or move back

**"Reaction time not measuring"**

1. Make sure test started (red dot appears)
2. Move hand to touch dot quickly
3. System auto-measures: appear → response time

If doesn't work:
- Try moving more deliberately
- Ensure hand is fully visible
- Different lighting

---

### PosePlay

**"Theremin not making sound"**

Steps:
1. Unmute browser 🔊
2. Check Windows volume (not muted)
3. In Settings, toggle "Audio" on
4. Move right hand up/down (should hear pitch change)

**"Painter not drawing"**

- [ ] Game started (status shows "Playing")
- [ ] Wrist visible in skeleton
- [ ] Brush size > 0 (check slider)
- [ ] Move hands (drawing activates on movement)

---

## 💾 Data Issues

### "Session data disappeared"

**Common causes:**

1. **Browser cache cleared**
   - LocalStorage lost when cache cleared
   - Server copy still in `data/sessions.json`

2. **Private/Incognito mode**
   - Data lost when tab closes
   - Use normal browsing mode

3. **Wrong browser**
   - Each browser = separate localStorage
   - Switch to same browser you used before

**Recovery:**

```powershell
# Check if server has backup
# Open: data/sessions.json
# Look for your session (search by timestamp)

# If found, manually restore:
# Copy JSON → DevTools → Console:
localStorage.setItem('poseai_posture_session', '{"data":"..."}')
```

---

### "Storage full" or "Quota exceeded"

**Problem:** Too much data stored locally.

**Solution:**

1. **Settings ⚙️ → "Clear History"**
   - Keeps last 1 week of sessions
   - Deletes older data

2. **Manual clear:**
   ```javascript
   // In browser console
   localStorage.clear()
   // ⚠️ WARNING: Deletes ALL session data!
   ```

3. **Check size:**
   ```javascript
   // See what's taking space
   for (let key in localStorage) {
     let size = localStorage[key].length;
     console.log(key + ': ' + size + ' bytes');
   }
   ```

**Prevent:**

- Export sessions regularly (CSV)
- Keep last 20 sessions max
- Settings → Auto-clear every 30 days

---

### "CSV export not downloading"

**Browser-specific:**

| Browser | Fix |
|---------|-----|
| Chrome/Edge | Should auto-download to Downloads folder |
| Firefox | Ask where to save → select folder |
| Safari | May open PDF instead → Save As |

**If not downloading:**
1. Check Downloads folder (Files → Downloads)
2. Check if popup blocked (notification top-right)
3. Try different browser

---

## ⚙️ Settings Issues

### "Settings reset to defaults"

**Why:** Browser cache cleared or stored settings corrupted.

**Recovery:**

```javascript
// Restore custom settings in console
localStorage.setItem('poseai_settings', JSON.stringify({
  camera: 0,
  resolution: '720p',
  confidence: 0.3,
  skeleton_style: 'neon',
  mirror: false,
  debug: false
}));
```

---

### "Language not changing"

Currently only English available (framework for others).

To add new language:
1. Find language codes in index.html (around line 500)
2. Add translations for UI strings
3. Rebuild language switch logic

---

## 🖥️ Performance Issues

### "FPS very low (< 15)"

**Causes (in order of likelihood):**

1. **Resolution too high**
   - Settings → Resolution → 480p (fastest)
   - Trade-off: Less accurate but smooth

2. **Too many other apps**
   - Close Chrome tabs, other apps
   - Restart computer if needed

3. **Old CPU/GPU**
   - Expected on integrated graphics
   - Consider 480p resolution

4. **Browser issue**
   - Try different browser (Chrome first)
   - Clear cache (Ctrl+Shift+Del)

**Check FPS:**
- Top-right badge shows current FPS
- 24-30 FPS = normal
- < 20 FPS = needs optimization
- < 10 FPS = major issue

---

### "Slow response when clicking buttons"

**Cause:** UI thread blocked by heavy analysis.

**Fixes:**

1. **Lower confidence threshold:**
   - Settings → Confidence → 0.25 (not 0.3)
   - Means fewer pose analyses

2. **Lower resolution:**
   - Settings → Resolution → 480p
   - Smaller image = faster inference

3. **Close other apps**
   - Especially other Chrome tabs

---

### "Audio feedback is delayed"

**Web Audio API timing:**
- Tone generation: instant
- Browser mixing: 1-2 frame delay
- Normal behavior

If more delayed:
- Check if other audio playing (Spotify, YouTube)
- Restart browser
- Try different device

---

## 🔗 Network Issues

### "Cannot reach localhost:5000"

**Checklist:**

```powershell
# 1. Flask running?
# (Should see message in terminal: "Running on http://localhost:5000")

# 2. Try this in browser:
# http://localhost:5000
# (should show landing page)

# 3. If blank/error:
# → Flask crashed
# → Application has error
# → Port blocked

# 4. Check terminal for errors
# Look for: ❌ ERROR messages
```

**Debug:**

```powershell
# Test if port open
netstat -ano | findstr :5000
# If result, port in use
# If no result, Flask not running

# Restart Flask:
# 1. Ctrl+C in terminal
# 2. python app.py
```

---

### "Cannot save session (no connection)"

**This shouldn't happen for offline use**, but if it does:

```javascript
// Sessions save locally first
// Then sync to server when connection returns

// Check connection:
navigator.onLine ? "Connected" : "Offline"

// Force sync in console:
fetch('/api/save_session', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(sessionData)
})
```

---

## 🐛 Error Messages Explained

### "Uncaught TypeError: Cannot read property 'x' of undefined"

**Cause:** Pose detection missed a keypoint.

**Fix:**
```javascript
// Safe code pattern
if (pose && pose.keypoints && pose.keypoints[0]) {
  const x = pose.keypoints[0].x;
} else {
  console.warn('Pose data incomplete');
}
```

---

### "WebGL context lost"

**Cause:** GPU context reset (rare).

**Auto-recovery:** System should auto-recover.

**If persists:**
- Close and reopen browser
- Disable GPU extensions (unlikely needed)

---

### "NotAllowedError: The Quota has been exceeded"

**Cause:** LocalStorage full (>5MB).

**Solution:**
```powershell
# Clear old data
localStorage.clear()
# or selectively delete old sessions
localStorage.removeItem('poseai_fitness_history')
```

---

## 📞 Getting Help

### Check Logs

**Browser Console (F12 → Console):**
```
✅ Messages = working as intended
⚠️ Warnings = non-critical issues  
❌ Errors = problems needing attention
```

**Flask Terminal:**
```
Look for:
- 127.0.0.1 - - [timestamp] "GET / HTTP/1.1" 200
  (200 = success, 404 = not found, 500 = server error)
```

---

### Ask for Help

Provide:
1. **What you're trying to do:** "Start PosturePro session"
2. **What happens:** "Black screen, no skeleton"
3. **What you've tried:** "Restarted browser, camera works"
4. **Logs:** Copy console errors (F12 → Console)
5. **System:** Windows 11, Chrome, camera model

---

## ✅ Verification Checklist

When everything is working:

- [ ] Flask running (`python app.py` shows "Running at...")
- [ ] Browser shows landing page
- [ ] Camera permission granted (green dot ✓)
- [ ] Camera preview shows video
- [ ] Skeleton appears with 17 dots
- [ ] Colors show (cyan, magenta, orange, green, yellow, red)
- [ ] FPS counter visible (top-right badge)
- [ ] Can switch modules (1-5 keys)
- [ ] Settings open/close (⚙️)
- [ ] LocalStorage saving (DevTools → Storage → LocalStorage)
- [ ] Data persists after refresh

All ✅ = Ready to use!

---

**Still stuck? 🤔**

1. Read relevant section above
2. Check docs: `README.md`, `QUICKSTART.md`, `MODULES.md`
3. Restart Flask + browser
4. Clear browser cache (Ctrl+Shift+Del)
5. Try different browser
6. Restart computer (last resort)

**Happy pose detecting! 🦴**
