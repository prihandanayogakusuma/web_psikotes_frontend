"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ExcelJS from "exceljs";
import { 
  Home, 
  Users, 
  BarChart3,
  User,
  LogOut,
  Download,
  Mail,
  Shield,
  ChevronDown,
  Search,
  Clock,
  Filter,
  X,
  AlertTriangle,
  AlertCircle,
  Calendar,
  ChevronLeft,
  CheckCircle,
  ChevronRight,
  Award,
  FileText,
} from "lucide-react";

const API_BASE_URL = 'https://api.lourdesautoparts.com';


interface TestResult {
  id: number;
  candidateName: string;
  birthDate: string;
  candidateEmail: string;
  position: string;
  testName?: string;
  testDate: string;
  completionTime: string;
  totalScore: number;
  status: "completed" | "in_progress" | "pending";
  sections: {
    name: string;
    score: number;
    maxScore: number;
  }[];
  recommendations?: string;
  wpt_summary?: string;
  wpt_score?: number;
  ist_summary?: string;
  ist_score?: number;
  disc_description?: string;
  wptSessionId?: string | number;
  istSessionId?: string | number;
  papiSessionId?: string | number;
  discSessionId?: string | number;
}

export default function LaporanHasilTestPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPosition, setFilterPosition] = useState<string>("all");
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null);
  
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterDate, setFilterDate] = useState<string>(""); 

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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
    const adminData = localStorage.getItem("admin");
    const userType = localStorage.getItem("userType");
    const role = localStorage.getItem("role");

    if (!adminData || userType !== "admin" || role !== "HRD") {
      alert("Akses ditolak. Silakan login sebagai admin");
      router.push("/");
      return;
    }

    setAdmin(JSON.parse(adminData));
    loadTestResults();
  }, [router]);

  const loadTestResults = async () => {
    setLoading(true);
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

      const mappedResults = participants.map((candidate: any) => {
        
        const reportRow = allSessions.find((s: any) => 
          String(s.id) === String(candidate.participant_id)
        );
        
        const completedTests = reportRow ? (reportRow.completed_count || 0) : 0;
        const hasInProgress = reportRow ? (reportRow.in_progress_count > 0) : false;
        
        const targetTests = requiredTestsPerLevel[candidate.level_id] || 3;
        
        let finalStatus: "completed" | "in_progress" | "pending" = "pending"; 
        let completionText = "Belum Tes";

        if (completedTests > 0 && completedTests >= targetTests) {
          finalStatus = "completed"; 
          completionText = "Selesai Mengerjakan";
        } else if (completedTests > 0 || hasInProgress) {
          finalStatus = "in_progress"; 
          completionText = "Sedang Mengerjakan";
        }

        return {
          id: candidate.participant_id,
          candidateName: candidate.name,
          birthDate: candidate.birth_date ? new Date(candidate.birth_date).toISOString().split('T')[0] : '-',
          candidateEmail: candidate.email,
          position: candidate.level_name || 'Belum ditentukan',
          testName: 'Tes Psikotes', 
          testDate: reportRow?.testDate ? new Date(reportRow.testDate).toISOString().split('T')[0] : '-',
          completionTime: completionText, 
          totalScore: 0,
          status: finalStatus, 
          sections: [],
          recommendations: '-',
          
          wpt_summary: reportRow?.wpt_summary,
          wpt_score: reportRow?.wpt_score,
          ist_summary: reportRow?.ist_summary,
          ist_score: reportRow?.ist_score,
          disc_description: reportRow?.disc_description,
          wptSessionId: reportRow?.wptSessionId ?? reportRow?.wpt_session_id,
          istSessionId: reportRow?.istSessionId ?? reportRow?.ist_session_id,
          papiSessionId: reportRow?.papiSessionId ?? reportRow?.papi_session_id,
          discSessionId: reportRow?.discSessionId ?? reportRow?.disc_session_id
        };
      });

      const finalResults = mappedResults.filter((result: any) => result.status !== "pending");

      setTestResults(finalResults);

    } catch (error) {
      setTestResults([]);
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
        localStorage.clear();
        router.push("/");
      }
    });
  };

  const positions = [...new Set(testResults.map(p => p.position).filter(Boolean))];

  const filteredResults = testResults
    .filter(result => {
      const searchLower = (searchTerm || "").toLowerCase();
      
      const matchSearch = (
        (result.candidateName || "").toLowerCase().includes(searchLower) ||
        (result.candidateEmail || "").toLowerCase().includes(searchLower) ||
        (result.position || "").toLowerCase().includes(searchLower)
      );
      
      const matchPosition = filterPosition === "all" || result.position === filterPosition;

      const matchDate = filterDate === "" || result.testDate === filterDate;

      return matchSearch && matchPosition && matchDate;
    })
    .sort((a, b) => (a.candidateName || "").localeCompare(b.candidateName || ""));

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredResults.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredResults.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterPosition, filterDate]);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

const handleDownloadResultExcel = async (result: any) => {
  try {

  
    const wptSessionId =
      result?.wptSessionId ??
      result?.wpt_session_id;

    const istSessionId =
      result?.istSessionId ??
      result?.ist_session_id;

    const papiSessionId =
      result?.papiSessionId ??
      result?.papi_session_id;

    const discSessionId =
      result?.discSessionId ??
      result?.disc_session_id;


    const response = await fetch("/templates/template_laporan.xlsx");

    const buffer = await response.arrayBuffer();

    const workbook = new ExcelJS.Workbook();

    await workbook.xlsx.load(buffer);

    const fillBiodata = (sheet: any) => {
      sheet.getCell("C2").value = result.candidateName;
      sheet.getCell("C3").value = result.birthDate;
      sheet.getCell("C4").value = result.testDate;
      sheet.getCell("C5").value = result.position;
    };

   
    const fetchAnswers = async (sessionId?: string | number) => {
      if (sessionId === undefined || sessionId === null || sessionId === "") {
        return [];
      }

      const url =
        `${API_BASE_URL}/api/answer/session/${sessionId}`;

      const response = await fetch(url);

      if (!response.ok) {
        return [];
      }

      const body = await response.json();

      return Array.isArray(body.answers)
        ? body.answers
        : [];
    };

    const [wptAnswers, istAnswers, papiAnswers, discAnswers] =
      await Promise.all([
        fetchAnswers(wptSessionId),
        fetchAnswers(istSessionId),
        fetchAnswers(papiSessionId),
        fetchAnswers(discSessionId),
      ]);


    const parseAnswerValue = (ans: any, testType?: string) => {

      if (!ans) return "";

    

      if (testType === "WPT") {

        const specialQuestions = [23, 38, 41, 42, 49];

        if (
          specialQuestions.includes(Number(ans.order_number)) &&
          ans.selected_option_score_keys
        ) {

          return String(ans.selected_option_score_keys);
        }

        if (
          specialQuestions.includes(Number(ans.order_number)) &&
          ans.score_key != null
        ) {

          return String(ans.score_key);
        }
      }

    

      if (testType === "IST") {

        if (ans.score_key != null) {
          return String(ans.score_key);
        }
      }

   

      if (ans.selected_option_texts) {
        return String(ans.selected_option_texts);
      }

      if (ans.selected_option_text) {
        return String(ans.selected_option_text);
      }

      if (ans.answer_text) {
        return String(ans.answer_text);
      }

      if (ans.answer) {
        return String(ans.answer);
      }

      if (ans.selected_option_id != null) {
        return String(ans.selected_option_id);
      }

      if (ans.papi_choice != null) {
        return String(ans.papi_choice);
      }

      return "";
    };


    const sheetWPT = workbook.getWorksheet("WPT");

    if (sheetWPT) {
      fillBiodata(sheetWPT);
      sheetWPT.getCell("D7").value = result.wpt_summary || "-";
      sheetWPT.getCell("C7").value = result.wpt_score || 0;

      const answerMap: Record<number, any> = {};

      wptAnswers.forEach((ans: any) => {
        answerMap[Number(ans.order_number)] = ans;
      });

      for (let i = 1; i <= 50; i++) {
        const row = 10 + i;
        sheetWPT.getCell(`C${row}`).value =
          parseAnswerValue(answerMap[i], "WPT");
      }
    }

    
    const sheetIST = workbook.getWorksheet("IST");

    if (sheetIST) {
      fillBiodata(sheetIST);
      sheetIST.getCell("D7").value = result.ist_summary || "-";
      sheetIST.getCell("C7").value = result.ist_score || 0;

      const grouped: Record<number, any[]> = {};

      istAnswers.forEach((ans: any) => {

        const sectionId = Number(ans.section_id);

        if (!grouped[sectionId]) {
          grouped[sectionId] = [];
        }

        grouped[sectionId].push(ans);
      });

      Object.keys(grouped).forEach((key) => {

        grouped[Number(key)].sort(
          (a, b) =>
            Number(a.order_number) -
            Number(b.order_number)
        );
      });

      const firstBlock = [
        { section: 3, col: "C", startRow: 13, total: 20 },
        { section: 4, col: "F", startRow: 13, total: 20 },
        { section: 5, col: "I", startRow: 13, total: 20 },
        { section: 6, col: "L", startRow: 13, total: 16 },
        { section: 7, col: "O", startRow: 13, total: 20 },
      ];

      firstBlock.forEach((config) => {

        const answers = grouped[config.section] || [];

        for (let i = 0; i < config.total; i++) {

          const row = config.startRow + i;

          sheetIST.getCell(`${config.col}${row}`).value =
            parseAnswerValue(answers[i], "IST");
        }
      });

      const secondBlock = [
        { section: 8, col: "C", startRow: 39, total: 20 },
        { section: 9, col: "F", startRow: 39, total: 20 },
        { section: 10, col: "I", startRow: 39, total: 20 },
        { section: 11, col: "L", startRow: 39, total: 20 },
      ];

      secondBlock.forEach((config) => {

        const answers = grouped[config.section] || [];

        for (let i = 0; i < config.total; i++) {

          const row = config.startRow + i;

          sheetIST.getCell(`${config.col}${row}`).value =
            parseAnswerValue(answers[i], "IST");
        }
      });
    }

  
    const sheetPAPI = workbook.getWorksheet("Papikostik");

    if (sheetPAPI) {

      const questionMap: Record<
        number,
        { row: number; col: number }
      > = {};

      sheetPAPI.eachRow((row, rowNumber) => {

        row.eachCell((cell, colNumber) => {

          if (typeof cell.value === "number") {

            questionMap[cell.value] = {
              row: rowNumber,
              col: colNumber,
            };
          }
        });
      });

      papiAnswers.forEach((ans: any) => {

        const pos =
          questionMap[Number(ans.order_number)];

        if (!pos) return;

        sheetPAPI
          .getRow(pos.row)
          .getCell(pos.col + 1).value =
          ans.papi_choice || "";
      });
    }

    // =====================================================
    // DISC TEST
    // =====================================================
    const sheetDISC = workbook.getWorksheet("DISC Test");

    if (sheetDISC) {

      // =========================
      // BIODATA
      // =========================
      sheetDISC.getCell("F2").value = result.candidateName;
      sheetDISC.getCell("F3").value = result.birthDate;
      sheetDISC.getCell("F4").value = result.testDate;

      // =====================================================
      // BLOCK CONFIG
      // =====================================================
      const discBlocks = [
        {
          startQuestion: 1,
          endQuestion: 8,
          textCol: "F",
          mostCol: "B",
          leastCol: "D",
          startRow: 8,
        },
        {
          startQuestion: 9,
          endQuestion: 16,
          textCol: "M",
          mostCol: "I",
          leastCol: "K",
          startRow: 8,
        },
        {
          startQuestion: 17,
          endQuestion: 24,
          textCol: "T",
          mostCol: "P",
          leastCol: "R",
          startRow: 8,
        },
      ];

      // =====================================================
      // LOOP ANSWERS
      // =====================================================
      discAnswers.forEach((ans: any) => {

        const orderNumber =
          Number(ans.order_number);

        const block = discBlocks.find(
          (b) =>
            orderNumber >= b.startQuestion &&
            orderNumber <= b.endQuestion
        );

        if (!block) return;

        // =====================================================
        // ROW START
        // =====================================================
        // Setiap blok DISC baru (soal 9 dan 17) dimulai ulang di row 8,
        // karena blok berikutnya berada di kolom yang berbeda.
        // nomor 1 = row 8
        // nomor 2 = row 14
        // nomor 3 = row 20
        // dst
        const rowStart =
          block.startRow +
          ((orderNumber - block.startQuestion) * 6);

        // =====================================================
        // CEK 4 PILIHAN
        // =====================================================
        for (let i = 0; i < 4; i++) {

          const row = rowStart + i;

          const optionText =
            String(
              sheetDISC.getCell(
                `${block.textCol}${row}`
              ).value || ""
            )
              .trim()
              .toLowerCase();

          // =========================
          // MOST
          // =========================
          if (
            optionText ===
            String(ans.most_option_text || "")
              .trim()
              .toLowerCase()
          ) {

            sheetDISC.getCell(
              `${block.mostCol}${row}`
            ).value = "X";
          }

          // =========================
          // LEAST
          // =========================
          if (
            optionText ===
            String(ans.least_option_text || "")
              .trim()
              .toLowerCase()
          ) {

            sheetDISC.getCell(
              `${block.leastCol}${row}`
            ).value = "X";
          }
        }
      });

      // =========================
      // DESKRIPSI
      // =========================
      sheetDISC.getCell("A58").value =
        result.disc_description || "-";
    }

    // =====================================================
    // EXPORT
    // =====================================================
    const output = await workbook.xlsx.writeBuffer();

    const blob = new Blob([output]);

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    a.download =
      `Laporan_${result.candidateName}.xlsx`;

    document.body.appendChild(a);

    a.click();

    a.remove();

    window.URL.revokeObjectURL(url);

  } catch (error) {
    showDialog({
      type: 'alert',
      title: 'Error',
      message: 'Gagal mengunduh laporan. Silakan coba lagi.'
    });
  }
};

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
 className={`flex items-center space-x-2 pb-2 ${
                  "text-yellow-300 border-b-4 border-yellow-300"
                }`}                 >
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
              <h2 className="text-4xl font-bold text-black mb-2">Hasil Test Psikologi 📊</h2>
              <p className="text-gray-600 text-sm md:text-base lg:text-lg">Lihat dan unduh hasil test psikologi kandidat</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cari berdasarkan nama, email, atau jenis tes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-400 bg-gray-50/50"
              />
            </div>
            
            <div className="flex items-center bg-gray-50/50 border border-gray-200 rounded-xl px-4">
              <Filter className="w-5 h-5 text-gray-500 mr-2" />
              
              <select
                value={filterPosition}
                onChange={(e) => setFilterPosition(e.target.value)}
                className="py-3 bg-transparent focus:outline-none text-gray-700 font-medium"
              >
                <option value="all">Semua Posisi</option>
                {positions.map((pos, idx) => (
                  <option key={idx} value={pos}>{pos}</option>
                ))}
              </select>
            </div>

          <div className="flex items-center bg-gray-50/50 border border-gray-200 rounded-xl px-4">
            <Calendar className="w-5 h-5 text-gray-500 mr-2" />
            <input 
              type="date"
              value={filterDate}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => setFilterDate(e.target.value)}
              className="py-3 bg-transparent focus:outline-none text-gray-700 font-medium cursor-pointer"
            />
            {filterDate && (
              <button 
                onClick={() => setFilterDate("")} 
                className="ml-2 text-gray-400 hover:text-red-500"
                title="Hapus filter tanggal"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          </div>
        </div>

       
        <div className="bg-white rounded-xl shadow-lg overflow-hidden flex-1 flex flex-col border border-gray-200">
          <div className="overflow-x-auto flex-1 min-h-[460px]">  
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="py-4 px-12 text-gray-600 font-semibold text-sm uppercase tracking-wider w-1/4">Kandidat</th>
                  <th className="py-4 px-6 text-gray-600 font-semibold text-sm uppercase tracking-wider w-1/4">Posisi</th>
                  <th className="py-4 px-6 text-gray-600 font-semibold text-sm uppercase tracking-wider w-1/4">Jenis Tes</th>
                  <th className="py-4 px-6 text-gray-600 font-semibold text-sm uppercase tracking-wider w-1/4">Status Pengerjaan</th>
                  <th className="py-4 px-6 text-gray-600 font-semibold text-sm uppercase tracking-wider w-1/6">Aksi</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {currentItems.map((result) => (
                  <tr key={result.id} className="hover:bg-blue-50/50 transition-colors group">
                    <td className="py-4 px-6 pl-10 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                          <User className="w-5 h-5 text-blue-700" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-gray-800 truncate max-w-[200px] lg:max-w-[250px]" title={result.candidateName}>
                            {result.candidateName}
                          </div>
                          <div className="flex items-center text-xs text-gray-500 mt-1 truncate" title={result.candidateEmail}>
                            <Mail className="w-3 h-3 mr-1" />
                            {result.candidateEmail}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-3 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-bold border border-gray-200">
                        {result.position}
                      </span>
                    </td>

                    
                    <td className="py-4 px-6 whitespace-nowrap">
                       <span className="inline-flex items-center px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold border border-indigo-200">
                         <FileText className="w-3 h-3 mr-1.5" />
                         {result.testName || 'Tes Psikotes'}
                       </span>
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap">
                      {result.status === 'completed' ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                          <CheckCircle className="w-3 h-3 mr-1.5" /> Selesai Mengerjakan
                        </span>
                      ) : result.status === 'in_progress' ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-yellow-50 text-yellow-700 border border-yellow-200">
                          <Clock className="w-3 h-3 mr-1.5" /> Sedang Mengerjakan
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">
                          <Clock className="w-3 h-3 mr-1.5" /> Belum Tes
                        </span>
                      )}
                    </td>

                  
                    <td className="py-4 px-6 pr-15 text-center">
                      <div className="flex justify-center space-x-2 md:opacity-100 transition-opacity duration-200">
                      
                        <button
                          onClick={() => handleDownloadResultExcel(result)}
                          className="p-2 bg-green-50 hover:bg-green-100 rounded-lg text-green-600 hover:text-green-800 transition-colors"
                          title="Unduh Laporan (Excel)"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredResults.length === 0 && (
               <div className="text-center py-20 flex flex-col items-center justify-center">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-10 h-10 text-gray-300" />
                </div>
                <p className="text-lg font-bold text-gray-700">Tidak ada hasil tes ditemukan</p>
                <p className="text-sm text-gray-500 mt-1">
                  {searchTerm ? 'Coba ubah kata kunci pencarian Anda' : 'Belum ada hasil tes yang terdaftar'}
                </p>
              </div>
            )}
          </div>

          {filteredResults.length > 0 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between mt-auto">
              <div className="hidden sm:block">
                <p className="text-sm text-gray-600">
                  Menampilkan <span className="font-bold text-gray-900">{indexOfFirstItem + 1}</span> - <span className="font-bold text-gray-900">{Math.min(indexOfLastItem, filteredResults.length)}</span> dari <span className="font-bold text-gray-900">{filteredResults.length}</span> hasil tes
                </p>
              </div>
              <div>
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
            </div>
          )}
        </div>
      </main>

      {selectedResult && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-[#242467] px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <h3 className="text-xl font-bold text-white flex items-center">
                <Award className="w-5 h-5 mr-2 text-yellow-400" /> Rincian Nilai Kandidat
              </h3>
              <button onClick={() => setSelectedResult(null)} className="text-white/70 hover:text-white transition-colors bg-white/5 hover:bg-white/20 p-2 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[70vh]">
               <div className="flex items-center space-x-4 mb-6 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                  <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <User className="w-7 h-7 text-blue-700" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">{selectedResult.candidateName}</h4>
                    <p className="text-sm text-gray-600">{selectedResult.position} • {selectedResult.candidateEmail}</p>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="border border-indigo-200 bg-indigo-50 p-4 rounded-xl text-center flex flex-col items-center justify-center">
                     <p className="text-xs text-indigo-500 font-bold uppercase tracking-wide mb-1">Jenis Tes</p>
                     <p className="text-lg font-black text-indigo-700 uppercase tracking-wider">{selectedResult.testName || 'Psikotes'}</p>
                  </div>
               </div>

               {selectedResult.sections && selectedResult.sections.length > 0 && (
                 <>
                   <h5 className="font-bold text-gray-800 mb-3 uppercase text-sm tracking-wide">Rincian Per Section</h5>
                   <div className="space-y-3 mb-6">
                     {selectedResult.sections.map((sec, idx) => (
                       <div key={idx} className="bg-white border border-gray-200 p-3 rounded-lg flex justify-between items-center">
                         <span className="font-medium text-gray-700">{sec.name}</span>
                         <div className="flex items-center space-x-3">
                           <div className="w-32 bg-gray-200 rounded-full h-2">
                             <div className="bg-blue-500 h-2 rounded-full" style={{width: `${(sec.score / sec.maxScore) * 100}%`}}></div>
                           </div>
                           <span className="text-sm font-bold text-gray-900">{sec.score}/{sec.maxScore}</span>
                         </div>
                       </div>
                     ))}
                   </div>
                 </>
               )}

               {selectedResult.recommendations && selectedResult.recommendations !== '-' && (
                 <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl">
                   <h5 className="font-bold text-yellow-800 mb-1 text-sm uppercase">Catatan & Rekomendasi</h5>
                   <p className="text-sm text-yellow-900">{selectedResult.recommendations}</p>
                 </div>
               )}
            </div>
            
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={() => setSelectedResult(null)}
                className="px-6 py-2.5 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-bold rounded-xl transition-all duration-200"
              >
                Tutup
              </button>
              <button
                onClick={() => handleDownloadResultExcel(selectedResult)}
                className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl flex items-center shadow-md transition-colors"
              >
                <Download className="w-4 h-4 mr-2" /> Unduh Excel
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