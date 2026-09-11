"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { AlertTriangle, Video } from "lucide-react";

interface WebcamProctorProps {
  onWarning: (reason: string) => void;
}

export const playWarningSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'sawtooth'; 
    oscillator.frequency.value = 360; 
    gainNode.gain.value = 0.2;

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start();
    
    setTimeout(() => {
      oscillator.stop();
      ctx.close(); 
    }, 400);
  } catch (error) {
    console.warn("Gagal memutar suara peringatan:", error);
  }
};

export default function WebcamProctor({ onWarning }: WebcamProctorProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraStarted, setCameraStarted] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const isGracePeriod = useRef(false);
  
  const [fakeWarningMsg, setFakeWarningMsg] = useState<string | null>(null);

  const triggerWarning = useCallback((reason: string) => {
    playWarningSound();

    setTimeout(() => {
      onWarning(reason);
    }, 50);
  }, [onWarning]);

  const triggerGracePeriod = () => {
    isGracePeriod.current = true;
    setTimeout(() => {
      isGracePeriod.current = false;
    }, 5000);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user" },
        audio: false 
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasPermission(true);
    } catch (err) {
      console.error("Gagal akses kamera:", err);
      setHasPermission(false);
    }
  };

  const handleEnableCamera = () => {
    setCameraStarted(true);
    startCamera();
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);


  useEffect(() => {
    if (!hasPermission) return;

    const onVisibilityChange = () => {
      if (document.hidden && !isGracePeriod.current) {
        triggerWarning("Anda terdeteksi berpindah tab atau meminimalkan browser!");
        triggerGracePeriod();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [hasPermission, triggerWarning]);

  
  useEffect(() => {
    if (!hasPermission) return;

    const sensorInterval = setInterval(() => {
     
      if (isGracePeriod.current || fakeWarningMsg !== null) return;

      if (!streamRef.current || !streamRef.current.active) {
        playWarningSound();
        setFakeWarningMsg("Kamera terputus. Sistem sedang mencoba menghubungkan kembali...");
        startCamera(); 
        triggerGracePeriod();
        return;
      }

      if (videoRef.current && videoRef.current.readyState === 4) {
        const canvas = document.createElement("canvas");
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext("2d");
        
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          const frameData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
          let sum = 0;
          
          for (let i = 0; i < frameData.length; i += 40) {
            sum += 0.2126 * frameData[i] + 0.7152 * frameData[i + 1] + 0.0722 * frameData[i + 2];
          }
          const avgBrightness = sum / (frameData.length / 40);
          
          if (avgBrightness < 20) {
            playWarningSound();
          
            setFakeWarningMsg("Kamera tertutup atau ruangan terlalu gelap!\n\nMohon pastikan wajah Anda terlihat jelas untuk menghindari diskualifikasi.");
            triggerGracePeriod();
          }
        }
      }
    }, 3000);

    return () => clearInterval(sensorInterval);
  }, [hasPermission, fakeWarningMsg]);

  useEffect(() => {
    if (hasPermission && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [hasPermission]);

  if (!cameraStarted) {
    return (
      <div className="fixed inset-0 z-[999999] bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full text-center animate-in zoom-in duration-300">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-blue-100">
            <Video className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-3">Nyalakan Kamera</h2>
          <p className="text-gray-600 mb-8 text-sm leading-relaxed font-medium">
            Tes ini diawasi menggunakan kamera untuk menjaga integritas ujian. Klik tombol di bawah, lalu izinkan akses kamera saat diminta oleh browser Anda.
          </p>
          <button
            onClick={handleEnableCamera}
            className="w-full bg-[#242467] hover:bg-[#1a1a52] text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-[0_4px_14px_0_rgba(36,36,103,0.39)] hover:shadow-[0_6px_20px_rgba(36,36,103,0.23)] flex items-center justify-center hover:-translate-y-0.5"
          >
            <Video className="w-5 h-5 mr-2" />
            Nyalakan Kamera
          </button>
        </div>
      </div>
    );
  }

  if (hasPermission === null) {
    return (
      <div className="fixed inset-0 z-[999999] bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-lg font-bold text-gray-900">Menunggu izin kamera...</h2>
          <p className="text-gray-500 text-sm mt-2">Silakan klik &quot;Izinkan&quot; pada dialog izin kamera dari browser Anda.</p>
        </div>
      </div>
    );
  }

  if (hasPermission === false) {
    return (
      <div className="fixed inset-0 z-[999999] bg-black/95 flex flex-col items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl max-w-md w-full text-center border-b-4 border-red-500">
          <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Kamera Diblokir!</h2>
          <p className="text-gray-600 mb-6">
            Sistem pengawasan ujian mewajibkan akses kamera. Silakan izinkan akses kamera di pengaturan situs/browser Anda, lalu coba lagi.
          </p>
          <button
            onClick={handleEnableCamera}
            className="w-full bg-[#242467] hover:bg-[#1a1a52] text-white font-bold py-3 px-4 rounded-xl transition-all"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
     
      {fakeWarningMsg && (
        <div className="fixed inset-0 z-[9999999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in duration-200">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-8 h-8 text-yellow-500 mr-3 flex-shrink-0" />
              <h3 className="text-xl font-bold text-gray-900">Peringatan Pengawasan</h3>
            </div>
            <div className="mb-8 text-gray-600 font-medium leading-relaxed whitespace-pre-line">
              {fakeWarningMsg}
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setFakeWarningMsg(null)}
                className="px-5 py-2.5 rounded-xl font-bold bg-[#1e1e54] text-white hover:bg-[#15153f] transition-colors"
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        </div>
      )}

  
      <div className="fixed bottom-6 right-6 z-[9999] w-36 h-auto bg-black rounded-xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.5)] border-2 border-gray-700">
        <div className="absolute top-2 left-2 flex items-center bg-black/60 px-2 py-1 rounded text-white text-[10px] font-bold z-10 backdrop-blur-sm">
          <div className="w-2 h-2 bg-red-500 rounded-full mr-1.5 animate-pulse"></div>
          REC
        </div>
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform -scale-x-100" />
      </div>
    </>
  );
}