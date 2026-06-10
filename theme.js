document.addEventListener('DOMContentLoaded', () => {
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const root = document.documentElement;
  const themeIcon = document.getElementById('themeIcon');

  const updateIcon = (isLight) => {
    if (themeIcon) {
      if (isLight) {
        // Moon icon
        themeIcon.innerHTML = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>`;
      } else {
        // Sun icon
        themeIcon.innerHTML = `
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/>
          <line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/>
          <line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        `;
      }
    }
  };

  // Initial icon
  updateIcon(root.classList.contains('light-mode'));

  // Toggle theme
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      root.classList.toggle('light-mode');
      const isLight = root.classList.contains('light-mode');
      localStorage.setItem('leadflow-theme', isLight ? 'light' : 'dark');
      updateIcon(isLight);
    });
  }

  // Toggle Money Visibility
  const toggleMoneyBtn = document.getElementById('toggleMoneyBtn');
  const eyeIcon = document.getElementById('eyeIcon');
  
  const updateMoneyIcon = (isHidden) => {
    if (eyeIcon) {
      if (isHidden) {
        // Eye off icon
        eyeIcon.innerHTML = `
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
          <line x1="1" y1="1" x2="23" y2="23"></line>
        `;
      } else {
        // Eye icon
        eyeIcon.innerHTML = `
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        `;
      }
    }
  };

  const isMoneyHidden = localStorage.getItem('leadflow-money-hidden') === '1';
  if (isMoneyHidden) {
    document.body.classList.add('money-hidden');
  }
  updateMoneyIcon(isMoneyHidden);

  if (toggleMoneyBtn) {
    toggleMoneyBtn.addEventListener('click', () => {
      document.body.classList.toggle('money-hidden');
      const isHidden = document.body.classList.contains('money-hidden');
      localStorage.setItem('leadflow-money-hidden', isHidden ? '1' : '0');
      updateMoneyIcon(isHidden);
    });
  }

  // Toggle Clock/Header Visibility
  const toggleClockBtn = document.getElementById('toggleClockBtn');
  const clockIcon = document.getElementById('clockIcon');
  const dashboardHeaderCard = document.getElementById('dashboardHeaderCard');

  const updateClockIcon = (isHidden) => {
    if (clockIcon) {
      if (isHidden) {
        // Clock off icon
        clockIcon.innerHTML = `
          <circle cx="12" cy="12" r="10" stroke-dasharray="4 4"></circle>
          <polyline points="12 6 12 12 16 14" opacity="0.5"></polyline>
          <line x1="4" y1="4" x2="20" y2="20"></line>
        `;
      } else {
        // Clock on icon
        clockIcon.innerHTML = `
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        `;
      }
    }
  };

  const isClockHidden = localStorage.getItem('leadflow-clock-hidden') === '1';
  if (isClockHidden && dashboardHeaderCard) {
    dashboardHeaderCard.style.display = 'none';
  }
  updateClockIcon(isClockHidden);

  if (toggleClockBtn) {
    toggleClockBtn.addEventListener('click', () => {
      const headerCard = document.getElementById('dashboardHeaderCard');
      if (headerCard) {
        const currentlyHidden = headerCard.style.display === 'none';
        if (currentlyHidden) {
          headerCard.style.display = 'flex';
          localStorage.setItem('leadflow-clock-hidden', '0');
          updateClockIcon(false);
        } else {
          headerCard.style.display = 'none';
          localStorage.setItem('leadflow-clock-hidden', '1');
          updateClockIcon(true);
        }
      }
    });
  }
});