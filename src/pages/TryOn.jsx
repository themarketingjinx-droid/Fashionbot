import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Camera, CameraOff, Ruler, RefreshCw, CheckCircle2 } from 'lucide-react';
import useStore from '../store/useStore';

// Simulated body measurement from camera feed
function useMeasurements(isCapturing) {
  const [measurements, setMeasurements] = useState(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isCapturing) {
      setMeasurements(null);
      setProgress(0);
      return;
    }

    let step = 0;
    const interval = setInterval(() => {
      step += 2;
      setProgress(Math.min(step, 100));
      if (step >= 100) {
        clearInterval(interval);
        // Simulated AI body measurements
        setMeasurements({
          height: `5'${Math.floor(Math.random() * 3) + 7}"`,
          chest: `${Math.floor(Math.random() * 10) + 34}"`,
          waist: `${Math.floor(Math.random() * 8) + 26}"`,
          hips: `${Math.floor(Math.random() * 10) + 36}"`,
          shoulder: `${Math.floor(Math.random() * 4) + 15}"`,
          inseam: `${Math.floor(Math.random() * 4) + 29}"`,
          fit: ['Regular', 'Slim', 'Relaxed'][Math.floor(Math.random() * 3)],
          sizeRecommendation: ['XS', 'S', 'M', 'L', 'XL'][Math.floor(Math.random() * 5)],
        });
      }
    }, 60);

    return () => clearInterval(interval);
  }, [isCapturing]);

  return { measurements, progress };
}

export default function TryOn() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { pieces, isOwned } = useStore();
  const piece = pieces.find((p) => p.id === id);
  const owned = isOwned(id);

  const videoRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [isCapturing, setIsCapturing] = useState(false);
  const [scanPhase, setScanPhase] = useState(0); // 0=idle, 1=scanning, 2=done
  const streamRef = useRef(null);

  const { measurements, progress } = useMeasurements(isCapturing);

  const startCamera = useCallback(async () => {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err) {
      setCameraError('Camera access denied. Please allow camera permissions.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setIsCapturing(false);
    setScanPhase(0);
  }, []);

  const startScan = () => {
    setScanPhase(1);
    setIsCapturing(true);
  };

  useEffect(() => {
    if (measurements) {
      setScanPhase(2);
      setIsCapturing(false);
    }
  }, [measurements]);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  if (!piece) return null;
  if (!owned) {
    navigate(`/piece/${id}`);
    return null;
  }

  return (
    <div className="min-h-screen pt-20 pb-16 px-4 max-w-5xl mx-auto">
      <button
        onClick={() => navigate(`/piece/${id}`)}
        className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mt-6 mb-8 text-sm"
      >
        <ArrowLeft size={16} /> Back to Piece
      </button>

      <div className="mb-8 text-center">
        <p className="text-xs tracking-widest text-gold uppercase mb-2">AR Try-On</p>
        <h1 className="text-3xl font-black text-white">{piece.name}</h1>
        <p className="text-white/40 text-sm mt-1">Full-body scan · AI measurements · Digital fitting</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Camera Panel */}
        <div className="rounded-2xl overflow-hidden border border-white/10 bg-black relative" style={{ minHeight: 420 }}>
          {!cameraActive ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center border-2"
                style={{ borderColor: piece.accentColor, color: piece.accentColor }}
              >
                <Camera size={28} />
              </div>
              <p className="text-white font-semibold">Enable Camera</p>
              <p className="text-white/40 text-xs text-center max-w-xs px-4">
                Stand 6–8 feet from your camera in good lighting. We'll capture your full body measurements.
              </p>
              {cameraError && (
                <p className="text-red-400 text-xs text-center px-6">{cameraError}</p>
              )}
              <button
                onClick={startCamera}
                className="mt-2 px-6 py-3 rounded-xl font-bold text-black text-sm flex items-center gap-2"
                style={{ background: piece.accentColor }}
              >
                <Camera size={16} /> Start Camera
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ minHeight: 420 }}
              />

              {/* Body outline overlay */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 400 560"
                preserveAspectRatio="xMidYMid meet"
              >
                {/* Head */}
                <ellipse
                  cx="200" cy="80" rx="38" ry="45"
                  fill="none" strokeWidth="2" stroke={piece.accentColor}
                  strokeDasharray={scanPhase === 1 ? '8 4' : 'none'}
                  opacity="0.8"
                />
                {/* Body */}
                <path
                  d="M162 125 L140 220 L148 340 L162 420 L238 420 L252 340 L260 220 L238 125 Z"
                  fill="none" strokeWidth="2" stroke={piece.accentColor}
                  strokeDasharray={scanPhase === 1 ? '8 4' : 'none'}
                  opacity="0.8"
                />
                {/* Arms */}
                <path
                  d="M162 130 L110 240 L120 250 M238 130 L290 240 L280 250"
                  fill="none" strokeWidth="2" stroke={piece.accentColor}
                  strokeDasharray={scanPhase === 1 ? '8 4' : 'none'}
                  opacity="0.8"
                />
                {/* Legs */}
                <path
                  d="M162 420 L150 530 M238 420 L250 530"
                  fill="none" strokeWidth="2" stroke={piece.accentColor}
                  strokeDasharray={scanPhase === 1 ? '8 4' : 'none'}
                  opacity="0.8"
                />

                {/* Scanning line */}
                {scanPhase === 1 && (
                  <line
                    x1="100" y1="0" x2="300" y2="0"
                    stroke={piece.accentColor}
                    strokeWidth="2"
                    opacity="0.9"
                  >
                    <animate
                      attributeName="y1"
                      values="40;520;40"
                      dur="2.5s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="y2"
                      values="40;520;40"
                      dur="2.5s"
                      repeatCount="indefinite"
                    />
                  </line>
                )}
              </svg>

              {/* Progress bar */}
              {scanPhase === 1 && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-4 py-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-white/60">Measuring body…</span>
                    <span className="text-xs font-mono" style={{ color: piece.accentColor }}>{progress}%</span>
                  </div>
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${progress}%`, background: piece.accentColor }}
                    />
                  </div>
                </div>
              )}

              {/* Controls */}
              <div className="absolute top-3 right-3 flex gap-2">
                {scanPhase === 0 && (
                  <button
                    onClick={startScan}
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-black"
                    style={{ background: piece.accentColor }}
                  >
                    <Ruler size={14} /> Scan Body
                  </button>
                )}
                {scanPhase === 2 && (
                  <button
                    onClick={() => { setScanPhase(0); }}
                    className="flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold bg-white/10 text-white"
                  >
                    <RefreshCw size={12} /> Rescan
                  </button>
                )}
                <button
                  onClick={stopCamera}
                  className="p-2 rounded-full bg-black/60 text-white/60 hover:text-white"
                >
                  <CameraOff size={16} />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Measurements Panel */}
        <div className="flex flex-col gap-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Ruler size={16} style={{ color: piece.accentColor }} />
              <h3 className="font-bold text-white">Body Measurements</h3>
            </div>

            <AnimatePresence mode="wait">
              {!measurements ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-3"
                >
                  {['Height', 'Chest', 'Waist', 'Hips', 'Shoulder', 'Inseam'].map((m) => (
                    <div key={m} className="flex items-center justify-between">
                      <span className="text-white/40 text-sm">{m}</span>
                      <div className="w-20 h-4 bg-white/8 rounded animate-pulse" />
                    </div>
                  ))}
                  <p className="text-xs text-white/20 mt-4 text-center">
                    {scanPhase === 1 ? 'Scanning…' : 'Enable camera and scan your body'}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 size={16} className="text-lime-400" />
                    <span className="text-lime-400 text-sm font-semibold">Scan Complete</span>
                  </div>
                  {[
                    ['Height', measurements.height],
                    ['Chest', measurements.chest],
                    ['Waist', measurements.waist],
                    ['Hips', measurements.hips],
                    ['Shoulder', measurements.shoulder],
                    ['Inseam', measurements.inseam],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between py-1 border-b border-white/5">
                      <span className="text-white/50 text-sm">{label}</span>
                      <span className="font-mono font-bold text-white text-sm">{value}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Fit Recommendation */}
          <AnimatePresence>
            {measurements && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl p-5 border"
                style={{ background: `${piece.accentColor}15`, borderColor: `${piece.accentColor}40` }}
              >
                <p className="text-xs text-white/40 uppercase tracking-wider mb-3">Fit Analysis · {piece.name}</p>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white/60 text-sm">Recommended Size</span>
                  <span className="text-2xl font-black" style={{ color: piece.accentColor }}>
                    {measurements.sizeRecommendation}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60 text-sm">Fit Type</span>
                  <span className="font-semibold text-white">{measurements.fit}</span>
                </div>
                <p className="text-xs text-white/30 mt-4 leading-relaxed">
                  This garment is designed for a {measurements.fit.toLowerCase()} silhouette.
                  Based on your measurements, size {measurements.sizeRecommendation} will give you the designer's intended fit.
                </p>

                <button
                  className="mt-4 w-full py-3 rounded-xl font-bold text-sm text-black flex items-center justify-center gap-2"
                  style={{ background: piece.accentColor }}
                >
                  Save Measurements to Profile
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Instructions */}
          {!cameraActive && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <p className="text-xs text-white/40 uppercase tracking-wider mb-3">How to Scan</p>
              {[
                '1. Stand 6–8 feet from your camera',
                '2. Ensure full body is visible in frame',
                '3. Stand in good, even lighting',
                '4. Hold still for 3 seconds during scan',
                '5. Results auto-generate after scan',
              ].map((step) => (
                <p key={step} className="text-xs text-white/40 mb-1.5">{step}</p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
