import React from 'react';

interface DevAccessDetectorProps {
  children: React.ReactNode;
  comingSoonPage: React.ReactNode;
}

const DevAccessDetector: React.FC<DevAccessDetectorProps> = ({ 
  children, 
  comingSoonPage 
}) => {
  // Check various dev access methods
  const checkDevAccess = (): boolean => {
    // Cookie-based bypass
    const hasEarlyAccessCookie = document.cookie.split(';').some(c => c.trim().startsWith('pulseplatform_early_access='));
    console.log('[DevAccessDetector] pulseplatform_early_access cookie present:', hasEarlyAccessCookie);
    if (hasEarlyAccessCookie) {
      return true;
    }

    // Method 1: URL parameter dev=true
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('dev') === 'true') {
      return true;
    }

    // Method 2: URL parameter access=dev
    if (urlParams.get('access') === 'dev') {
      return true;
    }

    // Method 3: Special route /platform/*
    if (window.location.pathname.startsWith('/platform')) {
      return true;
    }

    // Method 4: Special route /dev/*
    if (window.location.pathname.startsWith('/dev')) {
      return true;
    }

    // Method 5: dev subdomain
    if (window.location.hostname.startsWith('dev.') || window.location.hostname.startsWith('app.')) {
      return true;
    }

    // Method 6: Check localStorage for dev flag (persistent dev mode)
    const isDevMode = localStorage.getItem('pulseplatform_dev_mode') === 'true';
    if (isDevMode) {
      return true;
    }

    // REMOVED: Automatic localhost bypass - now localhost shows coming soon too
    // This allows testing the coming soon page in development

    return false;
  };

  const isDevMode = checkDevAccess();

  // Enable dev mode with secret key combination (Ctrl+Shift+D)
  React.useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'D') {
        const devPassword = prompt('Enter dev access code:');
        if (devPassword === 'pulse2025dev') {
          localStorage.setItem('pulseplatform_dev_mode', 'true');
          window.location.reload();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Show dev access info in console for developers
  React.useEffect(() => {
    if (!isDevMode) {
      console.log('🚀 PulsePlatform Developer Access');
      console.log('Dev access methods:');
      console.log('1. Add ?dev=true to URL');
      console.log('2. Add ?access=dev to URL');
      console.log('3. Use /platform/* routes');
      console.log('4. Use /dev/* routes');
      console.log('5. Press Ctrl+Shift+D for secret access');
      console.log('6. Use dev.yourdomain.com subdomain');
    }
  }, [isDevMode]);

  return (
    <>
      {isDevMode ? children : comingSoonPage}
    </>
  );
};

export default DevAccessDetector;
