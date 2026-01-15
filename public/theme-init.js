(function() {
  function getTheme() {
    const stored = localStorage.getItem('theme');
    if (stored) return stored;
    return 'system';
  }

  const theme = getTheme();
  
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  }
})();
