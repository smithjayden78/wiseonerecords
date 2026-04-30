// 1. Scene Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.z = 5; 

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); // Added alpha support
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0x000000, 1); 

// Force the canvas to stay in the background
const canvas = renderer.domElement;
canvas.style.position = 'fixed';
canvas.style.top = '0';
canvas.style.left = '0';
canvas.style.width = '100vw';
canvas.style.height = '100vh';
canvas.style.zIndex = '-1'; // Behind everything
canvas.style.pointerEvents = 'none'; // Don't block button clicks

document.body.appendChild(canvas);

// 2. Stars
const starGeometry = new THREE.BufferGeometry();
const starMaterial = new THREE.PointsMaterial({ 
    color: 0xffffff,
    size: 0.8, // Crisp star points
    transparent: true,
    opacity: 0.8
});

const starVertices = [];
for (let i = 0; i < 10000; i++) {
    starVertices.push(
        (Math.random() - 0.5) * 2000,
        (Math.random() - 0.5) * 2000,
        (Math.random() - 0.5) * 2000
    );
}

starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

// 3. Shooting Stars (GSAP)
function createShootingStar() {
    const geometry = new THREE.SphereGeometry(0.4, 8, 8);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const sphere = new THREE.Mesh(geometry, material);
    
    sphere.position.set((Math.random() - 0.5) * 800, (Math.random() - 0.5) * 800, -1000);
    scene.add(sphere);

    gsap.to(sphere.position, {
        x: sphere.position.x + 400,
        y: sphere.position.y - 400,
        z: 500,
        duration: 1,
        onComplete: () => scene.remove(sphere)
    });

    setTimeout(createShootingStar, Math.random() * 4000 + 2000);
}
createShootingStar();

// 4. Animation Loop
function animate() {
    requestAnimationFrame(animate);
    if (stars) {
        stars.rotation.y += 0.0003;
        stars.rotation.x += 0.0001;
    }
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();