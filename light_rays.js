/**
 * Dark Purple Light Rays WebGL Effect
 * Origin: Bottom-Center shooting UPWARDS to top of page
 * Color: Rich Dark Purple (#581c87 / #6b21a8)
 */
(function() {
    function hexToRgb(hex) {
        const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return m ? [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255] : [0.42, 0.11, 0.65];
    }

    function getAnchorAndDir(origin, w, h) {
        const outside = 0.15;
        switch (origin) {
            case 'bottom-center':
                return { anchor: [0.5 * w, (1 + outside) * h], dir: [0, -1] };
            case 'bottom-left':
                return { anchor: [0, (1 + outside) * h], dir: [0, -1] };
            case 'bottom-right':
                return { anchor: [w, (1 + outside) * h], dir: [0, -1] };
            default:
                return { anchor: [0.5 * w, (1 + outside) * h], dir: [0, -1] };
        }
    }

    function initLightRays() {
        if (!window.OGL) return;
        const { Renderer, Program, Triangle, Mesh } = window.OGL;

        let container = document.getElementById('light-rays-bg');
        if (!container) {
            container = document.createElement('div');
            container.id = 'light-rays-bg';
            container.style.cssText = 'position:fixed; inset:0; pointer-events:none; z-index:1; opacity:0.85; overflow:hidden;';
            document.body.appendChild(container);
        }

        const raysOrigin = 'bottom-center'; // Shoots from bottom to top
        const raysColor = '#581c87';        // Dark Purple
        const raysSpeed = 1.3;
        const lightSpread = 1.4;
        const rayLength = 3.0;
        const pulsating = false;
        const fadeDistance = 1.2;
        const saturation = 1.2;
        const followMouse = true;
        const mouseInfluence = 0.2;
        const noiseAmount = 0.03;
        const distortion = 0.06;

        const renderer = new Renderer({
            dpr: Math.min(window.devicePixelRatio, 2),
            alpha: true
        });
        const gl = renderer.gl;
        gl.canvas.style.width = '100%';
        gl.canvas.style.height = '100%';

        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
        container.appendChild(gl.canvas);

        const vert = `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}`;

        const frag = `precision highp float;

uniform float iTime;
uniform vec2  iResolution;

uniform vec2  rayPos;
uniform vec2  rayDir;
uniform vec3  raysColor;
uniform float raysSpeed;
uniform float lightSpread;
uniform float rayLength;
uniform float pulsating;
uniform float fadeDistance;
uniform float saturation;
uniform vec2  mousePos;
uniform float mouseInfluence;
uniform float noiseAmount;
uniform float distortion;

varying vec2 vUv;

float noise(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

float rayStrength(vec2 raySource, vec2 rayRefDirection, vec2 coord,
                  float seedA, float seedB, float speed) {
  vec2 sourceToCoord = coord - raySource;
  vec2 dirNorm = normalize(sourceToCoord);
  float cosAngle = dot(dirNorm, rayRefDirection);

  float distortedAngle = cosAngle + distortion * sin(iTime * 2.0 + length(sourceToCoord) * 0.01) * 0.25;
  
  float spreadFactor = pow(max(distortedAngle, 0.0), 1.0 / max(lightSpread, 0.001));

  float distance = length(sourceToCoord);
  float maxDistance = iResolution.y * rayLength;
  float lengthFalloff = clamp((maxDistance - distance) / maxDistance, 0.0, 1.0);
  
  float fadeFalloff = clamp((iResolution.y * fadeDistance - distance) / (iResolution.y * fadeDistance), 0.3, 1.0);
  float pulse = pulsating > 0.5 ? (0.8 + 0.2 * sin(iTime * speed * 3.0)) : 1.0;

  float baseStrength = clamp(
    (0.5 + 0.2 * sin(distortedAngle * seedA + iTime * speed)) +
    (0.35 + 0.25 * cos(-distortedAngle * seedB + iTime * speed)),
    0.0, 1.0
  );

  return baseStrength * lengthFalloff * fadeFalloff * spreadFactor * pulse;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 coord = vec2(fragCoord.x, iResolution.y - fragCoord.y);
  
  vec2 finalRayDir = rayDir;
  if (mouseInfluence > 0.0) {
    vec2 mouseScreenPos = mousePos * iResolution.xy;
    vec2 mouseDirection = normalize(mouseScreenPos - rayPos);
    finalRayDir = normalize(mix(rayDir, mouseDirection, mouseInfluence));
  }

  vec4 rays1 = vec4(1.0) *
               rayStrength(rayPos, finalRayDir, coord, 36.2214, 21.11349,
                           1.5 * raysSpeed);
  vec4 rays2 = vec4(1.0) *
               rayStrength(rayPos, finalRayDir, coord, 22.3991, 18.0234,
                           1.1 * raysSpeed);

  float intensity = clamp(rays1.x * 0.55 + rays2.x * 0.45, 0.0, 1.0);

  if (noiseAmount > 0.0) {
    float n = noise(coord * 0.01 + iTime * 0.1);
    intensity *= (1.0 - noiseAmount + noiseAmount * n);
  }

  // Dark purple ray color (RGB: 0.35, 0.08, 0.55)
  vec3 darkPurple = vec3(0.38, 0.08, 0.58);
  
  // Rays originate from bottom (y=h in screen space coord) and shoot UP towards y=0
  float yGradient = clamp((iResolution.y - coord.y) / iResolution.y, 0.0, 1.0);
  
  // Alpha channels so dark purple rays are strongly visible over white/light surfaces
  float alpha = intensity * (0.15 + yGradient * 0.35);

  fragColor = vec4(darkPurple, alpha);
}

void main() {
  vec4 color;
  mainImage(color, gl_FragCoord.xy);
  gl_FragColor = color;
}`;

        const uniforms = {
            iTime: { value: 0 },
            iResolution: { value: [1, 1] },
            rayPos: { value: [0, 0] },
            rayDir: { value: [0, -1] },
            raysColor: { value: hexToRgb(raysColor) },
            raysSpeed: { value: raysSpeed },
            lightSpread: { value: lightSpread },
            rayLength: { value: rayLength },
            pulsating: { value: pulsating ? 1.0 : 0.0 },
            fadeDistance: { value: fadeDistance },
            saturation: { value: saturation },
            mousePos: { value: [0.5, 0.5] },
            mouseInfluence: { value: mouseInfluence },
            noiseAmount: { value: noiseAmount },
            distortion: { value: distortion }
        };

        const geometry = new Triangle(gl);
        const program = new Program(gl, { vertex: vert, fragment: frag, uniforms, transparent: true });
        const mesh = new Mesh(gl, { geometry, program });

        let mouse = { x: 0.5, y: 0.5 };
        let smoothMouse = { x: 0.5, y: 0.5 };

        function updatePlacement() {
            if (!container || !renderer) return;
            const wCSS = container.clientWidth || window.innerWidth;
            const hCSS = container.clientHeight || window.innerHeight;
            renderer.setSize(wCSS, hCSS);
            const dpr = renderer.dpr;
            const w = wCSS * dpr;
            const h = hCSS * dpr;
            uniforms.iResolution.value = [w, h];
            const { anchor, dir } = getAnchorAndDir(raysOrigin, w, h);
            uniforms.rayPos.value = anchor;
            uniforms.rayDir.value = dir;
        }

        window.addEventListener('resize', updatePlacement);
        updatePlacement();

        if (followMouse) {
            window.addEventListener('mousemove', (e) => {
                const rect = container.getBoundingClientRect();
                mouse.x = (e.clientX - rect.left) / rect.width;
                mouse.y = (e.clientY - rect.top) / rect.height;
            });
        }

        function anim(t) {
            uniforms.iTime.value = t * 0.001;
            if (followMouse && mouseInfluence > 0.0) {
                smoothMouse.x = smoothMouse.x * 0.92 + mouse.x * 0.08;
                smoothMouse.y = smoothMouse.y * 0.92 + mouse.y * 0.08;
                uniforms.mousePos.value = [smoothMouse.x, smoothMouse.y];
            }
            try {
                renderer.render({ scene: mesh });
            } catch (e) {}
            requestAnimationFrame(anim);
        }
        requestAnimationFrame(anim);
    }

    function startWithRetry(attempts) {
        if (window.OGL) {
            initLightRays();
        } else if ((attempts || 0) < 30) {
            setTimeout(function() { startWithRetry((attempts || 0) + 1); }, 150);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() { startWithRetry(0); });
    } else {
        startWithRetry(0);
    }
})();
