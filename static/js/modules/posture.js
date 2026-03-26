/* PosturePro Module */
const postureModule = {
    isActive:false,isMonitoring:false,sessionStartTime:null,lastBadPostureTime:null,
    badPostureDuration:0,sessionTime:0,goodPostureTime:0,totalPostureScores:[],
    alerts:[],timerInterval:null,scoreFilter:null,neckFilter:null,spineFilter:null,tiltFilter:null,

    init() {
        this.scoreFilter=new Utils.SmoothingFilter(8); this.neckFilter=new Utils.SmoothingFilter(8);
        this.spineFilter=new Utils.SmoothingFilter(8); this.tiltFilter=new Utils.SmoothingFilter(8);
        document.getElementById('postureStartBtn').addEventListener('click',()=>this.toggleSession());
        document.getElementById('postureResetBtn').addEventListener('click',()=>this.reset());
        console.log('PosturePro ready');
    },

    _syncCanvas() {
        const c=document.getElementById('postureCanvas'),v=document.getElementById('webcam');
        if (!c||!v||!v.videoWidth) return;
        if (c.width!==v.videoWidth)  c.width=v.videoWidth;
        if (c.height!==v.videoHeight) c.height=v.videoHeight;
    },

    onModuleActive() { this.isActive=true; this._syncCanvas(); },
    toggleSession()  { this.isMonitoring?this.endSession():this.startSession(); },

    startSession() {
        this.isMonitoring=true; this.sessionStartTime=Date.now();
        this.goodPostureTime=0; this.totalPostureScores=[]; this.alerts=[];
        this.badPostureDuration=0; this.lastBadPostureTime=null;
        document.getElementById('postureStartBtn').textContent='Stop Session';
        document.getElementById('postureTimer').style.display='block';
        document.getElementById('postureStats').style.display='none';
        this.timerInterval=setInterval(()=>{
            this.sessionTime=Date.now()-this.sessionStartTime;
            document.getElementById('timerDisplay').textContent=Utils.formatTime(this.sessionTime);
        },100);
    },

    endSession() {
        this.isMonitoring=false; clearInterval(this.timerInterval);
        document.getElementById('postureStartBtn').textContent='Start Session';
        document.getElementById('postureTimer').style.display='none';
        document.getElementById('postureStats').style.display='block';
        const goodPct=this.sessionTime>0?Math.round((this.goodPostureTime/this.sessionTime)*100):0;
        const avg=this.totalPostureScores.length>0?Math.round(Utils.getAverage(this.totalPostureScores)):0;
        document.getElementById('goodPosturePercent').textContent=goodPct;
        document.getElementById('alertCount').textContent=this.alerts.length;
        document.getElementById('sessionDuration').textContent=Utils.formatTime(this.sessionTime);
        fetch('/api/save_session',{method:'POST',headers:{'Content-Type':'application/json'},
            body:JSON.stringify({module:'posture',duration:this.sessionTime,goodPosturePercent:goodPct,averageScore:avg,alertCount:this.alerts.length})
        }).catch(()=>{});
    },

    reset() {
        this.isMonitoring=false; clearInterval(this.timerInterval);
        this.sessionStartTime=null; this.goodPostureTime=0; this.totalPostureScores=[];
        this.alerts=[]; this.badPostureDuration=0; this.lastBadPostureTime=null;
        document.getElementById('postureStartBtn').textContent='Start Session';
        document.getElementById('postureTimer').style.display='none';
        document.getElementById('postureStats').style.display='none';
        document.getElementById('postureScore').textContent='0';
        const c=document.getElementById('postureCanvas');
        if(c){const ctx=c.getContext('2d');ctx.clearRect(0,0,c.width,c.height);}
    },

    updatePose(pose) {
        if (!this.isActive) return;
        const canvas=document.getElementById('postureCanvas');
        if (!canvas) return;
        this._syncCanvas();
        const ctx=canvas.getContext('2d');
        const mirror=!!document.getElementById('mirrorToggle')?.checked;
        ctx.clearRect(0,0,canvas.width,canvas.height);
        if (pose) {
            ctx.save();
            if (mirror){ctx.scale(-1,1);ctx.translate(-canvas.width,0);}
            poseEngine.drawSkeleton(canvas,[pose]);
            ctx.restore();
        }
        
        console.log('\n=== POSTURE MODULE UPDATE ===');
        const a=poseEngine.analyzePosture(pose);
        console.log('Received from analyzePosture:', a);
        
        this.scoreFilter.addValue(a.score||0);
        const score=Math.round(this.scoreFilter.getSmoothed());
        
        // Add values to filters
        if (a.neckAngle!=null) {
            this.neckFilter.addValue(a.neckAngle);
            console.log('✅ Added neck angle to filter:', a.neckAngle);
        } else {
            console.log('❌ Neck angle is null');
        }
        
        if (a.spineAngle!=null) {
            this.spineFilter.addValue(a.spineAngle);
            console.log('✅ Added spine angle to filter:', a.spineAngle);
        } else {
            console.log('❌ Spine angle is null');
        }
        
        if (a.shoulderTilt!=null) {
            this.tiltFilter.addValue(a.shoulderTilt);
            console.log('✅ Added shoulder tilt to filter:', a.shoulderTilt);
        } else {
            console.log('❌ Shoulder tilt is null');
        }
        
        // Update display
        document.getElementById('postureScore').textContent=score;
        
        const neckDisplay = a.neckAngle!=null ? this.neckFilter.getSmoothed().toFixed(1)+'\u00b0' : '--';
        const spineDisplay = a.spineAngle!=null ? this.spineFilter.getSmoothed().toFixed(1)+'\u00b0' : '--';
        const shoulderDisplay = a.shoulderTilt!=null ? this.tiltFilter.getSmoothed().toFixed(1)+'px' : '--';
        
        console.log('Display values:', { neckDisplay, spineDisplay, shoulderDisplay });
        
        document.getElementById('neckAngle').textContent=neckDisplay;
        document.getElementById('spineAngle').textContent=spineDisplay;
        document.getElementById('shoulderTilt').textContent=shoulderDisplay;
        
        console.log('=== END POSTURE UPDATE ===\n');
        
        const ring=document.getElementById('gaugeRing');
        if(ring) ring.style.setProperty('--score',`${score}%`);
        const sm={good:'Excellent Posture',warning:'Posture Needs Attention',bad:'Poor Posture',unknown:'Detecting...'};
        document.getElementById('postureStatus').innerHTML=`<div class="status-indicator ${a.status}"></div> ${sm[a.status]||'Detecting...'}`;
        const ov=document.getElementById('cameraOverlay');
        if(ov){ov.classList.remove('alert-yellow','alert-red');if(a.status==='warning')ov.classList.add('alert-yellow');else if(a.status==='bad')ov.classList.add('alert-red');}
        const tEl=document.getElementById('tipsContainer');
        if(tEl) tEl.innerHTML=this._tips(a).map(t=>`<li>${t}</li>`).join('');
        if(this.isMonitoring&&pose){
            this.totalPostureScores.push(score);
            if(score>=92){this.goodPostureTime+=33;this.lastBadPostureTime=null;this.badPostureDuration=0;}
            else if(score<78){
                if(!this.lastBadPostureTime) this.lastBadPostureTime=Date.now();
                this.badPostureDuration=Date.now()-this.lastBadPostureTime;
                if(this.badPostureDuration>8000){
                    const key='bad-'+Math.floor(Date.now()/12000);
                    if(!this.alerts.includes(key)){this.alerts.push(key);this._beep();window.showToast('Poor posture detected!',3000);}
                }
            }
        }
    },

    _tips(a){
        const t=[];
        if(a.neckAngle!=null) {
            const neckDev = Math.abs(a.neckAngle - 90);
            if(neckDev > 10) t.push('⚠️ Neck: Align head directly over shoulders');
            else if(neckDev > 5) t.push('⚡ Neck: Minor forward tilt detected');
            else if(neckDev > 2) t.push('✅ Neck: Good alignment');
            else t.push('✅ Neck: Perfect alignment!');
        }
        if(a.shoulderTilt!=null) {
            if(a.shoulderTilt > 12) t.push('⚠️ Shoulders: Level them evenly');
            else if(a.shoulderTilt > 6) t.push('⚡ Shoulders: Nearly level');
            else if(a.shoulderTilt > 3) t.push('✅ Shoulders: Good');
            else t.push('✅ Shoulders: Perfect level!');
        }
        if(a.spineAngle!=null) {
            const spineDev = Math.abs(a.spineAngle - 90);
            if(spineDev > 8) t.push('⚠️ Spine: Straighten your back');
            else if(spineDev > 4) t.push('⚡ Spine: Good, minor adjustment');
            else if(spineDev > 1.5) t.push('✅ Spine: Excellent');
            else t.push('✅ Spine: Perfect vertical!');
        }
        if(a.hipAlignment!=null) {
            if(a.hipAlignment > 12) t.push('⚠️ Hips: Uneven - adjust seating');
            else if(a.hipAlignment < 2) t.push('✅ Hips: Perfect alignment!');
        }
        
        if(a.score >= 92) t.push('🌟 Outstanding professional posture!');
        else if(a.score >= 85) t.push('💚 Excellent posture!');
        else if(a.score < 78) t.push('🔴 Focus on corrections above');
        return t.slice(0,5);
    },

    _beep(){
        try{const ac=new(window.AudioContext||window.webkitAudioContext)();const o=ac.createOscillator(),g=ac.createGain();
        o.connect(g);g.connect(ac.destination);o.frequency.value=800;o.type='sine';
        g.gain.setValueAtTime(0.3,ac.currentTime);g.gain.exponentialRampToValueAtTime(0.01,ac.currentTime+0.5);
        o.start(ac.currentTime);o.stop(ac.currentTime+0.5);}catch(_){}
    }
};
document.addEventListener('DOMContentLoaded',()=>postureModule.init());
window.postureModule=postureModule;
