/**
 * RAJASTHANI TADKA — ROYAL ADMINISTRATIVE CONTROL PORTAL (CMS)
 * Comprehensive management controller for:
 * - Brand logo & visual identity uploads
 * - Full text copy across all website sections
 * - Menu dishes CRUD with inline photo uploading
 * - Category organization
 * - Ambience gallery management
 * - Customer reviews & ratings
 * - Restaurant hours, contact & social links
 * - Live table bookings & status workflows
 * - Visual media asset library
 * - System backup & restore
 */

class AdminPortal {
  constructor() {
    this.token = sessionStorage.getItem('rt_admin_token');
    this.siteData = null;

    // Core Layout
    this.authGate = document.getElementById('auth-gate-card');
    this.dashboard = document.getElementById('admin-dashboard');
    this.loginForm = document.getElementById('admin-login-form');
    this.loginError = document.getElementById('login-error');
    this.userControls = document.getElementById('admin-user-controls');
    this.btnLogout = document.getElementById('btn-logout');

    this.tabButtons = document.querySelectorAll('.admin-tab-btn');
    this.tabContents = document.querySelectorAll('.admin-tab-content');
    this.toast = document.getElementById('admin-toast');

    // Logo & Brand
    this.logoDropZone = document.getElementById('logo-drop-zone');
    this.logoFileInput = document.getElementById('logo-file-input');
    this.btnBrowseLogo = document.getElementById('btn-browse-logo');
    this.brandForm = document.getElementById('brand-edit-form');

    // Hero & Story
    this.heroForm = document.getElementById('hero-edit-form');
    this.btnUploadHeroBg = document.getElementById('btn-upload-hero-bg');
    this.heroBgFileInput = document.getElementById('hero-bg-file-input');
    this.storyForm = document.getElementById('story-edit-form');

    // Dishes
    this.dishModal = document.getElementById('admin-dish-modal');
    this.dishForm = document.getElementById('dish-form');
    this.btnAddNewDish = document.getElementById('btn-add-dish');
    this.btnCloseDishModal = document.getElementById('btn-close-dish-modal');
    this.btnCancelDish = document.getElementById('btn-cancel-dish');
    this.dishCategoryFilter = document.getElementById('dish-category-filter');
    this.dishSearchInput = document.getElementById('dish-search-input');
    this.btnUploadDishPhoto = document.getElementById('btn-upload-dish-photo');
    this.dishFileInput = document.getElementById('dish-file-input');
    this.dishImageInput = document.getElementById('dish-image');
    this.dishPreviewImg = document.getElementById('dish-preview-img');

    // Categories
    this.catModal = document.getElementById('admin-category-modal');
    this.catForm = document.getElementById('category-form');
    this.btnAddNewCat = document.getElementById('btn-add-category');
    this.btnCloseCatModal = document.getElementById('btn-close-cat-modal');
    this.btnCancelCat = document.getElementById('btn-cancel-cat');

    // Ambience Gallery
    this.galleryModal = document.getElementById('admin-gallery-modal');
    this.galleryForm = document.getElementById('gallery-form');
    this.btnAddNewGallery = document.getElementById('btn-add-gallery-photo');
    this.btnCloseGalleryModal = document.getElementById('btn-close-gallery-modal');
    this.btnCancelGallery = document.getElementById('btn-cancel-gallery');
    this.btnUploadGalleryPhoto = document.getElementById('btn-upload-gallery-photo');
    this.galleryFileInput = document.getElementById('gallery-file-input');
    this.galleryImageInput = document.getElementById('gallery-image');
    this.galleryPreviewImg = document.getElementById('gallery-preview-img');

    // Reviews
    this.reviewModal = document.getElementById('admin-review-modal');
    this.reviewForm = document.getElementById('review-form');
    this.btnAddNewReview = document.getElementById('btn-add-review');
    this.btnCloseReviewModal = document.getElementById('btn-close-review-modal');
    this.btnCancelReview = document.getElementById('btn-cancel-review');

    // Restaurant Contact
    this.restaurantForm = document.getElementById('restaurant-edit-form');

    // Media Library
    this.mediaDropZone = document.getElementById('media-drop-zone');
    this.mediaFileInput = document.getElementById('media-file-input');
    this.btnBrowseMedia = document.getElementById('btn-browse-media');
    this.btnRefreshMedia = document.getElementById('btn-refresh-media');

    // Reservations
    this.btnRefreshReservations = document.getElementById('btn-refresh-reservations');

    // Settings & Backup
    this.changePwForm = document.getElementById('change-pw-form');
    this.btnDownloadBackup = document.getElementById('btn-download-backup');
    this.btnRestoreBackup = document.getElementById('btn-restore-backup');
    this.backupFileInput = document.getElementById('backup-file-input');

    this.init();
  }

  async init() {
    this.bindEvents();

    if (this.token) {
      this.showDashboard();
      await this.loadData();
    } else {
      this.showAuthGate();
    }
  }

  bindEvents() {
    // Auth
    this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    this.btnLogout.addEventListener('click', () => this.handleLogout());

    // Navigation Tabs
    this.tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const tabId = btn.dataset.tab;
        this.switchTab(tabId);
        if (tabId === 'tab-media') this.loadMediaLibrary();
      });
    });

    // 1. Logo Management
    if (this.btnBrowseLogo && this.logoFileInput) {
      this.btnBrowseLogo.addEventListener('click', () => this.logoFileInput.click());
      this.logoFileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          this.uploadLogo(e.target.files[0]);
        }
      });
    }

    if (this.logoDropZone) {
      this.logoDropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        this.logoDropZone.classList.add('dragover');
      });
      this.logoDropZone.addEventListener('dragleave', () => {
        this.logoDropZone.classList.remove('dragover');
      });
      this.logoDropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        this.logoDropZone.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          this.uploadLogo(e.dataTransfer.files[0]);
        }
      });
    }

    if (this.brandForm) {
      this.brandForm.addEventListener('submit', (e) => this.handleSaveBrand(e));
    }

    // 2. Hero Management
    if (this.heroForm) {
      this.heroForm.addEventListener('submit', (e) => this.handleSaveHero(e));
    }
    if (this.btnUploadHeroBg && this.heroBgFileInput) {
      this.btnUploadHeroBg.addEventListener('click', () => this.heroBgFileInput.click());
      this.heroBgFileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          this.uploadGenericImage(e.target.files[0], (url) => {
            document.getElementById('hero-bg-image').value = url;
            this.showToast('Hero background uploaded!');
          });
        }
      });
    }

    // 3. Story Management
    if (this.storyForm) {
      this.storyForm.addEventListener('submit', (e) => this.handleSaveStory(e));
    }

    // 4. Dishes CRUD
    if (this.btnAddNewDish) {
      this.btnAddNewDish.addEventListener('click', () => this.openDishModal());
    }
    if (this.btnCloseDishModal) {
      this.btnCloseDishModal.addEventListener('click', () => this.dishModal.close());
    }
    if (this.btnCancelDish) {
      this.btnCancelDish.addEventListener('click', () => this.dishModal.close());
    }
    if (this.dishForm) {
      this.dishForm.addEventListener('submit', (e) => this.handleSaveDish(e));
    }
    if (this.dishCategoryFilter) {
      this.dishCategoryFilter.addEventListener('change', () => this.renderDishesTable());
    }
    if (this.dishSearchInput) {
      this.dishSearchInput.addEventListener('input', () => this.renderDishesTable());
    }

    // Inline dish photo upload
    if (this.btnUploadDishPhoto && this.dishFileInput) {
      this.btnUploadDishPhoto.addEventListener('click', () => this.dishFileInput.click());
      this.dishFileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          this.uploadGenericImage(e.target.files[0], (url) => {
            this.dishImageInput.value = url;
            this.dishPreviewImg.src = url;
            this.showToast('Dish photo uploaded and selected!');
          });
        }
      });
    }
    if (this.dishImageInput) {
      this.dishImageInput.addEventListener('input', (e) => {
        this.dishPreviewImg.src = e.target.value || 'images/royal-thaali.jpg';
      });
    }

    // 5. Categories CRUD
    if (this.btnAddNewCat) {
      this.btnAddNewCat.addEventListener('click', () => this.openCatModal());
    }
    if (this.btnCloseCatModal) {
      this.btnCloseCatModal.addEventListener('click', () => this.catModal.close());
    }
    if (this.btnCancelCat) {
      this.btnCancelCat.addEventListener('click', () => this.catModal.close());
    }
    if (this.catForm) {
      this.catForm.addEventListener('submit', (e) => this.handleSaveCategory(e));
    }

    // 6. Ambience Gallery CRUD
    if (this.btnAddNewGallery) {
      this.btnAddNewGallery.addEventListener('click', () => this.openGalleryModal());
    }
    if (this.btnCloseGalleryModal) {
      this.btnCloseGalleryModal.addEventListener('click', () => this.galleryModal.close());
    }
    if (this.btnCancelGallery) {
      this.btnCancelGallery.addEventListener('click', () => this.galleryModal.close());
    }
    if (this.galleryForm) {
      this.galleryForm.addEventListener('submit', (e) => this.handleSaveGallery(e));
    }
    if (this.btnUploadGalleryPhoto && this.galleryFileInput) {
      this.btnUploadGalleryPhoto.addEventListener('click', () => this.galleryFileInput.click());
      this.galleryFileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          this.uploadGenericImage(e.target.files[0], (url) => {
            this.galleryImageInput.value = url;
            this.galleryPreviewImg.src = url;
            this.showToast('Ambience photo uploaded!');
          });
        }
      });
    }
    if (this.galleryImageInput) {
      this.galleryImageInput.addEventListener('input', (e) => {
        this.galleryPreviewImg.src = e.target.value || 'images/haveli-courtyard.jpg';
      });
    }

    // 7. Reviews CRUD
    if (this.btnAddNewReview) {
      this.btnAddNewReview.addEventListener('click', () => this.openReviewModal());
    }
    if (this.btnCloseReviewModal) {
      this.btnCloseReviewModal.addEventListener('click', () => this.reviewModal.close());
    }
    if (this.btnCancelReview) {
      this.btnCancelReview.addEventListener('click', () => this.reviewModal.close());
    }
    if (this.reviewForm) {
      this.reviewForm.addEventListener('submit', (e) => this.handleSaveReview(e));
    }

    // 8. Restaurant Details
    if (this.restaurantForm) {
      this.restaurantForm.addEventListener('submit', (e) => this.handleSaveRestaurant(e));
    }

    // 9. Media Library
    if (this.btnBrowseMedia && this.mediaFileInput) {
      this.btnBrowseMedia.addEventListener('click', () => this.mediaFileInput.click());
      this.mediaFileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length) {
          this.uploadMultipleMedia(Array.from(e.target.files));
        }
      });
    }
    if (this.mediaDropZone) {
      this.mediaDropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        this.mediaDropZone.classList.add('dragover');
      });
      this.mediaDropZone.addEventListener('dragleave', () => {
        this.mediaDropZone.classList.remove('dragover');
      });
      this.mediaDropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        this.mediaDropZone.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files.length) {
          this.uploadMultipleMedia(Array.from(e.dataTransfer.files));
        }
      });
    }
    if (this.btnRefreshMedia) {
      this.btnRefreshMedia.addEventListener('click', () => this.loadMediaLibrary());
    }

    // 10. Reservations
    if (this.btnRefreshReservations) {
      this.btnRefreshReservations.addEventListener('click', () => this.loadData());
    }

    // 11. Settings & Backups
    if (this.changePwForm) {
      this.changePwForm.addEventListener('submit', (e) => this.handleChangePassword(e));
    }
    if (this.btnDownloadBackup) {
      this.btnDownloadBackup.addEventListener('click', () => this.downloadBackup());
    }
    if (this.btnRestoreBackup && this.backupFileInput) {
      this.btnRestoreBackup.addEventListener('click', () => this.restoreBackup());
    }
  }

  showAuthGate() {
    this.authGate.style.display = 'block';
    this.dashboard.style.display = 'none';
    this.userControls.style.display = 'none';
  }

  showDashboard() {
    this.authGate.style.display = 'none';
    this.dashboard.style.display = 'block';
    this.userControls.style.display = 'flex';
  }

  async handleLogin(e) {
    e.preventDefault();
    const password = document.getElementById('admin-password').value;

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json();

      if (data.success && data.token) {
        this.token = data.token;
        sessionStorage.setItem('rt_admin_token', this.token);
        this.showDashboard();
        await this.loadData();
      } else {
        this.loginError.textContent = data.error || 'Authentication failed.';
        this.loginError.style.display = 'block';
      }
    } catch (err) {
      this.loginError.textContent = 'Server connection error.';
      this.loginError.style.display = 'block';
    }
  }

  handleLogout() {
    sessionStorage.removeItem('rt_admin_token');
    this.token = null;
    this.showAuthGate();
  }

  switchTab(tabId) {
    this.tabButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    this.tabContents.forEach(content => {
      content.style.display = content.id === tabId ? 'block' : 'none';
    });
  }

  async loadData() {
    try {
      const res = await fetch('/api/data');
      const json = await res.json();
      if (json.success && json.data) {
        this.siteData = json.data;

        // Hydrate all tabs
        this.populateBrandSection();
        this.populateHeroSection();
        this.populateStorySection();
        this.populateCategoryDropdowns();
        this.renderDishesTable();
        this.renderCategoriesTable();
        this.renderAmbienceGallery();
        this.renderReviewsList();
        this.populateRestaurantForm();
        this.renderReservations();
      }
    } catch (err) {
      console.error('Error loading site data:', err);
    }
  }

  // =========================================================================
  // 1. BRAND & LOGO
  // =========================================================================
  populateBrandSection() {
    const rest = this.siteData.restaurant || {};
    const logoUrl = rest.logo || 'images/logo.svg';

    document.getElementById('brand-name').value = rest.name || '';
    document.getElementById('brand-hindi-name').value = rest.hindi_name || '';
    document.getElementById('brand-tagline').value = rest.tagline || '';
    document.getElementById('brand-subline').value = rest.subline || '';
    document.getElementById('brand-concept').value = rest.concept || '';

    // Update active logo preview
    const previewDark = document.getElementById('active-logo-preview-dark');
    const pathCode = document.getElementById('active-logo-path');
    const headerLogo = document.getElementById('admin-header-logo-img');
    const gateLogo = document.getElementById('gate-logo-img');

    if (previewDark) previewDark.src = logoUrl;
    if (pathCode) pathCode.textContent = logoUrl;
    if (headerLogo) headerLogo.src = logoUrl;
    if (gateLogo) gateLogo.src = logoUrl;
  }

  uploadLogo(file) {
    const reader = new FileReader();
    reader.onload = async (event) => {
      const b64 = event.target.result;
      try {
        const res = await fetch('/api/upload-logo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, data: b64 })
        });
        const data = await res.json();
        if (data.success) {
          this.siteData.restaurant.logo = data.url;
          this.populateBrandSection();
          this.showToast('Royal Brand Logo successfully updated live!');
        } else {
          alert('Failed to upload logo: ' + (data.error || 'Server error'));
        }
      } catch (err) {
        alert('Error uploading logo: ' + err.message);
      }
    };
    reader.readAsDataURL(file);
  }

  async handleSaveBrand(e) {
    e.preventDefault();
    const brandPayload = {
      name: document.getElementById('brand-name').value.trim(),
      hindi_name: document.getElementById('brand-hindi-name').value.trim(),
      tagline: document.getElementById('brand-tagline').value.trim(),
      subline: document.getElementById('brand-subline').value.trim(),
      concept: document.getElementById('brand-concept').value.trim()
    };

    try {
      const res = await fetch('/api/restaurant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurant: brandPayload })
      });
      const data = await res.json();
      if (data.success) {
        this.showToast('Brand identity texts saved live!');
        await this.loadData();
      }
    } catch (err) {
      alert('Error updating brand: ' + err.message);
    }
  }

  // =========================================================================
  // 2. HERO SECTION
  // =========================================================================
  populateHeroSection() {
    const hero = this.siteData.hero || {};
    document.getElementById('hero-headline').value = hero.headline || '';
    document.getElementById('hero-subline').value = hero.subline || '';
    document.getElementById('hero-cta-explore').value = hero.cta_explore || '';
    document.getElementById('hero-cta-menu').value = hero.cta_menu || '';
    document.getElementById('hero-intro-heading').value = hero.intro_heading || '';
    document.getElementById('hero-intro-copy').value = hero.intro_copy || '';
    document.getElementById('hero-bg-image').value = hero.bg_image || 'images/thar-desert.jpg';
  }

  async handleSaveHero(e) {
    e.preventDefault();
    const heroPayload = {
      headline: document.getElementById('hero-headline').value.trim(),
      subline: document.getElementById('hero-subline').value.trim(),
      cta_explore: document.getElementById('hero-cta-explore').value.trim(),
      cta_menu: document.getElementById('hero-cta-menu').value.trim(),
      intro_heading: document.getElementById('hero-intro-heading').value.trim(),
      intro_copy: document.getElementById('hero-intro-copy').value.trim(),
      bg_image: document.getElementById('hero-bg-image').value.trim()
    };

    try {
      const res = await fetch('/api/hero', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hero: heroPayload })
      });
      const data = await res.json();
      if (data.success) {
        this.showToast('Hero texts and background updated live!');
        await this.loadData();
      }
    } catch (err) {
      alert('Error saving hero: ' + err.message);
    }
  }

  // =========================================================================
  // 3. HERITAGE SCROLLYTELLING STORY
  // =========================================================================
  populateStorySection() {
    const story = this.siteData.story || { stages: [] };
    const container = document.getElementById('story-stages-container');
    if (!container) return;

    const stages = story.stages || [];
    container.innerHTML = stages.map((stage, idx) => `
      <div style="background: #100C0B; border: 1px solid rgba(198,154,72,0.25); border-radius: 6px; padding: 1.5rem; margin-bottom: 1.5rem;">
        <span class="tag-pill" style="color: var(--c-gold-bright); margin-bottom: 0.8rem;">Stage 0${idx + 1}</span>
        
        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label">Step Label</label>
            <input type="text" class="form-input story-stage-step" data-index="${idx}" value="${stage.step || ''}" required>
          </div>
          <div class="form-group">
            <label class="form-label">Stage Title</label>
            <input type="text" class="form-input story-stage-title" data-index="${idx}" value="${stage.title || ''}" required>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Stage Narrative Body</label>
          <textarea class="form-textarea story-stage-body" data-index="${idx}" rows="3" required>${stage.body || ''}</textarea>
        </div>

        ${stage.cta_text !== undefined ? `
          <div class="form-group">
            <label class="form-label">Stage Button CTA Text</label>
            <input type="text" class="form-input story-stage-cta" data-index="${idx}" value="${stage.cta_text || ''}">
          </div>
        ` : ''}
      </div>
    `).join('');
  }

  async handleSaveStory(e) {
    e.preventDefault();
    const container = document.getElementById('story-stages-container');
    const stages = (this.siteData.story && this.siteData.story.stages) ? [...this.siteData.story.stages] : [];

    container.querySelectorAll('.story-stage-title').forEach(el => {
      const idx = parseInt(el.dataset.index, 10);
      if (stages[idx]) {
        stages[idx].title = el.value.trim();
      }
    });

    container.querySelectorAll('.story-stage-step').forEach(el => {
      const idx = parseInt(el.dataset.index, 10);
      if (stages[idx]) {
        stages[idx].step = el.value.trim();
      }
    });

    container.querySelectorAll('.story-stage-body').forEach(el => {
      const idx = parseInt(el.dataset.index, 10);
      if (stages[idx]) {
        stages[idx].body = el.value.trim();
      }
    });

    container.querySelectorAll('.story-stage-cta').forEach(el => {
      const idx = parseInt(el.dataset.index, 10);
      if (stages[idx]) {
        stages[idx].cta_text = el.value.trim();
      }
    });

    const storyPayload = {
      section_title: (this.siteData.story && this.siteData.story.section_title) || 'THE TASTE OF RAJASTHAN',
      section_pre_title: (this.siteData.story && this.siteData.story.section_pre_title) || 'स्वाद की एक परंपरा',
      stages: stages
    };

    try {
      const res = await fetch('/api/update-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: 'story', data: storyPayload })
      });
      const data = await res.json();
      if (data.success) {
        this.showToast('Heritage journey stages saved live!');
        await this.loadData();
      }
    } catch (err) {
      alert('Error updating story: ' + err.message);
    }
  }

  // =========================================================================
  // 4. MENU DISHES CRUD
  // =========================================================================
  populateCategoryDropdowns() {
    const categories = this.siteData.categories || [];

    // Filter dropdown
    if (this.dishCategoryFilter) {
      const currentVal = this.dishCategoryFilter.value;
      this.dishCategoryFilter.innerHTML = '<option value="all">All Categories</option>' +
        categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
      this.dishCategoryFilter.value = currentVal || 'all';
    }

    // Modal category select
    const modalSelect = document.getElementById('dish-category');
    if (modalSelect) {
      modalSelect.innerHTML = categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    }
  }

  renderDishesTable() {
    const tbody = document.getElementById('dishes-table-body');
    const totalCount = document.getElementById('dishes-count');
    const filteredCount = document.getElementById('dish-filtered-count');
    if (!tbody || !this.siteData || !this.siteData.dishes) return;

    const allDishes = this.siteData.dishes || [];
    if (totalCount) totalCount.textContent = allDishes.length;

    const filter = this.dishCategoryFilter ? this.dishCategoryFilter.value : 'all';
    const search = this.dishSearchInput ? this.dishSearchInput.value.toLowerCase().trim() : '';

    const filtered = allDishes.filter(d => {
      const matchCat = (filter === 'all' || d.category === filter);
      const matchSearch = (!search || (d.name && d.name.toLowerCase().includes(search)) || (d.hindi_name && d.hindi_name.includes(search)));
      return matchCat && matchSearch;
    });

    if (filteredCount) filteredCount.textContent = filtered.length;

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #888; padding: 2rem;">No matching menu dishes found.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(d => `
      <tr>
        <td>
          <img src="${d.image}" alt="${d.name}" class="table-thumb" onerror="this.src='images/royal-thaali.jpg'">
        </td>
        <td>
          <strong>${d.name}</strong><br>
          <span style="font-family: var(--font-hindi); color: var(--c-gold); font-size: 0.82rem;">${d.hindi_name || ''}</span>
        </td>
        <td>
          <span style="text-transform: capitalize; color: var(--c-sand-muted);">${d.category}</span>
        </td>
        <td>
          <strong style="color: var(--c-gold-bright);">₹${d.price}</strong>
        </td>
        <td>
          <span class="tag-pill" style="color: ${d.veg ? '#81C784' : '#EF9A9A'}; border-color: ${d.veg ? '#2E7D32' : '#C62828'};">
            ${d.veg ? 'Veg' : 'Non-Veg'}
          </span>
        </td>
        <td>
          ${d.is_signature ? '<span style="color: var(--c-gold-bright); font-weight: 600;">★ Signature</span>' : '<span style="color: #666;">-</span>'}
        </td>
        <td>
          <button class="btn-action-sm btn-edit-dish" data-id="${d.id}">Edit</button>
          <button class="btn-action-sm btn-action-delete btn-delete-dish" data-id="${d.id}">Delete</button>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.btn-edit-dish').forEach(b => {
      b.addEventListener('click', () => this.openDishModal(b.dataset.id));
    });

    tbody.querySelectorAll('.btn-delete-dish').forEach(b => {
      b.addEventListener('click', () => this.handleDeleteDish(b.dataset.id));
    });
  }

  openDishModal(dishId = null) {
    const title = document.getElementById('modal-dish-title');
    this.dishForm.reset();

    if (dishId) {
      title.textContent = 'Edit Menu Dish';
      const dish = this.siteData.dishes.find(d => d.id === dishId);
      if (dish) {
        document.getElementById('dish-id').value = dish.id;
        document.getElementById('dish-name').value = dish.name || '';
        document.getElementById('dish-hindi').value = dish.hindi_name || '';
        document.getElementById('dish-category').value = dish.category || '';
        document.getElementById('dish-price').value = dish.price || 0;
        document.getElementById('dish-veg').value = dish.veg ? 'true' : 'false';
        document.getElementById('dish-desc').value = dish.description || '';
        document.getElementById('dish-ingredients').value = (dish.ingredients || []).join(', ');
        this.dishImageInput.value = dish.image || '';
        this.dishPreviewImg.src = dish.image || 'images/royal-thaali.jpg';
        document.getElementById('dish-signature').checked = !!dish.is_signature;
      }
    } else {
      title.textContent = 'Add New Menu Dish';
      document.getElementById('dish-id').value = '';
      this.dishImageInput.value = 'images/royal-thaali.jpg';
      this.dishPreviewImg.src = 'images/royal-thaali.jpg';
    }

    this.dishModal.showModal();
  }

  async handleSaveDish(e) {
    e.preventDefault();
    const ingredientsRaw = document.getElementById('dish-ingredients').value;
    const ingredients = ingredientsRaw.split(',').map(s => s.trim()).filter(Boolean);

    const dishPayload = {
      id: document.getElementById('dish-id').value || null,
      name: document.getElementById('dish-name').value.trim(),
      hindi_name: document.getElementById('dish-hindi').value.trim(),
      category: document.getElementById('dish-category').value,
      price: parseInt(document.getElementById('dish-price').value, 10),
      veg: document.getElementById('dish-veg').value === 'true',
      description: document.getElementById('dish-desc').value.trim(),
      ingredients: ingredients,
      image: this.dishImageInput.value.trim() || 'images/royal-thaali.jpg',
      is_signature: document.getElementById('dish-signature').checked
    };

    try {
      const res = await fetch('/api/dishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save', dish: dishPayload })
      });
      const data = await res.json();
      if (data.success) {
        this.dishModal.close();
        this.showToast('Dish entry successfully saved live!');
        await this.loadData();
      }
    } catch (err) {
      alert('Error saving dish: ' + err.message);
    }
  }

  async handleDeleteDish(dishId) {
    if (!confirm('Are you certain you wish to remove this dish entry from the menu?')) return;

    try {
      const res = await fetch('/api/dishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', dish: { id: dishId } })
      });
      const data = await res.json();
      if (data.success) {
        this.showToast('Dish deleted successfully.');
        await this.loadData();
      }
    } catch (err) {
      alert('Error deleting dish: ' + err.message);
    }
  }

  // =========================================================================
  // 5. MENU CATEGORIES CRUD
  // =========================================================================
  renderCategoriesTable() {
    const tbody = document.getElementById('categories-table-body');
    if (!tbody || !this.siteData || !this.siteData.categories) return;

    tbody.innerHTML = this.siteData.categories.map(c => `
      <tr>
        <td style="font-size: 1.4rem;">${c.icon || '🍽️'}</td>
        <td><code>${c.id}</code></td>
        <td><strong>${c.name}</strong></td>
        <td style="font-family: var(--font-hindi); color: var(--c-gold);">${c.hindi_name || ''}</td>
        <td style="font-size: 0.82rem; color: var(--c-sand-muted); max-width: 320px;">${c.description || ''}</td>
        <td>
          <button class="btn-action-sm btn-edit-cat" data-id="${c.id}">Edit</button>
          <button class="btn-action-sm btn-action-delete btn-delete-cat" data-id="${c.id}">Delete</button>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.btn-edit-cat').forEach(b => {
      b.addEventListener('click', () => this.openCatModal(b.dataset.id));
    });

    tbody.querySelectorAll('.btn-delete-cat').forEach(b => {
      b.addEventListener('click', () => this.handleDeleteCategory(b.dataset.id));
    });
  }

  openCatModal(catId = null) {
    const title = document.getElementById('modal-cat-title');
    this.catForm.reset();

    if (catId) {
      title.textContent = 'Edit Menu Category';
      const cat = this.siteData.categories.find(c => c.id === catId);
      if (cat) {
        document.getElementById('cat-id').value = cat.id;
        document.getElementById('cat-name').value = cat.name;
        document.getElementById('cat-hindi').value = cat.hindi_name || '';
        document.getElementById('cat-icon').value = cat.icon || '👑';
        document.getElementById('cat-cue').value = cat.cue || '';
        document.getElementById('cat-desc').value = cat.description || '';
      }
    } else {
      title.textContent = 'Add New Category';
      document.getElementById('cat-id').value = '';
    }

    this.catModal.showModal();
  }

  async handleSaveCategory(e) {
    e.preventDefault();
    const catPayload = {
      id: document.getElementById('cat-id').value.trim() || undefined,
      name: document.getElementById('cat-name').value.trim(),
      hindi_name: document.getElementById('cat-hindi').value.trim(),
      icon: document.getElementById('cat-icon').value.trim(),
      cue: document.getElementById('cat-cue').value.trim(),
      description: document.getElementById('cat-desc').value.trim()
    };

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save', category: catPayload })
      });
      const data = await res.json();
      if (data.success) {
        this.catModal.close();
        this.showToast('Category saved successfully!');
        await this.loadData();
      }
    } catch (err) {
      alert('Error saving category: ' + err.message);
    }
  }

  async handleDeleteCategory(catId) {
    if (!confirm('Delete this menu category? Dishes under this category may become orphaned.')) return;
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', category: { id: catId } })
      });
      const data = await res.json();
      if (data.success) {
        this.showToast('Category deleted successfully.');
        await this.loadData();
      }
    } catch (err) {
      alert('Error deleting category: ' + err.message);
    }
  }

  // =========================================================================
  // 6. AMBIENCE GALLERY CRUD
  // =========================================================================
  renderAmbienceGallery() {
    const grid = document.getElementById('ambience-gallery-grid');
    if (!grid || !this.siteData) return;

    const gallery = this.siteData.ambience_gallery || [];
    grid.innerHTML = gallery.map(item => `
      <div class="media-item-card">
        <img src="${item.image}" alt="${item.title}" class="media-item-preview" onerror="this.src='images/haveli-courtyard.jpg'">
        <div class="media-item-details">
          <div>
            <strong style="font-size: 0.95rem; color: var(--c-sand-light); display: block; margin-bottom: 0.3rem;">
              ${item.title}
            </strong>
            <p style="font-size: 0.78rem; color: var(--c-sand-muted); margin: 0 0 0.8rem; line-height: 1.4;">
              ${item.caption}
            </p>
          </div>
          <div style="display: flex; gap: 0.4rem; justify-content: flex-end;">
            <button class="btn-action-sm btn-edit-gallery" data-id="${item.id}">Edit</button>
            <button class="btn-action-sm btn-action-delete btn-delete-gallery" data-id="${item.id}">Delete</button>
          </div>
        </div>
      </div>
    `).join('');

    grid.querySelectorAll('.btn-edit-gallery').forEach(b => {
      b.addEventListener('click', () => this.openGalleryModal(b.dataset.id));
    });

    grid.querySelectorAll('.btn-delete-gallery').forEach(b => {
      b.addEventListener('click', () => this.handleDeleteGallery(b.dataset.id));
    });
  }

  openGalleryModal(itemId = null) {
    const title = document.getElementById('modal-gallery-title');
    this.galleryForm.reset();

    if (itemId) {
      title.textContent = 'Edit Ambience Photo';
      const item = (this.siteData.ambience_gallery || []).find(g => g.id === itemId);
      if (item) {
        document.getElementById('gallery-id').value = item.id;
        document.getElementById('gallery-title').value = item.title;
        document.getElementById('gallery-caption').value = item.caption;
        this.galleryImageInput.value = item.image;
        this.galleryPreviewImg.src = item.image;
      }
    } else {
      title.textContent = 'Add Ambience Photo';
      document.getElementById('gallery-id').value = '';
      this.galleryImageInput.value = 'images/haveli-courtyard.jpg';
      this.galleryPreviewImg.src = 'images/haveli-courtyard.jpg';
    }

    this.galleryModal.showModal();
  }

  async handleSaveGallery(e) {
    e.preventDefault();
    const id = document.getElementById('gallery-id').value || `ambience-${Date.now()}`;
    const newItem = {
      id: id,
      title: document.getElementById('gallery-title').value.trim(),
      caption: document.getElementById('gallery-caption').value.trim(),
      image: this.galleryImageInput.value.trim()
    };

    let gallery = (this.siteData.ambience_gallery || []).slice();
    const idx = gallery.findIndex(g => g.id === id);
    if (idx >= 0) {
      gallery[idx] = newItem;
    } else {
      gallery.push(newItem);
    }

    try {
      const res = await fetch('/api/update-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: 'ambience_gallery', data: gallery })
      });
      const data = await res.json();
      if (data.success) {
        this.galleryModal.close();
        this.showToast('Ambience gallery item saved live!');
        await this.loadData();
      }
    } catch (err) {
      alert('Error updating gallery: ' + err.message);
    }
  }

  async handleDeleteGallery(itemId) {
    if (!confirm('Remove this photo from the ambience gallery?')) return;
    let gallery = (this.siteData.ambience_gallery || []).filter(g => g.id !== itemId);
    try {
      const res = await fetch('/api/update-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: 'ambience_gallery', data: gallery })
      });
      const data = await res.json();
      if (data.success) {
        this.showToast('Gallery item removed.');
        await this.loadData();
      }
    } catch (err) {
      alert('Error deleting gallery item: ' + err.message);
    }
  }

  // =========================================================================
  // 7. CUSTOMER REVIEWS & TESTIMONIALS
  // =========================================================================
  renderReviewsList() {
    const container = document.getElementById('reviews-list-container');
    if (!container || !this.siteData) return;

    const reviews = this.siteData.reviews || [];
    container.innerHTML = reviews.map(r => `
      <div style="background: #110E0C; border: 1px solid rgba(198,154,72,0.25); border-radius: 6px; padding: 1.5rem; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
            <div>
              <strong style="color: var(--c-sand-light); font-size: 1rem;">${r.name}</strong><br>
              <small style="color: var(--c-sand-muted);">${r.designation || ''}</small>
            </div>
            <div style="color: var(--c-gold-bright); font-size: 0.95rem;">
              ${'★'.repeat(r.rating || 5)}
            </div>
          </div>

          <h4 style="font-family: var(--font-serif); font-size: 1.05rem; color: var(--c-gold-bright); margin: 0.8rem 0 0.4rem;">
            "${r.title}"
          </h4>
          <p style="font-size: 0.84rem; color: var(--c-sand-muted); line-height: 1.5; margin-bottom: 1rem;">
            ${r.body}
          </p>
        </div>

        <div>
          <small style="color: #888; display: block; margin-bottom: 0.8rem;">${r.occasion || ''}</small>
          <div style="display: flex; gap: 0.4rem; justify-content: flex-end;">
            <button class="btn-action-sm btn-edit-review" data-id="${r.id}">Edit</button>
            <button class="btn-action-sm btn-action-delete btn-delete-review" data-id="${r.id}">Delete</button>
          </div>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.btn-edit-review').forEach(b => {
      b.addEventListener('click', () => this.openReviewModal(b.dataset.id));
    });

    container.querySelectorAll('.btn-delete-review').forEach(b => {
      b.addEventListener('click', () => this.handleDeleteReview(b.dataset.id));
    });
  }

  openReviewModal(reviewId = null) {
    const title = document.getElementById('modal-review-title');
    this.reviewForm.reset();

    if (reviewId) {
      title.textContent = 'Edit Customer Review';
      const rev = (this.siteData.reviews || []).find(r => r.id === reviewId);
      if (rev) {
        document.getElementById('review-id').value = rev.id;
        document.getElementById('review-guest-name').value = rev.name;
        document.getElementById('review-designation').value = rev.designation || '';
        document.getElementById('review-rating').value = rev.rating || '5';
        document.getElementById('review-category').value = rev.category || 'celebrations';
        document.getElementById('review-headline').value = rev.title || '';
        document.getElementById('review-body').value = rev.body || '';
        document.getElementById('review-occasion').value = rev.occasion || '';
      }
    } else {
      title.textContent = 'Add Customer Review';
      document.getElementById('review-id').value = '';
    }

    this.reviewModal.showModal();
  }

  async handleSaveReview(e) {
    e.preventDefault();
    const id = document.getElementById('review-id').value || `rev-${Date.now()}`;
    const newRev = {
      id: id,
      name: document.getElementById('review-guest-name').value.trim(),
      designation: document.getElementById('review-designation').value.trim(),
      rating: parseInt(document.getElementById('review-rating').value, 10),
      category: document.getElementById('review-category').value,
      title: document.getElementById('review-headline').value.trim(),
      body: document.getElementById('review-body').value.trim(),
      occasion: document.getElementById('review-occasion').value.trim()
    };

    let reviews = (this.siteData.reviews || []).slice();
    const idx = reviews.findIndex(r => r.id === id);
    if (idx >= 0) {
      reviews[idx] = newRev;
    } else {
      reviews.unshift(newRev);
    }

    try {
      const res = await fetch('/api/update-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: 'reviews', data: reviews })
      });
      const data = await res.json();
      if (data.success) {
        this.reviewModal.close();
        this.showToast('Customer review saved live!');
        await this.loadData();
      }
    } catch (err) {
      alert('Error saving review: ' + err.message);
    }
  }

  async handleDeleteReview(reviewId) {
    if (!confirm('Remove this customer testimonial from the site?')) return;
    let reviews = (this.siteData.reviews || []).filter(r => r.id !== reviewId);
    try {
      const res = await fetch('/api/update-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: 'reviews', data: reviews })
      });
      const data = await res.json();
      if (data.success) {
        this.showToast('Review removed.');
        await this.loadData();
      }
    } catch (err) {
      alert('Error deleting review: ' + err.message);
    }
  }

  // =========================================================================
  // 8. RESTAURANT CONTACT & HOURS
  // =========================================================================
  populateRestaurantForm() {
    const rest = this.siteData.restaurant || {};
    document.getElementById('rest-phone').value = rest.phone || '';
    document.getElementById('rest-email').value = rest.email || '';
    document.getElementById('rest-address').value = rest.address || '';
    document.getElementById('rest-maps').value = rest.maps || '';
    document.getElementById('rest-instagram').value = rest.instagram || '';
    if (document.getElementById('rest-rating')) {
      document.getElementById('rest-rating').value = rest.rating || 4.8;
    }
    if (document.getElementById('rest-reviews-count')) {
      document.getElementById('rest-reviews-count').value = rest.reviews_count || 532;
    }
    if (document.getElementById('rest-price-range')) {
      document.getElementById('rest-price-range').value = rest.price_range || '₹200–400';
    }
    document.getElementById('rest-hours-lunch').value = rest.hours ? rest.hours.lunch : '';
    document.getElementById('rest-hours-dinner').value = rest.hours ? rest.hours.dinner : '';
    document.getElementById('rest-hours-days').value = rest.hours ? rest.hours.days : 'Every Day of the Week';
  }

  async handleSaveRestaurant(e) {
    e.preventDefault();
    const restPayload = {
      phone: document.getElementById('rest-phone').value.trim(),
      email: document.getElementById('rest-email').value.trim(),
      address: document.getElementById('rest-address').value.trim(),
      maps: document.getElementById('rest-maps').value.trim(),
      instagram: document.getElementById('rest-instagram').value.trim(),
      rating: document.getElementById('rest-rating') ? parseFloat(document.getElementById('rest-rating').value) || 4.8 : 4.8,
      reviews_count: document.getElementById('rest-reviews-count') ? parseInt(document.getElementById('rest-reviews-count').value, 10) || 532 : 532,
      price_range: document.getElementById('rest-price-range') ? document.getElementById('rest-price-range').value.trim() : '₹200–400',
      hours: {
        lunch: document.getElementById('rest-hours-lunch').value.trim(),
        dinner: document.getElementById('rest-hours-dinner').value.trim(),
        days: document.getElementById('rest-hours-days').value.trim()
      }
    };

    try {
      const res = await fetch('/api/restaurant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurant: restPayload })
      });
      const data = await res.json();
      if (data.success) {
        this.showToast('Contact and operating hours updated live!');
        await this.loadData();
      }
    } catch (err) {
      alert('Error saving contact details: ' + err.message);
    }
  }

  // =========================================================================
  // 9. VISUAL MEDIA ASSET LIBRARY
  // =========================================================================
  async loadMediaLibrary() {
    const grid = document.getElementById('media-library-grid');
    if (!grid) return;

    grid.innerHTML = '<div style="color: var(--c-sand-muted); padding: 1rem;">Loading images from server...</div>';

    try {
      const res = await fetch('/api/media');
      const data = await res.json();

      if (data.success && data.media) {
        if (data.media.length === 0) {
          grid.innerHTML = '<div style="color: var(--c-sand-muted); padding: 1rem;">No images found in images/ directory.</div>';
          return;
        }

        grid.innerHTML = data.media.map(file => {
          const sizeKb = Math.round(file.size / 1024);
          return `
            <div class="media-item-card">
              <img src="${file.url}" alt="${file.name}" class="media-item-preview" loading="lazy">
              <div class="media-item-details">
                <div>
                  <div class="media-item-name" title="${file.name}">${file.name}</div>
                  <span style="font-size: 0.7rem; color: var(--c-sand-muted);">${sizeKb} KB</span>
                </div>
                <div style="display: flex; gap: 0.3rem; margin-top: 0.6rem;">
                  <button class="btn-action-sm btn-copy-path" data-url="${file.url}" style="width: 100%; text-align: center;">
                    📋 Copy Path
                  </button>
                </div>
              </div>
            </div>
          `;
        }).join('');

        grid.querySelectorAll('.btn-copy-path').forEach(btn => {
          btn.addEventListener('click', () => {
            navigator.clipboard.writeText(btn.dataset.url).then(() => {
              this.showToast(`Copied "${btn.dataset.url}" to clipboard!`);
            });
          });
        });
      }
    } catch (err) {
      grid.innerHTML = '<div style="color: #EF9A9A; padding: 1rem;">Error loading media library.</div>';
    }
  }

  uploadGenericImage(file, callback) {
    const reader = new FileReader();
    reader.onload = async (event) => {
      const b64 = event.target.result;
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, data: b64 })
        });
        const data = await res.json();
        if (data.success && callback) {
          callback(data.url);
        }
      } catch (err) {
        alert('Upload failed: ' + err.message);
      }
    };
    reader.readAsDataURL(file);
  }

  async uploadMultipleMedia(files) {
    let count = 0;
    for (const file of files) {
      await new Promise((resolve) => {
        this.uploadGenericImage(file, () => {
          count++;
          resolve();
        });
      });
    }
    this.showToast(`Successfully uploaded ${count} image(s)!`);
    this.loadMediaLibrary();
  }

  // =========================================================================
  // 10. RESERVATIONS MONITOR
  // =========================================================================
  renderReservations() {
    const tbody = document.getElementById('reservations-table-body');
    const countSpan = document.getElementById('res-count');
    if (!tbody || !this.siteData) return;

    const reservations = this.siteData.reservations || [];
    if (countSpan) countSpan.textContent = reservations.length;

    if (reservations.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: #888; padding: 2rem;">No table reservations on record.</td></tr>`;
      return;
    }

    tbody.innerHTML = reservations.map(r => `
      <tr>
        <td><strong style="color: var(--c-gold-bright);">${r.id}</strong></td>
        <td>
          <strong>${r.guest_name || 'Royal Guest'}</strong>
          ${r.notes ? `<br><small style="color: #C2B69D;">Note: ${r.notes}</small>` : ''}
        </td>
        <td>
          ${r.phone || 'Direct Inquiry'}<br>
          <small style="color: var(--c-sand-muted);">${r.email || ''}</small>
        </td>
        <td>
          ${r.date || 'Flexible'}<br>
          <small style="color: var(--c-gold);">${r.time || 'Evening Feast'}</small>
        </td>
        <td>${r.guests ? r.guests + ' Guests' : 'Party / Event'}</td>
        <td>${r.seating || 'Royal Courtyard'}</td>
        <td>
          <span class="tag-pill" style="color: ${r.status === 'Cancelled' ? '#EF9A9A' : r.status === 'Seated' ? '#90CAF9' : '#A5D6A7'}; border-color: currentColor;">
            ${r.status || 'Confirmed'}
          </span>
        </td>
        <td>
          <select class="form-select status-changer" data-id="${r.id}" style="padding: 0.3rem 0.6rem; font-size: 0.75rem; width: auto;">
            <option value="Inquiry Received" ${r.status === 'Inquiry Received' ? 'selected' : ''}>Inquiry Received</option>
            <option value="Confirmed" ${r.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
            <option value="Seated" ${r.status === 'Seated' ? 'selected' : ''}>Seated</option>
            <option value="Completed" ${r.status === 'Completed' ? 'selected' : ''}>Completed</option>
            <option value="Cancelled" ${r.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
          </select>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.status-changer').forEach(select => {
      select.addEventListener('change', (e) => this.handleUpdateReservationStatus(select.dataset.id, e.target.value));
    });
  }

  async handleUpdateReservationStatus(resId, newStatus) {
    try {
      const res = await fetch('/api/reservations/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: resId, status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        this.showToast(`Booking ${resId} marked as ${newStatus}`);
        await this.loadData();
      }
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  }

  // =========================================================================
  // 11. SETTINGS & BACKUPS
  // =========================================================================
  async handleChangePassword(e) {
    e.preventDefault();
    const newPw = document.getElementById('new-admin-password').value;
    const confirmPw = document.getElementById('confirm-admin-password').value;

    if (newPw !== confirmPw) {
      alert('Passphrase confirmation does not match.');
      return;
    }

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_password: newPw })
      });
      const data = await res.json();
      if (data.success) {
        this.changePwForm.reset();
        this.showToast('Admin passphrase changed successfully!');
      } else {
        alert(data.error || 'Failed to update passphrase.');
      }
    } catch (err) {
      alert('Error updating passphrase: ' + err.message);
    }
  }

  downloadBackup() {
    if (!this.siteData) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(this.siteData, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `rajasthani_tadka_backup_${Date.now()}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
    this.showToast('Full JSON site backup downloaded!');
  }

  restoreBackup() {
    const file = this.backupFileInput.files[0];
    if (!file) {
      alert('Please select a valid .json backup file first.');
      return;
    }

    if (!confirm('Warning: Restoring backup will overwrite all current site data. Continue?')) {
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const backupJson = JSON.parse(e.target.result);
        const res = await fetch('/api/backup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'restore', backup: backupJson })
        });
        const data = await res.json();
        if (data.success) {
          this.showToast('Site data successfully restored!');
          await this.loadData();
        } else {
          alert('Restore failed: ' + (data.error || 'Invalid backup format'));
        }
      } catch (err) {
        alert('Invalid JSON file format: ' + err.message);
      }
    };
    reader.readAsText(file);
  }

  showToast(message) {
    this.toast.textContent = message;
    this.toast.style.display = 'block';
    setTimeout(() => {
      this.toast.style.display = 'none';
    }, 3500);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => { window.adminPortal = new AdminPortal(); });
} else {
  window.adminPortal = new AdminPortal();
}
