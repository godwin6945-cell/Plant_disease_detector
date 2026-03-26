/* PosePlay Module - 5 Games */
const gamesModule = {
    isActive: false,
    isRunning: false,
    currentGame: null,
    score: 0,
    lives: 3,
    balloons: [],
    lasers: [],
    shadowPoses: [],
    freezeTimer: 0,
    freezeCountdown: 0,
    musicBeat: 0,
    lastPose: null,
    frozenPose: null,
    targetPose: null,
    poseMatchTimer: 0,
    _balloonInterval: null,
    _laserInterval: null,
    _shadowTimeout: null,
    _mirrorTimeout: null,

    init() {
        document.querySelectorAll('.game-btn').forEach(b=>b.addEventListener('click',()=>this.selectGame(b.dataset.game)));
        document.getElementById('gameStartBtn').addEventListener('click',()=>this.toggleGame());
        document.getElementById('gameResetBtn').addEventListener('click',()=>this.resetGame());
        this._loadLeaderboard();
        console.log('PosePlay ready - 5 games');
    },

    _syncCanvas() {
        const c=document.getElementById('gamesCanvas'),v=document.getElementById('webcam');
        if(!c||!v||!v.videoWidth) return;
        if(c.width!==v.videoWidth)  c.width=v.videoWidth;
        if(c.height!==v.videoHeight) c.height=v.videoHeight;
    },

    onModuleActive() { this.isActive=true; this._syncCanvas(); },

    selectGame(game) {
        this.currentGame=game;
        document.querySelectorAll('.game-btn').forEach(b=>b.classList.toggle('active',b.dataset.game===game));
        document.getElementById('gameMessage').textContent='Ready!';
        document.getElementById('freezeCountdownDisplay').style.display='none';
        document.getElementById('laserLivesDisplay').style.display='none';
    },

    toggleGame() { 
        if(this.isRunning) {
            this.endGame();
        } else {
            this.startGame();
        }
    },

    startGame() {
        if(!this.currentGame){
            window.showToast('Select a game first', 2000);
            return;
        }
        
        // Stop any previous game first
        if(this.isRunning) {
            this.endGame();
        }
        
        // Reset all states
        this.isRunning = true;
        this.score = 0;
        this.lives = 3;
        this.balloons = [];
        this.lasers = [];
        this.shadowPoses = [];
        this.freezeTimer = 0;
        this.freezeCountdown = 0;
        this.frozenPose = null;
        this.targetPose = null;
        this.poseMatchTimer = 0;
        
        // Update UI
        document.getElementById('gameStartBtn').textContent = '⏹ Stop Game';
        document.getElementById('gameStartBtn').classList.add('active');
        document.getElementById('gameScore').textContent = '0';
        
        // Clear canvas
        const canvas = document.getElementById('gamesCanvas');
        if(canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        
        // Start selected game
        switch(this.currentGame){
            case 'balloon': this._initBalloon(); break;
            case 'shadow':  this._initShadow();  break;
            case 'freeze':  this._initFreeze();  break;
            case 'laser':   this._initLaser();   break;
            case 'mirror':  this._initMirror();  break;
        }
        
        window.showToast(`${this.currentGame.toUpperCase()} started!`, 1500);
    },

    endGame() {
        if(!this.isRunning) return;
        
        this.isRunning = false;
        
        // Update UI
        document.getElementById('gameStartBtn').textContent = '▶ Start Game';
        document.getElementById('gameStartBtn').classList.remove('active');
        
        // Stop music
        if(window.hymnPlayer) {
            window.hymnPlayer.stop();
        }
        
        // Hide game-specific UI
        document.getElementById('freezeCountdownDisplay').style.display = 'none';
        document.getElementById('laserLivesDisplay').style.display = 'none';
        
        // Clear all intervals and timeouts
        this._clearGameIntervals();
        
        // Save score
        if(this.score > 0) {
            this._saveScore();
            window.showToast(`Game Over! Score: ${this.score}`, 2000);
        }
        
        // Clear canvas
        const canvas = document.getElementById('gamesCanvas');
        if(canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        
        // Reset message
        document.getElementById('gameMessage').textContent = 'Game ended. Select a game to play again!';
    },

    resetGame() {
        // End current game
        this.endGame();
        
        // Reset all states
        this.score = 0;
        this.lives = 3;
        this.currentGame = null;
        
        // Reset UI
        document.getElementById('gameScore').textContent = '0';
        document.getElementById('gameMessage').textContent = 'Select a game to begin';
        document.querySelectorAll('.game-btn').forEach(b => b.classList.remove('active'));
        
        // Clear canvas
        const canvas = document.getElementById('gamesCanvas');
        if(canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        
        window.showToast('Game reset', 1000);
    },
    
    _clearGameIntervals() {
        // Clear any running intervals/timeouts
        // This prevents multiple games from running simultaneously
        if(this._balloonInterval) {
            clearInterval(this._balloonInterval);
            this._balloonInterval = null;
        }
        if(this._laserInterval) {
            clearInterval(this._laserInterval);
            this._laserInterval = null;
        }
        if(this._shadowTimeout) {
            clearTimeout(this._shadowTimeout);
            this._shadowTimeout = null;
        }
        if(this._mirrorTimeout) {
            clearTimeout(this._mirrorTimeout);
            this._mirrorTimeout = null;
        }
    },

    // ── BALLOON POP ──────────────────────────────────────────────
    _initBalloon() {
        document.getElementById('gameMessage').textContent = 'Pop balloons with your hands!';
        
        // Clear any existing interval
        if(this._balloonInterval) {
            clearInterval(this._balloonInterval);
        }
        
        this._balloonInterval = setInterval(() => {
            if(!this.isRunning || this.currentGame !== 'balloon') {
                clearInterval(this._balloonInterval);
                this._balloonInterval = null;
                return;
            }
            const c = document.getElementById('gamesCanvas');
            if(!c) return;
            if(this.balloons.length < 6) {
                this.balloons.push({
                    x: 50 + Math.random() * (c.width - 100),
                    y: c.height + 50,
                    r: 30 + Math.random() * 20,
                    vy: -1.5 - Math.random() * 1.5,
                    color: [Math.random() * 255, Math.random() * 255, Math.random() * 255],
                    alive: true
                });
            }
        }, 800);
    },

    _drawBalloon(ctx,canvas) {
        this.balloons=this.balloons.filter(b=>b.alive&&b.y>-100);
        this.balloons.forEach(b=>{
            b.y+=b.vy;
            const g=ctx.createRadialGradient(b.x-b.r*0.3,b.y-b.r*0.3,0,b.x,b.y,b.r);
            g.addColorStop(0,`rgba(${b.color[0]},${b.color[1]},${b.color[2]},0.9)`);
            g.addColorStop(1,`rgba(${b.color[0]*0.5},${b.color[1]*0.5},${b.color[2]*0.5},0.7)`);
            ctx.fillStyle=g;ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,6.283);ctx.fill();
            ctx.strokeStyle='rgba(255,255,255,0.3)';ctx.lineWidth=2;ctx.stroke();
        });
    },

    _checkBalloonHits(pose) {
        if(!pose) return;
        const hands=['left_wrist','right_wrist','left_index','right_index'];
        pose.keypoints.forEach(kp=>{
            if(kp.score<0.3||!hands.includes(kp.name)) return;
            this.balloons.forEach(b=>{
                if(!b.alive) return;
                const d=Math.sqrt((kp.x-b.x)**2+(kp.y-b.y)**2);
                if(d<b.r+15){b.alive=false;this.score+=10;document.getElementById('gameScore').textContent=this.score;window.showToast('Pop! +10',600);}
            });
        });
    },

    // ── SHADOW CLONE ─────────────────────────────────────────────
    _initShadow() {
        document.getElementById('gameMessage').textContent='Match the shadow pose!';
        this._nextShadow();
    },

    _nextShadow() {
        if(!this.isRunning || this.currentGame !== 'shadow') {
            if(this._shadowTimeout) {
                clearTimeout(this._shadowTimeout);
                this._shadowTimeout = null;
            }
            return;
        }
        const poses = [
            {name:'T-Pose', check:(p)=>this._armSpread(p)>0.7},
            {name:'Hands Up', check:(p)=>this._handsAboveHead(p)},
            {name:'One Leg Stand', check:(p)=>this._oneLegUp(p)},
            {name:'Squat', check:(p)=>this._isSquat(p)},
            {name:'Arms Forward', check:(p)=>this._armsForward(p)}
        ];
        const idx = Math.floor(Math.random() * poses.length);
        this.shadowPoses = [poses[idx]];
        document.getElementById('gameMessage').textContent = `Match: ${poses[idx].name}`;
        this._shadowTimeout = setTimeout(() => this._nextShadow(), 5000);
    },

    _drawShadow(ctx,canvas,pose) {
        if(this.shadowPoses.length&&pose){
            const match=this.shadowPoses[0].check(pose);
            ctx.fillStyle=match?'rgba(0,255,136,0.15)':'rgba(255,51,102,0.1)';
            ctx.fillRect(0,0,canvas.width,canvas.height);
            if(match){this.score+=2;document.getElementById('gameScore').textContent=this.score;}
        }
    },

    _armSpread(p){const lw=Utils.getKeypointByName(p,'left_wrist'),rw=Utils.getKeypointByName(p,'right_wrist'),ls=Utils.getKeypointByName(p,'left_shoulder'),rs=Utils.getKeypointByName(p,'right_shoulder');if(!lw||!rw||!ls||!rs||lw.score<0.3||rw.score<0.3) return 0;const d=Math.abs(lw.x-rw.x),sd=Math.abs(ls.x-rs.x);return d>sd*2.5?1:0;},
    _handsAboveHead(p){const lw=Utils.getKeypointByName(p,'left_wrist'),rw=Utils.getKeypointByName(p,'right_wrist'),n=Utils.getKeypointByName(p,'nose');return lw&&rw&&n&&lw.score>0.3&&rw.score>0.3&&lw.y<n.y&&rw.y<n.y;},
    _oneLegUp(p){const la=Utils.getKeypointByName(p,'left_ankle'),ra=Utils.getKeypointByName(p,'right_ankle'),lk=Utils.getKeypointByName(p,'left_knee'),rk=Utils.getKeypointByName(p,'right_knee');if(!la||!ra||!lk||!rk) return false;return Math.abs(la.y-lk.y)<50||Math.abs(ra.y-rk.y)<50;},
    _isSquat(p){const lk=Utils.getKeypointByName(p,'left_knee'),rk=Utils.getKeypointByName(p,'right_knee'),lh=Utils.getKeypointByName(p,'left_hip'),rh=Utils.getKeypointByName(p,'right_hip');if(!lk||!rk||!lh||!rh) return false;return Math.abs(lk.y-lh.y)<100&&Math.abs(rk.y-rh.y)<100;},
    _armsForward(p){const lw=Utils.getKeypointByName(p,'left_wrist'),rw=Utils.getKeypointByName(p,'right_wrist'),le=Utils.getKeypointByName(p,'left_elbow'),re=Utils.getKeypointByName(p,'right_elbow');if(!lw||!rw||!le||!re||lw.score<0.3||rw.score<0.3) return false;return Math.abs(lw.y-le.y)<80&&Math.abs(rw.y-re.y)<80;},

    // ── FREEZE DANCE ─────────────────────────────────────────────
    _initFreeze() {
        document.getElementById('gameMessage').textContent='Dance to the music! Freeze when it stops!';
        document.getElementById('freezeCountdownDisplay').style.display='block';
        this.freezeTimer=Date.now();
        this.freezeCountdown=8+Math.random()*7;
        this._selectRandomHymn();
    },

    _selectRandomHymn() {
        if(!window.hymnPlayer) return;
        const songs = window.hymnPlayer.getSongList();
        const song = songs[Math.floor(Math.random()*songs.length)];
        window.hymnPlayer.play(song.key);
        document.getElementById('gameMessage').textContent=`Dancing to: ${song.name}`;
    },

    _updateFreeze(pose) {
        const elapsed=(Date.now()-this.freezeTimer)/1000;
        const remain=Math.max(0,this.freezeCountdown-elapsed);
        
        if(remain>0) {
            document.getElementById('freezeCountdownDisplay').textContent=`Dance! ${remain.toFixed(1)}s`;
            if(pose) this.score+=1;
            document.getElementById('gameScore').textContent=this.score;
            this.frozenPose=null;
        } else {
            document.getElementById('freezeCountdownDisplay').textContent='FREEZE!';
            if(window.hymnPlayer) window.hymnPlayer.pause();
            
            if(!this.frozenPose&&pose){
                this.frozenPose=JSON.parse(JSON.stringify(pose));
                this.score+=20;
                document.getElementById('gameScore').textContent=this.score;
            } else if(pose&&this.frozenPose){
                const moved=this._poseDistance(pose,this.frozenPose);
                if(moved>25){
                    window.showToast('You moved! -10',800);
                    this.score=Math.max(0,this.score-10);
                    document.getElementById('gameScore').textContent=this.score;
                    this._resetFreeze();
                } else {
                    this.score+=1;
                    document.getElementById('gameScore').textContent=this.score;
                }
            }
            if(elapsed>this.freezeCountdown+3) this._resetFreeze();
        }
    },

    _resetFreeze(){
        this.freezeTimer=Date.now();
        this.freezeCountdown=8+Math.random()*7;
        this.frozenPose=null;
        this._selectRandomHymn();
    },

    _poseDistance(p1,p2){let sum=0,cnt=0;p1.keypoints.forEach((k,i)=>{if(k.score>0.3&&p2.keypoints[i].score>0.3){sum+=Math.sqrt((k.x-p2.keypoints[i].x)**2+(k.y-p2.keypoints[i].y)**2);cnt++;}});return cnt?sum/cnt:0;},

    // ── LASER DODGE ──────────────────────────────────────────────
    _initLaser() {
        document.getElementById('gameMessage').textContent = 'Dodge the lasers!';
        document.getElementById('laserLivesDisplay').style.display = 'block';
        document.getElementById('laserLivesDisplay').textContent = `Lives: ${'❤️'.repeat(this.lives)}`;
        
        // Clear any existing interval
        if(this._laserInterval) {
            clearInterval(this._laserInterval);
        }
        
        this._laserInterval = setInterval(() => {
            if(!this.isRunning || this.currentGame !== 'laser' || this.lives <= 0) {
                clearInterval(this._laserInterval);
                this._laserInterval = null;
                return;
            }
            const c = document.getElementById('gamesCanvas');
            if(!c) return;
            const horiz = Math.random() > 0.5;
            this.lasers.push({
                horiz,
                x: horiz ? 0 : Math.random() * c.width,
                y: horiz ? Math.random() * c.height : 0,
                vx: horiz ? 8 : 0,
                vy: horiz ? 0 : 8,
                w: horiz ? 0 : 4,
                h: horiz ? 4 : 0,
                born: Date.now()
            });
        }, 1200);
    },

    _drawLaser(ctx,canvas) {
        const now=Date.now();
        this.lasers=this.lasers.filter(l=>now-l.born<5000);
        this.lasers.forEach(l=>{
            l.x+=l.vx;l.y+=l.vy;
            if(l.horiz){l.w=canvas.width;l.h=4;}else{l.w=4;l.h=canvas.height;}
            const g=ctx.createLinearGradient(l.x,l.y,l.x+(l.horiz?l.w:0),l.y+(l.horiz?0:l.h));
            g.addColorStop(0,'rgba(255,0,0,0)');g.addColorStop(0.5,'rgba(255,0,0,0.8)');g.addColorStop(1,'rgba(255,0,0,0)');
            ctx.fillStyle=g;ctx.fillRect(l.x,l.y,l.w,l.h);
        });
    },

    _checkLaserHits(pose) {
        if(!pose||this.lives<=0) return;
        pose.keypoints.forEach(kp=>{
            if(kp.score<0.3) return;
            this.lasers.forEach(l=>{
                if(kp.x>l.x&&kp.x<l.x+l.w&&kp.y>l.y&&kp.y<l.y+l.h){
                    this.lives--;
                    document.getElementById('laserLivesDisplay').textContent=`Lives: ${'❤️'.repeat(Math.max(0,this.lives))}`;
                    window.showToast('Hit! -1 life',800);
                    l.born=0;
                    if(this.lives<=0){this.endGame();window.showToast('Game Over!',2000);}
                }
            });
        });
        if(this.lives>0){this.score+=1;document.getElementById('gameScore').textContent=this.score;}
    },

    // ── POSE MIRROR ──────────────────────────────────────────────
    _initMirror() {
        document.getElementById('gameMessage').textContent='Match the target pose!';
        this._nextMirrorPose();
    },

    _nextMirrorPose() {
        if(!this.isRunning || this.currentGame !== 'mirror') {
            if(this._mirrorTimeout) {
                clearTimeout(this._mirrorTimeout);
                this._mirrorTimeout = null;
            }
            return;
        }
        const poses = [
            {name:'Star Jump',desc:'Arms & legs spread wide',check:(p)=>this._checkStarJump(p)},
            {name:'Warrior Pose',desc:'Lunge with arms extended',check:(p)=>this._checkWarriorPose(p)},
            {name:'Tree Pose',desc:'Stand on one leg, hands up',check:(p)=>this._checkTreePose(p)},
            {name:'T-Pose',desc:'Arms straight out to sides',check:(p)=>this._armSpread(p)>0.7},
            {name:'Hands Up High',desc:'Both hands above head',check:(p)=>this._handsAboveHead(p)},
            {name:'Touch Toes',desc:'Bend down and touch toes',check:(p)=>this._checkTouchToes(p)},
            {name:'Squat',desc:'Bend knees, sit low',check:(p)=>this._isSquat(p)},
            {name:'Superman',desc:'Arms forward, chest up',check:(p)=>this._armsForward(p)}
        ];
        const idx = Math.floor(Math.random() * poses.length);
        this.targetPose = poses[idx];
        this.poseMatchTimer = 0;
        document.getElementById('gameMessage').textContent = `Match: ${this.targetPose.name} - ${this.targetPose.desc}`;
        this._mirrorTimeout = setTimeout(() => this._nextMirrorPose(), 8000);
    },

    _drawMirror(ctx, canvas, pose) {
        if(!this.targetPose || !pose) return;
        
        const matched = this.targetPose.check(pose);
        
        // Visual feedback
        if(matched) {
            ctx.fillStyle = 'rgba(0,255,136,0.2)';
            this.poseMatchTimer++;
            if(this.poseMatchTimer > 30) { // Hold for 1 second (30 frames)
                this.score += 100;
                document.getElementById('gameScore').textContent = this.score;
                window.showToast(`Perfect! +100 points`, 1000);
                this.poseMatchTimer = 0;
                this._nextMirrorPose();
            }
        } else {
            ctx.fillStyle = 'rgba(255,99,71,0.1)';
            this.poseMatchTimer = 0;
        }
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw progress bar
        if(matched && this.poseMatchTimer > 0) {
            const progress = this.poseMatchTimer / 30;
            ctx.fillStyle = 'rgba(0,255,136,0.8)';
            ctx.fillRect(20, canvas.height - 40, (canvas.width - 40) * progress, 20);
            ctx.strokeStyle = '#00ff88';
            ctx.lineWidth = 2;
            ctx.strokeRect(20, canvas.height - 40, canvas.width - 40, 20);
        }
    },

    _checkStarJump(p) {
        const lW=Utils.getKeypointByName(p,'left_wrist'),rW=Utils.getKeypointByName(p,'right_wrist');
        const lA=Utils.getKeypointByName(p,'left_ankle'),rA=Utils.getKeypointByName(p,'right_ankle');
        const lS=Utils.getKeypointByName(p,'left_shoulder'),rS=Utils.getKeypointByName(p,'right_shoulder');
        if(!lW||!rW||!lA||!rA||!lS||!rS) return false;
        const armsWide = Math.abs(lW.x-rW.x) > Math.abs(lS.x-rS.x)*2;
        const legsWide = Math.abs(lA.x-rA.x) > 100;
        return armsWide && legsWide;
    },

    _checkWarriorPose(p) {
        const lH=Utils.getKeypointByName(p,'left_hip'),lK=Utils.getKeypointByName(p,'left_knee');
        const lW=Utils.getKeypointByName(p,'left_wrist'),rW=Utils.getKeypointByName(p,'right_wrist');
        if(!lH||!lK||!lW||!rW) return false;
        const lunge = Math.abs(lK.y-lH.y) < 80;
        const armsOut = Math.abs(lW.x-rW.x) > 200;
        return lunge && armsOut;
    },

    _checkTreePose(p) {
        const lA=Utils.getKeypointByName(p,'left_ankle'),rA=Utils.getKeypointByName(p,'right_ankle');
        const lW=Utils.getKeypointByName(p,'left_wrist'),rW=Utils.getKeypointByName(p,'right_wrist');
        const nose=Utils.getKeypointByName(p,'nose');
        if(!lA||!rA||!lW||!rW||!nose) return false;
        const oneLegUp = Math.abs(lA.y-rA.y) > 100;
        const handsUp = lW.y < nose.y && rW.y < nose.y;
        return oneLegUp && handsUp;
    },

    _checkTouchToes(p) {
        const lW=Utils.getKeypointByName(p,'left_wrist'),rW=Utils.getKeypointByName(p,'right_wrist');
        const lA=Utils.getKeypointByName(p,'left_ankle'),rA=Utils.getKeypointByName(p,'right_ankle');
        if(!lW||!rW||!lA||!rA) return false;
        const handsLow = (lW.y+rW.y)/2 > (lA.y+rA.y)/2 - 100;
        return handsLow;
    },

    // ── MAIN UPDATE ──────────────────────────────────────────────
    updatePose(pose) {
        if(!this.isActive||!this.isRunning||!this.currentGame) return;
        const canvas=document.getElementById('gamesCanvas');if(!canvas) return;
        this._syncCanvas();
        const ctx=canvas.getContext('2d');
        const mirror=!!document.getElementById('mirrorToggle')?.checked;
        ctx.clearRect(0,0,canvas.width,canvas.height);
        
        if(pose){
            ctx.save();if(mirror){ctx.scale(-1,1);ctx.translate(-canvas.width,0);}
            poseEngine.drawSkeleton(canvas,[pose]);ctx.restore();
        }

        switch(this.currentGame){
            case 'balloon': this._drawBalloon(ctx,canvas);if(pose) this._checkBalloonHits(pose); break;
            case 'shadow':  this._drawShadow(ctx,canvas,pose); break;
            case 'freeze':  this._updateFreeze(pose); break;
            case 'laser':   this._drawLaser(ctx,canvas);if(pose) this._checkLaserHits(pose); break;
            case 'mirror':  this._drawMirror(ctx,canvas,pose); break;
        }
    },

    _saveScore() {
        if(!this.currentGame) return;
        const key=`poseplay_scores_${this.currentGame}`;
        const list=JSON.parse(localStorage.getItem(key)||'[]');
        list.push({score:this.score,ts:Date.now()});
        localStorage.setItem(key,JSON.stringify(list.slice(-20)));
        fetch('/api/save_session',{method:'POST',headers:{'Content-Type':'application/json'},
            body:JSON.stringify({module:'games',game:this.currentGame,score:this.score,duration:0})
        }).catch(()=>{});
        this._loadLeaderboard();
    },

    _loadLeaderboard() {
        fetch('/api/leaderboard').then(r=>r.json()).then(data=>{
            const el=document.getElementById('leaderboardList');if(!el) return;
            if(data.length){
                el.innerHTML=data.slice(0,5).map((s,i)=>
                    `<div class="lb-entry"><span class="lb-rank">${i+1}.</span><span>${s.game||'--'}</span><span class="lb-score">${s.score}</span></div>`
                ).join('');
            } else this._loadLeaderboardLocal();
        }).catch(()=>this._loadLeaderboardLocal());
    },

    _loadLeaderboardLocal() {
        const games=['balloon','shadow','freeze','laser','mirror'];
        let all=[];
        games.forEach(g=>{const s=localStorage.getItem(`poseplay_scores_${g}`);if(s) all=all.concat(JSON.parse(s).map(x=>({...x,game:g})));});
        all.sort((a,b)=>b.score-a.score);
        const el=document.getElementById('leaderboardList');if(!el) return;
        el.innerHTML=all.slice(0,5).map((s,i)=>
            `<div class="lb-entry"><span class="lb-rank">${i+1}.</span><span>${s.game}</span><span class="lb-score">${s.score}</span></div>`
        ).join('');
    }
};
document.addEventListener('DOMContentLoaded',()=>gamesModule.init());
window.gamesModule=gamesModule;
