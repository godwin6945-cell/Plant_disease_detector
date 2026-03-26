/* Camera Positioning Guide Overlay */
'use strict';

class CameraGuide {
    constructor() {
        this.enabled = false;
        this.overlay = null;
    }

    init() {
        this.createOverlay();
        this.addToggleButton();
    }

    createOverlay() {
        const canvas = document.getElementById('canvas');
        if (!canvas) return;

        this.overlay = document.createElement('div');
        this.overlay.id = 'cameraGuideOverlay';
        this.overlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 5;
            display: none;
        `;

        // Center circle for head position
        const centerCircle = document.createElement('div');
        centerCircle.style.cssText = `
            position: absolute;
            top: 15%;
            left: 50%;
            transform: translateX(-50%);
            width: 80px;
            height: 80px;
            border: 3px dashed rgba(0, 212, 255, 0.6);
            border-radius: 50%;
            box-shadow: 0 0 20px rgba(0, 212, 255, 0.4);
        `;

        // Body outline
        const bodyOutline = document.createElement('div');
        bodyOutline.style.cssText = `
            position: absolute;
            top: 25%;
            left: 50%;
            transform: translateX(-50%);
            width: 200px;
            height: 400px;
            border: 3px dashed rgba(0, 255, 136, 0.6);
            border-radius: 100px 100px 20px 20px;
            box-shadow: 0 0 20px rgba(0, 255, 136, 0.4);
        `;

        // Center line
        const centerLine = document.createElement('div');
        centerLine.style.cssText = `
            position: absolute;
            top: 0;
            left: 50%;
            width: 2px;
            height: 100%;
            background: linear-gradient(to bottom, 
                transparent 0%, 
                rgba(255, 255, 255, 0.3) 20%, 
                rgba(255, 255, 255, 0.3) 80%, 
                transparent 100%
            );
        `;

        // Distance markers
        const topMarker = this.createMarker('Stand 1.5-2m from camera', '5%');
        const bottomMarker = this.createMarker('Full body visible', '90%');

        this.overlay.appendChild(centerCircle);
        this.overlay.appendChild(bodyOutline);
        this.overlay.appendChild(centerLine);
        this.overlay.appendChild(topMarker);
        this.overlay.appendChild(bottomMarker);

        const cameraContainer = document.querySelector('.camera-container');
        if (cameraContainer) {
            cameraContainer.appendChild(this.overlay);
        }
    }

    createMarker(text, top) {
        const marker = document.createElement('div');
        marker.style.cssText = `
            position: absolute;
            top: ${top};
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: #00d4ff;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: bold;
            border: 1px solid rgba(0, 212, 255, 0.5);
            white-space: nowrap;
        `;
        marker.textContent = text;
        return marker;
    }

    addToggleButton() {
        const navRight = document.querySelector('.nav-right');
        if (!navRight) return;

        const btn = document.createElement('button');
        btn.className = 'settings-btn';
        btn.id = 'cameraGuideBtn';
        btn.title = 'Toggle Camera Guide';
        btn.innerHTML = '📐';
        btn.style.marginRight = '10px';

        btn.addEventListener('click', () => this.toggle());

        navRight.insertBefore(btn, navRight.firstChild);
    }

    toggle() {
        this.enabled = !this.enabled;
        if (this.overlay) {
            this.overlay.style.display = this.enabled ? 'block' : 'none';
        }
        
        const btn = document.getElementById('cameraGuideBtn');
        if (btn) {
            btn.style.background = this.enabled 
                ? 'rgba(0, 212, 255, 0.2)' 
                : 'transparent';
            btn.style.borderColor = this.enabled 
                ? 'var(--primary-blue)' 
                : 'var(--panel-border)';
        }

        window.showToast(
            this.enabled ? 'Camera guide enabled' : 'Camera guide disabled',
            1500
        );
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    const cameraGuide = new CameraGuide();
    cameraGuide.init();
    window.cameraGuide = cameraGuide;
});
