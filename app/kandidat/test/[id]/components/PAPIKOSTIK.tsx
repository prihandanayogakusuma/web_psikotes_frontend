

"use client";

import WebcamProctor from './webcamProctor';
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  Timer, User, ArrowLeft, ArrowRight, CheckCircle, 
  Loader2, Maximize, AlertCircle, FileText, ClipboardCheck, AlertTriangle 
} from "lucide-react";

const API_BASE_URL = 'https://api.lourdesautoparts.com';


interface QuestionOption {
  option_id: number;
  option_text: string;
  score_key?: string;
  score_value?: number;
}

interface Question {
  question_id: number;
  test_id: number;
  section_id: number;
  question_text: string;
  question_type: string;
  order_number: number;
  papi_statement_a?: string;
  papi_statement_b?: string;
  options?: QuestionOption[];
}

interface Answer {
  question_id: number;
  papi_choice?: 'A' | 'B';
  answered_at?: string;
}

const isIOSDevice = () => {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
};

export default function PAPI() {
  const router = useRouter();
  const params = useParams();
  const testId = params.id as string;
  
  const [user, setUser] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, Answer>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(1800);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const lastWarningTimeRef = useRef<number>(0);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [warningCount, setWarningCount] = useState(0);
  const warningCountRef = useRef(0); 
  const MAX_WARNINGS = 3;

  
  
  const isTestFinishedRef = useRef(false);
  const sessionIdRef = useRef<string | null>(null);
  const allowNavigationRef = useRef(false);

  const currentQ = questions[currentQuestionIndex];
  const currentAnswer = currentQ ? answers[currentQ.question_id] : undefined;

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
      await fetch(`${API_BASE_URL}/api/testSessions/papi/finish/${sessionId}`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' } 
      });
      
      showDialog({
        type: 'alert',
        title: 'Sesi Berakhir',
        message: 'WAKTU HABIS ATAU PELANGGARAN MAKSIMAL!\nJawaban Anda telah disimpan secara otomatis.',
        confirmText: 'Kembali ke Dashboard',
        onConfirm: () => {
          localStorage.removeItem(`current_session_${testId}`);
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

    localStorage.setItem(`warnings_papi_${sessionId}`, newCount.toString());

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
        message: `PERINGATAN KECURANGAN (${newCount}/${MAX_WARNINGS}):\n${reason}\n\nJangan keluar dari mode Fullscreen!`,
        confirmText: 'Saya Mengerti'
      });
    }
  }, [sessionId]);

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
        title: 'Gagal Fullscreen',
        message: 'Browser Anda memblokir mode Fullscreen. Izinkan melalui pengaturan browser.'
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
          localStorage.removeItem(`timer_papi_${sessionId}`);
          return 0;
        }
        const newTime = prev - 1;
        localStorage.setItem(`timer_papi_${sessionId}`, newTime.toString());
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
      setError(error.message || 'Gagal memulai tes PAPIKOSTIK');
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

      const savedWarnings = localStorage.getItem(`warnings_papi_${sessionId}`);
      if (savedWarnings) {
        const count = parseInt(savedWarnings);
        setWarningCount(count);
        warningCountRef.current = count;
      }

      const savedTime = localStorage.getItem(`timer_papi_${sessionId}`);
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
      if (!resQ.ok) throw new Error("Gagal memuat soal PAPI");
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
             if (a.papi_choice) map[a.question_id] = { question_id: a.question_id, papi_choice: a.papi_choice }; 
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

 
  const savePAPIAnswer = useCallback(async (qId: number, choice: 'A' | 'B') => {
    if (!sessionId) return;
    
    setAnswers(prev => ({ ...prev, [qId]: { question_id: qId, papi_choice: choice } }));
    setSaving(true);
    
    try {
      await fetch(`${API_BASE_URL}/api/answer`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          session_id: parseInt(sessionId), 
          question_id: qId, 
          papi_choice: choice 
        })
      });
      
      if (currentQuestionIndex < questions.length - 1) {
        setTimeout(() => setCurrentQuestionIndex(prev => prev + 1), 300);
      }
    } catch (error) {
      console.error("Gagal auto-save:", error);
    } finally {
      setSaving(false);
    }
  }, [sessionId, currentQuestionIndex, questions.length]);

  const executeSubmitTest = async () => {
    allowNavigationRef.current = true;
    isTestFinishedRef.current = true;
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/testSessions/papi/finish/${sessionId}`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' } 
      });
      const result = await response.json();
      
      if (!response.ok) {
        if (result.code === 'ALREADY_COMPLETED') {
          showDialog({
            type: 'alert',
            title: 'Info',
            message: 'Tes Papikostik sudah diselesaikan sebelumnya.',
            onConfirm: () => {
              localStorage.removeItem(`current_session_${testId}`);
              router.push('/kandidat/dashboard');
            }
          });
          return;
        }
        throw new Error(result.message || 'Gagal menyelesaikan tes Papikostik');
      }
      
      showDialog({
        type: 'alert',
        title: 'Tes Selesai 🎉',
        message: 'TES PAPIKOSTIK SELESAI!\nTerima kasih telah mengerjakan tes ini.',
        onConfirm: () => {
          localStorage.removeItem(`current_session_${testId}`);
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

  const handleSubmitTest = () => {
    if (!sessionId) return;
    const answeredCount = Object.keys(answers).length;
    
    if (answeredCount < questions.length) {
      showDialog({
        type: 'confirm',
        title: 'Konfirmasi Selesai',
        message: `Tunggu dulu! Anda baru menjawab ${answeredCount} dari ${questions.length} soal.\n\nApakah Anda YAKIN ingin menyelesaikan Tes Papikostik sekarang?`,
        confirmText: 'Ya, Akhiri Tes',
        cancelText: 'Lanjut Mengerjakan',
        onConfirm: () => executeSubmitTest()
      });
    } else {
      showDialog({
        type: 'confirm',
        title: 'Konfirmasi Selesai',
        message: 'Apakah Anda yakin ingin menyelesaikan Tes Papikostik?\nSetelah diselesaikan, Anda tidak dapat mengubah jawaban.',
        confirmText: 'Ya, Selesaikan',
        cancelText: 'Batal',
        onConfirm: () => executeSubmitTest()
      });
    }
  };


  const goToQuestion = (index: number) => { 
    if (index >= 0 && index < questions.length) setCurrentQuestionIndex(index); 
  };
  const goToNextQuestion = () => { 
    if (currentQuestionIndex < questions.length - 1) setCurrentQuestionIndex(prev => prev + 1); 
  };
  const goToPrevQuestion = () => { 
    if (currentQuestionIndex > 0) setCurrentQuestionIndex(prev => prev - 1); 
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

  const getQuestionStatus = (question: Question) => {
    const isAnswered = answers[question.question_id]?.papi_choice !== undefined;
    return { isAnswered, isComplete: isAnswered };
  };


  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#1e1e54] mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Memuat Tes PAPIKOSTIK</h2>
          <p className="text-gray-600 mb-6">Sedang mempersiapkan soal untuk Anda...</p>
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
          <button 
            onClick={() => router.push('/kandidat/dashboard')} 
            className="w-full bg-[#1e1e54] hover:bg-[#15153f] text-white py-3 rounded-lg font-medium transition-colors"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  const optionA = currentQ?.options?.find(o => o.score_key === 'A')?.option_text || currentQ?.papi_statement_a || "Pernyataan A";
  const optionB = currentQ?.options?.find(o => o.score_key === 'B')?.option_text || currentQ?.papi_statement_b || "Pernyataan B";

  const answeredTotal = Object.keys(answers).length;
  const progressPercentage = questions.length > 0 ? (answeredTotal / questions.length) * 100 : 0;

  return (
    <div className={`min-h-screen bg-[#f3f4f6] flex flex-col ${!isFullscreen ? 'overflow-hidden' : ''}`}>
      
      {dialog.isOpen && (
        <div className="fixed inset-0 z-[9999999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in duration-200">
            <div className="flex items-center mb-4">
              {dialog.type === 'confirm' ? (
                <AlertTriangle className="w-8 h-8 text-yellow-500 mr-3 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-8 h-8 text-blue-500 mr-3 flex-shrink-0" />
              )}
              <h3 className="text-xl font-bold text-gray-900">{dialog.title}</h3>
            </div>
            <div className="mb-8 text-gray-600 whitespace-pre-line leading-relaxed font-medium">
              {dialog.message}
            </div>
            <div className="flex justify-end space-x-3">
              {dialog.type === 'confirm' && (
                <button
                  onClick={() => {
                    if (dialog.onCancel) dialog.onCancel();
                    closeDialog();
                  }}
                  className="px-5 py-2.5 rounded-xl font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  {dialog.cancelText || 'Batal'}
                </button>
              )}
              <button
                onClick={() => {
                  if (dialog.onConfirm) dialog.onConfirm();
                  closeDialog();
                }}
                className="px-5 py-2.5 rounded-xl font-bold bg-[#1e1e54] text-white hover:bg-[#15153f] transition-colors"
              >
                {dialog.confirmText || 'Oke, Mengerti'}
              </button>
            </div>
          </div>
        </div>
      )}

            {user && <DynamicWatermark text={`${user.email} - ${user.name}`} />}


          <WebcamProctor onWarning={handleWarning} />
     
      
      {!isFullscreen && (
        <div className="fixed inset-0 z-[99999] bg-black/90 flex flex-col items-center justify-center p-6">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full text-center">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-blue-100">
              <Maximize className="w-10 h-10 text-[#1e1e54]" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-3">Layar Penuh Diwajibkan</h2>
            <p className="text-gray-600 mb-8 text-sm leading-relaxed font-medium">Sistem mendeteksi Anda keluar dari mode layar penuh. Untuk menjaga integritas dan fokus selama tes, Anda diwajibkan untuk kembali ke mode Full Screen.</p>
            <button 
              onClick={enterFullscreen} 
              className="w-full bg-[#1e1e54] hover:bg-[#15153f] text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center transition-all hover:-translate-y-0.5 shadow-md"
            >
              <Maximize className="w-5 h-5 mr-2 inline" /> Aktifkan Kembali Full Screen
            </button>
          </div>
        </div>
      )}

      <header className="bg-[#242467] text-white px-6 py-4 shadow-lg flex justify-between items-center z-10 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="bg-white/10 px-4 py-2 text-[25px] rounded-lg font-mono text-lg font-bold flex items-center border border-white/20">
             <Timer className={`w-5 h-5 mr-2 ${timeLeft < 300 ? 'text-red-400 animate-pulse' : 'text-gray-200'}`} /> 
             <span className={timeLeft < 300 ? 'text-red-400 animate-pulse' : 'text-gray-100'}>
               {formatTime(timeLeft)}
             </span>
          </div>
          <div className="hidden md:flex flex-col justify-center">
            <h1 className="font-bold text-lg leading-tight">Tes Kepribadian (Papikostik)</h1>
            <p className="text-blue-200 text-xs flex items-center mt-0.5">
              Soal {currentQuestionIndex + 1} dari {questions.length} 
              {saving && <span className="ml-2 flex items-center text-yellow-300 font-bold"><Loader2 className="w-3 h-3 mr-1 animate-spin"/>Menyimpan...</span>}
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
            className="bg-[#10b981] hover:bg-[#059669] text-white px-5 py-2.5 font-bold text-sm rounded-xl transition-all flex items-center justify-center shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] disabled:opacity-50 hover:-translate-y-0.5"
          >
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <ClipboardCheck className="w-4 h-4 mr-2" />}
            Selesai Tes
          </button>
        </div>
      </header>

      <div className="w-full bg-gray-200 h-1.5 flex-shrink-0">
        <div 
          className="bg-[#10b981] h-1.5 transition-all duration-500" 
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      
      <main className="flex-1 flex flex-col justify-center items-center w-full px-4 sm:px-6 py-8">
        <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-6 md:gap-8 items-stretch">
          
          <div className="w-full lg:w-[320px] flex-shrink-0 bg-white rounded-2xl shadow-sm p-6 border border-gray-100 h-fit">
            <h3 className="font-bold text-gray-800 mb-6 text-center text-sm uppercase tracking-wider">Daftar Nomor Soal</h3>
            
            <div className="grid grid-cols-5 gap-3 max-h-[50vh] overflow-y-auto p-1">
              {questions.map((question, index) => {
                const { isAnswered } = getQuestionStatus(question);
                const isCurrent = index === currentQuestionIndex;

                return (
                  <button 
                    key={question.question_id} 
                    onClick={() => goToQuestion(index)}
                    className={`aspect-square rounded-xl flex items-center justify-center text-sm font-bold transition-all relative border-2 ${
                      isCurrent 
                        ? 'bg-[#1e1e54] text-white border-[#1e1e54] shadow-md transform scale-105' 
                        : isAnswered 
                        ? 'bg-[#e8faef] text-[#10b981] border-[#a7f3d0]' 
                        : 'bg-white text-gray-400 border-gray-200 hover:border-[#1e1e54]/30 hover:text-gray-700'
                    }`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
            
            <div className="mt-6 flex justify-center">
              <span className="bg-blue-50 text-blue-500 text-xs px-4 py-1.5 rounded-full font-semibold">
                {questions.length} SOAL
              </span>
            </div>
            
            <div className="mt-6 pt-5 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-4 font-medium">
                <span className="flex items-center"><FileText className="w-3.5 h-3.5 mr-1.5 text-gray-400" /> Terjawab:</span>
                <span className="font-bold text-[#1e1e54] text-sm bg-[#1e1e54]/10 px-2 py-0.5 rounded">{answeredTotal}/{questions.length}</span>
              </div>
              <div className="flex flex-col space-y-3 text-xs text-gray-500 font-medium">
                <div className="flex items-center"><div className="w-2.5 h-2.5 bg-[#1e1e54] rounded-full mr-2.5 shadow-sm"></div><span>Sedang Dikerjakan</span></div>
                <div className="flex items-center"><div className="w-2.5 h-2.5 bg-[#10b981] rounded-full mr-2.5 shadow-sm"></div><span>Telah Dijawab Lengkap</span></div>
                <div className="flex items-center"><div className="w-2.5 h-2.5 border-2 border-gray-300 bg-white rounded-full mr-2.5"></div><span>Belum Dijawab</span></div>
              </div>
            </div>
          </div>
          
          <div className="flex-1 bg-white rounded-2xl shadow-sm p-8 md:p-10 border border-gray-100 flex flex-col justify-between min-h-[500px]">
            {currentQ ? (
              <div className="w-full flex-1 flex flex-col">
                
                <div className="mb-6 pb-6 border-b border-gray-100">
                  <div className="flex justify-between items-center mb-6">
                    <span className="bg-[#eff2fc] text-[#1e1e54] font-bold px-4 py-1.5 rounded-lg text-[11px] uppercase tracking-widest border border-[#1e1e54]/10">
                      SOAL {currentQuestionIndex + 1} / {questions.length}
                    </span>
                  </div>
                  <div className="bg-[#1e1e54]/5 p-5 rounded-2xl border border-[#1e1e54]/10 mb-2">
                     <h2 className="text-base md:text-lg font-bold text-[#1e1e54] leading-relaxed flex items-start">
                       <AlertCircle className="w-6 h-6 mr-3 mt-0.5 flex-shrink-0" />
                       Pilihlah pernyataan yang paling sesuai atau paling mendekati diri Anda:
                     </h2>
                  </div>
                </div>
                
                <div className="space-y-4 mt-2 flex-1"> 
                   <div 
                     onClick={() => savePAPIAnswer(currentQ.question_id, 'A')} 
                     className={`p-6 rounded-2xl border-2 cursor-pointer transition-all w-full flex items-center shadow-sm hover:shadow-md ${
                       currentAnswer?.papi_choice === 'A' ? 'border-[#1e1e54] bg-[#f8f9fc]' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                     }`}
                   >
                     <div className={`w-7 h-7 rounded-full border-2 mr-5 flex items-center justify-center flex-shrink-0 transition-colors ${
                       currentAnswer?.papi_choice === 'A' ? 'bg-[#1e1e54] border-[#1e1e54]' : 'border-gray-300 bg-white'
                     }`}>
                        {currentAnswer?.papi_choice === 'A' && <div className="w-3 h-3 bg-white rounded-full"></div>}
                     </div>
                     <div className="flex-1 flex items-center text-base md:text-lg">
                        <span className="font-bold mr-4 text-[#1e1e54]">A.</span>
                        <span className={`text-gray-800 ${currentAnswer?.papi_choice === 'A' ? 'font-medium' : ''}`}>{optionA}</span>
                     </div>
                   </div>
                   
                   <div className="flex items-center justify-center my-3 opacity-60">
                     <div className="h-px bg-gray-300 w-24"></div>
                     <span className="px-5 text-[11px] font-black text-gray-500 tracking-[0.2em] uppercase">ATAU</span>
                     <div className="h-px bg-gray-300 w-24"></div>
                   </div>
                   
                   <div 
                     onClick={() => savePAPIAnswer(currentQ.question_id, 'B')} 
                     className={`p-6 rounded-2xl border-2 cursor-pointer transition-all w-full flex items-center shadow-sm hover:shadow-md ${
                       currentAnswer?.papi_choice === 'B' ? 'border-[#1e1e54] bg-[#f8f9fc]' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                     }`}
                   >
                     <div className={`w-7 h-7 rounded-full border-2 mr-5 flex items-center justify-center flex-shrink-0 transition-colors ${
                       currentAnswer?.papi_choice === 'B' ? 'bg-[#1e1e54] border-[#1e1e54]' : 'border-gray-300 bg-white'
                     }`}>
                        {currentAnswer?.papi_choice === 'B' && <div className="w-3 h-3 bg-white rounded-full"></div>}
                     </div>
                     <div className="flex-1 flex items-center text-base md:text-lg">
                        <span className="font-bold mr-4 text-[#1e1e54]">B.</span>
                        <span className={`text-gray-800 ${currentAnswer?.papi_choice === 'B' ? 'font-medium' : ''}`}>{optionB}</span>
                     </div>
                   </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between mt-10 pt-8 border-t border-gray-100 gap-4">
                  <button 
                    onClick={goToPrevQuestion} 
                    disabled={currentQuestionIndex === 0} 
                    className={`flex items-center justify-center px-6 py-3.5 rounded-xl font-bold text-sm transition-all ${
                      currentQuestionIndex === 0 
                        ? 'bg-gray-50 text-gray-300 cursor-not-allowed' 
                        : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Soal Sebelumnya
                  </button>
                  
                  <div className="flex items-center justify-center space-x-4 w-full sm:w-auto">
                    {currentQuestionIndex === questions.length - 1 ? (
                      <button 
                        onClick={handleSubmitTest} 
                        disabled={saving} 
                        className={`flex-1 sm:flex-none flex items-center justify-center px-8 py-3.5 bg-[#10b981] text-white rounded-xl font-bold text-sm transition-all shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.23)] hover:-translate-y-0.5 ${
                          saving ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {saving ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menyimpan...</>
                        ) : (
                          <>Selesaikan Tes <CheckCircle className="w-4 h-4 ml-2" /></>
                        )}
                      </button>
                    ) : (
                      <button 
                        onClick={goToNextQuestion} 
                        className="flex-1 sm:flex-none flex items-center justify-center px-8 py-3.5 rounded-xl font-bold text-sm transition-all bg-[#1e1e54] text-white hover:bg-[#15153f] shadow-[0_4px_14px_0_rgba(30,30,84,0.39)] hover:shadow-[0_6px_20px_rgba(30,30,84,0.23)] hover:-translate-y-0.5"
                      >
                        Soal Selanjutnya <ArrowRight className="w-4 h-4 ml-2" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-12">
                <AlertCircle className="w-20 h-20 text-gray-200 mb-6" />
                <h3 className="text-2xl font-bold text-gray-400">Soal tidak ditemukan</h3>
              </div>
            )}
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