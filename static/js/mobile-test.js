/* Mobile Webcam Test - Verify functionality without connecting */
'use strict';

// Test mobile webcam integration on page load
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        console.log('=== Mobile Webcam Test ===');
        
        // Check if mobile webcam is initialized
        if (window.mobileWebcam) {
            console.log('✓ MobileWebcam class initialized');
            console.log('  - isConnected:', window.mobileWebcam.isConnected);
            console.log('  - canvas:', window.mobileWebcam.canvas ? 'Created' : 'Missing');
            console.log('  - getCanvas method:', typeof window.mobileWebcam.getCanvas);
        } else {
            console.error('✗ MobileWebcam not found');
        }
        
        // Check if button exists
        const btn = document.getElementById('mobileWebcamBtn');
        if (btn) {
            console.log('✓ Mobile webcam button added to navbar');
        } else {
            console.error('✗ Mobile webcam button not found');
        }
        
        // Check if modal exists
        const modal = document.getElementById('mobileWebcamModal');
        if (modal) {
            console.log('✓ Mobile webcam modal created');
        } else {
            console.error('✗ Mobile webcam modal not found');
        }
        
        // Check pose engine integration
        if (window.poseEngine) {
            console.log('✓ PoseEngine available');
            console.log('  - _loop method updated:', window.poseEngine._loop.toString().includes('mobileWebcam'));
        } else {
            console.error('✗ PoseEngine not found');
        }
        
        console.log('=== Test Complete ===');
    }, 2000);
});
