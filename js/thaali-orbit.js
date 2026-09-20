/**
 * RAJASTHANI TADKA — THAALI CELESTIAL GRAVITATIONAL ORBIT
 * Smooth 60fps planetary revolution of 8 signature royal dishes
 * orbiting the central bronze Thaali platter with real-time continuous
 * rotation, scroll-driven gravitational settling, and interactive hover.
 */

class ThaaliOrbitController {
  constructor() {
    this.section = document.getElementById('thaali-section');
    this.wrapper = document.querySelector('.thaali-stage-wrapper');
    this.centerTray = document.querySelector('.thaali-center-tray');

    if (!this.section || !this.wrapper) return;

    // 8 Signature Dishes distributed evenly at 45-degree intervals (2*PI / 8)
    this.katoris = [
      { id: 'dal-baati-churma', name: 'Dal Baati Churma', angle: -Math.PI / 2, img: 'images/dal-baati.jpg' },
      { id: 'gatte-ki-sabzi', name: 'Gatte Ki Sabzi', angle: -Math.PI / 4, img: 'images/gatte-ki-sabzi.jpg' },
      { id: 'ker-sangri', name: 'Ker Sangri', angle: 0, img: 'images/ker-sangri.jpg' },
      { id: 'rajasthani-kadhi', name: 'Kadhi Pakora', angle: Math.PI / 4, img: 'images/crop_dal-baati.jpg' },
      { id: 'bajre-ki-roti', name: 'Bajre Ki Roti', angle: Math.PI / 2, img: 'images/woodfire-kiln.jpg' },
      { id: 'malai-ghevar', name: 'Malai Ghevar', angle: (3 * Math.PI) / 4, img: 'images/royal-ghevar.jpg' },
      { id: 'mawa-kachori', name: 'Mawa Kachori', angle: Math.PI, img: 'images/pyaaz-kachori.jpg' },
      { id: 'raj-kachori', name: 'Shahi Raj Kachori', angle: -(3 * Math.PI) / 4, img: 'images/raj-kachori.jpg' }
    ];

    this.nodes = [];
    this.continuousAngle = 0;
    this.closeness = 0;
    this.smoothCloseness = 0;
    this.isHovered = false;
    this.isInViewport = true;
    this.ambientTime = 0;

    this.init();
  }

  init() {
    this.buildNodes();
    this.bindEvents();

    // Observe viewport visibility to optimize performance
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          this.isInViewport = entry.isIntersecting;
        });
      }, { rootMargin: '150px' });
      observer.observe(this.section);
    }

    this.onScroll();
    this.render = this.render.bind(this);
    requestAnimationFrame(this.render);
  }

  buildNodes() {
    this.wrapper.querySelectorAll('.katori-orbit-node').forEach(el => el.remove());
    this.nodes = [];

    this.katoris.forEach((item, index) => {
      const node = document.createElement('div');
      node.className = 'katori-orbit-node';
      node.dataset.dishId = item.id;
      node.setAttribute('tabindex', '0');
      node.setAttribute('role', 'button');
      node.setAttribute('aria-label', `Explore ${item.name}`);

      node.innerHTML = `
        <div class="katori-disc">
          <img src="${item.img}" alt="${item.name}" loading="lazy" onerror="this.src='images/royal-thaali.jpg'">
        </div>
        <span class="katori-label">${item.name}</span>
      `;

      // Interactive hover & clicks
      node.addEventListener('mouseenter', () => {
        this.isHovered = true;
      });
      node.addEventListener('mouseleave', () => {
        this.isHovered = false;
      });

      node.addEventListener('click', () => {
        if (window.menuExperience && typeof window.menuExperience.openDishModalById === 'function') {
          window.menuExperience.openDishModalById(item.id);
        }
      });

      node.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (window.menuExperience && typeof window.menuExperience.openDishModalById === 'function') {
            window.menuExperience.openDishModalById(item.id);
          }
        }
      });

      this.wrapper.appendChild(node);
      this.nodes.push({ el: node, baseAngle: item.angle, index });
    });
  }

  bindEvents() {
    window.addEventListener('scroll', () => this.onScroll(), { passive: true });
    window.addEventListener('resize', () => this.onScroll(), { passive: true });
  }

  onScroll() {
    if (!this.section) return;
    const rect = this.section.getBoundingClientRect();
    const vh = window.innerHeight;

    // Calculate proximity of section to viewport center
    const sectionCenter = rect.top + rect.height / 2;
    const viewportCenter = vh / 2;
    const distFromCenter = Math.abs(sectionCenter - viewportCenter);
    const maxRange = (vh + rect.height) / 2;

    // Closeness goes from 0 (off-screen) to 1 (perfectly centered)
    const rawCloseness = Math.max(0, Math.min(1, 1 - (distFromCenter / maxRange)));
    this.closeness = rawCloseness;
  }

  render(timestamp) {
    if (this.isInViewport) {
      this.ambientTime = timestamp || performance.now();

      // Smooth damping for scroll-based gravitational settling
      this.smoothCloseness += (this.closeness - this.smoothCloseness) * 0.08;

      // Real-time celestial rotation (slows gracefully on hover)
      const rotationSpeed = this.isHovered ? 0.0006 : 0.0022;
      this.continuousAngle += rotationSpeed;

      this.updatePositions();
    }

    requestAnimationFrame(this.render);
  }

  updatePositions() {
    const stageWidth = this.wrapper.offsetWidth || 620;
    const center = stageWidth / 2;
    const nodeHalf = 44; // Half of 88px width/height

    // Settled vs Expanded Orbit Radii:
    // Platter tray has radius ~ 230px.
    // Settled: radius is 245px (dishes nestle snuggly along the bronze rim)
    // Expanded: radius is 300px (dishes spread out when section is approached)
    const settledRadius = stageWidth * 0.395;
    const expandedRadius = stageWidth * 0.485;
    const currentRadius = settledRadius + ((1 - this.smoothCloseness) * (expandedRadius - settledRadius));

    this.nodes.forEach((nodeObj) => {
      const angle = nodeObj.baseAngle + this.continuousAngle;
      
      // Gentle micro-floating oscillation for an organic organic culinary feel
      const floatY = Math.sin((this.ambientTime * 0.0018) + (nodeObj.index * 0.8)) * 3.5;

      const x = center + (Math.cos(angle) * currentRadius) - nodeHalf;
      const y = center + (Math.sin(angle) * currentRadius) - nodeHalf + floatY;

      const scale = 0.94 + (this.smoothCloseness * 0.06);
      const opacity = 0.75 + (this.smoothCloseness * 0.25);

      nodeObj.el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${scale.toFixed(3)})`;
      nodeObj.el.style.opacity = opacity.toFixed(3);
    });

    // Gentle counter-rotation of central brass platter
    if (this.centerTray) {
      const trayRotation = -(this.continuousAngle * 14) - (this.smoothCloseness * 15);
      this.centerTray.style.transform = `rotate(${trayRotation.toFixed(2)}deg)`;
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => { window.thaaliOrbit = new ThaaliOrbitController(); });
} else {
  window.thaaliOrbit = new ThaaliOrbitController();
}
