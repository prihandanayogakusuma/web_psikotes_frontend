"use client";

import WebcamProctor from './webcamProctor';
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  Timer, User, ArrowLeft, ArrowRight, CheckCircle, 
  Loader2, Maximize, AlertCircle, Hash, FileText, 
  Check, ClipboardCheck, AlertTriangle, XCircle 
} from "lucide-react";

const API_BASE_URL = 'https://api.lourdesautoparts.com';

interface QuestionOption {
  option_id: number;
  option_text: string;
  score_key?: string;
  score_value?: number;
  option_image_url?: string;
}

interface Question {
  question_id: number;
  test_id: number;
  section_id: number;
  question_text: string;
  question_type: 'single' | 'multiple' | 'numeric' | 'essay';
  order_number: number;
  correct_answer_count?: number;
  question_image_url?: string;
  subtest_code?: string; 
  options?: QuestionOption[];
  max_length?: number; 
  placeholder?: string;
}

interface Answer {
  question_id: number;
  selected_option_id?: number; 
  selected_option_ids?: number[];
  answer_text?: string;
  answered_at?: string;
  subtest_code?: string;
}

const isIOSDevice = () => {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
};

export default function WPT() {
  const router = useRouter();
  const params = useParams();
  const testId = params.id as string;
  
  const [user, setUser] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, Answer>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(3600); // Default 60 menit
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const lastWarningTimeRef = useRef<number>(0);
  
  const [warningCount, setWarningCount] = useState(0);
  const warningCountRef = useRef(0); 
  const MAX_WARNINGS = 3;
  
  const isTestFinishedRef = useRef(false);
  const sessionIdRef = useRef<string | null>(null);
  const allowNavigationRef = useRef(false);
  
  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = currentQuestion ? answers[currentQuestion.question_id] : undefined;

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
      await fetch(`${API_BASE_URL}/api/testSessions/wpt/finish/${sessionId}`, { 
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

    localStorage.setItem(`warnings_wpt_${sessionId}`, newCount.toString());

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
        message: `PERINGATAN KECURANGAN (${newCount}/${MAX_WARNINGS}):\n${reason}\n\nJangan keluar dari mode layar penuh!`,
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
        title: 'Gagal Layar Penuh',
        message: 'Browser Anda memblokir mode layar penuh. Izinkan melalui pengaturan browser.'
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
          localStorage.removeItem(`timer_wpt_${sessionId}`);
          return 0;
        }
        const newTime = prev - 1;
        localStorage.setItem(`timer_wpt_${sessionId}`, newTime.toString());
        return newTime;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isTimeUp, loading, timeLeft, sessionId]);

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
      await loadTestData();
      await loadQuestionsAndAnswers(savedSessionId);
      
      setLoading(false);
    } catch (error: any) {
      setError(error.message || 'Gagal memulai tes WPT');
      setLoading(false);
    }
  };

  const verifySession = async (sessionId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/testSessions/${sessionId}`);
      if (!response.ok) throw new Error('Session not found or invalid');
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

      const savedWarnings = localStorage.getItem(`warnings_wpt_${sessionId}`);
      if (savedWarnings) {
        const count = parseInt(savedWarnings);
        setWarningCount(count);
        warningCountRef.current = count;
      }

      const savedTime = localStorage.getItem(`timer_wpt_${sessionId}`);
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

  const loadTestData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tests/${testId}`);
      if (!response.ok) throw new Error('Test not found');
      const result = await response.json();
      const data = result.test || result;
      if (data.duration) setTimeLeft(data.duration);
    } catch (error) {
      console.warn("Gagal memuat durasi tes, menggunakan default.");
    }
  };

  const loadQuestionsAndAnswers = async (sid: string) => {
    try {
      const resQ = await fetch(`${API_BASE_URL}/api/questions/test/${testId}`);
      if (!resQ.ok) throw new Error("Gagal memuat soal tes WPT");
      
      const qResult = await resQ.json();
      let questionsData: any[] = [];
      if (Array.isArray(qResult)) questionsData = qResult;
      else if (qResult.questions && Array.isArray(qResult.questions)) questionsData = qResult.questions;
      else if (qResult.data && Array.isArray(qResult.data)) questionsData = qResult.data;

      if (questionsData.length === 0) throw new Error('Belum ada input soal di database untuk tes ini.');

      const questionsWithOptions = await Promise.all(
        questionsData.map(async (q: any) => {
          try {
            const qId = q.question_id || q.id;
            const optRes = await fetch(`${API_BASE_URL}/api/questions/${qId}/options`);
            let options: QuestionOption[] = [];
            if (optRes.ok) {
              const optData = await optRes.json();
              options = optData.options || optData.data || (Array.isArray(optData) ? optData : []);
            }
            return {
              ...q,
              question_text: q.question_text || '',
              question_type: q.question_type || 'single',
              order_number: q.order_number || 0,
              options
            } as Question;
          } catch (error) {
            return { ...q, options: [] } as Question;
          }
        })
      );
      
      const sortedQuestions = questionsWithOptions.sort((a, b) => a.order_number - b.order_number);
      setQuestions(sortedQuestions);

      try {
        const resA = await fetch(`${API_BASE_URL}/api/answer/session/${sid}`);
        if (resA.ok) {
          const aResult = await resA.json();
          const answersMap: Record<number, Answer> = {};
          const answersData = Array.isArray(aResult) ? aResult : (aResult.answers || []);
          
          answersData.forEach((answer: any) => {
            let selected_option_ids: number[] = [];
            if (answer.selected_option_ids) {
              try { 
                selected_option_ids = typeof answer.selected_option_ids === 'string' 
                  ? JSON.parse(answer.selected_option_ids) 
                  : answer.selected_option_ids; 
              } catch (e) {}
            }
            answersMap[answer.question_id] = {
              question_id: answer.question_id,
              selected_option_id: answer.selected_option_id,
              selected_option_ids: selected_option_ids,
              answer_text: answer.answer_text,
              answered_at: answer.answered_at
            };
          });
          setAnswers(answersMap);
        }
      } catch (error) {
        console.warn("Belum ada jawaban tersimpan.");
      }

    } catch (error) {
      throw error;
    }
  };

 
  const saveAnswerToDatabase = useCallback(async (
    questionId: number, 
    selectedOptionId?: number, 
    papiChoice?: string, 
    answerText?: string 
  ) => {
    if (!sessionId) return;
    setSaving(true);
    try {
      const payload: any = { session_id: parseInt(sessionId), question_id: questionId };
      if (selectedOptionId !== undefined) payload.selected_option_id = selectedOptionId;
      if (answerText) payload.answer_text = answerText;
      
      await fetch(`${API_BASE_URL}/api/answer`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(payload)
      });
    } catch (error) {} finally { setSaving(false); }
  }, [sessionId]);

  const saveMultipleAnswersToDatabase = useCallback(async (
    questionId: number, 
    selectedOptionIds: number[]
  ) => {
    if (!sessionId) return;
    setSaving(true);
    try {
      const payload = { 
        session_id: parseInt(sessionId), 
        question_id: questionId, 
        selected_option_ids: selectedOptionIds 
      };
      const response = await fetch(`${API_BASE_URL}/api/answer/multiple`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(payload)
      });
      if (!response.ok && selectedOptionIds.length > 0) {
        await saveAnswerToDatabase(questionId, selectedOptionIds[0]);
      }
    } catch (error) {} finally { setSaving(false); }
  }, [sessionId, saveAnswerToDatabase]);

  const handleSingleAnswer = (questionId: number, optionId: number) => {
    setAnswers(prev => ({ 
      ...prev, 
      [questionId]: { 
        question_id: questionId, 
        selected_option_id: optionId, 
        selected_option_ids: [optionId]
      } 
    }));
    saveAnswerToDatabase(questionId, optionId);
  };

  const applyMultipleAnswer = (questionId: number, newSelectedIds: number[]) => {
    setAnswers(prev => ({ 
      ...prev, 
      [questionId]: { 
        question_id: questionId, 
        selected_option_ids: newSelectedIds, 
        selected_option_id: newSelectedIds.length > 0 ? newSelectedIds[0] : undefined
      } 
    }));
    
    if (newSelectedIds.length > 0) {
      saveMultipleAnswersToDatabase(questionId, newSelectedIds);
    } else {
      saveAnswerToDatabase(questionId, undefined);
    }
  }

  const handleMultipleAnswer = (questionId: number, optionId: number) => {
    const question = questions.find(q => q.question_id === questionId);
    const currentAnswer = answers[questionId];
    if (!question || !question.options) return;
    
    const correctCount = question.options.filter(opt => opt.score_value === 1).length;
    const currentSelectedIds = currentAnswer?.selected_option_ids || [];
    
    if (currentSelectedIds.includes(optionId)) {
      const newSelectedIds = currentSelectedIds.filter(id => id !== optionId);
      applyMultipleAnswer(questionId, newSelectedIds);
    } else {
      if (correctCount > 0 && currentSelectedIds.length >= correctCount) {
        showDialog({
          type: 'confirm',
          title: 'Ganti Jawaban?',
          message: `Anda sudah memilih ${correctCount} jawaban maksimum.\n\nIngin mengganti jawaban pertama dengan pilihan yang baru?`,
          onConfirm: () => {
            const newSelectedIds = [optionId, ...currentSelectedIds.slice(1)];
            applyMultipleAnswer(questionId, newSelectedIds);
          }
        });
      } else {
        const newSelectedIds = [...currentSelectedIds, optionId];
        applyMultipleAnswer(questionId, newSelectedIds);
      }
    }
  };

  const handleNumericAnswer = (questionId: number, value: string) => {
    setAnswers(prev => ({ 
      ...prev, 
      [questionId]: { question_id: questionId, answer_text: value } 
    }));
    saveAnswerToDatabase(questionId, undefined, undefined, value);
  };

  const handleEssayAnswer = (questionId: number, value: string) => {
    setAnswers(prev => ({ 
      ...prev, 
      [questionId]: { question_id: questionId, answer_text: value, answered_at: new Date().toISOString() } 
    }));
    saveAnswerToDatabase(questionId, undefined, undefined, value);
  };

  const executeSubmitTest = async () => {
    allowNavigationRef.current = true;
    isTestFinishedRef.current = true;
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/testSessions/wpt/finish/${sessionId}`, { 
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
              router.push('/kandidat/dashboard');
            }
          });
          return;
        }
        throw new Error(result.message || 'Gagal menyelesaikan tes WPT');
      }
      
      showDialog({
        type: 'alert',
        title: 'Tes Selesai 🎉',
        message: 'TES WPT SELESAI!\nTerima kasih telah mengerjakan Tes WPT.',
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
  }

  const handleSubmitTest = () => {
    if (!sessionId) return;
    const answeredCount = Object.keys(answers).length;
    const totalQuestions = questions.length;
    
    if (answeredCount < totalQuestions) {
        showDialog({
          type: 'confirm',
          title: 'Konfirmasi Selesai',
          message: `Tunggu dulu! Anda baru menjawab ${answeredCount} dari ${totalQuestions} soal.\n\nApakah Anda YAKIN ingin mengakhiri tes WPT sekarang?`,
          confirmText: 'Ya, Akhiri Tes',
          cancelText: 'Lanjut Mengerjakan',
          onConfirm: () => executeSubmitTest()
        });
    } else {
        showDialog({
          type: 'confirm',
          title: 'Konfirmasi Selesai',
          message: 'Apakah Anda yakin ingin menyelesaikan Tes WPT?\nSetelah diselesaikan, Anda tidak dapat mengubah jawaban.',
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
    const answer = answers[question.question_id];
    const isAnswered = Boolean(
      answer?.selected_option_id !== undefined || 
      answer?.selected_option_ids !== undefined || 
      answer?.answer_text
    );
    let isComplete = isAnswered;
    if (question.question_type === 'multiple' && question.options) {
      const correctCount = question.options.filter(opt => opt.score_value === 1).length;
      if (correctCount > 0) isComplete = (answer?.selected_option_ids?.length || 0) === correctCount;
    }
    return { isAnswered, isComplete };
  };


  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#1e1e54] mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Memuat Tes WPT</h2>
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
            <p className="text-gray-600 mb-8 text-sm leading-relaxed font-medium">Sistem mendeteksi Anda keluar dari mode layar penuh. Untuk menjaga integritas dan fokus selama tes, Anda diwajibkan untuk kembali ke mode layar penuh.</p>
            <button 
              onClick={enterFullscreen} 
              className="w-full bg-[#1e1e54] hover:bg-[#15153f] text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center transition-all hover:-translate-y-0.5 shadow-md"
            >
              <Maximize className="w-5 h-5 mr-2" /> Aktifkan Kembali Layar Penuh
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
            <h1 className="font-bold text-lg leading-tight">Tes WPT</h1>
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

      <div className="w-full bg-gray-200 h-1.5">
        <div 
          className="bg-[#10b981] h-1.5 transition-all duration-500" 
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      
      <main className="flex-1 flex flex-col justify-center items-center w-full px-4 sm:px-6 py-8">
        <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-6 md:gap-8 items-stretch">
          
           <div className="w-full lg:w-[320px] flex-shrink-0 bg-white rounded-2xl shadow-sm p-6 border border-gray-100 h-fit">
            <h3 className="font-bold text-gray-800 mb-6 text-center text-sm uppercase tracking-wider">Daftar Soal</h3>
            
            <div className="grid grid-cols-5 gap-3 max-h-[50vh] overflow-y-auto p-1">
              {questions.map((question, index) => {
                const { isAnswered, isComplete } = getQuestionStatus(question);
                const isCurrent = index === currentQuestionIndex;

                return (
                  <button key={question.question_id} onClick={() => goToQuestion(index)}
                    className={`aspect-square rounded-xl flex items-center justify-center text-sm font-bold transition-all relative border-2 ${
                      isCurrent 
                        ? 'bg-[#1e1e54] text-white border-[#1e1e54] shadow-md transform scale-105'
                        : isComplete 
                        ? 'bg-[#e8faef] text-[#10b981] border-[#a7f3d0]'
                        : isAnswered 
                        ? 'bg-yellow-50 text-yellow-600 border-yellow-200'
                        : 'bg-white text-gray-400 border-gray-200 hover:border-[#1e1e54]/30 hover:text-gray-700'
                    }`}
                  >
                    {index + 1}
                    {question.question_type === 'multiple' && isAnswered && !isComplete ? (
                      <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-yellow-400 border-2 border-white rounded-full"></span>
                    ) : null}
                  </button>
                );
              })}
            </div>
            
            <div className="mt-6 flex justify-center">
              <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full font-bold text-xs tracking-wide">
                {questions.length} SOAL
              </span>
            </div>

            <div className="mt-6 pt-5 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs text-gray-600 mb-4 font-medium">
                <span className="flex items-center"><FileText className="w-4 h-4 mr-1.5 text-gray-400" /> Terjawab:</span>
                <span className="font-bold text-[#1e1e54] text-sm bg-[#1e1e54]/10 px-2 py-0.5 rounded">{Object.keys(answers).length}/{questions.length}</span>
              </div>
              
              <div className="flex flex-col space-y-3 text-xs text-gray-500 font-medium">
                <div className="flex items-center"><div className="w-3 h-3 bg-[#1e1e54] rounded-full mr-3 shadow-sm"></div><span>Sedang Dikerjakan</span></div>
                <div className="flex items-center"><div className="w-3 h-3 bg-[#10b981] rounded-full mr-3 shadow-sm"></div><span>Telah Dijawab Lengkap</span></div>
                <div className="flex items-center"><div className="w-3 h-3 border-2 border-gray-300 bg-white rounded-full mr-3"></div><span>Belum Dijawab</span></div>
              </div>
            </div>
          </div>
          
          <div className="flex-1 bg-white rounded-2xl shadow-sm p-8 md:p-10 border border-gray-100 flex flex-col justify-between min-h-[500px]">
            {currentQuestion ? (
              <div className="w-full flex-1 flex flex-col">
                
                <div className="mb-6 pb-6 border-b border-gray-100">
                  <div className="flex justify-between items-center mb-6">
                    <span className="bg-[#1e1e54]/5 text-[#1e1e54] font-bold px-4 py-1.5 rounded-lg text-xs uppercase tracking-widest border border-[#1e1e54]/10">
                      SOAL {currentQuestionIndex + 1} / {questions.length}
                    </span>
                  </div>
                  
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 whitespace-pre-line leading-relaxed">
                    {currentQuestion.question_text}
                  </h2>
                  
                  {currentQuestion.question_image_url && (
                    <div className="mt-8 border border-gray-200 p-4 rounded-2xl inline-block bg-gray-50/50 shadow-sm">
                      <img 
                        src={`${API_BASE_URL}${currentQuestion.question_image_url}`} 
                        alt="soal" 
                        className="max-h-72 object-contain rounded-xl" 
                        onError={(e) => e.currentTarget.style.display = 'none'}
                      />
                    </div>
                  )}
                </div>
                
                {renderQuestionContent(
                  currentQuestion, 
                  currentAnswer, 
                  handleSingleAnswer, 
                  handleMultipleAnswer, 
                  (_qId: number, _choice: 'A' | 'B') => {}, 
                  handleNumericAnswer, 
                  (_qId: number, _isTrue: boolean) => {}, 
                  handleEssayAnswer
                )}

                <div className="flex flex-col sm:flex-row justify-between mt-auto pt-8 border-t border-gray-100 gap-4">
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
                          <>Selesaikan Tes WPT <CheckCircle className="w-4 h-4 ml-2" /></>
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
      
      <footer className="bg-[#1e1e54] text-white/50 text-center py-5 text-xs flex-shrink-0 font-medium tracking-wide">
        <div className="container mx-auto px-4">SISTEM TERKUNCI • Jangan menutup atau merefresh halaman ini</div>
      </footer>
    </div>
  );
}


function renderQuestionContent(
  question: Question | undefined,
  answer: Answer | undefined,
  onSingleSelect: (questionId: number, optionId: number) => void,
  onMultipleSelect: (questionId: number, optionId: number) => void,
  onPAPISelect: (questionId: number, choice: 'A' | 'B') => void,
  onNumericInput: (questionId: number, value: string) => void,
  onBooleanSelect: (questionId: number, isTrue: boolean) => void,
  onEssayInput: (questionId: number, value: string) => void
) {
  if (!question) return null;
  switch (question.question_type) {
    case 'single':
    case 'multiple':
      return renderMultipleChoiceQuestion(
        question, 
        answer, 
        question.question_type === 'single' ? onSingleSelect : onMultipleSelect, 
        question.question_type
      );
    case 'numeric':
      return renderNumericQuestion(question, answer, onNumericInput);
    case 'essay':
      return renderEssayQuestion(question, answer, onEssayInput);
    default:
      return <div className="text-red-500 font-bold p-4 bg-red-50 rounded-xl">⚠️ Tipe soal tidak dikenali: {question.question_type}</div>;
  }
}

function renderMultipleChoiceQuestion(
  question: Question, 
  answer: Answer | undefined, 
  onSelect: (questionId: number, optionId: number) => void, 
  questionType: 'single' | 'multiple'
) {
  const correctOptions = question.options?.filter(opt => opt.score_value === 1) || [];
  const correctCount = correctOptions.length;
  const isMultiple = questionType === 'multiple';
  
  return (
    <div className="space-y-4"> 
      {isMultiple && correctCount > 1 && (
        <div className="mb-6 p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-blue-900 font-semibold text-sm">
                Perhatian: Soal ini memiliki lebih dari 1 jawaban benar. Pilih <span className="font-bold text-blue-600">{correctCount} jawaban</span>.
              </p>
              <div className="mt-3 flex items-center">
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-md text-xs font-bold">
                  Dipilih: {answer?.selected_option_ids?.length || 0} / {correctCount}
                </span>
                {answer?.selected_option_ids?.length === correctCount && (
                  <span className="ml-3 text-green-600 font-bold flex items-center text-xs bg-green-50 px-2 py-1 rounded border border-green-200">
                    <Check className="w-3.5 h-3.5 mr-1"/> Kuota Penuh
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-3"> 
        {question.options?.map((option, index) => {
          const isSelected = answer?.selected_option_ids?.includes(option.option_id) || answer?.selected_option_id === option.option_id;
          
          return (
            <div 
              key={option.option_id} 
              className={`p-5 rounded-2xl border-2 cursor-pointer transition-all group w-full ${
                isSelected ? 'border-[#1e1e54] bg-[#f8f9fc] shadow-sm' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`} 
              onClick={() => onSelect(question.question_id, option.option_id)}
            >
              <div className="flex items-start">
                <div className={`w-6 h-6 rounded flex items-center justify-center mr-5 mt-0.5 flex-shrink-0 border-2 transition-colors ${
                  isSelected ? 'bg-[#1e1e54] border-[#1e1e54]' : 'border-gray-300 bg-white group-hover:border-gray-400'
                }`}>
                  {isSelected && <Check className="w-4 h-4 text-white" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-start text-base">
                    <span className="font-bold mr-4 text-[#1e1e54]">{String.fromCharCode(65 + index)}.</span>
                    <span className={`text-gray-800 leading-relaxed ${isSelected ? 'font-medium' : ''}`}>{option.option_text}</span>
                  </div>
                  {option.option_image_url && (
                    <div className="mt-4 ml-8 border border-gray-100 p-3 rounded-xl bg-white inline-block shadow-sm">
                      <img src={`${API_BASE_URL}${option.option_image_url}`} alt={`Opsi ${String.fromCharCode(65 + index)}`} className="max-h-48 object-contain mx-auto rounded" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function renderNumericQuestion(
  question: Question, 
  answer: Answer | undefined, 
  onChange: (questionId: number, value: string) => void
) {
  return (
    <div className="mt-8 bg-blue-50/30 p-8 rounded-2xl border border-blue-100/50">
      <div className="flex items-center mb-5">
        <Hash className="w-6 h-6 text-[#1e1e54] mr-3" />
        <label className="block text-gray-900 font-bold text-lg">Ketik Jawaban Angka:</label>
      </div>
      <div className="max-w-md">
        <input 
          type="number" 
          value={answer?.answer_text || ''} 
          onChange={(e) => onChange(question.question_id, e.target.value)} 
          className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:border-[#1e1e54] focus:ring-4 focus:ring-[#1e1e54]/10 outline-none text-xl font-mono text-gray-900 bg-white shadow-sm transition-all placeholder:text-gray-300" 
          placeholder="0" 
          step="any" 
        />
      </div>
    </div>
  );
}

function renderEssayQuestion(
  question: Question, 
  answer: Answer | undefined, 
  onChange: (questionId: number, value: string) => void
) {
  const maxLength = question.max_length || 500;
  const charCount = answer?.answer_text?.length || 0;
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= maxLength) {
      onChange(question.question_id, e.target.value);
    }
  };

  return (
    <div className="mt-8 bg-blue-50/30 p-8 rounded-2xl border border-blue-100/50">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center">
          <FileText className="w-6 h-6 text-[#1e1e54] mr-3" />
          <label className="block text-gray-900 font-bold text-lg">Uraian Jawaban:</label>
        </div>
        <div className="text-xs font-bold bg-white px-3 py-1.5 rounded-md border border-gray-200 shadow-sm">
          <span className={`${charCount > maxLength * 0.9 ? 'text-red-500' : 'text-[#1e1e54]'}`}>{charCount}</span>
          <span className="text-gray-400"> / {maxLength} karakter</span>
        </div>
      </div>
      <div className="relative">
        <textarea 
          value={answer?.answer_text || ''} 
          onChange={handleChange} 
          placeholder={question.placeholder || "Ketik jawaban Anda dengan jelas di sini..."} 
          rows={6} 
          className="w-full px-6 py-5 border-2 border-gray-200 rounded-xl focus:border-[#1e1e54] focus:ring-4 focus:ring-[#1e1e54]/10 outline-none text-gray-800 resize-y bg-white shadow-sm text-base leading-relaxed transition-all placeholder:text-gray-300" 
        />
      </div>
    </div>
  );
}