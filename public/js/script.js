(() => {
  "use strict";

  // Toast notification helper
  const showToast = (message, type = 'success') => {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toastId = 'toast-' + Date.now();
    const bgClass = type === 'success' ? 'bg-success' : 'bg-danger';
    const toastHTML = `
      <div class="toast" id="${toastId}" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast-body ${bgClass} text-white">
          ${message}
          <button type="button" class="btn-close btn-close-white ms-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', toastHTML);
    const toastEl = document.getElementById(toastId);
    if (toastEl) {
      const bsToast = new bootstrap.Toast(toastEl);
      bsToast.show();
      toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
    }
  };

  // Show flash messages as toasts on page load
  const successEl = document.getElementById('flashSuccess');
  const errorEl = document.getElementById('flashError');
  if (successEl && successEl.dataset.message) {
    showToast(successEl.dataset.message, 'success');
  }
  if (errorEl && errorEl.dataset.message) {
    showToast(errorEl.dataset.message, 'error');
  }

  // Star rating interactivity
  const starRating = document.getElementById('starRating');
  if (starRating) {
    const stars = starRating.querySelectorAll('.star');
    const ratingInput = document.getElementById('ratingValue');
    
    stars.forEach(star => {
      star.addEventListener('click', () => {
        const value = star.dataset.value;
        ratingInput.value = value;
        
        // Update active stars
        stars.forEach(s => {
          if (s.dataset.value <= value) {
            s.classList.add('active');
          } else {
            s.classList.remove('active');
          }
        });
      });
      
      star.addEventListener('mouseover', () => {
        const value = star.dataset.value;
        stars.forEach(s => {
          if (s.dataset.value <= value) {
            s.style.color = '#ffc107';
          } else {
            s.style.color = '#ddd';
          }
        });
      });
    });
    
    starRating.addEventListener('mouseout', () => {
      const currentValue = ratingInput.value;
      stars.forEach(s => {
        if (s.dataset.value <= currentValue) {
          s.style.color = '#ffc107';
        } else {
          s.style.color = '#ddd';
        }
      });
    });
  }

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation');

  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
    form.addEventListener(
        "submit", 
        (event) => {
          if (!form.checkValidity()) {
            event.preventDefault()
            event.stopPropagation()
          }
          
        form.classList.add('was-validated');
        }, 
        false
    );
  });

  // Intercept delete forms marked with .ajax-delete and perform fetch,
  // then update the DOM without a full page reload.
  const ajaxDeletes = document.querySelectorAll('form.ajax-delete');
  Array.from(ajaxDeletes).forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const action = form.getAttribute('action');
      try {
        const res = await fetch(action, {
          method: 'DELETE',
          headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          }
        });
        if (!res.ok) throw new Error('Request failed');
        const data = await res.json();
        // Show success toast for delete
        showToast('Deleted successfully!', 'success');
        
        // If it's a listing deletion, redirect to listings index
        if (form.classList.contains('listing-delete')) {
          // If this listing delete form is part of the index (has a corresponding card),
          // remove the card in-place. Otherwise redirect to listings index.
          const id = form.dataset.listingId;
          const cardContainer = document.querySelector(`[data-listing-id-card="${id}"]`);
          if (cardContainer) {
            cardContainer.remove();
            return;
          }
          // fallback: redirect to listings (show page deletion)
          setTimeout(() => {
            window.location.href = '/listings';
          }, 1000);
          return;
        }
        // If it's a review delete, remove the review card from DOM
        if (form.classList.contains('review-delete')) {
          const reviewId = form.dataset.reviewId;
          const card = form.closest('.card');
          if (card) card.remove();
        }
      } catch (err) {
        console.error('AJAX delete failed', err);
        showToast('Delete failed. Please try again.', 'error');
        // fallback: submit the form normally so server can handle redirect
        form.submit();
      }
    });
  });
})();