const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

renderer.domElement.style.position = 'fixed';
renderer.domElement.style.top = '0';
renderer.domElement.style.left = '0';
renderer.domElement.style.zIndex = '-1';

// Create a more dense, colorful starfield
const starCount = 8000;
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(starCount * 3);
const colors = new Float32Array(starCount * 3);

// Modify your star loop in three.js to favor pink and blue stars
for (let i = 0; i < starCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 2000;
    positions[i+1] = (Math.random() - 0.5) * 2000;
    positions[i+2] = (Math.random() - 0.5) * 2000;

    // 70% Pink stars, 30% Blue stars
    if (Math.random() > 0.3) {
        // Neon Pink
        colors[i] = 1.0;     // R
        colors[i+1] = 0.05;  // G
        colors[i+2] = 0.9;   // B
    } else {
        // Electric Blue
        colors[i] = 0.0;     // R
        colors[i+1] = 0.95;  // G
        colors[i+2] = 1.0;   // B
    }
}

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const material = new THREE.PointsMaterial({
    size: 2.5, // Slightly larger stars for that 90s glow
    vertexColors: true,
    transparent: true,
    opacity: 1,
    sizeAttenuation: true
});

const stars = new THREE.Points(geometry, material);
scene.add(stars);

camera.position.z = 500;

// Mouse Parallax Logic
let targetX = 0;
let targetY = 0;
const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

document.addEventListener('mousemove', (event) => {
    targetX = (event.clientX - windowHalfX) * 0.05;
    targetY = (event.clientY - windowHalfY) * 0.05;
});

function animate() {
    requestAnimationFrame(animate);

    // Constant slow drift
    stars.rotation.y += 0.001;
    stars.rotation.x += 0.0005;

    // Smooth Parallax movement
    camera.position.x += (targetX - camera.position.x) * 0.08;
    camera.position.y += (-targetY - camera.position.y) * 0.08;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});