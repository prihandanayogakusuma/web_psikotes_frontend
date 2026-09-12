"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, CheckCircle, AlertCircle } from "lucide-react";
import Image from "next/image";

const API_BASE_URL = 'https://api.lourdesautoparts.com';


export default function AuthPage() {
  const router = useRouter();
  
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [dialog, setDialog] = useState<{
    isOpen: boolean;
    type: 'success' | 'alert' | 'error';
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({
    isOpen: false,
    type: 'alert',
    title: '',
    message: ''
  });

  const showDialog = (config: {
    type: 'success' | 'alert' | 'error';
    title: string;
    message: string;
    onConfirm?: () => void;
  }) => {
    setDialog({ ...config, isOpen: true });
  };

  const closeDialog = () => {
    setDialog(prev => ({ ...prev, isOpen: false }));
  };

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
    setError("");
  };



 const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!loginData.email.trim() || !loginData.password.trim()) {
      setError("Email dan password harus diisi");
      return;
    }

    setIsLoading(true);

    try {
      const adminRes = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginData.email, password: loginData.password }),
      });

      const adminText = await adminRes.text();
      let adminData;
      try { adminData = JSON.parse(adminText); } catch (e) { throw new Error("Response admin tidak valid"); }

      if (adminRes.ok && adminData.success !== false) {
        localStorage.setItem("admin", JSON.stringify(adminData.user));
        localStorage.setItem("userType", "admin");
        localStorage.setItem("role", adminData.user.role || "admin");
        localStorage.setItem("token", adminData.token || "");
        
        showDialog({
          type: 'success',
          title: 'Anda berhasil masuk',
          message: `Selamat datang, ${adminData.user.email || adminData.user.name}!`,
          onConfirm: () => router.push("/hrd/dashboard")
        });
        return; 
      }

      const kandidatRes = await fetch(`${API_BASE_URL}/api/participants/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginData.email, password: loginData.password }),
      });

      const kandidatText = await kandidatRes.text();
      let kandidatData;
      try { kandidatData = JSON.parse(kandidatText); } catch (e) { throw new Error("Response kandidat tidak valid"); }

      if (kandidatRes.ok && kandidatData.success !== false) {
        localStorage.setItem("user", JSON.stringify(kandidatData.user));
        localStorage.setItem("userType", "kandidat");
        localStorage.setItem("token", kandidatData.token || "");
    
        const appRes = await fetch(`${API_BASE_URL}/api/applications`);

        const appText = await appRes.text();

        let appData = [];

        try {
          appData = JSON.parse(appText);
        } catch (e) {
          throw new Error("Response applications tidak valid");
        }

        const existingApplication = appData.find(
          
          (app: any) => app.participant_id === kandidatData.user.participant_id
        );

        showDialog({
          type: 'success',
          title: 'Login Berhasil',
          message: `Selamat datang, ${kandidatData.user.name || kandidatData.user.email}!`,
          onConfirm: () => {
            if (existingApplication) {
              router.push("/kandidat/dashboard");
            } else {
              router.push("/kandidat/data-diri");
            }
          }
        });
        return;
      }

 
      setError("Email atau password yang Anda masukkan salah.");

    } catch (error: any) {
      setError(error.message || "Terjadi kesalahan saat masuk");
    } finally {
      setIsLoading(false);
    }
  };

 return (
    <div className="min-h-screen flex flex-col bg-white">
      
      {dialog.isOpen && (
        <div className="fixed inset-0 z-[9999999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in duration-200">
            <div className="flex items-center mb-4">
              {dialog.type === 'success' ? (
                <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
              ) : (
                <AlertCircle className="w-8 h-8 text-red-500 mr-3" />
              )}
              <h3 className="text-xl font-bold text-gray-900">{dialog.title}</h3>
            </div>
            <div className="mb-8 text-gray-600 text-base md:text-lg">
              {dialog.message}
            </div>
            <div className="flex justify-end">
              <button 
                onClick={() => { 
                  if (dialog.onConfirm) dialog.onConfirm(); 
                  closeDialog(); 
                }} 
                className={`px-6 py-2.5 rounded-lg font-bold text-white transition-colors ${
                  dialog.type === 'success' ? 'bg-green-600 hover:bg-green-700' : 'bg-[#242467] hover:bg-[#1a1a52]'
                }`}
              >
                Oke
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="w-full p-4 sm:px-6 md:px-12 md:py-8 flex items-center justify-between gap-2 md:gap-4">
        
        <div className="w-1/3 flex justify-start">
          <Image
            src="/asset/logo-gis.png"  
            alt="Logo GIS"
            width={300}
            height={100}
            className="w-full max-w-[90px] sm:max-w-[120px] md:max-w-[220px] h-auto object-contain"
            priority
          />
        </div>

        <div className="w-1/3 flex justify-center">
          <Image
            src="/asset/logo-lourdes.png"  
            alt="Logo Lourdes"
            width={300}
            height={100}
            className="w-full max-w-[90px] sm:max-w-[120px] md:max-w-[220px] h-auto object-contain"
            priority
          />
        </div>

        <div className="w-1/3 flex justify-end">
          <Image
            src="/asset/logo-garuda.png" 
            alt="Logo Garuda"
            width={300}
            height={100}
            className="w-full max-w-[90px] sm:max-w-[120px] md:max-w-[220px] h-auto object-contain"
            priority
          />
        </div>

      </header>

      <main className="flex-1 flex items-center justify-center p-4 md:p-6 pb-20">
        <div className="w-full max-w-md">
        
          <form suppressHydrationWarning onSubmit={handleLoginSubmit} className="space-y-5 md:space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                <p className="font-medium text-sm md:text-base">Gagal masuk</p>
                <p className="text-xs md:text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-2 md:space-y-3">
              <label className="block text-gray-800 text-base md:text-lg font-medium">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  required
                  suppressHydrationWarning  
                  value={loginData.email}
                  onChange={handleLoginChange}
                  className="w-full h-12 md:h-14 rounded-xl border-2 border-gray-300 pl-10 md:pl-12 pr-4 text-base md:text-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-black placeholder:text-gray-500"
                  placeholder="contoh@email.com"
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="space-y-2 md:space-y-3">
              <div className="flex justify-between items-center">
                <label className="block text-gray-800 text-base md:text-lg font-medium">
                  Sandi
                </label>
                <button
                  suppressHydrationWarning
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-blue-600 hover:text-blue-800 text-xs md:text-sm font-medium transition-colors flex items-center"
                >
                  {showPassword ? (
                    <>
                      <EyeOff size={16} className="mr-1" />
                      Sembunyikan
                    </>
                  ) : (
                    <>
                      <Eye size={16} className="mr-1" />
                      Tampilkan
                    </>
                  )}
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  suppressHydrationWarning  
                  value={loginData.password}
                  onChange={handleLoginChange}
                  className="w-full h-12 md:h-14 rounded-xl border-2 border-gray-300 pl-10 md:pl-12 pr-12 text-base md:text-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-black placeholder:text-gray-500"
                  placeholder="Masukkan sandi"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button
              suppressHydrationWarning
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#242467] hover:bg-[#1a1a52] text-white text-lg md:text-xl font-semibold py-3 md:py-4 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 mt-2"
            >
              {isLoading ? (
                <div className="flex items-center justify-center text-sm md:text-base">
                  <div className="w-5 h-5 md:w-6 md:h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 md:mr-3"></div>
                  Memproses...
                </div>
              ) : (
                "Masuk ke Sistem"
              )}
            </button>

            <div className="text-center pt-2 md:pt-4">
              <p className="text-gray-600 text-sm md:text-base">
                Lupa sandi atau butuh bantuan?{" "}
                <a href="mailto:selvianza88@gmail.com" className="text-blue-600 hover:text-blue-800 font-medium block sm:inline mt-1 sm:mt-0">
                  Hubungi administrator
                </a>
              </p>
            </div>
          </form>
        </div>
      </main>
    </div>
  );

} 