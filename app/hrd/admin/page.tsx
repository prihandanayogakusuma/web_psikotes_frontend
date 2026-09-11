"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Home, 
  Users, 
  BarChart3,
  User,
  LogOut,
  Plus,
  Search,
  AlertTriangle,
  AlertCircle,
  Mail,
  Trash2,
  Edit,
  Shield,
  X,
  Save,
  RefreshCw,
  CheckCircle,
  XCircle,
  Key,
  ChevronLeft,
  FileText,
  ChevronDown,
  ChevronRight
} from "lucide-react";

// const API_BASE_URL = 'https://api.lourdesautoparts.com';
const API_BASE_URL = '';

interface AdminData {
  user_id: number;
  email: string;
  role: string;
  is_active: number | boolean;
  created_at?: string;
}


const AdminEditModal = ({
  adminData,
  onClose,
  onSave,
}: {
  adminData: AdminData | null;
  onClose: () => void;
  onSave: (updatedData: any) => Promise<void>;
}) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "", 
    is_active: 1,
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (adminData) {
      setFormData({
        email: adminData.email || "",
        password: "", 
        is_active: adminData.is_active === 1 || adminData.is_active === true ? 1 : 0,
      });
    }
  }, [adminData]);

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email.trim()) newErrors.email = "Email harus diisi";
    if (formData.password && formData.password.length < 6) {
      newErrors.password = "Password minimal 6 karakter jika ingin diubah";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        email: formData.email,
        is_active: formData.is_active
      };
      if (formData.password) {
        payload.password = formData.password;
      }
      
      await onSave(payload);
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!adminData) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="bg-[#242467] rounded-t-2xl px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Edit className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white">Ubah Akses Admin</h3> 
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-black mb-2 text-sm font-medium">Email Akun *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className={`w-full px-4 py-2 text-black border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-black mb-2 text-sm font-medium">Ubah Sandi <span className="text-gray-500 font-normal">(Kosongkan jika tidak ingin diubah)</span></label>
            <div className="relative">
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="Masukkan password baru..."
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 text-black focus:ring-yellow-500 ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
              />
              <Key className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black w-4 h-4" />
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-black mb-2 text-sm font-medium">Status Akun</label>
            <select
              value={formData.is_active}
              onChange={(e) => setFormData({...formData, is_active: parseInt(e.target.value)})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-black"
            >
              <option value={1}>Aktif</option>
              <option value={0}>Non-Aktif (Suspend)</option>
            </select>
          </div>
        </div>

        <div className="border-t border-gray-200 px-6 py-4 text-black bg-gray-50 rounded-b-2xl flex justify-end items-center space-x-3">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 hover:bg-gray-100 rounded-lg text-gray-700">
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-[#242467] hover:bg-[#1a1a52] text-white rounded-lg flex items-center space-x-2 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Simpan</span>
          </button>
        </div>
      </div>
    </div>
  );
};


export default function KelolaAdminPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [admin, setAdmin] = useState<any>(null);
  const [adminList, setAdminList] = useState<AdminData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminData | null>(null);

  const [newAdmin, setNewAdmin] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    is_active: 1
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

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const adminData = localStorage.getItem("admin");
    const userType = localStorage.getItem("userType");

    if (!adminData || userType !== "admin") {
      router.push("/");
      return;
    }

    const parsedAdmin = JSON.parse(adminData);
    setCurrentUser(parsedAdmin);
    setAdmin(parsedAdmin);
    loadAdmins();
  }, [router]);

  const loadAdmins = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/hrd`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) throw new Error('Gagal memuat data admin');
      
      const result = await response.json();
      setAdminList(result.data || []);
    } catch (error) {
      console.error('Error loading admins:', error);
      setAdminList([]);
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

  const handleAddAdmin = async () => {
    const errors: Record<string, string> = {};
    if (!newAdmin.email.trim()) errors.email = "Email harus diisi";
    if (newAdmin.password.length < 6) errors.password = "Password minimal 6 karakter";
    if (newAdmin.password !== newAdmin.confirmPassword) errors.confirmPassword = "Password tidak cocok";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/hrd`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newAdmin.email,
          password: newAdmin.password,
          is_active: newAdmin.is_active
        })
      });

      const result = await response.json();

      if (response.ok || result.success) {
        showDialog({
          type: 'alert',
          title: 'Berhasil',
          message: 'Admin berhasil ditambahkan!',
          onConfirm: () => {
            setShowAddModal(false);
            setNewAdmin({ email: "", password: "", confirmPassword: "", is_active: 1 });
            setFormErrors({});
            loadAdmins();
          }
        });
      } else {
        showDialog({
          type: 'alert',
          title: 'Gagal',
          message: `Gagal: ${result.error || result.message}`
        });
      }
    } catch (error) {
      console.error('Error adding admin:', error);
      showDialog({
        type: 'alert',
        title: 'Error',
        message: 'Terjadi kesalahan pada server'
      });
    }
  };

  const handleUpdateAdmin = async (updatedData: any) => {
    if (!selectedAdmin) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/hrd/${selectedAdmin.user_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });

      const result = await response.json();

      if (response.ok || result.success) {
        showDialog({
          type: 'alert',
          title: 'Berhasil',
          message: 'Data admin berhasil diperbarui!',
          onConfirm: () => {
            setShowEditModal(false);
            setSelectedAdmin(null);
            loadAdmins();
          }
        });
      } else {
        showDialog({
          type: 'alert',
          title: 'Gagal',
          message: result.error || result.message || 'Gagal memperbarui data'
        });
      }
    } catch (error) {
      console.error('Error updating admin:', error);
      showDialog({
        type: 'alert',
        title: 'Error',
        message: 'Terjadi kesalahan server'
      });
    }
  };

  const handleDeleteAdmin = async (id: number) => {
    const currentUserId = currentUser?.userId || currentUser?.user_id;
    if (id === currentUserId) {
      showDialog({
        type: 'alert',
        title: 'Peringatan',
        message: 'Anda tidak dapat menghapus akun Anda sendiri saat sedang login!'
      });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/hrd/soft/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (response.ok || result.success) {
        showDialog({
          type: 'alert',
          title: 'Berhasil',
          message: 'Admin berhasil dinonaktifkan!',
          onConfirm: () => {
            loadAdmins();
          }
        });
      } else {
        showDialog({
          type: 'alert',
          title: 'Gagal',
          message: `Gagal menghapus admin: ${result.error || result.message}`
        });
      }
    } catch (error) {
      console.error('Error deleting admin:', error);
      showDialog({
        type: 'alert',
        title: 'Error',
        message: 'Terjadi kesalahan server'
      });
    }
  };

  const filteredAdmins = adminList
    .filter(admin => {
      const searchLower = (searchTerm || "").toLowerCase();
      return (
        (admin?.email || "").toLowerCase().includes(searchLower) ||
        (admin?.role || "").toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => (a.email || "").localeCompare(b.email || "")); 

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAdmins.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAdmins.length / itemsPerPage);

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
 className={`flex items-center space-x-2 pb-2 ${
                        "text-yellow-300 border-b-4 border-yellow-300"
                      }`}                      >
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

      <main className="container mx-auto px-4 py-8 flex-1 flex flex-col">
       
        <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl p-6 md:p-8 mb-6 md:mb-8 shadow-lg">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          
          <div className="w-full lg:w-auto">
            <h2 className="text-4xl font-bold text-black mb-2">Manajemen Admin 🛡️</h2>
            <p className="text-gray-600 text-sm md:text-base lg:text-lg">Tambah, Ubah, dan atur hak akses pengguna panel admin</p>
          </div>

          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 font-bold px-6 py-3 rounded-xl flex items-center space-x-2 shadow-lg"
          >
            <Plus className="w-5 h-5" /> <span>Tambah Admin Baru</span>
          </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 flex items-center space-x-4 border border-gray-200">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              suppressHydrationWarning
              type="text"
              placeholder="Cari admin berdasarkan email atau jabatan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50/50 text-gray-700"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 flex-1 flex flex-col">
          <div className="overflow-x-auto flex-1 min-h-[460px]">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="py-4 px-6 text-gray-600 font-semibold text-sm uppercase w-2/5">Identitas Akun</th>
                  <th className="py-4 px-6 text-gray-600 font-semibold text-sm uppercase w-1/5">Jabatan Akses</th>
                  <th className="py-4 px-6 text-center text-gray-600 font-semibold text-sm uppercase w-1/5">Status</th>
                  <th className="py-4 px-6 text-center text-gray-600 font-semibold text-sm uppercase w-1/5">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentItems.map((admin) => (
                  <tr key={admin.user_id} className="hover:bg-blue-50/50 transition-colors group">
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-indigo-700" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-gray-800 truncate max-w-[200px] lg:max-w-[300px]" title={admin.email}>
                            {admin.email}
                          </span>
                          <span className="text-xs text-gray-500">ID: {admin.user_id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        admin.role === 'superadmin' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {admin.role?.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center whitespace-nowrap">
                      {admin.is_active === 1 || admin.is_active === true ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                          <CheckCircle className="w-3 h-3 mr-1" /> Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                          <XCircle className="w-3 h-3 mr-1" /> Non-Aktif
                        </span>
                      )}
                    </td>
                    
                    <td className="py-4 px-6 text-center">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedAdmin(admin);
                            setShowEditModal(true);
                          }}
                          className="p-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition-colors"
                          title="Ubah Akun"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => {
                            showDialog({
                              type: 'confirm',
                              title: 'Nonaktifkan Admin',
                              message: `Yakin ingin menonaktifkan admin ${admin.email}?`,
                              confirmText: 'Nonaktifkan',
                              onConfirm: () => handleDeleteAdmin(admin.user_id)
                            });
                          }}
                          className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                          title="Hapus / Nonaktifkan Akun"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredAdmins.length === 0 && (
              <div className="p-16 text-center flex flex-col items-center justify-center">
                <Shield className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-lg text-gray-600 font-bold">Tidak ada data admin ditemukan</p>
                <p className="text-sm text-gray-400 mt-1">Coba gunakan kata kunci pencarian yang lain.</p>
              </div>
            )}
          </div>

        
          {filteredAdmins.length > 0 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between mt-auto">
              <div className="hidden sm:block">
                <p className="text-sm text-gray-600">
                  Menampilkan <span className="font-bold text-gray-900">{indexOfFirstItem + 1}</span> - <span className="font-bold text-gray-900">{Math.min(indexOfLastItem, filteredAdmins.length)}</span> dari <span className="font-bold text-gray-900">{filteredAdmins.length}</span> admin
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px bg-white border border-gray-200" aria-label="Pagination">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-3 py-2 rounded-l-lg text-sm font-medium ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50 hover:text-blue-600'}`}
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
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
                    <span className="sr-only">Next</span>
                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                  </button>
                </nav>
              </div>
            </div>
          )}
        </div>
      </main>


      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="bg-[#242467] rounded-t-2xl px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white flex items-center"><Shield className="w-5 h-5 mr-2"/> Tambah Admin</h3>
              <button onClick={() => setShowAddModal(false)} className="text-white/80 hover:text-white"><X className="w-6 h-6" /></button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-gray-700 mb-1 text-sm font-medium">Email *</label>
                <input
                  type="email"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-700"
                  placeholder="admin@perusahaan.com"
                />
                {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-1 text-sm font-medium">Password *</label>
                  <input
                    type="password"
                    value={newAdmin.password}
                    onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-700"
                    placeholder="Min. 6 karakter"
                  />
                  {formErrors.password && <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>}
                </div>
                <div>
                  <label className="block text-gray-700 mb-1 text-sm font-medium">Ulangi Password *</label>
                  <input
                    type="password"
                    value={newAdmin.confirmPassword}
                    onChange={(e) => setNewAdmin({...newAdmin, confirmPassword: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-700"
                    placeholder="Ulangi password"
                  />
                  {formErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{formErrors.confirmPassword}</p>}
                </div>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg text-sm text-blue-800">
                <p><strong>Catatan:</strong> Akun yang dibuat melalui Formulir ini akan otomatis diberikan jabatan akses sebagai <strong>HRD</strong> dan Status <strong>Aktif</strong>.</p>
              </div>
            </div>

            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-2xl flex justify-end space-x-3">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100">Batal</button>
              <button onClick={handleAddAdmin} className="px-6 py-2 bg-[#242467] hover:bg-[#1a1a52] text-white rounded-lg flex items-center transition-colors">
                <Save className="w-4 h-4 mr-2"/> Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <AdminEditModal
          adminData={selectedAdmin}
          onClose={() => { setShowEditModal(false); setSelectedAdmin(null); }}
          onSave={handleUpdateAdmin}
        />
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