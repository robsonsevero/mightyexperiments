(function () {
  const views = {
    credits: document.getElementById('view-credits'),
    purchase: document.getElementById('view-purchase'),
    processing: document.getElementById('view-processing'),
  };

  function showView(name) {
    Object.values(views).forEach((v) => v.classList.remove('active'));
    views[name].classList.add('active');
    document.querySelector('.content').scrollTo(0, 0);
  }

  // Sidebar collapsible groups
  document.querySelectorAll('.nav-group-header').forEach((header) => {
    header.addEventListener('click', () => {
      header.closest('.nav-group').classList.toggle('collapsed');
    });
  });

  // Credit bar segment tooltips (floating element so it isn't clipped by the bar)
  const tooltip = document.createElement('div');
  tooltip.className = 'bar-tooltip';
  document.body.appendChild(tooltip);

  document.querySelectorAll('.seg[data-label]').forEach((seg) => {
    seg.addEventListener('mouseenter', () => {
      tooltip.textContent = `${seg.dataset.label}: ${seg.dataset.value}`;
      tooltip.classList.add('visible');
      const rect = seg.getBoundingClientRect();
      tooltip.style.left = rect.left + rect.width / 2 + 'px';
      tooltip.style.top = rect.top - 10 + 'px';
    });
    seg.addEventListener('mouseleave', () => {
      tooltip.classList.remove('visible');
    });
  });

  // --- Purchase view state ---
  let extraCreditsOwned = 0;

  const creditCards = document.querySelectorAll('.option-card[data-credits]');
  const recurrenceCards = document.querySelectorAll('.option-card[data-billed]');

  const summaryCreditsLabel = document.getElementById('summaryCreditsLabel');
  const summaryCreditsPrice = document.getElementById('summaryCreditsPrice');
  const summaryBilledLabel = document.getElementById('summaryBilledLabel');
  const summarySubtotal = document.getElementById('summarySubtotal');
  const summaryTotal = document.getElementById('summaryTotal');
  const payAmount = document.getElementById('payAmount');

  let selectedCredits = 1000;
  let selectedPrice = 10;
  let selectedBilledLabel = 'Billed Once';

  function formatCredits(n) {
    return n.toLocaleString('en-US');
  }

  function updateSummary() {
    summaryCreditsLabel.textContent = `${formatCredits(selectedCredits)} credits`;
    summaryCreditsPrice.textContent = `$${selectedPrice}`;
    summaryBilledLabel.textContent = selectedBilledLabel;
    summarySubtotal.textContent = `$${selectedPrice}`;
    summaryTotal.textContent = `$${selectedPrice}`;
    payAmount.textContent = `$${selectedPrice}`;
  }

  creditCards.forEach((card) => {
    card.addEventListener('click', () => {
      creditCards.forEach((c) => c.classList.remove('selected'));
      card.classList.add('selected');
      card.querySelector('input').checked = true;
      selectedCredits = parseInt(card.dataset.credits, 10);
      selectedPrice = parseInt(card.dataset.price, 10);
      updateSummary();
    });
  });

  recurrenceCards.forEach((card) => {
    card.addEventListener('click', () => {
      recurrenceCards.forEach((c) => c.classList.remove('selected'));
      card.classList.add('selected');
      card.querySelector('input').checked = true;
      selectedBilledLabel = card.dataset.billed;
      updateSummary();
    });
  });

  // Payment method tabs
  document.querySelectorAll('.pay-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.pay-tab').forEach((t) => t.classList.remove('selected'));
      tab.classList.add('selected');
    });
  });

  // Navigation
  document.getElementById('addCreditsBtn').addEventListener('click', () => {
    showView('purchase');
  });

  document.getElementById('closeBtn').addEventListener('click', () => {
    showView('credits');
  });

  document.getElementById('backBtn').addEventListener('click', () => {
    showView('credits');
  });

  function countUp(el, from, to, duration) {
    const start = performance.now();
    function frame(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.textContent = formatCredits(Math.round(from + (to - from) * eased));
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = formatCredits(to);
    }
    requestAnimationFrame(frame);
  }

  document.getElementById('payBtn').addEventListener('click', () => {
    showView('processing');
    setTimeout(() => {
      const prev = extraCreditsOwned;
      extraCreditsOwned += selectedCredits;
      document.getElementById('extraUsed').textContent = '0';
      showView('credits');

      const totalEl = document.getElementById('extraTotal');
      const meterValue = document.getElementById('extraMeterValue');
      const extraBar = document.getElementById('extraBar');
      document.getElementById('extraSeg').dataset.value = formatCredits(extraCreditsOwned);

      totalEl.textContent = formatCredits(prev);
      requestAnimationFrame(() => {
        countUp(totalEl, prev, extraCreditsOwned, 1400);
        meterValue.classList.remove('credit-bump');
        extraBar.classList.remove('credit-flash');
        void meterValue.offsetWidth; // restart animation
        meterValue.classList.add('credit-bump');
        extraBar.classList.add('credit-flash');
      });
    }, 1800);
  });

  updateSummary();
})();
