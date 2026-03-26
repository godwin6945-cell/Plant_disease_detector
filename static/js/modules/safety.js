/* SafetyAI Module */
const safetyModule = {
    isActive:false,isMonitoring:false,incidentLog:[],lastFallAlert:0,lastBendAlert:0,
    riskFilter:null,zoneStart:null,dangerZones:[],isDrawingZone:false,

    init() {
        this.riskFilter=new Utils.SmoothingFilter(5);
        document.getElementById('safetyStartBtn').addEventListener('click',()=>this.toggleMonitoring());
        document.getElementById('safetyClearBtn').addEventListener('click',()=>this.clearLog());
        const canvas=document.getElementById('safetyCanvas');
        if(canvas){canvas.addEventListener('mousedown',e=>this._zoneDown(e));canvas.addEventListener('mouseup',e=>this._zoneUp(e));}
        this._loadIncidents();
        console.log('SafetyAI ready');
    },

    _syncCanvas() {
        const c=document.getElementById('safetyCanvas'),v=document.getElementById('webcam');
        if(!c||!v||!v.videoWidth) return;
        if(c.width!==v.videoWidth)  c.width=v.videoWidth;
        if(c.height!==v.videoHeight) c.height=v.videoHeight;
    },

    onModuleActive() { this.isActive=true; this._syncCanvas(); },
    toggleMonitoring() { this.isMonitoring?this.stopMonitoring():this.startMonitoring(); },

    startMonitoring() {
        this.isMonitoring=true; this.incidentLog=[];
        document.getElementById('safetyStartBtn').textContent='Stop Monitoring';
        document.getElementById('incidentCount').textContent='0';
    },
    stopMonitoring() {
        this.isMonitoring=false;
        document.getElementById('safetyStartBtn').textContent='Start Monitoring';
        this._renderLog();
    },

    updatePose(pose) {
        if(!this.isActive) return;
        const canvas=document.getElementById('safetyCanvas');
        if(!canvas) return;
        this._syncCanvas();
        const ctx=canvas.getContext('2d');
        const mirror=!!document.getElementById('mirrorToggle')?.checked;
        ctx.clearRect(0,0,canvas.width,canvas.height);
        if(pose){ctx.save();if(mirror){ctx.scale(-1,1);ctx.translate(-canvas.width,0);}poseEngine.drawSkeleton(canvas,[pose]);ctx.restore();}
        this._drawZones(ctx);
        if(!this.isMonitoring||!pose) return;
        const s=poseEngine.analyzeSafety(pose);
        this.riskFilter.addValue(s.riskScore);
        const rs=Math.round(this.riskFilter.getSmoothed());
        document.getElementById('safetyLevel').textContent=Math.max(0,100-rs);
        document.getElementById('riskLevel').textContent=s.riskLevel.toUpperCase();
        document.getElementById('workerCount').textContent='1';
        const ov=document.getElementById('cameraOverlay');
        if(ov) ov.classList.remove('alert-yellow','alert-red');
        const now=Date.now();
        if(s.fallDetected&&now-this.lastFallAlert>3000){
            this.lastFallAlert=now; this._log('FALL','Fall detected'); this._beep(1200);
            if(ov) ov.classList.add('alert-red'); this._badge('FALL DETECTED!');
        }
        if(s.dangerousBend&&now-this.lastBendAlert>5000){
            this.lastBendAlert=now; this._log('BEND','Unsafe bend');
            if(ov) ov.classList.add('alert-yellow'); this._badge('Unsafe Bend!');
        }
        this._checkZones(pose);
    },

    _checkZones(pose) {
        if(!pose||!this.dangerZones.length) return;
        this.dangerZones.forEach((z,i)=>{
            if(pose.keypoints.some(kp=>kp.score>0.3&&kp.x>z.x1&&kp.x<z.x2&&kp.y>z.y1&&kp.y<z.y2))
                this._log('ZONE',`Zone ${i+1} violation`);
        });
    },

    _log(type,desc) {
        const e={type,desc,time:new Date().toLocaleTimeString()};
        this.incidentLog.push(e);
        const s=JSON.parse(localStorage.getItem('safetyIncidents')||'[]');
        s.push(e); localStorage.setItem('safetyIncidents',JSON.stringify(s.slice(-100)));
        document.getElementById('incidentCount').textContent=this.incidentLog.length;
        this._renderLog();
    },

    _renderLog() {
        const el=document.getElementById('logEntries');
        if(!el) return;
        el.innerHTML=[...this.incidentLog].reverse().slice(0,20).map(e=>
            `<div class="log-entry"><span class="log-time">${e.time}</span><span class="log-type">${e.type}</span><span class="log-desc">${e.desc}</span></div>`
        ).join('');
    },

    _loadIncidents() {
        const s=localStorage.getItem('safetyIncidents');
        if(s){this.incidentLog=JSON.parse(s);document.getElementById('incidentCount').textContent=this.incidentLog.length;this._renderLog();}
    },

    clearLog() {
        if(!confirm('Clear all logs?')) return;
        this.incidentLog=[]; localStorage.removeItem('safetyIncidents');
        document.getElementById('incidentCount').textContent='0';
        this._renderLog(); window.showToast('Log cleared');
    },

    _badge(msg) {
        const list=document.getElementById('alertsList');
        if(!list) return;
        const b=document.createElement('div');b.className='hazard-badge';b.textContent=msg;
        list.prepend(b);setTimeout(()=>b.remove(),4000);
    },

    _drawZones(ctx) {
        this.dangerZones.forEach(z=>{
            ctx.strokeStyle='rgba(255,51,102,0.8)';ctx.fillStyle='rgba(255,51,102,0.1)';ctx.lineWidth=2;
            ctx.fillRect(z.x1,z.y1,z.x2-z.x1,z.y2-z.y1);ctx.strokeRect(z.x1,z.y1,z.x2-z.x1,z.y2-z.y1);
            ctx.fillStyle='#ff3366';ctx.font='bold 12px sans-serif';ctx.fillText('DANGER',z.x1+6,z.y1+18);
        });
    },

    _zoneDown(e){const r=e.target.getBoundingClientRect();this.zoneStart={x:e.clientX-r.left,y:e.clientY-r.top};this.isDrawingZone=true;},
    _zoneUp(e){
        if(!this.isDrawingZone||!this.zoneStart) return;
        const r=e.target.getBoundingClientRect(),x2=e.clientX-r.left,y2=e.clientY-r.top;
        if(Math.abs(x2-this.zoneStart.x)>20&&Math.abs(y2-this.zoneStart.y)>20)
            this.dangerZones.push({x1:Math.min(this.zoneStart.x,x2),y1:Math.min(this.zoneStart.y,y2),x2:Math.max(this.zoneStart.x,x2),y2:Math.max(this.zoneStart.y,y2)});
        this.isDrawingZone=false;this.zoneStart=null;window.showToast('Zone added');
    },

    _beep(freq=1000){
        try{const ac=new(window.AudioContext||window.webkitAudioContext)();
        [0,0.15,0.3].forEach(t=>{const o=ac.createOscillator(),g=ac.createGain();o.connect(g);g.connect(ac.destination);
        o.frequency.value=freq;o.type='square';g.gain.setValueAtTime(0.15,ac.currentTime+t);
        g.gain.exponentialRampToValueAtTime(0.01,ac.currentTime+t+0.12);o.start(ac.currentTime+t);o.stop(ac.currentTime+t+0.12);});}catch(_){}
    }
};
document.addEventListener('DOMContentLoaded',()=>safetyModule.init());
window.safetyModule=safetyModule;
