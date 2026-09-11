"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Home, Users, BarChart3, Mail, Shield, User, LogOut, 
  Search, FileText, CheckCircle, AlertTriangle, AlertCircle, 
  ChevronLeft, ChevronRight, ChevronDown, Download, FileDown, Calendar
} from "lucide-react";

// const API_BASE_URL = 'https://api.lourdesautoparts.com';
const API_BASE_URL = '';



interface CandidateData {
  participant_id: number;
  name: string;
  email: string;
  level_name?: string;
  nomor_telpon?: string;
  has_filled_data?: boolean;
  submission_date?: string;
}

export default function AdminDataDiriPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<any>(null);
  const [participants, setParticipants] = useState<CandidateData[]>([]);
  const [filteredParticipants, setFilteredParticipants] = useState<CandidateData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [isEvalDropdownOpen, setIsEvalDropdownOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [dialog, setDialog] = useState({ isOpen: false, type: 'alert', title: '', message: '', confirmText: '', cancelText: '', onConfirm: undefined as any, onCancel: undefined as any });
  const showDialog = (config: any) => setDialog({ ...config, isOpen: true });
  const closeDialog = () => setDialog(prev => ({ ...prev, isOpen: false }));

  useEffect(() => {
    const adminData = localStorage.getItem("admin");
    const role = localStorage.getItem("role");
    
    if (!adminData || role !== "HRD") {
      router.push("/");
      return;
    }
    setAdmin(JSON.parse(adminData));
    loadCandidatesWithData();
  }, [router]);

  const loadCandidatesWithData = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/applications`);
      const data = await res.json();
      let parts = Array.isArray(data) ? data : (data.data || []);
      console.log("Raw participants data:", parts);
      const mappedParticipants = parts.map((p: any) => ({
        ...p,
        has_filled_data: true,
        submission_date: new Date().toISOString().split('T')[0]
      }));
      const filledDataParticipants = mappedParticipants.filter((p: any) => p.has_filled_data);
      setParticipants(filledDataParticipants);
    } catch (error) {
      console.error('Error loading candidates:', error);
      setParticipants([]);
    }
  };

  useEffect(() => {
    let filtered = participants;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(query) || p.email.toLowerCase().includes(query));
    }
    setFilteredParticipants(filtered);
    setCurrentPage(1);
  }, [participants, searchQuery]);

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

  const handleDownloadData = (candidate: CandidateData) => {
    showDialog({
      type: 'alert',
      title: 'Mengunduh Data',
      message: `Sedang menyiapkan file Word untuk ${candidate.name}...`
    });

  
    window.open(
      `${API_BASE_URL}/api/applications/${candidate.participant_id}/export/word`,
      '_blank'
    );
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredParticipants.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredParticipants.length / itemsPerPage);
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

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
                <button onClick={() => { if(dialog.onCancel) dialog.onCancel(); closeDialog(); }} className="px-5 py-2.5 rounded-lg font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                  {dialog.cancelText || 'Batal'}
                </button>
              )}
              <button onClick={() => { if (dialog.onConfirm) dialog.onConfirm(); closeDialog(); }} className="px-5 py-2.5 rounded-lg font-bold bg-[#242467] text-white hover:bg-[#1a1a52] transition-colors">
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
                <p className="text-blue-200 text-xs md:text-sm mt-0.5">Kelola Data Diri Kandidat</p>
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
              <Link href="/hrd/dashboard" className="flex items-center space-x-2 pb-2 text-white/80 hover:text-white transition-colors">
                <Home className="w-4 h-4 md:w-5 md:h-5" />
                <span className="font-semibold text-sm md:text-base">Beranda</span>
              </Link>

              <Link href="/hrd/kelola-kandidat" className="flex items-center space-x-2 pb-2 text-white/80 hover:text-white transition-colors">
                <Users className="w-4 h-4 md:w-5 md:h-5" />
                <span className="font-semibold text-sm md:text-base">Kelola Kandidat</span>
              </Link>

              <Link href="/hrd/admin" className="flex items-center space-x-2 pb-2 text-white/80 hover:text-white transition-colors">
                <Shield className="w-4 h-4 md:w-5 md:h-5" />
                <span className="font-semibold text-sm md:text-base">Kelola Admin</span>
              </Link>

              <Link href="/hrd/pengumuman" className="flex items-center space-x-2 pb-2 text-white/80 hover:text-white transition-colors">
                <Mail className="w-4 h-4 md:w-5 md:h-5" />
                <span className="font-semibold text-sm md:text-base">Pengumuman</span>
              </Link>

              <Link href="/hrd/laporan" className="flex items-center space-x-2 pb-2 text-white/80 hover:text-white transition-colors">
                <BarChart3 className="w-4 h-4 md:w-5 md:h-5" />
                <span className="font-semibold text-sm md:text-base">Hasil Tes</span>
              </Link>

              <div className="relative">
                <button 
                  onClick={(e) => { e.preventDefault(); setIsEvalDropdownOpen(!isEvalDropdownOpen); }}
                  className="flex items-center space-x-2 pb-2 text-yellow-300 border-b-4 border-yellow-300 transition-colors outline-none whitespace-nowrap"
                >
                  <FileText className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="font-semibold text-sm md:text-base">Formulir</span>
                  <ChevronDown className={`w-3 h-3 md:w-4 md:h-4 transition-transform ${isEvalDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isEvalDropdownOpen && (
                  <div className="fixed inset-0 z-[90]" onClick={() => setIsEvalDropdownOpen(false)}></div>
                )}
                
                <div className={`fixed md:absolute left-4 right-4 md:left-auto md:right-0 mt-2 md:w-48 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden py-1 z-[100] transition-all duration-200 origin-top text-black ${isEvalDropdownOpen ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0 pointer-events-none'}`}>
                  <Link 
                    href="/hrd/resume" 
                    onClick={() => setIsEvalDropdownOpen(false)}
                    className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-[#242467] transition-colors relative z-10 border-b border-gray-50"
                  >
                   Formulir Penilaian Kandidat
                  </Link>
                  <Link 
                    href="/hrd/data-diri" 
                    onClick={() => setIsEvalDropdownOpen(false)}
                    className="block px-4 py-3 text-sm font-bold text-[#242467] bg-blue-50 relative z-10 border-l-4 border-[#242467]"
                  >
                    Formulir Data Diri
                  </Link>
                </div>
              </div>

            </div>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 flex-1 flex flex-col z-10">
        <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl p-6 md:p-8 mb-6 md:mb-8 shadow-lg">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-2">Kelola Data Diri Kandidat 🗂️</h2>
          <p className="text-gray-700 text-sm md:text-base lg:text-lg">
            Unduh formulir rekrutmen lengkap yang telah diisi oleh kandidat.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-md overflow-hidden flex-1 flex flex-col border border-gray-200">
          <div className="p-4 md:p-6 border-b flex flex-col md:flex-row justify-between items-center bg-gray-50/80 gap-4">
            <h3 className="text-lg md:text-xl font-bold text-gray-800 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-600" /> Formulir Terkumpul ({participants.length})
            </h3>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Cari nama atau email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#242467] text-black outline-none"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="py-4 px-6 text-gray-600 font-bold text-sm uppercase tracking-wider">Nama Kandidat</th>
                  <th className="py-4 px-6 text-gray-600 font-bold text-sm uppercase tracking-wider">Alamat Email</th>
                  <th className="py-4 px-6 text-gray-600 font-bold text-sm uppercase tracking-wider">Posisi / Jabatan</th>
                  <th className="py-4 px-6 text-gray-600 font-bold text-sm uppercase tracking-wider text-center">Tgl Submit</th>
                  <th className="py-4 px-6 text-center text-gray-600 font-bold text-sm uppercase tracking-wider w-40">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentItems.map((p, index) => (
                  <tr key={`${p.participant_id}-${index}`} className="hover:bg-blue-50/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-gray-900 text-base">{p.name}</div>
                    </td>
                    <td className="py-4 px-6 text-gray-600">{p.email}</td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200">
                        {p.level_name || 'Tidak ada info'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center text-gray-600 text-sm font-medium">
                      <div className="flex items-center justify-center">
                        <Calendar className="w-4 h-4 mr-1.5 text-gray-400" />
                        {p.submission_date || 'Hari ini'}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleDownloadData(p)}
                        className="bg-green-100 text-green-700 hover:bg-green-200 px-4 py-2 rounded-xl font-bold text-sm transition-all hover:shadow-sm flex items-center justify-center mx-auto border border-green-200 whitespace-nowrap"
                      >
                        <FileDown className="w-4 h-4 mr-2" /> Unduh Word
                      </button>
                    </td>
                  </tr>
                ))}

                {currentItems.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-16 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                          <FileText className="w-10 h-10 text-gray-300" />
                        </div>
                        <p className="text-lg font-bold text-gray-700 mb-1">Belum ada data</p>
                        <p className="text-sm text-gray-500">Pencarian tidak ditemukan atau belum ada kandidat yang mengisi Formulir.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-6 border-t border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-center gap-4 mt-auto rounded-b-2xl">
            {filteredParticipants.length > 0 && (
              <div className="flex items-center w-full justify-between sm:justify-start">
                <span className="text-sm text-gray-600 mr-4 hidden md:block">
                  Hal <span className="font-bold text-gray-900">{currentPage}</span> dari <span className="font-bold text-gray-900">{totalPages}</span>
                </span>
                
                <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px bg-white border border-gray-200 mx-auto sm:mx-0">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-3 py-2 rounded-l-lg text-sm font-medium transition-colors ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed bg-gray-50' : 'text-gray-600 hover:bg-blue-50 hover:text-[#242467]'}`}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  
                  {[...Array(totalPages)].map((_, i) => {
                    if (totalPages > 5 && i !== 0 && i !== totalPages - 1 && Math.abs(currentPage - (i + 1)) > 1) {
                      if (i === 1 || i === totalPages - 2) return <span key={i} className="px-3 py-2 text-gray-400 border-x border-gray-200">...</span>;
                      return null;
                    }
                    return (
                      <button
                        key={i}
                        onClick={() => paginate(i + 1)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-bold border-x border-gray-200 transition-colors ${
                          currentPage === i + 1
                            ? 'z-10 bg-blue-50 text-[#242467]'
                            : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-[#242467]'
                        }`}
                      >
                        {i + 1}
                      </button>
                    )
                  })}
                  
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-3 py-2 rounded-r-lg text-sm font-medium transition-colors ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed bg-gray-50' : 'text-gray-600 hover:bg-blue-50 hover:text-[#242467]'}`}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
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