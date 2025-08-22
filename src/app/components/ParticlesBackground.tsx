"use client";

import { useCallback, useEffect } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadFull } from "tsparticles";

export default function ParticlesBackground() {
  const particlesInit = useCallback(async (engine: any) => {
    try {
      console.log("[particles] init", engine?.version ?? null);
      await loadFull(engine);
      console.log("[particles] loadFull completed");
    } catch (err) {
      console.error("[particles] init error", err);
    }
  }, []);
  const particlesLoaded = useCallback(async (container: any) => {
    console.log("[particles] loaded", !!container);
  }, []);
  const options: any = {
    fullScreen: { enable: true, zIndex: 0 },
    background: { color: "transparent" },
    particles: {
      move: { enable: true, speed: 1.6 },
      links: { color: "#FFD966", distance: 150, enable: true, opacity: 0.35, width: 1 },
      number: { value: 100, density: { enable: true, area: 800 } },
      size: { value: 1.6 },
      color: { value: "#FFD966" },
    },
    interactivity: {
      events: {
        onHover: { enable: true, mode: "repulse" },
        onClick: { enable: false },
        resize: true,
      },
      modes: {
        repulse: { distance: 120, duration: 0.4 },
      },
    },
    detectRetina: true,
  };

  // initialize the engine via the helper so the loadFull(engine) runs
  useEffect(() => {
    if (typeof window === "undefined") return;
    initParticlesEngine(particlesInit).catch((err) => {
      console.error("[particles] initParticlesEngine failed", err);
    });
  }, [particlesInit]);

  // cast Particles to any to avoid typing mismatches between installed versions
  const ParticlesAny: any = Particles;

  return (
    <ParticlesAny id="tsparticles" init={particlesInit} options={options} loaded={particlesLoaded} />
  );
}
