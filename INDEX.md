# 📚 Documentation Index — PoseAI Suite

Welcome to PoseAI Suite! This document helps you find the right guide.

---

## 🎯 What Are You Trying to Do?

### Getting Started (First Time)
→ **Read: [QUICKSTART.md](QUICKSTART.md)**
- 3-minute setup guide
- Press-to-play instructions
- First 5 minutes walkthrough

### Understanding What Each Module Does
→ **Read: [MODULES.md](MODULES.md)**
- Deep dive into each of 5 modules
- Step-by-step usage workflows
- Real-world scenarios
- Best practices for each module

### Detailed Instructions (General Use)
→ **Read: [README.md](README.md)**
- Complete feature overview
- System requirements checking
- Architecture explanation
- API endpoints reference
- Technology stack details

### Something Not Working?
→ **Read: [TROUBLESHOOTING.md](TROUBLESHOOTING.md)**
- 50+ common issues and fixes
- Debug tips and tricks
- Verification checklist
- Help resources

### Want to Extend/Customize?
→ **Read: [DEVELOPER.md](DEVELOPER.md)**
- System architecture deep-dive
- File structure and dependencies
- Adding new modules
- Modifying existing features
- Performance optimization

---

## 📖 Document Overview

| Document | Length | For Whom | Topics |
|----------|--------|----------|--------|
| **QUICKSTART.md** | 5 min read | Everyone | Get running ASAP, keyboard shortcuts |
| **MODULES.md** | 20 min read | Users | How each module works, usage patterns |
| **README.md** | 15 min read | Users | Complete feature list, technologies |
| **TROUBLESHOOTING.md** | 12 min read | Users + Devs | 50+ issues, debug tips, FAQ |
| **DEVELOPER.md** | 20 min read | Developers | Code structure, customization, API |
| **INDEX.md** | This file | Everyone | Navigation and overview |

---

## 🚀 5-Minute Start

```bash
# 1. Open PowerShell
cd "C:\Users\godwi\Downloads\pose dectection 2"

# 2. Activate environment + start
pose_env\Scripts\activate
python app.py

# 3. Open browser
http://localhost:5000

# 4. Grant camera permission
# Click "Allow"

# 5. Try a module
# Press "1" for PosturePro
```

→ **Read full guide: [QUICKSTART.md](QUICKSTART.md)**

---

## 🧠 Understanding the System

### Architecture Flow

```
Your Webcam
    ↓
Browser Canvas
    ↓
TensorFlow.js (runs locally)
    ↓
MoveNet Pose Detection
    ↓
Module Analysis (PosturePro, FitAI, etc.)
    ↓
UI Updates + LocalStorage
    ↓
Flask Backend (optional save to disk)
```

→ **Learn more: [README.md - Architecture section](README.md#-system-architecture)**

---

## 🎮 Module Quick Links

| Module | Best For | Time | Docs |
|--------|----------|------|------|
| 🦴 **PosturePro** | Office workers | 30 min | [MODULES.md § 1](MODULES.md#1-postureproai-physiotherapy-assistant) |
| 💪 **FitAI Coach** | Home fitness | 15 min | [MODULES.md § 2](MODULES.md#2-fitai-coach--personal-ai-trainer) |
| ⚠️ **SafetyAI** | Workplace safety | Ongoing | [MODULES.md § 3](MODULES.md#3-safetyai--workplace-safety-monitor) |
| 🏆 **SportsVision** | Athletes | 5 min | [MODULES.md § 4](MODULES.md#4-sportsvision--performance-analyzer) |
| 🎮 **PosePlay** | Games/fun | 10 min | [MODULES.md § 5](MODULES.md#5-poseplay--interactive-games) |

---

## ❓ Common Questions

**Q: "I just want to try it, where do I start?"**
A: Open [QUICKSTART.md](QUICKSTART.md), follow 3 steps, launch in 5 minutes.

**Q: "How do I use [module name]?"**
A: Open [MODULES.md](MODULES.md), find your module, follow the step-by-step guide.

**Q: "It's not working, what's wrong?"**
A: Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md), find your issue, apply fix.

**Q: "I want to add a new exercise/game."**
A: Read [DEVELOPER.md](DEVELOPER.md) - Module Architecture & Adding New Modules sections.

**Q: "Is my data safe? What gets uploaded?"**
A: Safe! All analysis happens locally. Nothing uploaded to cloud. See [README.md - Data Storage](README.md#-data-storage).

**Q: "What are the system requirements?"**
A: See [README.md - System Requirements](README.md#-system-requirements).

**Q: "Can I use my AMD Radeon GPU?"**
A: Yes! Already optimized. See [README.md - Hardware](README.md#hardware).

---

## 🎯 Reading Paths by User Type

### 👤 Casual User (Just want to use it)

1. [QUICKSTART.md](QUICKSTART.md) — Get it running
2. [MODULES.md](MODULES.md) — Pick a module to try
3. [TROUBLESHOOTING.md](TROUBLESHOOTING.md) — If something breaks

**Time investment:** 15 minutes

---

### 👨‍💼 Professional User (Using for coaching/safety)

1. [QUICKSTART.md](QUICKSTART.md) — Setup
2. [MODULES.md](MODULES.md) — Full module guides (all 5 sections)
3. [README.md](README.md) — Features and API endpoints
4. [TROUBLESHOOTING.md](TROUBLESHOOTING.md) — Debugging

**Time investment:** 45 minutes

---

### 👨‍💻 Developer (Want to customize/extend)

1. [QUICKSTART.md](QUICKSTART.md) — Get it running
2. [DEVELOPER.md](DEVELOPER.md) — Full architecture & code
3. [README.md](README.md) — Feature specifications
4. [MODULES.md](MODULES.md) — Module behavior details
5. [TROUBLESHOOTING.md](TROUBLESHOOTING.md) — Debug tips

**Time investment:** 90 minutes

---

## 📊 File Reference

### Main Application Files

```
/templates/index.html          ← Main app (7000+ lines)
/static/css/style.css          ← Styling (2000+ lines)
/static/js/pose_engine.js      ← Pose detection core
/static/js/utils.js            ← Helper functions
/static/js/modules/*.js        ← 5 module files
/app.py                        ← Flask backend
```

→ For code questions, see [DEVELOPER.md - File Structure](DEVELOPER.md#-file-structure-dependencies)

---

### Documentation Files (You are here!)

```
QUICKSTART.md       ← Start here (3 min setup)
README.md           ← Full feature overview
MODULES.md          ← How to use each module
DEVELOPER.md        ← Code structure + customization
TROUBLESHOOTING.md  ← Problem solving
INDEX.md            ← This file
```

---

## 🎓 Learning Objectives

After reading **QUICKSTART.md**:
✅ Can launch Flask server
✅ Can open app in browser
✅ Can grant camera permission
✅ Can switch between modules using keyboard

After reading **MODULES.md**:
✅ Understand all 5 modules
✅ Know how to use each one
✅ Can follow workflows
✅ Know what metrics to track

After reading **README.md**:
✅ Understand full feature set
✅ Know system requirements
✅ Understand data storage
✅ Can access API endpoints

After reading **DEVELOPER.md**:
✅ Understand code architecture
✅ Can add new modules
✅ Can customize existing modules
✅ Can optimize performance

After reading **TROUBLESHOOTING.md**:
✅ Can diagnose problems
✅ Know common fixes
✅ Can debug issues
✅ Understand error messages

---

## 🆘 Need Help?

### "I don't know where to start"
→ [QUICKSTART.md](QUICKSTART.md)

### "Something isn't working"
→ [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

### "How do I use [feature]?"
→ [MODULES.md](MODULES.md)

### "What are the technical details?"
→ [README.md](README.md)

### "I want to modify the code"
→ [DEVELOPER.md](DEVELOPER.md)

### "I'm still stuck after reading"
1. Check the console (F12)
2. Copy error messages
3. Provide details:
   - What you're trying to do
   - What error appears
   - Steps you've taken

---

## 📈 Recommended Reading Order

**Minimum (5-15 minutes):**
1. This file (INDEX.md) - 2 min
2. QUICKSTART.md - 3 min
3. One module in MODULES.md - 5-10 min

↓ Try the app at this point ↓

**Standard (30-45 minutes):**
1. All of above
2. README.md - 15 min
3. TROUBLESHOOTING.md (skim) - 5 min

↓ Try all features at this point ↓

**Complete (90+ minutes):**
1. All of above
2. MODULES.md (all 5 sections) - 20 min
3. DEVELOPER.md - 20 min
4. TROUBLESHOOTING.md (detailed) - 15 min

↓ Ready to customize and extend ↓

---

## 🗺️ Feature Map

### Real-Time Pose Analysis
- Fast inference (30 FPS on AMD Radeon)
- 17-keypoint skeleton detection
- Direct GPU processing

→ See [README.md - Technologies](README.md#-technologies-used)

### 5 Complete Modules
- PosturePro (coaching)
- FitAI Coach (fitness)
- SafetyAI (workplace)
- SportsVision (sports)
- PosePlay (games)

→ See [MODULES.md](MODULES.md)

### Data Persistence
- Real-time: Browser localStorage
- Long-term: Flask backend (`data/sessions.json`)
- Export: CSV per session

→ See [README.md - Data Storage](README.md#-data-storage)

### API Endpoints
- `/api/stats` - Server status
- `/api/analytics` - Module analytics
- `/api/leaderboard` - Game scores
- `/api/personal_records` - Best scores

→ See [README.md - API Endpoints](README.md#-api-endpoints)

---

## 💡 Pro Tips

1. **Keyboard shortcuts** (press while using)
   - `1-5`: Switch modules
   - `F`: Fullscreen
   - `M`: Mirror camera
   - `S`: Change skeleton style
   - `D`: Debug mode
   
   → See [README.md - Keyboard Shortcuts](README.md#-keyboard-shortcuts)

2. **Best camera setup**
   - 2-3 feet from camera
   - Good lighting (no backlit)
   - Full body visible
   - Against plain background

   → See [MODULES.md - PosturePro Camera Tips](MODULES.md#camera-setup-1)

3. **For demos/presentations**
   - Press `F` for fullscreen
   - Press `S` to change skeleton style (looks cool!)
   - Use "Mirror" mode for audience view

4. **Data export**
   - Each session auto-saved
   - Export to CSV for reporting
   - Use `/api/export_session/<id>`

---

## 🔗 External Resources

- **TensorFlow.js:** https://js.tensorflow.org/
- **MoveNet Model:** https://github.com/tensorflow/tfjs-models
- **Flask Framework:** https://flask.palletsprojects.com/
- **Web Audio API:** https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API

---

## 📋 Checklist for First-Time Setup

- [ ] Read [QUICKSTART.md](QUICKSTART.md)
- [ ] Run `python app.py`
- [ ] Open `http://localhost:5000` in browser
- [ ] Grant camera permission
- [ ] Try pressing `1` (PosturePro module)
- [ ] Try keyboard shortcut `F` (fullscreen)
- [ ] Read [MODULES.md](MODULES.md) to learn all features

---

## 🎉 You're Ready!

Start with [QUICKSTART.md](QUICKSTART.md) - you'll be up and running in 5 minutes.

**Enjoy exploring PoseAI Suite! 🦴**

---

**Last Updated:** March 2024
**Version:** 1.0.0
**Optimized For:** AMD Radeon WebGL + Windows 11
