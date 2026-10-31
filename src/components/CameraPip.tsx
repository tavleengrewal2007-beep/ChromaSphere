import React, { useEffect, useRef, useState } from 'react';
import { Camera as CameraIcon, CameraOff, ChevronDown, ChevronUp, Hand } from 'lucide-react';

interface CameraPipProps {
  active: boolean;
  onTensionChange: (tension: number) => void;
  onToggleActive: () => void;
}

declare global {
  interface Window {
    Hands?: any;
    Camera?: any;
    drawConnectors?: any;
    drawLandmarks?: any;
    HAND_CONNECTIONS?: any;
  }
}

export const CameraPip: React.FC<CameraPipProps> = ({
  active,
  onTensionChange,
  onToggleActive,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('Initializing...');
  const [hasCameraError, setHasCameraError] = useState(false);
  const [handDetected, setHandDetected] = useState(false);
  const cameraInstanceRef = useRef<any>(null);
  const handsInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!active) {
      if (cameraInstanceRef.current) {
        try {
          cameraInstanceRef.current.stop();
        } catch {
          // ignore
        }
      }
      onTensionChange(1.0);
      return;
    }

    let isMounted = true;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d');

    const calculateTension = (landmarks: Array<{ x: number; y: number; z: number }>) => {
      const wrist = landmarks[0];
      const fingertips = [4, 8, 12, 16, 20];

      let avgDistance = 0;
      for (const tip of fingertips) {
        const finger = landmarks[tip];
        const dist = Math.hypot(finger.x - wrist.x, finger.y - wrist.y, finger.z - wrist.z);
        avgDistance += dist;
      }
      avgDistance /= fingertips.length;

      // Normal open hand ranges ~0.2 (fist) to ~0.45 (spread)
      let tension = (avgDistance - 0.2) * (2.2 - 0.4) / (0.45 - 0.2) + 0.4;
      tension = Math.max(0.35, Math.min(tension, 2.6));
      return tension;
    };

    const setupMediaPipe = () => {
      if (!window.Hands || !window.Camera) {
        setStatusMessage('MediaPipe loading...');
        setTimeout(setupMediaPipe, 500);
        return;
      }

      try {
        const hands = new window.Hands({
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
        });

        hands.setOptions({
          maxNumHands: 2,
          modelComplexity: 1,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        hands.onResults((results: any) => {
          if (!isMounted) return;
          if (ctx) {
            ctx.save();
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
              setHandDetected(true);
              setStatusMessage('Hand Tracked');
              let totalTension = 0;

              for (const landmarks of results.multiHandLandmarks) {
                // Draw delicate glowing landmarks on canvas overlay
                if (window.drawConnectors && window.HAND_CONNECTIONS) {
                  window.drawConnectors(ctx, landmarks, window.HAND_CONNECTIONS, {
                    color: '#00ffcc',
                    lineWidth: 2,
                  });
                }
                if (window.drawLandmarks) {
                  window.drawLandmarks(ctx, landmarks, {
                    color: '#ff007f',
                    lineWidth: 1,
                    radius: 3,
                  });
                }
                totalTension += calculateTension(landmarks);
              }

              const avgTension = totalTension / results.multiHandLandmarks.length;
              onTensionChange(avgTension);
            } else {
              setHandDetected(false);
              setStatusMessage('Show hand in frame');
              onTensionChange(1.0);
            }
            ctx.restore();
          }
        });

        handsInstanceRef.current = hands;

        const camera = new window.Camera(video, {
          onFrame: async () => {
            if (handsInstanceRef.current && isMounted) {
              await handsInstanceRef.current.send({ image: video });
            }
          },
          width: 240,
          height: 180,
        });

        camera.start()
          .then(() => {
            if (isMounted) {
              setStatusMessage('Camera Active');
              setHasCameraError(false);
            }
          })
          .catch((err: any) => {
            console.warn('Camera access denied or failed:', err);
            if (isMounted) {
              setHasCameraError(true);
              setStatusMessage('Camera unavailable');
            }
          });

        cameraInstanceRef.current = camera;
      } catch (err) {
        console.warn('MediaPipe init error:', err);
        setHasCameraError(true);
        setStatusMessage('Tracker offline');
      }
    };

    setupMediaPipe();

    return () => {
      isMounted = false;
      if (cameraInstanceRef.current) {
        try {
          cameraInstanceRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, [active, onTensionChange]);

  if (!active) {
    return (
      <button
        onClick={onToggleActive}
        className="fixed bottom-24 left-6 z-20 flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 shadow-lg text-xs font-medium transition-all group backdrop-blur-md"
        title="Enable hand tracking camera"
      >
        <CameraIcon className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
        <span>Enable Hand Tracking</span>
      </button>
    );
  }

  return (
    <div
      className={`fixed bottom-24 left-6 z-20 rounded-2xl border border-white/10 bg-zinc-950/85 backdrop-blur-xl shadow-2xl overflow-hidden transition-all duration-300 ${
        isCollapsed ? 'w-48 h-12' : 'w-56'
      }`}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/5 bg-zinc-900/60 text-xs">
        <div className="flex items-center gap-2 truncate">
          <Hand
            className={`w-3.5 h-3.5 ${
              handDetected ? 'text-cyan-400' : 'text-zinc-500'
            }`}
          />
          <span className="text-zinc-300 font-medium truncate">
            {statusMessage}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-white/10 rounded text-zinc-400 hover:text-white transition-colors"
            title={isCollapsed ? 'Expand camera' : 'Minimize camera'}
          >
            {isCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onToggleActive}
            className="p-1 hover:bg-red-500/20 rounded text-zinc-400 hover:text-red-400 transition-colors"
            title="Turn off camera"
          >
            <CameraOff className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Video preview with landmark canvas overlay */}
      {!isCollapsed && (
        <div className="relative w-full aspect-[4/3] bg-black">
          <video
            ref={videoRef}
            className="w-full h-full object-cover scale-x-[-1]"
            playsInline
            muted
            autoPlay
          />
          <canvas
            ref={canvasRef}
            width={240}
            height={180}
            className="absolute inset-0 w-full h-full object-cover scale-x-[-1] pointer-events-none"
          />

          {hasCameraError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center bg-zinc-950/90 text-xs text-zinc-400">
              <CameraOff className="w-6 h-6 text-zinc-500 mb-1" />
              <span>Camera disabled. Mouse & touch controls remain fully active!</span>
            </div>
          )}

          <div className="absolute bottom-1 right-2 text-[10px] text-white/50 bg-black/60 px-1.5 py-0.5 rounded">
            Fist: Shrink • Open: Expand
          </div>
        </div>
      )}
    </div>
  );
};
