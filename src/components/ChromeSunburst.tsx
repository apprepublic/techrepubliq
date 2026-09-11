"use client";

import { useEffect, useRef } from "react";

// Inline OBJ from TechRepubliQ-preview.html - 24 extruded radial blades
const CHROME_SUNBURST_OBJ = `# Chrome sunburst - 24 extruded radial blades, hollow center
mtllib chrome_sunburst.mtl
o chrome_sunburst
v -0.07000 0.90000 0.17500
v -0.17000 3.00000 0.17500
v 0.17000 3.00000 0.17500
v 0.07000 0.90000 0.17500
v -0.07000 0.90000 -0.17500
v -0.17000 3.00000 -0.17500
v 0.17000 3.00000 -0.17500
v 0.07000 0.90000 -0.17500
v -0.30055 0.85122 0.17500
v -0.94066 2.85378 0.17500
v -0.61225 2.94178 0.17500
v -0.16532 0.88745 0.17500
v -0.30055 0.85122 -0.17500
v -0.94066 2.85378 -0.17500
v -0.61225 2.94178 -0.17500
v -0.16532 0.88745 -0.17500
v -0.51062 0.74442 0.17500
v -1.64722 2.51308 0.17500
v -1.35278 2.68308 0.17500
v -0.38938 0.81442 0.17500
v -0.51062 0.74442 -0.17500
v -1.64722 2.51308 -0.17500
v -1.35278 2.68308 -0.17500
v -0.38938 0.81442 -0.17500
v -0.68589 0.58690 0.17500
v -2.24153 2.00111 0.17500
v -2.00111 2.24153 0.17500
v -0.58690 0.68589 0.17500
v -0.68589 0.58690 -0.17500
v -2.24153 2.00111 -0.17500
v -2.00111 2.24153 -0.17500
v -0.58690 0.68589 -0.17500
v -0.81442 0.38938 0.17500
v -2.68308 1.35278 0.17500
v -2.51308 1.64722 0.17500
v -0.74442 0.51062 0.17500
v -0.81442 0.38938 -0.17500
v -2.68308 1.35278 -0.17500
v -2.51308 1.64722 -0.17500
v -0.74442 0.51062 -0.17500
v -0.88745 0.16532 0.17500
v -2.94178 0.61225 0.17500
v -2.85378 0.94066 0.17500
v -0.85122 0.30055 0.17500
v -0.88745 0.16532 -0.17500
v -2.94178 0.61225 -0.17500
v -2.85378 0.94066 -0.17500
v -0.85122 0.30055 -0.17500
v -0.90000 -0.07000 0.17500
v -3.00000 -0.17000 0.17500
v -3.00000 0.17000 0.17500
v -0.90000 0.07000 0.17500
v -0.90000 -0.07000 -0.17500
v -3.00000 -0.17000 -0.17500
v -3.00000 0.17000 -0.17500
v -0.90000 0.07000 -0.17500
v -0.85122 -0.30055 0.17500
v -2.85378 -0.94066 0.17500
v -2.94178 -0.61225 0.17500
v -0.88745 -0.16532 0.17500
v -0.85122 -0.30055 -0.17500
v -2.85378 -0.94066 -0.17500
v -2.94178 -0.61225 -0.17500
v -0.88745 -0.16532 -0.17500
v -0.74442 -0.51062 0.17500
v -2.51308 -1.64722 0.17500
v -2.68308 -1.35278 0.17500
v -0.81442 -0.38938 0.17500
v -0.74442 -0.51062 -0.17500
v -2.51308 -1.64722 -0.17500
v -2.68308 -1.35278 -0.17500
v -0.81442 -0.38938 -0.17500
v -0.58690 -0.68589 0.17500
v -2.00111 -2.24153 0.17500
v -2.24153 -2.00111 0.17500
v -0.68589 -0.58690 0.17500
v -0.58690 -0.68589 -0.17500
v -2.00111 -2.24153 -0.17500
v -2.24153 -2.00111 -0.17500
v -0.68589 -0.58690 -0.17500
v -0.38938 -0.81442 0.17500
v -1.35278 -2.68308 0.17500
v -1.64722 -2.51308 0.17500
v -0.51062 -0.74442 0.17500
v -0.38938 -0.81442 -0.17500
v -1.35278 -2.68308 -0.17500
v -1.64722 -2.51308 -0.17500
v -0.51062 -0.74442 -0.17500
v -0.16532 -0.88745 0.17500
v -0.61225 -2.94178 0.17500
v -0.94066 -2.85378 0.17500
v -0.30055 -0.85122 0.17500
v -0.16532 -0.88745 -0.17500
v -0.61225 -2.94178 -0.17500
v -0.94066 -2.85378 -0.17500
v -0.30055 -0.85122 -0.17500
v 0.07000 -0.90000 0.17500
v 0.17000 -3.00000 0.17500
v -0.17000 -3.00000 0.17500
v -0.07000 -0.90000 0.17500
v 0.07000 -0.90000 -0.17500
v 0.17000 -3.00000 -0.17500
v -0.17000 -3.00000 -0.17500
v -0.07000 -0.90000 -0.17500
v 0.30055 -0.85122 0.17500
v 0.94066 -2.85378 0.17500
v 0.61225 -2.94178 0.17500
v 0.16532 -0.88745 0.17500
v 0.30055 -0.85122 -0.17500
v 0.94066 -2.85378 -0.17500
v 0.61225 -2.94178 -0.17500
v 0.16532 -0.88745 -0.17500
v 0.51062 -0.74442 0.17500
v 1.64722 -2.51308 0.17500
v 1.35278 -2.68308 0.17500
v 0.38938 -0.81442 0.17500
v 0.51062 -0.74442 -0.17500
v 1.64722 -2.51308 -0.17500
v 1.35278 -2.68308 -0.17500
v 0.38938 -0.81442 -0.17500
v 0.68589 -0.58690 0.17500
v 2.24153 -2.00111 0.17500
v 2.00111 -2.24153 0.17500
v 0.58690 -0.68589 0.17500
v 0.68589 -0.58690 -0.17500
v 2.24153 -2.00111 -0.17500
v 2.00111 -2.24153 -0.17500
v 0.58690 -0.68589 -0.17500
v 0.81442 -0.38938 0.17500
v 2.68308 -1.35278 0.17500
v 2.51308 -1.64722 0.17500
v 0.74442 -0.51062 0.17500
v 0.81442 -0.38938 -0.17500
v 2.68308 -1.35278 -0.17500
v 2.51308 -1.64722 -0.17500
v 0.74442 -0.51062 -0.17500
v 0.88745 -0.16532 0.17500
v 2.94178 -0.61225 0.17500
v 2.85378 -0.94066 0.17500
v 0.85122 -0.30055 0.17500
v 0.88745 -0.16532 -0.17500
v 2.94178 -0.61225 -0.17500
v 2.85378 -0.94066 -0.17500
v 0.85122 -0.30055 -0.17500
v 0.90000 0.07000 0.17500
v 3.00000 0.17000 0.17500
v 3.00000 -0.17000 0.17500
v 0.90000 -0.07000 0.17500
v 0.90000 0.07000 -0.17500
v 3.00000 0.17000 -0.17500
v 3.00000 -0.17000 -0.17500
v 0.90000 -0.07000 -0.17500
v 0.85122 0.30055 0.17500
v 2.85378 0.94066 0.17500
v 2.94178 0.61225 0.17500
v 0.88745 0.16532 0.17500
v 0.85122 0.30055 -0.17500
v 2.85378 0.94066 -0.17500
v 2.94178 0.61225 -0.17500
v 0.88745 0.16532 -0.17500
v 0.74442 0.51062 0.17500
v 2.51308 1.64722 0.17500
v 2.68308 1.35278 0.17500
v 0.81442 0.38938 0.17500
v 0.74442 0.51062 -0.17500
v 2.51308 1.64722 -0.17500
v 2.68308 1.35278 -0.17500
v 0.81442 0.38938 -0.17500
v 0.58690 0.68589 0.17500
v 2.00111 2.24153 0.17500
v 2.24153 2.00111 0.17500
v 0.68589 0.58690 0.17500
v 0.58690 0.68589 -0.17500
v 2.00111 2.24153 -0.17500
v 2.24153 2.00111 -0.17500
v 0.68589 0.58690 -0.17500
v 0.38938 0.81442 0.17500
v 1.35278 2.68308 0.17500
v 1.64722 2.51308 0.17500
v 0.51062 0.74442 0.17500
v 0.38938 0.81442 -0.17500
v 1.35278 2.68308 -0.17500
v 1.64722 2.51308 -0.17500
v 0.51062 0.74442 -0.17500
v 0.16532 0.88745 0.17500
v 0.61225 2.94178 0.17500
v 0.94066 2.85378 0.17500
v 0.30055 0.85122 0.17500
v 0.16532 0.88745 -0.17500
v 0.61225 2.94178 -0.17500
v 0.94066 2.85378 -0.17500
v 0.30055 0.85122 -0.17500
usemtl chrome_red
f 1 2 3 4
f 8 7 6 5
f 1 2 6 5
f 2 3 7 6
f 3 4 8 7
f 4 1 5 8
f 9 10 11 12
f 16 15 14 13
f 9 10 14 13
f 10 11 15 14
f 11 12 16 15
f 12 9 13 16
f 17 18 19 20
f 24 23 22 21
f 17 18 22 21
f 18 19 23 22
f 19 20 24 23
f 20 17 21 24
f 25 26 27 28
f 32 31 30 29
f 25 26 30 29
f 26 27 31 30
f 27 28 32 31
f 28 25 29 32
f 33 34 35 36
f 40 39 38 37
f 33 34 38 37
f 34 35 39 38
f 35 36 40 39
f 36 33 37 40
f 41 42 43 44
f 48 47 46 45
f 41 42 46 45
f 42 43 47 46
f 43 44 48 47
f 44 41 45 48
f 49 50 51 52
f 56 55 54 53
f 49 50 54 53
f 50 51 55 54
f 51 52 56 55
f 52 49 53 56
f 57 58 59 60
f 64 63 62 61
f 57 58 62 61
f 58 59 63 62
f 59 60 64 63
f 60 57 61 64
f 65 66 67 68
f 72 71 70 69
f 65 66 70 69
f 66 67 71 70
f 67 68 72 71
f 68 65 69 72
f 73 74 75 76
f 80 79 78 77
f 73 74 78 77
f 74 75 79 78
f 75 76 80 79
f 76 73 77 80
f 81 82 83 84
f 88 87 86 85
f 81 82 86 85
f 82 83 87 86
f 83 84 88 87
f 84 81 85 88
f 89 90 91 92
f 96 95 94 93
f 89 90 94 93
f 90 91 95 94
f 91 92 96 95
f 92 89 93 96
f 97 98 99 100
f 104 103 102 101
f 97 98 102 101
f 98 99 103 102
f 99 100 104 103
f 100 97 101 104
f 105 106 107 108
f 112 111 110 109
f 105 106 110 109
f 106 107 111 110
f 107 108 112 111
f 108 105 109 112
f 113 114 115 116
f 120 119 118 117
f 113 114 118 117
f 114 115 119 118
f 115 116 120 119
f 116 113 117 120
f 121 122 123 124
f 128 127 126 125
f 121 122 126 125
f 122 123 127 126
f 123 124 128 127
f 124 121 125 128
f 129 130 131 132
f 136 135 134 133
f 129 130 134 133
f 130 131 135 134
f 131 132 136 135
f 132 129 133 136
f 137 138 139 140
f 144 143 142 141
f 137 138 142 141
f 138 139 143 142
f 139 140 144 143
f 140 137 141 144
f 145 146 147 148
f 152 151 150 149
f 145 146 150 149
f 146 147 151 150
f 147 148 152 151
f 148 145 149 152
f 153 154 155 156
f 160 159 158 157
f 153 154 158 157
f 154 155 159 158
f 155 156 160 159
f 156 153 157 160
f 161 162 163 164
f 168 167 166 165
f 161 162 166 165
f 162 163 167 166
f 163 164 168 167
f 164 161 165 168
f 169 170 171 172
f 176 175 174 173
f 169 170 174 173
f 170 171 175 174
f 171 172 176 175
f 172 169 173 176
f 177 178 179 180
f 184 183 182 181
f 177 178 182 181
f 178 179 183 182
f 179 180 184 183
f 180 177 181 184
f 185 186 187 188
f 192 191 190 189
f 185 186 190 189
f 186 187 191 190
f 187 188 192 191
f 188 185 189 192
`;

export default function ChromeSunburst() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    let mounted = true;
    let renderer: any = null;
    let animationId = 0;
    let spinGroup: any = null;
    let currentRotation = 0;
    let targetRotation = 0;
    let lastScrollY = window.scrollY;

    const ROTATION_SENSITIVITY = 0.012;

    const init = async () => {
      const THREE = await import("three");
      const { OBJLoader } = await import("three/examples/jsm/loaders/OBJLoader.js");

      if (!mounted || !el) return;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
      camera.position.set(0, 0, 7);
      camera.lookAt(0, 0, 0);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      el.appendChild(renderer.domElement);

      // Lights for glossy chrome look
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

      const chromeMaterial = new THREE.MeshPhongMaterial({
        color: 0xc8102e,
        specular: 0xffffff,
        shininess: 220,
      });

      spinGroup = new THREE.Group();
      scene.add(spinGroup);

      const loader = new OBJLoader();
      const object = loader.parse(CHROME_SUNBURST_OBJ);
      object.traverse((child: any) => {
        if (child.isMesh) child.material = chromeMaterial;
      });

      const box = new THREE.Box3().setFromObject(object);
      const center = box.getCenter(new THREE.Vector3());
      object.position.sub(center);
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z) || 1;
      const scale = 4.8 / maxDim;
      object.scale.setScalar(scale);

      object.rotation.x = THREE.MathUtils.degToRad(12);
      object.rotation.y = THREE.MathUtils.degToRad(22);

      spinGroup.add(object);

      const resize = () => {
        if (!el || !renderer) return;
        const w = el.clientWidth || 1;
        const h = el.clientHeight || w;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      resize();
      window.addEventListener("resize", resize);

      const onScroll = () => {
        const currentY = window.scrollY;
        const delta = currentY - lastScrollY;
        targetRotation -= delta * ROTATION_SENSITIVITY;
        lastScrollY = currentY;
      };
      window.addEventListener("scroll", onScroll, { passive: true });

      const animate = () => {
        if (!mounted) return;
        currentRotation += (targetRotation - currentRotation) * 0.08;
        if (spinGroup) spinGroup.rotation.z = currentRotation;
        renderer.render(scene, camera);
        animationId = requestAnimationFrame(animate);
      };
      animate();

      return () => {
        window.removeEventListener("resize", resize);
        window.removeEventListener("scroll", onScroll);
      };
    };

    let cleanupResize: (() => void) | undefined;
    init().then((cleanup) => {
      if (typeof cleanup === "function") {
        cleanupResize = cleanup as any;
      }
    });

    return () => {
      mounted = false;
      if (animationId) cancelAnimationFrame(animationId);
      if (cleanupResize) cleanupResize();
      if (renderer) {
        renderer.dispose();
        if (renderer.domElement && el.contains(renderer.domElement)) {
          el.removeChild(renderer.domElement);
        }
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full max-w-[440px] aspect-square min-w-0 relative rounded-full"
      style={{
        background: "radial-gradient(circle at 50% 50%, rgba(255,92,77,0.07), transparent 68%)",
      }}
    />
  );
}
