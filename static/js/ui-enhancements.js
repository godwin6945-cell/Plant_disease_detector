/* ============================================
   UI/UX Enhancements & Error Fixes
   ============================================ */

(function() {
    'use strict';

    // ── Particle Background System ──────────────────────────────
    function createParticles() {
        const container = document.createElement('div');
        container.className = 'particles';
        document.body.appendChild(container);
        
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 10 + 's';
            particle.style.animationDuration = (10 + Math.random() * 10) + 's';
            container.appendChild(particle);
        }
    }

    // ── Score Pop Animation ─────────────────────────────────────
    function animateScoreChange(element) {
        if (!element) return;
        element.classList.remove('pop');
        void element.offsetWidth; // Force reflow
        element.classList.add('pop');
        setTimeout(() => element.classList.remove('pop'), 300);
    }

    // ── Ripple Effect on Buttons ────────────────────────────────
    function createRipple(event) {
        const button = event.currentTarget;
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        
        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    }

    // ── Confetti Celebration ────────────────────────────────────
    function triggerConfetti() {
        const colors = ['#00d4ff', '#00ff88', '#ff6b35', '#ff3366'];
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            document.body.appendChild(confetti);
            setTimeout(() => confetti.remove(), 3000);
        }
    }

    // ── Toast Enhancement ───────────────────────────────────────
    const originalShowToast = window.showToast;
    window.showToast = function(message, duration = 3000, type = 'info') {
        const toast = document.getElementById('errorToast');
        if (!toast) return;
        
        toast.textContent = message;
        toast.className = 'toast show';
        
        // Add type-specific styling
        if (type === 'success') toast.style.borderColor = '#00ff88';
        else if (type === 'error') toast.style.borderColor = '#ff3366';
        else if (type === 'warning') toast.style.borderColor = '#ff6b35';
        else toast.style.borderColor = '#00d4ff';
        
        setTimeout(() => {
            toast.classList.remove('show');
            toast.style.borderColor = '';
        }, duration);
    };

    // ── Loading Progress Enhancement ────────────────────────────
    function enhanceLoadingScreen() {
        const messages = [
            'Initializing TensorFlow.js with AMD WebGL...',
            'Loading MoveNet Lightning model...',
            'Optimizing for 60 FPS performance...',
            'Calibrating pose detection...',
            'Almost ready...'
        ];
        
        let index = 0;
        const msgEl = document.getElementById('loadingMessage');
        
        const interval = setInterval(() => {
            if (msgEl && index < messages.length) {
                msgEl.textContent = messages[index];
                index++;
            } else {
                clearInterval(interval);
            }
        }, 800);
    }

    // ── Score Increment Animation ───────────────────────────────
    window.showScoreIncrement = function(element, points) {
        if (!element) return;
        
        const rect = element.getBoundingClientRect();
        const increment = document.createElement('div');
        increment.className = 'score-increment';
        increment.textContent = '+' + points;
        increment.style.left = rect.left + rect.width / 2 + 'px';
        increment.style.top = rect.top + 'px';
        increment.style.position = 'fixed';
        
        document.body.appendChild(increment);
        setTimeout(() => increment.remove(), 1000);
    };

    // ── Module Transition Effects ───────────────────────────────
    function enhanceModuleTransitions() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'style') {
                    const target = mutation.target;
                    if (target.classList.contains('module-view')) {
                        if (target.style.display !== 'none') {
                            target.classList.add('slide-in-bottom');
                            setTimeout(() => target.classList.remove('slide-in-bottom'), 500);
                        }
                    }
                }
            });
        });
        
        document.querySelectorAll('.module-view').forEach(el => {
            observer.observe(el, { attributes: true });
        });
    }

    // ── Camera Status Indicator ─────────────────────────────────
    function enhanceCameraStatus() {
        const status = document.getElementById('cameraStatus');
        if (!status) return;
        
        setInterval(() => {
            const dot = status.querySelector('.dot');
            if (dot && poseEngine && poseEngine.currentKeypoints) {
                dot.style.background = '#00ff88';
                status.style.background = 'rgba(0,255,136,0.2)';
            } else {
                dot.style.background = '#ff3366';
                status.style.background = 'rgba(255,51,102,0.2)';
            }
        }, 500);
    }

    // ── Keyboard Shortcuts Help ─────────────────────────────────
    function showKeyboardHelp() {
        const help = document.createElement('div');
        help.className = 'keyboard-help';
        help.innerHTML = `
            <h4>⌨️ Keyboard Shortcuts</h4>
            <div class="shortcut"><kbd>1-5</kbd> Switch modules</div>
            <div class="shortcut"><kbd>M</kbd> Toggle mirror</div>
            <div class="shortcut"><kbd>S</kbd> Cycle skeleton style</div>
            <div class="shortcut"><kbd>F</kbd> Fullscreen</div>
            <div class="shortcut"><kbd>Space</kbd> Pause/Resume</div>
            <div class="shortcut"><kbd>D</kbd> Debug mode</div>
            <div class="shortcut"><kbd>?</kbd> Show this help</div>
        `;
        help.style.cssText = `
            position: fixed; bottom: 80px; right: 20px; z-index: 2000;
            background: rgba(10,10,15,0.95); backdrop-filter: blur(16px);
            border: 1px solid rgba(0,212,255,0.3); border-radius: 12px;
            padding: 16px; min-width: 250px; animation: slideInRight 0.3s ease;
        `;
        document.body.appendChild(help);
        setTimeout(() => help.remove(), 5000);
    }

    // ── Performance Monitor ─────────────────────────────────────
    function createPerformanceMonitor() {
        const monitor = document.createElement('div');
        monitor.id = 'perfMonitor';
        monitor.style.cssText = `
            position: fixed; top: 80px; right: 20px; z-index: 1000;
            background: rgba(10,10,15,0.9); backdrop-filter: blur(16px);
            border: 1px solid rgba(0,212,255,0.2); border-radius: 8px;
            padding: 12px; font-size: 11px; font-family: 'Courier New', monospace;
            display: none; min-width: 150px;
        `;
        document.body.appendChild(monitor);
        
        let frameCount = 0, lastTime = performance.now();
        
        function updateMonitor() {
            frameCount++;
            const now = performance.now();
            if (now - lastTime >= 1000) {
                const fps = Math.round((frameCount * 1000) / (now - lastTime));
                const memory = performance.memory ? 
                    (performance.memory.usedJSHeapSize / 1048576).toFixed(1) + ' MB' : 'N/A';
                
                monitor.innerHTML = `
                    <div style="color:#00d4ff">⚡ Performance</div>
                    <div style="color:#00ff88">FPS: ${fps}</div>
                    <div style="color:#ff6b35">Memory: ${memory}</div>
                    <div style="color:#888">Inference: ${poseEngine?.lastInferenceTime?.toFixed(0) || '--'} ms</div>
                `;
                
                frameCount = 0;
                lastTime = now;
            }
            requestAnimationFrame(updateMonitor);
        }
        updateMonitor();
    }

    // ── Auto-save Indicator ─────────────────────────────────────
    function showAutoSaveIndicator() {
        const indicator = document.createElement('div');
        indicator.textContent = '💾 Saved';
        indicator.style.cssText = `
            position: fixed; top: 80px; left: 50%; transform: translateX(-50%);
            background: rgba(0,255,136,0.2); border: 1px solid rgba(0,255,136,0.5);
            padding: 8px 16px; border-radius: 20px; font-size: 12px;
            animation: slideInTop 0.3s ease, fadeOut 0.3s ease 2s forwards;
            z-index: 2000;
        `;
        document.body.appendChild(indicator);
        setTimeout(() => indicator.remove(), 2500);
    }

    // ── Error Handler ───────────────────────────────────────────
    window.addEventListener('error', (e) => {
        console.error('Global error:', e.error);
        if (e.error && e.error.message) {
            window.showToast('Error: ' + e.error.message.substring(0, 50), 4000, 'error');
        }
    });

    // ── Unhandled Promise Rejection ─────────────────────────────
    window.addEventListener('unhandledrejection', (e) => {
        console.error('Unhandled promise rejection:', e.reason);
        window.showToast('Connection error - retrying...', 3000, 'warning');
    });

    // ── Initialize All Enhancements ─────────────────────────────
    document.addEventListener('DOMContentLoaded', () => {
        createParticles();
        enhanceLoadingScreen();
        enhanceModuleTransitions();
        enhanceCameraStatus();
        createPerformanceMonitor();
        
        // Add ripple to all buttons
        document.querySelectorAll('button, .control-btn, .game-btn, .test-btn, .exercise-btn').forEach(btn => {
            btn.addEventListener('click', createRipple);
        });
        
        // Keyboard help
        document.addEventListener('keydown', (e) => {
            if (e.key === '?' && !e.shiftKey) {
                e.preventDefault();
                showKeyboardHelp();
            }
            // Toggle performance monitor with P key
            if (e.key === 'p' || e.key === 'P') {
                const monitor = document.getElementById('perfMonitor');
                if (monitor) monitor.style.display = monitor.style.display === 'none' ? 'block' : 'none';
            }
        });
        
        // Enhance score displays
        const scoreObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && mutation.target.classList.contains('score-value')) {
                    animateScoreChange(mutation.target);
                }
            });
        });
        
        document.querySelectorAll('.score-value, .counter-value').forEach(el => {
            scoreObserver.observe(el, { childList: true, characterData: true, subtree: true });
        });
        
        // Auto-save indicator for API calls
        const originalFetch = window.fetch;
        window.fetch = function(...args) {
            return originalFetch.apply(this, args).then(response => {
                if (args[0] && args[0].includes('/api/save_session') && response.ok) {
                    showAutoSaveIndicator();
                }
                return response;
            });
        };
        
        console.log('✨ UI/UX Enhancements loaded');
    });

    // ── Export for global access ────────────────────────────────
    window.UIEnhancements = {
        triggerConfetti,
        showScoreIncrement,
        showKeyboardHelp,
        showAutoSaveIndicator
    };
})();
