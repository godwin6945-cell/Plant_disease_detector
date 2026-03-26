/* FitAI Coach Module — Fitness + Physiotherapy + Yoga */
const fitnessModule = {
    isActive:false, isWorkingOut:false, currentExercise:null, currentCategory:'fitness',
    repCount:0, perfectReps:0, sessionStartTime:null, workoutTime:0,
    exerciseState:'rest', timerInterval:null, holdStart:null,
    angleFilter:null, formFilter:null,

    EXERCISES: {
        fitness: [
            {id:'squat',      label:'🦵 Squat'},
            {id:'bicep',      label:'💪 Bicep Curl'},
            {id:'shoulder',   label:'🙌 Shoulder Press'},
            {id:'jumping',    label:'🤸 Jumping Jack'},
            {id:'pushup',     label:'🏋️ Push Up'},
            {id:'plank',      label:'📏 Plank'},
            {id:'lunge',      label:'🦵 Lunge'},
            {id:'sideLateral',label:'↔️ Side Lateral Raise'},
            {id:'tricepDip',  label:'💪 Tricep Dip'},
            {id:'highKnees',  label:'🏃 High Knees'}
        ],
        physio: [
            {id:'neckTilt',      label:'🧠 Neck Tilt'},
            {id:'shoulderRoll',  label:'🔄 Shoulder Roll'},
            {id:'hipAbduction',  label:'🦵 Hip Abduction'},
            {id:'kneeExtension', label:'🦿 Knee Extension'},
            {id:'ankleCircle',   label:'🦶 Ankle Circle'},
            {id:'wristFlex',     label:'🤲 Wrist Flexion'},
            {id:'sideStretch',   label:'🤸 Side Stretch'},
            {id:'calfRaise',     label:'👟 Calf Raise'}
        ],
        yoga: [
            {id:'warrior',     label:'⚔️ Warrior Pose'},
            {id:'tree',        label:'🌳 Tree Pose'},
            {id:'downwardDog', label:'🐕 Downward Dog'},
            {id:'cobra',       label:'🐍 Cobra Pose'},
            {id:'chair',       label:'🪑 Chair Pose'},
            {id:'mountain',    label:'⛰️ Mountain Pose'},
            {id:'triangle',    label:'🔺 Triangle Pose'},
            {id:'bridge',      label:'🌉 Bridge Pose'}
        ]
    },

    // Hold-based exercises (no rep counting — score by hold time)
    HOLD_EXERCISES: new Set(['plank','warrior','tree','downwardDog','cobra','chair','mountain','triangle','bridge',
                             'neckTilt','shoulderRoll','ankleCircle','wristFlex','sideStretch']),

    init() {
        this.angleFilter = new Utils.SmoothingFilter(5);
        this.formFilter  = new Utils.SmoothingFilter(3);
        document.querySelectorAll('.cat-tab').forEach(t =>
            t.addEventListener('click', () => this.switchCategory(t.dataset.cat)));
        document.getElementById('fitnessStartBtn').addEventListener('click', () => this.toggleWorkout());
        document.getElementById('fitnessResetBtn').addEventListener('click', () => this.reset());
        this.switchCategory('fitness');
        console.log('FitAI ready');
    },

    _syncCanvas() {
        const c=document.getElementById('fitnessCanvas'), v=document.getElementById('webcam');
        if (!c||!v||!v.videoWidth) return;
        if (c.width  !== v.videoWidth)  c.width  = v.videoWidth;
        if (c.height !== v.videoHeight) c.height = v.videoHeight;
    },

    onModuleActive() { this.isActive=true; this._syncCanvas(); },

    switchCategory(cat) {
        this.currentCategory = cat;
        this.currentExercise = null;
        document.querySelectorAll('.cat-tab').forEach(t => t.classList.toggle('active', t.dataset.cat===cat));
        const grid = document.getElementById('exerciseGrid');
        grid.innerHTML = this.EXERCISES[cat].map(e =>
            `<button class="exercise-btn" data-exercise="${e.id}">${e.label}</button>`
        ).join('');
        grid.querySelectorAll('.exercise-btn').forEach(b =>
            b.addEventListener('click', () => this.selectExercise(b.dataset.exercise)));
        const isYogaPhysio = cat !== 'fitness';
        document.getElementById('repCounterBlock').style.display = isYogaPhysio ? 'none' : 'block';
        document.getElementById('holdTimerBlock').style.display  = isYogaPhysio ? 'block' : 'none';
    },

    selectExercise(ex) {
        this.currentExercise = ex;
        this.exerciseState   = 'rest';
        this.holdStart       = null;
        this.angleFilter.reset();
        document.querySelectorAll('.exercise-btn').forEach(b =>
            b.classList.toggle('active', b.dataset.exercise===ex));
        const isHold = this.HOLD_EXERCISES.has(ex);
        document.getElementById('repCounterBlock').style.display = isHold ? 'none' : 'block';
        document.getElementById('holdTimerBlock').style.display  = isHold ? 'block' : 'none';
    },

    toggleWorkout() { this.isWorkingOut ? this.endWorkout() : this.startWorkout(); },

    startWorkout() {
        if (!this.currentExercise) { window.showToast('Select an exercise first'); return; }
        this.isWorkingOut = true;
        this.sessionStartTime = Date.now();
        this.repCount = 0; this.perfectReps = 0;
        document.getElementById('fitnessStartBtn').textContent = 'Stop Workout';
        document.getElementById('workoutSession').style.display = 'block';
        this.timerInterval = setInterval(() => {
            this.workoutTime = Date.now() - this.sessionStartTime;
            document.getElementById('workoutDuration').textContent = Utils.formatTime(this.workoutTime);
        }, 100);
    },

    endWorkout() {
        this.isWorkingOut = false;
        clearInterval(this.timerInterval);
        document.getElementById('fitnessStartBtn').textContent = 'Start Workout';
        const pct = this.repCount > 0 ? Math.round((this.perfectReps/this.repCount)*100) : 0;
        window.showToast(`Done! ${this.repCount} reps, ${pct}% perfect`, 5000);
        fetch('/api/save_session', {method:'POST', headers:{'Content-Type':'application/json'},
            body: JSON.stringify({module:'fitness', exercise:this.currentExercise,
                category:this.currentCategory, totalReps:this.repCount,
                perfectReps:this.perfectReps, duration:this.workoutTime})
        }).catch(()=>{});
    },

    reset() {
        this.isWorkingOut = false; this.repCount = 0; this.perfectReps = 0;
        this.exerciseState = 'rest'; this.holdStart = null;
        clearInterval(this.timerInterval);
        document.getElementById('fitnessStartBtn').textContent = 'Start Workout';
        document.getElementById('repCount').textContent = '0';
        document.getElementById('formScore').textContent = '0';
        document.getElementById('holdTime').textContent = '0.0s';
        document.getElementById('workoutSession').style.display = 'none';
        const c = document.getElementById('fitnessCanvas');
        if (c) { const ctx=c.getContext('2d'); ctx.clearRect(0,0,c.width,c.height); }
    },

    updatePose(pose) {
        if (!this.isActive || !this.currentExercise) return;
        const canvas = document.getElementById('fitnessCanvas');
        if (!canvas) return;
        this._syncCanvas();
        const ctx = canvas.getContext('2d');
        const mirror = !!document.getElementById('mirrorToggle')?.checked;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (pose) {
            ctx.save();
            if (mirror) { ctx.scale(-1,1); ctx.translate(-canvas.width,0); }
            poseEngine.drawSkeleton(canvas, [pose]);
            ctx.restore();
        }
        const a = poseEngine.analyzeExercise(pose, this.currentExercise);
        if (a.angle == null) return;
        this.angleFilter.addValue(a.angle);
        const angle = Math.round(this.angleFilter.getSmoothed());
        this.formFilter.addValue(a.formScore || 0);
        const form = Math.round(this.formFilter.getSmoothed());
        document.getElementById('exerciseAngle').textContent = angle + '°';
        document.getElementById('repStatus').textContent = a.feedback || '--';
        document.getElementById('formScore').textContent = form;
        const bar = document.getElementById('formScoreBar');
        if (bar) { bar.style.width=form+'%'; bar.style.background=form>=80?'#00ff88':form>=60?'#ff6b35':'#ff3366'; }
        document.getElementById('formMessage').textContent = a.feedback || '--';
        if (this.isWorkingOut) {
            if (this.HOLD_EXERCISES.has(this.currentExercise)) {
                this._trackHold(form);
            } else {
                this._countReps(angle, a);
                document.getElementById('repCount').textContent  = this.repCount;
                document.getElementById('totalReps').textContent = this.repCount;
                document.getElementById('perfectCount').textContent = Math.round(this.perfectReps);
            }
        }
    },

    _trackHold(form) {
        if (form >= 70) {
            if (!this.holdStart) this.holdStart = Date.now();
            const secs = ((Date.now() - this.holdStart) / 1000).toFixed(1);
            document.getElementById('holdTime').textContent = secs + 's';
            document.getElementById('totalReps').textContent = secs + 's';
        } else {
            if (this.holdStart) {
                const held = (Date.now() - this.holdStart) / 1000;
                if (held >= 2) { this._beep(); window.showToast(`Held ${held.toFixed(1)}s!`, 2000); }
            }
            this.holdStart = null;
        }
    },

    _countReps(angle, a) {
        switch (this.currentExercise) {
            case 'squat':
                if (angle<90  && this.exerciseState!=='bottom') this.exerciseState='bottom';
                else if (angle>160 && this.exerciseState==='bottom') { this.exerciseState='top'; this._rep(a.formScore); } break;
            case 'bicep':
                if (angle>150 && this.exerciseState!=='bottom') this.exerciseState='bottom';
                else if (angle<50  && this.exerciseState==='bottom') { this.exerciseState='top'; this._rep(a.formScore); } break;
            case 'shoulder':
                if (angle<50  && this.exerciseState!=='bottom') this.exerciseState='bottom';
                else if (angle>80  && this.exerciseState==='bottom') { this.exerciseState='top'; this._rep(a.formScore); } break;
            case 'pushup':
                if (angle<90  && this.exerciseState!=='bottom') this.exerciseState='bottom';
                else if (angle>150 && this.exerciseState==='bottom') { this.exerciseState='top'; this._rep(a.formScore); } break;
            case 'jumping':
                if (a.feedback==='Arms Up'   && this.exerciseState!=='top')    this.exerciseState='top';
                else if (a.feedback==='Arms Down' && this.exerciseState==='top') { this.exerciseState='bottom'; this._rep(100); } break;
            case 'lunge':
                if (angle<100 && this.exerciseState!=='bottom') this.exerciseState='bottom';
                else if (angle>160 && this.exerciseState==='bottom') { this.exerciseState='top'; this._rep(a.formScore); } break;
            case 'sideLateral':
                if (a.feedback==='Down' && this.exerciseState!=='bottom') this.exerciseState='bottom';
                else if (a.feedback==='Up' && this.exerciseState==='bottom') { this.exerciseState='top'; this._rep(100); } break;
            case 'tricepDip':
                if (angle<90  && this.exerciseState!=='bottom') this.exerciseState='bottom';
                else if (angle>150 && this.exerciseState==='bottom') { this.exerciseState='top'; this._rep(a.formScore); } break;
            case 'highKnees':
                if (a.feedback==='Left Knee Up'  && this.exerciseState!=='left')  { this.exerciseState='left';  this._rep(100); }
                else if (a.feedback==='Right Knee Up' && this.exerciseState!=='right') { this.exerciseState='right'; this._rep(100); } break;
            case 'hipAbduction':
                if (angle>30  && this.exerciseState!=='top')    this.exerciseState='top';
                else if (angle<15  && this.exerciseState==='top') { this.exerciseState='bottom'; this._rep(a.formScore); } break;
            case 'kneeExtension':
                if (angle<100 && this.exerciseState!=='bottom') this.exerciseState='bottom';
                else if (angle>150 && this.exerciseState==='bottom') { this.exerciseState='top'; this._rep(a.formScore); } break;
            case 'calfRaise':
                if (angle<80  && this.exerciseState!=='top')    this.exerciseState='top';
                else if (angle>100 && this.exerciseState==='top') { this.exerciseState='bottom'; this._rep(100); } break;
        }
    },

    _rep(form) {
        this.repCount++;
        if (form >= 80) this.perfectReps++;
        this._beep();
        window.showToast(`Rep ${this.repCount}!${form>=80?' Perfect!':''}`, 1500);
    },

    _beep() {
        try {
            const ac=new(window.AudioContext||window.webkitAudioContext)();
            const o=ac.createOscillator(), g=ac.createGain();
            o.connect(g); g.connect(ac.destination);
            o.frequency.value=1000; o.type='sine';
            g.gain.setValueAtTime(0.1,ac.currentTime);
            g.gain.exponentialRampToValueAtTime(0.01,ac.currentTime+0.2);
            o.start(ac.currentTime); o.stop(ac.currentTime+0.2);
        } catch(_) {}
    }
};

document.addEventListener('DOMContentLoaded', () => fitnessModule.init());
window.fitnessModule = fitnessModule;
