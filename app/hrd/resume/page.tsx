"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Home, Users, BarChart3, Mail, Shield, User, LogOut, 
  Search, FileText, CheckCircle, AlertTriangle, AlertCircle, 
  X, Save, ChevronLeft, ChevronRight, ChevronDown, Download
} from "lucide-react";

 // const API_BASE_URL = 'https://api.lourdesautoparts.com';
const API_BASE_URL = '';


interface Participant {
  participant_id: number;
  name: string;
  email: string;
  level_name?: string;
  nomor_telpon?: string;
  status_tes?: string; 
  has_resume?: boolean
}


interface FormResumeProps {
  kandidat: Participant | null;
  onClose: () => void;
  onSave: (data: any) => void;
  showDialog: (config: any) => void;
}


function FormResumeWawancara({ kandidat, onClose, onSave, showDialog }: FormResumeProps) {
  const [penilaian, setPenilaian] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<Record<string, string>>({}); 
  const [resumeText, setResumeText] = useState(["", "", "", "", ""]);
  const [tanggalBergabung, setTanggalBergabung] = useState("");
  
  const [keputusanAkhir, setKeputusanAkhir] = useState<"Diterima" | "Tidak Diterima" | "Pending" | "">("");
  const [salaryStatus, setSalaryStatus] = useState<"Diterima" | "Tidak Diterima" | "Pending" | "">("");
  const [salaryRevision, setSalaryRevision] = useState("");

  const hrdCriteria = [
    { id: "hrd_attitude", label: "Sikap dan kepribadian dan kondisi fisik" },
    { id: "hrd_education", label: "Latar belakang pendidikan & organisasi" },
    { id: "hrd_experience", label: "Pengalaman kerja" },
    { id: "hrd_motivation", label: "Motivasi kerja" },
    { id: "hrd_skills", label: "Kemampuan yang dimiliki" },
    { id: "hrd_weakness", label: "Kelemahan" },
    { id: "hrd_strength", label: "Kelebihan" },
    { id: "hrd_salary_expectation", label: "Expectation Salary" },
    { id: "hrd_recommendation", label: "Pengajuan dari HR" },
    { id: "hrd_availability", label: "Ketersediaan bergabung" },
  ];

  const psikotesWPT = [
    { id: "wonderlic_position_fit", label: "Posisi yang cocok" },
    { id: "wonderlic_iq", label: "Intelligence Quotient (IQ)" }, 
  ];

  const psikotesPapi = [
    { id: "papi_work_attitude", label: "Sikap dan Potensi Kerja" },
    { id: "papi_personality", label: "Kepribadian" }, 
  ];

  const userCriteria = [
    { id: "user_position_knowledge", label: "Pengetahuan posisi yang dilamar" },
    { id: "user_jobdesk_knowledge", label: "Pengetahuan job desk" },
    { id: "user_supporting_skill", label: "Skill penunjang" },
  ];

  const handleRadioChange = (id: string, value: string) => {
    setPenilaian((prev) => ({ ...prev, [id]: value }));
  };

  const handleNoteChange = (id: string, value: string) => {
    setNotes((prev) => ({ ...prev, [id]: value }));
  };

  const handleResumeTextChange = (index: number, value: string) => {
    const newResume = [...resumeText];
    newResume[index] = value;
    setResumeText(newResume);
  };

  const handleSubmit = () => {

    const allCriteria = [...hrdCriteria, ...psikotesWPT, ...psikotesPapi, ...userCriteria];
    const missingCriteria = allCriteria.find(c => !penilaian[c.id]);
    
    if (missingCriteria) {
      return showDialog({
        type: 'alert',
        title: 'Validasi Gagal',
        message: `Anda belum memberikan standar penilaian pada tahapan:\n\n"${missingCriteria.label}"`
      });
    }

    const gabunganResume = resumeText.filter(text => text.trim() !== "").join("\n");
    if (!gabunganResume) {
      return showDialog({
        type: 'alert',
        title: 'Validasi Gagal',
        message: 'Kolom D. Hasil Penilaian wajib diisi (minimal 1 baris).'
      });
    }


    if (!keputusanAkhir) {
      return showDialog({
        type: 'alert',
        title: 'Validasi Gagal',
        message: 'Keputusan Akhir (Diterima / Tidak Diterima / Pending) wajib dipilih.'
      });
    }

 
    if (keputusanAkhir === "Diterima" && !tanggalBergabung) {
      return showDialog({
        type: 'alert',
        title: 'Validasi Gagal',
        message: 'Tanggal Mulai Bergabung wajib diisi karena kandidat diputuskan Diterima.'
      });
    }

  
    if (!salaryStatus) {
      return showDialog({
        type: 'alert',
        title: 'Validasi Gagal',
        message: 'Status Pengajuan Salary wajib dipilih.'
      });
    }

    if (salaryStatus === "Tidak Diterima" && !salaryRevision.trim()) {
      return showDialog({
        type: 'alert',
        title: 'Validasi Gagal',
        message: 'Keterangan revisi finalisasi salary wajib diisi karena status salary Tidak Diterima.'
      });
    }

    
    const finalData = {
      participant_id: kandidat?.participant_id,
      interview_date: new Date().toISOString().split('T')[0],
      ...penilaian, 
      ...notes, 
      resume_final_notes: gabunganResume,
      joining_date: tanggalBergabung || null,
      final_status: keputusanAkhir,
      salary_final_status: salaryStatus,
      salary_revision: salaryRevision
    };
    onSave(finalData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden animate-in zoom-in duration-200">
        
        <div className="bg-[#242467] px-6 py-4 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center text-white">
            <FileText className="w-6 h-6 mr-3 text-blue-200" />
            <div>
              <h2 className="text-xl font-bold">Formulir Penilaian Kandidat</h2>
              <p className="text-sm text-blue-200">Kandidat: {kandidat?.name} | Posisi: {kandidat?.level_name}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-red-300 transition-colors">
            <X className="w-7 h-7" />
          </button>
        </div>

        <div className="overflow-y-auto p-4 md:p-6 flex-1 bg-white">
          <div className="border-2 border-gray-400 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="bg-gray-200 border-b-2 border-gray-400">
                <tr>
                  <th className="py-3 px-4 text-center font-bold text-gray-800 w-12 border-r border-gray-400" rowSpan={2}>No</th>
                  <th className="py-3 px-4 font-bold text-gray-800 border-r border-gray-400" rowSpan={2}>Tahapan Tes dan Wawancara</th>
                  <th className="py-2 px-4 text-center font-bold text-gray-800 border-b border-gray-400" colSpan={3}>Standard Penilaian</th>
                  <th className="py-3 px-4 text-center font-bold text-gray-800 border-l border-gray-400 w-1/4" rowSpan={2}>Keterangan</th>
                </tr>
                <tr>
                  <th className="py-2 px-2 text-center text-sm font-bold text-gray-800 border-r border-gray-400 w-20">Baik</th>
                  <th className="py-2 px-2 text-center text-sm font-bold text-gray-800 border-r border-gray-400 w-20">Standar</th>
                  <th className="py-2 px-2 text-center text-sm font-bold text-gray-800 w-20">Kurang</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-gray-100 border-b border-gray-300"><td colSpan={6} className="py-2 px-4 font-bold text-gray-900">A. Hasil Wawancara HRD</td></tr>
                {hrdCriteria.map((item, index) => (
                  <tr key={item.id} className="border-b border-gray-300 hover:bg-blue-50/30 transition-colors">
                    <td className="py-2 px-4 text-center border-r border-gray-300 text-gray-700 font-medium">{index + 1}</td>
                    <td className="py-2 px-4 border-r border-gray-300 text-gray-800 font-medium">{item.label}</td>
                    {["Baik", "Standar", "Kurang"].map((rating) => (
                      <td key={rating} className="py-2 px-4 text-center border-r border-gray-300">
                        <input
                          type="radio"
                          name={item.id}
                          value={rating}
                          suppressHydrationWarning 
                          checked={penilaian[item.id] === rating}
                          onChange={() => handleRadioChange(item.id, rating)}
                          className="w-4 h-4 text-[#242467] focus:ring-[#242467] cursor-pointer"
                        />
                      </td>
                    ))}
                    <td className="py-1 px-2 border-gray-300">
                      <input 
                        type="text" 
                        value={notes[`${item.id}_note`] || ""}
                        onChange={(e) => handleNoteChange(`${item.id}_note`, e.target.value)}
                        className="w-full p-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-[#242467] outline-none text-black font-medium bg-white"
                        placeholder="Ketikan keterangan..."
                      />
                    </td>
                  </tr>
                ))}

                <tr className="bg-gray-100 border-b border-gray-300"><td colSpan={6} className="py-2 px-4 font-bold text-gray-900">B. Psikotes</td></tr>
                <tr className="bg-white"><td colSpan={6} className="py-1 px-10 font-bold text-gray-800">Wonderlic Personal Test</td></tr>
                {psikotesWPT.map((item, index) => (
                   <tr key={item.id} className="border-b border-gray-300 hover:bg-blue-50/30 transition-colors">
                    <td className="py-2 px-4 text-center border-r border-gray-300 text-gray-700 font-medium">{index + 1}</td>
                    <td className="py-2 px-4 border-r border-gray-300 text-gray-800 font-medium">{item.label}</td>
                    {["Baik", "Standar", "Kurang"].map((rating) => (
                      <td key={rating} className="py-2 px-4 text-center border-r border-gray-300">
                        <input
                          type="radio"
                          name={item.id}
                          value={rating}
                          checked={penilaian[item.id] === rating}
                          onChange={() => handleRadioChange(item.id, rating)}
                          className="w-4 h-4 text-[#242467] focus:ring-[#242467] cursor-pointer"
                        />
                      </td>
                    ))}
                    <td className="py-1 px-2 border-gray-300">
                      <input 
                        type="text" 
                        value={notes[`${item.id}_note`] || ""}
                        onChange={(e) => handleNoteChange(`${item.id}_note`, e.target.value)}
                        className="w-full p-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-[#242467] outline-none text-black font-medium bg-white"
                        placeholder="Ketikan keterangan..."
                      />
                    </td>
                  </tr>
                ))}
                
                <tr className="bg-white"><td colSpan={6} className="py-1 px-10 font-bold text-gray-800 border-t border-gray-300">Papikostic</td></tr>
                {psikotesPapi.map((item, index) => (
                   <tr key={item.id} className="border-b border-gray-300 hover:bg-blue-50/30 transition-colors">
                    <td className="py-2 px-4 text-center border-r border-gray-300 text-gray-700 font-medium">{index + 1}</td>
                    <td className="py-2 px-4 border-r border-gray-300 text-gray-800 font-medium">{item.label}</td>
                    {["Baik", "Standar", "Kurang"].map((rating) => (
                      <td key={rating} className="py-2 px-4 text-center border-r border-gray-300">
                        <input
                          type="radio"
                          name={item.id}
                          value={rating}
                          checked={penilaian[item.id] === rating}
                          onChange={() => handleRadioChange(item.id, rating)}
                          className="w-4 h-4 text-[#242467] focus:ring-[#242467] cursor-pointer"
                        />
                      </td>
                    ))}
                    <td className="py-1 px-2 border-gray-300">
                      <input 
                        type="text" 
                        value={notes[`${item.id}_note`] || ""}
                        onChange={(e) => handleNoteChange(`${item.id}_note`, e.target.value)}
                        className="w-full p-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-[#242467] outline-none text-black font-medium bg-white"
                        placeholder="Ketikan keterangan..."
                      />
                    </td>
                  </tr>
                ))}

                <tr className="bg-gray-100 border-b border-gray-300"><td colSpan={6} className="py-2 px-4 font-bold text-gray-900 border-t border-gray-300">C. Hasil Wawancara User</td></tr>
                {userCriteria.map((item, index) => (
                   <tr key={item.id} className="border-b border-gray-300 hover:bg-blue-50/30 transition-colors">
                    <td className="py-2 px-4 text-center border-r border-gray-300 text-gray-700 font-medium">{index + 1}</td>
                    <td className="py-2 px-4 border-r border-gray-300 text-gray-800 font-medium">{item.label}</td>
                    {["Baik", "Standar", "Kurang"].map((rating) => (
                      <td key={rating} className="py-2 px-4 text-center border-r border-gray-300">
                        <input
                          type="radio"
                          name={item.id}
                          value={rating}
                          checked={penilaian[item.id] === rating}
                          onChange={() => handleRadioChange(item.id, rating)}
                          className="w-4 h-4 text-[#242467] focus:ring-[#242467] cursor-pointer"
                        />
                      </td>
                    ))}
                    <td className="py-1 px-2 border-gray-300">
                      <input 
                        type="text" 
                        value={notes[`${item.id}_note`] || ""}
                        onChange={(e) => handleNoteChange(`${item.id}_note`, e.target.value)}
                        className="w-full p-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-[#242467] outline-none text-black font-medium bg-white"
                        placeholder="Ketikan keterangan..."
                      />
                    </td>
                  </tr>
                ))}

                <tr className="bg-gray-100 border-b border-gray-300"><td colSpan={6} className="py-2 px-4 font-bold text-gray-900">D. Hasil Penilaian</td></tr>
                {resumeText.map((text, idx) => (
                  <tr key={`resume_${idx}`} className="border-b border-gray-300">
                    <td className="py-2 px-4 text-center border-r border-gray-300 text-gray-800">{idx + 1}</td>
                    <td colSpan={5} className="p-1 px-2">
                      <input 
                        type="text" 
                        value={text} 
                        onChange={(e) => handleResumeTextChange(idx, e.target.value)} 
                        className="w-full p-2 focus:bg-blue-50 focus:ring-2 focus:ring-[#242467] outline-none text-black font-medium border border-transparent rounded" 
                        placeholder="..."
                      />
                    </td>
                  </tr>
                ))}

                <tr className="bg-gray-100 border-b border-gray-300"><td colSpan={6} className="py-2 px-4 font-bold text-gray-900">E. Tanggal Mulai Bergabung</td></tr>
                <tr>
                  <td colSpan={6} className="p-2 border-b-4 border-gray-400">
                    <input 
                      type="date" 
                      value={tanggalBergabung} 
                      onChange={(e) => setTanggalBergabung(e.target.value)} 
                      className="w-full md:w-1/3 p-2 border border-gray-300 rounded focus:outline-none text-gray-800 font-medium" 
                    />
                  </td>
                </tr>
              </tbody>
            </table>

            <table className="w-full text-left border-collapse min-w-[800px]">
              <tbody>
                <tr>
                  <td colSpan={3} className="py-2 px-4 text-center font-bold text-gray-800 border-r border-b border-gray-400 w-1/2">
                    Keputusan Akhir (Oleh HRD dan User)
                  </td>
                  <td colSpan={2} className="py-2 px-4 text-center font-bold text-gray-800 border-b border-gray-400 w-1/2">
                    TTD Pesetujuan Penerimaan Karyawan
                  </td>
                </tr>
                <tr>
                  <td colSpan={3} className="py-2 px-4 text-center font-bold text-gray-800 border-r border-b border-gray-400">
                    Status
                  </td>
                  <td className="py-2 px-4 text-center font-bold text-gray-800 border-r border-b border-gray-400 w-1/4">
                    HRD
                  </td>
                  <td className="py-2 px-4 text-center font-bold text-gray-800 border-b border-gray-400 w-1/4">
                    BOD
                  </td>
                </tr>

                <tr>
                  <td className="py-2 text-center border-r border-b border-gray-300 w-10 text-gray-800">1</td>
                  <td className="py-2 px-4 border-r border-b border-gray-300 text-gray-800 font-medium">Diterima</td>
                  <td className="py-2 px-4 text-center border-r border-b border-gray-400 w-16">
                    <input type="radio" name="keputusanAkhir" value="Diterima" checked={keputusanAkhir === "Diterima"} onChange={() => setKeputusanAkhir("Diterima")} className="w-4 h-4 cursor-pointer" />
                  </td>
                  <td rowSpan={3} className="border-r border-b-2 border-gray-400 relative"></td>
                  <td rowSpan={3} className="border-b-2 border-gray-400 relative"></td>
                </tr>

                <tr>
                  <td className="py-2 text-center border-r border-b border-gray-300 w-10 text-gray-800">2</td>
                  <td className="py-2 px-4 border-r border-b border-gray-300 text-gray-800 font-medium">Tidak Diterima</td>
                  <td className="py-2 px-4 text-center border-r border-b border-gray-400 w-16">
                    <input type="radio" name="keputusanAkhir" value="Tidak Diterima" checked={keputusanAkhir === "Tidak Diterima"} onChange={() => setKeputusanAkhir("Tidak Diterima")} className="w-4 h-4 cursor-pointer" />
                  </td>
                </tr>

                <tr>
                  <td className="py-2 text-center border-r border-b-2 border-gray-300 w-10 text-gray-800">3</td>
                  <td className="py-2 px-4 border-r border-b-2 border-gray-300 text-gray-800 font-medium">Pending</td>
                  <td className="py-2 px-4 text-center border-r border-b-2 border-gray-400 w-16">
                    <input type="radio" name="keputusanAkhir" value="Pending" checked={keputusanAkhir === "Pending"} onChange={() => setKeputusanAkhir("Pending")} className="w-4 h-4 cursor-pointer" />
                  </td>
                </tr>

                <tr className="bg-gray-100 border-b border-gray-300">
                  <td colSpan={5} className="py-2 px-4 font-bold text-gray-900 border-b border-gray-400">
                    F. Pengajuan Salary
                  </td>
                </tr>
                <tr>
                  <td colSpan={3} className="py-2 px-4 text-center font-bold text-gray-800 border-r border-b border-gray-400">
                    Status
                  </td>
                  <td colSpan={2} className="border-b border-gray-400"></td>
                </tr>

                <tr>
                  <td className="py-2 text-center border-r border-b border-gray-300 w-10 text-gray-800">1</td>
                  <td className="py-2 px-4 border-r border-b border-gray-300 text-gray-800 font-medium">Diterima</td>
                  <td className="py-2 px-4 text-center border-r border-b border-gray-400 w-16">
                    <input type="radio" name="salaryStatus" value="Diterima" checked={salaryStatus === "Diterima"} onChange={() => setSalaryStatus("Diterima")} className="w-4 h-4 cursor-pointer" />
                  </td>
                  <td colSpan={2} className="border-b border-gray-300"></td>
                </tr>

                <tr>
                  <td className="py-2 text-center border-r border-b border-gray-300 w-10 text-gray-800">2</td>
                  <td className="py-2 px-4 border-r border-b border-gray-300 text-gray-800 font-medium">Tidak Diterima</td>
                  <td className="py-2 px-4 text-center border-r border-b border-gray-400 w-16">
                    <input type="radio" name="salaryStatus" value="Tidak Diterima" checked={salaryStatus === "Tidak Diterima"} onChange={() => setSalaryStatus("Tidak Diterima")} className="w-4 h-4 cursor-pointer" />
                  </td>
                  <td colSpan={2} className="border-b border-gray-300 px-4 py-2">
                    <div className="flex items-center">
                      <span className="text-gray-800 mr-3 whitespace-nowrap">Revisi finalisasi salary:</span>
                      <input 
                        type="text" 
                        value={salaryRevision}
                        onChange={(e) => setSalaryRevision(e.target.value)}
                        className="flex-1 p-1 border-b border-gray-400 focus:border-[#242467] outline-none bg-transparent text-black"
                      />
                    </div>
                  </td>
                </tr>

                <tr>
                  <td className="py-2 text-center border-r border-gray-300 w-10 text-gray-800">3</td>
                  <td className="py-2 px-4 border-r border-gray-300 text-gray-800 font-medium">Pending</td>
                  <td className="py-2 px-4 text-center border-r border-gray-400 w-16">
                    <input type="radio" name="salaryStatus" value="Pending" checked={salaryStatus === "Pending"} onChange={() => setSalaryStatus("Pending")} className="w-4 h-4 cursor-pointer" />
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-gray-50 border-t border-gray-300 px-6 py-4 flex justify-end flex-shrink-0 gap-3 rounded-b-2xl">
          <button onClick={onClose} className="px-6 py-2.5 font-bold text-gray-600 bg-white border border-gray-300 hover:bg-gray-100 rounded-xl transition-colors">
            Batal
          </button>
          <button 
            onClick={handleSubmit} 
            className="px-8 py-2.5 font-bold text-white bg-[#242467] hover:bg-[#1a1a52] rounded-xl flex items-center transition-colors shadow-md hover:shadow-lg"
          >
            <Save className="w-5 h-5 mr-2" /> Simpan Evaluasi
          </button>
        </div>

      </div>
    </div>
  );
}


export default function EvaluasiWawancaraPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<any>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [filteredParticipants, setFilteredParticipants] = useState<Participant[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [isEvalDropdownOpen, setIsEvalDropdownOpen] = useState(false);
  
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Participant | null>(null);

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
    loadCompletedCandidates();
  }, [router]);

  const loadCompletedCandidates = async () => {
    try {
      const resC = await fetch(`${API_BASE_URL}/api/participants`);
      const dataC = await resC.json();
      let parts = Array.isArray(dataC) ? dataC : (dataC.data || []);

      const resS = await fetch(`${API_BASE_URL}/api/testSessions/laporan/all`);
      let allSessions: any[] = [];
      if (resS.ok) {
        const dataS = await resS.json();
        allSessions = Array.isArray(dataS) ? dataS : (dataS.data || []);
      }

      const resR = await fetch(`${API_BASE_URL}/api/resume`);
      let allResumes: any[] = [];
      if (resR.ok) {
        const dataR = await resR.json();
        allResumes = Array.isArray(dataR) ? dataR : (dataR.data || []);
      }
    

      const resL = await fetch(`${API_BASE_URL}/api/job-levels`);
      let levels: any[] = [];
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

      const completedCandidates = parts.filter((candidate: any) => {
        const reportRow = allSessions.find((s: any) => String(s.id) === String(candidate.participant_id));
        const completedTests = reportRow ? (reportRow.completed_count || 0) : 0;
        const targetTests = requiredTestsPerLevel[candidate.level_id] || 3;
        const hasResume = allResumes.some(r => String(r.participant_id) === String(candidate.participant_id));
        candidate.has_resume = hasResume;
        return completedTests > 0 && completedTests >= targetTests;
      });

      setParticipants(completedCandidates);
    } catch (error) {
      console.error('Error loading completed candidates:', error);
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

  const handleSaveForm = async (payloadToBackend: any) => {
    try {
      
      const response = await fetch(`${API_BASE_URL}/api/resume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadToBackend)
      });
      if (!response.ok) throw new Error("Gagal menyimpan Formulir");
  
      const result = await response.json();
      const resumeId = result.id;

      setShowFormModal(false);
      
      showDialog({
        type: 'confirm',
        title: 'Berhasil Disimpan',
        message: 'Hasil penilaian kandidat berhasil disimpan ke database.\n\nPilih tindakan selanjutnya:',
        confirmText: 'Unduh Templat',
        cancelText: 'Ke Menu Resume',
        onConfirm: () => {
          router.push(`/hrd/resume`);
        },
        onCancel: () => {
          loadCompletedCandidates(); 
        }
      });
    } catch (error) {
      showDialog({ type: 'alert', title: 'Error', message: 'Gagal menyimpan evaluasi.' });
    }
  };

  const handleDownloadResume = async (participantId: number) => {
    showDialog({
      type: 'alert',
      title: 'Mengunduh Laporan',
      message: `File laporan evaluasi dan wawancara untuk kandidat sedang diproses untuk diunduh. Klik "Oke" untuk menutup pesan ini.`,
    });

    window.open(`${API_BASE_URL}/api/resume/${participantId}/export/word`, '_blank');

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
                <button onClick={() => { if(dialog.onCancel) dialog.onCancel(); closeDialog(); }} className="px-5 py-2.5 rounded-lg font-bold bg-gray-100 text-gray-700 hover:bg-gray-200">
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
                      className={`flex items-center space-x-2 pb-2 ${
                      "text-yellow-300 border-b-4 border-yellow-300"
                    }`}                     >
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

      <main className="container mx-auto px-4 py-8 flex-1 flex flex-col z-10">
        <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl p-6 md:p-8 mb-6 md:mb-8 shadow-lg">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-2">Formulir Penilaian Kandidat 📝</h2>
          <p className="text-gray-700 text-sm md:text-base lg:text-lg">
            Isi penilaian performa kandidat setelah tahap wawancara HRD dan User.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-md overflow-hidden flex-1 flex flex-col border border-gray-200">
          <div className="p-4 md:p-6 border-b flex flex-col md:flex-row justify-between items-center bg-gray-50/80 gap-4">
            <h3 className="text-lg md:text-xl font-bold text-gray-800 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-blue-600" /> Kandidat Selesai Psikotes
            </h3>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Cari nama atau email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#242467] text-black"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="py-4 px-6 text-gray-600 font-bold text-sm uppercase tracking-wider">Nama Kandidat</th>
                  <th className="py-4 px-6 text-gray-600 font-bold text-sm uppercase tracking-wider">Alamat Email</th>
                  <th className="py-4 px-6 text-gray-600 font-bold text-sm uppercase tracking-wider">Posisi</th>
                  <th className="py-4 px-6 text-center text-gray-600 font-bold text-sm uppercase tracking-wider w-40">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentItems.map((participant) => (
                  <tr key={participant.participant_id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-gray-900 text-base">{participant.name}</div>
                    </td>
                    <td className="py-4 px-6 text-gray-600">{participant.email}</td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200">
                        {participant.level_name || 'Tidak ada info'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      {participant.has_resume ? (
                        <button
                          onClick={() => handleDownloadResume(participant.participant_id)}
                          className="bg-green-100 text-green-700 hover:bg-green-200 px-4 py-2 rounded-xl font-bold text-sm transition-all hover:shadow-sm flex items-center justify-center mx-auto border border-green-200"
                        >
                          <Download className="w-4 h-4 mr-2" /> Unduh Word
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedCandidate(participant);
                            setShowFormModal(true);
                          }}
                          className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-4 py-2 rounded-xl font-bold text-sm transition-all hover:shadow-sm flex items-center justify-center mx-auto"
                        >
                          <FileText className="w-4 h-4 mr-2" /> Isi Penilaian
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {currentItems.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-gray-500">
                      Tidak ada data kandidat ditemukan.
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

      {showFormModal && (
        <FormResumeWawancara 
          kandidat={selectedCandidate} 
          onClose={() => setShowFormModal(false)}
          onSave={handleSaveForm}
          showDialog={showDialog} 
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