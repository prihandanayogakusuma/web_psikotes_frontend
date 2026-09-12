"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Home, 
  Users, 
  BarChart3,
  Shield,
  User,
  LogOut,
  Plus,
  Search,
  Mail,
  ChevronDown,
  Phone,
  Calendar,
  Briefcase,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  AlertCircle,
  Key,
  Edit,
  MapPin,
  Clock,
  Save,
  X,
  Loader2,
  Filter,
  RefreshCw,
  ChevronLeft,
  FileText,
  ChevronRight,
  RotateCcw
} from "lucide-react";

const API_BASE_URL = 'https://api.lourdesautoparts.com';


interface Candidate {
  participant_id: number;
  name: string;
  email: string;
  nomor_telpon: string;
  phone?: string;
  level_name: string;
  level_id?: number; 
  birth_date: string;
  alamat: string;
  address?: string;
  testScore?: number;
  status?: string;
  calculated_status?: string; 
  created_at: string;
}



interface JobLevel {
  level_id: number;
  level_name: string;
}



 const CandidateDetailModal = ({ 
  candidate, 
  violations, 
  loadingViolations, 
  onClose 
}: { 
  candidate: Candidate | null; 
  violations: any[]; 
  loadingViolations: boolean; 
  onClose: () => void; 
}) => {
  if (!candidate) return null;
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl my-8 animate-in fade-in zoom-in duration-200">
        <div className="bg-[#242467] rounded-t-2xl px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Detail Kandidat</h3>
              <p className="text-blue-100 text-sm">Informasi lengkap & Riwayat Tes</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
        </div>
        
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-xl p-4 flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center"><User className="w-5 h-5 text-blue-600" /></div>
              <div className="overflow-hidden">
                <p className="text-xs text-blue-600 font-medium">Nama Lengkap</p>
                <p className="text-sm font-bold text-gray-800 truncate" title={candidate.name}>{candidate.name}</p>
              </div>
            </div>
            <div className="bg-green-50 rounded-xl p-4 flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center"><Briefcase className="w-5 h-5 text-green-600" /></div>
              <div>
                <p className="text-xs text-green-600 font-medium">Posisi</p>
                <p className="text-sm font-bold text-gray-800">{candidate.level_name || '-'}</p>
              </div>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center"><Clock className="w-5 h-5 text-purple-600" /></div>
              <div>
                <p className="text-xs text-purple-600 font-medium">Bergabung</p>
                <p className="text-sm font-bold text-gray-800">{candidate.created_at ? new Date(candidate.created_at).toLocaleDateString('id-ID') : '-'}</p>
              </div>
            </div>
            <div className={`${candidate.status === 'non-aktif' ? 'bg-red-50' : 'bg-indigo-50'} rounded-xl p-4 flex items-center space-x-3`}>
              <div className={`w-10 h-10 ${candidate.status === 'non-aktif' ? 'bg-red-100' : 'bg-indigo-100'} rounded-full flex items-center justify-center`}>
                <Shield className={`w-5 h-5 ${candidate.status === 'non-aktif' ? 'text-red-600' : 'text-indigo-600'}`} />
              </div>
              <div>
                <p className={`text-xs ${candidate.status === 'non-aktif' ? 'text-red-600' : 'text-indigo-600'} font-medium`}>Status Akun</p>
                <p className="text-sm font-bold text-gray-800">
                  {candidate.status === 'non-aktif' ? 'Non-Aktif' : 'Aktif'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200"><h4 className="font-semibold text-gray-700">Informasi Kontak</h4></div>
              <div className="p-4 space-y-3">
                <div className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="overflow-hidden">
                    <p className="text-xs text-gray-500">Email</p>
                    <a href={`mailto:${candidate.email}`} className="text-blue-600 hover:underline truncate block" title={candidate.email}>{candidate.email}</a>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Nomor Telepon</p>
                    <a href={`tel:${candidate.nomor_telpon || candidate.phone}`} className="text-gray-800 hover:text-blue-600">{candidate.nomor_telpon || candidate.phone || '-'}</a>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200"><h4 className="font-semibold text-gray-700">Informasi Pribadi</h4></div>
              <div className="p-4 space-y-3">
                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Tanggal Lahir</p>
                    <p className="text-gray-800">{candidate.birth_date ? new Date(candidate.birth_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric'}) : '-'}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Tempat Lahir</p>
                    <p className="text-gray-800">{candidate.alamat || candidate.address || '-'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <AlertTriangle className="w-6 h-6 text-red-500 mr-2" />
                <h3 className="text-lg font-bold text-gray-800">Catatan Pelanggaran</h3>
              </div>
            </div>

            {loadingViolations ? (
              <div className="flex justify-center items-center py-8"><Loader2 className="w-8 h-8 animate-spin text-[#242467]" /></div>
            ) : violations.length > 0 ? (
              <div className="bg-red-50/30 border border-red-200 rounded-xl overflow-hidden">
               <table className="w-full text-left text-sm">
                  <thead className="bg-red-50 border-b border-red-200 text-red-800">
                    <tr>
                      <th className="py-3 px-4 font-bold">Waktu Kejadian</th>
                      <th className="py-3 px-4 font-bold">Modul Tes</th> 
                      <th className="py-3 px-4 font-bold">Jenis Pelanggaran</th>
                      <th className="py-3 px-4 font-bold text-center">Peringatan Ke-</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-red-100">
                    {violations.map((v, index) => {
                      
                      let testName = "Tidak Diketahui";
                      if (v.test_id === 1) testName = "WPT";
                      else if (v.test_id === 2) testName = "PAPIKOSTIK";
                      else if (v.test_id === 3) testName = "IST";
                      else if (v.test_id === 4) testName = "DISC";

                      return (
                        <tr key={index} className="hover:bg-red-50/50">
                          <td className="py-3 px-4 text-gray-700 font-medium">
                            {new Date(v.created_at).toLocaleString('id-ID', {
                               day: '2-digit', month: 'short', year: 'numeric',
                               hour: '2-digit', minute: '2-digit'
                            })}
                          </td>
                          
                          <td className="py-3 px-4">
                            <span className="bg-[#242467]/10 text-[#242467] px-2.5 py-1 rounded-md font-extrabold text-xs tracking-wider">
                              {testName}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-red-600 font-bold">{v.violation_type}</td>
                          <td className="py-3 px-4 text-center">
                            <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded-md font-bold text-xs">
                              {v.warning_count}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center shadow-sm">
                <CheckCircle className="w-6 h-6 text-green-500 mr-3" />
                <div>
                  <h4 className="text-green-800 font-bold">Kandidat Bersih</h4>
                  <p className="text-green-700 text-sm">Tidak ada catatan pelanggaran selama pengerjaan tes.</p>
                </div>
              </div>
            )}
          </div>

        </div>
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-2xl flex justify-end space-x-3">
          <button onClick={onClose} className="px-6 py-2.5 bg-[#242467] hover:bg-[#1a1a52] text-white rounded-xl transition-colors font-bold shadow-md">Tutup</button>
        </div>
      </div>
    </div>
  );
};



const CandidateEditModal = ({ candidate, jobLevels, onClose, onSave }: { candidate: Candidate | null; jobLevels: JobLevel[]; onClose: () => void; onSave: (updatedData: any) => Promise<void>; }) => {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", level_id: "", birth_date: "", alamat: "", status: "aktif", password: "" }); 
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (candidate) {
      let initialLevelId = candidate.level_id?.toString() || "";
      if (!initialLevelId && candidate.level_name) {
        const matchedLevel = jobLevels.find(l => l.level_name === candidate.level_name);
        if (matchedLevel) initialLevelId = matchedLevel.level_id.toString();
      }
      setFormData({
        name: candidate.name || "", 
        email: candidate.email || "", 
        phone: candidate.nomor_telpon || candidate.phone || "",
        level_id: initialLevelId, 
        birth_date: candidate.birth_date ? candidate.birth_date.split('T')[0] : "", 
        alamat: candidate.alamat || candidate.address || "",
        status: candidate.status === 'non-aktif' ? 'non-aktif' : 'aktif',
        password: "" 
      });
    }
  }, [candidate, jobLevels]);

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Nama harus diisi";
    if (!formData.email.trim()) newErrors.email = "Email harus diisi";
    if (!formData.phone.trim()) newErrors.phone = "Nomor telepon harus diisi";
    if (!formData.level_id) newErrors.level_id = "Posisi harus dipilih";
    if (!formData.birth_date) newErrors.birth_date = "Tanggal lahir harus diisi";
    if (!formData.alamat.trim()) newErrors.alamat = "Tempat lahir harus diisi";
    
    if (formData.password && formData.password.trim().length < 6) {
      newErrors.password = "Sandi baru minimal 6 karakter";
    }
    
    if (Object.keys(newErrors).length > 0) return setErrors(newErrors);

    setLoading(true);
    try {
      await onSave({
        name: formData.name, 
        email: formData.email, 
        phone: formData.phone, 
        address: formData.alamat, 
        birth_date: formData.birth_date, 
        level_id: parseInt(formData.level_id),
        status: formData.status,
        password: formData.password 
      });
    } catch (error) { console.error('Error saving:', error); } 
    finally { setLoading(false); }
  };



  if (!candidate) return null;
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl my-8 animate-in fade-in zoom-in duration-200">
        <div className="bg-[#242467] rounded-t-2xl px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center"><Edit className="w-6 h-6 text-white" /></div>
            <div>
              <h3 className="text-xl font-bold text-white">Ubah Kandidat</h3>
              <p className="text-blue-100 text-sm">Perbarui informasi kandidat</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors bg-white/10 hover:bg-white/30 rounded-full p-2"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[65vh] overflow-y-auto">
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2 text-sm font-medium">Nama Lengkap *</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className={`w-full px-4 py-2.5 border rounded-lg text-black focus:ring-2 focus:ring-blue-500 bg-gray-50 outline-none ${errors.name ? 'border-red-500' : 'border-gray-300'}`} />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-gray-700 mb-2 text-sm font-medium">Email *</label>
              <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className={`w-full px-4 py-2.5 border rounded-lg text-black focus:ring-2 focus:ring-blue-500 bg-gray-50 outline-none ${errors.email ? 'border-red-500' : 'border-gray-300'}`} />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-gray-700 mb-2 text-sm font-medium">Nomor Telepon *</label>
              <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className={`w-full px-4 py-2.5 border rounded-lg text-black focus:ring-2 focus:ring-blue-500 bg-gray-50 outline-none ${errors.phone ? 'border-red-500' : 'border-gray-300'}`} />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>
            <div>
              <label className="block text-gray-700 mb-2 text-sm font-medium">Posisi *</label>
              <select value={formData.level_id} onChange={(e) => setFormData({...formData, level_id: e.target.value})} className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 text-black focus:ring-blue-500 bg-gray-50 outline-none ${errors.level_id ? 'border-red-500' : 'border-gray-300'}`}>
                <option value="">Pilih posisi</option>
                {jobLevels.map((l) => <option key={l.level_id} value={l.level_id}>{l.level_name}</option>)}
              </select>
              {errors.level_id && <p className="text-red-500 text-sm mt-1">{errors.level_id}</p>}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2 text-sm font-medium">Status Akun</label>
              <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 text-black border-gray-300 focus:ring-blue-500 bg-gray-50 outline-none">
                <option value="aktif">Aktif</option>
                <option value="non-aktif">Non-Aktif (Suspend)</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 mb-2 text-sm font-medium">Tanggal Lahir *</label>
              <input type="date" value={formData.birth_date} onChange={(e) => setFormData({...formData, birth_date: e.target.value})} className={`w-full px-4 py-2.5 border rounded-lg text-black focus:ring-2 focus:ring-blue-500 bg-gray-50 outline-none ${errors.birth_date ? 'border-red-500' : 'border-gray-300'}`} />
              {errors.birth_date && <p className="text-red-500 text-sm mt-1">{errors.birth_date}</p>}
            </div>
            <div>
              <label className="block text-gray-700 mb-2 text-sm font-medium">Tempat Lahir *</label>
              <input type="text" value={formData.alamat} onChange={(e) => setFormData({...formData, alamat: e.target.value})} placeholder="Masukkan tempat lahir" className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 text-black focus:ring-blue-500 bg-gray-50 outline-none ${errors.alamat ? 'border-red-500' : 'border-gray-300'}`} />
              {errors.alamat && <p className="text-red-500 text-sm mt-1">{errors.alamat}</p>}
            </div>
            
            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
              <label className="block text-yellow-800 mb-2 text-sm font-bold flex items-center">
                <Key className="w-4 h-4 mr-1.5" /> Ganti Sandi (Opsional)
              </label>
              <input 
                type="text" 
                value={formData.password} 
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
                className={`w-full px-4 py-2 border rounded-lg text-black focus:ring-2 focus:ring-yellow-500 bg-white outline-none ${errors.password ? 'border-red-500' : 'border-yellow-300'}`} 
                placeholder="Kosongkan jika tidak diubah" 
              />
              <p className="text-xs text-yellow-700 mt-1.5">Isi hanya jika Anda ingin me-reset sandi kandidat ini.</p>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 px-6 py-5 bg-gray-50 rounded-b-2xl flex justify-end space-x-3">
          <button onClick={onClose} className="px-5 py-2.5 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-bold rounded-lg transition-colors">Batal</button>
          <button onClick={handleSubmit} disabled={loading} className="px-6 py-2.5 bg-[#242467] hover:bg-[#1a1a52] text-white font-bold rounded-lg flex items-center shadow-md disabled:opacity-50">
            {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </div>
    </div>
  );
};



export default function KelolaKandidatPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<any>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobLevels, setJobLevels] = useState<JobLevel[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [positionFilter, setPositionFilter] = useState("all");
  
  const [showAddCandidate, setShowAddCandidate] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

 const [showResetModal, setShowResetModal] = useState(false);
  const [candidateToReset, setCandidateToReset] = useState<any>(null);
  const [selectedTestToReset, setSelectedTestToReset] = useState<string[]>([]); 
  const [isResetting, setIsResetting] = useState(false);

  const [violations, setViolations] = useState<any[]>([]);
  const [loadingViolations, setLoadingViolations] = useState(false);
  
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [newCandidate, setNewCandidate] = useState({
    name: "", email: "", phone: "", level_id: "", password: "", confirmPassword: "", birth_date: "", alamat: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

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

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const adminData = localStorage.getItem("admin");
        if (!adminData) { router.push("/"); return; }
        setAdmin(JSON.parse(adminData));
        await loadCandidates();
        if (isMounted) setLoading(false);
      } catch (error) {
        console.error('Error:', error);
        if (isMounted) setLoading(false);
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, [router]);

  const handleToggleTestReset = (testCode: string) => {
    setSelectedTestToReset(prev => 
      prev.includes(testCode) 
        ? prev.filter(t => t !== testCode) 
        : [...prev, testCode] 
    );
  };

  const handleLogout = () => {
    showDialog({
      type: 'confirm',
      title: 'Keluar Akun',
      message: 'Apakah Anda yakin ingin keluar?',
      onConfirm: () => {
        localStorage.clear();
        router.push("/");
      }
    });
  };

  const loadCandidates = async () => {
    try {
      const resC = await fetch(`${API_BASE_URL}/api/participants`);
      const dataC = await resC.json();
      let participants = Array.isArray(dataC) ? dataC : (dataC.data || []);

      const resS = await fetch(`${API_BASE_URL}/api/testSessions/laporan/all`);
      let allSessions: any[] = [];
      if (resS.ok) {
        const dataS = await resS.json();
        allSessions = Array.isArray(dataS) ? dataS : (dataS.data || dataS.sessions || []);
      }

      const resL = await fetch(`${API_BASE_URL}/api/job-levels`);
      let levels = [];
      if (resL.ok) {
        const dataL = await resL.json();
        levels = Array.isArray(dataL) ? dataL : (dataL.data || []);
        setJobLevels(levels); 
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

      const finalCandidates = participants.map((candidate: any) => {
        const reportRow = allSessions.find((s: any) => 
          String(s.id) === String(candidate.participant_id)
        );
        
        const completedTests = reportRow ? (reportRow.completed_count || 0) : 0;
        const hasInProgress = reportRow ? (reportRow.in_progress_count > 0) : false;
        
        const targetTests = requiredTestsPerLevel[candidate.level_id] || 3;
        let finalStatus = "pending"; 

        if (completedTests > 0 && completedTests >= targetTests) {
          finalStatus = "completed"; 
        } else if (completedTests > 0 || hasInProgress) {
          finalStatus = "in_progress"; 
        }

        return {
          ...candidate,
          calculated_status: finalStatus 
        };
      });

      setCandidates(finalCandidates);

    } catch (error) {
      console.error('Error loading candidates:', error);
      setCandidates([]);
    }
  };

const getAvailableTestsForPosition = (levelName: string) => {
    const position = (levelName || "").toLowerCase();
    
    if (position.includes('manager') || position.includes('spv') || position.includes('supervisor') || position.includes('group leader')) {
      return ['WPT', 'PAPIKOSTIK', 'IST', 'DISC']; 
    } 
    else if (position.includes('admin') || position.includes('staff') || position.includes('officer')) {
      return ['WPT', 'PAPIKOSTIK', 'IST']; 
    } 
    else if (position.includes('operator')) {
      return ['WPT', 'PAPIKOSTIK']; 
    }
    
    return ['WPT', 'PAPIKOSTIK', 'IST', 'DISC']; 
  };

 const handleResetTest = async () => {
    if (selectedTestToReset.length === 0) {
      showDialog({ type: 'alert', title: 'Peringatan', message: 'Silakan pilih minimal satu tes untuk di-reset.' });
      return;
    }

    setIsResetting(true);
    let successCount = 0;
    let errorMessages: string[] = [];

    try {
      // 🚀 Looping menembak API untuk setiap tes yang dicentang
      await Promise.all(selectedTestToReset.map(async (testCode) => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/testSessions/reset-by-participant`, {
            method: "POST", 
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              participant_id: candidateToReset.participant_id,
              test_code: testCode
            })
          });

          const result = await response.json();
          if (!response.ok) {
            // Jika backend menolak (misal: karena tes belum dikerjakan), simpan pesannya
            errorMessages.push(`Tes ${testCode}: ${result.message}`);
          } else {
            successCount++;
          }
        } catch (e) {
          errorMessages.push(`Tes ${testCode}: Terjadi kesalahan jaringan.`);
        }
      }));

      // 🚀 Evaluasi Hasilnya
      if (successCount === selectedTestToReset.length) {
        showDialog({
          type: 'alert',
          title: 'Reset Berhasil 🎉',
          message: `${successCount} tes untuk ${candidateToReset.name} berhasil di-reset!`,
        });
        setShowResetModal(false);
      } else if (successCount > 0) {
        showDialog({
          type: 'alert',
          title: 'Reset Parsial ⚠️',
          message: `${successCount} tes berhasil di-reset.\n\nNamun ada yang ditolak sistem:\n${errorMessages.join('\n')}`,
        });
        setShowResetModal(false);
      } else {
        showDialog({
          type: 'alert',
          title: 'Gagal Reset ❌',
          message: `Semua tes yang dipilih tidak bisa direset:\n\n${errorMessages.join('\n')}`,
        });
      }

    } catch (error: any) {
      showDialog({ type: 'alert', title: 'Error Sistem', message: 'Terjadi kesalahan pada server.' });
    } finally {
      setIsResetting(false);
    }
  };

const handleAddCandidate = async () => {
    const errors: any = {};

    // 1. Validasi Wajib Isi (Termasuk Tanggal Lahir dan Tempat Lahir)
    if (!newCandidate.name.trim()) errors.name = "Nama wajib diisi";
    if (!newCandidate.email.trim()) errors.email = "Email wajib diisi";
    if (!newCandidate.phone.trim()) errors.phone = "Nomor telepon wajib diisi";
    if (!newCandidate.level_id) errors.level_id = "Posisi wajib dipilih";
    if (!newCandidate.birth_date) errors.birth_date = "Tanggal lahir wajib diisi";
    if (!newCandidate.alamat.trim()) errors.alamat = "Tempat lahir wajib diisi";

    // 2. Validasi Anti-Duplikat (Email & No HP)
    const isEmailExist = candidates.some(c => c.email.toLowerCase() === newCandidate.email.toLowerCase());
    const isPhoneExist = candidates.some(c => (c.nomor_telpon === newCandidate.phone || c.phone === newCandidate.phone));

    if (isEmailExist) errors.email = "Email ini sudah terdaftar di sistem";
    if (isPhoneExist) errors.phone = "Nomor telepon ini sudah terdaftar di sistem";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const firstName = newCandidate.name ? newCandidate.name.split(' ')[0].replace(/[^a-zA-Z]/g, '') : "User";
    const randomNumbers = Math.floor(1000 + Math.random() * 9000); 
    const autoPassword = `${firstName}${randomNumbers}`; 

    const payload = {
      name: newCandidate.name,
      email: newCandidate.email,
      phone: newCandidate.phone,
      nomor_telpon: newCandidate.phone, 
      level_id: parseInt(newCandidate.level_id), 
      birth_date: newCandidate.birth_date,
      alamat: newCandidate.alamat,
      address: newCandidate.alamat, 
      password: autoPassword,
      confirmPassword: autoPassword 
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/participants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.success === false) {
        throw new Error(result.message || result.error || "Gagal menambah kandidat");
      }

      showDialog({
        type: 'confirm', 
        title: 'Berhasil Ditambahkan 🎉',
        message: `Kandidat ${payload.name} berhasil didaftarkan!\n\nEmail: ${payload.email}\nPassword: ${autoPassword}\n\nApakah Anda ingin langsung mengarahkan detail ini ke menu Pengumuman untuk dikirim via email?`,
        confirmText: 'Kirim ke Email',
        cancelText: 'Oke, Tutup',
        onConfirm: () => {
          setShowAddCandidate(false);
          loadCandidates(); 
          
          const subjek = "Informasi Akses Login Psikotes Online";
          const pesan = `Halo ${payload.name},\n\nBerikut adalah detail akun Anda untuk mengakses Sistem Psikotes Online:\n\nEmail: ${payload.email}\nPassword: ${autoPassword}\n\nSilakan login menggunakan kredensial di atas dan kerjakan tes yang tersedia.\n\nTerima kasih.`;
          
          router.push(`/hrd/pengumuman?action=create&to=${encodeURIComponent(payload.email)}&subject=${encodeURIComponent(subjek)}&message=${encodeURIComponent(pesan)}`);
        },
        onCancel: () => {
          setShowAddCandidate(false);
          loadCandidates();
        }
      });

    } catch (error: any) {
      console.error(error);
      showDialog({
        type: 'alert',
        title: 'Gagal Menambah Kandidat',
        message: error.message || 'Terjadi kesalahan pada server database.'
      });
    }
  };

  const handleUpdateCandidate = async (updatedData: any) => {
    if (!selectedCandidate) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/participants/${selectedCandidate.participant_id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedData)
      });
      const result = await response.json();
      
      if (result.success === false && result.errorType) {
        return showDialog({
          type: 'alert',
          title: 'Gagal',
          message: result.message
        });
      }

      if (response.ok || result.success) {
        showDialog({
          type: 'alert',
          title: 'Berhasil',
          message: 'Data kandidat berhasil diperbarui!',
          onConfirm: () => {
            setShowEditModal(false);  
            setSelectedCandidate(null);
            loadCandidates();
          }
        });
      } else {
        showDialog({
          type: 'alert',
          title: 'Gagal',
          message: `Gagal memperbarui data: ${result.error || result.message}`
        });
      }
    } catch (error) { 
      showDialog({
        type: 'alert',
        title: 'Error',
        message: 'Terjadi kesalahan saat memperbarui data'
      });
    }
  };

  const handleDeleteCandidate = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/participants/soft/${id}`, { method: 'DELETE' });
      const result = await response.json();
      
      if (response.ok || result.success) {
        showDialog({
          type: 'alert',
          title: 'Berhasil',
          message: 'Kandidat berhasil dinonaktifkan!',
          onConfirm: () => loadCandidates()
        });
      } else {
        showDialog({
          type: 'alert',
          title: 'Gagal',
          message: `Gagal menonaktifkan kandidat: ${result.error || result.message}`
        });
      }
    } catch (error: any) { 
      showDialog({
        type: 'alert',
        title: 'Error',
        message: 'Terjadi kesalahan saat menonaktifkan kandidat'
      });
    }
  };


  const handleViewDetail = async (candidate: any) => {
    setSelectedCandidate(candidate);
    setShowDetailModal(true); 
    setLoadingViolations(true);
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/violations/participant/${candidate.participant_id}`);
      if (res.ok) {
        const data = await res.json();
        setViolations(data.data || []);
      }
    } catch (error) {
      console.error("Gagal memuat pelanggaran", error);
      setViolations([]);
    } finally {
      setLoadingViolations(false);
    }
  };

  const handleEditDirect = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setShowEditModal(true);
  };

  const positions = [...new Set(candidates.map(p => p.level_name).filter(Boolean))];
  const filteredCandidates = candidates.filter(candidate => {
    const searchLower = (searchTerm || "").toLowerCase();
    const matchSearch = ( (candidate?.name || "").toLowerCase().includes(searchLower) || (candidate?.email || "").toLowerCase().includes(searchLower) || (candidate?.nomor_telpon || candidate?.phone || "").includes(searchTerm) );
    const matchPosition = positionFilter === "all" || candidate?.level_name === positionFilter;
    return matchSearch && matchPosition;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCandidates.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage);

  useEffect(() => setCurrentPage(1), [searchTerm, positionFilter]);
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
              
                <button 
                  onClick={() => { 
                    if (dialog.onCancel) dialog.onCancel(); 
                    closeDialog(); 
                  }} 
                  className="px-5 py-2.5 rounded-lg font-bold bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
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

      {showDetailModal && (
        <CandidateDetailModal 
          candidate={selectedCandidate} 
          violations={violations}
          loadingViolations={loadingViolations}
          onClose={() => setShowDetailModal(false)} 
        />
      )}

      {showEditModal && (
        <CandidateEditModal 
          candidate={selectedCandidate} 
          jobLevels={jobLevels} 
          onClose={() => setShowEditModal(false)} 
          onSave={handleUpdateCandidate} 
        />
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
 className={`flex items-center space-x-2 pb-2 ${
                  "text-yellow-300 border-b-4 border-yellow-300"
                }`}               >
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

     <main className="container mx-auto px-4 py-8 md:py-8 flex-1 flex flex-col">

        <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl p-6 md:p-8 mb-6 md:mb-8 shadow-lg">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">

          <div className="w-full lg:w-auto">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-2 tracking-tight">Kelola Kandidat 👥</h2>
            <p className="text-gray-700 text-sm md:text-base lg:text-lg max-w-xl">Kelola data kandidat dan pantau performa tes psikotes mereka</p>
          </div>

         <button 
            onClick={() => { 
              setNewCandidate({ name: "", email: "", phone: "", level_id: "", password: "", confirmPassword: "", birth_date: "", alamat: "" });
              setFormErrors({});
              setShowAddCandidate(true); 
            }} 
            className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 font-bold px-6 py-3 rounded-xl flex items-center space-x-2 shadow-lg"
          >
            <Plus className="w-5 h-5" /><span>Tambah Kandidat Baru</span>
          </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Kandidat</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{candidates.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center"><Users className="w-6 h-6 text-blue-600" /></div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm font-medium">Jenis Posisi</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{jobLevels.length}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center"><Briefcase className="w-6 h-6 text-green-600" /></div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-800 w-5 h-5" />
            <input type="text" placeholder="Cari kandidat..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full pl-10 pr-4 py-3 border border-gray-200 text-gray-800 rounded-xl bg-gray-50/50 outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="flex items-center bg-gray-50/50 border border-gray-200 rounded-xl px-4">
            <Filter className="w-5 h-5 text-gray-500 mr-2" />
            <select value={positionFilter} onChange={(e) => setPositionFilter(e.target.value)} className="py-3 bg-transparent outline-none font-medium text-gray-700">
              <option value="all">Semua Posisi</option>
              {positions.map((p, i) => <option key={i} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden flex-1 flex flex-col border border-gray-200">
          <div className="overflow-x-auto flex-1 min-h-[460px]">  
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="py-4 px-6 text-gray-600 font-bold text-sm uppercase tracking-wider w-[22%]">Kandidat</th>
                  <th className="py-4 px-6 text-gray-600 font-bold text-sm uppercase tracking-wider w-[22%]">Kontak</th>
                  <th className="py-4 px-6 text-gray-600 font-bold text-sm uppercase tracking-wider w-[14%]">Posisi</th>
                  <th className="py-4 px-6 text-gray-600 font-bold text-sm uppercase tracking-wider w-[14%]">Status Akun</th>
                  <th className="py-4 px-6 text-gray-600 font-bold text-sm uppercase tracking-wider w-[14%]">Status Tes</th>
                  <th className="py-4 px-6 text-center text-gray-600 font-bold text-sm uppercase tracking-wider w-[14%]">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentItems.map((candidate) => {
                  
                  const testStatus = candidate.calculated_status;
                  const isCompleted = testStatus === 'completed';
                  const isInProgress = testStatus === 'in_progress';
                  const isActive = candidate.status === 'aktif';
                  
                  return (
                  <tr key={candidate.participant_id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-11 h-11 bg-indigo-100 rounded-full flex items-center justify-center mr-3 border border-indigo-200 flex-shrink-0">
                          <User className="w-5 h-5 text-indigo-700" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-gray-800 truncate max-w-[180px] lg:max-w-[200px]" title={candidate.name}>{candidate.name}</div>
                          <div className="flex items-center text-xs text-gray-500 mt-0.5 font-medium"><Calendar className="w-3 h-3 mr-1" />{new Date(candidate.birth_date).toLocaleDateString('id-ID')}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center text-sm"><Mail className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" /><a href={`mailto:${candidate.email}`} className="text-blue-600 hover:underline truncate max-w-[150px] block">{candidate.email}</a></div>
                        <div className="flex items-center text-sm"><Phone className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" /><a href={`tel:${candidate.nomor_telpon || candidate.phone}`} className="text-gray-600 hover:text-gray-800 truncate">{candidate.nomor_telpon || candidate.phone || '-'}</a></div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200"><Briefcase className="w-3 h-3 mr-1.5" />{candidate.level_name}</span>
                    </td>

                    <td className="py-4 px-6">
                      {isActive ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                          <CheckCircle className="w-3 h-3 mr-1" /> Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                          <XCircle className="w-3 h-3 mr-1" /> Non-Aktif
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-6">
                      {isCompleted ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                          <CheckCircle className="w-3 h-3 mr-1.5" /> Selesai
                        </span>
                      ) : isInProgress ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-yellow-50 text-yellow-700 border border-yellow-200">
                          <Clock className="w-3 h-3 mr-1.5" /> Dikerjakan
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">
                          <Clock className="w-3 h-3 mr-1.5" /> Belum Tes
                        </span>
                      )}
                    </td>

                   <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        
                        {/* Tombol Lihat Detail */}
                        <button 
                          onClick={() => handleViewDetail(candidate)} 
                          className="w-8 h-8 flex items-center justify-center bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-600 transition-colors" 
                          title="Lihat Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {/* Tombol Edit */}
                        <button 
                          onClick={() => handleEditDirect(candidate)} 
                          className="w-8 h-8 flex items-center justify-center bg-yellow-50 hover:bg-yellow-100 rounded-lg text-yellow-600 transition-colors" 
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        
                        {/* Tombol Nonaktifkan (Hapus) */}
                        <button 
                          onClick={() => {
                            showDialog({
                              type: 'confirm',
                              title: 'Nonaktifkan Kandidat',
                              message: 'Apakah Anda yakin ingin menonaktifkan kandidat ini? Kandidat tidak akan bisa masuk ke sistem lagi.',
                              confirmText: 'Nonaktifkan',
                              onConfirm: () => handleDeleteCandidate(candidate.participant_id)
                            });
                          }} 
                          className="w-8 h-8 flex items-center justify-center bg-red-50 hover:bg-red-100 rounded-lg text-red-600 transition-colors" 
                          title="Nonaktifkan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        {/* Tombol Reset (Hanya muncul jika sudah/sedang mengerjakan) */}
                        {/* {(isInProgress || isCompleted) ? (
                          <button 
                            onClick={() => {
                              setCandidateToReset(candidate); 
                              setSelectedTestToReset([]);
                              setShowResetModal(true); 
                            }}
                            title="Reset Tes Kandidat"
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        ) : (
                          <div className="w-8 h-8" /> 
                        )} */}
                        
                      </div>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
            
            {filteredCandidates.length === 0 && (
              <div className="text-center py-20 flex flex-col items-center">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4"><Search className="w-10 h-10 text-gray-300" /></div>
                <p className="text-lg font-bold text-gray-700">Kandidat tidak ditemukan</p>
              </div>
            )}
          </div>
          
          {filteredCandidates.length > 0 && (
            <div className="bg-gray-50 px-6 py-4 border-t flex justify-between items-center mt-auto">
            <div className="hidden sm:block">
                <p className="text-sm text-gray-600">
                  Menampilkan <span className="font-bold text-gray-900">{indexOfFirstItem + 1}</span> - <span className="font-bold text-gray-900">{Math.min(indexOfLastItem, filteredCandidates.length)}</span> dari <span className="font-bold text-gray-900">{filteredCandidates.length}</span> Kandidat
                </p>
              </div>
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
        </div>

      {/* {showResetModal && candidateToReset && (
        <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="bg-[#242467] px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white flex items-center">
                <RotateCcw className="w-5 h-5 mr-2 text-purple-300" />
                Reset Sesi Tes
              </h3>
              <button 
                onClick={() => setShowResetModal(false)} 
                className="text-white/70 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 mb-6">
                <p className="text-sm text-purple-800 font-medium">
                  Anda akan me-reset tes untuk kandidat:<br/>
                  <span className="font-bold text-lg text-[#242467]">{candidateToReset.name}</span>
                </p>
                <p className="text-xs text-purple-600 mt-2">
                  Peringatan: Melakukan reset akan menghapus seluruh jawaban kandidat pada tes yang dipilih dan mengembalikan waktu ke awal.
                </p>
              </div>

             <div className="space-y-3">
                <label className="block text-gray-700 font-bold text-sm uppercase tracking-wide mb-2">
                  Pilih Tes yang Di-reset (Bisa lebih dari 1):
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {getAvailableTestsForPosition(candidateToReset?.level_name).map((testCode) => (
                    <label key={testCode} className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${selectedTestToReset.includes(testCode) ? 'border-[#242467] bg-blue-50 ring-2 ring-[#242467]' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <input 
                        type="checkbox" 
                        value={testCode}
                        checked={selectedTestToReset.includes(testCode)}
                        onChange={() => handleToggleTestReset(testCode)}
                        className="w-5 h-5 text-[#242467] rounded focus:ring-[#242467] border-gray-300"
                      />
                      <div className="ml-3">
                        <span className="font-bold text-gray-800 block">Tes {testCode}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t px-6 py-5 bg-gray-50 flex justify-end space-x-3">
              <button 
                onClick={() => setShowResetModal(false)} 
                className="px-5 py-2.5 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-bold rounded-xl text-sm transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={handleResetTest} 
                disabled={isResetting || !selectedTestToReset}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl flex items-center shadow-md text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResetting ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <RotateCcw className="w-4 h-4 mr-2"/>}
                Reset Sekarang
              </button>
            </div>
          </div>
        </div>
      )} */}
      </main>

      {showAddCandidate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl my-8 animate-in fade-in zoom-in duration-200">
            
            <div className="bg-[#242467] rounded-t-2xl px-6 py-4 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Undang Kandidat Baru</h3>
                  <p className="text-blue-100 text-sm">Isi Formulir berikut untuk mendaftarkan kandidat</p>
                </div>
              </div>
              <button onClick={() => { setShowAddCandidate(false); setFormErrors({}); }} className="text-white hover:bg-white/20 rounded-full p-2 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5 max-h-[60vh] overflow-y-auto">
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2 text-sm font-bold uppercase tracking-wide">Nama Lengkap *</label>
                  <input type="text" value={newCandidate.name} onChange={(e) => setNewCandidate({...newCandidate, name: e.target.value})} className={`w-full px-4 py-3 border rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 bg-gray-50/50 outline-none ${formErrors.name ? 'border-red-500' : 'border-gray-200'}`} placeholder="Masukkan nama lengkap" />
                  {formErrors.name && <p className="text-red-500 text-xs mt-1.5 font-medium">{formErrors.name}</p>}
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-2 text-sm font-bold uppercase tracking-wide">Email *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input type="email" value={newCandidate.email} onChange={(e) => setNewCandidate({...newCandidate, email: e.target.value})} className={`w-full pl-10 pr-4 py-3 border rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 bg-gray-50/50 outline-none ${formErrors.email ? 'border-red-500' : 'border-gray-200'}`} placeholder="email@contoh.com" />
                  </div>
                  {formErrors.email && <p className="text-red-500 text-xs mt-1.5 font-medium">{formErrors.email}</p>}
                </div>

                <div>
                  <label className="block text-gray-700 mb-2 text-sm font-bold uppercase tracking-wide">Nomor Telepon *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input 
                      type="tel" 
                      value={newCandidate.phone} 
                      onChange={(e) => setNewCandidate({...newCandidate, phone: e.target.value.replace(/\D/g, '')})} 
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 bg-gray-50/50 outline-none ${formErrors.phone ? 'border-red-500' : 'border-gray-200'}`} 
                      placeholder="08123456789 (Hanya angka)" 
                    />
                  </div>
                  {formErrors.phone && <p className="text-red-500 text-xs mt-1.5 font-medium">{formErrors.phone}</p>}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2 text-sm font-bold uppercase tracking-wide">Posisi *</label>
                  <select value={newCandidate.level_id} onChange={(e) => setNewCandidate({...newCandidate, level_id: e.target.value})} className={`w-full px-4 py-3 border rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 bg-gray-50/50 outline-none ${formErrors.level_id ? 'border-red-500' : 'border-gray-200'}`}>
                    <option value="">Pilih posisi dilamar...  </option>
                    {jobLevels.map((l) => 
                      <option key={l.level_id} value={l.level_id}>{l.level_name}</option>
                    )}
                  </select>
                  {formErrors.level_id && <p className="text-red-500 text-xs mt-1.5 font-medium">{formErrors.level_id}</p>}
                </div>

                <div>
                  <label className="block text-gray-700 mb-2 text-sm font-bold uppercase tracking-wide">Tanggal Lahir *</label>
                  <input 
                    type="date" 
                    value={newCandidate.birth_date} 
                    onChange={(e) => setNewCandidate({...newCandidate, birth_date: e.target.value})} 
                  
                    max={new Date().toISOString().split('T')[0]} 
                    className={`w-full px-4 py-3 border rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 bg-gray-50/50 outline-none ${formErrors.birth_date ? 'border-red-500' : 'border-gray-200'}`} 
                  />
                  {formErrors.birth_date && <p className="text-red-500 text-xs mt-1.5 font-medium">{formErrors.birth_date}</p>}
                </div>

                <div>
                  <label className="block text-gray-700 mb-2 text-sm font-bold uppercase tracking-wide">Tempat Lahir *</label>
                  <input type="text" value={newCandidate.alamat} onChange={(e) => setNewCandidate({...newCandidate, alamat: e.target.value})} className={`w-full px-4 py-3 border rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 bg-gray-50/50 outline-none ${formErrors.alamat ? 'border-red-500' : 'border-gray-200'}`} placeholder="Masukkan tempat lahir" />
                  {formErrors.alamat && <p className="text-red-500 text-xs mt-1.5 font-medium">{formErrors.alamat}</p>}
                </div>
              </div>
            </div>

            <div className="px-6 pb-2">
              <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl flex items-start gap-3">
                <Key className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800 font-medium leading-relaxed">
                  <span className="font-bold">Sandi Akun Dibuat Otomatis.</span> Sistem akan membuatkan sandi acak (misal: "GARUDA1234") untuk kandidat ini.
                </p>
              </div>
            </div>

          
            <div className="border-t px-6 py-5 bg-gray-50 rounded-b-2xl flex justify-end space-x-3 mt-4">
              <button onClick={() => { setShowAddCandidate(false); setFormErrors({}); }} className="px-5 py-2.5 bg-white border hover:bg-gray-100 text-gray-900 font-bold rounded-xl text-sm transition-colors">Batal</button>
              <button onClick={handleAddCandidate} className="px-6 py-2.5 bg-[#242467] hover:bg-[#1a1a52] text-white font-bold rounded-xl flex items-center shadow-md text-sm transition-all hover:-translate-y-0.5">
                <Save className="w-4 h-4 mr-2"/> Daftarkan Kandidat
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
  );
}