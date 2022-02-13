import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'lil-gui';
import waterVertexShader from './shaders/water/vertex.glsl';
import waterFragmentShader from './shaders/water/fragment.glsl';

/**
 * Base
 */
// Debug
const gui = new dat.GUI({ width: 340 });
const debugObject = {};

debugObject.rainFrequency = 4000;

// wave color
debugObject.depthColor = '#186691';
debugObject.surfaceColor = '#9bd8ff';

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();
const backgroundColor = 0x11111f;

// Textures
let loader = new THREE.TextureLoader();

// Clouds
const cloudContainer = [];

loader.load('clouds.png', function (texture) {
  const cloudGeo = new THREE.PlaneBufferGeometry(500, 500);
  const cloudMaterial = new THREE.MeshLambertMaterial({
    map: texture,
    transparent: true,
    fog: false,
    opacity: 0.9,
  });

  let cloud = new THREE.Mesh(cloudGeo, cloudMaterial);
  cloud.position.set(1, 50, 1);
  cloud.rotation.x = Math.PI / 2;

  cloudContainer.push(cloud);
  scene.add(cloud);
});

// Rain
const innerRainCount = debugObject.rainFrequency * 0.75;
const innerRainDropsCoordinates = [];
for (let i = 0; i < innerRainCount; i++) {
  const x = Math.random() * 10 - 5;
  const y = Math.random() * 50 - 25;
  const z = Math.random() * 10 - 5;

  innerRainDropsCoordinates.push(x, y, z);
}

const innerRainGeo = new THREE.BufferGeometry();
innerRainGeo.setAttribute(
  'position',
  new THREE.Float32BufferAttribute(innerRainDropsCoordinates, 3)
);

const innerRainMaterial = new THREE.PointsMaterial({
  size: 1.75,
  transparent: true,
  fog: false,
  color: '#69768a',
  sizeAttenuation: false,
});

const innerRain = new THREE.Points(innerRainGeo, innerRainMaterial);
const innerRainDrops = innerRainGeo.getAttribute('position');
scene.add(innerRain);

const outerRainCount = debugObject.rainFrequency * 0.25;
const outerRainDropsCoordinates = [];
for (let i = 0; i < outerRainCount; i++) {
  const x = Math.random() * 100 - 50;
  const y = Math.random() * 50 - 25;
  const z = Math.random() * 100 - 50;

  outerRainDropsCoordinates.push(x, y, z);
}

const outerRainGeo = new THREE.BufferGeometry();
outerRainGeo.setAttribute(
  'position',
  new THREE.Float32BufferAttribute(outerRainDropsCoordinates, 3)
);

const outerRainMaterial = new THREE.PointsMaterial({
  size: 1.25,
  transparent: true,
  fog: false,
  color: '#69768a',
  sizeAttenuation: false,
});

const outerRain = new THREE.Points(outerRainGeo, outerRainMaterial);
const outerRainDrops = outerRainGeo.getAttribute('position');
scene.add(outerRain);

// Fog
const fog = new THREE.Fog(backgroundColor, 0.1, 4);
scene.fog = fog;

/**
 * Water
 */
// Geometry
const waterGeometry = new THREE.PlaneGeometry(10, 10, 512, 512);

// Material
const waterMaterial = new THREE.ShaderMaterial({
  vertexShader: waterVertexShader,
  fragmentShader: waterFragmentShader,
  fog: true,
  uniforms: {
    uTime: {
      value: 0,
    },

    uBigWavesElevation: {
      value: 0.2,
    },
    uBigWavesFrequency: {
      value: new THREE.Vector2(4, 1.5),
    },
    uBigWavesSpeed: {
      value: 1.75,
    },

    uSmallWavesElevation: {
      value: 0.15,
    },
    uSmallWavesFrequency: {
      value: 3,
    },
    uSmallWavesSpeed: {
      value: 0.2,
    },
    uSmallWavesIterations: {
      value: 4,
    },

    uDepthColor: {
      value: new THREE.Color(debugObject.depthColor),
    },
    uSurfaceColor: {
      value: new THREE.Color(debugObject.surfaceColor),
    },
    uColorOffset: {
      value: 0.08,
    },
    uColorMultiplier: {
      value: 5,
    },

    fogColor: {
      value: scene.fog.color,
    },
    fogNear: {
      value: scene.fog.near,
    },
    fogFar: {
      value: scene.fog.far,
    },
  },
});

// Debug
gui
  .add(waterMaterial.uniforms.uBigWavesElevation, 'value')
  .min(0)
  .max(1)
  .step(0.001)
  .name('uBigWavesElevation');

gui
  .add(waterMaterial.uniforms.uBigWavesFrequency.value, 'x')
  .min(0)
  .max(10)
  .step(0.001)
  .name('uBigWavesFrequencyX');

gui
  //this is actually manipulating the Z axis, but since vec2 only has (X,Y), this is the Y value
  .add(waterMaterial.uniforms.uBigWavesFrequency.value, 'y')
  .min(0)
  .max(10)
  .step(0.001)
  .name('uBigWavesFrequencyY');

gui
  .add(waterMaterial.uniforms.uBigWavesSpeed, 'value')
  .min(0)
  .max(4)
  .step(0.001)
  .name('uBigWavesSpeed');

gui
  .add(waterMaterial.uniforms.uSmallWavesElevation, 'value')
  .min(0)
  .max(1)
  .step(0.001)
  .name('uSmallWavesElevation');

gui
  .add(waterMaterial.uniforms.uSmallWavesFrequency, 'value')
  .min(0)
  .max(30)
  .step(0.001)
  .name('uSmallWavesFrequency');

gui
  .add(waterMaterial.uniforms.uSmallWavesSpeed, 'value')
  .min(0)
  .max(4)
  .step(0.001)
  .name('uSmallWavesSpeed');

gui
  .add(waterMaterial.uniforms.uSmallWavesIterations, 'value')
  .min(0)
  .max(4)
  .step(1)
  .name('uSmallWavesIterations');

gui
  .addColor(debugObject, 'depthColor')
  .name('depthColor')
  .onChange(() => {
    waterMaterial.uniforms.uDepthColor.value.set(debugObject.depthColor);
  });

gui
  .addColor(debugObject, 'surfaceColor')
  .name('surfaceColor')
  .onChange(() => {
    waterMaterial.uniforms.uSurfaceColor.value.set(debugObject.surfaceColor);
  });

gui
  .add(waterMaterial.uniforms.uColorOffset, 'value')
  .min(0)
  .max(1)
  .step(0.001)
  .name('uColorOffset');

gui
  .add(waterMaterial.uniforms.uColorMultiplier, 'value')
  .min(0)
  .max(10)
  .step(0.001)
  .name('uColorMultiplier');

gui
  .add(debugObject, 'rainFrequency')
  .min(0)
  .max(10000)
  .step(1000)
  .onChange((total) => {
    debugObject.rainFrequency = total;
  });

// Mesh
const water = new THREE.Mesh(waterGeometry, waterMaterial);
water.rotation.x = -Math.PI * 0.5;
scene.add(water);

// Lights
const ambient = new THREE.AmbientLight(0x555555);
scene.add(ambient);

const lightning = new THREE.PointLight(0x162d61, 100, 500, 1.7);
lightning.position.set(200, 45, 100); //just a little in front the cloud
scene.add(lightning);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  1000
);
camera.position.set(1, 1, 1);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.enableZoom = false;
controls.enablePan = false;
controls.target = new THREE.Vector3(1.25, 1, 1);
controls.minPolarAngle = Math.PI * 0.35;
controls.maxPolarAngle = Math.PI * 0.6;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(backgroundColor);

// Sounds
let isMuted = true;

// create an AudioListener and add it to the camera
const listener = new THREE.AudioListener();
camera.add(listener);

// create a global audio source
const sound = new THREE.Audio(listener);
const rainLoader = new THREE.AudioLoader();

rainLoader.load('sounds/rain.mp3', function (buffer) {
  sound.setBuffer(buffer);
  sound.setLoop(true);
  sound.setVolume(0.1);
});

const thunder1Sound = new Audio('/sounds/thunder-1.mp3');
const playThunder1Sound = () => {
  if (!isMuted) {
    thunder1Sound.volume = 0.2;
    thunder1Sound.play();
  }
};

const thunder2Sound = new Audio('/sounds/thunder-2.mp3');
const playThunder2Sound = () => {
  if (!isMuted) {
    thunder2Sound.volume = 0.2;
    thunder2Sound.play();
  }
};

const thunder3Sound = new Audio('/sounds/thunder-3.mp3');
const playThunder3Sound = () => {
  if (!isMuted) {
    thunder3Sound.volume = 0.2;
    thunder3Sound.play();
  }
};

const clickSoundIcon = () => {
  if (isMuted) {
    document.getElementById('soundIcon').src = '/unmuted.png';
    sound.play();
  } else {
    document.getElementById('soundIcon').src = '/muted.png';
    sound.pause();
    thunder1Sound.pause();
    thunder1Sound.currentTime = 0;
    thunder2Sound.pause();
    thunder2Sound.currentTime = 0;
    thunder3Sound.pause();
    thunder3Sound.currentTime = 0;
  }
  isMuted = !isMuted;
};

const soundIcon = document
  .getElementById('soundIcon')
  .addEventListener('click', clickSoundIcon);

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update water
  waterMaterial.uniforms.uTime.value = elapsedTime;

  // Update cloud
  cloudContainer.forEach((cloud) => {
    cloud.rotation.z -= 0.002;
  });

  // Update lightning
  if (Math.random() > 0.9 || lightning.power > 100) {
    if (lightning.power < 100) {
      lightning.position.set(
        Math.random() * 400,
        30 + Math.random() * 20,
        Math.random() * 400
      );
    }
    lightning.power = 60 + Math.random() * 185;

    if (lightning.power > 243) {
      playThunder1Sound();
    } else if (lightning.power <= 243 && lightning.power > 200) {
      playThunder2Sound();
    } else if (lightning.power <= 200 && lightning.power > 100) {
      playThunder3Sound();
    }
  }

  // Update rain
  for (let i = 0; i < innerRainDrops.count; i++) {
    let y = innerRainDrops.getY(i);

    if (y < -15) {
      y = Math.random() * 50 - 5;
    } else {
      y -= 0.2;
    }

    innerRainDrops.setY(i, y);
  }
  innerRainDrops.needsUpdate = true;

  for (let i = 0; i < outerRainDrops.count; i++) {
    let y = outerRainDrops.getY(i);

    if (y < -50) {
      y = Math.random() * 50 - 5;
    } else {
      y -= 1.5;
    }

    outerRainDrops.setY(i, y);
  }
  outerRainDrops.needsUpdate = true;

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
