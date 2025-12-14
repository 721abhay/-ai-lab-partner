
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useThreeScene } from '../hooks/useThreeScene';
import { PhysicsModel } from '../data/physicsModels';
import { Play, Pause, RotateCcw, X, Settings, Timer, Ruler, Camera, Rotate3d } from 'lucide-react';

interface Props {
  model: PhysicsModel;
  onClose: () => void;
}

const PhysicsViewer: React.FC<Props> = ({ model, onClose }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  
  // Use custom hook for Three.js setup
  const { sceneRef, cameraRef, rendererRef, controlsRef, frameIdRef } = useThreeScene({
      mountRef,
      cameraPos: [0, 5, 15],
      bgColor: '#0f172a'
  });

  const [isPlaying, setIsPlaying] = useState(true);
  const [time, setTime] = useState(0);
  const [params, setParams] = useState(model.params);
  
  // Controls
  const [showRuler, setShowRuler] = useState(false);
  const [showStopwatch, setShowStopwatch] = useState(false);
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [stopwatchRunning, setStopwatchRunning] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  
  // Data
  const [energyData, setEnergyData] = useState({ pe: 0, ke: 0, total: 0 });
  const [vectorData, setVectorData] = useState<{label: string, value: string, color: string}[]>([]);

  // Simulation Refs
  const objectsRef = useRef<{ [key: string]: THREE.Object3D }>({});
  const arrowsRef = useRef<{ [key: string]: THREE.ArrowHelper }>({});
  const stopwatchRef = useRef<number>(0);

  // --- INIT SCENARIO CONTENT ---
  useEffect(() => {
    if (!sceneRef.current) return;

    // Measurement Grid Floor (Engineering Style)
    const grid = new THREE.GridHelper(20, 20, 0x475569, 0x1e293b);
    sceneRef.current.add(grid);
    // Add sub-grid for precision look
    const subGrid = new THREE.GridHelper(20, 100, 0x334155, 0x0f172a);
    subGrid.position.y = 0.01;
    sceneRef.current.add(subGrid);

    // Initialize the specific experiment objects
    initScenario(sceneRef.current);

    // Animation Loop
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      
      if (isPlaying) {
          updateScenario();
      }
      
      if (controlsRef.current) {
          controlsRef.current.autoRotate = autoRotate;
          controlsRef.current.update();
      }
      
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
          rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    return () => {
        clearInterval(stopwatchRef.current);
        // Clean up experiment specific objects
        objectsRef.current = {};
        arrowsRef.current = {};
    };
  }, [sceneRef.current, model.type]); // Re-run if scene is ready or model changes

  // --- STOPWATCH ---
  useEffect(() => {
      if (stopwatchRunning) {
          const start = Date.now() - stopwatchTime;
          stopwatchRef.current = window.setInterval(() => {
              setStopwatchTime(Date.now() - start);
          }, 10);
      } else {
          clearInterval(stopwatchRef.current);
      }
      return () => clearInterval(stopwatchRef.current);
  }, [stopwatchRunning]);

  const toggleStopwatch = () => setStopwatchRunning(!stopwatchRunning);
  const resetStopwatch = () => { setStopwatchRunning(false); setStopwatchTime(0); };

  // --- SCENARIO LOGIC ---
  const createArrow = (name: string, color: number, scene: THREE.Scene) => {
      const arrow = new THREE.ArrowHelper(new THREE.Vector3(0,1,0), new THREE.Vector3(0,0,0), 1, color);
      scene.add(arrow);
      arrowsRef.current[name] = arrow;
      return arrow;
  };

  const initScenario = (scene: THREE.Scene) => {
      objectsRef.current = {};
      arrowsRef.current = {};

      const metalMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.5, roughness: 0.2 });
      const objectMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.1 });

      switch (model.type) {
          case 'PENDULUM':
              const pivot = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.2, 0.5), metalMat);
              pivot.position.set(0, 5, 0);
              scene.add(pivot);
              const lineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,5,0), new THREE.Vector3(0,3,0)]);
              const line = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color: 0xffffff }));
              scene.add(line);
              objectsRef.current['string'] = line;
              const bob = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), new THREE.MeshPhysicalMaterial({ color: 0x06b6d4, metalness: 0.1, roughness: 0.1, clearcoat: 1 }));
              scene.add(bob);
              objectsRef.current['bob'] = bob;
              createArrow('gravity', 0xef4444, scene);
              createArrow('tension', 0xeab308, scene);
              createArrow('velocity', 0x22c55e, scene);
              break;

          case 'FREE_FALL':
              const ball = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), objectMat);
              ball.position.set(0, 10, 0);
              scene.add(ball);
              objectsRef.current['ball'] = ball;
              const ground = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.MeshStandardMaterial({ color: 0x334155, side: THREE.DoubleSide, roughness: 0.8 }));
              ground.rotation.x = -Math.PI/2;
              scene.add(ground);
              createArrow('velocity', 0x22c55e, scene);
              createArrow('acceleration', 0xef4444, scene);
              break;
          
          case 'SPRING':
              const ceil = new THREE.Mesh(new THREE.BoxGeometry(4, 0.2, 4), metalMat);
              ceil.position.set(0, 6, 0);
              scene.add(ceil);
              const mass = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), objectMat);
              scene.add(mass);
              objectsRef.current['mass'] = mass;
              const curve = new THREE.CatmullRomCurve3(getSpringPoints(6, 4, 10));
              const tubeGeo = new THREE.TubeGeometry(curve, 64, 0.05, 8, false);
              const tube = new THREE.Mesh(tubeGeo, new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.2 }));
              scene.add(tube);
              objectsRef.current['spring'] = tube;
              createArrow('force', 0x22c55e, scene);
              createArrow('gravity', 0xef4444, scene);
              break;

          case 'COLLISION':
              const track = new THREE.Mesh(new THREE.BoxGeometry(15, 0.2, 2), metalMat);
              scene.add(track);
              const b1 = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), new THREE.MeshPhysicalMaterial({ color: 0x3b82f6, clearcoat: 1 }));
              scene.add(b1);
              objectsRef.current['b1'] = b1;
              const b2 = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), new THREE.MeshPhysicalMaterial({ color: 0xef4444, clearcoat: 1 }));
              scene.add(b2);
              objectsRef.current['b2'] = b2;
              createArrow('v1', 0x3b82f6, scene);
              createArrow('v2', 0xef4444, scene);
              break;

          case 'WAVE':
              const pts = [];
              for(let i=0; i<=50; i++) pts.push(new THREE.Vector3((i/50)*10 - 5, 0, 0));
              const waveGeo = new THREE.BufferGeometry().setFromPoints(pts);
              const waveLine = new THREE.Line(waveGeo, new THREE.LineBasicMaterial({ color: 0x22c55e, linewidth: 2 }));
              scene.add(waveLine);
              objectsRef.current['wave'] = waveLine;
              const p1 = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 4), metalMat);
              p1.position.set(-5, 0, 0);
              scene.add(p1);
              const p2 = p1.clone();
              p2.position.set(5, 0, 0);
              scene.add(p2);
              break;

          case 'REFRACTION':
              const glass = new THREE.Mesh(new THREE.BoxGeometry(4, 2, 4), new THREE.MeshPhysicalMaterial({ 
                  color: 0xffffff, transmission: 0.95, opacity: 1, transparent: true, roughness: 0, ior: 1.5, thickness: 2
              }));
              glass.position.set(0, -1, 0);
              scene.add(glass);
              const rayGeo = new THREE.BufferGeometry();
              const ray = new THREE.Line(rayGeo, new THREE.LineBasicMaterial({ color: 0xef4444, linewidth: 2 }));
              scene.add(ray);
              objectsRef.current['ray'] = ray;
              break;
          default: break;
      }
  };

  const getSpringPoints = (topY: number, bottomY: number, coils: number) => {
      const points = [];
      const height = topY - bottomY;
      for (let i = 0; i <= 100; i++) {
          const t = i / 100;
          const y = topY - t * height;
          const angle = t * Math.PI * 2 * coils;
          const r = 0.5;
          points.push(new THREE.Vector3(Math.cos(angle) * r, y, Math.sin(angle) * r));
      }
      return points;
  };

  const updateScenario = () => {
      const dt = 0.016; 
      const t = time + dt;
      setTime(t);

      if (model.type === 'PENDULUM') {
          const L = Number(params.length) || 2;
          const g = 9.8;
          const theta0 = Math.PI / 4;
          const theta = theta0 * Math.cos(Math.sqrt(g/L) * t);
          const omega = -theta0 * Math.sqrt(g/L) * Math.sin(Math.sqrt(g/L) * t);
          const x = L * Math.sin(theta);
          const y = 5 - L * Math.cos(theta);
          if (objectsRef.current['bob']) objectsRef.current['bob'].position.set(x, y, 0);
          if (objectsRef.current['string']) {
              const positions = new Float32Array([0, 5, 0, x, y, 0]);
              (objectsRef.current['string'].geometry as THREE.BufferGeometry).setAttribute('position', new THREE.BufferAttribute(positions, 3));
              (objectsRef.current['string'].geometry as THREE.BufferGeometry).attributes.position.needsUpdate = true;
          }
          const v = L * omega;
          const hRef = 5 - L; // Height of bob at lowest point
          const relativeH = y - hRef; // Height above lowest point
          const pe = 9.8 * relativeH * 10; 
          const ke = 0.5 * (v * v) * 10;
          setEnergyData({ pe, ke, total: pe + ke });
          
          if (arrowsRef.current['velocity']) {
             arrowsRef.current['velocity'].position.set(x, y, 0);
             arrowsRef.current['velocity'].setDirection(new THREE.Vector3(Math.cos(theta), Math.sin(theta), 0).normalize());
             arrowsRef.current['velocity'].setLength(Math.abs(v) * 0.5);
          }
      } else if (model.type === 'FREE_FALL') {
          let y = 10 - 0.5 * 9.8 * (t % 1.5) ** 2;
          if (y < 0.5) y = 0.5;
          if (objectsRef.current['ball']) objectsRef.current['ball'].position.y = y;
          const v = 9.8 * (t % 1.5);
          setVectorData([
              { label: 'Height', value: y.toFixed(2) + 'm', color: 'text-white' },
              { label: 'Velocity', value: v.toFixed(2) + 'm/s', color: 'text-green-500' }
          ]);
          if (arrowsRef.current['velocity']) {
              arrowsRef.current['velocity'].position.set(0, y, 0);
              arrowsRef.current['velocity'].setLength(v * 0.1);
          }
      } else if (model.type === 'SPRING') {
          const k = Number(params.k) || 5;
          const m = Number(params.mass) || 2;
          const omega = Math.sqrt(k/m);
          const yEq = 6 - (m * 9.8) / k; 
          const amplitude = 2;
          const y = yEq + amplitude * Math.cos(omega * t) * Math.exp(-0.1 * t);
          if (objectsRef.current['mass']) objectsRef.current['mass'].position.set(0, y - 0.5, 0);
          if (objectsRef.current['spring']) {
              const newPoints = getSpringPoints(6, y, 10);
              const curve = new THREE.CatmullRomCurve3(newPoints);
              const tubeGeo = new THREE.TubeGeometry(curve, 64, 0.05, 8, false);
              (objectsRef.current['spring'] as THREE.Mesh).geometry.dispose();
              (objectsRef.current['spring'] as THREE.Mesh).geometry = tubeGeo;
          }
          const force = -k * (y - yEq);
          setVectorData([
              { label: 'Displacement', value: (y - yEq).toFixed(2) + 'm', color: 'text-white' },
              { label: 'Force', value: force.toFixed(1) + 'N', color: 'text-green-500' }
          ]);
          if (arrowsRef.current['force']) {
              arrowsRef.current['force'].position.set(0, y, 0);
              arrowsRef.current['force'].setDirection(new THREE.Vector3(0, force > 0 ? 1 : -1, 0));
              arrowsRef.current['force'].setLength(Math.abs(force) * 0.1);
          }
      } else if (model.type === 'COLLISION') {
          const m1 = Number(params.m1);
          const m2 = Number(params.m2);
          const loopTime = 4;
          const localT = t % loopTime;
          let x1, x2, v1, v2;
          if (localT < 1) { 
              v1 = Number(params.v1);
              v2 = Number(params.v2);
              x1 = -5 + v1 * localT;
              x2 = 5 + v2 * localT;
          } else { 
              const u1 = Number(params.v1);
              const u2 = Number(params.v2);
              v1 = ((m1 - m2)*u1 + 2*m2*u2) / (m1 + m2);
              v2 = ((m2 - m1)*u2 + 2*m1*u1) / (m1 + m2);
              x1 = -5 + u1 + v1 * (localT - 1);
              x2 = 5 + u2 + v2 * (localT - 1);
          }
          if(objectsRef.current['b1']) objectsRef.current['b1'].position.x = x1;
          if(objectsRef.current['b2']) objectsRef.current['b2'].position.x = x2;
          setVectorData([
              { label: 'P (Blue)', value: (m1 * v1).toFixed(1) + ' kg·m/s', color: 'text-blue-400' },
              { label: 'P (Red)', value: (m2 * v2).toFixed(1) + ' kg·m/s', color: 'text-red-400' }
          ]);
      } else if (model.type === 'WAVE') {
          const freq = Number(params.frequency);
          const amp = Number(params.amplitude);
          if (objectsRef.current['wave']) {
              const positions = (objectsRef.current['wave'].geometry as THREE.BufferGeometry).attributes.position;
              for (let i = 0; i < positions.count; i++) {
                  const x = (i / 50) * 10 - 5;
                  const y = 2 * amp * Math.sin(Math.PI * (x + 5)/10 * freq) * Math.cos(3 * t);
                  positions.setY(i, y);
              }
              positions.needsUpdate = true;
          }
      }
  };

  const handleReset = () => {
      setTime(0);
      setIsPlaying(true);
  };

  const takeScreenshot = () => {
      if (rendererRef.current) {
          const imgData = rendererRef.current.domElement.toDataURL('image/png');
          const a = document.createElement('a');
          a.href = imgData;
          a.download = `physics_${model.name.replace(/\s+/g, '_')}.png`;
          a.click();
      }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col animate-in fade-in">
        <div className="flex-none h-16 px-6 flex justify-between items-center bg-slate-900 border-b border-slate-800">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500">
                    <Settings size={20} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">{model.name}</h2>
                    <div className="flex gap-2 text-xs text-slate-400 font-mono">
                        {model.labels.map((l, i) => <span key={i} className="bg-slate-800 px-2 rounded">{l}</span>)}
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={() => setAutoRotate(!autoRotate)} className={`p-2 rounded-full ${autoRotate ? 'bg-orange-500 text-black' : 'text-slate-400 hover:bg-slate-800'}`} title="Auto Rotate">
                    <Rotate3d size={20} />
                </button>
                <button onClick={takeScreenshot} className="p-2 rounded-full text-slate-400 hover:bg-slate-800" title="Screenshot">
                    <Camera size={20} />
                </button>
                <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white ml-2">
                    <X size={24} />
                </button>
            </div>
        </div>

        <div className="flex-1 relative" ref={mountRef}>
            <div className="absolute top-4 right-4 w-64 space-y-2 pointer-events-none">
                {vectorData.length > 0 && (
                    <div className="bg-slate-900/90 backdrop-blur p-4 rounded-xl border border-slate-700 pointer-events-auto">
                        {vectorData.map((d, i) => (
                            <div key={i} className="flex justify-between items-center mb-1 last:mb-0">
                                <span className="text-xs text-slate-400">{d.label}</span>
                                <span className={`text-sm font-mono font-bold ${d.color}`}>{d.value}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="absolute top-4 left-4 flex flex-col gap-2">
                <button 
                    onClick={() => setShowRuler(!showRuler)}
                    className={`p-3 rounded-xl border transition-all ${showRuler ? 'bg-orange-500 text-black border-orange-400' : 'bg-slate-900/80 text-slate-400 border-slate-700'}`}
                    title="Toggle Ruler"
                >
                    <Ruler size={20} />
                </button>
                <button 
                    onClick={() => setShowStopwatch(!showStopwatch)}
                    className={`p-3 rounded-xl border transition-all ${showStopwatch ? 'bg-orange-500 text-black border-orange-400' : 'bg-slate-900/80 text-slate-400 border-slate-700'}`}
                    title="Toggle Stopwatch"
                >
                    <Timer size={20} />
                </button>
            </div>

            {showStopwatch && (
                <div className="absolute top-20 left-20 bg-slate-900 border border-slate-600 rounded-full w-32 h-32 flex flex-col items-center justify-center shadow-2xl animate-in zoom-in">
                    <div className="font-mono text-2xl text-white font-bold">
                        {(stopwatchTime / 1000).toFixed(2)}s
                    </div>
                    <div className="flex gap-2 mt-2">
                        <button onClick={toggleStopwatch} className={`w-8 h-8 rounded-full flex items-center justify-center ${stopwatchRunning ? 'bg-red-500 text-white' : 'bg-green-500 text-black'}`}>
                            {stopwatchRunning ? <Pause size={12}/> : <Play size={12}/>}
                        </button>
                        <button onClick={resetStopwatch} className="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center">
                            <RotateCcw size={12}/>
                        </button>
                    </div>
                </div>
            )}

            {showRuler && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-20 border-b-2 border-orange-500 flex justify-between items-end pointer-events-none opacity-80">
                    {[...Array(11)].map((_, i) => (
                        <div key={i} className="h-4 w-px bg-orange-500 relative">
                            <span className="absolute top-6 -left-2 text-xs font-bold text-orange-500">{i}m</span>
                        </div>
                    ))}
                </div>
            )}

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 w-full max-w-md">
                {model.type === 'SPRING' && (
                    <div className="bg-slate-900/90 px-6 py-2 rounded-full border border-slate-700 flex items-center gap-4 w-full">
                        <span className="text-xs font-bold text-slate-400">MASS (kg)</span>
                        <input 
                            type="range" min="0.5" max="5" step="0.1"
                            value={Number(params.mass)}
                            onChange={(e) => setParams({...params, mass: Number(e.target.value)})}
                            className="flex-1 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                        />
                        <span className="text-xs font-mono text-white">{params.mass}</span>
                    </div>
                )}
                {model.type === 'WAVE' && (
                    <div className="bg-slate-900/90 px-6 py-2 rounded-full border border-slate-700 flex items-center gap-4 w-full">
                        <span className="text-xs font-bold text-slate-400">FREQUENCY</span>
                        <input 
                            type="range" min="0.5" max="5" step="0.1"
                            value={Number(params.frequency)}
                            onChange={(e) => setParams({...params, frequency: Number(e.target.value)})}
                            className="flex-1 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                        />
                        <span className="text-xs font-mono text-white">{params.frequency}Hz</span>
                    </div>
                )}

                <div className="flex gap-4">
                    <button onClick={handleReset} className="w-12 h-12 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-slate-300 hover:bg-slate-700">
                        <RotateCcw size={20} />
                    </button>
                    <button 
                        onClick={() => setIsPlaying(!isPlaying)}
                        className={`h-12 px-8 rounded-full font-bold flex items-center gap-2 transition-all ${isPlaying ? 'bg-slate-800 text-white' : 'bg-orange-500 text-black hover:bg-orange-400'}`}
                    >
                        {isPlaying ? <Pause className="fill-current" size={20} /> : <Play className="fill-current" size={20} />}
                        {isPlaying ? 'PAUSE' : 'SIMULATE'}
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default PhysicsViewer;
