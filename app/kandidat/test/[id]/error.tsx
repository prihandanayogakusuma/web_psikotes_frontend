"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCw, LayoutDashboard } from "lucide-react";

export default function TestError({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[TestError] Kesalahan saat mengerjakan tes:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full text-center border-t-4 border-red-500">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Terjadi Kesalahan Teknis</h2>
        <p className="text-gray-600 text-sm leading-relaxed mb-2">
          Mohon maaf, aplikasi mengalami gangguan saat memuat tes. Jawaban Anda yang sudah tersimpan tidak hilang.
        </p>
        <p className="text-gray-400 text-xs mb-6">
          Silakan muat ulang untuk melanjutkan dari posisi terakhir.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-[#242467] hover:bg-[#1a1a52] text-white font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center"
          >
            <RotateCw className="w-4 h-4 mr-2" />
            Muat Ulang Halaman
          </button>
          <button
            onClick={() => (window.location.href = "/kandidat/dashboard")}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center"
          >
            <LayoutDashboard className="w-4 h-4 mr-2" />
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
