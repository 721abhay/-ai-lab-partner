
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useThreeScene } from '../hooks/useThreeScene';
import { BiologyModel } from '../data/biologyModels';
import { Play, Pause, RotateCcw, X, Info, Search, MousePointer2 } from 'lucide-react';

interface Props {
  model: BiologyModel;
  onClose: () => void;
}

const BiologyViewer: React.FC<Props> = ({ model, onClose }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  
  // Use custom hook
  const { sceneRef, cameraRef, rendererRef, controlsRef, frameIdRef } = useThreeScene({
      mountRef,
      cameraPos: [0, 5, 15],
      bgColor: '#020617'
  });

  const [isPlaying, setIsPlaying] = useState(true);
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [stageText, setStageText] = useState('');

  // Simulation Refs
  const objectsRef = useRef<{ [key: string]: THREE.Object3D }>({});
  const timeRef = useRef<number>(0);
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());

  useEffect(() => {
    if (!sceneRef.current) return;

    // Additional Lighting specific to Biology View
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(5, 5, 10);
    sceneRef.current.add(dirLight);
    const backLight = new THREE.DirectionalLight(0x06b6d4, 0.5);
    backLight.position.set(-5, 0, -10);
    sceneRef.current.add(backLight);

    initScene(sceneRef.current);

    // Interaction Listener
    const onClick = (e: MouseEvent) => {
        if (!rendererRef.current || !cameraRef.current || !sceneRef.current) return;
        const rect = rendererRef.current.domElement.getBoundingClientRect();
        mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        
        raycaster.current.setFromCamera(mouse.current, cameraRef.current);
        const intersects = raycaster.current.intersectObjects(sceneRef.current.children, true);
        
        // Find first labeled object
        const hit = intersects.find(i => i.object.userData && i.object.userData.id);
        if (hit) {
            setSelectedPart(hit.object.userData.id);
        } else {
            setSelectedPart(null);
        }
    };

    const canvas = rendererRef.current?.domElement;
    if (canvas) canvas.addEventListener('click', onClick);

    // Loop
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      if (isPlaying) {
          timeRef.current += 0.01;
          updateScene(timeRef.current);
      }
      if (controlsRef.current) controlsRef.current.update();
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
          rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    return () => {
        if (canvas) canvas.removeEventListener('click', onClick);
        objectsRef.current = {};
    };
  }, [sceneRef.current, model.type]);

  // --- SCENE GENERATION ---
  const initScene = (scene: THREE.Scene) => {
      objectsRef.current = {};

      if (model.type === 'CELL_ANIMAL') {
          // Cell Membrane (Cutaway)
          const membraneGeo = new THREE.SphereGeometry(4, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.7);
          const membraneMat = new THREE.MeshPhysicalMaterial({ 
              color: 0x3b82f6, transmission: 0.2, opacity: 0.5, transparent: true, side: THREE.DoubleSide 
          });
          const membrane = new THREE.Mesh(membraneGeo, membraneMat);
          membrane.rotation.x = Math.PI; // Open top
          scene.add(membrane);

          // Nucleus
          const nucGeo = new THREE.SphereGeometry(1.2, 32, 32);
          const nucMat = new THREE.MeshStandardMaterial({ color: 0xa855f7, roughness: 0.3 });
          const nucleus = new THREE.Mesh(nucGeo, nucMat);
          nucleus.userData = { id: 'nucleus' };
          scene.add(nucleus);
          objectsRef.current['nucleus'] = nucleus;

          // Mitochondria (Capsules)
          const mitoGeo = new THREE.CapsuleGeometry(0.3, 0.8, 4, 8);
          const mitoMat = new THREE.MeshStandardMaterial({ color: 0xef4444 });
          for(let i=0; i<5; i++) {
              const mito = new THREE.Mesh(mitoGeo, mitoMat);
              const theta = (i/5) * Math.PI * 2;
              mito.position.set(Math.cos(theta)*2.5, Math.random()*2 - 1, Math.sin(theta)*2.5);
              mito.rotation.set(Math.random(), Math.random(), Math.random());
              mito.userData = { id: 'mitochondria' };
              scene.add(mito);
          }

          // ER (Torus knots or tubes)
          const erGeo = new THREE.TorusKnotGeometry(1.8, 0.1, 64, 8, 2, 3);
          const erMat = new THREE.MeshStandardMaterial({ color: 0xf472b6 });
          const er = new THREE.Mesh(erGeo, erMat);
          er.userData = { id: 'er' };
          scene.add(er);
          objectsRef.current['er'] = er;

          // Lysosomes
          const lysoGeo = new THREE.SphereGeometry(0.2, 16, 16);
          const lysoMat = new THREE.MeshStandardMaterial({ color: 0xeab308 });
          for(let i=0; i<8; i++) {
              const lyso = new THREE.Mesh(lysoGeo, lysoMat);
              lyso.position.set((Math.random()-0.5)*4, (Math.random()-0.5)*2, (Math.random()-0.5)*4);
              if (lyso.position.length() < 1.5) lyso.position.setLength(2); // Push out of nucleus
              lyso.userData = { id: 'lysosome' };
              scene.add(lyso);
          }

      } else if (model.type === 'DNA') {
          const group = new THREE.Group();
          const strandCount = 40;
          const height = 10;
          const radius = 1.5;
          const rise = height / strandCount;

          for (let i = 0; i < strandCount; i++) {
              const y = (i * rise) - (height / 2);
              const angle = i * 0.5;
              
              const x1 = Math.cos(angle) * radius;
              const z1 = Math.sin(angle) * radius;
              const x2 = Math.cos(angle + Math.PI) * radius;
              const z2 = Math.sin(angle + Math.PI) * radius;

              // Base Pair
              const cylGeo = new THREE.CylinderGeometry(0.1, 0.1, radius * 2, 8);
              cylGeo.rotateZ(Math.PI / 2);
              const cylMat = new THREE.MeshStandardMaterial({ color: i % 2 === 0 ? 0xff4444 : 0x44ff44 }); // A-T vs G-C (simplified)
              const cyl = new THREE.Mesh(cylGeo, cylMat);
              cyl.position.set(0, y, 0);
              cyl.rotation.y = angle;
              
              // Identification
              const pairType = i % 2 === 0 ? 'base_at' : 'base_gc';
              cyl.userData = { id: pairType };
              group.add(cyl);

              // Backbone Spheres
              const bbGeo = new THREE.SphereGeometry(0.25, 16, 16);
              const bbMat = new THREE.MeshStandardMaterial({ color: 0xfacc15 });
              
              const b1 = new THREE.Mesh(bbGeo, bbMat);
              b1.position.set(x1, y, z1);
              b1.userData = { id: 'backbone' };
              group.add(b1);

              const b2 = new THREE.Mesh(bbGeo, bbMat);
              b2.position.set(x2, y, z2);
              b2.userData = { id: 'backbone' };
              group.add(b2);
          }
          scene.add(group);
          objectsRef.current['dna'] = group;

      } else if (model.type === 'ENZYME') {
          // Enzyme (Pacman shape)
          const enzGeo = new THREE.SphereGeometry(2, 32, 32, 0.5, Math.PI * 1.8, 0, Math.PI);
          const enzMat = new THREE.MeshStandardMaterial({ color: 0xa855f7 });
          const enzyme = new THREE.Mesh(enzGeo, enzMat);
          enzyme.rotation.y = Math.PI / 4;
          enzyme.userData = { id: 'enzyme' };
          scene.add(enzyme);
          objectsRef.current['enzyme'] = enzyme;

          // Substrate (Wedge)
          const subGeo = new THREE.CylinderGeometry(1.5, 1.5, 0.5, 32, 1, false, 0, Math.PI / 3);
          const subMat = new THREE.MeshStandardMaterial({ color: 0xfacc15 });
          const substrate = new THREE.Mesh(subGeo, subMat);
          substrate.rotation.x = Math.PI / 2;
          substrate.rotation.z = Math.PI / 2;
          substrate.position.set(5, 0, 0); // Start away
          substrate.userData = { id: 'substrate' };
          scene.add(substrate);
          objectsRef.current['substrate'] = substrate;

      } else if (model.type === 'MITOSIS') {
          // Create 4 Chromosomes
          const chromoGroup = new THREE.Group();
          for(let i=0; i<4; i++) {
              const c = createChromosome();
              c.position.x = (i-1.5) * 1.5;
              chromoGroup.add(c);
          }
          scene.add(chromoGroup);
          objectsRef.current['chromosomes'] = chromoGroup;
          
          // Cell boundary (Wireframe)
          const cellGeo = new THREE.SphereGeometry(6, 32, 32);
          const cellMat = new THREE.MeshBasicMaterial({ color: 0x334155, wireframe: true, transparent: true, opacity: 0.3 });
          const cell = new THREE.Mesh(cellGeo, cellMat);
          scene.add(cell);
          objectsRef.current['cell'] = cell;

      } else if (model.type === 'PHOTOSYNTHESIS') {
           // Leaf Section
           const leafGeo = new THREE.BoxGeometry(10, 0.5, 6);
           const leafMat = new THREE.MeshStandardMaterial({ color: 0x22c55e });
           const leaf = new THREE.Mesh(leafGeo, leafMat);
           leaf.position.y = -2;
           scene.add(leaf);
           
           // Chloroplast (Disc)
           const chloroGeo = new THREE.CylinderGeometry(2, 2, 0.5, 32);
           const chloroMat = new THREE.MeshStandardMaterial({ color: 0x15803d });
           const chloroplast = new THREE.Mesh(chloroGeo, chloroMat);
           chloroplast.rotation.x = Math.PI / 6;
           chloroplast.userData = { id: 'chloroplast' };
           scene.add(chloroplast);
           
           // Photons (Particles)
           const pGeo = new THREE.SphereGeometry(0.1, 8, 8);
           const pMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
           for(let i=0; i<20; i++) {
               const p = new THREE.Mesh(pGeo, pMat);
               p.position.set((Math.random()-0.5)*4, 5 + Math.random()*5, (Math.random()-0.5)*2);
               p.userData = { id: 'photon', offset: Math.random()*100 };
               scene.add(p);
               // Track in array
               if(!objectsRef.current['photons']) objectsRef.current['photons'] = new THREE.Group();
               (objectsRef.current['photons'] as THREE.Group).add(p);
           }
           scene.add(objectsRef.current['photons']);
      }
  };

  const createChromosome = () => {
      const group = new THREE.Group();
      const legGeo = new THREE.CapsuleGeometry(0.3, 2, 4, 8);
      const mat = new THREE.MeshStandardMaterial({ color: 0x3b82f6 });
      
      const l1 = new THREE.Mesh(legGeo, mat);
      l1.rotation.z = Math.PI / 6;
      const l2 = new THREE.Mesh(legGeo, mat);
      l2.rotation.z = -Math.PI / 6;
      
      group.add(l1);
      group.add(l2);
      return group;
  };

  // --- ANIMATION UPDATES ---
  const updateScene = (t: number) => {
      // General Rotation
      if (model.type === 'CELL_ANIMAL' && objectsRef.current['nucleus']) {
          sceneRef.current!.rotation.y = Math.sin(t * 0.1) * 0.2;
      }

      if (model.type === 'DNA' && objectsRef.current['dna']) {
          objectsRef.current['dna'].rotation.y = t * 0.5;
      }

      if (model.type === 'ENZYME') {
          // Cycle: 0-2 approach, 2-3 bind, 3-5 release
          const cycle = t % 5;
          const sub = objectsRef.current['substrate'];
          const enz = objectsRef.current['enzyme'];
          
          if (sub && enz) {
              if (cycle < 2) {
                  // Approach
                  const progress = cycle / 2;
                  sub.position.x = THREE.MathUtils.lerp(5, 1.2, progress);
                  (sub.material as THREE.MeshStandardMaterial).color.setHex(0xfacc15); // Yellow
                  setStageText('Substrate approaching Active Site');
              } else if (cycle < 3) {
                  // Bind
                  sub.position.x = 1.2;
                  (sub.material as THREE.MeshStandardMaterial).color.setHex(0xef4444); // Reacting (Red)
                  setStageText('Reaction: Complex Formed');
                  // Shake
                  sub.position.y = Math.sin(t * 20) * 0.05;
              } else {
                  // Release
                  const progress = (cycle - 3) / 2;
                  sub.position.x = THREE.MathUtils.lerp(1.2, -5, progress);
                  (sub.material as THREE.MeshStandardMaterial).color.setHex(0x22c55e); // Product (Green)
                  setStageText('Product Released');
              }
          }
      }

      if (model.type === 'MITOSIS') {
          const cycle = t % 10;
          const chromos = objectsRef.current['chromosomes'] as THREE.Group;
          const cell = objectsRef.current['cell'];
          
          if (chromos) {
              if (cycle < 2) {
                  setStageText('Prophase: Condensing');
                  chromos.children.forEach(c => {
                      c.position.y = Math.sin(t * 5 + c.id) * 0.2; // Jiggle
                      c.rotation.z = 0;
                  });
              } else if (cycle < 4) {
                  setStageText('Metaphase: Aligning');
                  chromos.children.forEach((c, i) => {
                       c.position.lerp(new THREE.Vector3(0, (i-1.5)*1.5, 0), 0.05); // Line up vertically
                       c.rotation.z = Math.PI / 2;
                  });
              } else if (cycle < 7) {
                  setStageText('Anaphase: Separating');
                  // Split logic simulated by moving whole X for now (simplification)
                  chromos.children.forEach((c, i) => {
                       const dir = i % 2 === 0 ? -1 : 1;
                       c.position.x = THREE.MathUtils.lerp(0, dir * 4, (cycle-4)/3);
                  });
                  if (cell) cell.scale.x = 1 + (cycle-4)*0.2; // Elongate
              } else {
                  setStageText('Telophase: Division');
                  if (cell) {
                      cell.scale.x = THREE.MathUtils.lerp(1.6, 0.1, (cycle-7)/3); // Pinch
                      cell.scale.y = THREE.MathUtils.lerp(1, 1.5, (cycle-7)/3);
                  }
              }
          }
      }

      if (model.type === 'PHOTOSYNTHESIS') {
          const photons = objectsRef.current['photons'] as THREE.Group;
          if (photons) {
              photons.children.forEach((p: any) => {
                  p.position.y -= 0.1;
                  if (p.position.y < -1) {
                      p.position.y = 8;
                      p.position.x = (Math.random()-0.5)*4;
                  }
              });
          }
      }
  };

  const handleReset = () => {
      timeRef.current = 0;
      setIsPlaying(true);
  };

  const getCurrentInfo = () => {
      if (selectedPart) {
          return model.labels.find(l => l.id === selectedPart);
      }
      return null;
  };

  const activeInfo = getCurrentInfo();

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col animate-in fade-in">
        {/* Header */}
        <div className="flex-none h-16 px-6 flex justify-between items-center bg-slate-900 border-b border-slate-800">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                    <Search size={20} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">{model.name}</h2>
                    <p className="text-xs text-slate-400">{model.description}</p>
                </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white" aria-label="Close Viewer">
                <X size={24} />
            </button>
        </div>

        {/* Main 3D View */}
        <div className="flex-1 relative" ref={mountRef}>
            
            {/* Stage Text Overlay */}
            {stageText && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur px-6 py-2 rounded-full border border-slate-700 pointer-events-none">
                    <span className="text-green-400 font-bold animate-pulse">{stageText}</span>
                </div>
            )}

            {/* Info Card Overlay (On Click) */}
            {activeInfo && (
                <div className="absolute top-20 right-4 w-64 bg-slate-900/90 backdrop-blur p-4 rounded-xl border border-green-500 animate-in slide-in-from-right">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-white">{activeInfo.title}</h3>
                        <button onClick={() => setSelectedPart(null)} aria-label="Close Info"><X size={16} className="text-slate-500"/></button>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">{activeInfo.description}</p>
                </div>
            )}

            {/* Legend / Tip */}
            <div className="absolute bottom-24 left-4 bg-black/60 backdrop-blur p-4 rounded-xl border border-slate-800 text-xs text-slate-300 pointer-events-none">
                <div className="flex items-center gap-2 mb-2 font-bold text-white"><MousePointer2 size={14} /> Interaction</div>
                <p>• Click objects to identify</p>
                <p>• Drag to rotate view</p>
            </div>

            {/* Controls */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4">
                <button onClick={handleReset} className="w-12 h-12 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-slate-300 hover:bg-slate-700" aria-label="Reset Animation">
                    <RotateCcw size={20} />
                </button>
                <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className={`h-12 px-8 rounded-full font-bold flex items-center gap-2 transition-all ${isPlaying ? 'bg-slate-800 text-white' : 'bg-green-500 text-black hover:bg-green-400'}`}
                    aria-label={isPlaying ? "Pause Animation" : "Play Animation"}
                >
                    {isPlaying ? <Pause className="fill-current" size={20} /> : <Play className="fill-current" size={20} />}
                    {isPlaying ? 'PAUSE' : 'PLAY ANIMATION'}
                </button>
            </div>
        </div>
    </div>
  );
};

export default BiologyViewer;
