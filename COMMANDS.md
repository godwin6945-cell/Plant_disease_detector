# 🚀 PoseAI Suite v2.0 - Command Reference

## ⚡ Quick Start Commands

### Run Server:
```bash
cd "c:\Users\godwi\Downloads\pose dectection 2"
pose_env\Scripts\activate
python app.py
```

### Open Browser:
```
http://localhost:5001
```

### Hard Refresh:
```
Ctrl+Shift+R (Windows)
Cmd+Shift+R (Mac)
```

---

## 🔧 Setup Commands

### First Time Setup:
```bash
cd "c:\Users\godwi\Downloads\pose dectection 2"
pose_env\Scripts\activate
pip install -r requirements.txt
python app.py
```

### Update Dependencies:
```bash
pip install -r requirements.txt --upgrade
```

### Reinstall Everything:
```bash
pip install -r requirements.txt --force-reinstall
```

---

## 🛑 Stop/Restart

### Stop Server:
```
Ctrl+C (in terminal)
```

### Restart Server:
```bash
python app.py
```

### Kill Port 5001:
```bash
netstat -ano | findstr :5001
taskkill /PID <PID_NUMBER> /F
```

---

## 📱 Mobile Webcam

### Android (IP Webcam):
1. Install "IP Webcam" from Play Store
2. Start server in app
3. Note IP (e.g., 192.168.1.100)
4. In PoseAI: Click 📱 → Enter IP → Connect

### iOS (DroidCam):
1. Install "DroidCam" from App Store
2. Start in app
3. Note IP shown
4. In PoseAI: Click 📱 → Enter IP → Connect

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| **1** | PosturePro module |
| **2** | FitAI Coach module |
| **3** | SafetyAI module |
| **4** | SportsVision module |
| **5** | PosePlay module |
| **M** | Toggle mirror mode |
| **S** | Cycle skeleton style |
| **F** | Fullscreen mode |
| **Space** | Pause/Resume camera |
| **D** | Toggle debug info |

---

## 🎮 Game Selection

In PosePlay module, click these buttons:
- **balloon** - Balloon Pop
- **shadow** - Shadow Clone
- **freeze** - Freeze Dance
- **laser** - Laser Dodge
- **mirror** - Pose Mirror (NEW!)

---

## 🎯 Posture Scoring (v2.0)

| Score | Status | Meaning |
|-------|--------|---------|
| **85-100** | ✅ Good | Excellent posture |
| **70-84** | ⚡ Warning | Needs attention |
| **0-69** | ⚠️ Bad | Poor posture |

---

## 🔍 Debug Commands

### Check Python Version:
```bash
python --version
```

### Check Pip Version:
```bash
pip --version
```

### List Installed Packages:
```bash
pip list
```

### Check Port Usage:
```bash
netstat -ano | findstr :5001
```

### Test Flask:
```bash
python -c "import flask; print(flask.__version__)"
```

---

## 📂 File Locations

### Main Files:
- Server: `app.py`
- HTML: `templates/index.html`
- Pose Engine: `static/js/pose_engine.js`
- Posture Module: `static/js/modules/posture.js`
- Games Module: `static/js/modules/games.js`
- Mobile Webcam: `static/js/mobile_webcam.js`

### Documentation:
- Main README: `README.md`
- Improvements: `IMPROVEMENTS.md`
- Quick Start: `QUICKSTART.md`
- Summary: `SUMMARY.md`
- This File: `COMMANDS.md`

---

## 🌐 URLs

### Main App:
```
http://localhost:5001
```

### API Endpoints:
```
http://localhost:5001/api/stats
http://localhost:5001/api/save_session
http://localhost:5001/api/get_history
http://localhost:5001/api/analytics
http://localhost:5001/api/leaderboard
http://localhost:5001/api/personal_records
http://localhost:5001/api/system_info
```

---

## 🔧 Common Fixes

### "Port already in use":
```bash
netstat -ano | findstr :5001
taskkill /PID <PID> /F
```

### "Module not found":
```bash
pip install -r requirements.txt --force-reinstall
```

### "Camera not working":
- Check browser permissions (🔒 icon)
- Try different browser
- Restart browser

### "Old version showing":
```
Ctrl+Shift+R (hard refresh)
Ctrl+Shift+Del (clear cache)
```

---

## 📊 Testing Commands

### Test Posture:
1. Go to PosturePro
2. Start session
3. Check score (should be stricter)
4. Look for ⚠️ ⚡ ✅ icons

### Test 5th Game:
1. Go to PosePlay
2. Click "mirror" button
3. Start game
4. Match poses shown

### Test Mobile Webcam:
1. Click 📱 button
2. Enter phone IP
3. Click Connect
4. Verify video feed

---

## 🎯 Quick Verification

After starting, check:
- [ ] Server running on port 5001
- [ ] Browser opens successfully
- [ ] Camera permission granted
- [ ] Posture score displays
- [ ] 5 game buttons visible
- [ ] 📱 button in navbar
- [ ] Feedback shows icons
- [ ] Pose Mirror works

---

## 📞 Get Help

### Check Console:
```
F12 → Console tab
```

### Check Network:
```
F12 → Network tab
```

### Check Elements:
```
F12 → Elements tab
```

---

## 💾 Backup Commands

### Backup Database:
```bash
copy data\poseai.db data\poseai_backup.db
```

### Backup Config:
```bash
copy .env .env.backup
```

---

## 🚀 Production Commands

### Change Port:
Edit `app.py`:
```python
port = 5002  # Change this
```

### Run in Background:
```bash
start /B python app.py
```

### Stop Background:
```bash
taskkill /IM python.exe /F
```

---

## 📝 Quick Notes

### Default Settings:
- Port: 5001
- Resolution: 720p
- Confidence: 0.3
- FPS: 30
- Model: MoveNet Lightning

### Posture Thresholds (v2.0):
- Good: 85+ (was 80+)
- Warning: 70-84 (was 60-79)
- Bad: <70 (was <60)

### Games:
1. Balloon Pop
2. Shadow Clone
3. Freeze Dance
4. Laser Dodge
5. Pose Mirror (NEW!)

---

**Keep this file handy for quick reference! 📌**
