"use client";

import { useEffect, useRef } from "react";

/**
 * The hero's 3D sunburst — a port of the `#ring3d` block in the v7 preview
 * document, kept visually identical: same camera, same four-light rig, same
 * glossy brand-red material, same Box3-normalised fit, same 12°/22° rest tilt,
 * and the same scroll-driven spin (rotation is proportional to scroll delta,
 * eased 8% per frame, so a fast flick spins fast and it settles without drift).
 *
 * Two things differ from the document, both on purpose:
 *
 * - three.js comes from node_modules via dynamic import, the same way
 *   ChromeSunburst.tsx loads it. The document pulled r128 + OBJLoader off two
 *   CDNs and bailed out to an empty box whenever those requests failed, which is
 *   how the object disappeared in the first place.
 * - It loads the real brand model, /assets/red_3d_sunburst.obj (20 extruded
 *   spokes), rather than the inline 24-blade geometry the document parsed. The
 *   model's `mtllib` is deliberately ignored: red_3d_sunburst.mtl names a flat
 *   matte red, while this material is the glossy accent the rest of the page was
 *   tuned against.
 */

const MODEL_URL = "/assets/red_3d_sunburst.obj";

// The mesh is centred on its own bounds and scaled to this, so the object always
// fills the same part of the frame regardless of the units it was authored in.
const FIT = 4.8;
const ROTATION_SENSITIVITY = 0.012;
const SPIN_EASING = 0.08;

export default function SunburstRing() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let disposed = false;
    let renderer: import("three").WebGLRenderer | null = null;
    let frame = 0;
    let onResize: (() => void) | null = null;
    let onScroll: (() => void) | null = null;

    (async () => {
      const THREE = await import("three");
      const { OBJLoader } = await import("three/examples/jsm/loaders/OBJLoader.js");
      if (disposed || !hostRef.current) return;

      // three r152+ switched colour management on by default, which reads as a
      // darker, flatter red than this scene was lit against. Match the r128
      // response the document was authored with.
      THREE.ColorManagement.enabled = false;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
      camera.position.set(0, 0, 7);
      camera.lookAt(0, 0, 0);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      host.appendChild(renderer.domElement);

      // Lighting tuned for a glossy chrome/metal look
      scene.add(new THREE.AmbientLight(0xffffff, 0.4));
      const keyLight = new THREE.DirectionalLight(0xffffff, 1.1);
      keyLight.position.set(2, 3, 4);
      scene.add(keyLight);
      const rimLight = new THREE.PointLight(0xff6b5b, 1.2, 20);
      rimLight.position.set(-3, -2, 3);
      scene.add(rimLight);
      const coolLight = new THREE.PointLight(0xb9c6ff, 0.6, 20);
      coolLight.position.set(3, -1, -3);
      scene.add(coolLight);

      // The group that actually spins: the mesh is re-centred on this group's
      // origin so rotation never drifts, it only turns in place.
      const spinGroup = new THREE.Group();
      scene.add(spinGroup);

      let object;
      try {
        const res = await fetch(MODEL_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        object = new OBJLoader().parse(await res.text());
      } catch (err) {
        // Leave the CSS radial glow behind rather than an empty canvas.
        console.error(`[ring3d] ${MODEL_URL} could not be loaded:`, err);
        renderer.dispose();
        host.removeChild(renderer.domElement);
        renderer = null;
        return;
      }
      if (disposed) return;

      const material = new THREE.MeshPhongMaterial({
        color: 0xc8102e,
        specular: 0xffffff,
        shininess: 220,
        reflectivity: 1,
      });
      object.traverse((child) => {
        if ((child as import("three").Mesh).isMesh) {
          (child as import("three").Mesh).material = material;
        }
      });

      const box = new THREE.Box3().setFromObject(object);
      object.position.sub(box.getCenter(new THREE.Vector3()));
      const size = box.getSize(new THREE.Vector3());
      object.scale.setScalar(FIT / (Math.max(size.x, size.y, size.z) || 1));

      // Static tilt so the object reads as 3D at rest — face-on, the extruded
      // depth of the blades is hidden. Tilting right and down exposes the side
      // faces and gives it real volume.
      object.rotation.x = THREE.MathUtils.degToRad(12);
      object.rotation.y = THREE.MathUtils.degToRad(22);
      spinGroup.add(object);

      const resize = () => {
        if (!renderer || !host) return;
        const w = host.clientWidth || 1;
        const h = host.clientHeight || w;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      resize();
      window.addEventListener("resize", resize);
      onResize = resize;

      // It sits still and only spins with scrolling: rotation tracks how far and
      // how fast the page moved, down = clockwise, up = counter-clockwise.
      let target = 0;
      let current = 0;
      let lastY = window.scrollY;
      const handleScroll = () => {
        const y = window.scrollY;
        target -= (y - lastY) * ROTATION_SENSITIVITY;
        lastY = y;
      };
      window.addEventListener("scroll", handleScroll, { passive: true });
      onScroll = handleScroll;

      const animate = () => {
        frame = requestAnimationFrame(animate);
        current += (target - current) * SPIN_EASING;
        spinGroup.rotation.z = current;
        renderer?.render(scene, camera);
      };
      animate();
    })().catch((err) => {
      console.error("[ring3d] three.js failed to load:", err);
    });

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      if (onResize) window.removeEventListener("resize", onResize);
      if (onScroll) window.removeEventListener("scroll", onScroll);
      if (renderer) {
        const canvas = renderer.domElement;
        renderer.dispose();
        if (canvas.parentNode === host) host.removeChild(canvas);
      }
    };
  }, []);

  return <div id="ring3d" ref={hostRef} />;
}
