/* Mobile Webcam Support - IP Webcam Integration */
'use strict';

class MobileWebcam {
    constructor() {
        this.isConnected = false;
        this.mobileUrl = null;
        this.videoElement = null;
        this.streamInterval = null;
        this.canvas = null;
        this.ctx = null;
    }

    init(videoElement) {
        this.videoElement = videoElement;
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Override video element to use canvas
        this.originalVideoElement = videoElement;
        console.log('MobileWebcam initialized');
    }

    getCanvas() {
        return this.canvas;
    }

    async connect(ipAddress) {
        // Remove any protocol prefix if user included it
        ipAddress = ipAddress.replace(/^https?:\/\//, '').replace(/\/$/, '');
        
        // Support multiple formats with better error handling
        const formats = [
            `http://${ipAddress}/shot.jpg`,             // IP Webcam snapshot (most compatible)
            `http://${ipAddress}:8080/shot.jpg`,        // IP Webcam snapshot with port
            `http://${ipAddress}/video`,                // IP Webcam video stream
            `http://${ipAddress}:8080/video`,           // IP Webcam with explicit port
            `http://${ipAddress}:4747/video`,           // DroidCam
        ];

        for (const url of formats) {
            try {
                console.log('Trying:', url);
                
                // Test with actual image load instead of fetch
                const testImg = new Image();
                testImg.crossOrigin = 'anonymous';
                
                const loadPromise = new Promise((resolve, reject) => {
                    const timeout = setTimeout(() => {
                        reject(new Error('Timeout'));
                    }, 3000);
                    
                    testImg.onload = () => {
                        clearTimeout(timeout);
                        resolve(true);
                    };
                    
                    testImg.onerror = () => {
                        clearTimeout(timeout);
                        reject(new Error('Load failed'));
                    };
                });
                
                testImg.src = `${url}?t=${Date.now()}`;
                await loadPromise;
                
                // Success! Use this URL
                this.mobileUrl = url;
                this.startStreaming();
                this.isConnected = true;
                window.showToast('Mobile webcam connected!', 2000);
                console.log('✅ Connected successfully:', url);
                return true;
            } catch (e) {
                console.log('❌ Failed:', url, e.message);
                continue;
            }
        }

        window.showToast('Failed to connect. Check IP address and ensure app is running.', 4000);
        return false;
    }

    startStreaming() {
        if (!this.mobileUrl || !this.videoElement) return;

        // Stop any existing webcam stream
        if (this.videoElement.srcObject) {
            this.videoElement.srcObject.getTracks().forEach(track => track.stop());
            this.videoElement.srcObject = null;
        }

        let frameCount = 0;
        let lastFrameTime = Date.now();

        const updateFrame = () => {
            if (!this.isConnected) return;

            const newImg = new Image();
            newImg.crossOrigin = 'anonymous';
            
            newImg.onload = () => {
                // Set canvas size to match image (only on first frame or size change)
                if (this.canvas.width !== newImg.width || this.canvas.height !== newImg.height) {
                    this.canvas.width = newImg.width || 640;
                    this.canvas.height = newImg.height || 480;
                    console.log(`📐 Canvas size: ${this.canvas.width}x${this.canvas.height}`);
                }

                // Draw image to canvas
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.ctx.drawImage(newImg, 0, 0);
                
                // FPS counter
                frameCount++;
                const now = Date.now();
                if (now - lastFrameTime >= 1000) {
                    console.log(`📹 Mobile FPS: ${frameCount}`);
                    frameCount = 0;
                    lastFrameTime = now;
                }
                
                // Request next frame immediately for smooth streaming
                requestAnimationFrame(updateFrame);
            };

            newImg.onerror = () => {
                console.warn('⚠️ Mobile stream error, retrying...');
                // Retry after short delay
                setTimeout(() => requestAnimationFrame(updateFrame), 200);
            };

            // Add timestamp to prevent caching
            newImg.src = `${this.mobileUrl}?t=${Date.now()}`;
        };

        // Start streaming
        console.log('🎬 Starting mobile stream...');
        updateFrame();
    }

    disconnect() {
        this.isConnected = false;
        if (this.streamInterval) {
            clearInterval(this.streamInterval);
            this.streamInterval = null;
        }
        this.mobileUrl = null;
        
        // Restart regular webcam
        if (this.videoElement && !this.videoElement.srcObject) {
            navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
                audio: false
            }).then(stream => {
                this.videoElement.srcObject = stream;
                this.videoElement.play();
            }).catch(err => console.error('Failed to restart webcam:', err));
        }
        
        window.showToast('Mobile webcam disconnected', 1500);
    }

    getStatus() {
        return {
            connected: this.isConnected,
            url: this.mobileUrl
        };
    }
}

// Create global instance
window.mobileWebcam = new MobileWebcam();

// Add UI for mobile connection
function createMobileWebcamUI() {
    const modal = document.createElement('div');
    modal.id = 'mobileWebcamModal';
    modal.style.cssText = `
        display: none;
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(10, 10, 15, 0.95);
        backdrop-filter: blur(20px);
        border: 2px solid #00d4ff;
        border-radius: 16px;
        padding: 30px;
        z-index: 10000;
        min-width: 400px;
        box-shadow: 0 0 40px rgba(0, 212, 255, 0.3);
    `;

    modal.innerHTML = `
        <h3 style="color: #00d4ff; margin-bottom: 20px; font-size: 24px;">📱 Connect Mobile Webcam</h3>
        
        <div style="margin-bottom: 20px;">
            <p style="color: #f0f0f0; margin-bottom: 10px;">1. Install "IP Webcam" app on your phone</p>
            <p style="color: #f0f0f0; margin-bottom: 10px;">2. Start the server in the app</p>
            <p style="color: #f0f0f0; margin-bottom: 10px;">3. Enter the IP address shown:</p>
        </div>

        <input 
            type="text" 
            id="mobileIpInput" 
            placeholder="192.168.1.100"
            style="
                width: 100%;
                padding: 12px;
                background: rgba(255,255,255,0.1);
                border: 1px solid #00d4ff;
                border-radius: 8px;
                color: #f0f0f0;
                font-size: 16px;
                margin-bottom: 20px;
            "
        />

        <div style="display: flex; gap: 10px;">
            <button id="mobileConnectBtn" style="
                flex: 1;
                padding: 12px;
                background: linear-gradient(135deg, #00d4ff, #00ff88);
                border: none;
                border-radius: 8px;
                color: #0a0a0f;
                font-weight: bold;
                cursor: pointer;
                font-size: 16px;
            ">Connect</button>
            
            <button id="mobileCancelBtn" style="
                flex: 1;
                padding: 12px;
                background: rgba(255,255,255,0.1);
                border: 1px solid #ff3366;
                border-radius: 8px;
                color: #ff3366;
                font-weight: bold;
                cursor: pointer;
                font-size: 16px;
            ">Cancel</button>
        </div>

        <div style="margin-top: 20px; padding: 15px; background: rgba(0,212,255,0.1); border-radius: 8px;">
            <p style="color: #00d4ff; font-size: 14px; margin: 0;">
                💡 Tip: Make sure your phone and computer are on the same WiFi network
            </p>
        </div>
    `;

    document.body.appendChild(modal);

    // Event listeners
    document.getElementById('mobileConnectBtn').addEventListener('click', async () => {
        const ip = document.getElementById('mobileIpInput').value.trim();
        if (!ip) {
            window.showToast('Please enter an IP address', 2000);
            return;
        }

        const connected = await window.mobileWebcam.connect(ip);
        if (connected) {
            modal.style.display = 'none';
            localStorage.setItem('lastMobileIP', ip);
        }
    });

    document.getElementById('mobileCancelBtn').addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Load last used IP
    const lastIP = localStorage.getItem('lastMobileIP');
    if (lastIP) {
        document.getElementById('mobileIpInput').value = lastIP;
    }
}

// Add button to settings or navbar
function addMobileWebcamButton() {
    const navRight = document.querySelector('.nav-right');
    if (navRight) {
        const btn = document.createElement('button');
        btn.className = 'settings-btn';
        btn.id = 'mobileWebcamBtn';
        btn.title = 'Connect Mobile Webcam';
        btn.innerHTML = '📱';
        btn.style.marginRight = '10px';
        
        btn.addEventListener('click', () => {
            if (window.mobileWebcam && window.mobileWebcam.isConnected) {
                // Disconnect if already connected
                if (confirm('Disconnect mobile webcam?')) {
                    window.mobileWebcam.disconnect();
                }
            } else {
                // Show connection modal
                const modal = document.getElementById('mobileWebcamModal');
                if (modal) {
                    modal.style.display = modal.style.display === 'none' ? 'block' : 'none';
                }
            }
        });

        navRight.insertBefore(btn, navRight.firstChild);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    createMobileWebcamUI();
    addMobileWebcamButton();
});
