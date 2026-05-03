import React, { useState, useEffect, useRef } from 'react';

// ━━━━━━━━━━━━━━━━━━━━━ SVG ICONS ━━━━━━━━━━━━━━━━━━━━━
const RecycleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.5 7L4 12.5L7 15M15.5 7L20 12.5L17 15M12 3V8M12 16V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CameraIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ScanIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 4h4M3 20h4M17 4h4M17 20h4M3 4v4M3 20v-4M21 4v4M21 20v-4M7 11h10M7 13h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ChartIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 3v18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7 16v-4M12 16v-7M17 16v-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const XIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const TargetIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="1" stroke="currentColor" strokeWidth="2"/>
    <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2"/>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ━━━━━━━━━━━━━━━━━━━━━ PLASTIC DETECTION MAPPING ━━━━━━━━━━━━━━━━━━━━━
const plasticMapping = {
  'bottle': { type: 'PET – Type 1', item: 'Water Bottle', recyclable: true, bin: 'Blue Bin', points: 15 },
  'cup': { type: 'PS – Type 6', item: 'Disposable Cup', recyclable: false, bin: 'General Waste', points: 5 },
  'plastic': { type: 'HDPE – Type 2', item: 'Plastic Container', recyclable: true, bin: 'Blue Bin', points: 20 },
  'bag': { type: 'LDPE – Type 4', item: 'Plastic Bag', recyclable: false, bin: 'Drop-off Point', points: 8 },
  'container': { type: 'PP – Type 5', item: 'Yogurt Container', recyclable: true, bin: 'Blue Bin', points: 12 },
  'microplastic': { type: 'Mixed Microplastics', item: 'Microplastic Particles', recyclable: false, bin: 'Specialized Facility', points: 25 },
};

const EcoWaste = () => {
  // ━━━━━━━━━━━━━━━━━━━━━ STATE ━━━━━━━━━━━━━━━━━━━━━
  const [activeTab, setActiveTab] = useState('scan');
  const [points, setPoints] = useState(0);
  const [scanHistory, setScanHistory] = useState([]);
  const [weeklyLog, setWeeklyLog] = useState([]);
  const [currentScan, setCurrentScan] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isLogged, setIsLogged] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemType, setNewItemType] = useState('Unknown');
  const [challenge, setChallenge] = useState(null);
  const [challengeAccepted, setChallengeAccepted] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef(null);

  // ━━━━━━━━━━━━━━━━━━━━━ PLASTIC TYPES DATA ━━━━━━━━━━━━━━━━━━━━━
  // Hardcoded scan sequence
  const challenges = [
    'Avoid single-use straws for 7 days',
    'Refuse plastic bags at checkout for 7 days',
    'Choose products with less packaging for 7 days',
  ];

  // ━━━━━━━━━━━━━━━━━━━━━ INIT LOAD ━━━━━━━━━━━━━━━━━━━━━
  useEffect(() => {
    const savedPoints = localStorage.getItem('rc_points');
    const savedHistory = localStorage.getItem('rc_scan_history');
    const savedWeeklyLog = localStorage.getItem('rc_weekly_log');
    const savedChallenge = localStorage.getItem('rc_challenge');

    if (savedPoints) setPoints(parseInt(savedPoints, 10));
    if (savedHistory) setScanHistory(JSON.parse(savedHistory));
    if (savedWeeklyLog) setWeeklyLog(JSON.parse(savedWeeklyLog));
    
    if (savedChallenge) {
      const parsed = JSON.parse(savedChallenge);
      const startDate = new Date(parsed.startDate);
      const now = new Date();
      const daysElapsed = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
      
      if (daysElapsed < 7) {
        setChallenge(parsed.text);
        setChallengeAccepted(parsed.accepted);
      } else {
        rotateChallenge();
      }
    } else {
      rotateChallenge();
    }
  }, []);

  // ━━━━━━━━━━━━━━━━━━━━━ CHALLENGE ROTATION ━━━━━━━━━━━━━━━━━━━━━
  const rotateChallenge = () => {
    const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];
    setChallenge(randomChallenge);
    setChallengeAccepted(false);
    localStorage.setItem(
      'rc_challenge',
      JSON.stringify({
        text: randomChallenge,
        accepted: false,
        startDate: new Date().toISOString(),
      })
    );
  };

  const scanSequence = [
    plasticMapping['bottle'],
    plasticMapping['bag'],
  ];

  const startCamera = async () => {
    console.log('Starting camera...');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      console.log('Camera stream obtained:', stream);

      if (videoRef.current) {
        console.log('Setting video srcObject');
        videoRef.current.srcObject = stream;

        // Also try setting src as fallback
        try {
          const blobUrl = URL.createObjectURL(stream);
          videoRef.current.src = blobUrl;
        } catch (e) {
          console.log('Blob URL fallback not needed');
        }

        videoRef.current.onloadedmetadata = async () => {
          console.log('Video metadata loaded, attempting to play');
          try {
            await videoRef.current.play();
            console.log('Video playing successfully');
            setCameraActive(true);
          } catch (playError) {
            console.error('Video play failed:', playError);
            // Try again after a short delay
            setTimeout(() => {
              videoRef.current.play().then(() => {
                console.log('Video playing on retry');
                setCameraActive(true);
              }).catch(console.error);
            }, 100);
          }
        };
      }
    } catch (error) {
      console.error('Camera access failed:', error);
      alert('Unable to access camera. Please allow camera permissions and try again.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const performScan = () => {
    setIsScanning(true);
    setIsLogged(false);

    setTimeout(() => {
      const nextScan = scanSequence[scanCount % scanSequence.length];
      setCurrentScan(nextScan);
      setScanCount(prev => prev + 1);
      setIsScanning(false);
    }, 2000);
  };

  const simulateScan = () => {
    if (!cameraActive) {
      startCamera();
      return;
    }
    performScan();
  };

  // ━━━━━━━━━━━━━━━━━━━━━ LOG DISPOSAL ━━━━━━━━━━━━━━━━━━━━━
  const logDisposal = () => {
    if (!currentScan) return;

    const newPoints = points + currentScan.points;
    setPoints(newPoints);
    localStorage.setItem('rc_points', newPoints.toString());

    const newEntry = {
      type: currentScan.type,
      item: currentScan.item,
      points: currentScan.points,
      date: new Date().toISOString(),
    };

    const newHistory = [newEntry, ...scanHistory].slice(0, 20);
    setScanHistory(newHistory);
    localStorage.setItem('rc_scan_history', JSON.stringify(newHistory));

    setIsLogged(true);
  };

  // ━━━━━━━━━━━━━━━━━━━━━ SCAN ANOTHER ━━━━━━━━━━━━━━━━━━━━━
  const scanAnother = () => {
    setCurrentScan(null);
    setIsLogged(false);
  };

  // ━━━━━━━━━━━━━━━━━━━━━ ADD WEEKLY LOG ━━━━━━━━━━━━━━━━━━━━━
  const addToWeeklyLog = () => {
    if (!newItemName.trim()) return;

    const newEntry = {
      id: Date.now(),
      name: newItemName,
      type: newItemType,
      date: new Date().toISOString(),
    };

    const updated = [newEntry, ...weeklyLog];
    setWeeklyLog(updated);
    localStorage.setItem('rc_weekly_log', JSON.stringify(updated));

    setNewItemName('');
    setNewItemType('Unknown');
  };

  // ━━━━━━━━━━━━━━━━━━━━━ DELETE WEEKLY LOG ━━━━━━━━━━━━━━━━━━━━━
  const deleteWeeklyEntry = (id) => {
    const updated = weeklyLog.filter(entry => entry.id !== id);
    setWeeklyLog(updated);
    localStorage.setItem('rc_weekly_log', JSON.stringify(updated));
  };

  // ━━━━━━━━━━━━━━━━━━━━━ ACCEPT CHALLENGE ━━━━━━━━━━━━━━━━━━━━━
  const acceptChallenge = () => {
    setChallengeAccepted(true);
    localStorage.setItem(
      'rc_challenge',
      JSON.stringify({
        text: challenge,
        accepted: true,
        startDate: new Date().toISOString(),
      })
    );
  };

  // ━━━━━━━━━━━━━━━━━━━━━ WEEK CALCULATION ━━━━━━━━━━━━━━━━━━━━━
  const getWeekKey = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const week = Math.ceil((d.getDate() - d.getDay() + 1) / 7);
    return `${year}-W${week}`;
  };

  const currentWeekKey = getWeekKey(new Date());
  const thisWeekItems = weeklyLog.filter(item => getWeekKey(item.date) === currentWeekKey);

  // ━━━━━━━━━━━━━━━━━━━━━ FORMAT DATE ━━━━━━━━━━━━━━━━━━━━━
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        :root {
          --bg: #FFFFFF;
          --surface: #F7FAF7;
          --border: #E4EDE4;
          --text-primary: #1A2E1A;
          --text-secondary: #6B7F6B;
          --green: #2D7D46;
          --green-light: #EAF4EC;
          --green-mid: #4CAF70;
          --amber: #E8A020;
          --red-soft: #E05454;
        }

        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Fraunces:wght@600;700&display=swap');

        body {
          background-color: var(--bg);
          color: var(--text-primary);
          font-family: 'DM Sans', sans-serif;
          line-height: 1.5;
        }

        .app-container {
          display: flex;
          flex-direction: column;
          height: 100vh;
          max-width: 480px;
          margin: 0 auto;
          background: var(--bg);
          position: relative;
        }

        /* ━━━━━━━━━━━━━━ NAV ━━━━━━━━━━━━━ */
        .nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          border-bottom: 1px solid var(--border);
          background: var(--bg);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .nav-logo {
          font-family: 'Fraunces', serif;
          font-size: 20px;
          font-weight: 700;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .nav-logo-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          color: var(--green);
        }

        .nav-logo-icon svg {
          width: 100%;
          height: 100%;
        }

        .points-pill {
          background: var(--green-light);
          color: var(--green);
          font-weight: 600;
          font-size: 13px;
          padding: 8px 16px;
          border-radius: 20px;
        }

        /* ━━━━━━━━━━━━━━ MAIN ━━━━━━━━━━━━━ */
        .main {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          padding-bottom: 100px;
        }

        /* ━━━━━━━━━━━━━━ TABS ━━━━━━━━━━━━━ */
        .tab-bar {
          position: fixed;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 100%;
          max-width: 480px;
          display: flex;
          border-top: 1px solid var(--border);
          background: var(--bg);
          box-shadow: 0 -1px 4px rgba(0, 0, 0, 0.06);
        }

        .tab-button {
          flex: 1;
          padding: 16px;
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          color: var(--text-secondary);
          font-size: 24px;
          transition: opacity 0.2s ease;
          border-radius: 0;
        }

        .tab-button svg {
          width: 28px;
          height: 28px;
        }

        .tab-button.active {
          color: var(--green);
          opacity: 1;
        }

        .tab-button:not(.active) {
          opacity: 0.5;
        }

        .tab-label {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        /* ━━━━━━━━━━━━━━ TAB CONTENT ━━━━━━━━━━━━━ */
        .tab-content {
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* ━━━━━━━━━━━━━━ CARDS ━━━━━━━━━━━━━ */
        .card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
        }

        /* ━━━━━━━━━━━━━━ SCAN TAB ━━━━━━━━━━━━━ */
        .scan-zone {
          border: 2px dashed var(--border);
          border-radius: 16px;
          padding: 48px 24px;
          text-align: center;
          background: var(--bg);
          margin-bottom: 24px;
        }

        .camera-feed {
          width: 100%;
          height: 400px;
          border-radius: 12px;
          object-fit: cover;
          background: #000;
          display: block;
          visibility: visible;
          opacity: 1;
        }

        .camera-overlay {
          position: relative;
          margin-top: -400px;
          height: 400px;
          pointer-events: none;
        }

        .scan-crosshair {
          width: 100%;
          height: 100%;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .crosshair-corner {
          position: absolute;
          width: 40px;
          height: 40px;
          border: 3px solid var(--green);
          opacity: 0.8;
        }

        .crosshair-corner.top-left {
          top: 24px;
          left: 24px;
          border-right: none;
          border-bottom: none;
          border-radius: 8px 0 0 0;
        }

        .crosshair-corner.top-right {
          top: 24px;
          right: 24px;
          border-left: none;
          border-bottom: none;
          border-radius: 0 8px 0 0;
        }

        .crosshair-corner.bottom-left {
          bottom: 24px;
          left: 24px;
          border-right: none;
          border-top: none;
          border-radius: 0 0 0 8px;
        }

        .crosshair-corner.bottom-right {
          bottom: 24px;
          right: 24px;
          border-left: none;
          border-top: none;
          border-radius: 0 0 8px 0;
        }

        .scan-zone-label {
          color: var(--text-secondary);
          font-size: 13px;
          margin-bottom: 16px;
        }

        .scan-button {
          background: var(--green);
          color: white;
          border: none;
          padding: 12px 28px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          transition: background 0.2s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          justify-content: center;
        }

        .scan-button svg {
          width: 20px;
          height: 20px;
        }

        .scan-button:hover:not(:disabled) {
          background: #236639;
        }

        .scan-button:disabled {
          opacity: 0.6;
        }

        .loading-dots::after {
          content: '';
          animation: dots 1.5s steps(4, end) infinite;
        }

        @keyframes dots {
          0%, 20% { content: '.'; }
          40% { content: '..'; }
          60% { content: '...'; }
          80%, 100% { content: ''; }
        }

        /* Result Card */
        .result-card {
          animation: slideUpFade 0.3s ease;
        }

        @keyframes slideUpFade {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .plastic-type-label {
          display: inline-block;
          background: var(--green-light);
          color: var(--green);
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 12px;
        }

        .item-name {
          font-family: 'Fraunces', serif;
          font-size: 28px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 16px;
        }

        .recyclable-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 14px;
          margin-bottom: 16px;
        }

        .recyclable-pill svg {
          width: 18px;
          height: 18px;
        }

        .recyclable-pill.yes {
          background: var(--green-light);
          color: var(--green);
        }

        .recyclable-pill.no {
          background: #FED7D7;
          color: var(--red-soft);
        }

        .disposal-text {
          color: var(--text-secondary);
          font-size: 14px;
          margin-bottom: 16px;
        }

        .points-badge {
          color: var(--green);
          font-weight: 700;
          font-size: 16px;
          margin-bottom: 20px;
        }

        .button-group {
          display: flex;
          gap: 12px;
        }

        .button-group button {
          flex: 1;
          padding: 12px 16px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.2s ease;
        }

        .btn-primary {
          background: var(--green);
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #236639;
        }

        .btn-primary:disabled {
          background: #A0C4A8;
          cursor: not-allowed;
        }

        .btn-ghost {
          background: transparent;
          color: var(--green);
          border: 1px solid var(--green);
        }

        .btn-ghost:hover {
          background: var(--green-light);
        }

        .logged-state {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--green);
          font-weight: 600;
        }

        .logged-state svg {
          width: 18px;
          height: 18px;
        }

        /* History List */
        .history-label {
          font-family: 'Fraunces', serif;
          font-size: 16px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 12px;
          margin-top: 32px;
        }

        .history-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .history-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: var(--surface);
          border-radius: 8px;
          font-size: 14px;
          border: 1px solid var(--border);
        }

        .history-item-name {
          font-weight: 500;
          color: var(--text-primary);
        }

        .history-item-points {
          color: var(--green);
          font-weight: 600;
        }

        .history-item-date {
          color: var(--text-secondary);
          font-size: 12px;
        }

        /* ━━━━━━━━━━━━━━ TRACKER TAB ━━━━━━━━━━━━━ */
        .tracker-section-title {
          font-family: 'Fraunces', serif;
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 16px;
        }

        .bar-chart {
          display: flex;
          gap: 24px;
          margin-bottom: 20px;
        }

        .bar-item {
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .bar-label {
          font-size: 12px;
          color: var(--text-secondary);
          margin-bottom: 8px;
          font-weight: 600;
        }

        .bar {
          height: 32px;
          border-radius: 4px;
          background: var(--border);
        }

        .bar.user {
          background: var(--green);
          width: ${(thisWeekItems.length / 18) * 100}%;
        }

        .bar-value {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
          margin-top: 6px;
        }

        /* Form */
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 16px;
        }

        .form-input {
          padding: 12px 16px;
          border: 1px solid var(--border);
          border-radius: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: var(--text-primary);
          background: var(--bg);
        }

        .form-input::placeholder {
          color: var(--text-secondary);
        }

        .form-input-row {
          display: flex;
          gap: 12px;
        }

        .form-input-row input {
          flex: 1;
        }

        .form-input-row select {
          flex: 1;
        }

        .form-input-row button {
          padding: 12px 24px;
        }

        .btn-add {
          background: var(--green);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          transition: background 0.2s ease;
        }

        .btn-add:hover {
          background: #236639;
        }

        /* Logged Items */
        .logged-items-container {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-height: 280px;
          overflow-y: auto;
          padding-right: 8px;
        }

        .logged-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: var(--surface);
          border-radius: 8px;
          border: 1px solid var(--border);
          font-size: 14px;
          transition: background 0.2s ease;
          position: relative;
        }

        .logged-item:hover {
          background: var(--border);
        }

        .logged-item-info {
          flex: 1;
        }

        .logged-item-name {
          font-weight: 500;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .logged-item-type {
          display: inline-block;
          background: var(--green-light);
          color: var(--green);
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          margin-right: 8px;
        }

        .logged-item-date {
          color: var(--text-secondary);
          font-size: 12px;
        }

        .logged-item-delete {
          background: none;
          border: none;
          color: var(--red-soft);
          cursor: pointer;
          font-size: 16px;
          padding: 4px 8px;
          opacity: 0;
          transition: opacity 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logged-item-delete svg {
          width: 18px;
          height: 18px;
        }

        .logged-item:hover .logged-item-delete {
          opacity: 1;
        }

        /* Challenge */
        .challenge-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: var(--amber);
          color: white;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 12px;
        }

        .challenge-badge svg {
          width: 14px;
          height: 14px;
        }

        .challenge-text {
          font-family: 'Fraunces', serif;
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 16px;
        }

        .challenge-accepted {
          color: var(--green);
          font-weight: 600;
        }

        .btn-challenge {
          background: var(--green);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          width: 100%;
          transition: background 0.2s ease;
        }

        .btn-challenge:hover:not(:disabled) {
          background: #236639;
        }

        .btn-challenge:disabled {
          background: var(--green);
          cursor: not-allowed;
        }
      `}</style>

      <div className="app-container">
        {/* NAV */}
        <nav className="nav">
          <div className="nav-logo">
            <span className="nav-logo-icon"><RecycleIcon /></span>
            EcoWaste
          </div>
          <div className="points-pill">{points} Green Points</div>
        </nav>

        {/* MAIN */}
        <main className="main">
          {/* SCAN TAB */}
          {activeTab === 'scan' && (
            <div className="tab-content">
              <div className="scan-zone">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="camera-feed"
                  style={{
                    width: '100%',
                    height: '400px',
                    objectFit: 'cover',
                    display: cameraActive ? 'block' : 'none'
                  }}
                  onClick={() => {
                    if (videoRef.current && videoRef.current.paused) {
                      videoRef.current.play().catch(console.error);
                    }
                  }}
                />
                {!cameraActive ? (
                  <>
                    <div className="scan-zone-label">Open the camera first to begin scanning</div>
                    <button
                      className="scan-button"
                      onClick={simulateScan}
                      disabled={isScanning}
                    >
                      {isScanning ? <span className="loading-dots">Scanning</span> : <><CameraIcon /> Open Camera</>}
                    </button>
                  </>
                ) : (
                  <>
                    <div className="camera-overlay">
                      <div className="scan-crosshair">
                        <div className="crosshair-corner top-left"></div>
                        <div className="crosshair-corner top-right"></div>
                        <div className="crosshair-corner bottom-left"></div>
                        <div className="crosshair-corner bottom-right"></div>
                      </div>
                    </div>
                    <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
                      <button
                        className="btn-primary"
                        onClick={simulateScan}
                        disabled={isScanning}
                        style={{ flex: 1 }}
                      >
                        {isScanning ? <span className="loading-dots">Scanning</span> : 'Scan Item'}
                      </button>
                      <button
                        className="btn-ghost"
                        onClick={stopCamera}
                        style={{ flex: 1 }}
                      >
                        Close Camera
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Result Card */}
              {currentScan && (
                <div className="card result-card">
                  <div className="plastic-type-label">{currentScan.type}</div>
                  <div className="item-name">{currentScan.item}</div>
                  <div className={`recyclable-pill ${currentScan.recyclable ? 'yes' : 'no'}`}>
                    {currentScan.recyclable ? <><CheckIcon /> Recyclable</> : <><XIcon /> Not Recyclable</>}
                  </div>
                  <div className="disposal-text">
                    → Drop in <strong>{currentScan.bin}</strong>
                  </div>
                  <div className="points-badge">+{currentScan.points} Green Points</div>

                  <div className="button-group">
                    <button 
                      className="btn-primary"
                      onClick={logDisposal}
                      disabled={isLogged}
                    >
                      {isLogged ? <span className="logged-state"><CheckIcon /> Logged</span> : 'Log Disposal'}
                    </button>
                    <button className="btn-ghost" onClick={scanAnother}>
                      Scan Another
                    </button>
                  </div>
                </div>
              )}

              {/* History */}
              {scanHistory.length > 0 && (
                <>
                  <div className="history-label">Recent Scans</div>
                  <div className="history-list">
                    {scanHistory.slice(0, 5).map((item, idx) => (
                      <div key={idx} className="history-item">
                        <span className="history-item-name">{item.item}</span>
                        <span className="history-item-points">+{item.points}</span>
                        <span className="history-item-date">{formatDate(item.date)}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* TRACKER TAB */}
          {activeTab === 'tracker' && (
            <div className="tab-content">
              {/* Weekly Footprint */}
              <div className="card">
                <div className="tracker-section-title">Weekly Footprint</div>
                <div className="bar-chart">
                  <div className="bar-item">
                    <div className="bar-label">Your Items</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="bar user" style={{ width: `${Math.min((thisWeekItems.length / 18) * 100, 100)}%` }}></div>
                      <span className="bar-value">{thisWeekItems.length}</span>
                    </div>
                  </div>
                  <div className="bar-item">
                    <div className="bar-label">Local Avg</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="bar" style={{ background: '#E4EDE4', width: '100%' }}></div>
                      <span className="bar-value">18</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Log Purchase Form */}
              <div className="card">
                <div className="tracker-section-title">Log a Purchase</div>
                <div className="form-group">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Item name (e.g., Shampoo bottle)"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                  />
                  <div className="form-input-row">
                    <select 
                      className="form-input" 
                      value={newItemType}
                      onChange={(e) => setNewItemType(e.target.value)}
                    >
                      <option>Unknown</option>
                      <option>PET</option>
                      <option>HDPE</option>
                      <option>PP</option>
                      <option>PS</option>
                      <option>LDPE</option>
                    </select>
                    <button className="btn-add" onClick={addToWeeklyLog}>
                      Add Item
                    </button>
                  </div>
                </div>
              </div>

              {/* Logged Items */}
              {thisWeekItems.length > 0 && (
                <div className="card">
                  <div className="tracker-section-title">This Week's Log</div>
                  <div className="logged-items-container">
                    {thisWeekItems.map((item) => (
                      <div key={item.id} className="logged-item">
                        <div className="logged-item-info">
                          <div className="logged-item-name">{item.name}</div>
                          <div>
                            <span className="logged-item-type">{item.type}</span>
                            <span className="logged-item-date">{formatDate(item.date)}</span>
                          </div>
                        </div>
                        <button 
                          className="logged-item-delete"
                          onClick={() => deleteWeeklyEntry(item.id)}
                        >
                          <CloseIcon />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Active Challenge */}
              {challenge && (
                <div className="card">
                  <div className="challenge-badge"><TargetIcon /> Active Challenge</div>
                  <div className="challenge-text">{challenge}</div>
                  {challengeAccepted ? (
                    <div className="logged-state" style={{ fontSize: '16px', justifyContent: 'center', padding: '12px' }}>
                      <CheckIcon /> Challenge Accepted
                    </div>
                  ) : (
                    <button 
                      className="btn-challenge"
                      onClick={acceptChallenge}
                    >
                      Accept Challenge
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </main>

        {/* TAB BAR */}
        <div className="tab-bar">
          <button 
            className={`tab-button ${activeTab === 'scan' ? 'active' : ''}`}
            onClick={() => setActiveTab('scan')}
          >
            <CameraIcon />
            <span className="tab-label">Scan</span>
          </button>
          <button 
            className={`tab-button ${activeTab === 'tracker' ? 'active' : ''}`}
            onClick={() => setActiveTab('tracker')}
          >
            <ChartIcon />
            <span className="tab-label">Tracker</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default EcoWaste;
