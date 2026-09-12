"use client";

import WebcamProctor from './webcamProctor';
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  Timer, User, ArrowLeft, ArrowRight, CheckCircle, 
  Loader2, Maximize, AlertCircle, Hash, FileText, 
  Check, Layers, AlertTriangle 
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

interface TestSection {
  section_id: number;
  test_id: number;
  section_code: string;
  section_name: string;
  order_number: number;
  duration?: number;
}

const isIOSDevice = () => {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
};

export default function IST() {
  const router = useRouter();
  const params = useParams();
  const testId = params.id as string;
  
  const [user, setUser] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, Answer>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(3600);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [currentSection, setCurrentSection] = useState<TestSection | null>(null);
  const [currentSubtest, setCurrentSubtest] = useState(1);
  const [completedSections, setCompletedSections] = useState<number[]>([]);
  const [sections, setSections] = useState<TestSection[]>([]);
  const [showSectionCompleteModal, setShowSectionCompleteModal] = useState(false);
  const [nextSection, setNextSection] = useState<TestSection | null>(null);
  
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const lastWarningTimeRef = useRef<number>(0);
  const [warningCount, setWarningCount] = useState(0);
  const warningCountRef = useRef(0); 
  const MAX_WARNINGS = 3; 
  
  const isTestFinishedRef = useRef(false);
  const sessionIdRef = useRef<string | null>(null);
  const allowNavigationRef = useRef(false);

  const handleCompleteSectionRef = useRef<any>(null);
  
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

   if (newCount >= MAX_WARNINGS) {
      showDialog({
        type: 'alert',
        title: 'Pelanggaran Maksimal Subtes',
        message: `PERINGATAN KECURANGAN (${newCount}/${MAX_WARNINGS}):\n${reason}\n\nAnda telah mencapai batas maksimal pelanggaran (3x) untuk subtes ini. Subtes ini dihentikan paksa!`,
        confirmText: currentSubtest === 9 ? 'Akhiri Tes IST' : 'Lanjut Subtes Berikutnya',
        onConfirm: () => {

          warningCountRef.current = 0;
          setWarningCount(0);
          
         if (handleCompleteSectionRef.current) {
            handleCompleteSectionRef.current(true);
          }
      
        }
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

  const enterFullscreen = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (error) {
      showDialog({
        type: 'alert',
        title: 'Akses Ditolak',
        message: "Browser Anda memblokir mode layar penuh. Silakan izinkan melalui pengaturan (pop-up/fullscreen) di browser Anda."
      });
    }
  };

  const handleAutoSubmitTest = async () => {
    if (!sessionId || isTestFinishedRef.current) return;
    allowNavigationRef.current = true;
    isTestFinishedRef.current = true;
    setSaving(true);
    try {
      await fetch(`${API_BASE_URL}/api/testSessions/ist/finish/${sessionId}`, { 
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

  useEffect(() => {
    if (timeLeft <= 0 || isTimeUp) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsTimeUp(true); 
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isTimeUp]);

  useEffect(() => {
    if (isTimeUp && !isTestFinishedRef.current) {
        handleCompleteSection(true);
    }
  }, [isTimeUp]);

  useEffect(() => {
    startExam();
    return () => {
      if (!isTestFinishedRef.current && sessionIdRef.current) {
        localStorage.removeItem(`current_session_${testId}`);
      }
    };
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
      
      const loadedSections = await loadISTSections(); 
      const loadedCompleted = await loadCompletedSections(savedSessionId); 
      
      const urlParams = new URLSearchParams(window.location.search);
      const subtestParam = urlParams.get('subtest');

      if (subtestParam && loadedSections.length > 0) {
        const targetSection = loadedSections.find((s: any) => s.order_number === parseInt(subtestParam));
        if (targetSection) {
          setCurrentSection(targetSection);
          setCurrentSubtest(targetSection.order_number);
          await loadISTQuestionsForSection(targetSection);
        }
      } else if (loadedSections.length > 0) {
        const firstIncomplete = loadedSections.find((s: any) => !loadedCompleted.includes(s.order_number));
        const targetSection = firstIncomplete || loadedSections[0];
        setCurrentSection(targetSection);
        setCurrentSubtest(targetSection.order_number);
        await loadISTQuestionsForSection(targetSection);
      }
      
      setLoading(false);
    } catch (error: any) {
      setError(error.message || 'Gagal memulai tes');
      setLoading(false);
    }
  };

  const verifySession = async (sessionId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/testSessions/${sessionId}`);
      if (!response.ok) throw new Error('Sesi tidak valid');
      const sessionData = await response.json();
      
      setSessionId(sessionId);
      sessionIdRef.current = sessionId;

     const savedTime = localStorage.getItem(`timer_ist_${sessionId}`);
      const savedWarnings = localStorage.getItem(`warnings_ist_${sessionId}`);

      if (savedTime) {
        setTimeLeft(parseInt(savedTime));
      } else if (sessionData.remaining_time) {
        setTimeLeft(sessionData.remaining_time);
      }

      if (savedWarnings) {
        const count = parseInt(savedWarnings);
        setWarningCount(count);
        warningCountRef.current = count;
      }
    } catch (error) {
      localStorage.removeItem(`current_session_${testId}`);
      router.push('/kandidat/dashboard');
      throw error;
    }
  };

  const loadISTSections = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tests/${testId}/sections`);
      if (!response.ok) throw new Error('Gagal memuat sections');
      
      const result = await response.json();
      let sectionsData: any[] = [];
      if (Array.isArray(result)) sectionsData = result;
      else if (result.sections && Array.isArray(result.sections)) sectionsData = result.sections;
      else if (result.sections?.sections && Array.isArray(result.sections.sections)) sectionsData = result.sections.sections;
      else if (result.data && Array.isArray(result.data)) sectionsData = result.data;

      const istSections = sectionsData
        .filter((s: TestSection) => String(s.test_id) === String(testId))
        .sort((a: TestSection, b: TestSection) => a.order_number - b.order_number);
      
      setSections(istSections);
      return istSections;
    } catch (error) {
      throw error;
    }
  };

  const loadCompletedSections = async (sessionId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/testSessions/${sessionId}/sections`);
      if (response.ok) {
        const data = await response.json();
        const completedArray = data.completed_sections || data || []; 
        setCompletedSections(completedArray);
        return completedArray;
      }
      return []; 
    } catch (error) {
      return []; 
    }
  };

  const loadISTQuestionsForSection = async (section: TestSection) => {
    try {
      if (section.duration && section.duration > 0) {
          setTimeLeft(section.duration);
      }

      const response = await fetch(`${API_BASE_URL}/api/questions/test/${testId}/section/${section.section_id}`);
      if (!response.ok) throw new Error(`Soal untuk section ${section.section_code} belum tersedia`);
      
          const savedTime = localStorage.getItem(`timer_ist_${sessionIdRef.current}`);
    if (!savedTime && section.duration) {
        setTimeLeft(section.duration);
    }

      const result = await response.json();
      let questionsData: any[] = [];
      if (Array.isArray(result)) questionsData = result;
      else if (result.questions && Array.isArray(result.questions)) questionsData = result.questions;
      else if (result.data && Array.isArray(result.data)) questionsData = result.data;
      else if (result.questions?.questions && Array.isArray(result.questions.questions)) questionsData = result.questions.questions;

      if (!Array.isArray(questionsData)) questionsData = [];
      if (questionsData.length === 0) {
        setQuestions([]);
        return;
      }
      
      const questionsWithOptions = await Promise.all(
        questionsData.map(async (question: any) => {
          try {
            const qId = question.question_id || question.id;
            const optionsResponse = await fetch(`${API_BASE_URL}/api/questions/${qId}/options`);
            let options: QuestionOption[] = [];
            if (optionsResponse.ok) {
              const optionsResult = await optionsResponse.json();
              options = optionsResult.options || optionsResult.data || optionsResult.questions || (Array.isArray(optionsResult) ? optionsResult : []);
            }
            return {
              ...question,
              section_id: section.section_id,
              subtest_code: section.section_code,
              options,
              order_number: question.order_number || 0
            } as Question;
          } catch (error) {
            return { 
              ...question, 
              section_id: section.section_id, 
              subtest_code: section.section_code, 
              options: [] 
            } as Question;
          }
        })
      );
      
      const sortedQuestions = questionsWithOptions.sort((a, b) => a.order_number - b.order_number);
      setQuestions(sortedQuestions);
      
      if (sessionIdRef.current) {
        const existingAnswers = await loadExistingAnswers(sessionIdRef.current);
        const sectionAnswers: Record<number, Answer> = {};
        Object.values(existingAnswers).forEach(answer => {
          const question = sortedQuestions.find(q => q.question_id === answer.question_id);
          if (question && question.section_id === section.section_id) {
            sectionAnswers[answer.question_id] = answer;
          }
        });
        setAnswers(sectionAnswers);
      }
    } catch (error) {
      throw error;
    }
  };

  const loadExistingAnswers = async (sessionId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/answer/session/${sessionId}`);
      if (!response.ok && response.status !== 404) throw new Error(`Failed to load answers`);
      
      const result = await response.ok ? await response.json() : [];
      const answersMap: Record<number, Answer> = {};
      const answersData = Array.isArray(result) ? result : (result.answers || []);
      
      if (Array.isArray(answersData)) {
        answersData.forEach((answer: any) => {
          let selected_option_ids: number[] = [];
          if (answer.selected_option_ids) {
            try { 
              selected_option_ids = typeof answer.selected_option_ids === 'string' 
                ? JSON.parse(answer.selected_option_ids) 
                : answer.selected_option_ids; 
            } catch (error) {}
          }
          answersMap[answer.question_id] = {
            question_id: answer.question_id,
            selected_option_id: answer.selected_option_id,
            selected_option_ids: selected_option_ids,
            answer_text: answer.answer_text,
            answered_at: answer.answered_at,
            subtest_code: answer.subtest_code 
          };
        });
      }
      return answersMap;
    } catch (error) {
      return {};
    }
  };

  const saveAnswerToDatabase = useCallback(async (
    questionId: number, 
    selectedOptionId?: number, 
    papiChoice?: string, 
    answerText?: string, 
    subtestCode?: string 
  ) => {
    if (!sessionId) return;
    setSaving(true);
    try {
      const payload: any = { session_id: parseInt(sessionId), question_id: questionId };
      if (selectedOptionId !== undefined) payload.selected_option_id = selectedOptionId;
      if (answerText) payload.answer_text = answerText;
      if (subtestCode) payload.subtest_code = subtestCode;
      
      await fetch(`${API_BASE_URL}/api/answer`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(payload)
      });
    } catch (error) {} finally { setSaving(false); }
  }, [sessionId]);

  const saveMultipleAnswersToDatabase = useCallback(async (
    questionId: number, 
    selectedOptionIds: number[], 
    subtestCode?: string
  ) => {
    if (!sessionId) return;
    setSaving(true);
    try {
      const payload = { 
        session_id: parseInt(sessionId), 
        question_id: questionId, 
        selected_option_ids: selectedOptionIds, 
        subtest_code: subtestCode 
      };
      
      const response = await fetch(`${API_BASE_URL}/api/answer/multiple`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(payload)
      });
      
      if (!response.ok && selectedOptionIds.length > 0) {
        await saveAnswerToDatabase(questionId, selectedOptionIds[0], undefined, undefined, subtestCode);
      }
    } catch (error) {} finally { setSaving(false); }
  }, [sessionId, saveAnswerToDatabase]);

  const handleSingleAnswer = (questionId: number, optionId: number) => {
    const question = questions.find(q => q.question_id === questionId);
    setAnswers(prev => ({ 
      ...prev, 
      [questionId]: { 
        question_id: questionId, 
        selected_option_id: optionId, 
        selected_option_ids: [optionId], 
        subtest_code: question?.subtest_code 
      } 
    }));
    saveAnswerToDatabase(questionId, optionId, undefined, undefined, question?.subtest_code);
  };

  const handleMultipleAnswer = (questionId: number, optionId: number) => {
    const question = questions.find(q => q.question_id === questionId);
    const currentAnswer = answers[questionId];
    if (!question || !question.options) return;
    
    const correctCount = question.options.filter(opt => opt.score_value === 1).length;
    const currentSelectedIds = currentAnswer?.selected_option_ids || [];
    let newSelectedIds: number[];
    
    if (currentSelectedIds.includes(optionId)) {
      newSelectedIds = currentSelectedIds.filter(id => id !== optionId);
    } else {
      if (correctCount > 0 && currentSelectedIds.length >= correctCount) {
        const shouldReplace = window.confirm(`Anda sudah memilih ${correctCount} jawaban. Ingin mengganti jawaban pertama dengan yang baru?`);
        if (!shouldReplace) return;
        newSelectedIds = [optionId, ...currentSelectedIds.slice(1)];
      } else {
        newSelectedIds = [...currentSelectedIds, optionId];
      }
    }
    
    setAnswers(prev => ({ 
      ...prev, 
      [questionId]: { 
        question_id: questionId, 
        selected_option_ids: newSelectedIds, 
        selected_option_id: newSelectedIds.length > 0 ? newSelectedIds[0] : undefined, 
        subtest_code: question?.subtest_code 
      } 
    }));
    
    if (newSelectedIds.length > 0) {
      saveMultipleAnswersToDatabase(questionId, newSelectedIds, question?.subtest_code);
    } else {
      saveAnswerToDatabase(questionId, undefined, undefined, undefined, question?.subtest_code);
    }
  };

  const handleNumericAnswer = (questionId: number, value: string) => {
    const question = questions.find(q => q.question_id === questionId);
    setAnswers(prev => ({ 
      ...prev, 
      [questionId]: { 
        question_id: questionId, 
        answer_text: value, 
        subtest_code: question?.subtest_code 
      } 
    }));
    saveAnswerToDatabase(questionId, undefined, undefined, value, question?.subtest_code);
  };

  const handleEssayAnswer = (questionId: number, value: string) => {
    const question = questions.find(q => q.question_id === questionId);
    setAnswers(prev => ({ 
      ...prev, 
      [questionId]: { 
        question_id: questionId, 
        answer_text: value, 
        subtest_code: question?.subtest_code, 
        answered_at: new Date().toISOString() 
      } 
    }));
    saveAnswerToDatabase(questionId, undefined, undefined, value, question?.subtest_code);
  };

  const handleCompleteSection = async (forceTimeUp = false) => {
    if (!sessionId || !currentSection) return;

   
    const totalQuestions = questions.length;
    const answeredCount = Object.keys(answers).length;

  
    if (!forceTimeUp && answeredCount < totalQuestions) {
      showDialog({
        type: 'alert',
        title: 'Belum Selesai',
        message: `Maaf, Anda belum bisa mengakhiri subtes ini.\n\nAnda baru menjawab ${answeredCount} dari ${totalQuestions} soal. Silakan lengkapi semua jawaban terlebih dahulu.`,
        confirmText: 'Kembali Mengerjakan'
      });
      return; 
    }

    try {
      setSaving(true);
      
     
      await fetch(`${API_BASE_URL}/api/testSessions/${sessionId}/section`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          section_id: currentSection.section_id, 
          order_number: currentSection.order_number, 
          completed_at: new Date().toISOString() 
        })
      });
      
      const newCompleted = [...completedSections, currentSection.order_number];
      setCompletedSections(newCompleted);
      
      if (currentSection.order_number < 9) {
        const nextSectionOrder = currentSection.order_number + 1;
        const nextSec = sections.find(s => s.order_number === nextSectionOrder);
        setNextSection(nextSec || null);
        setShowSectionCompleteModal(true);
      } else {
        await handleFinishIST();
      }
    } catch (error) {
      showDialog({
        type: 'alert',
        title: 'Gagal Menyimpan',
        message: 'Gagal menyimpan progress section. Periksa koneksi internet Anda.'
      });
    } finally {
      setSaving(false);
      setIsTimeUp(false);
    }
  };

  useEffect(() => {
    handleCompleteSectionRef.current = handleCompleteSection;
  });

  const handleFinishIST = async () => {
    if (!sessionId) return;
    allowNavigationRef.current = true;
    isTestFinishedRef.current = true;
    setSaving(true);
    
    try {
      const answersArray = Object.values(answers).map(answer => ({
        question_id: answer.question_id,
        selected_option_id: answer.selected_option_id,
        selected_option_ids: answer.selected_option_ids,
        answer_text: answer.answer_text,
        subtest_code: answer.subtest_code
      }));
      
      const response = await fetch(`${API_BASE_URL}/api/testSessions/ist/finish/${sessionId}`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ answers: answersArray, completed_sections: completedSections })
      });
      
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || `Gagal menyelesaikan tes IST (${response.status})`);
      
       showDialog({
        type: 'alert',
        title: 'Tes Selesai 🎉',
        message: 'TES IST SELESAI!\nTerima kasih telah mengerjakan tes ini.',
        onConfirm: () => {
          localStorage.removeItem(`current_session_${testId}`);
          router.push('/kandidat/dashboard');
        }
      });
      
      localStorage.removeItem(`current_session_${testId}`);
      setTimeout(() => { router.push('/kandidat/dashboard'); }, 2000);
      
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

  const goToQuestion = (index: number) => { 
    if (index >= 0 && index < questions.length) setCurrentQuestionIndex(index); 
  };
  const goToNextQuestion = () => { 
    if (currentQuestionIndex < questions.length - 1) setCurrentQuestionIndex(prev => prev + 1); 
  };
  const goToPrevQuestion = () => { 
    if (currentQuestionIndex > 0) setCurrentQuestionIndex(prev => prev - 1); 
  };

  const goToNextSection = () => {
    if (nextSection) {
      setShowSectionCompleteModal(false);
      allowNavigationRef.current = true;
      window.location.href = `/kandidat/post-test?testId=${testId}&testCode=IST&subtest=${nextSection.order_number}`;
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
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Memuat Tes IST</h2>
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
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

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
              className="w-full bg-[#1e1e54] hover:bg-[#15153f] text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center transition-all"
            >
              <Maximize className="w-5 h-5 mr-2" /> Aktifkan Kembali Layar Penuh
            </button>
          </div>
        </div>
      )}

      <header className="bg-[#242467] text-white px-6 py-8 shadow-lg flex justify-between items-center z-10 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="bg-white/12 px-4 py-2 text-[25px] rounded-lg font-mono text-lg font-bold flex items-center">
             <Timer className={`w-5 h-4 mr-2 ${timeLeft < 60 ? 'text-red-300 animate-pulse' : 'text-gray-200'}`} /> 
             <span className={timeLeft < 60 ? 'text-red-300 animate-pulse' : 'text-gray-100'}>
               {formatTime(timeLeft)}
             </span>
          </div>
          <div className="hidden md:flex flex-col justify-center">
            <h1 className="font-bold text-base leading-tight">Tes IST (Kognitif)</h1>
            <p className="text-blue-200 text-[12px]">Subtes {currentSection?.order_number}/9 ({currentSection?.section_code})</p>
          </div>
        </div>


        <div className="flex items-center gap-6">
          {warningCount > 0 && (
            <div className="hidden sm:flex items-center bg-red-500/20 text-red-200 px-3 py-1.5 rounded-lg border border-red-500/30">
              <AlertTriangle className="w-4 h-4 mr-2 animate-pulse text-red-400" />
              <span className="text-sm font-bold">Pelanggaran: {warningCount}/{MAX_WARNINGS}</span>
            </div>
          )}
        
          <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-200">
            <User className="w-4 h-4" />
            <span className="font-medium truncate max-w-[120px]">{user?.name?.split(' ')[0]}</span>
          </div>
          
          <button 
            onClick={() => { 
              showDialog({
                type: 'confirm',
                title: currentSubtest === 9 ? 'Selesai Tes' : 'Akhiri Subtes',
                message: currentSubtest === 9 
                  ? 'Yakin ingin menyelesaikan seluruh tes IST ini?' 
                  : 'Yakin ingin mengakhiri dan menyimpan subtes ini?',
                onConfirm: () => handleCompleteSection(false)
              });
            }} 
            disabled={saving || Object.keys(answers).length < questions.length} 
                className={`... classes kamu ... ${
                  (saving || Object.keys(answers).length < questions.length) 
                  ? 'opacity-50 cursor-not-allowed bg-gray-400' 
                  : 'bg-[#10b981] hover:bg-[#059669]'
                }`}
              >
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : currentSubtest === 9 ? <Layers className="w-4 h-4 mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
            {currentSubtest === 9 ? 'Selesai Tes IST' : 'Akhiri Subtes'}
          </button>
        </div>
      </header>

      <div className="w-full bg-gray-200 h-1.5 flex-shrink-0">
        <div 
          className="bg-[#10b981] h-1.5 transition-all duration-500" 
          style={{ width: `${((currentSection?.order_number || 1) / 9) * 100}%` }}
        />
      </div>
      
      <main className="flex-1 flex flex-col justify-center items-center w-full px-4 sm:px-6 py-8">
        <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-6 md:gap-8 items-stretch">
          
          <div className="w-full lg:w-[320px] flex-shrink-0 bg-white rounded-2xl shadow-sm p-6 border border-gray-100 h-fit">
            <h3 className="font-bold text-gray-800 mb-6 text-center text-sm">Daftar Nomor Soal</h3>
            
            <div className="grid grid-cols-5 gap-3 max-h-[50vh] overflow-y-auto p-1">
              {questions.map((question, index) => {
                const { isAnswered, isComplete } = getQuestionStatus(question);
                const isCurrent = index === currentQuestionIndex;

                return (
                  <button 
                    key={question.question_id} 
                    onClick={() => goToQuestion(index)}
                    className={`aspect-square rounded-xl flex items-center justify-center text-sm font-medium transition-all relative border ${
                      isCurrent 
                        ? 'bg-[#1e1e54] text-white border-[#1e1e54] shadow-md' 
                        : isComplete 
                        ? 'bg-[#e8faef] text-[#10b981] border-[#a7f3d0]' 
                        : isAnswered 
                        ? 'bg-yellow-50 text-yellow-600 border-yellow-200' 
                        : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {index + 1}
                    {question.question_type === 'multiple' && isAnswered && !isComplete ? (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full"></span>
                    ) : null}
                  </button>
                );
              })}
            </div>
            
            <div className="mt-6 flex justify-center">
              <span className="bg-blue-50 text-blue-500 text-xs px-4 py-1.5 rounded-full font-semibold">
                {questions.length} soal
              </span>
            </div>
            
            <div className="mt-6 pt-5 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <span className="flex items-center"><FileText className="w-3.5 h-3.5 mr-1.5" /> Terjawab:</span>
                <span className="font-bold text-gray-900 text-sm">{Object.keys(answers).length}/{questions.length}</span>
              </div>
              <div className="flex flex-col space-y-3 text-xs text-gray-500">
                <div className="flex items-center"><div className="w-2.5 h-2.5 bg-[#1e1e54] rounded-full mr-2.5"></div><span>Sedang dikerjakan</span></div>
                <div className="flex items-center"><div className="w-2.5 h-2.5 bg-[#10b981] rounded-full mr-2.5"></div><span>Telah dijawab</span></div>
                <div className="flex items-center"><div className="w-2.5 h-2.5 bg-gray-200 rounded-full mr-2.5"></div><span>Belum dijawab</span></div>
              </div>
            </div>
          </div>
          
          <div className="flex-1 bg-white rounded-2xl shadow-sm p-8 md:p-10 border border-gray-100 flex flex-col justify-between min-h-[500px]">
            {currentQuestion ? (
              <>
                <div className="w-full">
                  <span className="bg-[#eff2fc] text-[#1e1e54] font-bold px-4 py-1.5 rounded-full text-[11px] uppercase tracking-widest inline-block mb-6">
                    SOAL {currentQuestionIndex + 1} / {questions.length}
                  </span>
                  
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 whitespace-pre-line leading-relaxed mb-8">
                    {currentQuestion.question_text}
                  </h2>
                  
                  {currentQuestion.question_image_url && (
                    <div className="mb-8 border border-gray-100 p-3 rounded-2xl inline-block bg-[#f8f9fc]">
                      <img 
                        src={`${API_BASE_URL}${currentQuestion.question_image_url}`} 
                        alt="soal" 
                        className="max-h-72 object-contain rounded-xl" 
                      />
                    </div>
                  )}
                  
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
                </div>

                <div className="flex flex-col sm:flex-row justify-between mt-10 pt-8 border-t border-gray-100 gap-4">
                  <button 
                    onClick={goToPrevQuestion} 
                    disabled={currentQuestionIndex === 0} 
                    className={`flex items-center justify-center px-6 py-3 rounded-xl font-medium text-sm transition-colors ${
                      currentQuestionIndex === 0 
                        ? 'bg-gray-50 text-gray-400 cursor-not-allowed' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Sebelumnya
                  </button>
                  
                  <div className="flex items-center justify-center space-x-4">
                    {saving && <span className="text-xs font-bold text-indigo-500 flex items-center"><Loader2 className="w-3 h-3 animate-spin mr-1.5"/> Menyimpan...</span>}
                    <button 
                      onClick={goToNextQuestion} 
                      disabled={currentQuestionIndex === questions.length - 1} 
                      className={`flex items-center justify-center px-6 py-3 rounded-xl font-medium text-sm transition-colors ${
                        currentQuestionIndex === questions.length - 1 
                          ? 'hidden' 
                          : 'bg-[#1e1e54] text-white hover:bg-[#15153f]'
                      }`}
                    >
                      Selanjutnya <ArrowRight className="w-4 h-4 ml-2" />
                    </button>
                    {currentQuestionIndex === questions.length - 1 && (
                      <button 
                        onClick={() => handleCompleteSection(false)} 
                        disabled={saving} 
                        className={`flex items-center justify-center px-6 py-3 rounded-xl font-bold text-sm transition-colors bg-[#10b981] text-white hover:bg-[#059669] ${
                          saving ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : currentSubtest === 9 ? 'Selesaikan Tes IST' : 'Akhiri Subtes Ini'} 
                        {!saving && <CheckCircle className="w-4 h-4 ml-2" />}
                      </button>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-12">
                <AlertCircle className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-bold text-gray-800">Soal tidak ditemukan</h3>
              </div>
            )}
          </div>
          
        </div>
      </main>

      {showSectionCompleteModal && nextSection && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Subtes {currentSubtest} Selesai!</h3>
            <p className="text-gray-600 mb-6 text-sm">Sekarang Anda dapat melanjutkan ke subtes berikutnya.</p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-8 text-left">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-xl mr-4 shadow-sm">
                  {nextSection.order_number}
                </div>
                <div>
                  <div className="font-bold text-blue-900 text-sm">Subtes Selanjutnya:</div>
                  <div className="text-blue-700 font-medium">{nextSection.section_code} - {nextSection.section_name}</div>
                </div>
              </div>
            </div>
            <button 
              onClick={goToNextSection} 
              className="w-full bg-[#1e1e54] hover:bg-[#15153f] text-white py-3.5 rounded-xl font-bold transition-all shadow-md hover:-translate-y-0.5"
            >
              Lanjut ke Subtes {nextSection.order_number}
            </button>
          </div>
        </div>
      )}

      {isTimeUp && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[999]">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl animate-in zoom-in">
            <Timer className="w-16 h-16 text-red-500 mx-auto mb-4 animate-pulse" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Waktu Habis!</h2>
            <p className="text-gray-600 mb-6">Sistem sedang memproses dan menyimpan jawaban Anda...</p>
            <div className="flex justify-center"><Loader2 className="w-8 h-8 text-[#1e1e54] animate-spin" /></div>
          </div>
        </div>
      )}

      <footer className="bg-[#1e1e54] text-white/50 text-center py-10 text-xs flex-shrink-0 font-medium">
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
      return <div className="text-red-500">Tipe soal tidak dikenali: {question.question_type}</div>;
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
      {isMultiple && correctCount > 1 ? (
        <div className="mb-6 p-4 bg-[#eff2fc] border border-[#1e1e54]/20 rounded-xl">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-[#1e1e54] mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[#1e1e54] font-medium text-sm">
                Pilih {correctCount} jawaban yang benar.
              </p>
              <div className="mt-2 text-[#1e1e54] text-xs font-medium">
                <div className="flex items-center">
                  <span className="bg-[#1e1e54]/10 px-2.5 py-1 rounded-md">
                    Dipilih: {answer?.selected_option_ids?.length || 0} dari {correctCount}
                  </span>
                  {answer?.selected_option_ids?.length === correctCount ? (
                    <span className="ml-2 text-green-600 font-bold flex items-center">
                      <Check className="w-3 h-3 mr-1"/> Lengkap
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      
      <div className="space-y-3"> 
        {question.options?.map((option, index) => {
          const isSelected = answer?.selected_option_ids?.includes(option.option_id) || answer?.selected_option_id === option.option_id;
          
          return (
            <div 
              key={option.option_id} 
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all group w-full ${
                isSelected ? 'border-[#1e1e54] bg-[#f8f9fc]' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`} 
              onClick={() => onSelect(question.question_id, option.option_id)}
            >
              <div className="flex items-start">
                <div className={`w-5 h-5 rounded-md flex items-center justify-center mr-4 mt-0.5 flex-shrink-0 border-2 ${
                  isSelected ? 'bg-[#1e1e54] border-[#1e1e54]' : 'border-gray-300 bg-white'
                }`}>
                  {isSelected ? <Check className="w-3.5 h-3.5 text-white" /> : null}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm md:text-base">
                      <span className="font-bold mr-3 text-[#1e1e54]">{String.fromCharCode(65 + index)}.</span>
                      <span className="text-gray-800">{option.option_text}</span>
                    </div>
                  </div>
                  {option.option_image_url ? (
                    <div className="mt-3 border border-gray-100 p-3 rounded-xl bg-white inline-block">
                      <img src={`${API_BASE_URL}${option.option_image_url}`} alt="opsi" className="max-h-40 object-contain mx-auto rounded" />
                    </div>
                  ) : null}
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
    <div className="mt-4 bg-[#f8f9fc] p-6 rounded-2xl border border-gray-100">
      <div className="flex items-center mb-4">
        <Hash className="w-5 text-[#1e1e54] mr-2" />
        <label className="block text-gray-800 font-bold">Ketik Jawaban Angka:</label>
      </div>
      <div className="max-w-md">
        <input 
          type="number" 
          value={answer?.answer_text || ''} 
          onChange={(e) => onChange(question.question_id, e.target.value)} 
          className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:border-[#1e1e54] focus:ring-1 focus:ring-[#1e1e54] outline-none text-lg font-mono text-gray-800 bg-white shadow-sm" 
          placeholder="..." 
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
    <div className="mt-4 bg-[#f8f9fc] p-6 rounded-2xl border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <FileText className="w-5 h-5 text-[#1e1e54] mr-2" />
          <label className="block text-gray-800 font-bold">Uraian Jawaban:</label>
        </div>
        <div className="text-xs font-medium">
          <span className={`${charCount > maxLength * 0.9 ? 'text-red-500' : 'text-gray-500'}`}>{charCount}</span>
          <span className="text-gray-400">/{maxLength} karakter</span>
        </div>
      </div>
      <div className="relative">
        <textarea 
          value={answer?.answer_text || ''} 
          onChange={handleChange} 
          placeholder={question.placeholder || "Ketik uraian Anda di sini..."} 
          rows={5} 
          className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:border-[#1e1e54] focus:ring-1 focus:ring-[#1e1e54] outline-none text-gray-800 resize-y bg-white shadow-sm text-base leading-relaxed" 
        />
      </div>
    </div>
  );
}