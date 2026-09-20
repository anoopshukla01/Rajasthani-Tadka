/**
 * RAJASTHANI TADKA — TABLE RESERVATION CONTROLLER
 * Handles booking requests, form validation, and displays instant confirmation.
 */

class ReservationController {
  constructor() {
    this.form = document.getElementById('royal-intake-form') || document.getElementById('table-reservation-form');
    this.statusBox = document.getElementById('intake-status-box') || document.getElementById('reservation-status-box');

    if (!this.form) return;

    this.init();
  }

  init() {
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
  }

  async handleSubmit(e) {
    e.preventDefault();

    const submitBtn = this.form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'SUBMITTING TO ROYAL HOST...';
    submitBtn.disabled = true;

    const emailEl = document.getElementById('intake-email') || document.getElementById('res-email');
    const nameEl = document.getElementById('intake-name') || document.getElementById('res-name');
    const notesEl = document.getElementById('intake-notes') || document.getElementById('res-notes');
    const phoneEl = document.getElementById('res-phone');
    const dateEl = document.getElementById('res-date');
    const timeEl = document.getElementById('res-time');
    const guestsEl = document.getElementById('res-guests');
    const seatingEl = document.getElementById('res-seating');

    const email = emailEl ? emailEl.value.trim() : '';
    const guestName = nameEl ? nameEl.value.trim() : 'Honoured Guest';
    const notes = notesEl ? notesEl.value.trim() : '';
    const phone = phoneEl ? phoneEl.value.trim() : (email || 'Direct Concierge');
    const date = dateEl ? dateEl.value : new Date().toISOString().split('T')[0];
    const timeSlot = timeEl ? timeEl.value : '07:30 PM';
    const guests = guestsEl ? parseInt(guestsEl.value, 10) : 2;
    const seating = seatingEl ? seatingEl.value : 'Courtyard Jharokha';

    const payload = {
      guest_name: guestName,
      phone: phone,
      email: email,
      date: date,
      time: timeSlot,
      guests: guests,
      seating: seating,
      notes: notes
    };

    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (data.success) {
        if (this.statusBox) {
          this.statusBox.className = 'intake-status-box success';
          this.statusBox.innerHTML = `
            <div style="font-size: 1.05rem; font-weight: 700; margin-bottom: 0.35rem; color: #DFBA6E;">
              👑 Padharo Sa! Your Royal Inquiry Has Been Received.
            </div>
            <div style="color: #FFF; font-size: 0.9rem;">
              Reference: <strong style="color: var(--c-gold-bright);">${data.booking_id}</strong>
            </div>
            <div style="margin-top: 0.35rem; font-size: 0.82rem; color: #C8E6C9; line-height: 1.45;">
              Our haveli royal host will personally reach out to ${email || phone} to curate your evening.
            </div>
          `;
          this.statusBox.style.display = 'block';
          this.statusBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        this.form.reset();
      } else {
        alert(data.error || 'Unable to submit intake form. Please contact our concierge.');
      }
    } catch (err) {
      console.error('Intake form error:', err);
      alert('Could not connect to royal server. Please check your network.');
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => { window.reservationCtrl = new ReservationController(); });
} else {
  window.reservationCtrl = new ReservationController();
}
