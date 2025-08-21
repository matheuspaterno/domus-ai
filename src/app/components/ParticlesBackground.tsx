"use client";

import { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadLinksPreset } from "tsparticles-preset-links";
import type { Engine } from "tsparticles-engine";

export default function ParticlesBackground() {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadLinksPreset(engine);
  }, []);

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        preset: "links",
        fullScreen: {
          enable: true,
          zIndex: 0,
        },
        background: {
          color: "transparent",
        },
        particles: {
          move: {
            speed: 0.3,
          },
          links: {
            color: "#ffffff",
            distance: 150,
            enable: true,
            opacity: 0.4,
            width: 1,
          },
          number: {
            value: 100,
            density: {
              enable: true,
              area: 800,
            },
          },
          size: {
            value: 1.5,
          },
          color: {
            value: "#ffffff",
          },
        },
      }}
    />
  );
}
