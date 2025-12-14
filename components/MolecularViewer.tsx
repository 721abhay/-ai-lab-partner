
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useThreeScene } from '../hooks/useThreeScene';
import { AtomData, ReactionModel } from '../data/molecularModels';
import { Play, RotateCcw, X, Pause, Zap, Camera, Settings, Monitor } from 'lucide-react';

interface Props {
  model: ReactionModel;
  onClose: () => void;
}

const COLORS = {
    bond: 0xcccccc,
    highlight: 0x06b6d4,
    shell: 0x334155,
    electron: 0xfacc15,
    breaking: 0xef4444, // Red
    forming: 0x22c55e  // Green
};

type ViewStyle = 'BALL_STICK' | 'SPACE_FILL' | 'STICK';

const MolecularViewer: React.FC<Props> = ({ model, onClose }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  
  // Use the new hook for boilerplate
  const { sceneRef, cameraRef, rendererRef, controlsRef, frameIdRef } = useThreeScene({
      mountRef,
      cameraPos: [0, 2, 12],
      bgColor: '#020617'
  });

  // Animation State
  const [isPlaying, setIsPlaying] = useState(false);
  const [stage, setStage] = useState<'REACTANTS' | 'PRODUCTS'>('REACTANTS');
  const [progress, setProgress] = useState(0); 
  const [speed, setSpeed] = useState(1);
  
  // Interaction State
  const [selectedAtom, setSelectedAtom] = useState<AtomData | null>(null);
  const [hoveredAtom, setHoveredAtom] = useState<AtomData | null>(null);
  const [viewMode, setViewMode] = useState<'MOLECULAR' | 'ATOMIC'>('MOLECULAR');
  
  // Display Options
  const [viewStyle, setViewStyle] = useState<ViewStyle>('BALL_STICK');
  const [autoRotate, setAutoRotate] = useState(false);
  const [showLabels, setShowLabels] = useState(false);
  const [showBonds, setShowBonds] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  // Mesh Refs
  const meshesRef = useRef<{ 
      atoms: { [id: string]: THREE.Mesh }, 
      bondsReactants: { [id: string]: THREE.Mesh },
      bondsProducts: { [id: string]: THREE.Mesh }
  }>({ atoms: {}, bondsReactants: {}, bondsProducts: {} });
  
  const mouseRef = useRef(new THREE.Vector2());
  const raycasterRef = useRef(new THREE.Raycaster());

  // --- BUILD SCENE CONTENT ---
  useEffect(() => {
    if (!sceneRef.current || !rendererRef.current) return;

    const scene = sceneRef.current;
    rendererRef.current.shadowMap.enabled = true;
    rendererRef.current.shadowMap.type = THREE.PCFSoftShadowMap;

    // Professional Studio Lighting
    scene.clear(); // Clear default lights from hook
    
    // Ambient
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);

    // Key Light
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.0);
    keyLight.position.set(10, 10, 10);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    scene.add(keyLight);

    // Fill Light (Cooler)
    const fillLight = new THREE.DirectionalLight(0xddeeff, 0.5);
    fillLight.position.set(-10, 5, 2);
    scene.add(fillLight);

    // Rim Light (Accent)
    const rimLight = new THREE.SpotLight(0x06b6d4, 2);
    rimLight.position.set(0, 10, -10);
    rimLight.lookAt(0, 0, 0);
    scene.add(rimLight);

    // Radial Gradient Background (Simulated via Fog or simple large sphere background)
    // For now, simple scene background color is fine, but lets stick to dark mode lab feel

    // Initial Build
    rebuildScene(scene);

    // Interaction Handlers
    const onMouseMove = (event: MouseEvent) => {
        if (!rendererRef.current) return;
        const rect = rendererRef.current.domElement.getBoundingClientRect();
        mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        if (cameraRef.current && sceneRef.current) {
            raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
            const intersects = raycasterRef.current.intersectObjects(Object.values(meshesRef.current.atoms));
            if (intersects.length > 0) {
                const id = intersects[0].object.userData.atomId;
                const atom = model.reactants.atoms.find(a => a.id === id) || model.products.atoms.find(a => a.id === id);
                if (atom) {
                    setHoveredAtom(atom);
                    document.body.style.cursor = 'pointer';
                }
            } else {
                setHoveredAtom(null);
                document.body.style.cursor = 'default';
            }
        }
    };

    const onClick = () => {
        if (hoveredAtom) setSelectedAtom(hoveredAtom);
        else setSelectedAtom(null);
    };

    const canvas = rendererRef.current?.domElement;
    if (canvas) {
        canvas.addEventListener('mousemove', onMouseMove);
        canvas.addEventListener('click', onClick);
    }

    // Animation Loop
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      if (controlsRef.current) {
          controlsRef.current.autoRotate = autoRotate;
          controlsRef.current.autoRotateSpeed = 1.0; // Slower, more majestic
          controlsRef.current.update();
      }
      if (sceneRef.current && cameraRef.current && rendererRef.current) {
          rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    return () => {
        if (canvas) {
            canvas.removeEventListener('mousemove', onMouseMove);
            canvas.removeEventListener('click', onClick);
        }
    };
  }, [sceneRef.current]); 

  // --- REBUILD SCENE WHEN STYLE CHANGES ---
  useEffect(() => {
      if (sceneRef.current) {
          // Clear existing meshes
          Object.values(meshesRef.current.atoms).forEach(m => sceneRef.current?.remove(m));
          Object.values(meshesRef.current.bondsReactants).forEach(m => sceneRef.current?.remove(m));
          Object.values(meshesRef.current.bondsProducts).forEach(m => sceneRef.current?.remove(m));
          meshesRef.current = { atoms: {}, bondsReactants: {}, bondsProducts: {} };
          
          rebuildScene(sceneRef.current);
          if (!isPlaying) updateScenePositions(progress); 
      }
  }, [viewStyle]); 

  // --- SYNC SCENE WHEN STATE CHANGES MANUALLY ---
  useEffect(() => {
      if (!isPlaying) {
          updateScenePositions(progress);
      }
  }, [progress, stage]);

  const rebuildScene = (scene: THREE.Scene) => {
    // 1. Atoms
    const atomScale = viewStyle === 'SPACE_FILL' ? 2.5 : (viewStyle === 'STICK' ? 0.4 : 1.0);
    
    model.reactants.atoms.forEach(atom => {
        const geo = new THREE.SphereGeometry(atom.radius * atomScale, 64, 64); // Higher poly for smoothness
        // Professional CPK Style Material
        const mat = new THREE.MeshPhysicalMaterial({
            color: atom.color,
            roughness: 0.2,
            metalness: 0.1,
            clearcoat: 1.0, // Like a polished billiard ball
            clearcoatRoughness: 0.1,
            reflectivity: 1.0
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(atom.x, atom.y, atom.z);
        mesh.userData = { atomId: atom.id };
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);
        meshesRef.current.atoms[atom.id] = mesh;
    });

    if (viewStyle !== 'SPACE_FILL') {
        const bondRadius = viewStyle === 'STICK' ? 0.3 : 0.1;
        // 2. Reactant Bonds
        model.reactants.bonds.forEach(([id1, id2]) => {
            const bond = createBondMesh(id1, id2, 0xeeeeee, bondRadius);
            if(bond) {
                scene.add(bond);
                meshesRef.current.bondsReactants[`${id1}-${id2}`] = bond;
            }
        });

        // 3. Product Bonds
        model.products.bonds.forEach(([id1, id2]) => {
            const bond = createBondMesh(id1, id2, 0x06b6d4, bondRadius); 
            if(bond) {
                bond.material.opacity = 0;
                bond.material.transparent = true;
                scene.add(bond);
                meshesRef.current.bondsProducts[`${id1}-${id2}`] = bond;
            }
        });
    }
  };

  const createBondMesh = (id1: string, id2: string, color: number, radius: number) => {
      const atom1 = model.reactants.atoms.find(a => a.id === id1);
      const atom2 = model.reactants.atoms.find(a => a.id === id2);
      if (!atom1 || !atom2) return null;

      const height = new THREE.Vector3(atom1.x, atom1.y, atom1.z).distanceTo(new THREE.Vector3(atom2.x, atom2.y, atom2.z));
      const geo = new THREE.CylinderGeometry(radius, radius, height, 16);
      geo.translate(0, height/2, 0); 
      geo.rotateX(Math.PI / 2); 
      const mat = new THREE.MeshStandardMaterial({ 
          color: color,
          roughness: 0.4,
          metalness: 0.2
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.castShadow = true;
      return mesh;
  };

  // --- ANIMATION ---
  useEffect(() => {
    if (isPlaying) {
      let start = performance.now();
      const duration = 3000 / speed; 
      start = start - (progress * duration);

      const step = (now: number) => {
        if (!isPlaying) return;
        const elapsed = now - start;
        const t = Math.min(1, elapsed / duration);
        const easedT = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        
        setProgress(easedT);
        updateScenePositions(easedT);

        if (t < 1) {
          requestAnimationFrame(step);
        } else {
          setIsPlaying(false);
          setStage(prev => prev === 'REACTANTS' ? 'PRODUCTS' : 'REACTANTS');
        }
      };
      requestAnimationFrame(step);
    }
  }, [isPlaying, speed]);

  const updateScenePositions = (t: number) => {
    // Atoms
    const reactantData = model.reactants.atoms;
    const productData = model.products.atoms;

    reactantData.forEach(rAtom => {
        const pAtom = productData.find(a => a.id === rAtom.id);
        const mesh = meshesRef.current.atoms[rAtom.id];
        if (pAtom && mesh) {
            const start = stage === 'REACTANTS' ? rAtom : pAtom;
            const end = stage === 'REACTANTS' ? pAtom : rAtom;
            mesh.position.lerpVectors(
                new THREE.Vector3(start.x, start.y, start.z),
                new THREE.Vector3(end.x, end.y, end.z),
                t 
            );
        }
    });

    if (viewStyle === 'SPACE_FILL') return;

    // Reactant bonds
    const fadeOut = stage === 'REACTANTS' ? 1 - t : t;
    Object.entries(meshesRef.current.bondsReactants).forEach(([key, meshVal]) => {
        const mesh = meshVal as THREE.Mesh;
        const [id1, id2] = key.split('-');
        updateBond(mesh, id1, id2, fadeOut);
        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (fadeOut < 0.5) mat.color.setHex(COLORS.breaking);
        else mat.color.setHex(0xeeeeee);
    });

    // Product bonds
    const fadeIn = stage === 'REACTANTS' ? t : 1 - t;
    Object.entries(meshesRef.current.bondsProducts).forEach(([key, meshVal]) => {
        const mesh = meshVal as THREE.Mesh;
        const [id1, id2] = key.split('-');
        updateBond(mesh, id1, id2, fadeIn);
        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (fadeIn > 0.5 && fadeIn < 0.9) mat.color.setHex(COLORS.forming);
        else if (fadeIn >= 0.9) mat.color.setHex(0xeeeeee);
        else mat.color.setHex(0x06b6d4); 
    });
  };

  const updateBond = (mesh: THREE.Mesh, id1: string, id2: string, opacity: number) => {
        const m1 = meshesRef.current.atoms[id1];
        const m2 = meshesRef.current.atoms[id2];
        if (!m1 || !m2) return;
        mesh.position.copy(m1.position);
        mesh.lookAt(m2.position);
        mesh.scale.set(1, 1, m1.position.distanceTo(m2.position));
        const mat = mesh.material as THREE.Material;
        mat.opacity = opacity;
        mat.transparent = true;
        mesh.visible = showBonds && opacity > 0.05;
  };

  const takeScreenshot = () => {
      if (rendererRef.current) {
          const imgData = rendererRef.current.domElement.toDataURL('image/png');
          const a = document.createElement('a');
          a.href = imgData;
          a.download = `molecule_${model.name}.png`;
          a.click();
      }
  };

  const setCameraView = (view: 'TOP' | 'FRONT' | 'SIDE') => {
      if (!cameraRef.current || !controlsRef.current) return;
      const dist = 12;
      if (view === 'TOP') cameraRef.current.position.set(0, dist, 0);
      else if (view === 'FRONT') cameraRef.current.position.set(0, 0, dist);
      else if (view === 'SIDE') cameraRef.current.position.set(dist, 0, 0);
      cameraRef.current.lookAt(0, 0, 0);
      controlsRef.current.update();
  };

  const reset = () => {
      setIsPlaying(false);
      setProgress(0);
      setStage('REACTANTS');
  };

  const renderAtomicInspector = () => {
      if (!selectedAtom) return null;
      const shells = [2, 8, 8, 18];
      let eCount = selectedAtom.atomicNumber;
      return (
          <div className="absolute inset-0 bg-black/80 z-20 flex items-center justify-center p-8 animate-in fade-in">
              <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 max-w-4xl w-full h-full relative flex gap-8">
                  <button onClick={() => { setViewMode('MOLECULAR'); setSelectedAtom(null); }} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white">
                      <X size={24} />
                  </button>
                  <div className="flex-1 flex items-center justify-center relative">
                      <div className="relative w-80 h-80">
                          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full flex items-center justify-center font-black text-xl z-10 shadow-[0_0_30px_currentColor]`} style={{ color: selectedAtom.color, backgroundColor: selectedAtom.color }}>
                              {selectedAtom.element}
                          </div>
                          {[...Array(4)].map((_, i) => {
                              const capacity = shells[i];
                              const numInShell = Math.min(eCount, capacity);
                              if (numInShell <= 0) return null;
                              eCount -= numInShell;
                              const size = 120 + (i * 60);
                              return (
                                <div key={i} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-600/50" style={{ width: size, height: size }}>
                                    {[...Array(numInShell)].map((_, j) => {
                                        const angle = (j / numInShell) * Math.PI * 2;
                                        const r = size / 2;
                                        return (
                                            <div key={j} className="absolute w-3 h-3 bg-yellow-400 rounded-full shadow-[0_0_10px_yellow]" 
                                                 style={{ top: `calc(50% + ${Math.sin(angle) * r}px - 6px)`, left: `calc(50% + ${Math.cos(angle) * r}px - 6px)` }} />
                                        );
                                    })}
                                </div>
                              );
                          })}
                      </div>
                  </div>
                  <div className="w-80 border-l border-slate-800 pl-8 flex flex-col justify-center space-y-6">
                      <div>
                          <h2 className="text-4xl font-bold text-white mb-1">{selectedAtom.id.split('_')[1].toUpperCase()} Atom</h2>
                          <p className="text-slate-400 text-lg">Element: {selectedAtom.element}</p>
                      </div>
                      <div className="space-y-4">
                          <div className="bg-slate-800 p-4 rounded-xl"><div className="text-xs text-slate-500 uppercase font-bold">Atomic Mass</div><div className="text-2xl font-mono text-white">{selectedAtom.atomicMass} u</div></div>
                          <div className="bg-slate-800 p-4 rounded-xl"><div className="text-xs text-slate-500 uppercase font-bold">Atomic Number</div><div className="text-2xl font-mono text-lab-accent">{selectedAtom.atomicNumber}</div></div>
                          <div className="bg-slate-800 p-4 rounded-xl"><div className="text-xs text-slate-500 uppercase font-bold">Electronegativity</div><div className="text-2xl font-mono text-orange-400">{selectedAtom.electronegativity}</div></div>
                      </div>
                  </div>
              </div>
          </div>
      );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col animate-in fade-in duration-300">
      <div className="flex-none h-16 px-6 flex justify-between items-center bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-white">{model.name}</h2>
            <div className="px-3 py-1 bg-lab-accent/10 border border-lab-accent/30 rounded-full text-xs text-lab-accent font-mono">{model.equation}</div>
            {model.enthalpy && (
                <div className="px-3 py-1 bg-orange-500/10 border border-orange-500/30 rounded-full text-xs text-orange-400 font-mono flex items-center gap-1">
                    <Zap size={12} /> {model.enthalpy}
                </div>
            )}
        </div>
        <div className="flex items-center gap-2">
            <button onClick={takeScreenshot} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white" title="Take Screenshot">
                <Camera size={20} />
            </button>
            <button onClick={() => setShowSettings(!showSettings)} className={`p-2 rounded-full transition-colors ${showSettings ? 'bg-lab-accent text-black' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`} title="Display Settings">
                <Settings size={20} />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white ml-2">
                <X size={24} />
            </button>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden bg-gradient-to-b from-black to-slate-900" ref={mountRef}>
         
         {showSettings && (
             <div className="absolute top-4 right-4 w-64 bg-slate-900/95 backdrop-blur border border-slate-700 p-4 rounded-xl z-20 shadow-2xl animate-in slide-in-from-right">
                 <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2"><Monitor size={12}/> Display Options</h3>
                 <div className="space-y-3">
                     <div>
                         <label className="text-sm text-white block mb-1">Model Style</label>
                         <div className="flex bg-slate-800 rounded-lg p-1">
                             {['BALL_STICK', 'STICK', 'SPACE_FILL'].map((s) => (
                                 <button key={s} onClick={() => setViewStyle(s as ViewStyle)} className={`flex-1 text-[10px] py-1 rounded ${viewStyle === s ? 'bg-lab-accent text-black font-bold' : 'text-slate-400 hover:text-white'}`}>
                                     {s.replace('_', ' ')}
                                 </button>
                             ))}
                         </div>
                     </div>
                     <div className="flex items-center justify-between">
                         <span className="text-sm text-white">Auto Rotate</span>
                         <button onClick={() => setAutoRotate(!autoRotate)} className={`w-10 h-6 rounded-full flex items-center transition-colors ${autoRotate ? 'bg-green-500 justify-end' : 'bg-slate-700 justify-start'} p-1`}>
                             <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                         </button>
                     </div>
                     <div className="flex items-center justify-between">
                         <span className="text-sm text-white">Show Bonds</span>
                         <button onClick={() => setShowBonds(!showBonds)} className={`w-10 h-6 rounded-full flex items-center transition-colors ${showBonds ? 'bg-green-500 justify-end' : 'bg-slate-700 justify-start'} p-1`}>
                             <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                         </button>
                     </div>
                 </div>
                 <h3 className="text-xs font-bold text-slate-400 uppercase mt-4 mb-3 flex items-center gap-2"><Camera size={12}/> Camera View</h3>
                 <div className="flex gap-2">
                     {['TOP', 'FRONT', 'SIDE'].map((v) => (
                         <button key={v} onClick={() => setCameraView(v as any)} className="flex-1 py-1 bg-slate-800 hover:bg-slate-700 text-xs text-white rounded border border-slate-700">
                             {v}
                         </button>
                     ))}
                 </div>
             </div>
         )}

         {model.visualEffect === 'GAS_CLOUD' && progress > 0.5 && (
             <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                 <div className="text-red-500 font-black text-6xl opacity-20 animate-pulse tracking-widest">TOXIC GAS</div>
             </div>
         )}
         
         {hoveredAtom && (
             <div className="absolute top-4 left-4 bg-black/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 pointer-events-none z-10 flex items-center gap-3 animate-in fade-in zoom-in-95 duration-75">
                 <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-inner" style={{ backgroundColor: hoveredAtom.color, color: '#000' }}>
                     {hoveredAtom.element}
                 </div>
                 <div>
                     <div className="text-white font-bold text-sm">Atom {hoveredAtom.id.split('_')[1]}</div>
                     <div className="text-slate-400 text-xs">Mass: {hoveredAtom.atomicMass}</div>
                 </div>
                 {showLabels && <div className="text-xs bg-slate-800 px-2 py-1 rounded text-white">Click for info</div>}
             </div>
         )}

         {selectedAtom && viewMode === 'MOLECULAR' && (
             <div className="absolute bottom-32 right-4 bg-slate-900/90 backdrop-blur p-4 rounded-xl border border-lab-accent shadow-2xl animate-in slide-in-from-right w-64 z-10">
                 <h3 className="font-bold text-lg text-white mb-1 flex justify-between">
                     {selectedAtom.element} Atom
                     <button onClick={() => setSelectedAtom(null)}><X size={16} className="text-slate-500 hover:text-white"/></button>
                 </h3>
                 <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                     <div className="bg-slate-800 p-2 rounded">
                         <div className="text-slate-500">Mass</div>
                         <div className="text-white font-mono">{selectedAtom.atomicMass}</div>
                     </div>
                     <div className="bg-slate-800 p-2 rounded">
                         <div className="text-slate-500">No.</div>
                         <div className="text-white font-mono">{selectedAtom.atomicNumber}</div>
                     </div>
                 </div>
                 <button 
                    onClick={() => setViewMode('ATOMIC')}
                    className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                 >
                     <Zap size={14} /> Inspect Electron Shells
                 </button>
             </div>
         )}

         <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 w-full max-w-lg px-4 pointer-events-none">
             <div className="bg-slate-900/90 backdrop-blur border border-slate-700 px-6 py-2 rounded-full flex items-center gap-4 w-full shadow-2xl pointer-events-auto">
                 <span className="text-xs font-bold text-slate-400 w-12">SPEED</span>
                 <input 
                    type="range" min="0.1" max="3" step="0.1" 
                    value={speed} onChange={(e) => setSpeed(Number(e.target.value))}
                    className="flex-1 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-lab-accent"
                />
                <span className="text-xs font-mono text-white w-8 text-right">{speed}x</span>
             </div>

             <div className="flex gap-4 pointer-events-auto">
                <button onClick={reset} className="w-14 h-14 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-slate-300 hover:bg-slate-700 hover:text-white transition-all active:scale-95 shadow-lg">
                    <RotateCcw size={24} />
                </button>
                <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className={`h-14 px-8 rounded-full font-bold flex items-center gap-2 text-lg shadow-xl transition-all active:scale-95 ${isPlaying ? 'bg-slate-700 text-white' : 'bg-lab-accent text-black hover:bg-cyan-400'}`}
                >
                    {isPlaying ? <Pause className="fill-current" /> : <Play className="fill-current" />}
                    {isPlaying ? 'PAUSE' : (progress > 0 && progress < 1 ? 'RESUME' : 'START')}
                </button>
             </div>
         </div>
         
         <div className="absolute top-4 left-4 pointer-events-none">
             {!hoveredAtom && !selectedAtom && (
                 <div className="bg-black/40 backdrop-blur px-3 py-1 rounded-full text-[10px] text-slate-400 border border-slate-800/50">
                     Drag to Rotate • Scroll to Zoom • Click Atoms
                 </div>
             )}
         </div>
      </div>

      {viewMode === 'ATOMIC' && renderAtomicInspector()}
    </div>
  );
};

export default MolecularViewer;
