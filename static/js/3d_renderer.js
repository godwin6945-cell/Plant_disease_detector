/* ============================================
   PoseAI Suite — 3D Skeleton Renderer (Three.js r128)
   ============================================ */

class PoseRenderer3D {
    constructor() {
        this.scene           = null;
        this.camera          = null;
        this.renderer        = null;
        this.controls        = null;
        this.keypointSpheres = [];
        this.connectionLines = [];
        this.isInitialized   = false;

        this.CONNECTIONS = [
            [1,2],[0,1],[0,2],[1,3],[2,4],
            [5,6],[5,7],[7,9],[6,8],[8,10],
            [5,11],[6,12],[11,12],
            [11,13],[13,15],[12,14],[14,16]
        ];
    }

    init(canvasId) {
        if (typeof THREE === 'undefined') {
            console.warn('Three.js not loaded — 3D renderer skipped');
            return;
        }
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        try {
            const W = canvas.clientWidth  || 400;
            const H = canvas.clientHeight || 300;

            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color(0x0a0a0f);

            this.camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000);
            this.camera.position.set(0, 0, 200);

            this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
            this.renderer.setSize(W, H);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

            this.scene.add(new THREE.AmbientLight(0xffffff, 0.6));
            const dir = new THREE.DirectionalLight(0xffffff, 0.8);
            dir.position.set(50, 50, 50);
            this.scene.add(dir);

            // OrbitControls — available as THREE.OrbitControls from unpkg addons
            if (typeof THREE.OrbitControls !== 'undefined') {
                this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
                this.controls.enableDamping = true;
                this.controls.dampingFactor = 0.05;
            }

            for (let i = 0; i < 17; i++) {
                const mesh = new THREE.Mesh(
                    new THREE.SphereGeometry(3, 8, 8),
                    new THREE.MeshPhongMaterial({ color: 0x00ff88 })
                );
                mesh.visible = false;
                this.scene.add(mesh);
                this.keypointSpheres.push(mesh);
            }

            const lineMat = new THREE.LineBasicMaterial({ color: 0x00d4ff });
            for (let i = 0; i < this.CONNECTIONS.length; i++) {
                const geo = new THREE.BufferGeometry();
                geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));
                const line = new THREE.Line(geo, lineMat);
                line.visible = false;
                this.scene.add(line);
                this.connectionLines.push(line);
            }

            window.addEventListener('resize', () => {
                if (!this.renderer || !this.camera || !canvas) return;
                const nW = canvas.clientWidth  || 400;
                const nH = canvas.clientHeight || 300;
                this.camera.aspect = nW / nH;
                this.camera.updateProjectionMatrix();
                this.renderer.setSize(nW, nH);
            });

            this.isInitialized = true;
            this._animate();
            console.log('3D Renderer initialized');
        } catch (err) {
            console.warn('3D Renderer init error:', err);
        }
    }

    updatePose(pose) {
        if (!this.isInitialized || !pose || !pose.keypoints) return;
        const W = 640, H = 480;

        pose.keypoints.forEach((kp, i) => {
            const sphere = this.keypointSpheres[i];
            if (!sphere) return;
            if (kp && kp.score > 0.3) {
                sphere.position.set((kp.x / W) * 100 - 50, -(kp.y / H) * 75 + 37.5, 0);
                sphere.visible = true;
            } else {
                sphere.visible = false;
            }
        });

        this.CONNECTIONS.forEach(([a, b], i) => {
            const line = this.connectionLines[i];
            const kpA  = pose.keypoints[a];
            const kpB  = pose.keypoints[b];
            if (kpA && kpB && kpA.score > 0.3 && kpB.score > 0.3) {
                const pos = line.geometry.attributes.position.array;
                pos[0] = (kpA.x / W) * 100 - 50; pos[1] = -(kpA.y / H) * 75 + 37.5; pos[2] = 0;
                pos[3] = (kpB.x / W) * 100 - 50; pos[4] = -(kpB.y / H) * 75 + 37.5; pos[5] = 0;
                line.geometry.attributes.position.needsUpdate = true;
                line.visible = true;
            } else {
                line.visible = false;
            }
        });
    }

    _animate() {
        requestAnimationFrame(() => this._animate());
        if (this.controls) this.controls.update();
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    dispose() {
        if (this.renderer) this.renderer.dispose();
        if (this.controls)  this.controls.dispose();
    }
}

window.poseRenderer3D = new PoseRenderer3D();
console.log('3D Renderer loaded');
