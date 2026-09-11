

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Home, 
  Users, 
  BarChart3,
  Mail,
  Shield,
  User,
  LogOut,
  MessageSquare,
  Plus,
  Download,
  Clock,
  CheckCircle,
  AlertTriangle,
  ChevronDown,
  FileText,
  AlertCircle,
  Loader2
} from "lucide-react";

// const API_BASE_URL = 'https://api.lourdesautoparts.com';
const API_BASE_URL = '';

interface Stats {
  totalCandidates: number;
  activeCandidates: number;
  averageScore: number;
  totalAnnouncements: number;
  upcomingTests: number;
  pendingReviews: number;
}



interface RecentCandidate {
  id: number;
  name: string;
  position: string;
  status: "completed" | "in_progress" | "pending";
  testDate: string;
  score?: number;
  email?: string;
  phone?: string;
  level_name?: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [showAddCandidate, setShowAddCandidate] = useState(false);

    const [isEvalDropdownOpen, setIsEvalDropdownOpen] = useState(false);


  const [stats, setStats] = useState<Stats>({
    totalCandidates: 0,
    activeCandidates: 0,
    averageScore: 0,
    totalAnnouncements: 0,
    upcomingTests: 0,
    pendingReviews: 0
  });
  
  const [recentCandidates, setRecentCandidates] = useState<RecentCandidate[]>([]);

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
    const fetchData = async () => {
      const adminData = localStorage.getItem("admin");
      const userType = localStorage.getItem("userType");
      const role = localStorage.getItem("role");

      if (!adminData || userType !== "admin" || role !== "HRD") {
        alert("Akses ditolak. Silakan login sebagai admin");
        router.push("/");
        return;
      }

      setAdmin(JSON.parse(adminData));
      
      try {
        await Promise.all([
          loadDashboardStats(),
          loadRecentCandidates()
        ]);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const loadDashboardStats = async () => {
    try {
      const candidatesResponse = await fetch(`${API_BASE_URL}/api/participants`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (candidatesResponse.ok) {
        const result = await candidatesResponse.json();
        const candidates = Array.isArray(result) ? result : (result.data || []);
        const totalCandidates = candidates.length;
        const activeCandidates = candidates.filter((c: any) => c.testScore || c.status === 'active').length;
        
        setStats(prev => ({
          ...prev,
          totalCandidates: totalCandidates,
          activeCandidates: activeCandidates
        }));
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    }
  };



  const loadRecentCandidates = async () => {
    try {
      const resC = await fetch(`${API_BASE_URL}/api/participants`);
      const dataC = await resC.json();
      let participants = Array.isArray(dataC) ? dataC : (dataC.data || []);

      const resS = await fetch(`${API_BASE_URL}/api/testSessions/laporan/all`);
      let allSessions: any[] = [];
      if (resS.ok) {
        const dataS = await resS.json();
        allSessions = Array.isArray(dataS) ? dataS : (dataS.data || []);
      }

      const resL = await fetch(`${API_BASE_URL}/api/job-levels`);
      let levels = [];
      if (resL.ok) {
        const dataL = await resL.json();
        levels = Array.isArray(dataL) ? dataL : (dataL.data || []);
      }

      const requiredTestsPerLevel: Record<number, number> = {};
      for (const lvl of levels) {
        try {
          const reqRes = await fetch(`${API_BASE_URL}/api/tests/level/${lvl.level_id}`);
          if (reqRes.ok) {
            const reqData = await reqRes.json();
            let tArr = Array.isArray(reqData) ? reqData : (reqData.data || reqData.tests || []);
            requiredTestsPerLevel[lvl.level_id] = tArr.length > 0 ? tArr.length : 3; 
          }
        } catch {
          requiredTestsPerLevel[lvl.level_id] = 3;
        }
      }

      participants = participants.slice(0, 5);

      
      const formattedCandidates = participants.map((candidate: any) => {
        
      
        const reportRow = allSessions.find((s: any) => 
          String(s.id) === String(candidate.participant_id)
        );
        
       
        const completedTests = reportRow ? (reportRow.completed_count || 0) : 0;
        const hasInProgress = reportRow ? (reportRow.in_progress_count > 0) : false;
        
        const targetTests = requiredTestsPerLevel[candidate.level_id] || 3;
        let finalStatus: "completed" | "in_progress" | "pending" = "pending"; 

      
        if (completedTests > 0 && completedTests >= targetTests) {
          finalStatus = "completed"; 
        } else if (completedTests > 0 || hasInProgress) {
          finalStatus = "in_progress"; 
        }

        return {
          id: candidate.participant_id,
          name: candidate.name,
          position: candidate.level_name || "Posisi Belum Ditentukan",
          status: finalStatus,
          testDate: candidate.created_at ? new Date(candidate.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          email: candidate.email,
          phone: candidate.nomor_telpon || candidate.phone || ""
        };
      });

      setRecentCandidates(formattedCandidates);
    } catch (error) {
      console.error('Error loading recent candidates:', error);
      setRecentCandidates([]);
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {dialog.isOpen && (
        <div className="fixed inset-0 z-[9999999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in duration-200">
            <div className="flex items-center mb-4">
              {dialog.type === 'confirm' ? <AlertTriangle className="w-7 h-7 text-yellow-500 mr-3 flex-shrink-0" /> : <AlertCircle className="w-7 h-7 text-[#242467] mr-3 flex-shrink-0" />}
              <h3 className="text-xl font-bold text-gray-900">{dialog.title}</h3>
            </div>
            <div className="mb-8 text-gray-600 whitespace-pre-line leading-relaxed text-sm md:text-base">
              {dialog.message}
            </div>
            <div className="flex justify-end space-x-3">
              {dialog.type === 'confirm' && (
                <button onClick={closeDialog} className="px-4 md:px-5 py-2 md:py-2.5 rounded-lg font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm md:text-base">
                  {dialog.cancelText || 'Batal'}
                </button>
              )}
              <button onClick={() => { if (dialog.onConfirm) dialog.onConfirm(); closeDialog(); }} className="px-4 md:px-5 py-2 md:py-2.5 rounded-lg font-bold bg-[#242467] text-white hover:bg-[#1a1a52] text-sm md:text-base">
                {dialog.confirmText || 'Oke'}
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="bg-[#242467] text-white shadow-lg relative z-50">
             <div className="container mx-auto px-4 py-4 md:py-6">
     
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                 <div className="flex items-center justify-between w-full md:w-auto">
                   <div>
                     <h1 className="text-xl md:text-2xl font-bold">Sistem Psikotes Online - Admin</h1>
                     <p className="text-blue-200 text-xs md:text-sm mt-0.5">Kelola Pengumuman</p>
                   </div>
                 </div>
     
                 <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-4 border-t border-white/10 md:border-none pt-4 md:pt-0">
                   <div className="flex items-center space-x-3">
                     <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                       <User className="w-6 h-6 md:w-8 md:h-8 text-blue-700" />
                     </div>
                     <div className="font-bold text-sm md:text-base truncate max-w-[120px] md:max-w-none">
    {admin?.name || admin?.email || "Admin"}
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
     
               
<nav className="mt-4 md:mt-6 overflow-x-auto md:overflow-visible no-scrollbar pb-2">                
                 <div className="flex flex-nowrap items-center space-x-6 md:space-x-8 min-w-max border-t border-white/10 pt-4 md:border-none md:pt-0">
                   <Link
                     href="/hrd/dashboard"
className={`flex items-center space-x-2 pb-2 ${
                       "text-yellow-300 border-b-4 border-yellow-300"
                     }`}                     >
                     <Home className="w-4 h-4 md:w-5 md:h-5" />
                     <span className="font-semibold text-sm md:text-base">Beranda</span>
                   </Link>
     
                   <Link
                     href="/hrd/kelola-kandidat"
                                      className="flex items-center space-x-2 pb-2 text-white/80 hover:text-white transition-colors"
  >
                     <Users className="w-4 h-4 md:w-5 md:h-5" />
                     <span className="font-semibold text-sm md:text-base">Kelola Kandidat</span>
                   </Link>
     
                    <Link
                     href="/hrd/admin"
                     className="flex items-center space-x-2 pb-2 text-white/80 hover:text-white transition-colors"
                   >
                     <Shield className="w-4 h-4 md:w-5 md:h-5" />
                     <span className="font-semibold text-sm md:text-base">Kelola Admin</span>
                   </Link>
     
                   <Link
                     href="/hrd/pengumuman"
                     className="flex items-center space-x-2 pb-2 text-white/80 hover:text-white transition-colors"
                   >
                     <Mail className="w-4 h-4 md:w-5 md:h-5" />
                     <span className="font-semibold text-sm md:text-base">Pengumuman</span>
                   </Link>
     
                   <Link
                     href="/hrd/laporan"
                                    className="flex items-center space-x-2 pb-2 text-white/80 hover:text-white transition-colors"
      >
                     <BarChart3 className="w-4 h-4 md:w-5 md:h-5" />
                     <span className="font-semibold text-sm md:text-base">Hasil Tes</span>
                   </Link>
     
                    <div className="relative">
                    <button 
                      onClick={() => setIsEvalDropdownOpen(!isEvalDropdownOpen)}
                      className="flex items-center space-x-2 pb-2 text-white/80 hover:text-white transition-colors outline-none whitespace-nowrap"
                    >
                      <FileText className="w-4 h-4 md:w-5 md:h-5" />
                      <span className="font-semibold text-sm md:text-base">Formulir</span>
                      <ChevronDown className={`w-3 h-3 md:w-4 md:h-4 transition-transform ${isEvalDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {isEvalDropdownOpen && (
                      <div 
                        className="fixed inset-0 z-[90]" 
                        onClick={() => setIsEvalDropdownOpen(false)}
                      ></div>
                    )}
                    
                    <div className={`fixed md:absolute left-4 right-4 md:left-auto md:right-0 mt-2 md:w-48 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden py-1 z-[100] transition-all duration-200 origin-top text-black ${isEvalDropdownOpen ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0 pointer-events-none'}`}>
                      <Link 
                        href="/hrd/resume" 
                        onClick={() => setIsEvalDropdownOpen(false)} 
                        className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-[#242467] transition-colors relative z-10"
                      >
                        Formulir Evaluasi Kandidat
                      </Link>
                      <Link 
                        href="/hrd/data-diri" 
                        onClick={() => setIsEvalDropdownOpen(false)} 
                        className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-[#242467] transition-colors relative z-10"
                      >
                        Formulir Data Diri
                      </Link>
                    </div>
                  </div>
                 </div>
               </nav>
             </div>
           </header>

   <main className="container mx-auto px-4 py-6 md:py-8 flex-1 flex flex-col space-y-6 md:space-y-8">
        
        <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl p-6 md:p-8 mb-6 md:mb-8 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-blue-200">
          <div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-2 tracking-tight">
              Selamat Datang, <span className="text-[#242467]">{admin?.username?.split(' ')[0] || "Admin"}</span>! 👋
            </h2>
            <p className="text-gray-700 text-sm md:text-base lg:text-lg max-w-xl">
              Pantau progress psikotes kandidat hari ini, kelola akses sistem, dan unduh laporan hasil penilaian dengan cepat.
            </p>
          </div>

          <div className="flex w-full md:w-auto">
            <Link 
              href="/hrd/admin"
              className="w-full md:w-auto bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 font-bold px-6 py-3 rounded-xl flex items-center space-x-2 shadow-lg"
            >
              <Users className="w-5 h-5 mr-2" />
              Kelola Admin
            </Link>
          </div>
        </div>

        <div>
          <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4">Aksi Cepat</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5">
            
            <Link 
              href="/hrd/kelola-kandidat?action=add"
              className="bg-white p-4 md:p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex items-center group"
            >
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mr-4 group-hover:bg-blue-600 group-hover:text-white transition-colors flex-shrink-0">
                <Plus className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-gray-900 text-sm md:text-base truncate">Undang Kandidat</div>
                <div className="text-xs text-gray-500 truncate">Tambah data peserta baru</div>
              </div>
            </Link>

            <Link 
              href="/hrd/pengumuman?action=create"
              className="bg-white p-4 md:p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all flex items-center group"
            >
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mr-4 group-hover:bg-purple-600 group-hover:text-white transition-colors flex-shrink-0">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-gray-900 text-sm md:text-base truncate">Sebar Pengumuman</div>
                <div className="text-xs text-gray-500 truncate">Kirim info massal</div>
              </div>
            </Link>

            <Link 
              href="/hrd/laporan"
              className="bg-white p-4 md:p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-green-200 transition-all flex items-center group"
            >
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mr-4 group-hover:bg-green-600 group-hover:text-white transition-colors flex-shrink-0">
                <Download className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-gray-900 text-sm md:text-base truncate">Unduh Laporan</div>
                <div className="text-xs text-gray-500 truncate">Export hasil penilaian</div>
              </div>
            </Link>

          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 md:p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/30">
            <div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900">Aktivitas Kandidat Terbaru</h3>
              <p className="text-xs md:text-sm text-gray-500 mt-1">Pantau status pengerjaan tes kandidat secara real-time.</p>
            </div>
            <Link 
              href="/hrd/kelola-kandidat"
              className="text-[#242467] bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg font-bold text-xs md:text-sm transition-colors flex items-center"
            >
              Lihat Semua <span className="ml-2">→</span>
            </Link>
          </div>
          
          <div className="divide-y divide-gray-100">
            {recentCandidates?.length > 0 ? (
              recentCandidates.map((candidate) => (
                <div key={candidate.id} className="p-4 md:p-5 hover:bg-gray-50/80 transition-colors flex flex-col sm:flex-row justify-between sm:items-center gap-4 group">
                  
                  <div className="flex items-center">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-200 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                      <User className="w-5 h-5 text-gray-500" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-gray-900 text-sm md:text-base truncate group-hover:text-[#242467] transition-colors">{candidate.name}</div>
                      <div className="text-xs md:text-sm font-medium text-gray-500 truncate mt-0.5">{candidate.position}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-start sm:justify-end w-full sm:w-auto ml-14 sm:ml-0">
                    {candidate.status === 'completed' ? (
                      <span className="flex items-center px-3 py-1.5 rounded-md text-xs font-bold bg-green-50 text-green-700 border border-green-100 whitespace-nowrap shadow-sm">
                        <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Selesai Tes
                      </span>
                    ) : candidate.status === 'in_progress' ? (
                      <span className="flex items-center px-3 py-1.5 rounded-md text-xs font-bold bg-yellow-50 text-yellow-700 border border-yellow-100 whitespace-nowrap shadow-sm">
                        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Sedang Mengerjakan
                      </span>
                    ) : (
                      <span className="flex items-center px-3 py-1.5 rounded-md text-xs font-bold bg-gray-50 text-gray-600 border border-gray-200 whitespace-nowrap shadow-sm">
                        <Clock className="w-3.5 h-3.5 mr-1.5" /> Belum Tes
                      </span>
                    )}
                  </div>
                  
                </div>
              ))
            ) : (
              <div className="p-12 text-center flex flex-col items-center">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-dashed border-gray-300">
                   <Users className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-900 font-bold text-base mb-1">Belum ada aktivitas kandidat</p>
                <p className="text-gray-500 text-sm">Kandidat yang terdaftar akan muncul di sini.</p>
              </div>
            )}
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