"use client";
import { Maximize } from "lucide-react"; 
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
 
  CheckCircle, 
  AlertCircle, 

  ArrowRight,

  Monitor,
  Wifi,
  Shield,
  BookOpen,
  Timer,
 
  Mail
} from "lucide-react";

interface GuideStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface ISTSection {
  id: number;
  code: string;
  name: string;
  description: string;
  duration: string;
  example: string;
  icon: React.ReactNode;
}

const isIOSDevice = () => {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
};

export default function TestGuidePage() {
  const router = useRouter();
  const [testId, setTestId] = useState<string>('');
  const [testCode, setTestCode] = useState<string>('');
  const [testData, setTestData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
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
      console.error("Gagal masuk mode layar penuh:", error);
      alert("Browser Anda memblokir mode layar penuh. Izinkan melalui pengaturan browser.");
    }
  };

 useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('testId');
    
    if (id) {
      setTestId(id);
      
      const fetchTestCode = async () => {
        try {
          const response = await fetch(`/api/tests/${id}`);
          
          if (response.ok) {
            const data = await response.json();
            if (data.test_code) {
              setTestCode(data.test_code);
              setTestData(data);
              console.log('Test code from API (port 3001):', data.test_code);
            } else {
              console.log('No test_code in API response, using fallback');
              useFallback(id);
            }
          } else {
            console.error('API response not OK:', response.status);
            useFallback(id);
          }
        } catch (error) {
          console.error('Error fetching test data:', error);
          useFallback(id);
        } finally {
          setLoading(false);
        }
      };
      
      const useFallback = (testId: string) => {
        const fallbackCodes: Record<string, string> = {
          '1': 'WPT',
          '2': 'Papikostik',
          '3': 'IST',
          '4': 'DISC'
        };
        setTestCode(fallbackCodes[testId] || 'WPT');
        setLoading(false);
      };
      
      fetchTestCode();
    } else {
      setLoading(false);
    }
  }, []); 

  const guideSteps: GuideStep[] = [
    {
      id: 1,
      title: "Persiapan Perangkat",
      description: "Pastikan Anda menggunakan laptop, komputer, atau smartphone dengan browser Chrome atau Firefox versi terbaru.",
      icon: <Monitor className="w-6 h-6" />
    },
    {
      id: 2,
      title: "Koneksi Internet Stabil",
      description: "Pastikan koneksi internet stabil selama tes.",
      icon: <Wifi className="w-6 h-6" />
    },
    {
      id: 3,
      title: "Waktu Pengerjaan",
      description: "Setiap tes memiliki batas waktu. Penghitung waktu akan tampil di pojok kiri atas. Waktu tidak dapat dihentikan, dan apabila waktu habis, halaman soal akan tertutup secara otomatis.",
      icon: <Timer className="w-6 h-6" />
    },
    {
      id: 4,
      title: "Sistem Penyimpanan Otomatis",
      description: "Jawaban akan otomatis tersimpan saat Anda berpindah soal. Anda dapat kembali ke soal sebelumnya.",
      icon: <Shield className="w-6 h-6" />
    },
    {
      id: 5,
      title: "Kejujuran dalam Menjawab",
      description: "Jawablah dengan jujur tanpa mencari jawaban melalui internet. Dilarang memfoto, merekam video, atau mengambil tangkapan layar soal maupun jawaban. Hasil tes akan digunakan untuk evaluasi yang tepat.",
      icon: <BookOpen className="w-6 h-6" />
    },
    {
      id: 6,
      title: "Tidak Bisa Diulang",
      description: "Tes yang telah dikerjakan dan dikirim tidak dapat diulang. Pastikan Anda sudah yakin sebelum mengirim jawaban",
      icon: <CheckCircle className="w-6 h-6" />
    }
  ];


  const getTestInstructions = (testCode: string): string[] => {
    switch(testCode) {
      case 'WPT':
        return [
          "Tes ini terdiri dari 50 pertanyaan yang tingkat kesulitannya akan semakin meningkat.",
          "Anda mungkin tidak dapat menyelesaikan seluruh pertanyaan, tetapi kerjakan sebanyak mungkin sesuai kemampuan Anda.",
          "Setelah tes dimulai, Anda memiliki waktu 12 menit untuk menjawab sebanyak mungkin pertanyaan dengan benar.",
          "Kerjakan dengan teliti, namun jangan menghabiskan terlalu banyak waktu pada satu pertanyaan.",
          "Jika Anda tidak mengetahui jawabannya, lewati pertanyaan tersebut dan lanjutkan ke pertanyaan berikutnya.",
          "Pastikan Anda memasukkan jawaban pada kolom yang tersedia.",
          "Periksa kembali jawaban Anda apabila waktu masih tersedia."
        ];
      case 'Papikostik':
        return [
          "Tes ini terdiri dari 90 pasang pernyataan.",
          "Pada setiap pasangan pernyataan, pilihlah SATU pernyataan yang PALING MENGGAMBARKAN diri Anda, atau yang PALING SESUAI dengan perasaan Anda.",
          "Terkadang Anda merasa bahwa kedua pernyataan tersebut tidak sesuai dengan diri Anda. Namun demikian, Anda tetap diminta untuk memilih satu pernyataan yang PALING MENDEKATI diri Anda.",
          "Jawablah setiap pernyataan dengan memilih Opsi A atau Opsi B."
        ];
      case 'IST':
       return [
          "Tes IST terdiri atas 9 bagian yang harus dikerjakan secara BERURUTAN.",
          "Anda TIDAK DAPAT melompati bagian maupun kembali ke bagian sebelumnya.",
          "Setiap bagian memiliki batas waktu yang berbeda-beda.",
          "Kerjakan setiap soal secara sistematis, teliti dan berurutan.",
          "Jangan menghabiskan terlalu banyak waktu pada satu soal. Jika mengalami kesulitan, lanjutkan ke soal berikutnya.",
          "Gunakan waktu seefisien mungkin sesuai dengan petunjuk waktu pada setiap bagian.",
          "Periksa kembali jawaban Anda sebelum berpindah ke bagian berikutnya."
        ];
      case 'DISC':
       return [
        "Setiap nomor pada tes DISC memuat 4 kalimat.",
        "Pada setiap nomor, hanya terdapat 1 pilihan untuk masing-masing kolom P dan K.",
      ];

      default:
        return [
          "Perhatikan waktu pengerjaan dengan baik.",
          "Baca soal dengan teliti sebelum menjawab.",
          "Gunakan seluruh waktu yang disediakan secara optimal.",
          "Pastikan koneksi internet tetap stabil selama tes."
        ];
    }
  };

  const handleStartPostTest = () => {
    if (!testId) {
      alert('Error: Test ID tidak ditemukan. Silakan kembali ke dashboard dan coba lagi.');
      return;
    }
    
    router.push(`/kandidat/post-test?testId=${testId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#242467] mx-auto mb-6"></div>
          <h2 className="text-xl font-bold text-gray-800">Memuat panduan tes...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 flex flex-col ${!isFullscreen ? 'overflow-hidden' : ''}`}>
      
     
      {!isFullscreen && (
        <div className="fixed inset-0 z-[99999] bg-gray-900/95 backdrop-blur-md flex flex-col items-center justify-center p-6">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full text-center animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-blue-100">
              <Maximize className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-3">Layar Penuh Diwajibkan</h2>
            <p className="text-gray-600 mb-8 text-sm leading-relaxed font-medium">
              Sistem mendeteksi Anda keluar dari mode layar penuh. Untuk menjaga integritas dan fokus selama tes, Anda diwajibkan untuk kembali ke mode Layar Penuh.
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
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Panduan Pengerjaan Tes</h1>
          </div>
        </div>
      </header>

<main className="container mx-auto px-4 py-8 flex-1 flex flex-col">
          <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Persiapan Sebelum Tes</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guideSteps.map((step) => (
              <div
                key={step.id}
                className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-start mb-4">
                  <div className="w-12 h-12 bg-[#242467]/10 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-[#242467] font-bold text-lg">{step.id}</span>
                  </div>
                  <div className="text-[#242467]">
                    {step.icon}
                  </div>
                </div>
                
                <h3 className="text-lg font-bold text-gray-800 mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className={`rounded-2xl shadow-xl p-8 mb-8 ${
          testCode === 'WPT' ? 'bg-white border border-gray-200' : 
          testCode === 'Papikostik' ? 'bg-white border border-gray-200' :
          testCode === 'IST' ? 'bg-white border border-gray-200' :
          testCode === 'DISC' ? 'bg-white border border-gray-200' :
          'bg-white border border-gray-200'
        }`}>
          <div className="flex items-center mb-6">
            <AlertCircle className={`w-8 h-8 mr-3 ${
              testCode === 'WPT' ? 'text-[#242467]' : 
              testCode === 'Papikostik' ? 'text-[#242467]' :
              testCode === 'IST' ? 'text-[#242467]' :
              testCode === 'DISC' ? 'text-[#242467]' :
              'text-[#242467]'
            }`} />
            <h2 className="text-2xl font-bold text-gray-800">Petunjuk Mengerjakan {testCode}</h2>
          </div>
          
          <ul className="space-y-4">
            {getTestInstructions(testCode).map((instruction, index) => (
              <li key={index} className="flex items-start p-3 bg-gray-50 rounded-lg">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 flex-shrink-0 ${
                  testCode === 'WPT' ? 'bg-[#242467]/10 text-[#242467]' : 
                  testCode === 'Papikostik' ? 'bg-[#242467]/10 text-[#242467]' :
                  testCode === 'IST' ? 'bg-[#242467]/10 text-[#242467]' :
                  testCode === 'DISC' ? 'bg-[#242467]/10 text-[#242467]' :
                  'bg-[#242467]/10 text-[#242467]'
                }`}>
                  <span className="font-bold">{index + 1}</span>
                </div>
                <span className="text-gray-700">{instruction}</span>
              </li>
            ))}
          </ul>

         
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex flex-col items-center">
            <div className="text-center max-w-2xl mx-auto flex flex-col items-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Siap Memulai Tes?</h2>
              <p className="text-gray-600 mb-8">
                Pastikan Anda sudah membaca dan memahami panduan di atas. 
                Klik tombol di bawah untuk langsung memulai tes.
              </p>
              
              <button
                onClick={handleStartPostTest}
                className="mx-auto w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 font-bold rounded-xl flex items-center justify-center space-x-2 md:space-x-3 transition-all duration-300 bg-[#242467] hover:bg-[#1a1a52] text-white hover:shadow-xl transform md:hover:scale-105 text-sm md:text-base"
              >
                <span>Mulai Tes Sekarang</span>
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
              </button>
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