/* SportsVision Module */
const sportsModule = {
    isActive:false,isTesting:false,currentTest:null,personalRecords:{},
    jumpStartY:null,jumpPeakY:null,jumpInAir:false,jumpStartTime:null,
    reactionStartTime:null,reactionPending:false,prevPose:null,

    init() {
        document.querySelectorAll('.test-btn').forEach(b=>b.addEventListener('click',()=>this.selectTest(b.dataset.test)));
        document.getElementById('sportsStartBtn').addEventListener('click',()=>this.toggleTest());
        document.getElementById('sportsReplayBtn').addEventListener('click',()=>window.showToast('Replay coming soon'));
        this._loadPRs();
        console.log('SportsVision ready');
    },

    _syncCanvas() {
        const c=document.getElementById('sportsCanvas'),v=document.getElementById('webcam');
        if(!c||!v||!v.videoWidth) return;
        if(c.width!==v.videoWidth)  c.width=v.videoWidth;
        if(c.height!==v.videoHeight) c.height=v.videoHeight;
    },

    onModuleActive() { this.isActive=true; this._syncCanvas(); },

    selectTest(test) {
        this.currentTest=test;
        document.querySelectorAll('.test-btn').forEach(b=>b.classList.toggle('active',b.dataset.test===test));
        const names={jump:'Jump Height',reaction:'Reaction Time',batting:'Batting Stance',running:'Running Form'};
        const units={jump:'cm',reaction:'ms',batting:'%',running:'%'};
        document.getElementById('metricTitle').textContent=names[test]||test;
        document.getElementById('metricUnit').textContent=units[test]||'';
        document.getElementById('feedbackText').textContent='Ready to begin...';
    },

    toggleTest() { this.isTesting?this.endTest():this.startTest(); },

    startTest() {
        if(!this.currentTest){window.showToast('Select a test first');return;}
        this.isTesting=true;this.jumpStartY=null;this.jumpPeakY=null;this.jumpInAir=false;
        document.getElementById('sportsStartBtn').textContent='Stop Test';
        if(this.currentTest==='reaction') this._startReaction();
        else document.getElementById('feedbackText').textContent='Test running...';
    },

    endTest() {
        this.isTesting=false;this.reactionPending=false;
        document.getElementById('sportsStartBtn').textContent='Start Test';
    },

    updatePose(pose) {
        if(!this.isActive) return;
        const canvas=document.getElementById('sportsCanvas');
        if(!canvas) return;
        this._syncCanvas();
        const ctx=canvas.getContext('2d');
        const mirror=!!document.getElementById('mirrorToggle')?.checked;
        ctx.clearRect(0,0,canvas.width,canvas.height);
        if(pose){ctx.save();if(mirror){ctx.scale(-1,1);ctx.translate(-canvas.width,0);}poseEngine.drawSkeleton(canvas,[pose]);ctx.restore();}
        if(!this.isTesting||!pose){this.prevPose=pose;return;}
        switch(this.currentTest){
            case 'jump':     this._jump(pose);     break;
            case 'reaction': this._reaction(pose); break;
            case 'batting':  this._batting(pose);  break;
            case 'running':  this._running(pose);  break;
        }
        this.prevPose=pose;
    },

    _jump(pose) {
        const lA=Utils.getKeypointByName(pose,'left_ankle'),rA=Utils.getKeypointByName(pose,'right_ankle');
        if(!lA||!rA) return;
        const ankleY=(lA.y+rA.y)/2;
        if(!this.jumpStartY) this.jumpStartY=ankleY;
        if(ankleY<this.jumpStartY-30&&!this.jumpInAir){this.jumpInAir=true;this.jumpStartTime=Date.now();this.jumpPeakY=ankleY;}
        if(this.jumpInAir){
            if(ankleY<this.jumpPeakY) this.jumpPeakY=ankleY;
            if(ankleY>=this.jumpStartY-10){
                const cm=Math.round((this.jumpStartY-this.jumpPeakY)*0.4);
                const air=((Date.now()-this.jumpStartTime)/1000).toFixed(2);
                document.getElementById('performanceValue').textContent=cm;
                document.getElementById('feedbackText').textContent=`Jump: ${cm}cm | Air: ${air}s`;
                this._saveRecord('jump',cm);this.jumpInAir=false;this.jumpStartY=null;
            }
        }
    },

    _startReaction() {
        this.reactionPending=false;
        document.getElementById('feedbackText').textContent='Get ready...';
        document.getElementById('feedbackText').style.color='';
        setTimeout(()=>{
            if(!this.isTesting) return;
            this.reactionStartTime=Date.now();this.reactionPending=true;
            document.getElementById('feedbackText').textContent='MOVE NOW!';
            document.getElementById('feedbackText').style.color='#ff3366';
        },1500+Math.random()*3000);
    },

    _reaction(pose) {
        if(!this.reactionPending||!this.reactionStartTime||!this.prevPose) return;
        if(poseEngine.detectMovement(pose,this.prevPose)){
            const rt=Date.now()-this.reactionStartTime;
            document.getElementById('performanceValue').textContent=rt;
            document.getElementById('feedbackText').textContent=`Reaction: ${rt}ms`;
            document.getElementById('feedbackText').style.color='';
            this._saveRecord('reaction',rt);this.reactionPending=false;
            setTimeout(()=>{if(this.isTesting) this._startReaction();},2000);
        }
    },

    _batting(pose) {
        const lA=Utils.getKeypointByName(pose,'left_ankle'),rA=Utils.getKeypointByName(pose,'right_ankle');
        const lS=Utils.getKeypointByName(pose,'left_shoulder'),rS=Utils.getKeypointByName(pose,'right_shoulder');
        const nose=Utils.getKeypointByName(pose,'nose');
        if(!lA||!rA||!lS||!rS) return;
        const stance=Math.abs(lA.x-rA.x),shoulder=Math.abs(lS.x-rS.x);
        let score=100,fb='';
        if(stance<shoulder*0.8){score-=20;fb='Widen stance';}
        else if(stance>shoulder*1.6){score-=10;fb='Feet too wide';}
        else fb='Good stance';
        if(nose&&lS&&nose.x<lS.x-20){score-=15;fb+=' | Face bowler';}
        score=Math.max(0,score);
        document.getElementById('performanceValue').textContent=score;
        document.getElementById('feedbackText').textContent=fb;
        this._saveRecord('batting',score);
    },

    _running(pose) {
        const lE=Utils.getKeypointByName(pose,'left_elbow'),rE=Utils.getKeypointByName(pose,'right_elbow');
        const lS=Utils.getKeypointByName(pose,'left_shoulder'),rS=Utils.getKeypointByName(pose,'right_shoulder');
        if(!lE||!rE||!lS||!rS) return;
        const sym=Math.max(0,Math.round(100-Math.abs(Math.abs(lE.y-lS.y)-Math.abs(rE.y-rS.y))));
        document.getElementById('performanceValue').textContent=sym;
        document.getElementById('feedbackText').textContent=`Arm symmetry: ${sym}%`;
        this._saveRecord('running',sym);
    },

    _saveRecord(test,value) {
        const prev=this.personalRecords[test];
        const better=test==='reaction'?(!prev||value<prev):(!prev||value>prev);
        if(better){this.personalRecords[test]=value;localStorage.setItem(`sportsVision_pr_${test}`,value);window.showToast(`New record: ${test}!`);}
        this._renderPRs();
        fetch('/api/save_session',{method:'POST',headers:{'Content-Type':'application/json'},
            body:JSON.stringify({module:'sports',test,value,duration:0})}).catch(()=>{});
    },

    _loadPRs() {
        ['jump','reaction','batting','running'].forEach(t=>{const v=localStorage.getItem(`sportsVision_pr_${t}`);if(v) this.personalRecords[t]=parseFloat(v);});
        this._renderPRs();
    },

    _renderPRs() {
        const el=document.getElementById('prList');
        if(!el) return;
        const names={jump:'Jump',reaction:'Reaction',batting:'Batting',running:'Running'};
        const units={jump:'cm',reaction:'ms',batting:'%',running:'%'};
        el.innerHTML=Object.entries(this.personalRecords).map(([t,v])=>
            `<div class="pr-item"><span>${names[t]||t}</span><span class="pr-value">${v} ${units[t]||''}</span></div>`
        ).join('');
    }
};
document.addEventListener('DOMContentLoaded',()=>sportsModule.init());
window.sportsModule=sportsModule;
