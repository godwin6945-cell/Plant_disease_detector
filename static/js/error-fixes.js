/* ============================================
   Error Fixes & Validation
   ============================================ */

(function() {
    'use strict';

    // ── Fix: Ensure all modules are properly initialized ────────
    function validateModules() {
        const requiredModules = ['postureModule', 'fitnessModule', 'safetyModule', 'sportsModule', 'gamesModule'];
        const missing = [];
        
        requiredModules.forEach(mod => {
            if (!window[mod]) {
                missing.push(mod);
                console.warn(`⚠️ Module not loaded: ${mod}`);
            }
        });
        
        if (missing.length === 0) {
            console.log('✅ All modules loaded successfully');
        }
        
        return missing.length === 0;
    }

    // ── Fix: Canvas synchronization issues ──────────────────────
    function fixCanvasSizing() {
        const canvases = ['postureCanvas', 'fitnessCanvas', 'safetyCanvas', 'sportsCanvas', 'gamesCanvas'];
        const video = document.getElementById('webcam');
        
        if (!video) return;
        
        const syncCanvas = (canvasId) => {
            const canvas = document.getElementById(canvasId);
            if (!canvas || !video.videoWidth) return;
            
            if (canvas.width !== video.videoWidth) canvas.width = video.videoWidth;
            if (canvas.height !== video.videoHeight) canvas.height = video.videoHeight;
        };
        
        // Sync on video metadata load
        video.addEventListener('loadedmetadata', () => {
            canvases.forEach(syncCanvas);
        });
        
        // Periodic sync
        setInterval(() => canvases.forEach(syncCanvas), 1000);
    }

    // ── Fix: LocalStorage quota exceeded ────────────────────────
    function manageLocalStorage() {
        try {
            const keys = Object.keys(localStorage);
            const poseKeys = keys.filter(k => k.startsWith('poseai_') || k.startsWith('poseplay_'));
            
            // Keep only last 20 entries per key
            poseKeys.forEach(key => {
                try {
                    const data = JSON.parse(localStorage.getItem(key) || '[]');
                    if (Array.isArray(data) && data.length > 20) {
                        localStorage.setItem(key, JSON.stringify(data.slice(-20)));
                    }
                } catch (e) {
                    console.warn(`Failed to parse localStorage key: ${key}`);
                }
            });
        } catch (e) {
            console.error('LocalStorage management error:', e);
            // Clear old data if quota exceeded
            if (e.name === 'QuotaExceededError') {
                const oldKeys = Object.keys(localStorage).filter(k => k.startsWith('poseai_'));
                oldKeys.forEach(k => localStorage.removeItem(k));
                window.showToast('Storage cleared to free space', 3000, 'warning');
            }
        }
    }

    // ── Fix: Memory leak prevention ─────────────────────────────
    function preventMemoryLeaks() {
        // Clear intervals on page unload
        window.addEventListener('beforeunload', () => {
            ['postureModule', 'fitnessModule', 'safetyModule', 'sportsModule', 'gamesModule'].forEach(modName => {
                const mod = window[modName];
                if (mod && mod.timerInterval) {
                    clearInterval(mod.timerInterval);
                }
            });
            
            // Stop pose engine
            if (window.poseEngine && window.poseEngine.stop) {
                window.poseEngine.stop();
            }
        });
    }

    // ── Fix: Fetch error handling ───────────────────────────────
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        return originalFetch.apply(this, args)
            .then(response => {
                if (!response.ok && response.status !== 404) {
                    console.warn(`API error: ${args[0]} - ${response.status}`);
                }
                return response;
            })
            .catch(error => {
                console.error(`Fetch error: ${args[0]}`, error);
                // Don't show toast for every failed fetch
                if (!args[0].includes('/api/')) {
                    throw error;
                }
                return Promise.reject(error);
            });
    };

    // ── Fix: Audio context suspended state ──────────────────────
    function fixAudioContext() {
        document.addEventListener('click', () => {
            // Resume any suspended audio contexts
            if (window.AudioContext || window.webkitAudioContext) {
                const contexts = [];
                // Collect all audio contexts from modules
                ['postureModule', 'fitnessModule', 'gamesModule'].forEach(modName => {
                    const mod = window[modName];
                    if (mod && mod.audioCtx && mod.audioCtx.state === 'suspended') {
                        contexts.push(mod.audioCtx);
                    }
                });
                
                contexts.forEach(ctx => {
                    ctx.resume().catch(e => console.warn('Audio context resume failed:', e));
                });
            }
        }, { once: true });
    }

    // ── Fix: Video stream cleanup ───────────────────────────────
    function cleanupVideoStream() {
        window.addEventListener('beforeunload', () => {
            const video = document.getElementById('webcam');
            if (video && video.srcObject) {
                video.srcObject.getTracks().forEach(track => track.stop());
            }
        });
    }

    // ── Fix: Pose engine null checks ────────────────────────────
    function addPoseEngineGuards() {
        if (!window.poseEngine) {
            console.error('❌ PoseEngine not initialized');
            return;
        }
        
        const originalAnalyze = window.poseEngine.analyzePosture;
        window.poseEngine.analyzePosture = function(pose) {
            if (!pose || !pose.keypoints) {
                return { neckAngle: null, spineAngle: null, shoulderTilt: null, score: 0, status: 'unknown' };
            }
            return originalAnalyze.call(this, pose);
        };
    }

    // ── Fix: Module switch race condition ───────────────────────
    function fixModuleSwitching() {
        let switchTimeout = null;
        const originalSwitch = window.ModuleManager?.onModuleSwitch;
        
        if (window.ModuleManager && originalSwitch) {
            window.ModuleManager.onModuleSwitch = function(name) {
                if (switchTimeout) clearTimeout(switchTimeout);
                
                switchTimeout = setTimeout(() => {
                    originalSwitch.call(this, name);
                    
                    // Sync canvas after switch
                    const canvas = document.getElementById(`${name}Canvas`);
                    if (canvas) {
                        const video = document.getElementById('webcam');
                        if (video && video.videoWidth) {
                            canvas.width = video.videoWidth;
                            canvas.height = video.videoHeight;
                        }
                    }
                }, 100);
            };
        }
    }

    // ── Fix: Games module balloon/laser cleanup ─────────────────
    function fixGamesCleanup() {
        if (window.gamesModule) {
            const originalEndGame = window.gamesModule.endGame;
            window.gamesModule.endGame = function() {
                // Clear all game objects
                this.balloons = [];
                this.lasers = [];
                this.shadowPoses = [];
                this.frozenPose = null;
                
                if (originalEndGame) {
                    originalEndGame.call(this);
                }
            };
        }
    }

    // ── Validation: Check required DOM elements ─────────────────
    function validateDOM() {
        const required = [
            'webcam', 'canvas', 'cameraStatus', 'fpsBadge',
            'postureCanvas', 'fitnessCanvas', 'safetyCanvas', 'sportsCanvas', 'gamesCanvas',
            'gameScore', 'gameMessage', 'freezeCountdownDisplay', 'laserLivesDisplay'
        ];
        
        const missing = required.filter(id => !document.getElementById(id));
        
        if (missing.length > 0) {
            console.warn('⚠️ Missing DOM elements:', missing);
        } else {
            console.log('✅ All required DOM elements present');
        }
        
        return missing.length === 0;
    }

    // ── Fix: Smooth score updates ───────────────────────────────
    function smoothScoreUpdates() {
        const scoreElements = ['postureScore', 'gameScore', 'repCount', 'formScore'];
        
        scoreElements.forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            
            let currentValue = 0;
            let targetValue = 0;
            let animationFrame = null;
            
            const observer = new MutationObserver(() => {
                const newValue = parseInt(el.textContent) || 0;
                if (newValue !== targetValue) {
                    targetValue = newValue;
                    
                    if (animationFrame) cancelAnimationFrame(animationFrame);
                    
                    const animate = () => {
                        const diff = targetValue - currentValue;
                        if (Math.abs(diff) < 1) {
                            currentValue = targetValue;
                            el.textContent = Math.round(currentValue);
                            return;
                        }
                        
                        currentValue += diff * 0.2;
                        el.textContent = Math.round(currentValue);
                        animationFrame = requestAnimationFrame(animate);
                    };
                    
                    animate();
                }
            });
            
            observer.observe(el, { childList: true, characterData: true, subtree: true });
        });
    }

    // ── Connection status monitor ───────────────────────────────
    function monitorConnection() {
        const indicator = document.createElement('div');
        indicator.className = 'connection-status';
        indicator.innerHTML = '<span class="dot"></span> <span id="connText">Online</span>';
        document.body.appendChild(indicator);
        
        const updateStatus = (online) => {
            indicator.className = 'connection-status show ' + (online ? 'online' : 'offline');
            document.getElementById('connText').textContent = online ? 'Online' : 'Offline';
            
            if (!online) {
                setTimeout(() => indicator.classList.remove('show'), 3000);
            }
        };
        
        window.addEventListener('online', () => updateStatus(true));
        window.addEventListener('offline', () => updateStatus(false));
        
        // Initial check
        updateStatus(navigator.onLine);
    }

    // ── Initialize all fixes ────────────────────────────────────
    document.addEventListener('DOMContentLoaded', () => {
        console.log('🔧 Applying error fixes and validations...');
        
        validateModules();
        validateDOM();
        fixCanvasSizing();
        manageLocalStorage();
        preventMemoryLeaks();
        fixAudioContext();
        cleanupVideoStream();
        fixModuleSwitching();
        fixGamesCleanup();
        smoothScoreUpdates();
        monitorConnection();
        
        // Delayed checks
        setTimeout(() => {
            addPoseEngineGuards();
        }, 2000);
        
        // Periodic maintenance
        setInterval(manageLocalStorage, 60000); // Every minute
        
        console.log('✅ All fixes applied successfully');
    });

    // ── Export for debugging ────────────────────────────────────
    window.ErrorFixes = {
        validateModules,
        validateDOM,
        manageLocalStorage,
        fixCanvasSizing
    };
})();
