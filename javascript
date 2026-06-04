import * as THREE from 'three';

// Setup básico
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050510);
scene.fog = new THREE.FogExp2(0x050510, 0.008);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1.5, 5);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// Luzes dramáticas
const ambientLight = new THREE.AmbientLight(0x404060);
scene.add(ambientLight);
const mainLight = new THREE.DirectionalLight(0xffffff, 1);
mainLight.position.set(2, 5, 3);
mainLight.castShadow = true;
scene.add(mainLight);
const backLight = new THREE.PointLight(0xff44aa, 0.5);
backLight.position.set(-2, 1, -3);
scene.add(backLight);
const fillLight = new THREE.PointLight(0x44aaff, 0.4);
fillLight.position.set(2, 1, 2);
scene.add(fillLight);

// Partículas flutuantes (estilo loveble)
const particleCount = 800;
const particlesGeometry = new THREE.BufferGeometry();
const particlesPositions = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount; i++) {
    particlesPositions[i*3] = (Math.random() - 0.5) * 12;
    particlesPositions[i*3+1] = (Math.random() - 0.5) * 8;
    particlesPositions[i*3+2] = (Math.random() - 0.5) * 10 - 5;
}
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlesPositions, 3));
const particleMaterial = new THREE.PointsMaterial({ color: 0xff66cc, size: 0.05, transparent: true, opacity: 0.6 });
const particleSystem = new THREE.Points(particlesGeometry, particleMaterial);
scene.add(particleSystem);

// Produto 3D (usando um torus knot estilizado, mas você pode carregar um .gltf)
const geometry = new THREE.TorusKnotGeometry(0.8, 0.25, 200, 32, 3, 4);
const material = new THREE.MeshStandardMaterial({ color: 0xff3366, metalness: 0.7, roughness: 0.2, emissive: 0x441122 });
const productMesh = new THREE.Mesh(geometry, material);
productMesh.castShadow = true;
productMesh.receiveShadow = false;
scene.add(productMesh);

// Adicionar um anel giratório ao redor
const ringGeo = new THREE.TorusGeometry(1.1, 0.05, 64, 200);
const ringMat = new THREE.MeshStandardMaterial({ color: 0xff88aa, emissive: 0x331122 });
const ring = new THREE.Mesh(ringGeo, ringMat);
scene.add(ring);

// Efeito de corações (será ativado no clique)
let heartParticles = [];

function createHeartExplosion() {
    // remove hearts antigos
    heartParticles.forEach(p => scene.remove(p));
    heartParticles = [];
    for (let i = 0; i < 200; i++) {
        const heartGeo = new THREE.SphereGeometry(0.05, 8, 8);
        const heartMat = new THREE.MeshStandardMaterial({ color: 0xff3366, emissive: 0xff1144 });
        const heart = new THREE.Mesh(heartGeo, heartMat);
        heart.userData = {
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 0.3,
                Math.random() * 0.5,
                (Math.random() - 0.5) * 0.3
            ),
            life: 1.0
        };
        heart.position.set(0, 0, 0);
        scene.add(heart);
        heartParticles.push(heart);
    }
}

// Animação
let time = 0;
function animate() {
    requestAnimationFrame(animate);
    time += 0.012;

    // Movimento orgânico do produto
    productMesh.rotation.x = Math.sin(time * 0.5) * 0.2;
    productMesh.rotation.y = time * 0.8;
    productMesh.rotation.z = Math.cos(time * 0.3) * 0.1;
    
    ring.rotation.x = time * 0.5;
    ring.rotation.z = time * 0.3;
    
    // Partículas girando suavemente
    particleSystem.rotation.y = time * 0.1;
    particleSystem.rotation.x = Math.sin(time * 0.2) * 0.1;

    // Movimento da câmera suave (mouse follow opcional)
    // (implementar depois)

    // Atualizar corações da explosão
    for (let i = heartParticles.length-1; i >= 0; i--) {
        const h = heartParticles[i];
        h.userData.life -= 0.01;
        if (h.userData.life <= 0) {
            scene.remove(h);
            heartParticles.splice(i,1);
            continue;
        }
        h.position.x += h.userData.velocity.x;
        h.position.y += h.userData.velocity.y;
        h.position.z += h.userData.velocity.z;
        h.material.emissiveIntensity = h.userData.life * 0.8;
        h.scale.setScalar(h.userData.life);
    }

    renderer.render(scene, camera);
}
animate();

// Expor função pro clique no botão
window.triggerHeartExplosion = createHeartExplosion;

// Redimensionamento
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
