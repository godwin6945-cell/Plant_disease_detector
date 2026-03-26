/* PoseAI Suite — Pose Engine (MediaPipe Lite, high-FPS) */
'use strict';

const MP_TO_MOVENET = [0,2,5,7,8,11,12,13,14,15,16,23,24,25,26,27,28];

class PoseEngine {
    constructor() {
        this.pose            = null;
        this.isInitialized   = false;
        this.minConfidence   = 0.3;
        this.skeletonStyle   = 'neon';
        this.lastInferenceTime = 0;
        this.currentKeypoints  = null;
        this._video          = null;
        this._onResults      = null;
        this._running        = false;
        this._t0             = 0;
    }

    async init(videoElement, onResults) {
        this._video     = videoElement;
        this._onResults = onResults;

        this.pose = new Pose({
            locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/${f}`
        });

        this.pose.setOptions({
            modelComplexity:        1,      // Full model for accuracy
            smoothLandmarks:        true,
            enableSegmentation:     false,
            smoothSegmentation:     false,
            minDetectionConfidence: 0.7,    // Higher confidence
            minTrackingConfidence:  0.7     // Smoother tracking
        });

        this.pose.onResults(r => {
            this.lastInferenceTime = performance.now() - this._t0;
            this.currentKeypoints  = this._convert(r);
            const el = document.getElementById('inferenceTime');
            if (el) el.textContent = this.lastInferenceTime.toFixed(0) + ' ms';
            if (this._onResults) this._onResults(this.currentKeypoints);
        });

        // Use rAF loop — NO Camera utility, avoids double-stream conflict
        this._running = true;
        this._loop();
        this.isInitialized = true;
        console.log('PoseEngine ready (Lite, rAF loop)');
        return true;
    }

    _loop() {
        if (!this._running) return;
        
        // Use mobile webcam canvas if connected, otherwise use video element
        const source = (window.mobileWebcam && window.mobileWebcam.isConnected) 
            ? window.mobileWebcam.getCanvas() 
            : this._video;
        
        if (source && (source.readyState >= 2 || source.width > 0)) {
            this._t0 = performance.now();
            this.pose.send({ image: source })
                .then(() => requestAnimationFrame(() => this._loop()))
                .catch(() => requestAnimationFrame(() => this._loop()));
        } else {
            requestAnimationFrame(() => this._loop());
        }
    }

    stop() { this._running = false; }

    _convert(results) {
        if (!results.poseLandmarks) return null;
        const lm = results.poseLandmarks;
        
        // Get dimensions from mobile canvas or video
        let W, H;
        if (window.mobileWebcam && window.mobileWebcam.isConnected) {
            const canvas = window.mobileWebcam.getCanvas();
            W = canvas.width || 640;
            H = canvas.height || 480;
        } else {
            W = this._video.videoWidth || 640;
            H = this._video.videoHeight || 480;
        }
        
        return {
            score: 1.0,
            keypoints: MP_TO_MOVENET.map((mpIdx, i) => {
                const p = lm[mpIdx];
                return { x: p.x * W, y: p.y * H, score: p.visibility ?? 0.9, name: Utils.KEYPOINT_NAMES[i] };
            })
        };
    }

    /* drawSkeleton — no shadowBlur, single ctx.save/restore, correct scaling */
    drawSkeleton(canvas, poses) {
        if (!canvas || !poses || !poses.length) return;
        const ctx  = canvas.getContext('2d');
        
        // Get source dimensions from mobile canvas or video
        let srcW, srcH;
        if (window.mobileWebcam && window.mobileWebcam.isConnected) {
            const mobileCanvas = window.mobileWebcam.getCanvas();
            srcW = mobileCanvas.width || 640;
            srcH = mobileCanvas.height || 480;
        } else {
            srcW = this._video ? (this._video.videoWidth || 640) : 640;
            srcH = this._video ? (this._video.videoHeight || 480) : 480;
        }
        
        const sx   = canvas.width  / srcW;
        const sy   = canvas.height / srcH;

        poses.forEach(pose => {
            if (!pose || !pose.keypoints) return;
            const kps = pose.keypoints.map(kp => ({ ...kp, x: kp.x * sx, y: kp.y * sy }));

            // Lines
            ctx.lineWidth = 2;
            ctx.lineCap   = 'round';
            Utils.SKELETON_CONNECTIONS.forEach(([nA, nB]) => {
                const iA = Utils.KEYPOINT_INDEX[nA], iB = Utils.KEYPOINT_INDEX[nB];
                const pA = kps[iA], pB = kps[iB];
                if (!pA || !pB || pA.score < this.minConfidence || pB.score < this.minConfidence) return;
                const c = Utils.getPartColor(nA, this.skeletonStyle);
                ctx.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},0.9)`;
                ctx.beginPath(); ctx.moveTo(pA.x, pA.y); ctx.lineTo(pB.x, pB.y); ctx.stroke();
            });

            // Dots
            kps.forEach((pt, i) => {
                if (pt.score < this.minConfidence) return;
                const c = Utils.getPartColor(Utils.KEYPOINT_NAMES[i], this.skeletonStyle);
                ctx.fillStyle = `rgb(${c[0]},${c[1]},${c[2]})`;
                ctx.beginPath(); ctx.arc(pt.x, pt.y, 5, 0, 6.283); ctx.fill();
            });
        });
    }

    setStyle(s)      { this.skeletonStyle = s; }
    setConfidence(c) { this.minConfidence = c; }
    getKeypoint(pose, name) { return Utils.getKeypointByName(pose, name); }

    // ── Posture ───────────────────────────────────────────────────────
    analyzePosture(pose) {
        const r = { neckAngle:null, spineAngle:null, shoulderTilt:null, hipAlignment:null, score:0, status:'unknown' };
        if (!pose || !pose.keypoints) {
            console.log('❌ No pose or keypoints');
            return r;
        }
        
        const minConf = 0.2;  // Very low threshold
        const lE=this.getKeypoint(pose,'left_ear'), rE=this.getKeypoint(pose,'right_ear');
        const lS=this.getKeypoint(pose,'left_shoulder'), rS=this.getKeypoint(pose,'right_shoulder');
        const lH=this.getKeypoint(pose,'left_hip'), rH=this.getKeypoint(pose,'right_hip');
        const nose=this.getKeypoint(pose,'nose');
        
        // Log all keypoints
        console.log('🔍 Keypoints detected:', {
            lS: lS ? `(${lS.x.toFixed(0)}, ${lS.y.toFixed(0)}) score:${lS.score.toFixed(2)}` : 'MISSING',
            rS: rS ? `(${rS.x.toFixed(0)}, ${rS.y.toFixed(0)}) score:${rS.score.toFixed(2)}` : 'MISSING',
            lH: lH ? `(${lH.x.toFixed(0)}, ${lH.y.toFixed(0)}) score:${lH.score.toFixed(2)}` : 'MISSING',
            rH: rH ? `(${rH.x.toFixed(0)}, ${rH.y.toFixed(0)}) score:${rH.score.toFixed(2)}` : 'MISSING'
        });
        
        // Neck angle calculation
        if (lE&&rE&&lS&&rS&&nose) {
            const earMid = Utils.getMidpoint(lE, rE);
            const shoulderMid = Utils.getMidpoint(lS, rS);
            const horizontalOffset = Math.abs(earMid.x - shoulderMid.x);
            const verticalDist = Math.abs(earMid.y - shoulderMid.y);
            const noseOffset = Math.abs(nose.x - shoulderMid.x);
            const avgOffset = (horizontalOffset * 0.7 + noseOffset * 0.3);
            if (verticalDist > 10) {
                r.neckAngle = 90 - Math.atan2(avgOffset, verticalDist) * (180/Math.PI);
                console.log('✅ Neck angle:', r.neckAngle.toFixed(1));
            }
        }
        
        // FORCE CALCULATE spine angle and shoulder tilt if keypoints exist
        if (lS && rS && lH && rH) {
            console.log('✅ All 4 keypoints exist');
            
            const sM = Utils.getMidpoint(lS, rS);
            const hM = Utils.getMidpoint(lH, rH);
            const dx = Math.abs(sM.x - hM.x);
            const dy = Math.abs(sM.y - hM.y);
            
            console.log('📐 Distances:', { dx: dx.toFixed(1), dy: dy.toFixed(1) });
            
            // ALWAYS calculate spine angle if dy > 10 (very low threshold)
            if (dy > 10) {
                r.spineAngle = 90 - Math.atan2(dx, dy) * (180/Math.PI);
                console.log('✅ Spine angle calculated:', r.spineAngle.toFixed(1) + '°');
            } else {
                console.log('⚠️ dy too small for spine angle:', dy);
                // Force a default value
                r.spineAngle = 90;
            }
            
            // ALWAYS calculate shoulder tilt
            r.shoulderTilt = Math.abs(lS.y - rS.y);
            console.log('✅ Shoulder tilt calculated:', r.shoulderTilt.toFixed(1) + 'px');
            
            // ALWAYS calculate hip alignment
            r.hipAlignment = Math.abs(lH.y - rH.y);
            console.log('✅ Hip alignment calculated:', r.hipAlignment.toFixed(1) + 'px');
        } else {
            console.log('❌ Missing keypoints for spine/shoulder calculation:', {
                lS: !!lS, rS: !!rS, lH: !!lH, rH: !!rH
            });
        }
        
        // Log final result
        console.log('📊 Final posture result:', {
            neckAngle: r.neckAngle ? r.neckAngle.toFixed(1) + '°' : 'null',
            spineAngle: r.spineAngle ? r.spineAngle.toFixed(1) + '°' : 'null',
            shoulderTilt: r.shoulderTilt ? r.shoulderTilt.toFixed(1) + 'px' : 'null',
            hipAlignment: r.hipAlignment ? r.hipAlignment.toFixed(1) + 'px' : 'null'
        });
        
        // Calculate score
        let sc = 100;
        if (r.neckAngle != null) {
            const neckDev = Math.abs(r.neckAngle - 90);
            if (neckDev > 18) sc -= 40; else if (neckDev > 10) sc -= 28;
            else if (neckDev > 5) sc -= 15; else if (neckDev > 2) sc -= 6; else sc += 3;
        }
        if (r.shoulderTilt != null) {
            if (r.shoulderTilt > 20) sc -= 35; else if (r.shoulderTilt > 12) sc -= 22;
            else if (r.shoulderTilt > 6) sc -= 12; else if (r.shoulderTilt > 3) sc -= 4; else sc += 3;
        }
        if (r.spineAngle != null) {
            const spineDev = Math.abs(r.spineAngle - 90);
            if (spineDev > 12) sc -= 40; else if (spineDev > 8) sc -= 28;
            else if (spineDev > 4) sc -= 15; else if (spineDev > 1.5) sc -= 6; else sc += 4;
        }
        if (r.hipAlignment != null) {
            if (r.hipAlignment > 12) sc -= 18; else if (r.hipAlignment > 6) sc -= 10;
            else if (r.hipAlignment < 2) sc += 4;
        }
        r.score = Math.max(0, Math.min(100, Math.round(sc)));
        r.status = r.score >= 92 ? 'good' : r.score >= 78 ? 'warning' : 'bad';
        return r;
    }

    // ── Exercise ──────────────────────────────────────────────────────
    analyzeExercise(pose, type) {
        if (!pose) return {angle:null,rep:false,formScore:0,feedback:''};
        const m = {
            // Fitness
            squat:()=>this._squat(pose), bicep:()=>this._bicep(pose),
            shoulder:()=>this._shoulder(pose), jumping:()=>this._jumping(pose),
            pushup:()=>this._pushup(pose), plank:()=>this._plank(pose),
            lunge:()=>this._lunge(pose), sideLateral:()=>this._sideLateral(pose),
            tricepDip:()=>this._tricepDip(pose), highKnees:()=>this._highKnees(pose),
            // Physiotherapy
            neckTilt:()=>this._neckTilt(pose), shoulderRoll:()=>this._shoulderRoll(pose),
            hipAbduction:()=>this._hipAbduction(pose), kneeExtension:()=>this._kneeExtension(pose),
            ankleCircle:()=>this._ankleCircle(pose), wristFlex:()=>this._wristFlex(pose),
            sideStretch:()=>this._sideStretch(pose), calfRaise:()=>this._calfRaise(pose),
            // Yoga
            warrior:()=>this._warrior(pose), tree:()=>this._tree(pose),
            downwardDog:()=>this._downwardDog(pose), cobra:()=>this._cobra(pose),
            chair:()=>this._chair(pose), mountain:()=>this._mountain(pose),
            triangle:()=>this._triangle(pose), bridge:()=>this._bridge(pose)
        };
        return (m[type]||(() => ({angle:null,rep:false,formScore:0,feedback:''})))();
    }
    _squat(p) {
        const lH=this.getKeypoint(p,'left_hip'),lK=this.getKeypoint(p,'left_knee'),lA=this.getKeypoint(p,'left_ankle');
        const rH=this.getKeypoint(p,'right_hip'),rK=this.getKeypoint(p,'right_knee');
        if (!lH||!lK||!lA) return {angle:null,rep:false,formScore:0,feedback:''};
        const angle=Utils.getAngle(lH,lK,lA);
        return {angle,rep:false,formScore:(rK&&rH&&Math.abs(lK.x-rK.x)>=Math.abs(lH.x-rH.x)*0.9)?100:70,feedback:angle<90?'Down':'Up'};
    }
    _bicep(p) {
        const lS=this.getKeypoint(p,'left_shoulder'),lE=this.getKeypoint(p,'left_elbow'),lW=this.getKeypoint(p,'left_wrist');
        if (!lS||!lE||!lW) return {angle:null,rep:false,formScore:0,feedback:''};
        const angle=Utils.getAngle(lS,lE,lW);
        return {angle,rep:false,formScore:100,feedback:angle>150?'Down':angle<50?'Up':'Mid'};
    }
    _shoulder(p) {
        const lS=this.getKeypoint(p,'left_shoulder'),lW=this.getKeypoint(p,'left_wrist');
        if (!lS||!lW) return {angle:null,rep:false,formScore:0,feedback:''};
        return {angle:Utils.getDistance(lW,lS),rep:false,formScore:100,feedback:lW.y<lS.y-50?'Up':'Down'};
    }
    _jumping(p) {
        const lW=this.getKeypoint(p,'left_wrist'),rW=this.getKeypoint(p,'right_wrist'),nose=this.getKeypoint(p,'nose');
        const lH=this.getKeypoint(p,'left_hip'),rH=this.getKeypoint(p,'right_hip');
        if (!lW||!rW||!nose) return {angle:null,rep:false,formScore:0,feedback:''};
        return {angle:(lH&&rH)?Math.abs(lH.x-rH.x):0,rep:false,formScore:100,feedback:(lW.y<nose.y&&rW.y<nose.y)?'Arms Up':'Arms Down'};
    }
    _pushup(p) {
        const lS=this.getKeypoint(p,'left_shoulder'),lE=this.getKeypoint(p,'left_elbow'),lW=this.getKeypoint(p,'left_wrist');
        if (!lS||!lE||!lW) return {angle:null,rep:false,formScore:0,feedback:''};
        const angle=Utils.getAngle(lS,lE,lW);
        return {angle,rep:false,formScore:100,feedback:angle<90?'Down':'Up'};
    }
    _plank(p) {
        const lS=this.getKeypoint(p,'left_shoulder'),rS=this.getKeypoint(p,'right_shoulder');
        const lH=this.getKeypoint(p,'left_hip'),rH=this.getKeypoint(p,'right_hip');
        if (!lS||!rS||!lH||!rH) return {angle:null,rep:false,formScore:0,feedback:''};
        const diff=Math.abs((lS.y+rS.y)/2-(lH.y+rH.y)/2);
        return {angle:diff,rep:false,formScore:diff<100?100:60,feedback:diff<100?'Good Plank':'Sagging'};
    }
    _lunge(p) {
        const lH=this.getKeypoint(p,'left_hip'),lK=this.getKeypoint(p,'left_knee'),lA=this.getKeypoint(p,'left_ankle');
        if (!lH||!lK||!lA) return {angle:null,rep:false,formScore:0,feedback:''};
        const angle=Utils.getAngle(lH,lK,lA);
        return {angle,rep:false,formScore:angle<100?100:70,feedback:angle<100?'Down':'Up'};
    }
    _sideLateral(p) {
        const lS=this.getKeypoint(p,'left_shoulder'),lE=this.getKeypoint(p,'left_elbow'),lW=this.getKeypoint(p,'left_wrist');
        if (!lS||!lE||!lW) return {angle:null,rep:false,formScore:0,feedback:''};
        const angle=Utils.getAngle(lS,lE,lW);
        return {angle,rep:false,formScore:100,feedback:lW.y<lS.y?'Up':'Down'};
    }
    _tricepDip(p) {
        const lS=this.getKeypoint(p,'left_shoulder'),lE=this.getKeypoint(p,'left_elbow'),lW=this.getKeypoint(p,'left_wrist');
        if (!lS||!lE||!lW) return {angle:null,rep:false,formScore:0,feedback:''};
        const angle=Utils.getAngle(lS,lE,lW);
        return {angle,rep:false,formScore:100,feedback:angle<90?'Down':'Up'};
    }
    _highKnees(p) {
        const lH=this.getKeypoint(p,'left_hip'),lK=this.getKeypoint(p,'left_knee');
        const rH=this.getKeypoint(p,'right_hip'),rK=this.getKeypoint(p,'right_knee');
        if (!lH||!lK||!rH||!rK) return {angle:null,rep:false,formScore:0,feedback:''};
        const leftUp=lK.y<lH.y-30, rightUp=rK.y<rH.y-30;
        return {angle:Math.abs(lK.y-lH.y),rep:false,formScore:100,feedback:leftUp?'Left Knee Up':rightUp?'Right Knee Up':'Lift Knees'};
    }
    // ── Physiotherapy ─────────────────────────────────────────────────
    _neckTilt(p) {
        const nose=this.getKeypoint(p,'nose'),lS=this.getKeypoint(p,'left_shoulder'),rS=this.getKeypoint(p,'right_shoulder');
        if (!nose||!lS||!rS) return {angle:null,rep:false,formScore:0,feedback:''};
        const sM=Utils.getMidpoint(lS,rS);
        const angle=Utils.getAngle(sM,nose,{x:sM.x,y:sM.y-100});
        return {angle,rep:false,formScore:angle<30?100:70,feedback:angle>20?'Tilt Head':'Center'};
    }
    _shoulderRoll(p) {
        const lS=this.getKeypoint(p,'left_shoulder'),rS=this.getKeypoint(p,'right_shoulder');
        if (!lS||!rS) return {angle:null,rep:false,formScore:0,feedback:''};
        const tilt=Math.abs(lS.y-rS.y);
        return {angle:tilt,rep:false,formScore:tilt>20?100:60,feedback:tilt>20?'Rolling':'Level Shoulders'};
    }
    _hipAbduction(p) {
        const lH=this.getKeypoint(p,'left_hip'),lK=this.getKeypoint(p,'left_knee'),rH=this.getKeypoint(p,'right_hip');
        if (!lH||!lK||!rH) return {angle:null,rep:false,formScore:0,feedback:''};
        const angle=Utils.getAngle(rH,lH,lK);
        return {angle,rep:false,formScore:angle>30?100:70,feedback:angle>30?'Leg Out':'Lift Leg Out'};
    }
    _kneeExtension(p) {
        const lH=this.getKeypoint(p,'left_hip'),lK=this.getKeypoint(p,'left_knee'),lA=this.getKeypoint(p,'left_ankle');
        if (!lH||!lK||!lA) return {angle:null,rep:false,formScore:0,feedback:''};
        const angle=Utils.getAngle(lH,lK,lA);
        return {angle,rep:false,formScore:100,feedback:angle>150?'Extended':'Extend Knee'};
    }
    _ankleCircle(p) {
        const lK=this.getKeypoint(p,'left_knee'),lA=this.getKeypoint(p,'left_ankle');
        if (!lK||!lA) return {angle:null,rep:false,formScore:0,feedback:''};
        const dist=Utils.getDistance(lK,lA);
        return {angle:dist,rep:false,formScore:100,feedback:'Rotate Ankle Slowly'};
    }
    _wristFlex(p) {
        const lE=this.getKeypoint(p,'left_elbow'),lW=this.getKeypoint(p,'left_wrist');
        if (!lE||!lW) return {angle:null,rep:false,formScore:0,feedback:''};
        const dy=lW.y-lE.y;
        return {angle:Math.abs(dy),rep:false,formScore:100,feedback:dy>20?'Flex Down':dy<-20?'Flex Up':'Neutral'};
    }
    _sideStretch(p) {
        const lS=this.getKeypoint(p,'left_shoulder'),lH=this.getKeypoint(p,'left_hip'),lW=this.getKeypoint(p,'left_wrist');
        if (!lS||!lH||!lW) return {angle:null,rep:false,formScore:0,feedback:''};
        const angle=Utils.getAngle(lH,lS,lW);
        return {angle,rep:false,formScore:angle>120?100:70,feedback:angle>120?'Good Stretch':'Reach Higher'};
    }
    _calfRaise(p) {
        const lK=this.getKeypoint(p,'left_knee'),lA=this.getKeypoint(p,'left_ankle');
        if (!lK||!lA) return {angle:null,rep:false,formScore:0,feedback:''};
        const dy=lK.y-lA.y;
        return {angle:dy,rep:false,formScore:100,feedback:dy<80?'Up':'Down'};
    }
    // ── Yoga ──────────────────────────────────────────────────────────
    _warrior(p) {
        const lH=this.getKeypoint(p,'left_hip'),lK=this.getKeypoint(p,'left_knee'),lA=this.getKeypoint(p,'left_ankle');
        const lW=this.getKeypoint(p,'left_wrist'),rW=this.getKeypoint(p,'right_wrist');
        if (!lH||!lK||!lA) return {angle:null,rep:false,formScore:0,feedback:''};
        const kneeAngle=Utils.getAngle(lH,lK,lA);
        const armsUp=lW&&rW&&lW.y<lH.y&&rW.y<lH.y;
        return {angle:kneeAngle,rep:false,formScore:kneeAngle<100&&armsUp?100:70,feedback:kneeAngle<100?'Hold Warrior':'Bend Front Knee'};
    }
    _tree(p) {
        const lH=this.getKeypoint(p,'left_hip'),lK=this.getKeypoint(p,'left_knee'),rA=this.getKeypoint(p,'right_ankle');
        const lW=this.getKeypoint(p,'left_wrist'),rW=this.getKeypoint(p,'right_wrist');
        if (!lH||!lK||!rA) return {angle:null,rep:false,formScore:0,feedback:''};
        const footUp=rA.y<lH.y;
        const armsUp=lW&&rW&&lW.y<lH.y&&rW.y<lH.y;
        return {angle:rA.y,rep:false,formScore:footUp&&armsUp?100:60,feedback:footUp?'Balance!':'Lift Foot to Thigh'};
    }
    _downwardDog(p) {
        const lS=this.getKeypoint(p,'left_shoulder'),lH=this.getKeypoint(p,'left_hip'),lA=this.getKeypoint(p,'left_ankle');
        if (!lS||!lH||!lA) return {angle:null,rep:false,formScore:0,feedback:''};
        const angle=Utils.getAngle(lS,lH,lA);
        return {angle,rep:false,formScore:angle>100&&angle<160?100:70,feedback:angle>100?'Hold Pose':'Lift Hips Higher'};
    }
    _cobra(p) {
        const lS=this.getKeypoint(p,'left_shoulder'),lH=this.getKeypoint(p,'left_hip'),lW=this.getKeypoint(p,'left_wrist');
        if (!lS||!lH||!lW) return {angle:null,rep:false,formScore:0,feedback:''};
        const lift=lH.y-lS.y;
        return {angle:lift,rep:false,formScore:lift>50?100:60,feedback:lift>50?'Good Cobra':'Lift Chest Higher'};
    }
    _chair(p) {
        const lH=this.getKeypoint(p,'left_hip'),lK=this.getKeypoint(p,'left_knee'),lA=this.getKeypoint(p,'left_ankle');
        if (!lH||!lK||!lA) return {angle:null,rep:false,formScore:0,feedback:''};
        const angle=Utils.getAngle(lH,lK,lA);
        return {angle,rep:false,formScore:angle<120?100:70,feedback:angle<120?'Hold Chair':'Sit Deeper'};
    }
    _mountain(p) {
        const lS=this.getKeypoint(p,'left_shoulder'),rS=this.getKeypoint(p,'right_shoulder');
        const lH=this.getKeypoint(p,'left_hip'),rH=this.getKeypoint(p,'right_hip');
        if (!lS||!rS||!lH||!rH) return {angle:null,rep:false,formScore:0,feedback:''};
        const tilt=Math.abs(lS.y-rS.y)+Math.abs(lH.y-rH.y);
        return {angle:tilt,rep:false,formScore:tilt<30?100:70,feedback:tilt<30?'Perfect Alignment':'Stand Straight'};
    }
    _triangle(p) {
        const lS=this.getKeypoint(p,'left_shoulder'),lH=this.getKeypoint(p,'left_hip'),lA=this.getKeypoint(p,'left_ankle');
        const lW=this.getKeypoint(p,'left_wrist');
        if (!lS||!lH||!lA) return {angle:null,rep:false,formScore:0,feedback:''};
        const angle=Utils.getAngle(lS,lH,lA);
        return {angle,rep:false,formScore:angle>60&&angle<120?100:70,feedback:angle>60?'Hold Triangle':'Reach Down'};
    }
    _bridge(p) {
        const lS=this.getKeypoint(p,'left_shoulder'),lH=this.getKeypoint(p,'left_hip'),lK=this.getKeypoint(p,'left_knee');
        if (!lS||!lH||!lK) return {angle:null,rep:false,formScore:0,feedback:''};
        const lift=lS.y-lH.y;
        return {angle:lift,rep:false,formScore:lift>40?100:60,feedback:lift>40?'Hold Bridge':'Lift Hips Up'};
    }

    // ── Safety ────────────────────────────────────────────────────────
    analyzeSafety(pose) {
        const r={fallDetected:false,dangerousBend:false,riskLevel:'low',riskScore:0};
        if (!pose) return r;
        const lH=this.getKeypoint(pose,'left_hip'),lK=this.getKeypoint(pose,'left_knee');
        const rH=this.getKeypoint(pose,'right_hip'),rK=this.getKeypoint(pose,'right_knee');
        const lS=this.getKeypoint(pose,'left_shoulder'),rS=this.getKeypoint(pose,'right_shoulder');
        if (lH&&lK&&rH&&rK&&lH.score>this.minConfidence&&lK.score>this.minConfidence)
            if (lH.y>lK.y+50&&rH.y>rK.y+50) { r.fallDetected=true; r.riskScore=100; }
        if (lS&&rS&&lH&&rH&&lS.score>this.minConfidence&&lH.score>this.minConfidence) {
            const sM=Utils.getMidpoint(lS,rS),hM=Utils.getMidpoint(lH,rH);
            if (Utils.getAngle(hM,sM,{x:sM.x,y:sM.y-100})>45) { r.dangerousBend=true; r.riskScore=Math.max(r.riskScore,70); }
        }
        r.riskLevel=r.riskScore>=80?'critical':r.riskScore>=50?'high':r.riskScore>=30?'medium':'low';
        return r;
    }

    detectMovement(cur, prev) {
        if (!cur||!prev) return false;
        let t=0;
        cur.keypoints.forEach((kp,i)=>{ const p=prev.keypoints[i]; if(kp&&p) t+=Utils.getDistance(kp,p); });
        return t>50;
    }
}

const poseEngine = new PoseEngine();

class ModuleManager {
    constructor() { this.currentModule='landing'; this.currentPose=null; this.previousPose=null; }
    updatePose(pose) {
        this.previousPose=this.currentPose; this.currentPose=pose;
        const m=window[`${this.currentModule}Module`];
        if (m&&typeof m.updatePose==='function') m.updatePose(this.currentPose,this.previousPose);
    }
    onModuleSwitch(name) {
        this.currentModule=name;
        const m=window[`${name}Module`];
        if (m&&typeof m.onModuleActive==='function') m.onModuleActive();
    }
}

window.ModuleManager = new ModuleManager();
window.poseEngine    = poseEngine;
