/**
 * RAJASTHANI TADKA — SCROLLYTELLING CANVAS ENGINE (REVAMPED & EXPANDED)
 * 60fps cinematic desert landscape with:
 * - Radiant Golden-Hour Thar Desert Sky & Sinking Sun with Atmospheric Rays
 * - Distant Aravalli Mountain Silhouettes & Royal Rajasthani Chhatris / Fort Bastions
 * - Rolling Golden Sand Dunes with Crest Rim-Lighting & Wind Ripples
 * - Majestic Large-Scale Royal Camel (Oont) with Rajasthani Jhool & Gorbandh
 * - Large-Scale Rajasthani Traveller with Safa (Turban) & Fluttering Tail, Dhoti & Lathi
 * - Dynamic Swaying Lead Rope (Morli) connecting Camel to Traveller
 * - Continuous Fluid Walk & Breathing Engine with Scroll Acceleration & Hoof Dust Puffs
 * - Floating Golden Desert Dust & Soaring Desert Birds
 */

class ScrollytellingEngine {
  constructor() {
    this.skyCanvas = document.getElementById('sky-canvas');
    this.dustCanvas = document.getElementById('dust-canvas');
    this.travellerCanvas = document.getElementById('traveller-canvas');

    if (!this.skyCanvas || !this.dustCanvas || !this.travellerCanvas) return;

    this.skyCtx = this.skyCanvas.getContext('2d');
    this.dustCtx = this.dustCanvas.getContext('2d');
    this.travellerCtx = this.travellerCanvas.getContext('2d');

    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.scrollProgress = 0;
    this.targetScrollProgress = 0;
    this.lastScrollY = window.scrollY;

    // Fluid Animation Timing
    this.ambientTime = 0;
    this.walkCycle = 0;
    this.scrollVelocity = 0;
    this.targetVelocity = 0;
    this.lastFootstepPhase = 0;

    // Dust particles & Hoof impact effects
    this.dustParticles = [];
    this.stepDustPuffs = [];
    this.maxDust = 60;

    // Flocks of desert cranes / birds
    this.birds = [
      { x: this.width * 0.85, y: this.height * 0.22, speed: 0.85, size: 1.1, wingPhase: 0 },
      { x: this.width * 0.88, y: this.height * 0.24, speed: 0.82, size: 0.95, wingPhase: 0.4 },
      { x: this.width * 0.82, y: this.height * 0.25, speed: 0.88, size: 0.9, wingPhase: 0.8 },
      { x: this.width * 0.92, y: this.height * 0.21, speed: 0.80, size: 1.0, wingPhase: 0.2 },
      { x: this.width * 0.79, y: this.height * 0.27, speed: 0.86, size: 0.8, wingPhase: 1.1 }
    ];

    // Iconic Rajasthani Brand Character Head (Mascot / Logo Face)
    this.characterHeadImg = new Image();
    this.characterHeadImg.src = 'images/rajasthani-face.png';
    this.characterHeadLoaded = false;
    this.characterHeadImg.onload = () => {
      this.characterHeadLoaded = true;
    };

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize(), { passive: true });
    window.addEventListener('scroll', () => this.onScroll(), { passive: true });

    // Seed ambient golden dust motes
    for (let i = 0; i < this.maxDust; i++) {
      this.dustParticles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 2.6 + 0.8,
        vx: (Math.random() - 0.35) * 0.45,
        vy: -Math.random() * 0.4 - 0.1,
        alpha: Math.random() * 0.65 + 0.25,
        pulse: Math.random() * Math.PI * 2
      });
    }

    this.render = this.render.bind(this);
    requestAnimationFrame(this.render);
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    [this.skyCanvas, this.dustCanvas, this.travellerCanvas].forEach(canvas => {
      canvas.width = this.width * dpr;
      canvas.height = this.height * dpr;
      canvas.style.width = `${this.width}px`;
      canvas.style.height = `${this.height}px`;
    });

    this.skyCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.dustCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.travellerCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  onScroll() {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    this.targetScrollProgress = maxScroll > 0 ? window.scrollY / maxScroll : 0;

    const deltaY = Math.abs(window.scrollY - this.lastScrollY);
    if (deltaY > 0.5) {
      this.targetVelocity = Math.min(this.targetVelocity + deltaY * 0.0035, 0.065);
    }
    this.lastScrollY = window.scrollY;
  }

  spawnFootprintDust(x, y, scale) {
    for (let i = 0; i < 4; i++) {
      this.stepDustPuffs.push({
        x: x + (Math.random() - 0.5) * 12 * scale,
        y: y + (Math.random() - 0.2) * 6 * scale,
        vx: (Math.random() - 0.6) * 1.2 * scale,
        vy: -Math.random() * 1.4 * scale - 0.4,
        size: (Math.random() * 4 + 2) * scale,
        alpha: 0.65,
        life: 1.0
      });
    }
  }

  render() {
    this.ambientTime += 0.016;

    // Smooth lerp for scroll progress
    this.scrollProgress += (this.targetScrollProgress - this.scrollProgress) * 0.075;

    // Smooth inertia for walk speed: maintains gentle idle stride, accelerates on scroll
    this.scrollVelocity += (this.targetVelocity - this.scrollVelocity) * 0.12;
    this.targetVelocity *= 0.86;

    const baseIdleSpeed = 0.018; // perpetual graceful desert trek
    const dynamicSpeed = baseIdleSpeed + this.scrollVelocity * 0.9;
    this.walkCycle += dynamicSpeed;

    this.renderSky();
    this.renderDust();
    this.renderTraveller();

    requestAnimationFrame(this.render);
  }

  renderSky() {
    const ctx = this.skyCtx;
    const w = this.width;
    const h = this.height;
    const p = this.scrollProgress;
    const t = this.ambientTime;

    ctx.clearRect(0, 0, w, h);

    // =========================================================================
    // 1. DYNAMIC ATMOSPHERIC SKY GRADIENT (Radiant Thar Desert Sunset)
    // =========================================================================
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h);

    if (p < 0.4) {
      // Golden Hour Desert Sunset (Radiant Amber, Terracotta, Coral, Warm Cream)
      skyGrad.addColorStop(0, '#2A1322');     // Royal plum twilight at zenith
      skyGrad.addColorStop(0.25, '#5C1D26');  // Deep Marwari crimson
      skyGrad.addColorStop(0.5, '#9C3E22');   // Rich desert terracotta
      skyGrad.addColorStop(0.72, '#DE762A');  // Radiant burning amber
      skyGrad.addColorStop(0.9, '#F4A847');   // Golden sand horizon light
      skyGrad.addColorStop(1, '#FDE3A2');     // Horizon luminance
    } else if (p < 0.75) {
      // Twilight over Shekhawati Haveli / Rural Village Hearth
      skyGrad.addColorStop(0, '#16121E');
      skyGrad.addColorStop(0.3, '#321922');
      skyGrad.addColorStop(0.6, '#6D2E24');
      skyGrad.addColorStop(0.85, '#B55E32');
      skyGrad.addColorStop(1, '#E29759');
    } else {
      // Royal Courtyard Candlelit Night
      skyGrad.addColorStop(0, '#0C080B');
      skyGrad.addColorStop(0.35, '#190E11');
      skyGrad.addColorStop(0.7, '#2F1617');
      skyGrad.addColorStop(1, '#4E241E');
    }

    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // =========================================================================
    // 2. GLOWING DESERT SUN & ATMOSPHERIC HALO (Visible in Sunset / Twilight)
    // =========================================================================
    if (p < 0.7) {
      const sunFade = p < 0.35 ? 1.0 : (0.7 - p) / 0.35;
      const sunX = w * 0.74 - p * 60;
      const sunY = h * 0.58 + p * 80;

      ctx.save();
      ctx.globalAlpha = Math.max(0, sunFade);

      // Outer radial atmospheric glow
      const sunGlow = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 180);
      sunGlow.addColorStop(0, 'rgba(255, 238, 180, 0.85)');
      sunGlow.addColorStop(0.25, 'rgba(247, 168, 64, 0.45)');
      sunGlow.addColorStop(0.6, 'rgba(219, 90, 42, 0.2)');
      sunGlow.addColorStop(1, 'rgba(180, 50, 30, 0)');

      ctx.fillStyle = sunGlow;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 180, 0, Math.PI * 2);
      ctx.fill();

      // Sharp golden sun disc
      const sunDisc = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 32);
      sunDisc.addColorStop(0, '#FFF6DB');
      sunDisc.addColorStop(0.8, '#FFD370');
      sunDisc.addColorStop(1, 'rgba(255, 180, 60, 0.6)');

      ctx.fillStyle = sunDisc;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 32, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // =========================================================================
    // 3. SOARING DESERT BIRDS (Drifting across the sunset sky)
    // =========================================================================
    ctx.save();
    ctx.strokeStyle = p < 0.45 ? 'rgba(54, 20, 24, 0.75)' : 'rgba(30, 14, 18, 0.65)';
    ctx.lineWidth = 1.8;
    ctx.lineCap = 'round';

    this.birds.forEach(bird => {
      bird.x -= bird.speed;
      if (bird.x < -40) bird.x = w + 50;

      const wing = Math.sin(t * 5 + bird.wingPhase) * 6 * bird.size;
      const bx = bird.x;
      const by = bird.y + Math.sin(t * 1.5 + bird.wingPhase) * 3;
      const s = bird.size * 10;

      ctx.beginPath();
      ctx.moveTo(bx - s, by + wing);
      ctx.quadraticCurveTo(bx - s * 0.4, by - wing * 0.4, bx, by);
      ctx.quadraticCurveTo(bx + s * 0.4, by - wing * 0.4, bx + s, by + wing);
      ctx.stroke();
    });
    ctx.restore();

    // =========================================================================
    // 4. DISTANT ARAVALLI MOUNTAINS & FORT SILHOUETTES (Parallax 0.15)
    // =========================================================================
    ctx.save();
    const mountainOffset = p * 45;
    const mBaseY = h * 0.60 + mountainOffset;

    const mGrad = ctx.createLinearGradient(0, mBaseY - 80, 0, h);
    if (p < 0.45) {
      mGrad.addColorStop(0, 'rgba(82, 28, 42, 0.7)');
      mGrad.addColorStop(1, 'rgba(48, 16, 26, 0.9)');
    } else {
      mGrad.addColorStop(0, 'rgba(38, 16, 22, 0.85)');
      mGrad.addColorStop(1, 'rgba(20, 10, 14, 0.98)');
    }
    ctx.fillStyle = mGrad;

    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(0, mBaseY);
    ctx.bezierCurveTo(w * 0.12, mBaseY - 35, w * 0.22, mBaseY + 15, w * 0.35, mBaseY - 25);
    ctx.bezierCurveTo(w * 0.48, mBaseY - 60, w * 0.58, mBaseY - 10, w * 0.70, mBaseY - 45);
    ctx.bezierCurveTo(w * 0.82, mBaseY - 20, w * 0.92, mBaseY - 55, w, mBaseY - 30);
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Distant Rajasthani Chhatris & Fort Bastion Silhouettes on the Mountain Ridge
    this.drawHeritageSilhouettes(ctx, w, mBaseY, p);
    ctx.restore();

    // =========================================================================
    // 5. MIDGROUND WARM SAND DUNES (Parallax 0.35)
    // =========================================================================
    ctx.save();
    const midDuneOffset = p * 90;
    const midY = h * 0.71 + midDuneOffset * 0.4;

    const midDuneGrad = ctx.createLinearGradient(0, midY - 60, 0, h);
    if (p < 0.45) {
      midDuneGrad.addColorStop(0, 'rgba(184, 82, 38, 0.92)');   // Warm golden amber dune crest
      midDuneGrad.addColorStop(0.35, 'rgba(124, 46, 28, 0.95)'); // Terracotta slope
      midDuneGrad.addColorStop(1, 'rgba(58, 20, 20, 0.98)');     // Deep valley
    } else {
      midDuneGrad.addColorStop(0, 'rgba(110, 48, 30, 0.95)');
      midDuneGrad.addColorStop(1, 'rgba(26, 12, 14, 0.99)');
    }
    ctx.fillStyle = midDuneGrad;

    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(0, midY);
    ctx.bezierCurveTo(w * 0.18, midY - 38, w * 0.38, midY + 30, w * 0.55, midY - 20);
    ctx.bezierCurveTo(w * 0.72, midY - 55, w * 0.88, midY + 15, w, midY - 30);
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Dune Crest Rim-Light Shimmer (sunlight catching the ridge)
    ctx.strokeStyle = p < 0.45 ? 'rgba(255, 205, 120, 0.45)' : 'rgba(219, 140, 70, 0.25)';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.restore();

    // =========================================================================
    // 6. FOREGROUND GROUND DUNE RIDGE (Where the caravan treads — Parallax 0.6)
    // =========================================================================
    ctx.save();
    const fgBaseY = h * 0.86;
    const fgDuneGrad = ctx.createLinearGradient(0, fgBaseY - 20, 0, h);

    if (p < 0.45) {
      fgDuneGrad.addColorStop(0, '#5C2219');    // Rich terracotta desert earth
      fgDuneGrad.addColorStop(0.2, '#381414');  // Deep sand shadow
      fgDuneGrad.addColorStop(1, '#1A0B0C');    // Cinematic deep base
    } else {
      fgDuneGrad.addColorStop(0, '#361618');
      fgDuneGrad.addColorStop(1, '#110708');
    }
    ctx.fillStyle = fgDuneGrad;

    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(0, fgBaseY + 12);
    ctx.bezierCurveTo(w * 0.25, fgBaseY - 14, w * 0.55, fgBaseY + 18, w * 0.82, fgBaseY - 8);
    ctx.bezierCurveTo(w * 0.92, fgBaseY - 16, w * 0.98, fgBaseY - 5, w, fgBaseY);
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Golden Crest Rim Light on the Walking Ridge
    ctx.strokeStyle = p < 0.45 ? 'rgba(255, 185, 95, 0.7)' : 'rgba(212, 130, 60, 0.4)';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.restore();
  }

  // Draw traditional Rajasthani architectural elements in distant silhouette
  drawHeritageSilhouettes(ctx, w, baseY, p) {
    ctx.save();
    const alpha = p < 0.65 ? 0.75 : 0.4;
    ctx.fillStyle = `rgba(42, 18, 26, ${alpha})`;

    // Heritage Chhatri 1 (Far Western Ridge, clean horizon separation)
    const c1X = w * 0.08;
    const c1Y = baseY - 2;
    this.drawChhatri(ctx, c1X, c1Y, 0.85);

    // Heritage Chhatri 2 (Distant Right Ridge)
    const c2X = w * 0.65;
    const c2Y = baseY - 24;
    this.drawChhatri(ctx, c2X, c2Y, 0.65);

    // Jaisalmer-style Fort Bastion Ramparts (Far Center Ridge)
    const fX = w * 0.42;
    const fY = baseY - 35;
    ctx.beginPath();
    ctx.rect(fX - 40, fY, 80, 20);
    // Crenellations (Kanguras)
    for (let k = 0; k < 6; k++) {
      ctx.rect(fX - 38 + k * 13, fY - 6, 7, 7);
    }
    ctx.fill();

    ctx.restore();
  }

  // Helper: Draw a delicate Rajasthani domed Chhatri (canopy pavilion)
  drawChhatri(ctx, x, y, scale) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    // Platform / Plinth
    ctx.fillRect(-18, 0, 36, 4);

    // Slender Carved Pillars
    const pillars = [-14, -5, 5, 14];
    pillars.forEach(px => {
      ctx.fillRect(px - 1.2, -22, 2.4, 22);
    });

    // Cornice / Eaves (Chhajja)
    ctx.beginPath();
    ctx.moveTo(-22, -22);
    ctx.lineTo(22, -22);
    ctx.lineTo(18, -25);
    ctx.lineTo(-18, -25);
    ctx.closePath();
    ctx.fill();

    // Fluted Rajput Dome (Gumbad)
    ctx.beginPath();
    ctx.moveTo(-16, -25);
    ctx.bezierCurveTo(-16, -38, -4, -42, 0, -45);
    ctx.bezierCurveTo(4, -42, 16, -38, 16, -25);
    ctx.closePath();
    ctx.fill();

    // Brass Kalash & Finial
    ctx.beginPath();
    ctx.moveTo(0, -45);
    ctx.lineTo(0, -52);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, -48, 1.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  renderDust() {
    const ctx = this.dustCtx;
    const w = this.width;
    const h = this.height;
    const p = this.scrollProgress;
    const t = this.ambientTime;

    ctx.clearRect(0, 0, w, h);

    // 1. Ambient Floating Golden Sand Motes
    ctx.save();
    this.dustParticles.forEach(pt => {
      pt.x += pt.vx;
      pt.y += pt.vy;

      if (pt.y < -20) { pt.y = h + 20; pt.x = Math.random() * w; }
      if (pt.x < -20) pt.x = w + 20;
      if (pt.x > w + 20) pt.x = -20;

      const shimmer = Math.sin(t * 2 + pt.pulse) * 0.35 + 0.65;
      const alpha = pt.alpha * shimmer * (p < 0.6 ? 1.0 : 0.5);

      ctx.fillStyle = `rgba(247, 196, 114, ${alpha})`;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    // 2. Footstep Sand Puffs
    for (let i = this.stepDustPuffs.length - 1; i >= 0; i--) {
      const puff = this.stepDustPuffs[i];
      puff.x += puff.vx;
      puff.y += puff.vy;
      puff.vy += 0.04;
      puff.size += 0.18;
      puff.life -= 0.024;

      if (puff.life <= 0) {
        this.stepDustPuffs.splice(i, 1);
        continue;
      }

      ctx.fillStyle = `rgba(228, 178, 102, ${puff.alpha * puff.life})`;
      ctx.beginPath();
      ctx.arc(puff.x, puff.y, puff.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ===========================================================================
  // 7. EXPANDED & REFINED CAMEL AND RAJASTHANI TRAVELLER RENDERING
  // ===========================================================================
  getDuneY(x, w, h) {
    const fgBaseY = h * 0.86;
    const t = Math.max(0, Math.min(1, x / (w * 0.82)));
    const mt = 1 - t;
    const y0 = fgBaseY + 12;
    const y1 = fgBaseY - 14;
    const y2 = fgBaseY + 18;
    const y3 = fgBaseY - 8;
    return mt * mt * mt * y0 + 3 * mt * mt * t * y1 + 3 * mt * t * t * y2 + t * t * t * y3;
  }

  renderTraveller() {
    const ctx = this.travellerCtx;
    const w = this.width;
    const h = this.height;
    const p = this.scrollProgress;

    ctx.clearRect(0, 0, w, h);

    if (p > 0.85) return;
    const fadeAlpha = p > 0.72 ? (0.85 - p) / 0.13 : 1.0;
    if (fadeAlpha <= 0) return;

    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, fadeAlpha));

    // Balanced scale: majestic and heroic without overwhelming the layout
    const isMobile = w < 600;
    const baseScale = isMobile
      ? Math.min(w / 420, 1.0) * 0.95
      : Math.min(Math.max(w / 1400, 0.85), 1.18) * 1.18;

    // Separation between Camel and Man
    const separation = 100 * baseScale;

    // Start position: framed gracefully in the lower-left dune, away from center title/buttons
    const startManX = isMobile ? w * 0.46 : Math.max(w * 0.24, 260 * (baseScale / 1.18));
    const endManX = w * 0.82;
    const manX = startManX + (p * (endManX - startManX));
    const camelX = manX - separation;

    const camelGroundY = this.getDuneY(camelX, w, h);
    const manGroundY = this.getDuneY(manX, w, h);

    const cycle = this.walkCycle;

    // Footstep dust emission
    const currentPhase = Math.sin(cycle);
    if ((this.lastFootstepPhase <= 0 && currentPhase > 0) || (this.lastFootstepPhase >= 0 && currentPhase < 0)) {
      this.spawnFootprintDust(camelX + 22 * baseScale, camelGroundY, baseScale * 0.85);
      this.spawnFootprintDust(manX, manGroundY, baseScale * 0.7);
    }
    this.lastFootstepPhase = currentPhase;

    // 1. Directional Cast Shadows on the Sand Dune
    this.drawCamelGroundShadow(ctx, camelX, camelGroundY, baseScale, cycle);
    this.drawManGroundShadow(ctx, manX, manGroundY, baseScale, cycle);

    // 2. Royal Camel (Oont)
    const camelSnout = this.drawRoyalCamel(ctx, camelX, camelGroundY, baseScale, cycle);

    // 3. Rajasthani Traveller (Rabari)
    const manHand = this.drawRajasthaniTraveller(ctx, manX, manGroundY, baseScale, cycle);

    // 4. Dynamic Catenary Lead Rope
    this.drawLeadRope(ctx, camelSnout.x, camelSnout.y, manHand.x, manHand.y, baseScale, cycle);

    ctx.restore();
  }

  // ===========================================================================
  // REALISTIC GROUND CAST SHADOWS (Golden Hour Sunset Perspective)
  // ===========================================================================
  drawCamelGroundShadow(ctx, x, groundY, s, cycle) {
    ctx.save();
    ctx.translate(x + 10 * s, groundY + 2 * s);
    ctx.scale(1.45, 0.24);

    const grad = ctx.createRadialGradient(0, 0, 8 * s, 0, 0, 75 * s);
    grad.addColorStop(0, 'rgba(42, 14, 16, 0.55)');
    grad.addColorStop(0.45, 'rgba(75, 28, 20, 0.26)');
    grad.addColorStop(0.85, 'rgba(160, 75, 30, 0.08)');
    grad.addColorStop(1, 'rgba(195, 95, 45, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, 75 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawManGroundShadow(ctx, x, groundY, s, cycle) {
    ctx.save();
    ctx.translate(x - 6 * s, groundY + 2 * s);
    ctx.scale(1.15, 0.22);

    const grad = ctx.createRadialGradient(0, 0, 5 * s, 0, 0, 36 * s);
    grad.addColorStop(0, 'rgba(42, 14, 16, 0.52)');
    grad.addColorStop(0.45, 'rgba(75, 28, 20, 0.24)');
    grad.addColorStop(1, 'rgba(195, 95, 45, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, 36 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // ===========================================================================
  // ARTISTIC HIGH-DEFINITION ROYAL CAMEL (OONT) - REALISTIC ANATOMY & REGALIA
  // ===========================================================================
  drawRoyalCamel(ctx, x, groundY, s, cycle) {
    ctx.save();

    // Natural Camel Pacing Gait (lateral gait: legs on same side move synchronously)
    const legSwingRight = Math.sin(cycle) * 11 * s;
    const legSwingLeft = Math.sin(cycle + Math.PI) * 11 * s;

    // Organic Head & Torso Bobbing rhythm
    const neckBob = Math.sin(cycle * 2) * 2.8 * s;
    const torsoBob = Math.sin(cycle * 2) * 1.5 * s;

    // Base camel body anchor (withers & spine level)
    const bodyY = groundY - 106 * s + torsoBob;

    // -------------------------------------------------------------------------
    // 1. FAR LEGS (Shadowed / Background Layer)
    // -------------------------------------------------------------------------
    this.drawCamelLeg(ctx, x - 34 * s, bodyY + 34 * s, groundY, -legSwingLeft, s, true, true);  // Far Hind
    this.drawCamelLeg(ctx, x + 38 * s, bodyY + 32 * s, groundY, -legSwingLeft, s, false, true); // Far Fore

    // -------------------------------------------------------------------------
    // 2. CAMEL TORSO & PROMINENT HUMP (Anatomically Contoured Trunk)
    // -------------------------------------------------------------------------
    // Rich camelid coat gradient (fawn spine highlight -> chestnut ribcage -> deep terracotta underbelly)
    const coatGrad = ctx.createLinearGradient(x - 20 * s, bodyY - 48 * s, x, bodyY + 40 * s);
    coatGrad.addColorStop(0, '#C48550');    // Warm golden fawn along dorsal crest
    coatGrad.addColorStop(0.22, '#A76B3C'); // Desert sand tan
    coatGrad.addColorStop(0.55, '#844722'); // Rich Marwari chestnut flank
    coatGrad.addColorStop(0.85, '#562510'); // Deep terracotta lower ribcage
    coatGrad.addColorStop(1, '#341408');    // Deep underbelly ambient shadow

    ctx.fillStyle = coatGrad;

    // Continuous anatomical silhouette of camel trunk (withers -> hump -> loin -> croup -> flank -> belly -> brisket -> shoulder)
    ctx.beginPath();
    // Start at withers (base of neck junction)
    ctx.moveTo(x + 22 * s, bodyY - 10 * s);
    // Smooth upward slope to thoracic hump base
    ctx.bezierCurveTo(x + 16 * s, bodyY - 26 * s, x + 8 * s, bodyY - 44 * s, x - 6 * s, bodyY - 46 * s);
    // Rounded summit of the hump
    ctx.bezierCurveTo(x - 14 * s, bodyY - 47 * s, x - 24 * s, bodyY - 42 * s, x - 30 * s, bodyY - 24 * s);
    // Slope down into lumbar loin
    ctx.bezierCurveTo(x - 34 * s, bodyY - 6 * s, x - 38 * s, bodyY + 2 * s, x - 44 * s, bodyY + 4 * s);
    // Pelvic croup and muscular haunch
    ctx.bezierCurveTo(x - 54 * s, bodyY + 6 * s, x - 62 * s, bodyY + 16 * s, x - 60 * s, bodyY + 28 * s);
    // Buttock drop to lower thigh
    ctx.bezierCurveTo(x - 58 * s, bodyY + 38 * s, x - 50 * s, bodyY + 44 * s, x - 38 * s, bodyY + 40 * s);
    // Inguinal tuck-up & belly line
    ctx.bezierCurveTo(x - 24 * s, bodyY + 36 * s, x - 10 * s, bodyY + 38 * s, x + 6 * s, bodyY + 42 * s);
    // Deep thoracic ribcage & brisket with sternal callus pedestal
    ctx.bezierCurveTo(x + 18 * s, bodyY + 44 * s, x + 34 * s, bodyY + 42 * s, x + 44 * s, bodyY + 32 * s);
    // Muscular chest & shoulder junction
    ctx.bezierCurveTo(x + 52 * s, bodyY + 22 * s, x + 48 * s, bodyY + 6 * s, x + 36 * s, bodyY - 2 * s);
    // Back to withers
    ctx.bezierCurveTo(x + 30 * s, bodyY - 6 * s, x + 26 * s, bodyY - 8 * s, x + 22 * s, bodyY - 10 * s);
    ctx.closePath();
    ctx.fill();

    // Sternal Pedestal Callus (Natural camel chest pad)
    ctx.fillStyle = '#2A1006';
    ctx.beginPath();
    ctx.ellipse(x + 22 * s, bodyY + 41 * s, 11 * s, 3.5 * s, 0.08, 0, Math.PI * 2);
    ctx.fill();

    // Subtle shoulder blade (scapular) & flank muscle shading
    ctx.strokeStyle = 'rgba(255, 205, 120, 0.28)';
    ctx.lineWidth = 2.2 * s;
    ctx.beginPath();
    ctx.moveTo(x + 32 * s, bodyY + 2 * s);
    ctx.quadraticCurveTo(x + 36 * s, bodyY + 18 * s, x + 28 * s, bodyY + 30 * s);
    ctx.stroke();

    // Flank fold shadow
    ctx.strokeStyle = 'rgba(40, 15, 8, 0.35)';
    ctx.lineWidth = 2 * s;
    ctx.beginPath();
    ctx.moveTo(x - 30 * s, bodyY + 6 * s);
    ctx.quadraticCurveTo(x - 28 * s, bodyY + 24 * s, x - 22 * s, bodyY + 34 * s);
    ctx.stroke();

    // -------------------------------------------------------------------------
    // 3. SWISHING TUFTED TAIL
    // -------------------------------------------------------------------------
    const tailSway = Math.sin(this.ambientTime * 2.8 + cycle) * 7 * s;
    ctx.strokeStyle = '#5E2B14';
    ctx.lineWidth = 3.6 * s;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x - 58 * s, bodyY + 16 * s);
    ctx.quadraticCurveTo(x - 72 * s + tailSway * 0.7, bodyY + 36 * s, x - 68 * s + tailSway, bodyY + 56 * s);
    ctx.stroke();

    // Tail Hair Tuft (Teardrop woolly switch)
    ctx.fillStyle = '#321408';
    ctx.beginPath();
    ctx.moveTo(x - 68 * s + tailSway, bodyY + 54 * s);
    ctx.bezierCurveTo(x - 76 * s + tailSway * 1.1, bodyY + 64 * s, x - 64 * s + tailSway * 1.1, bodyY + 70 * s, x - 66 * s + tailSway, bodyY + 74 * s);
    ctx.bezierCurveTo(x - 60 * s + tailSway * 0.9, bodyY + 68 * s, x - 62 * s + tailSway * 0.8, bodyY + 60 * s, x - 68 * s + tailSway, bodyY + 54 * s);
    ctx.fill();

    // -------------------------------------------------------------------------
    // 4. ARCHED S-CURVE NECK & NOBLE DROMEDARY HEAD
    // -------------------------------------------------------------------------
    const headX = x + 74 * s;
    const headY = bodyY - 68 * s + neckBob;

    const neckGrad = ctx.createLinearGradient(x + 22 * s, bodyY + 20 * s, headX, headY);
    neckGrad.addColorStop(0, '#7A3F1D');
    neckGrad.addColorStop(0.4, '#9E5B2E');
    neckGrad.addColorStop(0.8, '#BE7D48');
    neckGrad.addColorStop(1, '#D08F5A');
    ctx.fillStyle = neckGrad;

    // Muscular graceful neck
    ctx.beginPath();
    // Lower throat line emerges low from chest
    ctx.moveTo(x + 42 * s, bodyY + 24 * s);
    // Lower dip of S-curve
    ctx.bezierCurveTo(x + 64 * s, bodyY + 14 * s, x + 76 * s, bodyY - 14 * s, headX - 8 * s, headY + 20 * s);
    // Throatlatch to jaw angle
    ctx.lineTo(headX + 2 * s, headY + 14 * s);
    // Mandible / lower jaw
    ctx.lineTo(headX + 18 * s, headY + 10 * s);
    // Chin pad
    ctx.bezierCurveTo(headX + 23 * s, headY + 10 * s, headX + 26 * s, headY + 6 * s, headX + 28 * s, headY + 4 * s);
    // Prehensile upper lip with characteristic camel overhang
    ctx.bezierCurveTo(headX + 31 * s, headY + 2 * s, headX + 32 * s, headY - 2 * s, headX + 28 * s, headY - 5 * s);
    // Roman nasal bridge (gentle convex arch)
    ctx.bezierCurveTo(headX + 22 * s, headY - 8 * s, headX + 14 * s, headY - 7 * s, headX + 8 * s, headY - 11 * s);
    // Forehead stop to poll (crest of head)
    ctx.bezierCurveTo(headX + 2 * s, headY - 15 * s, headX - 4 * s, headY - 17 * s, headX - 8 * s, headY - 14 * s);
    // Upper neck dorsal crest back to withers
    ctx.bezierCurveTo(headX - 16 * s, headY - 4 * s, x + 50 * s, bodyY - 34 * s, x + 22 * s, bodyY - 10 * s);
    ctx.closePath();
    ctx.fill();

    // Throat Mane / Beard (Lustrous dark camel wool fringe along underside of neck)
    ctx.strokeStyle = '#381609';
    ctx.lineWidth = 2 * s;
    for (let f = 0; f < 7; f++) {
      const fx = x + 50 * s + f * 5.2 * s;
      const fy = bodyY + 18 * s - f * 6.2 * s;
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.quadraticCurveTo(fx - 4 * s, fy + 7 * s, fx - 1 * s, fy + 12 * s);
      ctx.stroke();
    }

    // Contoured Dromedary Ear with inner warm fossa & fine tuft
    ctx.fillStyle = '#6E3416';
    ctx.beginPath();
    ctx.moveTo(headX - 4 * s, headY - 14 * s);
    ctx.bezierCurveTo(headX - 9 * s, headY - 22 * s, headX - 10 * s, headY - 28 * s, headX - 6 * s, headY - 30 * s);
    ctx.bezierCurveTo(headX - 2 * s, headY - 28 * s, headX + 1 * s, headY - 20 * s, headX - 1 * s, headY - 14 * s);
    ctx.closePath();
    ctx.fill();

    // Inner ear warm peach tone
    ctx.fillStyle = '#D68C66';
    ctx.beginPath();
    ctx.moveTo(headX - 4 * s, headY - 16 * s);
    ctx.lineTo(headX - 6.5 * s, headY - 27 * s);
    ctx.lineTo(headX - 2 * s, headY - 18 * s);
    ctx.closePath();
    ctx.fill();

    // Soulful Almond Eye (Brown iris, horizontal oval pupil, golden glint & eyelid fold)
    // Eyelid crease
    ctx.strokeStyle = 'rgba(40, 15, 8, 0.75)';
    ctx.lineWidth = 1.2 * s;
    ctx.beginPath();
    ctx.arc(headX + 5 * s, headY - 3 * s, 4 * s, 3.8, 5.8);
    ctx.stroke();

    // Sclera / eye base
    ctx.fillStyle = '#1A0B05';
    ctx.beginPath();
    ctx.ellipse(headX + 5 * s, headY - 2 * s, 3.2 * s, 2.2 * s, 0.15, 0, Math.PI * 2);
    ctx.fill();

    // Warm amber-brown iris ring
    ctx.fillStyle = '#7A3F14';
    ctx.beginPath();
    ctx.arc(headX + 5.2 * s, headY - 2 * s, 1.8 * s, 0, Math.PI * 2);
    ctx.fill();

    // Horizontal dromedary pupil
    ctx.fillStyle = '#0D0502';
    ctx.beginPath();
    ctx.ellipse(headX + 5.2 * s, headY - 2 * s, 1.6 * s, 0.8 * s, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Sunset specular glint
    ctx.fillStyle = '#FFF3CC';
    ctx.beginPath();
    ctx.arc(headX + 4.5 * s, headY - 2.7 * s, 0.9 * s, 0, Math.PI * 2);
    ctx.fill();

    // Nostril slit with soft skin fold
    ctx.strokeStyle = '#1D0A04';
    ctx.lineWidth = 1.8 * s;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(headX + 24 * s, headY - 1 * s, 2.2 * s, 0.3, 2.6);
    ctx.stroke();

    // Mouth fissure line
    ctx.beginPath();
    ctx.moveTo(headX + 28 * s, headY + 4 * s);
    ctx.lineTo(headX + 20 * s, headY + 5 * s);
    ctx.stroke();

    // -------------------------------------------------------------------------
    // 5. RADIANT SUNSET RIM LIGHTING (Dorsal Spine & Crown Illumination)
    // -------------------------------------------------------------------------
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 222, 130, 0.92)';
    ctx.lineWidth = 2.4 * s;
    ctx.lineCap = 'round';
    ctx.beginPath();
    // Ear tip rim
    ctx.moveTo(headX - 9 * s, headY - 26 * s);
    ctx.lineTo(headX - 6 * s, headY - 30 * s);
    // Poll to forehead
    ctx.moveTo(headX - 8 * s, headY - 14 * s);
    ctx.lineTo(headX + 4 * s, headY - 12 * s);
    // Neck crest
    ctx.moveTo(headX - 14 * s, headY - 4 * s);
    ctx.bezierCurveTo(headX - 22 * s, headY + 6 * s, x + 50 * s, bodyY - 32 * s, x + 22 * s, bodyY - 10 * s);
    // Hump peak
    ctx.moveTo(x + 12 * s, bodyY - 38 * s);
    ctx.bezierCurveTo(x + 2 * s, bodyY - 46 * s, x - 18 * s, bodyY - 46 * s, x - 28 * s, bodyY - 26 * s);
    // Pelvic croup rim
    ctx.moveTo(x - 42 * s, bodyY + 3 * s);
    ctx.quadraticCurveTo(x - 56 * s, bodyY + 8 * s, x - 60 * s, bodyY + 22 * s);
    ctx.stroke();
    ctx.restore();

    // -------------------------------------------------------------------------
    // 6. ROYAL RAJASTHANI JHOOL (Velvet Saddle Blanket & Brocade)
    // -------------------------------------------------------------------------
    const jhoolGrad = ctx.createLinearGradient(x, bodyY - 18 * s, x, bodyY + 30 * s);
    jhoolGrad.addColorStop(0, '#8E1710');
    jhoolGrad.addColorStop(0.35, '#B2241C');
    jhoolGrad.addColorStop(0.7, '#7B130E');
    jhoolGrad.addColorStop(1, '#4A0B08');
    ctx.fillStyle = jhoolGrad;

    // Draped luxury velvet tailored across the hump
    ctx.beginPath();
    ctx.moveTo(x - 30 * s, bodyY - 12 * s);
    ctx.bezierCurveTo(x - 22 * s, bodyY - 36 * s, x + 4 * s, bodyY - 34 * s, x + 18 * s, bodyY - 14 * s);
    ctx.bezierCurveTo(x + 24 * s, bodyY + 10 * s, x + 22 * s, bodyY + 26 * s, x + 20 * s, bodyY + 29 * s);
    ctx.quadraticCurveTo(x - 4 * s, bodyY + 32 * s, x - 32 * s, bodyY + 28 * s);
    ctx.bezierCurveTo(x - 34 * s, bodyY + 14 * s, x - 32 * s, bodyY + 2 * s, x - 30 * s, bodyY - 12 * s);
    ctx.closePath();
    ctx.fill();

    // Heavy Gota Patti Gold Border
    ctx.strokeStyle = '#F5C658';
    ctx.lineWidth = 2.6 * s;
    ctx.stroke();

    // Inner fine Zari piping
    ctx.strokeStyle = '#FFEAA7';
    ctx.lineWidth = 0.9 * s;
    ctx.stroke();

    // Authentic Rajasthani Bandhej (Tie-Dye) Floral Rosettes
    const rosettes = [
      { rx: -18, ry: -2 }, { rx: -8, ry: -10 }, { rx: 4, ry: -8 }, { rx: 12, ry: 0 },
      { rx: -16, ry: 12 }, { rx: -6, ry: 8 }, { rx: 6, ry: 10 }, { rx: 14, ry: 16 }
    ];
    rosettes.forEach(r => {
      // Golden centre dot
      ctx.fillStyle = '#FFD54F';
      ctx.beginPath();
      ctx.arc(x + r.rx * s, bodyY + r.ry * s, 1.3 * s, 0, Math.PI * 2);
      ctx.fill();
      // Satellite white dots
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      const d = 2.2 * s;
      ctx.fillRect(x + (r.rx * s - d), bodyY + (r.ry * s - 0.5 * s), 1.1 * s, 1.1 * s);
      ctx.fillRect(x + (r.rx * s + d - 1.1 * s), bodyY + (r.ry * s - 0.5 * s), 1.1 * s, 1.1 * s);
      ctx.fillRect(x + (r.rx * s - 0.5 * s), bodyY + (r.ry * s - d), 1.1 * s, 1.1 * s);
      ctx.fillRect(x + (r.rx * s - 0.5 * s), bodyY + (r.ry * s + d - 1.1 * s), 1.1 * s, 1.1 * s);
    });

    // Lower Abhla Bharat (Mirrorwork) row
    ctx.fillStyle = '#FFFFFF';
    for (let m = -22; m <= 14; m += 9) {
      ctx.beginPath();
      ctx.arc(x + m * s, bodyY + 22 * s, 2.2 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#D9A441';
      ctx.lineWidth = 1 * s;
      ctx.stroke();
    }

    // Dynamic Swaying Silk Tassels with Golden Bells
    const tasselSway = Math.sin(cycle + 0.4) * 4 * s;
    for (let t = -26; t <= 16; t += 7) {
      const isGold = (t % 14 === 0);
      ctx.strokeStyle = isGold ? '#F5C458' : '#D32F2F';
      ctx.lineWidth = 2 * s;
      ctx.beginPath();
      ctx.moveTo(x + t * s, bodyY + 29 * s);
      ctx.lineTo(x + (t + tasselSway) * s, bodyY + 38 * s);
      ctx.stroke();

      // Hanging Bell / Pom-pom
      ctx.fillStyle = isGold ? '#FFD54F' : '#B71C1C';
      ctx.beginPath();
      ctx.arc(x + (t + tasselSway) * s, bodyY + 39 * s, 2.4 * s, 0, Math.PI * 2);
      ctx.fill();
    }

    // Wooden Palan (Saddle Pommel Bars) & Leather Girth
    ctx.strokeStyle = '#4A250E';
    ctx.lineWidth = 3.4 * s;
    ctx.beginPath();
    ctx.moveTo(x - 26 * s, bodyY - 10 * s);
    ctx.lineTo(x - 28 * s, bodyY - 34 * s);
    ctx.moveTo(x + 14 * s, bodyY - 10 * s);
    ctx.lineTo(x + 16 * s, bodyY - 30 * s);
    ctx.stroke();

    // Brass Saddle Finials
    ctx.fillStyle = '#F5C658';
    ctx.beginPath();
    ctx.arc(x - 28 * s, bodyY - 34 * s, 2.8 * s, 0, Math.PI * 2);
    ctx.arc(x + 16 * s, bodyY - 30 * s, 2.8 * s, 0, Math.PI * 2);
    ctx.fill();

    // -------------------------------------------------------------------------
    // 7. TRADITIONAL RAJASTHANI GORBANDH (Ornate Royal Beaded Collar)
    // -------------------------------------------------------------------------
    const gbY = bodyY - 18 * s + neckBob * 0.7;
    // Layer 1: Turquoise & Coral Beads
    ctx.strokeStyle = '#26A69A';
    ctx.lineWidth = 3 * s;
    ctx.beginPath();
    ctx.arc(headX - 18 * s, gbY, 14 * s, 0.4, 2.1);
    ctx.stroke();

    // Layer 2: Golden Bell Trim
    ctx.strokeStyle = '#F5C658';
    ctx.lineWidth = 2.2 * s;
    ctx.beginPath();
    ctx.arc(headX - 18 * s, gbY, 17 * s, 0.45, 2.05);
    ctx.stroke();

    // Cowrie Shell / Bead Drops along Gorbandh
    for (let b = 0.55; b <= 1.95; b += 0.35) {
      const bx = headX - 18 * s + Math.cos(b) * 17 * s;
      const by = gbY + Math.sin(b) * 17 * s;
      ctx.fillStyle = '#FFFDE7';
      ctx.beginPath();
      ctx.arc(bx, by, 1.8 * s, 0, Math.PI * 2);
      ctx.fill();
    }

    // -------------------------------------------------------------------------
    // 8. BRIDLE, HEADSTALL & BRASS CONCHOS
    // -------------------------------------------------------------------------
    ctx.strokeStyle = '#4A220E';
    ctx.lineWidth = 1.9 * s;
    ctx.beginPath();
    // Browband
    ctx.moveTo(headX - 4 * s, headY - 11 * s);
    ctx.lineTo(headX + 6 * s, headY - 8 * s);
    // Cheekstrap to noseband
    ctx.lineTo(headX + 18 * s, headY + 3 * s);
    // Noseband
    ctx.lineTo(headX + 14 * s, headY + 11 * s);
    ctx.stroke();

    // Brass conchos at strap junctions
    ctx.fillStyle = '#F5C658';
    ctx.beginPath();
    ctx.arc(headX + 6 * s, headY - 8 * s, 2 * s, 0, Math.PI * 2);
    ctx.arc(headX + 18 * s, headY + 3 * s, 2.2 * s, 0, Math.PI * 2);
    ctx.fill();

    // Snout anchor coordinate for lead rope
    const snoutX = headX + 18 * s;
    const snoutY = headY + 9 * s;

    // -------------------------------------------------------------------------
    // 9. NEAR LEGS (Foreground Layer: Muscular & Contoured)
    // -------------------------------------------------------------------------
    this.drawCamelLeg(ctx, x - 34 * s, bodyY + 34 * s, groundY, legSwingRight, s, true, false);  // Near Hind
    this.drawCamelLeg(ctx, x + 38 * s, bodyY + 32 * s, groundY, legSwingRight, s, false, false); // Near Fore

    ctx.restore();

    return { x: snoutX, y: snoutY };
  }

  // ===========================================================================
  // REALISTIC CAMEL LEG ANATOMY (Shoulder/Thigh, Hock/Knee, Pastern & Footpad)
  // ===========================================================================
  drawCamelLeg(ctx, hipX, hipY, groundY, swing, s, isRear, isFar) {
    ctx.save();

    const fillStyle = isFar ? '#421D0E' : '#7D4320';
    const rimStyle = isFar ? 'rgba(170, 85, 40, 0.4)' : 'rgba(255, 218, 128, 0.72)';
    const legLength = groundY - hipY;
    const midY = hipY + legLength * 0.47;

    if (isRear) {
      // ---------------- REAR LEG (Hock bends backward) ----------------
      const hockX = hipX - 9 * s + swing * 0.45;
      const footX = hipX - 3 * s + swing;
      // Lift foot slightly when swinging forward
      const footLift = Math.max(0, -swing * 0.28);
      const footY = groundY - footLift;

      // 1. Muscular Gaskin & Thigh (Biceps Femoris)
      ctx.fillStyle = fillStyle;
      ctx.beginPath();
      ctx.moveTo(hipX - 16 * s, hipY);
      // Sweeping rear thigh contour down to prominent hock
      ctx.quadraticCurveTo(hipX - 19 * s, midY - 12 * s, hockX - 4 * s, midY);
      // Sharp hock point (calcaneus)
      ctx.lineTo(hockX + 5 * s, midY + 3 * s);
      // Stifle curve in front
      ctx.quadraticCurveTo(hipX + 11 * s, midY - 14 * s, hipX + 13 * s, hipY);
      ctx.closePath();
      ctx.fill();

      // 2. Slender Metatarsal (Cannon Bone) & Fetlock Joint
      ctx.beginPath();
      ctx.moveTo(hockX - 4 * s, midY);
      ctx.lineTo(footX - 3.2 * s, footY - 5 * s);
      ctx.lineTo(footX + 4 * s, footY - 5 * s);
      ctx.lineTo(hockX + 5 * s, midY + 3 * s);
      ctx.closePath();
      ctx.fill();

      // 3. Fleshy Cushioned Desert Footpad (2-toed tylopod)
      ctx.fillStyle = isFar ? '#260F06' : '#52240E';
      ctx.beginPath();
      ctx.ellipse(footX + 1 * s, footY - 1.5 * s, 8.5 * s, 4 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Toe Claw / Nail Tips
      ctx.fillStyle = '#1A0904';
      ctx.fillRect(footX + 6 * s, footY - 2.5 * s, 2.2 * s, 2 * s);

      // Golden Rim Highlight on rear leg contour
      ctx.strokeStyle = rimStyle;
      ctx.lineWidth = 1.8 * s;
      ctx.beginPath();
      ctx.moveTo(hipX - 16 * s, hipY);
      ctx.quadraticCurveTo(hipX - 19 * s, midY - 12 * s, hockX - 4 * s, midY);
      ctx.lineTo(footX - 3.2 * s, footY - 5 * s);
      ctx.stroke();

      // Foot Sand Contact Shadow
      ctx.fillStyle = 'rgba(28, 9, 8, 0.68)';
      ctx.beginPath();
      ctx.ellipse(footX + 1 * s, groundY + 1 * s, 9 * s, 2.4 * s, 0, 0, Math.PI * 2);
      ctx.fill();

    } else {
      // ---------------- FRONT LEG (Knee bends forward) ----------------
      const kneeX = hipX + 5 * s + swing * 0.55;
      const footX = hipX + 2 * s + swing;
      const footLift = Math.max(0, -swing * 0.28);
      const footY = groundY - footLift;

      // 1. Muscular Forearm & Shoulder Junction
      ctx.fillStyle = fillStyle;
      ctx.beginPath();
      ctx.moveTo(hipX - 12 * s, hipY);
      ctx.quadraticCurveTo(hipX - 8 * s, midY - 12 * s, kneeX - 4 * s, midY);
      ctx.lineTo(kneeX + 5 * s, midY);
      ctx.quadraticCurveTo(hipX + 16 * s, midY - 14 * s, hipX + 14 * s, hipY);
      ctx.closePath();
      ctx.fill();

      // Knee Callus Pad (Carpal Pad)
      ctx.fillStyle = isFar ? '#260F06' : '#52240E';
      ctx.beginPath();
      ctx.ellipse(kneeX + 4.5 * s, midY, 2.4 * s, 4 * s, 0.1, 0, Math.PI * 2);
      ctx.fill();

      // 2. Slender Metacarpal (Cannon Bone) & Pastern
      ctx.fillStyle = fillStyle;
      ctx.beginPath();
      ctx.moveTo(kneeX - 4 * s, midY);
      ctx.lineTo(footX - 3.2 * s, footY - 5 * s);
      ctx.lineTo(footX + 4 * s, footY - 5 * s);
      ctx.lineTo(kneeX + 5 * s, midY);
      ctx.closePath();
      ctx.fill();

      // 3. Broad Cushioned Footpad
      ctx.fillStyle = isFar ? '#260F06' : '#52240E';
      ctx.beginPath();
      ctx.ellipse(footX + 1 * s, footY - 1.5 * s, 8.5 * s, 4 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Front Toe Claw
      ctx.fillStyle = '#1A0904';
      ctx.fillRect(footX + 6.5 * s, footY - 2.5 * s, 2.2 * s, 2 * s);

      // Golden Rim Highlight
      ctx.strokeStyle = rimStyle;
      ctx.lineWidth = 1.8 * s;
      ctx.beginPath();
      ctx.moveTo(hipX + 14 * s, hipY);
      ctx.lineTo(kneeX + 5 * s, midY);
      ctx.lineTo(footX + 4 * s, footY - 5 * s);
      ctx.stroke();

      // Foot Sand Contact Shadow
      ctx.fillStyle = 'rgba(28, 9, 8, 0.68)';
      ctx.beginPath();
      ctx.ellipse(footX + 1 * s, groundY + 1 * s, 9 * s, 2.4 * s, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // ===========================================================================
  // ARTISTIC HIGH-DEFINITION RAJASTHANI TRAVELLER (MARWARI / RABARI SHEPHERD)
  // Real human proportions, dignified Rajput features, pleated Angarkha & Safa
  // ===========================================================================
  drawRajasthaniTraveller(ctx, x, groundY, s, cycle) {
    ctx.save();

    const legSwing = Math.sin(cycle) * 8.5 * s;
    const torsoBob = Math.sin(cycle * 2) * 1.6 * s;
    // Human height: scaled gracefully relative to royal camel
    const manY = groundY - 84 * s + torsoBob;

    // -------------------------------------------------------------------------
    // 1. POLISHED SHEPHERD'S LATHI (Staff held in far hand, grounded on sand)
    // -------------------------------------------------------------------------
    ctx.strokeStyle = '#4A2711';
    ctx.lineWidth = 3.2 * s;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x + 23 * s, manY - 26 * s);
    ctx.lineTo(x + 20 * s, groundY);
    ctx.stroke();

    // Turned Brass Bands on Lathi
    ctx.strokeStyle = '#F5C658';
    ctx.lineWidth = 4 * s;
    ctx.beginPath();
    ctx.moveTo(x + 22.5 * s, manY - 14 * s);
    ctx.lineTo(x + 22.5 * s, manY - 8 * s);
    ctx.moveTo(x + 21.5 * s, manY + 18 * s);
    ctx.lineTo(x + 21.5 * s, manY + 24 * s);
    ctx.stroke();

    // Golden Staff Finial Cap
    ctx.fillStyle = '#FFD54F';
    ctx.beginPath();
    ctx.arc(x + 23 * s, manY - 27 * s, 2.5 * s, 0, Math.PI * 2);
    ctx.fill();

    // -------------------------------------------------------------------------
    // 2. LEGS IN PLEATED DHOTI & MOJARI SHOES (Walking Cycle)
    // -------------------------------------------------------------------------
    this.drawHumanLeg(ctx, x - 5 * s, manY + 36 * s, groundY, -legSwing, s, true);  // Far Leg
    this.drawHumanLeg(ctx, x + 6 * s, manY + 36 * s, groundY, legSwing, s, false); // Near Leg

    // -------------------------------------------------------------------------
    // 3. WHITE MARWARI ANGARKHA / KURTA (Tailored Muslin Bodice & Flared Skirt)
    // -------------------------------------------------------------------------
    const kurtaGrad = ctx.createLinearGradient(x - 12 * s, manY - 14 * s, x + 18 * s, manY + 40 * s);
    kurtaGrad.addColorStop(0, '#FFFDF8');
    kurtaGrad.addColorStop(0.55, '#EBE3D6');
    kurtaGrad.addColorStop(1, '#C2B39E');
    ctx.fillStyle = kurtaGrad;

    // Bodice & Flared Pleated Skirt (Gher)
    ctx.beginPath();
    ctx.moveTo(x - 12 * s, manY - 14 * s); // Left shoulder
    ctx.lineTo(x + 15 * s, manY - 14 * s); // Right shoulder
    ctx.bezierCurveTo(x + 17 * s, manY + 4 * s, x + 14 * s, manY + 16 * s, x + 16 * s, manY + 38 * s); // Right flared hem
    ctx.quadraticCurveTo(x + 2 * s, manY + 41 * s, x - 15 * s, manY + 38 * s); // Hem bottom curve
    ctx.bezierCurveTo(x - 13 * s, manY + 16 * s, x - 15 * s, manY + 4 * s, x - 12 * s, manY - 14 * s); // Left flank
    ctx.closePath();
    ctx.fill();

    // Asymmetric Angarkha Chest Crossover (Bandh) & Piping
    ctx.strokeStyle = '#D9A441';
    ctx.lineWidth = 1.8 * s;
    ctx.beginPath();
    ctx.moveTo(x - 6 * s, manY - 14 * s);
    ctx.quadraticCurveTo(x + 5 * s, manY - 2 * s, x + 8 * s, manY + 14 * s);
    ctx.stroke();

    // Fastening Silk Cords & Mini Pom-Poms
    ctx.fillStyle = '#C2185B';
    ctx.beginPath();
    ctx.arc(x + 8.5 * s, manY + 14 * s, 1.8 * s, 0, Math.PI * 2);
    ctx.arc(x + 3 * s, manY + 4 * s, 1.6 * s, 0, Math.PI * 2);
    ctx.fill();

    // -------------------------------------------------------------------------
    // 4. ROYAL CRIMSON / TERRACOTTA SHAWL (Khes / Dhabla Draped over Shoulder)
    // -------------------------------------------------------------------------
    const shawlGrad = ctx.createLinearGradient(x - 14 * s, manY - 14 * s, x + 4 * s, manY + 32 * s);
    shawlGrad.addColorStop(0, '#B3281E');
    shawlGrad.addColorStop(0.6, '#8E1812');
    shawlGrad.addColorStop(1, '#560E0A');
    ctx.fillStyle = shawlGrad;

    ctx.beginPath();
    ctx.moveTo(x - 12 * s, manY - 14 * s);
    ctx.lineTo(x - 1 * s, manY - 14 * s);
    ctx.quadraticCurveTo(x - 2 * s, manY + 10 * s, x - 6 * s, manY + 32 * s);
    ctx.lineTo(x - 17 * s, manY + 26 * s);
    ctx.quadraticCurveTo(x - 15 * s, manY + 6 * s, x - 12 * s, manY - 14 * s);
    ctx.closePath();
    ctx.fill();

    // Shawl Gold Zari Hem
    ctx.strokeStyle = '#F5C658';
    ctx.lineWidth = 2 * s;
    ctx.beginPath();
    ctx.moveTo(x - 17 * s, manY + 26 * s);
    ctx.lineTo(x - 6 * s, manY + 32 * s);
    ctx.stroke();

    // -------------------------------------------------------------------------
    // 5. ARMS & HANDS (Firmly Gripping Rope and Lathi Staff)
    // -------------------------------------------------------------------------
    // Right Arm (Holding Lathi Staff)
    ctx.strokeStyle = '#EBE3D6';
    ctx.lineWidth = 4.2 * s;
    ctx.beginPath();
    ctx.moveTo(x + 13 * s, manY - 10 * s); // Shoulder
    ctx.lineTo(x + 19 * s, manY + 6 * s);  // Elbow
    ctx.stroke();

    // Right Forearm (Sun-bronzed skin)
    ctx.strokeStyle = '#A86438';
    ctx.lineWidth = 3.6 * s;
    ctx.beginPath();
    ctx.moveTo(x + 19 * s, manY + 6 * s);
    ctx.lineTo(x + 22.5 * s, manY + 14 * s); // Wrist at staff
    ctx.stroke();

    // Right Hand wrapped around staff
    ctx.fillStyle = '#94532B';
    ctx.beginPath();
    ctx.arc(x + 22.5 * s, manY + 14 * s, 3 * s, 0, Math.PI * 2);
    ctx.fill();

    // Left Arm (Holding Camel Lead Rope forward)
    const handX = x - 14 * s;
    const handY = manY + 10 * s;

    // Left Sleeve
    ctx.strokeStyle = '#EBE3D6';
    ctx.lineWidth = 4.4 * s;
    ctx.beginPath();
    ctx.moveTo(x - 8 * s, manY - 10 * s);
    ctx.lineTo(x - 12 * s, manY + 2 * s);
    ctx.stroke();

    // Left Forearm
    ctx.strokeStyle = '#A86438';
    ctx.lineWidth = 3.6 * s;
    ctx.beginPath();
    ctx.moveTo(x - 12 * s, manY + 2 * s);
    ctx.lineTo(handX, handY);
    ctx.stroke();

    // Left Hand (Sculpted fist with thumb holding rope firmly)
    ctx.fillStyle = '#94532B';
    ctx.beginPath();
    ctx.arc(handX, handY, 3.4 * s, 0, Math.PI * 2);
    ctx.fill();

    // -------------------------------------------------------------------------
    // 6. ICONIC BRAND CHARACTER HEAD & MULTICOLORED BANDHANI TURBAN
    // (Rendered directly from the authentic illuminated brand sculpture / logo)
    // -------------------------------------------------------------------------
    // Neck base connecting to Angarkha collar
    ctx.fillStyle = '#C47A4A';
    ctx.beginPath();
    ctx.rect(x - 2 * s, manY - 15 * s, 8 * s, 7 * s);
    ctx.fill();

    // Head dimensions proportional to the body (width: 46*s, height: 47.7*s)
    const headW = 46 * s;
    const headH = 47.7 * s;
    const headX = x + 3 * s - headW / 2;
    const headY = manY - 48 * s;

    const isHeadReady = this.characterHeadLoaded || (this.characterHeadImg && this.characterHeadImg.complete && this.characterHeadImg.naturalWidth > 0);

    if (isHeadReady) {
      ctx.save();
      // Warm Illuminated Golden Halo Backlight (matching the sculpture)
      ctx.shadowColor = 'rgba(255, 198, 48, 0.9)';
      ctx.shadowBlur = 10 * s;
      ctx.drawImage(this.characterHeadImg, headX, headY, headW, headH);
      ctx.restore();
    } else {
      // Fallback
      ctx.fillStyle = '#D48C5E';
      ctx.beginPath();
      ctx.arc(x + 3 * s, manY - 24 * s, 10 * s, 0, Math.PI * 2);
      ctx.fill();
    }

    // -------------------------------------------------------------------------
    // 7. FLOWING TURBAN TAIL (Shamla billowing in the desert breeze)
    // -------------------------------------------------------------------------
    const windW = Math.sin(this.ambientTime * 3.2) * 6 * s;
    ctx.strokeStyle = '#D84315';
    ctx.lineWidth = 3.6 * s;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x - 12 * s, manY - 28 * s);
    ctx.bezierCurveTo(x - 22 * s + windW * 0.6, manY - 22 * s, x - 26 * s + windW, manY - 12 * s, x - 22 * s + windW * 1.2, manY + 2 * s);
    ctx.stroke();

    // Shamla Gold Zari Border Trim
    ctx.strokeStyle = '#FFD54F';
    ctx.lineWidth = 1.4 * s;
    ctx.stroke();

    // -------------------------------------------------------------------------
    // 9. SUNSET RIM LIGHT ON MAN
    // -------------------------------------------------------------------------
    ctx.strokeStyle = 'rgba(255, 222, 130, 0.9)';
    ctx.lineWidth = 1.8 * s;
    ctx.beginPath();
    if (!isHeadReady) {
      ctx.moveTo(x + 5 * s, manY - 44 * s);
      ctx.lineTo(x + 13 * s, manY - 38 * s);
      ctx.moveTo(x + 13 * s, manY - 24 * s); // Nose tip
      ctx.lineTo(x + 10 * s, manY - 21 * s);
    }
    ctx.moveTo(x + 15 * s, manY - 14 * s); // Right shoulder
    ctx.lineTo(x + 19 * s, manY + 6 * s);
    ctx.stroke();

    ctx.restore();

    return { x: handX, y: handY };
  }

  // ===========================================================================
  // HUMAN LEG IN DHOTI & TRADITIONAL RAJASTHANI MOJARI (JUTTI)
  // ===========================================================================
  drawHumanLeg(ctx, hipX, hipY, groundY, swing, s, isFar) {
    ctx.save();

    const kneeX = hipX + swing * 0.5;
    const kneeY = hipY + (groundY - hipY) * 0.42;
    const ankleX = hipX + swing;
    const footLift = Math.max(0, -swing * 0.25);
    const ankleY = groundY - 4 * s - footLift;

    // 1. Hitch-Draped Rabari Dhoti (Voluminous pleated cloth between thighs)
    const dhotiFill = isFar ? '#BFB19E' : '#EBE3D6';
    ctx.fillStyle = dhotiFill;

    ctx.beginPath();
    ctx.moveTo(hipX - 9 * s, hipY);
    ctx.quadraticCurveTo(hipX - 11 * s, (hipY + kneeY) * 0.5, kneeX - 6 * s, kneeY);
    ctx.lineTo(kneeX + 7 * s, kneeY);
    ctx.quadraticCurveTo(hipX + 11 * s, (hipY + kneeY) * 0.5, hipX + 8 * s, hipY);
    ctx.closePath();
    ctx.fill();

    // Dhoti pleat shadow line
    ctx.strokeStyle = isFar ? '#968470' : '#BAA995';
    ctx.lineWidth = 1.6 * s;
    ctx.beginPath();
    ctx.moveTo(hipX, hipY);
    ctx.quadraticCurveTo(hipX - 2 * s, (hipY + kneeY) * 0.5, kneeX, kneeY);
    ctx.stroke();

    // 2. Muscular Sun-Bronzed Calf (Gastrocnemius contour & ankle)
    ctx.fillStyle = isFar ? '#7C3F1E' : '#A86438';
    ctx.beginPath();
    ctx.moveTo(kneeX - 4.5 * s, kneeY);
    // Calf muscular bulge
    ctx.quadraticCurveTo(kneeX - 6 * s, (kneeY + ankleY) * 0.45, ankleX - 3.2 * s, ankleY);
    ctx.lineTo(ankleX + 3.8 * s, ankleY);
    // Shin line
    ctx.quadraticCurveTo(kneeX + 5 * s, (kneeY + ankleY) * 0.5, kneeX + 5.5 * s, kneeY);
    ctx.closePath();
    ctx.fill();

    // 3. Traditional Handcrafted Mojari / Jutti Shoe (Curled pointed toe)
    const shoeFill = isFar ? '#5C1209' : '#9E2416';
    ctx.fillStyle = shoeFill;
    ctx.strokeStyle = shoeFill;
    ctx.lineWidth = 2.8 * s;

    ctx.beginPath();
    ctx.moveTo(ankleX - 6 * s, ankleY + 4 * s);
    ctx.lineTo(ankleX + 9 * s, ankleY + 4 * s);
    // Characteristic curled upward toe (Khussa / Nokh)
    ctx.quadraticCurveTo(ankleX + 15 * s, ankleY + 3 * s, ankleX + 13 * s, ankleY - 4 * s);
    ctx.stroke();

    // Gold Tilla Embroidery on Mojari Upper
    ctx.fillStyle = '#F5C658';
    ctx.beginPath();
    ctx.arc(ankleX + 3 * s, ankleY + 1.5 * s, 1.4 * s, 0, Math.PI * 2);
    ctx.fill();

    // Sand Contact Shadow
    ctx.fillStyle = 'rgba(26, 9, 8, 0.65)';
    ctx.beginPath();
    ctx.ellipse(ankleX + 2 * s, groundY + 1 * s, 7.5 * s, 2.2 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // ===========================================================================
  // DYNAMIC CATENARY LEAD ROPE (Braided Camel-Hair Rope with Bells)
  // ===========================================================================
  drawLeadRope(ctx, x1, y1, x2, y2, s, cycle) {
    ctx.save();

    // Natural catenary physics sag & gentle wind oscillation
    const midX = (x1 + x2) * 0.5;
    const naturalSag = 18 * s + Math.sin(this.ambientTime * 2.6 + cycle) * 3.5 * s;
    const midY = Math.max(y1, y2) + naturalSag;

    // Braided Camel-Hair Rope
    ctx.strokeStyle = '#5A3216';
    ctx.lineWidth = 2.6 * s;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo(midX, midY, x2, y2);
    ctx.stroke();

    // Golden Sunset Highlight on Top Edge of Rope
    ctx.strokeStyle = 'rgba(255, 222, 130, 0.75)';
    ctx.lineWidth = 1 * s;
    ctx.beginPath();
    ctx.moveTo(x1, y1 - 0.8 * s);
    ctx.quadraticCurveTo(midX, midY - 0.8 * s, x2, y2 - 0.8 * s);
    ctx.stroke();

    // Traditional Decorative Woollen Tassels Along the Caravan Rope
    const tX = (x1 + midX) * 0.5;
    const tY = (y1 + midY) * 0.5 + 2 * s;
    ctx.strokeStyle = '#D9A441';
    ctx.lineWidth = 1.8 * s;
    ctx.beginPath();
    ctx.moveTo(tX, tY);
    ctx.lineTo(tX + Math.sin(cycle) * 3.5 * s, tY + 8 * s);
    ctx.stroke();

    ctx.fillStyle = '#C2185B';
    ctx.beginPath();
    ctx.arc(tX + Math.sin(cycle) * 3.5 * s, tY + 8.5 * s, 2 * s, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

// Instantiate engine when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => { window.scrollyEngine = new ScrollytellingEngine(); });
} else {
  window.scrollyEngine = new ScrollytellingEngine();
}
