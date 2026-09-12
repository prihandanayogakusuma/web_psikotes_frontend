"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Home, 
  Users, 
  BarChart3,
  Phone,
  User,
  LogOut,
  Search,
  Mail,
  Send,
  ChevronDown,

  Shield,
  Filter,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  X,
  Loader2,
  CheckCircle,
  AlertTriangle,
  FileText,
  XCircle
} from "lucide-react";

const API_BASE_URL = 'https://api.lourdesautoparts.com';


interface Participant {
  participant_id: number;
  name: string;
  email: string;
  level_name?: string;
  nomor_telpon?: string;
}



export default function PengumumanPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<any>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [filteredParticipants, setFilteredParticipants] = useState<Participant[]>([]);
  const [selectedParticipants, setSelectedParticipants] = useState<number[]>([]);
  
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  
    const [isEvalDropdownOpen, setIsEvalDropdownOpen] = useState(false);


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


  const [emailData, setEmailData] = useState({
    subject: "",
    message: "",
  });

  const [sendResults, setSendResults] = useState<{
    total_sent: number;
    total_failed: number;
    results: Array<{
      id: number;
      name: string;
      email: string;
      status: 'sent' | 'failed';
      error?: string;
    }>;
  } | null>(null);

  const [isSending, setIsSending] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [positionFilter, setPositionFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const toParam = params.get('to');
    const subjectParam = params.get('subject');
    const messageParam = params.get('message');
    const actionParam = params.get('action');

    if (actionParam === 'create') {
      // 1. Langsung isi Subjek dan Pesan dari URL, lalu buka modal!
      if (subjectParam || messageParam) {
        setEmailData({
          subject: subjectParam || "",
          message: messageParam || ""
        });
        setShowEmailModal(true);
      }

      // 2. Jika data tabel (participants) sudah selesai dimuat, cari ID-nya lalu centang otomatis
      if (participants.length > 0 && toParam) {
        const targetCandidate = participants.find(
          p => p.email.toLowerCase() === toParam.toLowerCase()
        );

        if (targetCandidate) {
          setSelectedParticipants(prev => {
            // Mencegah duplikasi centang
            if (!prev.includes(targetCandidate.participant_id)) {
              return [...prev, targetCandidate.participant_id];
            }
            return prev;
          });
        }
      }
    }
  }, [participants]);

  useEffect(() => {
    const fetchData = async () => {
      const adminData = localStorage.getItem("admin");
      const userType = localStorage.getItem("userType");
      const role = localStorage.getItem("role");

      if (!adminData || userType !== "admin" || role !== "HRD") {
    showDialog({
      type: 'alert',
      title: 'Akses Ditolak',
      message: 'Silakan login sebagai admin',
      onConfirm: () => router.push("/")
    });        router.push("/");
        return;
      }

      setAdmin(JSON.parse(adminData));
      
      try {
        await loadParticipants();
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    fetchData();
  }, [router]);

  useEffect(() => {
    let filtered = participants;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.email.toLowerCase().includes(query) ||
        (p.level_name && p.level_name.toLowerCase().includes(query))
      );
    }
    
    if (positionFilter !== "all") {
      filtered = filtered.filter(p => 
        p.level_name?.toLowerCase() === positionFilter.toLowerCase()
      );
    }
    
    filtered = filtered.sort((a, b) => 
      (a.name || "").localeCompare(b.name || "")
    );
    
    setFilteredParticipants(filtered);
    setCurrentPage(1); 
  }, [participants, searchQuery, positionFilter]);

const loadParticipants = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/participants`);
      const result = await response.json();
      
      let partsData: any[] = [];
      if (Array.isArray(result)) partsData = result;
      else if (result.success && Array.isArray(result.data)) partsData = result.data;
      else if (result.participants && Array.isArray(result.participants)) partsData = result.participants;

      setParticipants(partsData); 
      
    } catch (error) {
      console.error('Error loading participants:', error);
    }
  };

 const handleSendEmail = async () => {
  if (!emailData.subject || !emailData.message) {
    showDialog({
      type: 'alert',
      title: 'Peringatan',
      message: 'Subjek dan pesan harus diisi!'
    });
    return;
  }

  setIsSending(true);
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/email/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        participantIds: selectedParticipants,
        subject: emailData.subject,
        message: emailData.message,
        adminId: admin.user_id
      })
    });

    const result = await response.json();
    
    if (result.success) {
      setSendResults(result.data);

      showDialog({
        type: 'alert',
        title: 'Berhasil',
        message: result.message,
        onConfirm: () => {
          setShowEmailModal(false);
          setEmailData({ subject: "", message: "" });
          setSelectedParticipants([]);
          setShowResultsModal(true);
        }
      });

    } else {
      showDialog({
        type: 'alert',
        title: 'Gagal',
        message: 'Gagal mengirim email: ' + (result.error || 'Unknown error')
      });
    }

  } catch (error) {
    console.error('Error sending email:', error);
    showDialog({
      type: 'alert',
      title: 'Error',
      message: 'Terjadi kesalahan saat mengirim email'
    });
  } finally {
    setIsSending(false);
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

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredParticipants.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredParticipants.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const isAllCurrentItemsSelected = currentItems.length > 0 && currentItems.every(p => selectedParticipants.includes(p.participant_id));

  const handleSelectAll = () => {
    if (isAllCurrentItemsSelected) {
      const currentIds = currentItems.map(p => p.participant_id);
      setSelectedParticipants(prev => prev.filter(id => !currentIds.includes(id)));
    } else {
      const currentIds = currentItems.map(p => p.participant_id);
      const newSelections = currentIds.filter(id => !selectedParticipants.includes(id));
      setSelectedParticipants(prev => [...prev, ...newSelections]);
    }
  };

  const positions = [...new Set(participants.map(p => p.level_name).filter(Boolean))];

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <div className="min-h-screen bg-white flex flex-col">

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
                    className="flex items-center space-x-2 pb-2 text-white/80 hover:text-white transition-colors"
                  >
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
     className={`flex items-center space-x-2 pb-2 ${
                      "text-yellow-300 border-b-4 border-yellow-300"
                    }`}                   >
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
                        Formulir Penilaian Kandidat
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

      <main className="container mx-auto px-4 py-8 flex-1 flex flex-col">
       
        <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl p-6 md:p-8 mb-6 md:mb-8 shadow-lg">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">

          <div className="w-full lg:w-auto">
    
              <h2 className="text-4xl font-bold text-black mb-2">
                Kirim Email ke Kandidat 📧
              </h2>
              <p className="text-gray-600 text-sm md:text-base lg:text-lg">
              Pilih kandidat untuk mengirimkan informasi hasil psikotes atau informasi akun secara langsung melalui email.
              </p>
           </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 mb-6 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  suppressHydrationWarning
                  type="text"
                  placeholder="Cari kandidat berdasarkan nama, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black placeholder-gray-500 bg-gray-50/50"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-gray-50/50 border border-gray-200 rounded-xl px-4">
                <Filter className="w-5 h-5 text-gray-600 mr-2" />
                <select
                  suppressHydrationWarning
                  value={positionFilter}
                  onChange={(e) => setPositionFilter(e.target.value)}
                  className="py-3 bg-transparent focus:outline-none text-gray-700 font-medium"
                >
                  <option value="all">Semua Posisi</option>
                  {positions.map((position, index) => (
                    <option key={index} value={position || ""}>
                      {position}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md overflow-hidden flex-1 flex flex-col border border-gray-200">
          <div className="p-6 border-b flex justify-between items-center bg-gray-50/80">
            <h3 className="text-xl font-bold text-gray-800 flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-600" />
              Daftar Kandidat
            </h3>
            <div className="flex items-center space-x-4">
              <div className="text-sm bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
                <span className="font-bold text-blue-700">{selectedParticipants.length}</span> <span className="text-blue-600 font-medium">terpilih dari total {participants.length}</span>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto flex-1 min-h-[400px]">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="py-4 px-6 text-center w-16">
                    <input
                      type="checkbox"
                      checked={isAllCurrentItemsSelected}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                    />
                  </th>
                  <th className="py-4 px-6 text-gray-600 font-semibold text-sm uppercase tracking-wider w-1/3">Nama Kandidat</th>
                  <th className="py-4 px-6 text-gray-600 font-semibold text-sm uppercase tracking-wider w-1/3">Alamat Email</th>
                  <th className="py-4 px-6 text-gray-600 font-semibold text-sm uppercase tracking-wider w-1/6">Posisi</th>
                  <th className="py-4 px-6 text-gray-600 font-semibold text-sm uppercase tracking-wider w-1/6">Telepon</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentItems.length > 0 ? (
                  currentItems.map((participant) => (
                    <tr 
                      key={participant.participant_id} 
                      className={`hover:bg-blue-50/30 transition-colors cursor-pointer ${
                        selectedParticipants.includes(participant.participant_id) ? 'bg-blue-50/50' : ''
                      }`}
                      onClick={() => {
                        if (selectedParticipants.includes(participant.participant_id)) {
                          setSelectedParticipants(selectedParticipants.filter(id => id !== participant.participant_id));
                        } else {
                          setSelectedParticipants([...selectedParticipants, participant.participant_id]);
                        }
                      }}
                    >
                      <td className="py-4 px-6 text-center">
                        <input
                          type="checkbox"
                          checked={selectedParticipants.includes(participant.participant_id)}
                          onChange={(e) => {
                            e.stopPropagation(); 
                            if (e.target.checked) {
                              setSelectedParticipants([...selectedParticipants, participant.participant_id]);
                            } else {
                              setSelectedParticipants(
                                selectedParticipants.filter(id => id !== participant.participant_id)
                              );
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                        />
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex items-center">
                           <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3 text-indigo-700 font-bold flex-shrink-0">
                              {participant.name.charAt(0).toUpperCase()}
                           </div>
                           <div className="font-bold text-gray-800 truncate max-w-[200px] lg:max-w-[300px]" title={participant.name}>
                             {participant.name}
                           </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center text-gray-600">
                          <Mail className="w-4 h-4 mr-2 flex-shrink-0 text-gray-400" />
                          <span className="truncate max-w-[200px] lg:max-w-[250px]" title={participant.email}>
                            {participant.email}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 whitespace-nowrap border border-gray-200">
                          {participant.level_name || 'Tidak ada info'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center text-gray-600 whitespace-nowrap">
                          <Phone className="w-4 h-4 mr-2 text-gray-400" />
                          {participant.nomor_telpon || '-'}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-16 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                          <Search className="w-10 h-10 text-gray-300" />
                        </div>
                        <p className="text-lg font-bold text-gray-700 mb-1">Tidak ada kandidat ditemukan</p>
                        <p className="text-sm text-gray-500">Coba ubah kata kunci pencarian atau filter posisi</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
      
          <div className="p-6 border-t border-gray-200 bg-white flex flex-col sm:flex-row justify-between items-center gap-4 mt-auto">
          
            {filteredParticipants.length > 0 && (
              <div className="flex items-center">
                <span className="text-sm text-gray-600 mr-4 hidden md:block">
                  Hal <span className="font-bold text-gray-900">{currentPage}</span> dari <span className="font-bold text-gray-900">{totalPages}</span>
                </span>
                <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px bg-white border border-gray-200" aria-label="Pagination">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-3 py-2 rounded-l-lg text-sm font-medium ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50 hover:text-blue-600'}`}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  
                  {[...Array(totalPages)].map((_, i) => {
                     if (totalPages > 5 && i !== 0 && i !== totalPages - 1 && Math.abs(currentPage - (i + 1)) > 1) {
                        if (i === 1 || i === totalPages - 2) return <span key={i} className="px-3 py-2 text-gray-400">...</span>;
                        return null;
                     }
                     return (
                      <button
                        key={i}
                        onClick={() => paginate(i + 1)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-bold border-l border-r border-gray-200 ${
                          currentPage === i + 1
                            ? 'z-10 bg-blue-50 text-blue-700'
                            : 'bg-white text-gray-500 hover:bg-gray-50 hover:text-blue-600'
                        }`}
                      >
                        {i + 1}
                      </button>
                    )
                  })}
                  
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-3 py-2 rounded-r-lg text-sm font-medium ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50 hover:text-blue-600'}`}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            )}

       
            <div className="flex space-x-3 w-full sm:w-auto">
              <button
                onClick={() => setSelectedParticipants([])}
                disabled={selectedParticipants.length === 0}
                className="flex-1 sm:flex-none px-4 py-2 text-gray-600 border border-gray-300 hover:bg-gray-50 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Batal Pilihan
              </button>
              <button
                onClick={() => setShowEmailModal(true)}
                disabled={selectedParticipants.length === 0}
                className="flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-md transition-all duration-200"
              >
                <Send className="w-4 h-4 mr-2" />
                Tulis Email ({selectedParticipants.length})
              </button>
            </div>
          </div>
        </div>
      </main>

      {showEmailModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-0 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto overflow-hidden flex flex-col">
            <div className="bg-[#242467] px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <h3 className="text-xl font-bold text-white flex items-center">
                <Send className="w-5 h-5 mr-2 text-blue-200" />
                Tulis Pesan Email Baru
              </h3>
              <button onClick={() => setShowEmailModal(false)} className="text-white/70 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex items-start">
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <Mail className="w-5 h-5 text-blue-700" />
                </div>
                <div>
                  <span className="font-bold text-blue-900 block mb-1">
                    Penerima: {selectedParticipants.length} Kandidat
                  </span>
                  
                  {selectedParticipants.length > 0 && (
                    <div className="text-sm font-bold text-[#242467] mb-2 bg-blue-100/50 inline-block px-2 py-1 rounded">
                      👤 {participants.filter(p => selectedParticipants.includes(p.participant_id)).map(p => p.name).join(', ')}
                    </div>
                  )}

                  <p className="text-sm text-blue-700 leading-relaxed">
                    Sistem akan mengirimkan email ini secara personal ke masing-masing alamat email kandidat (menggunakan BCC).
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-gray-800 mb-2 font-bold text-sm uppercase tracking-wide">Subjek Email</label>
                <input
                  type="text"
                  value={emailData.subject}
                  onChange={(e) => setEmailData({...emailData, subject: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium bg-gray-50/50"
                  placeholder="Contoh: Pengumuman Hasil Tes Psikotes PT Garuda Mart"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-800 mb-2 font-bold text-sm uppercase tracking-wide">Isi Pesan</label>
                <textarea
                  value={emailData.message}
                  onChange={(e) => setEmailData({...emailData, message: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 leading-relaxed bg-gray-50/50 resize-y"
                  placeholder="Yth. Bapak/Ibu Kandidat,&#10;&#10;Bersama email ini kami sampaikan..."
                  rows={8}
                  required
                />
              </div>
            </div>
            
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end space-x-3 rounded-b-2xl">
              <button
                onClick={() => {
                  setShowEmailModal(false);
                  setEmailData({ subject: "", message: "" });
                }}
                className="px-6 py-2.5 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-bold rounded-xl transition-all duration-200"
              >
                Batal
              </button>
              <button
                onClick={handleSendEmail}
                disabled={isSending || selectedParticipants.length === 0}
                className="px-8 py-2.5 bg-[#242467] hover:bg-[#1a1a52] text-white font-bold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-md"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Kirim Sekarang
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showResultsModal && sendResults && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                {sendResults.total_failed === 0 ? (
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center mr-3">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                  </div>
                )}
                Laporan Pengiriman Email
              </h3>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-5 rounded-xl border border-green-200 flex items-center justify-between">
                  <div>
                    <div className="text-green-700 font-bold mb-1">Berhasil Dikirim</div>
                    <div className="text-3xl font-black text-green-900">{sendResults.total_sent}</div>
                  </div>
                  <CheckCircle className="w-10 h-10 text-green-300" />
                </div>
                <div className="bg-red-50 p-5 rounded-xl border border-red-200 flex items-center justify-between">
                  <div>
                    <div className="text-red-700 font-bold mb-1">Gagal Dikirim</div>
                    <div className="text-3xl font-black text-red-900">{sendResults.total_failed}</div>
                  </div>
                  <XCircle className="w-10 h-10 text-red-300" />
                </div>
              </div>
              
              <div>
                <h4 className="font-bold text-gray-800 mb-3 uppercase text-sm tracking-wider">Rincian Status Penerima</h4>
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="max-h-64 overflow-y-auto divide-y divide-gray-100">
                    {sendResults.results.map((result, index) => (
                      <div key={index} className="p-4 flex items-center justify-between hover:bg-gray-50">
                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${result.status === 'sent' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <div className="min-w-0">
                            <div className="font-bold text-gray-900 truncate">{result.name}</div>
                            <div className="text-sm text-gray-500 truncate">{result.email}</div>
                            {result.error && (
                              <div className="text-xs text-red-600 mt-1 font-medium bg-red-50 inline-block px-2 py-0.5 rounded">
                                Error: {result.error}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className={`ml-4 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                          result.status === 'sent' 
                            ? 'bg-green-100 text-green-700 border border-green-200' 
                            : 'bg-red-100 text-red-700 border border-red-200'
                        }`}>
                          {result.status === 'sent' ? 'Terkirim' : 'Gagal'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t bg-gray-50 flex justify-end">
              <button
                onClick={() => {
                  setShowResultsModal(false);
                  setSendResults(null);
                }}
                className="bg-gray-800 hover:bg-black text-white font-bold px-8 py-2.5 rounded-xl transition-colors shadow-md"
              >
                Tutup Jendela
              </button>
            </div>
          </div>
        </div>
      )}

     
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
      </Suspense>
  );
}