
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useThreeScene } from '../hooks/useThreeScene';
import { LabItem, LabType, Particle, SafetyLevel, Chemical } from '../types';
import { analyzeReaction } from '../data/safetyRules';
import { getChemicals } from '../data/chemicalDatabase';
import { safetyService } from '../services/safetyService';
import { audioService } from '../services/audioService';

interface Props {
  labType: LabType;
  droppedItem: LabItem | null;
  onItemProcessed: () => void;
  onReaction: (result: any) => void;
  onContentsChange?: (contents: string[]) => void;
  onHover?: (name: string | null) => void;
}

const getLabTheme = (type: LabType) => {
    switch(type) {
        case LabType.BIOLOGY: 
            return { 
                bg: '#022c22', // Dark Green
                floorColor: 0x14532d, // Moss Green
                wallColor: 0xdcfce7, // Pale Green
                benchColor: 0x78350f, // Wood
                lightColor: 0xfff7ed, // Warm
                accent: 0x22c55e,
                grid: false
            };
        case LabType.PHYSICS: 
            return { 
                bg: '#0c0a09', // Stone Dark
                floorColor: 0x1c1917, // Concrete
                wallColor: 0x292524, // Dark Grey
                benchColor: 0x262626, // Industrial Metal
                lightColor: 0xffedd5, // Warm/Stark
                accent: 0xf97316,
                grid: true
            };
        default: // CHEMISTRY
            return { 
                bg: '#0f172a', // Slate
                floorColor: 0x334155, // Slate Blue
                wallColor: 0xf1f5f9, // White Tile
                benchColor: 0xe2e8f0, // Lab White/Grey
                lightColor: 0xe0f2fe, // Cool Blue
                accent: 0x06b6d4,
                grid: false
            };
    }
};

const VirtualLabScene: React.FC<Props> = ({ labType, droppedItem, onItemProcessed, onReaction, onContentsChange, onHover }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const theme = getLabTheme(labType);
  
  // Professional Camera Angle
  const { sceneRef, cameraRef, rendererRef, controlsRef, frameIdRef } = useThreeScene({
      mountRef,
      cameraPos: [0, 8, 12], 
      bgColor: theme.bg
  });

  // Simulation State
  const itemsRef = useRef<THREE.Mesh[]>([]); // Moveable objects
  const staticItemsRef = useRef<THREE.Mesh[]>([]); // Bench, walls, main beaker
  const particlesRef = useRef<Particle[]>([]); 
  const particleMeshRef = useRef<THREE.InstancedMesh | null>(null);
  
  // Interaction State
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  const dragItemRef = useRef<{ mesh: THREE.Mesh, offset: THREE.Vector3, startPos: THREE.Vector3 } | null>(null);
  const planeRef = useRef<THREE.Plane>(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const mainContainerRef = useRef<THREE.Mesh | null>(null);
  const dropZoneRef = useRef<THREE.Mesh | null>(null);

  const TABLE_HEIGHT = 3.8; 

  // --- INIT CONTENT ---
  useEffect(() => {
    if (!sceneRef.current || !rendererRef.current) return;

    const scene = sceneRef.current;
    const currentTheme = getLabTheme(labType);
    
    rendererRef.current.shadowMap.enabled = true;
    rendererRef.current.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current.toneMapping = THREE.ACESFilmicToneMapping;
    rendererRef.current.toneMappingExposure = 1.1;

    scene.clear();
    scene.background = new THREE.Color(currentTheme.bg);
    scene.fog = new THREE.Fog(currentTheme.bg, 10, 50);
    
    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);

    const overheadLight = new THREE.DirectionalLight(currentTheme.lightColor, 1.0);
    overheadLight.position.set(5, 15, 2);
    overheadLight.castShadow = true;
    overheadLight.shadow.mapSize.width = 2048;
    overheadLight.shadow.mapSize.height = 2048;
    scene.add(overheadLight);

    const fillLight = new THREE.DirectionalLight(currentTheme.accent, 0.3); 
    fillLight.position.set(-8, 5, 5);
    scene.add(fillLight);

    // Environment
    createProfessionalLab(scene, currentTheme);

    // Particle System
    const pGeo = new THREE.SphereGeometry(0.08, 8, 8);
    const pMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 });
    const pMesh = new THREE.InstancedMesh(pGeo, pMat, 2000);
    pMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(pMesh);
    particleMeshRef.current = pMesh;

    // Controls
    if (controlsRef.current) {
        controlsRef.current.maxPolarAngle = Math.PI / 2.5; 
        controlsRef.current.minDistance = 6;
        controlsRef.current.maxDistance = 18;
        controlsRef.current.target.set(0, TABLE_HEIGHT + 1, 0); 
        controlsRef.current.enablePan = false;
        controlsRef.current.minAzimuthAngle = -Math.PI / 3;
        controlsRef.current.maxAzimuthAngle = Math.PI / 3;
    }

    // Input Listeners
    const canvas = rendererRef.current?.domElement;
    if (canvas) {
        canvas.addEventListener('mousedown', onMouseDown);
        canvas.addEventListener('mousemove', onMouseMove);
        canvas.addEventListener('mouseup', onMouseUp);
        canvas.addEventListener('touchstart', onTouchStart, { passive: false });
        canvas.addEventListener('touchmove', onTouchMove, { passive: false });
        canvas.addEventListener('touchend', onMouseUp);
    }

    // Loop
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      updateSimulation(); 
      if (controlsRef.current) controlsRef.current.update();
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
          rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    return () => {
      if (canvas) {
          canvas.removeEventListener('mousedown', onMouseDown);
          canvas.removeEventListener('mousemove', onMouseMove);
          canvas.removeEventListener('mouseup', onMouseUp);
          canvas.removeEventListener('touchstart', onTouchStart);
          canvas.removeEventListener('touchmove', onTouchMove);
          canvas.removeEventListener('touchend', onMouseUp);
      }
      itemsRef.current = [];
      staticItemsRef.current = [];
      particlesRef.current = [];
    };
  }, [sceneRef.current, labType]);

  // --- ENVIRONMENT ---
  const createProfessionalLab = (scene: THREE.Scene, theme: any) => {
      const floorMat = new THREE.MeshStandardMaterial({ color: theme.floorColor, roughness: 0.6, metalness: 0.1 });
      const wallMat = new THREE.MeshStandardMaterial({ color: theme.wallColor, roughness: 0.9 });
      const cabinetBodyMat = new THREE.MeshStandardMaterial({ color: theme.benchColor, roughness: 0.4, metalness: 0.2 });
      const epoxyTopMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2, metalness: 0.1 });

      // Room
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), floorMat);
      floor.rotation.x = -Math.PI / 2;
      floor.receiveShadow = true;
      scene.add(floor);

      if (theme.grid) {
          const grid = new THREE.GridHelper(60, 60, theme.accent, 0x333333);
          grid.position.y = 0.01;
          scene.add(grid);
      }

      const backWall = new THREE.Mesh(new THREE.PlaneGeometry(60, 30), wallMat);
      backWall.position.set(0, 15, -12);
      backWall.receiveShadow = true;
      scene.add(backWall);

      // Bench
      const benchWidth = 22, benchDepth = 8, benchHeight = 3.6;
      const benchBody = new THREE.Mesh(new THREE.BoxGeometry(benchWidth, benchHeight, benchDepth - 1), cabinetBodyMat);
      benchBody.position.set(0, benchHeight / 2, 0);
      benchBody.castShadow = true;
      benchBody.receiveShadow = true;
      scene.add(benchBody);

      const topGeo = new THREE.BoxGeometry(benchWidth + 1, 0.2, benchDepth);
      const counterTop = new THREE.Mesh(topGeo, epoxyTopMat);
      counterTop.position.set(0, benchHeight + 0.1, 0);
      counterTop.castShadow = true;
      counterTop.receiveShadow = true;
      scene.add(counterTop);
      staticItemsRef.current.push(counterTop);

      // Shelf
      const shelf = new THREE.Mesh(new THREE.BoxGeometry(20, 0.2, 3), cabinetBodyMat);
      shelf.position.set(0, 9, -12);
      shelf.castShadow = true;
      shelf.receiveShadow = true;
      scene.add(shelf);

      // Plane for Dragging
      planeRef.current = new THREE.Plane(new THREE.Vector3(0, 1, 0), -TABLE_HEIGHT);

      // Only add mixing station for Chem/Bio
      if (labType !== LabType.PHYSICS) {
          createTestingStation(scene, theme);
      } else {
          // Add Physics Target Markings
          const targetGeo = new THREE.RingGeometry(0.2, 0.3, 32);
          const targetMat = new THREE.MeshBasicMaterial({ color: theme.accent, opacity: 0.5, transparent: true, side: THREE.DoubleSide });
          const target = new THREE.Mesh(targetGeo, targetMat);
          target.rotation.x = -Math.PI / 2;
          target.position.set(0, TABLE_HEIGHT + 0.02, 0);
          scene.add(target);
          staticItemsRef.current.push(target);
      }
  };

  const createTestingStation = (scene: THREE.Scene, theme: any) => {
      // Drop Zone Ring (Visual Guide)
      const ringGeo = new THREE.RingGeometry(1.6, 2.0, 32);
      const ringMat = new THREE.MeshBasicMaterial({ color: theme.accent, transparent: true, opacity: 0.0, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(0, TABLE_HEIGHT + 0.02, 0);
      scene.add(ring);
      dropZoneRef.current = ring;

      // Beaker (Main Container)
      const geo = new THREE.CylinderGeometry(1.4, 1.4, 2.2, 32, 1, true);
      const mat = new THREE.MeshPhysicalMaterial({
          color: 0xffffff, transmission: 0.95, opacity: 1, metalness: 0, roughness: 0.05, ior: 1.5, thickness: 0.2, side: THREE.DoubleSide
      });
      const beaker = new THREE.Mesh(geo, mat);
      beaker.position.set(0, TABLE_HEIGHT + 1.1, 0); 
      beaker.castShadow = true;
      beaker.userData = { id: 'main_beaker', name: 'Mixing Station', isLiquid: true, contents: [], level: 0 };
      
      const liqGeo = new THREE.CylinderGeometry(1.3, 1.3, 2.0, 32);
      const liqMat = new THREE.MeshPhysicalMaterial({ color: 0x3b82f6, transmission: 0.6, roughness: 0.2 });
      const liquid = new THREE.Mesh(liqGeo, liqMat);
      liquid.scale.set(1, 0.01, 1);
      liquid.position.y = -1.0;
      liquid.visible = false;
      beaker.add(liquid);

      scene.add(beaker);
      staticItemsRef.current.push(beaker);
      mainContainerRef.current = beaker;
  };

  // --- SPAWNING ---
  useEffect(() => {
      if (droppedItem && sceneRef.current) {
          spawnItem(droppedItem);
          onItemProcessed();
      }
  }, [droppedItem]);

  const spawnItem = (item: LabItem) => {
      const scene = sceneRef.current;
      if (!scene) return;

      const color = item.color ? new THREE.Color(item.color) : new THREE.Color(0xffffff);
      let mesh: THREE.Mesh;
      let restingRotation = { x: 0, y: 0, z: 0 };

      if (item.type === 'CHEMICAL') {
          // Chemical Bottle
          const bottleGeo = new THREE.CylinderGeometry(0.4, 0.4, 1.2, 32);
          const bottleMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.2, transmission: 0.5, thickness: 0.1 }); 
          mesh = new THREE.Mesh(bottleGeo, bottleMat);
          
          const liqGeo = new THREE.CylinderGeometry(0.35, 0.35, 1.0, 32);
          const liqMat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.1 });
          const liquid = new THREE.Mesh(liqGeo, liqMat);
          liquid.position.y = -0.05;
          mesh.add(liquid);

          const capGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.3, 16);
          const capMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });
          const cap = new THREE.Mesh(capGeo, capMat);
          cap.position.y = 0.75;
          mesh.add(cap);

          // Label
          const labelGeo = new THREE.PlaneGeometry(0.6, 0.6);
          const textureCanvas = document.createElement('canvas');
          const ctx = textureCanvas.getContext('2d');
          if (ctx) {
              textureCanvas.width = 128; textureCanvas.height = 128;
              ctx.fillStyle = '#ffffff'; ctx.fillRect(0,0,128,128);
              ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 6; ctx.strokeRect(0,0,128,128);
              ctx.fillStyle = '#000000'; ctx.font = 'bold 40px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
              ctx.fillText(item.name.substring(0, 3).toUpperCase(), 64, 64);
          }
          const labelTexture = new THREE.CanvasTexture(textureCanvas);
          const labelMat = new THREE.MeshBasicMaterial({ map: labelTexture });
          const label = new THREE.Mesh(labelGeo, labelMat);
          label.position.z = 0.41;
          mesh.add(label);
      } else {
          // EQUIPMENT / TOOLS
          if (item.id.includes('magnet')) {
              mesh = createMagnet(scene);
              mesh.rotation.x = -Math.PI / 2;
              restingRotation.x = -Math.PI / 2;
          } else if (item.id.includes('ball') || item.id.includes('sphere')) {
              const geo = new THREE.SphereGeometry(0.5, 32, 32);
              const mat = new THREE.MeshStandardMaterial({ color: color, metalness: 0.5, roughness: 0.4 });
              mesh = new THREE.Mesh(geo, mat);
          } else if (item.id.includes('ramp')) {
              mesh = createRamp(color);
              mesh.rotation.y = Math.PI / 4;
              restingRotation.y = Math.PI / 4;
          } else if (item.id.includes('spring')) {
              mesh = createSpring();
          } else if (item.id.includes('ruler')) {
              mesh = createRuler();
              mesh.rotation.x = -Math.PI / 2;
              restingRotation.x = -Math.PI / 2;
          } else if (item.id.includes('stopwatch')) {
              mesh = createStopwatch();
              mesh.rotation.x = -Math.PI / 2;
              restingRotation.x = -Math.PI / 2;
          } else if (item.id.includes('scale')) {
              mesh = createScale();
          } else if (item.id.includes('prism')) {
              mesh = createPrism();
          } else if (item.id.includes('thermometer')) {
              mesh = createThermometer();
          } else {
              // Default Box for others
              const geo = new THREE.BoxGeometry(0.8, 0.2, 0.8);
              const mat = new THREE.MeshStandardMaterial({ color: 0x64748b });
              mesh = new THREE.Mesh(geo, mat);
          }
      }

      const angle = Math.random() * Math.PI * 2;
      const radius = 3.5 + Math.random() * 2; 
      // Adjust Y spawn based on item
      const spawnY = TABLE_HEIGHT + (item.id.includes('scale') ? 0.2 : 0.6);
      mesh.position.set(Math.cos(angle) * radius, spawnY, Math.sin(angle) * radius); 
      
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = { 
          id: item.id, 
          type: item.type, 
          name: item.name, 
          itemData: item, 
          draggable: true,
          restingRotation 
      };
      
      scene.add(mesh);
      itemsRef.current.push(mesh);
      audioService.playSound('DING');
  };

  // --- MODEL GENERATORS ---

  const createMagnet = (scene: THREE.Scene) => {
      const container = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.8, 0.5), new THREE.MeshBasicMaterial({ visible: false }));
      const redMat = new THREE.MeshStandardMaterial({ color: 0xe11d48, roughness: 0.3, metalness: 0.2 });
      const silverMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.2, metalness: 0.8 });

      const archGeo = new THREE.TorusGeometry(0.4, 0.2, 16, 32, Math.PI);
      const arch = new THREE.Mesh(archGeo, redMat);
      arch.position.y = 0.2;
      container.add(arch);

      const legGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.6, 16);
      const leftLeg = new THREE.Mesh(legGeo, redMat);
      leftLeg.position.set(-0.4, -0.1, 0);
      container.add(leftLeg);
      const rightLeg = new THREE.Mesh(legGeo, redMat);
      rightLeg.position.set(0.4, -0.1, 0);
      container.add(rightLeg);

      const poleGeo = new THREE.BoxGeometry(0.4, 0.3, 0.4);
      const leftPole = new THREE.Mesh(poleGeo, silverMat);
      leftPole.position.set(-0.4, -0.55, 0);
      container.add(leftPole);
      const rightPole = new THREE.Mesh(poleGeo, silverMat);
      rightPole.position.set(0.4, -0.55, 0);
      container.add(rightPole);

      // Labels
      const createLabel = (text: string) => {
          const cvs = document.createElement('canvas'); cvs.width = 64; cvs.height = 64;
          const ctx = cvs.getContext('2d');
          if(ctx) { ctx.font='bold 48px Arial'; ctx.fillStyle='black'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(text,32,32); }
          return new THREE.Mesh(new THREE.PlaneGeometry(0.3,0.3), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cvs), transparent:true }));
      };
      const n = createLabel('N'); n.position.set(-0.4,-0.55,0.21); container.add(n);
      const s = createLabel('S'); s.position.set(0.4,-0.55,0.21); container.add(s);

      return container;
  };

  const createRamp = (color: THREE.Color) => {
      const shape = new THREE.Shape();
      shape.moveTo(0, 0); shape.lineTo(2, 0); shape.lineTo(0, 1); shape.lineTo(0, 0);
      const geo = new THREE.ExtrudeGeometry(shape, { depth: 1, bevelEnabled: false });
      const mat = new THREE.MeshStandardMaterial({ color: 0x888888 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.geometry.center();
      return mesh;
  };

  const createSpring = () => {
      const curve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(0, -0.5, 0), new THREE.Vector3(0.5, -0.25, 0.5), new THREE.Vector3(0, 0, 1),
          new THREE.Vector3(-0.5, 0.25, 0.5), new THREE.Vector3(0, 0.5, 0), new THREE.Vector3(0.5, 0.75, -0.5), new THREE.Vector3(0, 1, 0)
      ]); 
      const geo = new THREE.TubeGeometry(curve, 64, 0.08, 8, false);
      const mat = new THREE.MeshStandardMaterial({ color: 0x64748b });
      return new THREE.Mesh(geo, mat);
  };

  const createRuler = () => {
      // Yellow box
      const geo = new THREE.BoxGeometry(3, 0.05, 0.5);
      
      // Texture
      const cvs = document.createElement('canvas');
      cvs.width = 512; cvs.height = 64;
      const ctx = cvs.getContext('2d');
      if (ctx) {
          ctx.fillStyle = '#facc15'; ctx.fillRect(0,0,512,64);
          ctx.fillStyle = '#000000'; ctx.lineWidth = 2;
          for(let i=0; i<=10; i++) {
              const x = i * (512/10);
              ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 30); ctx.stroke();
              ctx.font = '20px Arial'; ctx.fillText(i + '', x + 5, 50);
          }
      }
      const tex = new THREE.CanvasTexture(cvs);
      const mat = new THREE.MeshStandardMaterial({ map: tex, color: 0xffffff });
      return new THREE.Mesh(geo, mat);
  };

  const createStopwatch = () => {
      const group = new THREE.Group();
      // Body
      const bodyGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 32);
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.5, roughness: 0.2 });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.rotation.x = Math.PI / 2;
      group.add(body);
      
      // Face (Screen)
      const cvs = document.createElement('canvas'); cvs.width=128; cvs.height=128;
      const ctx = cvs.getContext('2d');
      if(ctx) {
          ctx.fillStyle='#ffffff'; ctx.beginPath(); ctx.arc(64,64,60,0,Math.PI*2); ctx.fill();
          ctx.fillStyle='#000000'; ctx.font='bold 40px monospace'; ctx.textAlign='center'; ctx.textBaseline='middle';
          ctx.fillText('00:00', 64, 64);
      }
      const faceGeo = new THREE.PlaneGeometry(0.7, 0.7);
      const faceMat = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cvs), transparent: true });
      const face = new THREE.Mesh(faceGeo, faceMat);
      face.position.z = 0.11;
      group.add(face);

      // Buttons
      const btnGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.15);
      const btn1 = new THREE.Mesh(btnGeo, bodyMat);
      btn1.position.set(0.3, 0.5, 0);
      group.add(btn1);
      const btn2 = new THREE.Mesh(btnGeo, bodyMat);
      btn2.position.set(-0.3, 0.5, 0);
      group.add(btn2);

      // Hitbox for clicking
      const hit = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 0.5), new THREE.MeshBasicMaterial({visible:false}));
      group.add(hit);
      group.userData.interactable = true; // Mark for click logic

      return group as unknown as THREE.Mesh;
  };

  const createScale = () => {
      const group = new THREE.Group();
      // Base
      const base = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.2, 1.5), new THREE.MeshStandardMaterial({ color: 0x475569 }));
      group.add(base);
      
      // Pan
      const pan = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.05, 32), new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.6 }));
      pan.position.y = 0.15;
      group.add(pan);

      // Screen
      const screenGeo = new THREE.PlaneGeometry(0.8, 0.3);
      const cvs = document.createElement('canvas'); cvs.width=128; cvs.height=64;
      const ctx = cvs.getContext('2d');
      if(ctx) {
          ctx.fillStyle='#0f172a'; ctx.fillRect(0,0,128,64);
          ctx.fillStyle='#22c55e'; ctx.font='bold 40px monospace'; ctx.textAlign='center'; ctx.textBaseline='middle';
          ctx.fillText('0.00 g', 64, 32);
      }
      const screenMat = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cvs) });
      const screen = new THREE.Mesh(screenGeo, screenMat);
      screen.position.set(0, 0.11, 0.6);
      screen.rotation.x = -Math.PI / 4;
      group.add(screen);
      
      group.userData.isScale = true; // Mark for weighing logic
      group.userData.screenMesh = screen; // Ref to update texture

      return group as unknown as THREE.Mesh;
  };

  const createPrism = () => {
      const shape = new THREE.Shape();
      shape.moveTo(-0.5, 0);
      shape.lineTo(0.5, 0);
      shape.lineTo(0, 1);
      shape.lineTo(-0.5, 0);
      const geo = new THREE.ExtrudeGeometry(shape, { depth: 1, bevelEnabled: false });
      geo.center(); // Center geometry
      const mat = new THREE.MeshPhysicalMaterial({ 
          color: 0xffffff, transmission: 0.9, opacity: 1, transparent: true, roughness: 0, metalness: 0, ior: 1.5 
      });
      return new THREE.Mesh(geo, mat);
  };

  const createThermometer = () => {
      const group = new THREE.Group();
      const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 2, 16), new THREE.MeshPhysicalMaterial({ color: 0xffffff, transmission: 0.5, transparent: true }));
      group.add(tube);
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 16), new THREE.MeshStandardMaterial({ color: 0xef4444 }));
      bulb.position.y = -1;
      group.add(bulb);
      const liquid = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.5, 8), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
      liquid.position.y = -0.25;
      group.add(liquid);
      return group as unknown as THREE.Mesh;
  };

  // --- LOOP & PHYSICS ---
  const updateSimulation = () => {
      // Update Particles
      const pMesh = particleMeshRef.current;
      if (pMesh) {
          const dummy = new THREE.Object3D();
          let alive: Particle[] = [];
          for(let i=0; i<particlesRef.current.length; i++) {
              const p = particlesRef.current[i];
              p.life -= 0.015;
              p.x += p.vx;
              p.y += p.vy;
              p.z += p.vz;
              
              if(p.life > 0) {
                  dummy.position.set(p.x, p.y, p.z);
                  dummy.scale.setScalar(p.size * p.life);
                  dummy.updateMatrix();
                  pMesh.setMatrixAt(alive.length, dummy.matrix);
                  pMesh.setColorAt(alive.length, new THREE.Color(p.color));
                  alive.push(p);
              }
          }
          // Hide unused instances
          for(let i=alive.length; i<particlesRef.current.length; i++) {
               pMesh.setMatrixAt(i, new THREE.Matrix4().scale(new THREE.Vector3(0,0,0)));
          }
          particlesRef.current = alive;
          pMesh.instanceMatrix.needsUpdate = true;
          if (pMesh.instanceColor) pMesh.instanceColor.needsUpdate = true;
      }

      // Physics Lab Logic
      if (labType === LabType.PHYSICS) {
          const magnets = itemsRef.current.filter(i => i.userData.id && i.userData.id.includes('magnet'));
          // Identify metals by keywords in their ID
          const metals = itemsRef.current.filter(i => i.userData.id && (i.userData.id.includes('steel') || i.userData.id.includes('iron') || i.userData.id.includes('spring') || i.userData.id.includes('ball')));
          const scales = itemsRef.current.filter(i => i.userData.isScale);

          // Magnet Attraction
          magnets.forEach(magnet => {
              metals.forEach(metal => {
                  if (dragItemRef.current?.mesh === metal) return; // Don't pull if user is holding it

                  const dist = magnet.position.distanceTo(metal.position);
                  if (dist < 6.0) {
                      // Calculate force vector
                      const dir = new THREE.Vector3().subVectors(magnet.position, metal.position).normalize();
                      const forceStrength = 0.25 / (dist * dist + 0.1); // Strong magnetic pull
                      
                      // Move metal towards magnet
                      metal.position.add(dir.multiplyScalar(forceStrength));
                      
                      // Rotate metal to face magnet (alignment)
                      metal.lookAt(magnet.position);

                      // Visual Spark if very close (snap effect)
                      if (dist < 1.2 && Math.random() > 0.92) {
                          spawnParticles(metal.position, 'BUBBLE', 0xfacc15); // Yellow sparks
                      }
                  }
              });
          });

          // Scale Functionality
          scales.forEach(scale => {
              // Find items on top of scale
              const onScale = itemsRef.current.find(item => {
                  if (item === scale) return false;
                  // Simple AABB check or distance check
                  const distXZ = new THREE.Vector2(item.position.x, item.position.z).distanceTo(new THREE.Vector2(scale.position.x, scale.position.z));
                  const distY = Math.abs(item.position.y - scale.position.y);
                  return distXZ < 0.8 && distY < 1.0 && distY > 0;
              });

              let weightText = "0.00 g";
              if (onScale) {
                  // Simulate weight based on name/type
                  let weight = 100;
                  if (onScale.userData.id.includes('steel')) weight = 250;
                  else if (onScale.userData.id.includes('wood')) weight = 80;
                  else if (onScale.userData.id.includes('magnet')) weight = 150;
                  weightText = weight.toFixed(2) + " g";
              }

              // Update texture only if changed (optimization: usually track prev state, here simple redraw)
              if (scale.userData.lastWeight !== weightText) {
                  const screen = scale.userData.screenMesh as THREE.Mesh;
                  if (screen) {
                      const cvs = document.createElement('canvas'); cvs.width=128; cvs.height=64;
                      const ctx = cvs.getContext('2d');
                      if(ctx) {
                          ctx.fillStyle='#0f172a'; ctx.fillRect(0,0,128,64);
                          ctx.fillStyle='#22c55e'; ctx.font='bold 40px monospace'; ctx.textAlign='center'; ctx.textBaseline='middle';
                          ctx.fillText(weightText, 64, 32);
                      }
                      (screen.material as THREE.MeshBasicMaterial).map = new THREE.CanvasTexture(cvs);
                      (screen.material as THREE.MeshBasicMaterial).needsUpdate = true;
                  }
                  scale.userData.lastWeight = weightText;
              }
          });
      }

      // Interaction Logic
      if (dragItemRef.current) {
          const { mesh } = dragItemRef.current;
          
          // Chemistry mixing logic
          if (labType === LabType.CHEMISTRY || labType === LabType.BIOLOGY) {
              const target = mainContainerRef.current;
              if (target && mesh.userData.type === 'CHEMICAL') {
                  const dist = new THREE.Vector3(mesh.position.x, 0, mesh.position.z)
                               .distanceTo(new THREE.Vector3(target.position.x, 0, target.position.z));
                  
                  // Activate Drop Zone Visual
                  if (dropZoneRef.current) {
                      dropZoneRef.current.material.opacity = dist < 2.5 ? 0.5 : 0.0;
                  }

                  if (dist < 2.5) {
                      // Tilt and Pour
                      const lookPos = target.position.clone();
                      lookPos.y = mesh.position.y;
                      mesh.lookAt(lookPos);
                      mesh.rotateX(Math.PI / 2.5); // 70 degree tilt
                      
                      // Emit particles
                      if (Math.random() > 0.5) {
                          particlesRef.current.push({
                              id: Math.random(),
                              x: mesh.position.x, y: mesh.position.y - 0.5, z: mesh.position.z,
                              vx: (target.position.x - mesh.position.x) * 0.05 + (Math.random()-0.5)*0.05,
                              vy: -0.15,
                              vz: (target.position.z - mesh.position.z) * 0.05 + (Math.random()-0.5)*0.05,
                              life: 1.0, color: mesh.userData.itemData?.color || '#fff', size: 0.15, type: 'LIQUID'
                          });
                      }
                      addToBeaker(target, mesh.userData.id, mesh.userData.itemData?.color);
                  } else {
                      mesh.rotation.set(0,0,0);
                  }
              }
          }
      } else {
          if (dropZoneRef.current) dropZoneRef.current.material.opacity = 0;
      }
  };

  const addToBeaker = (beaker: THREE.Mesh, chemId: string, colorHex?: string) => {
      const liquid = beaker.children.find(c => c instanceof THREE.Mesh && c !== beaker && c.geometry.type === 'CylinderGeometry') as THREE.Mesh;
      if (!liquid) return;

      const currentContents = beaker.userData.contents || [];
      
      // Fill visual
      if (beaker.userData.level < 1) {
          beaker.userData.level += 0.005;
          liquid.scale.set(1, beaker.userData.level, 1);
          liquid.position.y = -1.1 + (beaker.userData.level * 1.0); 
          liquid.visible = true;
          
          if (colorHex) {
              const newColor = new THREE.Color(colorHex);
              const mat = liquid.material as THREE.MeshPhysicalMaterial;
              mat.color.lerp(newColor, 0.05);
          }
      }

      // Add logic
      if (!currentContents.includes(chemId)) {
          currentContents.push(chemId);
          beaker.userData.contents = currentContents;
          
          // Report changes to parent for step tracking
          if (onContentsChange) onContentsChange(currentContents);

          if (currentContents.length >= 2) {
              checkReaction(currentContents, beaker.position);
          }
      }
  };

  const spawnParticles = (pos: THREE.Vector3, type: 'GAS_CLOUD' | 'FIRE' | 'BUBBLE', color: number) => {
      const count = type === 'FIRE' ? 50 : 20;
      const colorHex = '#' + new THREE.Color(color).getHexString();
      
      for(let i=0; i<count; i++) {
          particlesRef.current.push({
              id: Math.random(),
              x: pos.x + (Math.random()-0.5)*0.5,
              y: pos.y + (Math.random()*0.5),
              z: pos.z + (Math.random()-0.5)*0.5,
              vx: (Math.random()-0.5)*0.1,
              vy: (Math.random()*0.2) + 0.05,
              vz: (Math.random()-0.5)*0.1,
              life: 1.0 + Math.random(),
              color: colorHex,
              size: type === 'FIRE' ? 0.3 : 0.1,
              type: type === 'BUBBLE' ? 'BUBBLE' : (type === 'FIRE' ? 'FIRE' : 'GAS_CLOUD')
          });
      }
  };

  const checkReaction = (contents: string[], pos: THREE.Vector3) => {
      const chemicals = getChemicals();
      // Match IDs to Chemical objects (simple matching for demo)
      const found = contents.map(id => {
          // Extract name from ID e.g. chem_vinegar -> Vinegar
          const match = chemicals.find(c => id.includes(c.id) || c.name.toLowerCase().includes(id.replace('chem_', '').replace('_', ' ')));
          return match;
      }).filter(Boolean) as Chemical[];

      if (found.length >= 2) {
          // Analyze last two
          const c1 = found[found.length-2];
          const c2 = found[found.length-1];
          const result = analyzeReaction(c1, c2);
          
          // ALWAYS report reaction result to UI, even if 'NONE', so user gets info card
          onReaction(result);

          if (result.visualEffect !== 'NONE') {
              // Visuals
              if (result.visualEffect === 'GAS' || result.visualEffect === 'GAS_CLOUD') {
                  spawnParticles(pos, 'GAS_CLOUD', 0x84cc16);
                  audioService.playSound('ERROR');
              } else if (result.visualEffect === 'EXPLOSION') {
                  spawnParticles(pos, 'FIRE', 0xff4400);
                  audioService.playSound('ERROR');
              } else {
                  spawnParticles(pos, 'BUBBLE', 0xffffff);
                  audioService.playSound('BUBBLE');
              }
          }
      }
  };

  // --- INPUT ---
  const updateMouse = (e: MouseEvent | Touch) => {
      if (!rendererRef.current) return;
      const rect = rendererRef.current.domElement.getBoundingClientRect();
      mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  };

  const onMouseDown = (e: MouseEvent) => { updateMouse(e); handleInputStart(); };
  const onTouchStart = (e: TouchEvent) => { if (e.touches.length === 1) { updateMouse(e.touches[0]); handleInputStart(); } };

  const handleInputStart = () => {
      if (!cameraRef.current) return;
      raycaster.current.setFromCamera(mouse.current, cameraRef.current);
      
      const intersects = raycaster.current.intersectObjects(itemsRef.current);
      if (intersects.length > 0) {
          const hit = intersects[0].object as THREE.Mesh;
          const root = hit.parent && hit.parent instanceof THREE.Mesh ? hit.parent : hit;
          
          // Check if interactable (like stopwatch buttons) or just draggable
          if (root.userData.draggable) {
              if (controlsRef.current) controlsRef.current.enabled = false;
              
              const intersectPoint = intersects[0].point;
              // Set dragging plane to the item's height for horizontal movement
              planeRef.current.setComponents(0, 1, 0, -root.position.y);
              
              dragItemRef.current = {
                  mesh: root,
                  startPos: root.position.clone(),
                  offset: root.position.clone().sub(intersectPoint)
              };
          }
      }
  };

  const onMouseMove = (e: MouseEvent) => { updateMouse(e); handleInputMove(); };
  const onTouchMove = (e: TouchEvent) => { if (e.touches.length === 1) { updateMouse(e.touches[0]); handleInputMove(); } };

  const handleInputMove = () => {
      if (cameraRef.current && onHover) {
          raycaster.current.setFromCamera(mouse.current, cameraRef.current);
          const intersects = raycaster.current.intersectObjects([...itemsRef.current, ...staticItemsRef.current], true);
          if (intersects.length > 0) {
              let obj = intersects[0].object;
              while(obj && !obj.userData.name && obj.parent) obj = obj.parent;
              
              if (obj && obj.userData.name) {
                  onHover(obj.userData.name);
                  document.body.style.cursor = 'grab';
              } else {
                  onHover(null);
                  document.body.style.cursor = 'default';
              }
          } else {
              onHover(null);
              document.body.style.cursor = 'default';
          }
      }

      if (dragItemRef.current && cameraRef.current) {
          raycaster.current.setFromCamera(mouse.current, cameraRef.current);
          const target = new THREE.Vector3();
          raycaster.current.ray.intersectPlane(planeRef.current, target);
          
          if (target) {
              const newPos = target.add(dragItemRef.current.offset);
              // Bounds Check
              newPos.x = Math.max(-10, Math.min(10, newPos.x));
              newPos.z = Math.max(-4, Math.min(4, newPos.z));
              // Y is constrained by plane, but we can enforce table height + offset (adjust for balls vs flat items)
              newPos.y = TABLE_HEIGHT + (labType === LabType.PHYSICS && (dragItemRef.current.mesh.userData.id.includes('ball') || dragItemRef.current.mesh.userData.id.includes('sphere')) ? 0.5 : 
                (dragItemRef.current.mesh.userData.isScale ? 0.2 : 0.6)); 
              
              dragItemRef.current.mesh.position.copy(newPos);
          }
      }
  };

  const onMouseUp = () => {
      if (dragItemRef.current) {
          const { mesh, startPos } = dragItemRef.current;
          
          // Click vs Drag Detection
          if (mesh.position.distanceTo(startPos) < 0.2) {
              // Functional Interactions
              if (mesh.userData.id.includes('stopwatch')) {
                  // Toggle timer logic visualization
                  mesh.userData.running = !mesh.userData.running;
                  // Simple texture swap simulation
                  const face = mesh.children.find(c => c.geometry.type === 'PlaneGeometry') as THREE.Mesh;
                  if (face) {
                      const cvs = document.createElement('canvas'); cvs.width=128; cvs.height=128;
                      const ctx = cvs.getContext('2d');
                      if(ctx) {
                          ctx.fillStyle='#ffffff'; ctx.beginPath(); ctx.arc(64,64,60,0,Math.PI*2); ctx.fill();
                          ctx.fillStyle= mesh.userData.running ? '#22c55e' : '#000000'; 
                          ctx.font='bold 40px monospace'; ctx.textAlign='center'; ctx.textBaseline='middle';
                          ctx.fillText(mesh.userData.running ? '00:05' : '00:00', 64, 64);
                      }
                      (face.material as THREE.MeshBasicMaterial).map = new THREE.CanvasTexture(cvs);
                      (face.material as THREE.MeshBasicMaterial).needsUpdate = true;
                  }
                  audioService.playSound('DING');
              } else {
                  // Standard Rotation
                  mesh.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), Math.PI / 2);
                  if (mesh.userData.restingRotation) {
                      mesh.userData.restingRotation.x = mesh.rotation.x;
                      mesh.userData.restingRotation.y = mesh.rotation.y;
                      mesh.userData.restingRotation.z = mesh.rotation.z;
                  }
                  audioService.playSound('DING');
              }
          } else {
              // Dragged
              if (mesh.userData.restingRotation) {
                  mesh.rotation.set(
                      mesh.userData.restingRotation.x,
                      mesh.userData.restingRotation.y,
                      mesh.userData.restingRotation.z
                  );
              } else {
                  mesh.rotation.set(0,0,0);
              }
          }
          
          dragItemRef.current = null;
      }
      if (controlsRef.current) controlsRef.current.enabled = true;
  };

  return <div className="w-full h-full" ref={mountRef} />;
};

export default VirtualLabScene;
