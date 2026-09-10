"use client";

import { useEffect, useRef } from "react";

export default function HeroSunburst() {
  const ref = useRef<HTMLDivElement>(null);
  const modelRef = useRef<any>(null);
  const errorRef = useRef<string | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    const div = ref.current;
    const width = div.clientWidth;
    const height = div.clientHeight;

    // @ts-ignore - Three.js global
    const THREE: any = require("three");
    if (!THREE) {
      errorRef.current = "Failed to load Three.js";
      return;
    }

    const { OBJLoader }: any = require("three/examples/jsm/loaders/OBJLoader");
    const { MTLLoader }: any = require("three/examples/jsm/loaders/MTLLoader");

    if (!OBJLoader || !MTLLoader) {
      errorRef.current = "Failed to load Three.js loaders";
      return;
    }

    ;(async () => {
      try {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true,
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        div.appendChild(renderer.domElement);

        // Load MTL first, then OBJ
        const mtlLoader = new MTLLoader();
        mtlLoader.setPath("/assets/");

        const mtl = await new Promise((resolve, reject) => {
          mtlLoader.load("red_3d_sunburst.mtl", resolve, undefined, reject);
        });
        if (!mtl) throw new Error("MTL load returned null");

        const objLoader = new OBJLoader(mtl);
        objLoader.setPath("/assets/");

        const rawObject = await new Promise((resolve, reject) => {
          objLoader.load("red_3d_sunburst.obj", resolve, undefined, reject);
        });
        if (!rawObject) throw new Error("OBJ load returned null");

        // @ts-ignore - Three.js Group methods
        const object: any = rawObject;
        scene.add(object);
        modelRef.current = object;

        // Center and scale the model
        object.traverse((child: any) => {
          if (child.isMesh) {
            child.material.transparent = true;
            child.material.opacity = 0.95;
            child.scale.set(0.1, 0.1, 0.1);
          }
        });
        object.position.set(0, 0, 0);

        camera.position.set(0, 0, 80);

        // Animation loop
        const animate = () => {
          requestAnimationFrame(animate);
          if (modelRef.current) {
            modelRef.current.rotation.y += 0.005;
          }
          renderer.render(scene, camera);
        };
        animate();

        // Resize handler
        const handleResize = () => {
          const newWidth = div.clientWidth;
          const newHeight = div.clientHeight;
          camera.aspect = newWidth / newHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(newWidth, newHeight);
        };
        window.addEventListener("resize", handleResize);

        // Cleanup
        return () => {
          window.removeEventListener("resize", handleResize);
          renderer.dispose();
          div.removeChild(renderer.domElement);
        };
      } catch (e: any) {
        errorRef.current = `Initialization error: ${e.message || e}`;
      }
    })();
  }, [ref]);

  // Show error fallback if something went wrong
  if (errorRef.current) {
    return (
      <div
        ref={ref}
        className="absolute inset-0 flex items-center justify-center text-red-600 text-sm"
      >
        {errorRef.current}
      </div>
    );
  }

  return <div ref={ref} className="absolute inset-0" />;
}