/**
 * RAJASTHANI TADKA — MAIN APPLICATION CONTROLLER
 * Fetches dynamic data, hydrates editorial carousels, wires navigation,
 * and coordinates micro-interactions.
 */

class TadkaApp {
  constructor() {
    this.siteData = null;
    this.init();
  }

  async init() {
    this.initHeaderScroll();
    await this.fetchSiteData();
    this.initHorizontalScroller();
    this.initScrollReveals();
    this.initReviews();
    this.initMusicWidget();
    this.initAmbienceLightbox();
  }

  initHeaderScroll() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 60) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  async fetchSiteData() {
    try {
      let res = await fetch('/api/data');
      if (!res.ok) {
        res = await fetch('data/site-data.json');
      }
      const json = await res.json();
      const data = json.data || json;
      if (data) {
        this.siteData = data;
        this.hydrateWebsiteContent();
        this.renderEditorialFoodCards();

        // Pass dishes to menu experience
        if (window.menuExperience && typeof window.menuExperience.setDishesData === 'function') {
          window.menuExperience.setDishesData(this.siteData.dishes || []);
        }
      }
    } catch (e) {
      console.warn('Unable to load dynamic site data from API, using local fallback:', e);
      try {
        const fallbackRes = await fetch('data/site-data.json');
        const fallbackJson = await fallbackRes.json();
        this.siteData = fallbackJson.data || fallbackJson;
        this.hydrateWebsiteContent();
        this.renderEditorialFoodCards();
        if (window.menuExperience && typeof window.menuExperience.setDishesData === 'function') {
          window.menuExperience.setDishesData(this.siteData.dishes || []);
        }
      } catch (err2) {
        console.warn('Fallback data loading also failed:', err2);
      }
    }
  }

  hydrateWebsiteContent() {
    if (!this.siteData) return;

    // 1. Dynamic Brand Logo across all website instances
    const rest = this.siteData.restaurant || {};
    const logoUrl = rest.logo || 'images/logo.svg';

    document.querySelectorAll('.site-logo-img, .header-logo-icon, img[src*="logo.svg"], img[alt*="Rajasthani Tadka Logo"], img[alt*="Royal Crest"], img[alt*="Brand Seal"]').forEach(img => {
      img.src = logoUrl;
    });

    const favicon = document.querySelector('link[rel="icon"]');
    if (favicon) favicon.href = logoUrl;

    // 2. Brand Name & Hindi Tagline
    if (rest.name) {
      document.querySelectorAll('.brand-title').forEach(el => el.textContent = rest.name);
    }
    if (rest.hindi_name || rest.tagline) {
      document.querySelectorAll('.brand-hindi').forEach(el => el.textContent = rest.hindi_name || rest.tagline);
    }

    // 3. Hero Section Copy & Background Image
    const hero = this.siteData.hero || {};
    if (hero.headline) {
      const heroH1 = document.querySelector('.hero-hindi-headline');
      if (heroH1) heroH1.textContent = hero.headline;
    }
    if (hero.subline) {
      const heroSub = document.querySelector('.hero-subline');
      if (heroSub) heroSub.textContent = hero.subline;
    }
    if (hero.cta_explore) {
      const exploreBtn = document.querySelector('.hero-actions a.btn-gold-outline');
      if (exploreBtn) exploreBtn.innerHTML = `${hero.cta_explore} &darr;`;
    }
    if (hero.cta_menu) {
      const menuBtn = document.getElementById('hero-btn-menu');
      if (menuBtn) menuBtn.textContent = hero.cta_menu;
    }
    if (hero.bg_image) {
      const desertHorizon = document.querySelector('.desert-horizon-layer');
      if (desertHorizon) desertHorizon.style.backgroundImage = `url('${hero.bg_image}')`;
    }

    // 4. Scrollytelling Heritage Journey Stages
    if (this.siteData.story && this.siteData.story.stages) {
      const stageCards = document.querySelectorAll('.journey-stage-card');
      this.siteData.story.stages.forEach((st, idx) => {
        if (stageCards[idx]) {
          const stepEl = stageCards[idx].querySelector('.journey-stage-step');
          const titleEl = stageCards[idx].querySelector('.journey-stage-title');
          const bodyEl = stageCards[idx].querySelector('.journey-stage-body');
          if (stepEl && st.step) stepEl.innerHTML = st.step;
          if (titleEl && st.title) titleEl.textContent = st.title;
          if (bodyEl && st.body) bodyEl.textContent = st.body;
        }
      });
    }

    // 5. Ambience & Heritage Gallery Cards
    if (this.siteData.ambience_gallery && this.siteData.ambience_gallery.length) {
      const ambienceGrid = document.querySelector('.ambience-grid');
      if (ambienceGrid) {
        const badges = ['०१ • प्रांगण', '०२ • रोशनी', '०३ • कुंभकार', '०४ • भित्तिचित्र'];
        ambienceGrid.innerHTML = this.siteData.ambience_gallery.map((item, idx) => {
          const badge = badges[idx] || `०${idx + 1} • धरोहर`;
          return `
          <div class="ambience-card" data-idx="${idx}" tabindex="0" role="button" aria-label="View photo of ${item.title}">
            <div class="ambience-card-crest">
              <span class="ambience-crest-badge">${badge}</span>
              <span class="ambience-zoom-hint" aria-hidden="true">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
              </span>
            </div>
            <div class="ambience-img-wrapper">
              <img src="${item.image}" alt="${item.title}" class="ambience-img" loading="lazy" onerror="this.src='images/haveli-courtyard.jpg'">
            </div>
            <div class="ambience-card-overlay">
              <span class="ambience-tag-micro">HAVELI VIGNETTE</span>
              <h3 class="ambience-card-title">${item.title}</h3>
              <p class="ambience-card-caption">${item.caption}</p>
            </div>
          </div>
        `;
        }).join('');
      }
    }

    // 6. Contact Details, Address & Hours in Location & Footer
    const displayPhone = rest.phone_display || rest.phone || '081155 96663';
    if (rest.phone) {
      document.querySelectorAll('a[href^="tel:"]').forEach(el => {
        el.href = `tel:${rest.phone.replace(/\s+/g, '')}`;
        el.textContent = el.textContent.includes('📞') ? `📞 ${displayPhone}` : displayPhone;
      });
    }
    if (rest.email) {
      document.querySelectorAll('a[href^="mailto:"]').forEach(el => {
        el.href = `mailto:${rest.email}`;
        el.textContent = rest.email;
      });
    }
    if (rest.address) {
      const locAddr = document.querySelector('.location-feature-card p');
      if (locAddr) locAddr.innerHTML = rest.address.replace('Bansgaon Colony,', 'Bansgaon Colony,<br>');
      const intakeAddr = document.querySelector('.intake-contact-item .contact-text');
      if (intakeAddr) intakeAddr.textContent = rest.address;
      const footerAddr = document.querySelector('.footer-brand-col p');
      if (footerAddr) footerAddr.textContent = rest.address;
    }
    if (rest.maps_embed) {
      const mapIframe = document.querySelector('.map-embed-wrapper iframe');
      if (mapIframe) mapIframe.src = rest.maps_embed;
    }
    if (rest.rating) {
      const bigScore = document.querySelector('.rating-big-score');
      if (bigScore) bigScore.textContent = rest.rating.toFixed(1);
    }
    if (rest.reviews_count) {
      const countEl = document.querySelector('.rating-count-text');
      if (countEl) {
        countEl.innerHTML = `${rest.rating || 4.8} ★ ${rest.reviews_count} Google Reviews &bull; ${rest.price_range || '₹200–400'}`;
      }
      const allFilterPill = document.querySelector('.review-filter-pill[data-filter="all"]');
      if (allFilterPill) allFilterPill.textContent = `All Reviews (${rest.reviews_count}+)`;
    }
    if (rest.hours) {
      const fullHours = rest.hours.full || '10:00 AM – 11:00 PM';
      const lunchEl = document.querySelector('.timings-row:nth-child(2) .timings-hours');
      if (lunchEl) lunchEl.textContent = fullHours;
    }
    if (rest.instagram) {
      document.querySelectorAll('a[href*="instagram.com"]').forEach(el => {
        el.href = rest.instagram;
        if (el.textContent.includes('@rajasthani')) {
          el.textContent = rest.instagram_handle || '@rajasthani__tadka';
        }
      });
    }
    if (rest.maps) {
      document.querySelectorAll('a[href*="maps.google.com"]').forEach(el => {
        el.href = rest.maps;
      });
    }
  }

  renderEditorialFoodCards() {
    const track = document.getElementById('editorial-cards-track');
    if (!track || !this.siteData || !this.siteData.dishes) return;

    // Signature items across categories for the main homepage journey
    const showcaseDishes = this.siteData.dishes.filter(d =>
      ['dal-baati-churma', 'gatte-ki-sabzi', 'ker-sangri', 'laal-maas', 'thali-maharaja', 'rajasthani-kadhi', 'bajre-ki-roti'].includes(d.id)
    );

    track.innerHTML = showcaseDishes.map(dish => `
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
            <span class="dish-explore-hint">Explore Dish <span>&rarr;</span></span>
            ${dish.is_signature ? '<span class="tag-badge tag-signature" style="font-size:0.65rem;">Royal Signature</span>' : ''}
          </div>
        </div>
      </div>
    `).join('');

    // Attach click listeners to cards
    track.querySelectorAll('.dish-card').forEach(card => {
      card.addEventListener('click', () => {
        if (window.menuExperience && typeof window.menuExperience.openDishModalById === 'function') {
          window.menuExperience.openDishModalById(card.dataset.dishId);
        }
      });
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (window.menuExperience) {
            window.menuExperience.openDishModalById(card.dataset.dishId);
          }
        }
      });
    });
  }



  initHorizontalScroller() {
    const track = document.getElementById('editorial-cards-track');
    if (!track) return;

    // Smooth horizontal mouse wheel scroll conversion
    track.addEventListener('wheel', (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        // Only divert horizontal if user is hovering within track and not at boundary
        const maxScrollLeft = track.scrollWidth - track.clientWidth;
        if ((e.deltaY > 0 && track.scrollLeft < maxScrollLeft) || (e.deltaY < 0 && track.scrollLeft > 0)) {
          e.preventDefault();
          track.scrollLeft += e.deltaY * 1.5;
        }
      }
    }, { passive: false });

    // Drag-to-scroll support for desktop
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    track.addEventListener('mousedown', (e) => {
      isDown = true;
      track.classList.add('is-dragging');
      startX = e.pageX - track.offsetLeft;
      scrollLeft = track.scrollLeft;
    });

    track.addEventListener('mouseleave', () => {
      isDown = false;
      track.classList.remove('is-dragging');
    });

    track.addEventListener('mouseup', () => {
      isDown = false;
      track.classList.remove('is-dragging');
    });

    track.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - track.offsetLeft;
      const walk = (x - startX) * 1.8;
      track.scrollLeft = scrollLeft - walk;
    });
  }

  initScrollReveals() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    document.querySelectorAll('.journey-stage-card, .culture-card, .review-card, .ambience-card, .location-map-card, .location-feature-card, .location-cta-card, .reservation-card').forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = 'opacity 0.8s cubic-bezier(0.25, 1, 0.35, 1), transform 0.8s cubic-bezier(0.25, 1, 0.35, 1)';
      observer.observe(el);
    });

    // Helper reveal class
    const style = document.createElement('style');
    style.textContent = `
      .is-revealed {
        opacity: 1 !important;
        transform: translateY(0) !important;
      }
    `;
    document.head.appendChild(style);
  }

  initReviews() {
    // Sliding Drawer Controls
    const btnToggleReviews = document.getElementById('btn-toggle-reviews');
    const slidingDrawer = document.getElementById('reviews-sliding-drawer');
    const sliderTrack = document.getElementById('reviews-slider-track');
    const arrowPrev = document.getElementById('reviews-arrow-prev');
    const arrowNext = document.getElementById('reviews-arrow-next');
    const paginationContainer = document.getElementById('reviews-pagination-dots');

    const openDrawer = (smoothScroll = false) => {
      if (!slidingDrawer) return;
      slidingDrawer.classList.add('is-open');
      if (btnToggleReviews) {
        btnToggleReviews.classList.add('is-active');
        btnToggleReviews.setAttribute('aria-expanded', 'true');
        const label = btnToggleReviews.querySelector('.toggle-label');
        if (label) label.textContent = 'SLIDE CLOSE REVIEWS';
      }
      if (smoothScroll) {
        slidingDrawer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    const closeDrawer = () => {
      if (!slidingDrawer) return;
      slidingDrawer.classList.remove('is-open');
      if (btnToggleReviews) {
        btnToggleReviews.classList.remove('is-active');
        btnToggleReviews.setAttribute('aria-expanded', 'false');
        const label = btnToggleReviews.querySelector('.toggle-label');
        if (label) label.textContent = 'SLIDE OPEN REVIEWS';
      }
    };

    if (btnToggleReviews && slidingDrawer) {
      btnToggleReviews.addEventListener('click', () => {
        const isOpen = slidingDrawer.classList.contains('is-open');
        if (isOpen) {
          closeDrawer();
        } else {
          openDrawer(false);
        }
      });
    }

    // Auto-open when user clicks header navigation #reviews or loads with #reviews
    document.querySelectorAll('a[href="#reviews"]').forEach(link => {
      link.addEventListener('click', () => {
        setTimeout(() => openDrawer(false), 200);
      });
    });

    if (window.location.hash === '#reviews') {
      setTimeout(() => openDrawer(false), 400);
    }

    // Carousel Slider Logic
    const getScrollStep = () => {
      if (!sliderTrack) return 380;
      const firstCard = sliderTrack.querySelector('.review-card:not([style*="display: none"])');
      if (firstCard) {
        const style = window.getComputedStyle(sliderTrack);
        const gap = parseFloat(style.gap) || 28;
        return firstCard.offsetWidth + gap;
      }
      return sliderTrack.clientWidth * 0.75;
    };

    const updatePagination = () => {
      if (!paginationContainer || !sliderTrack) return;
      const visibleCards = Array.from(sliderTrack.querySelectorAll('.review-card')).filter(
        c => c.style.display !== 'none'
      );
      paginationContainer.innerHTML = '';
      if (visibleCards.length <= 1) return;

      visibleCards.forEach((card, idx) => {
        const dot = document.createElement('button');
        dot.className = `dot ${idx === 0 ? 'is-active' : ''}`;
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', `Go to review ${idx + 1}`);
        dot.addEventListener('click', () => {
          const step = getScrollStep();
          sliderTrack.scrollTo({
            left: idx * step,
            behavior: 'smooth'
          });
        });
        paginationContainer.appendChild(dot);
      });
    };

    const syncActiveDot = () => {
      if (!paginationContainer || !sliderTrack) return;
      const dots = paginationContainer.querySelectorAll('.dot');
      if (!dots.length) return;
      const step = getScrollStep();
      const activeIndex = Math.min(
        Math.max(0, Math.round(sliderTrack.scrollLeft / step)),
        dots.length - 1
      );
      dots.forEach((dot, idx) => {
        dot.classList.toggle('is-active', idx === activeIndex);
        dot.setAttribute('aria-selected', idx === activeIndex ? 'true' : 'false');
      });
    };

    if (sliderTrack) {
      if (arrowPrev) {
        arrowPrev.addEventListener('click', () => {
          sliderTrack.scrollBy({ left: -getScrollStep(), behavior: 'smooth' });
        });
      }

      if (arrowNext) {
        arrowNext.addEventListener('click', () => {
          sliderTrack.scrollBy({ left: getScrollStep(), behavior: 'smooth' });
        });
      }

      let scrollTicking = false;
      sliderTrack.addEventListener('scroll', () => {
        if (!scrollTicking) {
          requestAnimationFrame(() => {
            syncActiveDot();
            scrollTicking = false;
          });
          scrollTicking = true;
        }
      });

      // Mouse Drag-to-Slide Support for Desktop
      let isDown = false;
      let startX = 0;
      let scrollLeft = 0;

      sliderTrack.addEventListener('mousedown', (e) => {
        if (e.target.closest('button, a, input, textarea')) return;
        isDown = true;
        sliderTrack.classList.add('is-dragging');
        startX = e.pageX - sliderTrack.offsetLeft;
        scrollLeft = sliderTrack.scrollLeft;
      });

      window.addEventListener('mouseup', () => {
        if (!isDown) return;
        isDown = false;
        sliderTrack.classList.remove('is-dragging');
      });

      sliderTrack.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - sliderTrack.offsetLeft;
        const walk = (x - startX) * 1.5;
        sliderTrack.scrollLeft = scrollLeft - walk;
      });

      // Initial dots generation
      updatePagination();
    }

    // Category Filter Pills
    const filterPills = document.querySelectorAll('.review-filter-pill');
    const reviewCards = document.querySelectorAll('.reviews-slider-track .review-card');

    filterPills.forEach(pill => {
      pill.addEventListener('click', () => {
        filterPills.forEach(p => {
          p.classList.remove('is-active');
          p.setAttribute('aria-selected', 'false');
        });
        pill.classList.add('is-active');
        pill.setAttribute('aria-selected', 'true');

        const filter = pill.dataset.filter;
        reviewCards.forEach(card => {
          if (filter === 'all' || card.dataset.category === filter) {
            card.style.display = 'flex';
            requestAnimationFrame(() => {
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            });
          } else {
            card.style.opacity = '0';
            card.style.transform = 'translateY(12px)';
            setTimeout(() => {
              if (card.style.opacity === '0') card.style.display = 'none';
              updatePagination();
            }, 300);
          }
        });

        if (sliderTrack) {
          sliderTrack.scrollTo({ left: 0, behavior: 'smooth' });
        }
        setTimeout(updatePagination, 350);
      });
    });

    // Review Dialog controls
    const reviewDialog = document.getElementById('add-review-dialog');
    const btnOpenReview = document.getElementById('btn-open-review-dialog');
    const btnCloseReview = document.getElementById('review-dialog-close');
    const reviewForm = document.getElementById('royal-review-form');
    const starPicker = document.getElementById('star-picker');
    const ratingInput = document.getElementById('review-rating-input');
    const toast = document.getElementById('review-toast');

    if (btnOpenReview && reviewDialog) {
      btnOpenReview.addEventListener('click', () => {
        reviewDialog.showModal();
      });
    }

    if (btnCloseReview && reviewDialog) {
      btnCloseReview.addEventListener('click', () => {
        reviewDialog.close();
      });
    }

    if (reviewDialog) {
      reviewDialog.addEventListener('click', (e) => {
        const rect = reviewDialog.getBoundingClientRect();
        if (
          e.clientX < rect.left ||
          e.clientX > rect.right ||
          e.clientY < rect.top ||
          e.clientY > rect.bottom
        ) {
          reviewDialog.close();
        }
      });
    }

    // Star rating interactive picker
    if (starPicker && ratingInput) {
      const stars = starPicker.querySelectorAll('.picker-star');
      stars.forEach(star => {
        star.addEventListener('click', () => {
          const rating = parseInt(star.dataset.rating, 10);
          ratingInput.value = rating;
          stars.forEach(s => {
            const r = parseInt(s.dataset.rating, 10);
            if (r <= rating) {
              s.classList.add('is-selected');
              s.setAttribute('aria-checked', 'true');
            } else {
              s.classList.remove('is-selected');
              s.setAttribute('aria-checked', 'false');
            }
          });
        });
      });
    }

    // Review Form Submission with Instant Chronicle Addition
    if (reviewForm && reviewDialog) {
      const escapeHtml = (str) => {
        return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
      };

      reviewForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('review-guest-name').value.trim();
        const city = document.getElementById('review-guest-city').value.trim();
        const category = document.getElementById('review-category').value;
        const dish = document.getElementById('review-dish').value.trim();
        const title = document.getElementById('review-title').value.trim();
        const body = document.getElementById('review-body').value.trim();
        const rating = parseInt(ratingInput.value, 10) || 5;

        // Initials for avatar seal
        const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'RG';

        // Stars string
        let starsHtml = '';
        for (let i = 0; i < rating; i++) starsHtml += '<span>★</span>';

        const newCard = document.createElement('article');
        newCard.className = 'review-card culture-card is-revealed';
        newCard.dataset.category = category;
        newCard.style.opacity = '1';
        newCard.style.transform = 'translateY(0)';
        newCard.innerHTML = `
          <span class="review-watermark-quote" aria-hidden="true">“</span>
          <div class="review-card-top">
            <div class="review-card-stars" aria-label="${rating} stars">
              ${starsHtml}
            </div>
            <span class="review-badge">✓ Just In • Verified Guest</span>
          </div>
          <h3 class="review-card-title">${escapeHtml(title)}</h3>
          <p class="review-card-body">"${escapeHtml(body)}"</p>
          <div class="review-card-footer">
            <div class="reviewer-avatar-seal" aria-hidden="true">${initials}</div>
            <div class="reviewer-info">
              <span class="reviewer-name">${escapeHtml(name)}</span>
              <span class="reviewer-designation">${escapeHtml(city)}</span>
              <span class="reviewer-occasion">Just now • ${escapeHtml(dish || 'Royal Dining Experience')}</span>
            </div>
          </div>
        `;

        if (sliderTrack) {
          sliderTrack.prepend(newCard);
          sliderTrack.scrollTo({ left: 0, behavior: 'smooth' });
          openDrawer(false);
          updatePagination();
        }

        reviewForm.reset();
        ratingInput.value = '5';
        if (starPicker) {
          starPicker.querySelectorAll('.picker-star').forEach(s => s.classList.add('is-selected'));
        }

        reviewDialog.close();

        // Celebratory Royal Toast
        if (toast) {
          toast.classList.add('show');
          setTimeout(() => {
            toast.classList.remove('show');
          }, 4500);
        }
      });
    }
  }

  initMusicWidget() {
    const widget = document.getElementById('music-widget');
    const audio = document.getElementById('kesariya-audio');
    const toggleBtn = document.getElementById('music-toggle-btn');
    const iconPlay = document.getElementById('music-icon-play');
    const iconPause = document.getElementById('music-icon-pause');
    const statusText = document.getElementById('music-status-text');

    if (!audio) return;

    let isPlaying = false;
    let fadeInterval = null;

    const setUIState = (playing) => {
      isPlaying = playing;
      if (playing) {
        if (widget) widget.classList.add('is-playing');
        if (iconPlay) iconPlay.style.display = 'none';
        if (iconPause) iconPause.style.display = 'block';
        if (statusText) statusText.textContent = 'Now Playing • केसरिया बालम आवो नी पधारो म्हारे देस';
        if (toggleBtn) toggleBtn.setAttribute('title', 'Pause Kesariya Balam');
      } else {
        if (widget) widget.classList.remove('is-playing');
        if (iconPlay) iconPlay.style.display = 'block';
        if (iconPause) iconPause.style.display = 'none';
        if (statusText) statusText.textContent = 'Traditional Rajasthani Folk Song • पधारो म्हारे देश';
        if (toggleBtn) toggleBtn.setAttribute('title', 'Play Kesariya Balam');
      }
    };

    const fadeIn = (targetVol = 0.55, durationMs = 1800) => {
      clearInterval(fadeInterval);
      audio.volume = 0.05;
      const step = 0.05;
      const intervalMs = durationMs / (targetVol / step);
      fadeInterval = setInterval(() => {
        if (audio.volume + step < targetVol) {
          audio.volume = Math.min(targetVol, audio.volume + step);
        } else {
          audio.volume = targetVol;
          clearInterval(fadeInterval);
        }
      }, intervalMs);
    };

    const fadeOut = (durationMs = 600) => {
      clearInterval(fadeInterval);
      const step = 0.05;
      const intervalMs = Math.max(20, durationMs / (Math.max(0.1, audio.volume) / step));
      fadeInterval = setInterval(() => {
        if (audio.volume - step > 0.05) {
          audio.volume = Math.max(0, audio.volume - step);
        } else {
          audio.volume = 0;
          audio.pause();
          clearInterval(fadeInterval);
          setUIState(false);
        }
      }, intervalMs);
    };

    const playMusic = () => {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setUIState(true);
            fadeIn(0.55);
          })
          .catch((err) => {
            // Autoplay policy prevented immediate playback before user gesture
            console.log('Audio autoplay pending user interaction:', err);
            setUIState(false);
          });
      }
    };

    const pauseMusic = () => {
      fadeOut(500);
    };

    const togglePlayback = (e) => {
      if (e) e.stopPropagation();
      if (isPlaying) {
        pauseMusic();
      } else {
        playMusic();
      }
    };

    if (toggleBtn) toggleBtn.addEventListener('click', togglePlayback);
    if (widget) {
      widget.addEventListener('click', (e) => {
        if (e.target !== toggleBtn && !toggleBtn.contains(e.target)) {
          togglePlayback(e);
        }
      });
    }

    // 1. Immediate play attempt upon opening site
    playMusic();

    // 2. Fallback: Trigger audio automatically on the first user interaction anywhere
    const triggerAudioOnFirstGesture = () => {
      if (!isPlaying && audio.paused) {
        playMusic();
      }
      cleanupGestureListeners();
    };

    const gestureEvents = ['click', 'touchstart', 'scroll', 'keydown'];
    const cleanupGestureListeners = () => {
      gestureEvents.forEach(evt => {
        window.removeEventListener(evt, triggerAudioOnFirstGesture, { passive: true });
      });
    };

    gestureEvents.forEach(evt => {
      window.addEventListener(evt, triggerAudioOnFirstGesture, { once: true, passive: true });
    });
  }

  initAmbienceLightbox() {
    const lightbox = document.getElementById('ambience-lightbox');
    if (!lightbox) return;

    const imgEl = document.getElementById('ambience-lightbox-img');
    const titleEl = document.getElementById('ambience-lightbox-title');
    const captionEl = document.getElementById('ambience-lightbox-caption');
    const closeBtn = document.getElementById('ambience-lightbox-close');
    const prevBtn = document.getElementById('ambience-lightbox-prev');
    const nextBtn = document.getElementById('ambience-lightbox-next');

    let currentIndex = 0;

    const getItems = () => {
      if (this.siteData && this.siteData.ambience_gallery && this.siteData.ambience_gallery.length) {
        return this.siteData.ambience_gallery;
      }
      const cards = document.querySelectorAll('.ambience-card');
      return Array.from(cards).map(card => ({
        image: card.querySelector('.ambience-img')?.getAttribute('src') || '',
        title: card.querySelector('.ambience-card-title')?.textContent || '',
        caption: card.querySelector('.ambience-card-caption')?.textContent || ''
      }));
    };

    const showItem = (index) => {
      const items = getItems();
      if (!items.length) return;
      currentIndex = (index + items.length) % items.length;
      const cur = items[currentIndex];
      if (imgEl) {
        imgEl.src = cur.image;
        imgEl.alt = cur.title;
      }
      if (titleEl) titleEl.textContent = cur.title;
      if (captionEl) captionEl.textContent = cur.caption;
      lightbox.classList.add('active');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
      lightbox.classList.remove('active');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };

    const ambienceSection = document.getElementById('ambience');
    if (ambienceSection) {
      ambienceSection.addEventListener('click', (e) => {
        const card = e.target.closest('.ambience-card');
        if (card) {
          const idx = parseInt(card.dataset.idx || '0', 10);
          showItem(idx);
        }
      });
      ambienceSection.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          const card = e.target.closest('.ambience-card');
          if (card) {
            e.preventDefault();
            const idx = parseInt(card.dataset.idx || '0', 10);
            showItem(idx);
          }
        }
      });
    }

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (prevBtn) prevBtn.addEventListener('click', () => showItem(currentIndex - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => showItem(currentIndex + 1));

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showItem(currentIndex - 1);
      if (e.key === 'ArrowRight') showItem(currentIndex + 1);
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => { window.tadkaApp = new TadkaApp(); });
} else {
  window.tadkaApp = new TadkaApp();
}
