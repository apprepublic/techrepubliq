"use client";

import { useEffect, useRef } from "react";

export default function HeroSunburst() {
  const ref = useRef<HTMLDivElement>(null);
  const modelRef = useRef<any>(null);
  const errorRef = useRef<string | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    let isMounted = true;
    let renderer: any = null;
    let animationFrameId: number;
    let handleResize: (() => void) | null = null;
    const div = ref.current;

    ;(async () => {
      try {
        if (typeof window !== "undefined" && typeof process !== "undefined" && !process.emitWarning) {
          process.emitWarning = () => {};
        }

        const THREE = await import("three");
        const { OBJLoader } = await import("three/examples/jsm/loaders/OBJLoader.js");
        const { MTLLoader } = await import("three/examples/jsm/loaders/MTLLoader.js");

        if (!isMounted || !ref.current) return;
        const width = div.clientWidth || 300;
        const height = div.clientHeight || 300;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true,
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        div.appendChild(renderer.domElement);

        // Load MTL first, then OBJ
        const mtlLoader = new MTLLoader();
        mtlLoader.setPath("/assets/");

        const materials: any = await new Promise((resolve, reject) => {
          mtlLoader.load(
            "red_3d_sunburst.mtl",
            (mat) => {
              mat.preload();
              resolve(mat);
            },
            undefined,
            reject
          );
        });

        if (!isMounted) return;

        const objLoader = new OBJLoader();
        if (materials) {
          objLoader.setMaterials(materials);
        }
        objLoader.setPath("/assets/");

        const rawObject: any = await new Promise((resolve, reject) => {
          objLoader.load("red_3d_sunburst.obj", resolve, undefined, reject);
        });

        if (!isMounted || !rawObject) return;

        const object = rawObject;
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
          if (!isMounted) return;
          animationFrameId = requestAnimationFrame(animate);
          if (modelRef.current) {
            modelRef.current.rotation.y += 0.005;
          }
          renderer.render(scene, camera);
        };
        animate();

        // Resize handler
        handleResize = () => {
          if (!div || !renderer) return;
          const newWidth = div.clientWidth || 300;
          const newHeight = div.clientHeight || 300;
          camera.aspect = newWidth / newHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(newWidth, newHeight);
        };
        window.addEventListener("resize", handleResize);
      } catch (e: any) {
        if (isMounted) {
          errorRef.current = `Initialization error: ${e.message || e}`;
        }
      }
    })();

    return () => {
      isMounted = false;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (handleResize) window.removeEventListener("resize", handleResize);
      if (renderer) {
        renderer.dispose();
        if (renderer.domElement && div.contains(renderer.domElement)) {
          div.removeChild(renderer.domElement);
        }
      }
    };
  }, []);

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