"use client";

import WebcamProctor from './webcamProctor'; 
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  Timer, User, Loader2, Maximize, 
  AlertCircle, ClipboardCheck, AlertTriangle, X
} from "lucide-react";

// const API_BASE_URL = 'https://api.lourdesautoparts.com';
const API_BASE_URL = '';

interface QuestionOption {
  option_id: number;
  option_text: string;
}

interface Question {
  question_id: number;
  test_id: number;
  question_text: string;
  order_number: number;
  options: QuestionOption[];
}

interface Answer {
  question_id: number;
  most_option_id?: number | null;
  least_option_id?: number | null; 
}

const isIOSDevice = () => {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
};

export default function DISC() {
  const router = useRouter();
  const params = useParams();
  const testId = params.id as string;
  
  const [user, setUser] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, Answer>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(1800);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState(true);
  
  const [isTimeUp, setIsTimeUp] = useState(false);
  const lastWarningTimeRef = useRef<number>(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [warningCount, setWarningCount] = useState(0);
  const warningCountRef = useRef(0); 
  const MAX_WARNINGS = 3;
  
  const isTestFinishedRef = useRef(false);
  const sessionIdRef = useRef<string | null>(null);
  const allowNavigationRef = useRef(false);

  const [dialog, setDialog] = useState<{
    isOpen: boolean;
    type: 'alert' | 'confirm';
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
  }>({
    isOpen: false,
    type: 'alert',
    title: '',
    message: ''
  });

  const showDialog = (config: {
    type: 'alert' | 'confirm';
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
  }) => {
    setDialog({ ...config, isOpen: true });
  };

  const closeDialog = () => {
    setDialog(prev => ({ ...prev, isOpen: false }));
  };

  const handleAutoSubmitTest = async () => {
    if (!sessionId || isTestFinishedRef.current) return;
    allowNavigationRef.current = true;
    isTestFinishedRef.current = true;
    setSaving(true);
    try {
      await fetch(`${API_BASE_URL}/api/testSessions/disc/finish/${sessionId}`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' } 
      });
      
      showDialog({
        type: 'alert',
        title: 'Sesi Berakhir',
        message: 'WAKTU HABIS ATAU PELANGGARAN MAKSIMAL!\nJawaban Anda telah disimpan secara otomatis.',
        confirmText: 'Kembali ke Beranda',
        onConfirm: () => {
          localStorage.removeItem(`current_session_${testId}`);
          localStorage.removeItem(`timer_disc_${sessionId}`);
          localStorage.removeItem(`warnings_disc_${sessionId}`);
          window.location.href = '/kandidat/dashboard';
        }
      });
    } catch (error) { 
      window.location.href = '/kandidat/dashboard'; 
    } finally { 
      setSaving(false); 
      setIsTimeUp(false); 
    }
  };

  const logViolationToDatabase = async (reason: string, count: number) => {
    if (!sessionId) return;
    
    try {
      await fetch(`${API_BASE_URL}/api/violations/log-violation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: parseInt(sessionId),
          violation_type: reason,
          warning_count: count
        })
      });
    } catch (error) {
      console.error("Gagal menyimpan catatan pelanggaran:", error);
    }
  };

  const handleWarning = useCallback((reason: string) => {
    if (isTestFinishedRef.current) return;
    
    const now = Date.now();
    if (now - lastWarningTimeRef.current < 2000) {
      return; 
    }
    lastWarningTimeRef.current = now; 
    
    warningCountRef.current += 1;
    const newCount = warningCountRef.current;
    
    logViolationToDatabase(reason, newCount);
    setWarningCount(newCount);

    
    if (sessionId) {
      localStorage.setItem(`warnings_disc_${sessionId}`, newCount.toString());
    }

    if (newCount >= MAX_WARNINGS) {
      showDialog({
        type: 'alert',
        title: 'Pelanggaran Maksimal',
        message: `PERINGATAN KECURANGAN (${newCount}/${MAX_WARNINGS}):\n${reason}\n\nAnda telah mencapai batas maksimal pelanggaran (3x). Ujian dihentikan paksa!`,
        confirmText: 'Akhiri Tes',
        onConfirm: () => handleAutoSubmitTest()
      });
    } else {
      showDialog({
        type: 'alert',
        title: 'Peringatan Kecurangan',
        message: `PERINGATAN KECURANGAN (${newCount}/${MAX_WARNINGS}):\n${reason}\n\nJangan keluar dari mode Layar Penuh!`,
        confirmText: 'Saya Mengerti'
      });
    }
  }, [sessionId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F12') {
        e.preventDefault();
        handleWarning("Akses DevTools dilarang!");
      }
      if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) {
        e.preventDefault();
        handleWarning("Akses shortcut DevTools dilarang!");
      }
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        handleWarning("Akses View Source dilarang!");
      }
      if (e.ctrlKey && (e.key === 's' || e.key === 'p')) {
        e.preventDefault();
        handleWarning("Aksi menyimpan atau mencetak halaman dilarang!");
      }
      if (e.metaKey && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        handleWarning("Aksi screenshot terdeteksi!");
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const onFullscreenChange = () => {
      const isFull = isIOSDevice() || !!document.fullscreenElement;
      setIsFullscreen(isFull);
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    setIsFullscreen(isIOSDevice() || !!document.fullscreenElement);

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (allowNavigationRef.current || isTestFinishedRef.current) return; 
      e.preventDefault();
      e.returnValue = "Apakah Anda yakin ingin meninggalkan tes?";
      return e.returnValue;
    };

    const handlePopState = () =>  {
      window.history.pushState(null, '', window.location.pathname);
      showDialog({
        type: 'alert',
        title: 'Aksi Dilarang',
        message: 'Anda tidak dapat kembali ke halaman sebelumnya selama tes berlangsung.'
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);
    window.history.pushState(null, '', window.location.pathname);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [handleWarning]);

  const enterFullscreen = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (error) {
      showDialog({
        type: 'alert',
        title: 'Gagal Mode Layar Penuh',
        message: 'Browser Anda memblokir mode Layar Penuh (Fullscreen). Izinkan melalui pengaturan browser.'
      });
    }
  };


  useEffect(() => {
    if (timeLeft <= 0 || isTimeUp || loading || !sessionId) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsTimeUp(true); 
          localStorage.removeItem(`timer_disc_${sessionId}`);
          return 0;
        }
        const newTime = prev - 1;
        localStorage.setItem(`timer_disc_${sessionId}`, newTime.toString());
        return newTime;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isTimeUp, loading, sessionId]);

  useEffect(() => {
    if (isTimeUp && !isTestFinishedRef.current) {
        handleAutoSubmitTest();
    }
  }, [isTimeUp]);


  useEffect(() => {
    startExam();
  }, [testId, router]);

  const startExam = async () => {
    try {
      setError(null);
      const userData = localStorage.getItem("user");
      if (!userData) { router.push("/"); return; }
      setUser(JSON.parse(userData));
      
      const savedSessionId = localStorage.getItem(`current_session_${testId}`);
      if (!savedSessionId) { router.push('/kandidat/dashboard'); return; }
      
      await verifySession(savedSessionId);
      await loadQuestionsAndAnswers(savedSessionId);
      
      setLoading(false);
    } catch (error: any) {
      setError(error.message || 'Gagal memulai tes');
      setLoading(false);
    }
  };

  const verifySession = async (sessionId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/testSessions/${sessionId}`);
      if (!response.ok) throw new Error('Sesi tidak ditemukan atau tidak valid');
      const sessionData = await response.json();
      
      if (sessionData.status === 'completed') {
        showDialog({
          type: 'alert',
          title: 'Tes Selesai',
          message: 'Tes ini sudah selesai dikerjakan.',
          onConfirm: () => router.push('/kandidat/dashboard')
        });
        return;
      }
      
      setSessionId(sessionId);
      sessionIdRef.current = sessionId;

      const savedWarnings = localStorage.getItem(`warnings_disc_${sessionId}`);
      if (savedWarnings) {
        const count = parseInt(savedWarnings);
        setWarningCount(count);
        warningCountRef.current = count;
      }

      const savedTime = localStorage.getItem(`timer_disc_${sessionId}`);
      if (savedTime) {
        setTimeLeft(parseInt(savedTime));
      } else if (sessionData.remaining_time) {
        setTimeLeft(sessionData.remaining_time);
      }

    } catch (error) {
      localStorage.removeItem(`current_session_${testId}`);
      router.push('/kandidat/dashboard');
      throw error;
    }
  };

  const loadQuestionsAndAnswers = async (sid: string) => {
    try {
      const resQ = await fetch(`${API_BASE_URL}/api/questions/test/${testId}`);
      if (!resQ.ok) throw new Error("Gagal memuat soal DISC");
      const data = await resQ.json();
      
      let qList: any[] = [];
      if (Array.isArray(data)) qList = data;
      else if (data.questions && Array.isArray(data.questions)) qList = data.questions;
      else if (data.data && Array.isArray(data.data)) qList = data.data;

      if (qList.length === 0) throw new Error('Belum ada soal untuk tes ini');

      const fullQuestions = await Promise.all(qList.map(async (q: any) => {
        try {
          const optRes = await fetch(`${API_BASE_URL}/api/questions/${q.question_id || q.id}/options`);
          let options = [];
          if (optRes.ok) {
            const optData = await optRes.json();
            options = optData.options || optData.data || (Array.isArray(optData) ? optData : []);
          }
          return { ...q, options };
        } catch {
          return { ...q, options: [] };
        }
      }));

      const sortedQuestions = fullQuestions.sort((a, b) => (a.order_number || 0) - (b.order_number || 0));
      setQuestions(sortedQuestions);

      try {
        const ansRes = await fetch(`${API_BASE_URL}/api/answer/session/${sid}`);
        if (ansRes.ok) {
           const ansData = await ansRes.json();
           const map: Record<number, Answer> = {};
           const existingAnswers = Array.isArray(ansData) ? ansData : (ansData.answers || []);
           
           existingAnswers.forEach((a: any) => { 
             map[a.question_id] = { 
               question_id: a.question_id, 
               most_option_id: a.most_option_id || null,
               least_option_id: a.least_option_id || null
             }; 
           });
           setAnswers(map);
        }
      } catch (e) {
        console.warn("Gagal memuat jawaban existing");
      }
    } catch (error) {
      throw error;
    }
  };


  const handleSelect = (qId: number, optionId: number, type: 'M' | 'L') => {
    setAnswers(prev => {
      const current = prev[qId] || { question_id: qId, most_option_id: null, least_option_id: null };
      const updated = { ...current };

      if (type === 'M') {
        updated.most_option_id = optionId;
        if (updated.least_option_id === optionId) updated.least_option_id = null;
      } else {
        updated.least_option_id = optionId;
        if (updated.most_option_id === optionId) updated.most_option_id = null;
      }

      saveDISCAnswer(qId, updated.most_option_id, updated.least_option_id);
      return { ...prev, [qId]: updated };
    });
  };

  const saveDISCAnswer = useCallback(async (qId: number, mostId: number | null | undefined, leastId: number | null | undefined) => {
    if (!sessionId) return;
    setSaving(true);
    
    try {
      await fetch(`${API_BASE_URL}/api/answer`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          session_id: parseInt(sessionId), 
          question_id: qId, 
          most_option_id: mostId,
          least_option_id: leastId
        })
      });
    } catch (error) {
      console.error("Gagal save:", error);
    } finally {
      setSaving(false);
    }
  }, [sessionId]);

  const executeSubmitTest = async () => {
    allowNavigationRef.current = true;
    isTestFinishedRef.current = true;
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/testSessions/disc/finish/${sessionId}`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' } 
      });
      const result = await response.json();
      
      if (!response.ok) {
        if (result.code === 'ALREADY_COMPLETED') {
          showDialog({
            type: 'alert',
            title: 'Info',
            message: 'Tes ini sudah diselesaikan sebelumnya.',
            onConfirm: () => {
              localStorage.removeItem(`current_session_${testId}`);
              localStorage.removeItem(`timer_disc_${sessionId}`);
              localStorage.removeItem(`warnings_disc_${sessionId}`);
              router.push('/kandidat/dashboard');
            }
          });
          return;
        }
        throw new Error(result.message || 'Gagal menyelesaikan tes');
      }
      
      showDialog({
        type: 'alert',
        title: 'Tes Selesai 🎉',
        message: 'TES SELESAI!\nTerima kasih telah mengerjakan tes ini.',
        onConfirm: () => {
          localStorage.removeItem(`current_session_${testId}`);
          localStorage.removeItem(`timer_disc_${sessionId}`);
          localStorage.removeItem(`warnings_disc_${sessionId}`);
          router.push('/kandidat/dashboard');
        }
      });
      
    } catch (error: any) { 
      showDialog({
        type: 'alert',
        title: 'Terjadi Kesalahan',
        message: `Error: ${error.message || 'Gagal menyelesaikan tes'}`
      });
    } finally { 
      setSaving(false); 
    }
  };

  const DynamicWatermark = ({ text }: { text: string }) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden opacity-[0.20] select-none flex flex-wrap gap-20 justify-center items-center p-10">
      {Array.from({ length: 20 }).map((_, i) => (
        <div key={i} className="text-2xl font-bold rotate-[-30deg] whitespace-nowrap">
          {text}
        </div>
      ))}
    </div>
  );
};

  const handleSubmitTest = () => {
    if (!sessionId) return;
    
    const completeAnswersCount = questions.filter(q => {
      const ans = answers[q.question_id];
      return ans && ans.most_option_id !== null && ans.least_option_id !== null;
    }).length;
    
    if (completeAnswersCount < questions.length) {
      showDialog({
        type: 'confirm',
        title: 'Belum Selesai',
        message: `Anda baru menyelesaikan ${completeAnswersCount} dari ${questions.length} soal secara utuh (Mempunyai jawaban P dan K).\n\nApakah Anda YAKIN ingin mengakhiri Tes sekarang?`,
        confirmText: 'Ya, Akhiri Tes',
        cancelText: 'Kembali Melanjutkan',
        onConfirm: () => executeSubmitTest()
      });
    } else {
      showDialog({
        type: 'confirm',
        title: 'Konfirmasi Selesai',
        message: 'Apakah Anda yakin ingin menyelesaikan Tes ini?\nPastikan tidak ada jawaban yang terlewat.',
        confirmText: 'Selesaikan',
        cancelText: 'Batal',
        onConfirm: () => executeSubmitTest()
      });
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    const displayHours = h > 0 ? `${h.toString().padStart(2, '0')}:` : '';
    const displayMinutes = m.toString().padStart(2, '0');
    const displaySeconds = s.toString().padStart(2, '0');
    return h > 0 ? `${displayHours}${displayMinutes}:${displaySeconds}` : `${displayMinutes}:${displaySeconds}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#242467] mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Memuat Lembar Tes</h2>
          <p className="text-gray-600 mb-6">Mempersiapkan lembar instrumen...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Terjadi Kesalahan</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button onClick={() => router.push('/kandidat/dashboard')} className="w-full bg-[#242467] hover:bg-[#1a1a52] text-white py-3 rounded-lg font-medium transition-colors">
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  const completeAnswersCount = questions.filter(q => {
    const ans = answers[q.question_id];
    return ans && ans.most_option_id !== null && ans.least_option_id !== null;
  }).length;

  return (
    <div className={`min-h-screen bg-gray-100 flex flex-col font-sans ${!isFullscreen ? 'overflow-hidden' : ''}`}>
      
      {dialog.isOpen && (
        <div className="fixed inset-0 z-[9999999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in duration-200">
            <div className="flex items-center mb-4">
              {dialog.type === 'confirm' ? <AlertTriangle className="w-7 h-7 text-yellow-500 mr-3" /> : <AlertCircle className="w-7 h-7 text-[#242467] mr-3" />}
              <h3 className="text-xl font-bold text-gray-900">{dialog.title}</h3>
            </div>
            <div className="mb-8 text-gray-600 whitespace-pre-line leading-relaxed">
              {dialog.message}
            </div>
            <div className="flex justify-end space-x-3">
              {dialog.type === 'confirm' && (
                <button onClick={closeDialog} className="px-5 py-2.5 rounded-lg font-bold bg-gray-100 text-gray-700 hover:bg-gray-200">
                  {dialog.cancelText || 'Batal'}
                </button>
              )}
              <button onClick={() => { if (dialog.onConfirm) dialog.onConfirm(); closeDialog(); }} className="px-5 py-2.5 rounded-lg font-bold bg-[#242467] text-white hover:bg-[#1a1a52]">
                {dialog.confirmText || 'Oke'}
              </button>
            </div>
          </div>
        </div>
      )}

      {user && <DynamicWatermark text={`${user.email} - ${user.name}`} />}

      <WebcamProctor onWarning={handleWarning} />
      
      {!isFullscreen && (
        <div className="fixed inset-0 z-[99999] bg-black/95 flex flex-col items-center justify-center p-6">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full text-center">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-blue-100">
              <Maximize className="w-10 h-10 text-[#242467]" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-3">Layar Penuh Diwajibkan</h2>
            <p className="text-gray-600 mb-8 text-sm font-medium">Sistem mendeteksi Anda keluar dari mode layar penuh. Silakan kembali untuk melanjutkan tes.</p>
            <button 
            onClick={enterFullscreen} 
            className="w-full bg-[#242467] hover:bg-[#1a1a52] text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center transition-all shadow-md">
              <Maximize className="w-5 h-5 mr-2 inline" /> Aktifkan Kembali Layar Penuh
            </button>
          </div>
        </div>
      )}

      <header className="bg-[#1e1e54] text-white px-6 py-4 shadow-md flex justify-between items-center z-10 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="bg-white/10 px-4 py-2 text-[25px] rounded-lg font-mono text-lg font-bold flex items-center border border-white/20">
             <Timer className={`w-5 h-5 mr-2 ${timeLeft < 300 ? 'text-red-400 animate-pulse' : 'text-gray-200'}`} /> 
             <span className={timeLeft < 300 ? 'text-red-400 animate-pulse' : 'text-gray-100'}>{formatTime(timeLeft)}</span>
          </div>
          <div className="hidden md:flex flex-col justify-center">
            <h1 className="font-bold text-lg leading-tight tracking-wide">DISC Personality Test</h1>
            <p className="text-blue-200 text-xs flex items-center mt-0.5">
              Terjawab Penuh: {completeAnswersCount} / {questions.length} 
              {saving && <span className="ml-3 flex items-center text-yellow-300 font-bold"><Loader2 className="w-3 h-3 mr-1 animate-spin"/>Menyimpan...</span>}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          {warningCount > 0 && (
            <div className="hidden sm:flex items-center bg-red-500/20 text-red-200 px-3 py-1.5 rounded-lg border border-red-500/30">
              <AlertTriangle className="w-4 h-4 mr-2 animate-pulse text-red-400" />
              <span className="text-sm font-bold">Pelanggaran: {warningCount}/{MAX_WARNINGS}</span>
            </div>
          )}

          <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-200 bg-white/5 px-3 py-1.5 rounded-lg">
            <User className="w-4 h-4 text-blue-200" />
            <span className="font-medium truncate max-w-[120px]">{user?.name?.split(' ')[0]}</span>
          </div>

          <button 
            onClick={handleSubmitTest} 
            disabled={saving} 
            className="bg-[#10b981] hover:bg-[#059669] text-white px-5 py-2.5 font-bold text-sm rounded-lg transition-all flex items-center justify-center shadow-md disabled:opacity-50 hover:-translate-y-0.5"
          >
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <ClipboardCheck className="w-4 h-4 mr-2" />}
            Kumpulkan Tes
          </button>
        </div>
      </header>

      <div className="w-full bg-gray-200 h-1 flex-shrink-0">
        <div className="bg-[#10b981] h-1 transition-all duration-500" style={{ width: `${(completeAnswersCount / questions.length) * 100}%` }} />
      </div>
      
      <main className="flex-1 w-full mx-auto px-2 md:px-8 py-8 overflow-y-auto bg-[#f8f9fc]">
        <div className="max-w-[1400px] mx-auto bg-white p-4 md:p-8 shadow-xl rounded-xl border border-gray-200">
          
          {showInstructions && (
            <div className="border border-[#242467] mb-8 shadow-sm rounded-lg overflow-hidden">
              <div className="bg-[#242467] text-white px-5 py-3 font-bold text-lg flex justify-between items-center">
                <span>INSTRUKSI PENGERJAAN</span>
                <button onClick={() => setShowInstructions(false)} className="hover:text-gray-300">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="bg-[#f8f9fc] p-5 md:p-6 text-gray-900 text-sm md:text-base border-t border-[#242467]">
                <p className="mb-3 font-medium">Setiap nomor di bawah ini memuat 4 (empat) kalimat. Tugas anda adalah :</p>
                <ol className="pl-6 list-decimal space-y-2 mb-4">
                  <li>Beri tanda/cek pada kolom di bawah huruf <span className="font-bold text-[#242467] px-1 bg-blue-100 rounded">[P]</span> di samping kalimat yang <span className="font-bold underline text-[#242467]">PALING</span> menggambarkan diri anda</li>
                  <li>Beri tanda/cek pada kolom di bawah huruf <span className="font-bold text-[#242467] px-1 bg-blue-100 rounded">[K]</span> di samping kalimat yang <span className="font-bold underline text-[#242467]">PALING TIDAK</span> menggambarkan diri anda</li>
                </ol>
                <div className="flex p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 mr-2 text-blue-600 flex-shrink-0" />
                  <p className="text-blue-800 font-semibold text-sm">
                    Penting: Anda harus memilih tepat 1 jawaban P dan 1 jawaban K untuk setiap nomor soal. Keduanya tidak boleh berada di baris kalimat yang sama.
                  </p>
                </div>
              </div>
            </div>
          )}
          {!showInstructions && (
            <div className="mb-6 flex justify-end">
              <button onClick={() => setShowInstructions(true)} className="text-sm font-bold text-[#242467] hover:underline flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                Tampilkan Instruksi
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 w-full border-t border-l border-gray-300 rounded-t-lg overflow-hidden">
            {questions.map((q, idx) => {
              const isBlueColumn = (idx % 4 === 1) || (idx % 4 === 3);
              const bgColorClass = isBlueColumn ? 'bg-[#eff2fc]' : 'bg-white';
              
              const currentAns = answers[q.question_id];

              return (
                <div key={q.question_id} className={`border-r border-b border-gray-300 flex flex-col ${bgColorClass} min-h-[220px]`}>
                  
                  <div className="flex bg-[#242467] text-white text-xs md:text-sm font-bold p-2.5 items-center border-b border-[#242467]">
                    <div className="w-8 text-center">No</div>
                    <div className="flex-1 px-2">Gambaran Diri</div>
                    <div className="w-8 text-center">P</div>
                    <div className="w-8 text-center">K</div>
                  </div>
                  
                  <div className="flex p-2 flex-1">
                    <div className="w-8 text-center font-black text-gray-900 pt-1.5">{idx + 1}</div>
                    
                    <div className="flex-1 flex flex-col justify-between">
                      {q.options && q.options.map((opt) => {
                         const isMost = currentAns?.most_option_id === opt.option_id;
                         const isLeast = currentAns?.least_option_id === opt.option_id;

                         return (
                           <div key={opt.option_id} className="flex mb-3 items-center min-h-[36px] hover:bg-[#242467]/10 rounded p-1 transition-colors">
                             
                             <div className="flex-1 text-xs md:text-[13px] pr-2 text-gray-900 font-medium leading-tight">
                               {opt.option_text}
                             </div>
                             
                             <div className="w-8 flex justify-center items-center">
                               <input 
                                 type="radio" 
                                 name={`q_${q.question_id}_P`} 
                                 checked={isMost}
                                 onChange={() => handleSelect(q.question_id, opt.option_id, 'M')}
                                 className="w-4 h-4 text-[#242467] bg-white border-gray-400 focus:ring-[#242467] focus:ring-offset-1 cursor-pointer"
                                 title="Paling Menggambarkan"
                               />
                             </div>
                             
                             <div className="w-8 flex justify-center items-center">
                               <input 
                                 type="radio" 
                                 name={`q_${q.question_id}_K`} 
                                 checked={isLeast}
                                 onChange={() => handleSelect(q.question_id, opt.option_id, 'L')}
                                 className="w-4 h-4 text-[#242467] bg-white border-gray-400 focus:ring-[#242467] focus:ring-offset-1 cursor-pointer"
                                 title="Paling Tidak Menggambarkan"
                               />
                             </div>
                             
                           </div>
                         );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-10 flex flex-col items-center border-t border-gray-200 pt-8">
            <button 
              onClick={handleSubmitTest}
              className="px-10 py-4 bg-[#242467] hover:bg-[#1a1a52] text-white font-bold text-lg rounded-xl shadow-lg transition-transform hover:-translate-y-1 flex items-center"
            >
              <ClipboardCheck className="w-6 h-6 mr-3" />
              Selesai dan Kumpulkan Tes
            </button>
          </div>

        </div>

        
      </main>

      {isTimeUp && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[99999999]">
          <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-2xl animate-in zoom-in border-b-4 border-red-500">
            <Timer className="w-20 h-20 text-red-500 mx-auto mb-6 animate-bounce" />
            <h2 className="text-3xl font-black text-gray-900 mb-3">WAKTU HABIS!</h2>
            <p className="text-gray-600 mb-8 font-medium leading-relaxed">Waktu pengerjaan tes Anda telah habis. Sistem sedang memproses dan menyimpan jawaban Anda secara otomatis.</p>
            <div className="flex justify-center"><Loader2 className="w-10 h-10 text-[#1e1e54] animate-spin" /></div>
          </div>
        </div>
      )}

      <footer className="bg-[#1e1e54] text-white/50 text-center py-4 text-xs flex-shrink-0 font-medium">
        <div className="container mx-auto px-4">SISTEM TERKUNCI • Jangan menutup atau merefresh halaman ini</div>
      </footer>

    </div>
  ); 
}