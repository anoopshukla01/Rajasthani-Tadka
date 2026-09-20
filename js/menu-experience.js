/**
 * RAJASTHANI TADKA — SIGNATURE HAVELI DOORS MENU EXPERIENCE
 * Manages the haveli door opening/closing transitions, midpoint royal seal reveal,
 * chapter-based category navigation with environmental cues, and
 * full-screen editorial dish presentation with animated spice-particle drift.
 */

class MenuExperienceController {
  constructor() {
    this.overlay = document.getElementById('menu-overlay-container');
    this.doorLeft = document.querySelector('.haveli-door-left');
    this.doorRight = document.querySelector('.haveli-door-right');
    this.royalSeal = document.getElementById('midpoint-royal-seal');
    this.lightBeam = document.querySelector('.light-beam-sweep');
    this.menuInterior = document.querySelector('.menu-interior-environment');
    this.envBgLayer = document.querySelector('.menu-env-bg-layer');

    this.tabButtons = document.querySelectorAll('.chapter-tab-btn');
    this.dishesGrid = document.querySelector('.menu-dishes-grid');
    this.closeBtn = document.querySelector('.btn-close-manuscript');

    // Dialog elements
    this.dialog = document.getElementById('dish-detail-dialog');
    this.dialogCloseBtn = document.querySelector('.dialog-close-btn');
    this.dialogImg = document.querySelector('.dialog-dish-img');
    this.dialogName = document.querySelector('.dialog-dish-name');
    this.dialogHindi = document.querySelector('.dialog-dish-hindi');
    this.dialogDesc = document.querySelector('.dialog-dish-desc');
    this.dialogPrice = document.querySelector('.dialog-price');
    this.dialogBadges = document.querySelector('.dialog-badges-row');
    this.dialogIngredients = document.querySelector('.ingredients-pills');
    this.dialogSpiceCanvas = document.querySelector('.dialog-spice-canvas');

    this.allDishes = [];
    this.currentCategory = 'thaali';
    this.savedScrollPosition = 0;
    this.isTransitioning = false;
    this.spiceParticles = [];
    this.spiceAnimId = null;

    this.init();
  }

  init() {
    // Bind trigger buttons across the site
    document.querySelectorAll('[data-action="open-menu"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openMenu();
      });
    });

    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.closeMenu());
    }

    if (this.dialogCloseBtn && this.dialog) {
      this.dialogCloseBtn.addEventListener('click', () => this.closeDishModal());
      this.dialog.addEventListener('click', (e) => {
        // Light dismiss if clicking backdrop
        if (e.target === this.dialog) {
          this.closeDishModal();
        }
      });
    }

    // Chapter Navigation Tabs
    this.tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.dataset.category;
        if (cat && cat !== this.currentCategory) {
          this.switchCategory(cat);
        }
      });
    });

    // ESC key closes modal or menu
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.dialog && this.dialog.open) {
          this.closeDishModal();
        } else if (this.overlay && this.overlay.classList.contains('is-active')) {
          this.closeMenu();
        }
      }
    });

    this.initSpiceParticleCanvas();
  }

  setDishesData(dishes) {
    this.allDishes = dishes;
    this.renderCategoryDishes(this.currentCategory);
  }

  openMenu() {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    // 1. Save scroll position and freeze viewport
    this.savedScrollPosition = window.scrollY;
    document.body.style.overflow = 'hidden';

    // 2. Freeze current cinematic scene for ~300ms
    setTimeout(() => {
      this.overlay.classList.add('is-active');

      const isMobile = window.innerWidth <= 960;

      // Reset initial door states
      if (isMobile) {
        this.doorLeft.style.transform = 'translateY(0)';
        this.doorRight.style.transform = 'translateY(0)';
      } else {
        this.doorLeft.style.transform = 'translateX(0)';
        this.doorRight.style.transform = 'translateX(0)';
      }

      this.doorLeft.style.transition = 'none';
      this.doorRight.style.transition = 'none';
      this.menuInterior.style.opacity = '0';
      this.lightBeam.style.opacity = '0';
      this.royalSeal.style.opacity = '0';

      // Trigger Haveli Doors slide
      requestAnimationFrame(() => {
        const doorTransition = 'transform 1.1s cubic-bezier(0.22, 1, 0.36, 1)';
        this.doorLeft.style.transition = doorTransition;
        this.doorRight.style.transition = doorTransition;

        if (isMobile) {
          this.doorLeft.style.transform = 'translateY(-100%)';
          this.doorRight.style.transform = 'translateY(100%)';
        } else {
          this.doorLeft.style.transform = 'translateX(-100%)';
          this.doorRight.style.transform = 'translateX(100%)';
        }

        // Midpoint: golden light beam sweep
        setTimeout(() => {
          this.lightBeam.style.opacity = '0.9';
          setTimeout(() => { this.lightBeam.style.opacity = '0'; }, 500);
        }, 350);

        // Midpoint: reveal Rajasthani Tadka royal seal / stamp
        setTimeout(() => {
          this.royalSeal.style.opacity = '1';
          this.royalSeal.style.transform = 'translate(-50%, -50%) scale(1.05)';

          setTimeout(() => {
            this.royalSeal.style.opacity = '0';
            this.royalSeal.style.transform = 'translate(-50%, -50%) scale(0.7)';
          }, 450);
        }, 400);

        // Settle into premium menu environment
        setTimeout(() => {
          this.menuInterior.style.opacity = '1';
          this.isTransitioning = false;
        }, 750);
      });
    }, 300);
  }

  closeMenu() {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    const isMobile = window.innerWidth <= 960;
    const doorCloseTransition = 'transform 0.9s cubic-bezier(0.25, 1, 0.5, 1)';

    this.menuInterior.style.opacity = '0';

    // Reverse: doors fold inward like royal manuscript
    this.doorLeft.style.transition = doorCloseTransition;
    this.doorRight.style.transition = doorCloseTransition;

    if (isMobile) {
      this.doorLeft.style.transform = 'translateY(0)';
      this.doorRight.style.transform = 'translateY(0)';
    } else {
      this.doorLeft.style.transform = 'translateX(0)';
      this.doorRight.style.transform = 'translateX(0)';
    }

    // Midpoint seal stamp as panels meet
    setTimeout(() => {
      this.royalSeal.style.opacity = '0.9';
      this.royalSeal.style.transform = 'translate(-50%, -50%) scale(1.0)';
      setTimeout(() => { this.royalSeal.style.opacity = '0'; }, 300);
    }, 450);

    setTimeout(() => {
      this.overlay.classList.remove('is-active');
      document.body.style.overflow = '';
      // Seamless return to exact scroll position without reload
      window.scrollTo({ top: this.savedScrollPosition, behavior: 'instant' });
      this.isTransitioning = false;
    }, 950);
  }

  switchCategory(category) {
    this.currentCategory = category;

    // Update active tab styles
    this.tabButtons.forEach(btn => {
      btn.classList.toggle('is-active', btn.dataset.category === category);
    });

    // Environmental Cue based on Category:
    // - Thaali: thali illustration/rotates into view
    // - Specialities: haveli doorway arch appears
    // - Breads: chulha/woodfire cooking visual appears
    // - Desserts: warm golden-hour sunset
    if (this.envBgLayer) {
      switch (category) {
        case 'thaali':
          this.envBgLayer.style.backgroundImage = "url('images/royal-thaali.jpg')";
          this.envBgLayer.style.opacity = "0.18";
          break;
        case 'specialities':
          this.envBgLayer.style.backgroundImage = "url('images/haveli-doors.jpg')";
          this.envBgLayer.style.opacity = "0.2";
          break;
        case 'breads':
          this.envBgLayer.style.backgroundImage = "url('images/woodfire-kiln.jpg')";
          this.envBgLayer.style.opacity = "0.22";
          break;
        case 'desserts':
          this.envBgLayer.style.backgroundImage = "url('images/royal-ghevar.jpg')";
          this.envBgLayer.style.opacity = "0.22";
          break;
        default:
          this.envBgLayer.style.backgroundImage = "url('images/thar-desert.jpg')";
          this.envBgLayer.style.opacity = "0.15";
      }
    }

    // Cinematic fade-out -> render -> fade-in
    this.dishesGrid.style.opacity = '0';
    this.dishesGrid.style.transform = 'translateY(12px)';
    this.dishesGrid.style.transition = 'opacity 0.35s ease, transform 0.35s ease';

    setTimeout(() => {
      this.renderCategoryDishes(category);
      this.dishesGrid.style.opacity = '1';
      this.dishesGrid.style.transform = 'translateY(0)';
    }, 300);
  }

  renderCategoryDishes(category) {
    if (!this.dishesGrid) return;

    const filtered = this.allDishes.filter(d => d.category === category);

    if (filtered.length === 0) {
      this.dishesGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem; color: var(--c-sand-muted);">
          <p style="font-family: var(--font-editorial); font-size: 1.4rem;">More royal delicacies are being simmered in our kitchens...</p>
        </div>
      `;
      return;
    }

    this.dishesGrid.innerHTML = filtered.map(dish => `
      <div class="dish-card" data-dish-id="${dish.id}" tabindex="0" role="button" aria-label="${dish.name}">
        <div class="dish-card-img-wrap">
          <img src="${dish.image}" alt="${dish.name}" class="dish-card-img" loading="lazy">
          <div class="${dish.veg ? 'dish-badge-veg' : 'dish-badge-nonveg'}" title="${dish.veg ? 'Pure Vegetarian' : 'Non-Vegetarian'}"></div>
        </div>
        <div class="dish-card-info">
          <div class="dish-card-name-row">
            <h3 class="dish-name">${dish.name}</h3>
            <span class="dish-price">₹${dish.price}</span>
          </div>
          <div class="dish-hindi-name">${dish.hindi_name || ''}</div>
          <p class="dish-desc">${dish.description}</p>
          <div class="dish-card-bottom">
            <span class="dish-explore-hint">View Dish Presentation <span>&rarr;</span></span>
            ${dish.is_signature ? '<span class="tag-badge tag-signature" style="font-size:0.65rem;">Royal Signature</span>' : ''}
          </div>
        </div>
      </div>
    `).join('');

    // Attach click listeners to cards
    this.dishesGrid.querySelectorAll('.dish-card').forEach(card => {
      card.addEventListener('click', () => {
        const dishId = card.dataset.dishId;
        this.openDishModalById(dishId);
      });
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.openDishModalById(card.dataset.dishId);
        }
      });
    });
  }

  openDishModalById(dishId) {
    const dish = this.allDishes.find(d => d.id === dishId);
    if (!dish || !this.dialog) return;

    this.dialogImg.src = dish.image;
    this.dialogImg.alt = dish.name;
    this.dialogName.textContent = dish.name;
    this.dialogHindi.textContent = dish.hindi_name || '';
    this.dialogDesc.textContent = dish.description;
    this.dialogPrice.textContent = `₹${dish.price}`;

    // Badges
    this.dialogBadges.innerHTML = `
      <span class="tag-badge ${dish.veg ? 'tag-veg' : 'tag-nonveg'}">
        ${dish.veg ? 'Pure Vegetarian' : 'Non-Vegetarian'}
      </span>
      ${dish.spicy ? `<span class="tag-badge tag-signature" style="border-color: #A34E35; color: #E58369;">Spice: ${dish.spicy}</span>` : ''}
      ${dish.is_signature ? '<span class="tag-badge tag-signature">Royal Signature</span>' : ''}
    `;

    // Ingredients Pills
    if (dish.ingredients && Array.isArray(dish.ingredients)) {
      this.dialogIngredients.innerHTML = dish.ingredients.map(ing => `
        <span class="ingredient-pill">${ing}</span>
      `).join('');
    } else {
      this.dialogIngredients.innerHTML = '';
    }

    this.dialog.showModal();
    this.startSpiceParticles();
  }

  closeDishModal() {
    if (!this.dialog) return;
    this.stopSpiceParticles();
    this.dialog.close();
  }

  initSpiceParticleCanvas() {
    if (!this.dialogSpiceCanvas) return;
    this.spiceCtx = this.dialogSpiceCanvas.getContext('2d');
  }

  startSpiceParticles() {
    if (!this.dialogSpiceCanvas || !this.spiceCtx) return;

    const canvas = this.dialogSpiceCanvas;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    this.spiceParticles = [];
    const colors = ['#DFBA6E', '#C69A48', '#C62828', '#E5732F', '#FAF6EE'];

    for (let i = 0; i < 28; i++) {
      this.spiceParticles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 0.8,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 0.4,
        vy: -Math.random() * 0.5 - 0.2,
        alpha: Math.random() * 0.7 + 0.3,
        pulse: Math.random() * Math.PI * 2
      });
    }

    const animateSpice = () => {
      const ctx = this.spiceCtx;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      this.spiceParticles.forEach(p => {
        p.pulse += 0.03;
        p.x += p.vx + Math.sin(p.pulse) * 0.2;
        p.y += p.vy;

        if (p.y < 0) p.y = canvas.height;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha * (0.6 + 0.4 * Math.sin(p.pulse));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalAlpha = 1;
      this.spiceAnimId = requestAnimationFrame(animateSpice);
    };

    if (this.spiceAnimId) cancelAnimationFrame(this.spiceAnimId);
    animateSpice();
  }

  stopSpiceParticles() {
    if (this.spiceAnimId) {
      cancelAnimationFrame(this.spiceAnimId);
      this.spiceAnimId = null;
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => { window.menuExperience = new MenuExperienceController(); });
} else {
  window.menuExperience = new MenuExperienceController();
}
