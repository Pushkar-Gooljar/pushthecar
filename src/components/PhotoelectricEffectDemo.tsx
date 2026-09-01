import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrthographicCamera, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';

// --- PHYSICS CONSTANTS ---
const H_PLANCK = 0.41357; // eV / (10^14 Hz)
const MAX_PARTICLES = 140;

interface Metal {
  name: string;
  phi: number;
  color: string;
}

// Colours kept deliberately light/warm so the plate stays visible in dark mode.
const METALS: Metal[] = [
  { name: 'Cesium (Cs)', phi: 2.14, color: '#a8a290' },
  { name: 'Potassium (K)', phi: 2.3, color: '#b0ab98' },
  { name: 'Sodium (Na)', phi: 2.36, color: '#bdbdbd' },
  { name: 'Calcium (Ca)', phi: 2.87, color: '#a9a9a9' },
  { name: 'Zinc (Zn)', phi: 4.3, color: '#98a4ae' },
  { name: 'Platinum (Pt)', phi: 5.65, color: '#c7c6c2' },
];

// Colour stops across the (pretend) visible spectrum, keyed to frequency (10^14 Hz).
// Frequencies outside this range are clamped to the nearest end.
const SPECTRUM_STOPS: { f: number; color: THREE.Color }[] = [
  { f: 3.0, color: new THREE.Color('#8B0000') }, // Infrared / deep red
  { f: 4.4, color: new THREE.Color('#FF1E00') }, // Red
  { f: 5.0, color: new THREE.Color('#FF7A00') }, // Orange
  { f: 5.4, color: new THREE.Color('#FFD000') }, // Yellow
  { f: 5.9, color: new THREE.Color('#00E640') }, // Green
  { f: 6.5, color: new THREE.Color('#00B0FF') }, // Cyan / blue
  { f: 7.2, color: new THREE.Color('#3D00FF') }, // Deep blue
  { f: 8.0, color: new THREE.Color('#8000FF') }, // Violet
  { f: 15.0, color: new THREE.Color('#D966FF') }, // Ultraviolet
];

const _colorScratch = new THREE.Color();

// Continuously interpolate between spectrum stops so colour glides as f changes.
function getFrequencyColor(f: number): string {
  const stops = SPECTRUM_STOPS;
  if (f <= stops[0].f) return `#${stops[0].color.getHexString()}`;
  if (f >= stops[stops.length - 1].f) return `#${stops[stops.length - 1].color.getHexString()}`;

  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i];
    const b = stops[i + 1];
    if (f >= a.f && f <= b.f) {
      const t = (f - a.f) / (b.f - a.f);
      _colorScratch.copy(a.color).lerp(b.color, t);
      return `#${_colorScratch.getHexString()}`;
    }
  }
  return `#${stops[0].color.getHexString()}`;
}

const colorNormal = new THREE.Color('#FFD700'); // Lower KE
const colorFast = new THREE.Color('#00FFFF'); // Max KE

interface PhotoelectronsProps {
  activeCount: number;
  impactRadius: number;
  kMax: number;
  hasEmission: boolean;
}

interface Particle {
  position: THREE.Vector3;
  baseSpeedY: number;
  baseSpread: number;
  velocity: THREE.Vector3;
  life: number;
  color: THREE.Color;
}

// --- ELECTRON PARTICLE SYSTEM ---
const Photoelectrons = ({ activeCount, impactRadius, kMax, hasEmission }: PhotoelectronsProps) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Speed is strictly proportional to sqrt(K_max)
  const speedFactor = useMemo(() => {
    return hasEmission ? Math.sqrt(kMax / 1.5) : 0;
  }, [kMax, hasEmission]);

  // Pre-allocate maximum particle pool
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: MAX_PARTICLES }, () => {
      const isMaxEnergy = Math.random() < 0.25;
      return {
        position: new THREE.Vector3(0, -10, 0),
        baseSpeedY: isMaxEnergy ? 0.05 : 0.02,
        baseSpread: isMaxEnergy ? 0.04 : 0.02,
        velocity: new THREE.Vector3(0, 0, 0),
        life: Math.random() * 100,
        color: isMaxEnergy ? colorFast : colorNormal,
      };
    });
  }, []);

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    if (mesh.instanceColor === null) {
      particles.forEach((p, i) => mesh.setColorAt(i, p.color));
      if (mesh.instanceColor) (mesh.instanceColor as THREE.InstancedBufferAttribute).needsUpdate = true;
    }

    // Dynamically set active instances based on Power and Emission state
    const currentCount = hasEmission ? activeCount : 0;
    mesh.count = currentCount;

    if (!hasEmission || currentCount === 0) return;

    for (let i = 0; i < currentCount; i++) {
      const particle = particles[i];
      particle.position.add(particle.velocity);
      particle.life -= 1.2;

      // Respawn when life ends
      if (particle.life <= 0) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * impactRadius; // Distributed over Beam Area

        particle.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
        particle.life = 100;

        const velocityMultiplier = Math.max(0.2, speedFactor);
        particle.velocity.set(
          (Math.random() - 0.5) * particle.baseSpread * velocityMultiplier,
          particle.baseSpeedY * (0.8 + Math.random() * 0.4) * velocityMultiplier,
          (Math.random() - 0.5) * particle.baseSpread * velocityMultiplier
        );
      }

      dummy.position.copy(particle.position);
      const scale = Math.max(0, particle.life / 100);
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, MAX_PARTICLES]}>
      <sphereGeometry args={[0.06, 16, 16]} />
      <meshBasicMaterial color="#ffffff" />
    </instancedMesh>
  );
};

interface ReadoutRowProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

const ReadoutRow = ({ label, children, className }: ReadoutRowProps) => (
  <div className={`flex items-baseline justify-between gap-3 py-1 ${className ?? ''}`}>
    <span className="text-muted-foreground">{label}</span>
    <span className="text-right font-semibold tabular-nums text-foreground">{children}</span>
  </div>
);

export default function IsometricPhotoelectric() {
  // --- USER STATES ---
  const [selectedMetal, setSelectedMetal] = useState<Metal>(METALS[0]);
  const [frequency, setFrequency] = useState(6.0); // 10^14 Hz
  const [power, setPower] = useState(50); // Laser Power in mW (10 - 100)
  const [impactRadius, setImpactRadius] = useState(0.6); // Beam Radius (r)

  // --- PHYSICS CALCULATIONS ---
  const photonEnergy = frequency * H_PLANCK; // E = hf (eV)
  const f0 = selectedMetal.phi / H_PLANCK; // f0 = phi / h (10^14 Hz)
  const kMax = Math.max(0, photonEnergy - selectedMetal.phi); // K_max = hf - phi
  const hasEmission = photonEnergy >= selectedMetal.phi;
  const laserColor = getFrequencyColor(frequency);

  // Area & Intensity
  const beamArea = Math.PI * Math.pow(impactRadius, 2); // Area = π * r^2
  const intensity = power / beamArea; // Intensity = Power / Area (mW/cm^2)

  // Rate of emission (Photocurrent) is proportional to Power (number of photons)
  const activeParticleCount = Math.round((power / 100) * MAX_PARTICLES);

  // Visual opacity of beam reflects Intensity (dense vs diffuse light)
  const beamOpacity = Math.min(0.85, Math.max(0.25, 0.2 + (intensity / 150) * 0.6));

  // Slider limits
  const MIN_FREQ = 3.0;
  const MAX_FREQ = 15.0;
  const f0Percent = Math.min(Math.max(((f0 - MIN_FREQ) / (MAX_FREQ - MIN_FREQ)) * 100, 0), 100);

  return (
    <div className="relative flex min-h-[100dvh] w-full flex-col bg-background lg:block">
      {/* --- CONTROL PANEL --- */}
      <Card className="z-10 w-full shrink-0 rounded-none border-x-0 border-t-0 bg-card/95 backdrop-blur lg:absolute lg:top-6 lg:left-6 lg:max-h-[calc(100dvh-3rem)] lg:w-[360px] lg:overflow-y-auto lg:rounded-xl lg:border lg:shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold tracking-tight">Photoelectric Effect</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-sm">
          {/* 1. Metal Selector */}
          <div className="space-y-2">
            <Label>Target Metal (Work Function Φ)</Label>
            <Select
              value={selectedMetal.name}
              onValueChange={(name) => {
                const metal = METALS.find((m) => m.name === name);
                if (metal) setSelectedMetal(metal);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {METALS.map((m) => (
                  <SelectItem key={m.name} value={m.name}>
                    {m.name} (Φ = {m.phi.toFixed(2)} eV)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 2. Frequency Slider with f0 caret */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm font-semibold">
              <Label>Frequency (f)</Label>
              <span style={{ color: laserColor }} className="tabular-nums">
                {frequency.toFixed(2)} × 10¹⁴ Hz
              </span>
            </div>
            <div className="relative pt-5">
              {f0 >= MIN_FREQ && f0 <= MAX_FREQ && (
                <div
                  className="pointer-events-none absolute top-0 flex -translate-x-1/2 flex-col items-center"
                  style={{ left: `${f0Percent}%` }}
                >
                  <span className="rounded bg-red-100 px-1 py-px text-[9px] font-bold whitespace-nowrap text-red-600 dark:bg-red-950 dark:text-red-400">
                    f₀ = {f0.toFixed(2)}
                  </span>
                  <span className="text-[9px] leading-none text-red-600 dark:text-red-400">▼</span>
                </div>
              )}
              <Slider
                min={MIN_FREQ}
                max={MAX_FREQ}
                step={0.05}
                value={[frequency]}
                onValueChange={([v]) => setFrequency(v)}
              />
            </div>
          </div>

          {/* 3. Laser Power Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm font-semibold">
              <Label>Laser Power (P)</Label>
              <span className="tabular-nums">{power} mW</span>
            </div>
            <Slider
              min={10}
              max={100}
              step={5}
              value={[power]}
              onValueChange={([v]) => setPower(v)}
            />
          </div>

          {/* 4. Beam Radius Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm font-semibold">
              <Label>Beam Radius (r)</Label>
              <span className="tabular-nums">{impactRadius.toFixed(2)} cm</span>
            </div>
            <Slider
              min={0.2}
              max={1.6}
              step={0.05}
              value={[impactRadius]}
              onValueChange={([v]) => setImpactRadius(v)}
            />
          </div>

          {/* 5. Live Physics Readout */}
          <div className="divide-y divide-border rounded-lg border bg-muted/40 p-3 text-[13px] leading-relaxed">
            <ReadoutRow label="Beam Area (A = πr²)">{beamArea.toFixed(2)} cm²</ReadoutRow>
            <ReadoutRow label="Intensity (I = P / A)">{intensity.toFixed(1)} mW/cm²</ReadoutRow>
            <ReadoutRow label="Photon Energy (E = hf)">{photonEnergy.toFixed(2)} eV</ReadoutRow>
            <ReadoutRow label="Max Kinetic Energy (Kₘₐₓ)">
              <span className={hasEmission ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                {hasEmission ? `${kMax.toFixed(2)} eV` : '0.00 eV (No Emission)'}
              </span>
            </ReadoutRow>
            <ReadoutRow label="Emission Rate (Current)">
              <span className={hasEmission ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}>
                {hasEmission ? `${activeParticleCount} e⁻/s (scaled)` : '0 e⁻/s'}
              </span>
            </ReadoutRow>
          </div>
        </CardContent>
      </Card>

      {/* --- 3D CANVAS --- */}
      <div className="h-[55dvh] w-full shrink-0 bg-gradient-to-b from-slate-100 to-slate-300 lg:absolute lg:inset-0 lg:h-full dark:from-slate-700 dark:to-slate-900">
        <Canvas>
          <OrthographicCamera makeDefault position={[10, 10, 10]} zoom={120} near={-100} far={100} />
          <OrbitControls target={[0, 0, 0]} enableRotate={false} enableZoom={true} />

          <ambientLight intensity={0.7} />
          <directionalLight position={[10, 20, 5]} intensity={0.9} />
          <directionalLight position={[-8, 6, -10]} intensity={0.35} />

          <group position={[0, -1, 0]}>
            {/* Metal Plate */}
            <mesh position={[0, -0.1, 0]}>
              <boxGeometry args={[4, 0.2, 4]} />
              <meshStandardMaterial color={selectedMetal.color} roughness={0.55} metalness={0.55} />
            </mesh>

            {/* Laser Emitter */}
            <group position={[0, 3, 0]}>
              <mesh position={[0, 0, 0]}>
                <cylinderGeometry args={[0.3, 0.3, 0.6, 32]} />
                <meshStandardMaterial color="#1a66ff" />
              </mesh>
              <mesh position={[0, -0.35, 0]}>
                <cylinderGeometry args={[0.25, 0.25, 0.1, 32]} />
                <meshStandardMaterial color="#333333" />
              </mesh>
            </group>

            {/* Laser Cone (Opacity scales with Intensity) */}
            <mesh position={[0, 1.3, 0]}>
              <cylinderGeometry args={[0.2, impactRadius, 2.6, 32]} />
              <meshBasicMaterial color={laserColor} transparent opacity={beamOpacity} depthWrite={false} />
            </mesh>

            {/* Impact Circle */}
            <mesh position={[0, 0.01, 0]}>
              <cylinderGeometry args={[impactRadius, impactRadius, 0.01, 32]} />
              <meshBasicMaterial color={laserColor} />
            </mesh>

            {/* Dynamic Photoelectrons */}
            <Photoelectrons
              activeCount={activeParticleCount}
              impactRadius={impactRadius}
              kMax={kMax}
              hasEmission={hasEmission}
            />
          </group>
        </Canvas>
      </div>
    </div>
  );
}
