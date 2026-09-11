"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Maximize,
  FileText, 
  CheckCircle,
  Clock,
  User,
  LogOut,
  Play,
  AlertCircle,
  AlertTriangle,
  Mail
} from "lucide-react";

// const API_BASE_URL = 'https://api.lourdesautoparts.com';
const API_BASE_URL = '';




interface Test {
  id: number;
  name: string;
  code: string;
  duration: number;
  questionsCount: number;
  completed: boolean;
  status: "available" | "completed" | "in_progress" | "locked";
  test_id: number;
  test_name: string;
  test_code: string;
  duration_seconds: number;
  order_number?: number;
}

interface TestHistory {
  id: number;
  name: string;
  status: "completed" | "in_progress" | "not_started";
  duration: string;
  date: string;
  score?: number;  
  test_id: number;
  test_name: string;
  start_time: string;
  end_time?: string;
  remaining_time?: number;  
  time_extended?: boolean;  
  scoring_type?: string;    
}

interface UserData {
  participant_id: number;
  name: string;
  email: string;
  level_id: number;
  phone: string;
  address: string;
  birth_date: string;
}

const isIOSDevice = () => {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
};

export default function KandidatDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [availableTests, setAvailableTests] = useState<Test[]>([]);
  const [testHistory, setTestHistory] = useState<TestHistory[]>([]);
  const [startingTest, setStartingTest] = useState<number | null>(null); 
  const [isFullscreen, setIsFullscreen] = useState(false);


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

  
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(isIOSDevice() || !!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    setIsFullscreen(isIOSDevice() || !!document.fullscreenElement);

    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, []);

  const enterFullscreen = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (error) {
      console.error("Gagal masuk mode Layar penuh:", error);
      alert("Browser Anda memblokir mode Layar penuh. Izinkan melalui pengaturan browser.");
    }
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'TEST_COMPLETED') {
        if (user) {
          fetchAllDashboardData(user.level_id, user.participant_id);
        }
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [user]);


  useEffect(() => {
    const loadUserData = async () => {
      const userData = localStorage.getItem("user");
      
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData) as UserData;
          setUser(parsedUser);
          
          if (!parsedUser.participant_id || isNaN(parsedUser.participant_id)) {
            throw new Error('Invalid user ID in local storage');
          }
          
          await fetchAllDashboardData(parsedUser.level_id, parsedUser.participant_id);
          
        } catch (error) {
          console.error('❌ Error loading user data:', error);
          alert('Sesi Anda bermasalah. Silakan login kembali.');
          router.push("/");
        }
      } else {
        router.push("/");
      }
    };
    
    loadUserData();
  }, [router]);

 
  const fetchAllDashboardData = async (levelId: number, participantId: number) => {
    setLoading(true);
    try {
      const historyRes = await fetch(`${API_BASE_URL}/api/testSessions/user/${participantId}`);
      let sessions = [];
      if (historyRes.ok) {
        const histData = await historyRes.json();
        if (Array.isArray(histData)) sessions = histData;
      }

      const historyMapped: TestHistory[] = sessions.map((session: any): TestHistory => ({
        id: session.session_id,
        name: session.test_name || `Tes ${session.test_id}`,
        status: session.status === 'completed' ? "completed" : "in_progress",
        duration: `${session.duration ? Math.floor(session.duration / 60) : 0} menit`,
        date: session.start_time ? new Date(session.start_time).toLocaleDateString('id-ID') : new Date().toLocaleDateString('id-ID'),
        score: session.final_score,
        test_id: session.test_id,
        test_name: session.test_name,
        start_time: session.start_time,
        end_time: session.end_time,
        scoring_type: 'auto'
      })).sort((a, b) => new Date(b.start_time || 0).getTime() - new Date(a.start_time || 0).getTime());
      
      setTestHistory(historyMapped);

      const testsRes = await fetch(`${API_BASE_URL}/api/tests/level/${levelId}`);
      let testsArray = [];
      if (testsRes.ok) {
        const testsData = await testsRes.json();
        if (Array.isArray(testsData)) testsArray = testsData;
        else if (testsData.data && Array.isArray(testsData.data)) testsArray = testsData.data;
        else if (testsData.tests && Array.isArray(testsData.tests)) testsArray = testsData.tests;
      }

      const formattedTests = await Promise.all(
        testsArray.map(async (test: any) => {
          const testId = test.test_id || test.id;
          let questionsCount = 0;
          
          try {
            const qRes = await fetch(`${API_BASE_URL}/api/questions/test/${testId}`);
            if (qRes.ok) {
              const qData = await qRes.json();
              questionsCount = Array.isArray(qData) ? qData.length : (qData.questions?.length || 0);
            }
          } catch (e) {  }

          const userSessionsForTest = sessions.filter((s: any) => s.test_id === testId);
          let status: "available" | "completed" | "in_progress" | "locked" = "available";
          let completed = false;

          if (userSessionsForTest.some((s: any) => s.status === 'completed')) {
            status = "completed";
            completed = true;
          } 
          else if (userSessionsForTest.some((s: any) => s.status === 'in_progress')) {
            status = "in_progress";
          }

          return {
            id: testId,
            name: test.test_name || test.name || `Test ${testId}`,
            code: test.test_code || test.code || '',
            duration: Math.floor((test.duration || 3600) / 60),
            questionsCount,
            completed,
            status,
            test_id: testId,
            test_name: test.test_name || test.name || `Test ${testId}`,
            test_code: test.test_code || test.code || '',
            duration_seconds: test.duration || 3600,
            order_number: test.order_number || test.id
          };
        })
      );

      const sortedTests = formattedTests.sort((a, b) => (a.order_number || 0) - (b.order_number || 0));
      
      let isPreviousCompleted = true; 
      const finalTests = sortedTests.map((test) => {
        let finalStatus = test.status;
        if (!isPreviousCompleted && finalStatus === 'available') {
          finalStatus = 'locked';
        }
        isPreviousCompleted = test.completed;
        return { ...test, status: finalStatus };
      });

      setAvailableTests(finalTests);

    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      setAvailableTests([]); 
    } finally {
      setLoading(false);
    }
  };

 const handleLogout = () => {
  showDialog({
    type: 'confirm', 
    title: 'Keluar Akun',
    message: 'Apakah Anda yakin ingin keluar?',
    onConfirm: () => {
      localStorage.removeItem("user");
      localStorage.removeItem("userType");
      router.push("/");
    }
  });
};

  const handleStartTest = async (testId: number) => {
    if (startingTest) return;
    
    setStartingTest(testId);
    
    try {
      const userData = localStorage.getItem("user");
      if (!userData) {
        router.push("/");
        return;
      }
      
      const user = JSON.parse(userData);
      const existingSession = testHistory.find(h => h.test_id === testId);

      if (existingSession) {
        if (existingSession.status === 'completed') {
          alert('Anda sudah menyelesaikan tes ini!');
          setStartingTest(null);
          return;
        }

        if (existingSession.status === 'in_progress') {
          localStorage.setItem(`current_session_${testId}`, existingSession.id.toString());
          localStorage.setItem('next_test_id', testId.toString());
          router.push(`/kandidat/panduan?testId=${testId}`);
          return;
        }
      }
      
      const sessionResponse = await fetch(`${API_BASE_URL}/api/testSessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participant_id: user.participant_id,
          test_id: testId,
        }),
      });
      
      if (!sessionResponse.ok) {
        throw new Error(`Failed to create session`);
      }
      
      const sessionData = await sessionResponse.json();
      const newSessionId = sessionData.session_id || sessionData.session?.session_id;
      
      if (newSessionId) {
        localStorage.setItem(`current_session_${testId}`, newSessionId.toString());
      }
      
      localStorage.setItem('next_test_id', testId.toString());
      localStorage.setItem('last_test_attempt', Date.now().toString());
      
      router.push(`/kandidat/panduan?testId=${testId}`); 
      
    } catch (error) {
      console.error('❌ Error starting test:', error);
      alert('Gagal memulai tes, silakan coba lagi atau cek koneksi Anda.');
      setStartingTest(null);
    }
  };

  const hasActiveTest = availableTests.some(test => test.status === 'in_progress');

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#242467]"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 flex flex-col ${!isFullscreen ? 'overflow-hidden' : ''}`}>
      
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
     
      {!isFullscreen && (
        <div className="fixed inset-0 z-[99999] bg-gray-900/95 backdrop-blur-md flex flex-col items-center justify-center p-6">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full text-center animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-blue-100">
              <Maximize className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-3">Layar Penuh Diwajibkan</h2>
            <p className="text-gray-600 mb-8 text-sm leading-relaxed font-medium">
              Sistem mendeteksi Anda keluar dari mode layar penuh. Untuk menjaga integritas dan fokus selama tes, Anda diwajibkan untuk kembali ke mode layar penuh.
            </p>
            <button 
              onClick={enterFullscreen}
              className="w-full bg-[#242467] hover:bg-[#1a1a52] text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-[0_4px_14px_0_rgba(36,36,103,0.39)] hover:shadow-[0_6px_20px_rgba(36,36,103,0.23)] flex items-center justify-center hover:-translate-y-0.5"
            >
              <Maximize className="w-5 h-5 mr-2" />
              Aktifkan Kembali Layar Penuh
            </button>
          </div>
        </div>
      )}

      <header className="bg-[#242467] text-white shadow-lg">
        <div className="container mx-auto px-4 py-4 md:py-6">

           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center justify-between w-full md:w-auto">
            <div>
                <h1 className="text-2xl font-bold">Sistem Psikotes Online</h1>
                <p className="text-blue-200 text-sm">Selamat datang, {user.name}</p>
              </div>
            </div>

           <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-4 border-t border-white/10 md:border-none pt-4 md:pt-0">
                         <div className="flex items-center space-x-3">
                           <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                             <User className="w-6 h-6 md:w-8 md:h-8 text-blue-700" />
                           </div>
                <div>
                  <div className="font-bold">{user.name}</div>
                  <div className="text-blue-200 text-sm">Kandidat</div>
                </div>
              </div>

               <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-3 md:px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors text-sm md:text-base"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </div>
          </div>

          <nav className="mt-6">
            <div className="flex space-x-8">
              <button className="flex items-center space-x-2 pb-3 text-yellow-300 border-b-4 border-yellow-300 cursor-default">
                <FileText className="w-5 h-5" />
                <span className="font-semibold">Beranda Kandidat</span>
              </button>
            </div>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 flex-1 flex flex-col">
        <div className="relative bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 mb-8 shadow-lg overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Halo Selamat Datang, {user.name.split(' ')[0]}!
            </h2>
            <p className="text-gray-600 text-lg mb-6">
              Silakan mengerjakan setiap soal dengan teliti, jujur, dan sesuai dengan kondisi diri Anda.
              Hasil psikotes ini akan digunakan sebagai bahan evaluasi sesuai dengan kebutuhan.
              Terima kasih atas partisipasi Anda. 
            </p>
          </div>
          
          <div className="absolute top-0 right-0 w-1/3 h-full pointer-events-none">
            <div className="absolute top-4 right-4 w-64 h-64 bg-gradient-to-br from-[#242467]/20 to-indigo-400/20 rounded-full"></div>
            <div className="absolute bottom-4 right-32 w-48 h-48 bg-gradient-to-tr from-yellow-300 to-orange-400 opacity-20 rounded-full"></div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-100 overflow-hidden mb-8">
          <div className="p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Daftar Tes Tersedia</h2>
            
            {availableTests.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Tidak ada tes yang tersedia</h3>
                <p className="text-gray-500">Tes untuk posisi Anda saat ini kosong atau sedang dalam pemeliharaan.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {availableTests.map((test) => (
                  <div
                    key={test.id}
                    className={`p-6 rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${
                      test.status === 'completed'
                        ? 'bg-green-50 border-green-200'
                        : test.status === 'in_progress'
                        ? 'bg-yellow-50 border-yellow-200'
                        : test.status === 'locked'
                        ? 'bg-gray-50 border-gray-200 opacity-70'
                        : 'bg-white border-gray-200 hover:border-[#242467]/30'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                      <div className="flex items-start space-x-4 mb-4 md:mb-0">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          test.status === 'completed' ? 'bg-green-100' :
                          test.status === 'in_progress' ? 'bg-yellow-100' :
                          test.status === 'locked' ? 'bg-gray-200' :
                          'bg-[#242467]/10'
                        }`}>
                          {test.status === 'completed' ? (
                            <CheckCircle className="w-7 h-7 text-green-600" />
                          ) : test.status === 'in_progress' ? (
                            <Clock className="w-7 h-7 text-yellow-600" />
                          ) : test.status === 'locked' ? (
                             <AlertCircle className="w-7 h-7 text-gray-500" />
                          ) : (
                            <FileText className="w-7 h-7 text-[#242467]" />
                          )}
                        </div>
                        
                        <div>
                          <div className="flex items-center mb-1">
                            {test.code && (
                              <span className={`text-xs font-semibold px-2 py-1 rounded mr-3 ${
                                test.status === 'completed' ? 'bg-green-100 text-green-700' :
                                test.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                                test.status === 'locked' ? 'bg-gray-200 text-gray-500' :
                                'bg-[#242467]/10 text-[#242467]'
                              }`}>
                                {test.code}
                              </span>
                            )}
                            <h3 className="text-xl font-bold text-gray-800">{test.name}</h3>
                          </div>
                          
                          <div className="flex flex-wrap gap-4 mt-2">
                            <div className="flex items-center text-gray-500 text-sm">
                              <Clock className="w-4 h-4 mr-1.5" />
                              <span>{test.duration} menit</span>
                            </div>
                            <div className="flex items-center text-gray-500 text-sm">
                              <FileText className="w-4 h-4 mr-1.5" />
                              <span>{test.questionsCount} Soal</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center mt-2 md:mt-0">
                        {test.status === 'completed' ? (
                          <div className="flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-lg font-bold">
                            <CheckCircle className="w-5 h-5 mr-2" />
                            <span>Selesai</span>
                          </div>
                        ) : test.status === 'in_progress' ? (
                          <button
                            onClick={() => handleStartTest(test.id)}
                            disabled={startingTest === test.id}
                            className="flex items-center px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-xl shadow-lg transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {startingTest === test.id ? (
                              <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                Memuat...
                              </>
                            ) : (
                              <>
                                <Clock className="w-5 h-5 mr-2 animate-pulse" />
                                Lanjutkan Tes
                              </>
                            )}
                          </button>
                        ) : test.status === 'locked' ? (
                          <button
                            disabled
                            className="flex items-center px-6 py-3 font-bold rounded-xl bg-gray-200 text-gray-500 cursor-not-allowed"
                          >
                            <AlertCircle className="w-5 h-5 mr-2" />
                            Terkunci
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStartTest(test.id)}
                            disabled={startingTest === test.id || hasActiveTest}
                            className={`flex items-center px-6 py-3 font-bold rounded-xl shadow-lg transition-all duration-300 ${
                              startingTest === test.id || hasActiveTest
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-[#242467] hover:bg-[#1a1a52] text-white hover:shadow-xl hover:scale-105'
                            }`}
                          >
                            {startingTest === test.id ? (
                              <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500 mr-2"></div>
                                Memulai...
                              </>
                            ) : (
                              <>
                                <Play className="w-5 h-5 mr-2 fill-current" />
                                Mulai Tes
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="border-t border-blue-100 p-8 bg-gradient-to-r from-blue-50 to-indigo-50">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <AlertCircle className="w-6 h-6 text-[#242467] mr-3" />
              Petunjuk Pengerjaan
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-[#242467] rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span>Kerjakan tes secara berurutan dengan menekan tombol "Mulai Tes" yang tersedia.</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-[#242467] rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span>Pastikan koneksi internet stabil sebelum memulai tes. Tes dilakukan secara waktu nyata dan memerlukan koneksi jaringan yang stabil.</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-[#242467] rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span>Sistem akan memaksa mode layar penuh (Full Screen) untuk mencegah kecurangan.</span>
                </li>
              </ul>
              
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-[#242467] rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span>Perhatikan batas waktu yang tersedia untuk setiap butir soal maupun keseluruhan tes.</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-[#242467] rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span>Jawaban akan otomatis tersimpan ke server setiap kali Anda berpindah soal.</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-[#242467] rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span>Tes yang sudah dikerjakan ("Selesai") tidak dapat diulang kembali.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-[#242467] text-white py-6 md:py-8 mt-auto">
             <div className="container mx-auto px-4">
               <div className="flex flex-col md:flex-row justify-between items-center md:items-start text-center md:text-left gap-6 md:gap-0">
                 <div>
                   <p className="font-bold mb-1 text-sm md:text-base">PT. Global Inti Sejati</p>
                   <p className="text-blue-200 text-xs md:text-sm">Jl. Wibawa Mukti II no.88, Jatiasih - Bekasi, 17423 - Indonesia</p>
                   <div className="flex items-center justify-center md:justify-start space-x-2 mt-2 md:mt-3 text-blue-100">
                     <Mail className="w-3.5 h-3.5 md:w-4 md:h-4" />
                     <span className="text-xs md:text-sm hover:text-white cursor-pointer transition-colors">recruitment@globalinti.com</span>
                   </div>
                 </div>  
     
                 <div className="md:text-right border-t border-white/20 pt-6 md:border-none md:pt-0">
                   <p className="font-bold mb-1 text-sm md:text-base">PT. Garuda Mart Indonesia (HO)</p>
                   <p className="text-blue-200 text-xs md:text-sm">Sakura Regency Blok J5-8A, Jatiasih - Bekasi, 17423 - Indonesia</p>
                   <div className="flex items-center justify-center md:justify-end space-x-2 mt-2 md:mt-3 text-blue-100">
                     <Mail className="w-3.5 h-3.5 md:w-4 md:h-4" />
                     <span className="text-xs md:text-sm hover:text-white cursor-pointer transition-colors">recruitment@garudamart.com</span>
                   </div>
                 </div>
               </div>
             </div>
           </footer>
    </div>
  );
}