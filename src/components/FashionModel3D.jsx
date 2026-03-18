import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, MeshDistortMaterial, Float } from '@react-three/drei';
import * as THREE from 'three';

// Procedural fashion piece - a stylized 3D garment shape
function GarmentMesh({ accentColor, isLocked }) {
  const meshRef = useRef();
  const innerRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.3;
    }
    if (innerRef.current) {
      innerRef.current.rotation.y = -t * 0.2;
      innerRef.current.rotation.x = Math.sin(t * 0.5) * 0.1;
    }
  });

  const color = new THREE.Color(accentColor);

  return (
    <group>
      {/* Main garment body */}
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
        <mesh ref={meshRef} position={[0, 0, 0]} scale={1.4}>
          <torusKnotGeometry args={[0.6, 0.22, 180, 20, 2, 3]} />
          <MeshDistortMaterial
            color={accentColor}
            metalness={0.9}
            roughness={0.1}
            distort={isLocked ? 0.6 : 0.2}
            speed={isLocked ? 3 : 1}
            emissive={accentColor}
            emissiveIntensity={isLocked ? 0.6 : 0.2}
          />
        </mesh>

        {/* Inner accent ring */}
        <mesh ref={innerRef} position={[0, 0, 0]} scale={0.9}>
          <torusGeometry args={[0.85, 0.04, 16, 100]} />
          <meshStandardMaterial
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={1}
            metalness={1}
            roughness={0}
          />
        </mesh>

        {/* Particle cloud for locked mode */}
        {isLocked && <LockedParticles color={accentColor} />}
      </Float>

      {/* Ground reflection */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.6, 0]}>
        <planeGeometry args={[6, 6]} />
        <meshStandardMaterial
          color="#000"
          metalness={0.8}
          roughness={0.3}
          transparent
          opacity={0.5}
        />
      </mesh>
    </group>
  );
}

function LockedParticles({ color }) {
  const pointsRef = useRef();
  const count = 300;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 4;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 4;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.15;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={color} size={0.025} transparent opacity={0.6} />
    </points>
  );
}

export default function FashionModel3D({ accentColor = '#c9a84c', isLocked = true, height = 400 }) {
  return (
    <div
      className="relative w-full protected"
      style={{ height }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Watermark overlay when locked */}
      {isLocked && (
        <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
          <div
            className="text-white/8 font-black text-5xl tracking-widest rotate-[-35deg] select-none"
            style={{ fontSize: '3.5rem', whiteSpace: 'nowrap' }}
          >
            DRIP NFT · PREVIEW ONLY · DRIP NFT · PREVIEW ONLY
          </div>
        </div>
      )}

      {/* Lock badge */}
      {isLocked && (
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 bg-black/70 border border-white/20 rounded-full px-3 py-1 text-xs text-white/60 select-none pointer-events-none">
          <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor">
            <rect x="1" y="5" width="8" height="7" rx="1.5" />
            <path d="M3 5V3.5a2 2 0 0 1 4 0V5" stroke="currentColor" strokeWidth="1.5" fill="none" />
          </svg>
          Preview Only
        </div>
      )}

      {isLocked && (
        <div className="absolute bottom-3 left-3 z-20 text-xs text-white/20 select-none pointer-events-none font-mono">
          © DRIP NFT — Purchase to unlock
        </div>
      )}

      <Canvas
        camera={{ position: [0, 0, 4], fov: 50 }}
        gl={{ preserveDrawingBuffer: false, antialias: true }}
        dpr={[1, 1.5]}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[5, 5, 5]} intensity={1} color={accentColor} />
        <pointLight position={[-5, -5, -5]} intensity={0.5} color="#ffffff" />
        <spotLight
          position={[0, 8, 0]}
          intensity={2}
          angle={0.4}
          penumbra={0.5}
          color={accentColor}
          castShadow
        />

        <GarmentMesh accentColor={accentColor} isLocked={isLocked} />

        <Environment preset="night" />
        <OrbitControls
          enablePan={false}
          enableZoom={!isLocked}
          autoRotate={false}
          maxPolarAngle={Math.PI * 0.75}
          minPolarAngle={Math.PI * 0.25}
        />
      </Canvas>
    </div>
  );
}
