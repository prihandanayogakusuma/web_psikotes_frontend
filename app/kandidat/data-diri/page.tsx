"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  User, MapPin, Phone, Calendar, CreditCard, Save, Trash2, Loader2, AlertTriangle,
  Mail, GraduationCap, Briefcase, Star, AlertCircle, ChevronRight, ChevronLeft, 
  CheckCircle2, Plus, FileText, Heart, Ruler, Car, Info
} from "lucide-react";
import { Domine } from "next/font/google";


// const API_BASE_URL = 'https://api.lourdesautoparts.com';
const API_BASE_URL = '';

export default function MultiStepRegistration() {
  const router = useRouter();
  const [step, setStep] = useState(1); 
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const [dialog, setDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    isSuccess: false
  });

  const showDialog = (title: string, message: string, isSuccess = false) => {
    setDialog({ isOpen: true, title, message, isSuccess });
  };

  const closeDialog = () => {
    setDialog(prev => ({ ...prev, isOpen: false }));
  };

  const [formData, setFormData] = useState({
    nama_lengkap: "", email: "", nama_panggilan: "", tempat_lahir: "", tanggal_lahir: "", jenis_kelamin: "", alamat_ktp: "", alamat_domisili: "", no_telp: "", linkedin: "", status_pernikahan: "", agama: "", suku_bangsa: "", golongan_darah: "", kendaraan_pribadi: [] as string[], size_baju: "", size_sepatu: "", tinggi_badan: "", berat_badan: "", dapat_mengendarai: [] as string[], memiliki_sim: [] as string[], kegiatan_luang: "", info_lowongan: "", gaji_diharapkan: "", tanggal_siap_bergabung: "",

    ayah: { nama: "", alamat: "", pekerjaan: "", hp: "" },
    ibu: { nama: "", alamat: "", pekerjaan: "", hp: "" },
    suami_istri: { nama: "", alamat: "", pekerjaan: "", hp: "" },
    anak: [
      { nama: "", alamat: "", pekerjaan: "", hp: "" , isFixed: false }
    ],

    pendidikan_formal: [
      { tingkat: "SMA/SMK *", sekolah: "", jurusan: "", masuk: "", lulus: "", ipk: "" },
      { tingkat: "Akademi (D1/D2/D3)", sekolah: "", jurusan: "", masuk: "", lulus: "", ipk: "" },
      { tingkat: "Universitas Strata 1", sekolah: "", jurusan: "", masuk: "", lulus: "", ipk: "" },
      { tingkat: "Universitas Strata 2", sekolah: "", jurusan: "", masuk: "", lulus: "", ipk: "" },
      { tingkat: "Lain-lain", sekolah: "", jurusan: "", masuk: "", lulus: "", ipk: "" },

    ],
    kursus: [{ tema: "", penyelenggara: "", tahun: "" , isFixed: false }],

    pengalaman_kerja: [
      { perusahaan: "", usaha: "", jabatan: "", gaji: "", lama_kerja: "", start_date: "", end_date: "", atasan: "", hp_atasan: "", jab_atasan: "", tugas: ["", "", "", "", ""], alasan_berhenti: "" },
      { perusahaan: "", usaha: "", jabatan: "", gaji: "", lama_kerja: "", start_date: "", end_date: "", atasan: "", hp_atasan: "", jab_atasan: "", tugas: ["", "", "", "", ""], alasan_berhenti: "" },
      { perusahaan: "", usaha: "", jabatan: "", gaji: "", lama_kerja: "", start_date: "", end_date: "", atasan: "", hp_atasan: "", jab_atasan: "", tugas: ["", "", "", "", ""], alasan_berhenti: "" },
    ],

keahlian: [
      { kemampuan: "English", level: "", keterangan: "", isFixed: true },
      { kemampuan: "Bahasa asing", level: "", keterangan: "", isFixed: true },
      { kemampuan: "Komputer", level: "", keterangan: "", isFixed: true }
    ],

    info_umum: [
      { pertanyaan: "Apakah Anda pernah melamar di PT. Garuda Mart Indonesia sebelumnya? Kapan dan sebagai apa? *", jawaban: "Tidak", penjelasan: "" },
      { pertanyaan: "Apakah Anda memiliki keluarga/teman yang bekerja di PT Garuda Mart Indonesia? Jika iya mohon sebutkan namanya! *", jawaban: "Tidak", penjelasan: "" },
      { pertanyaan: "Apakah Anda pernah menderita sakit keras/kronis/kecelakaan/operasi? Jika iya sebutkan namanya! *", jawaban: "Tidak", penjelasan: "" },
      { pertanyaan: "Apakah Anda pernah mengalami atau saat ini sedang berada dalam keadaan kesulitan keuangan, seperti adanya tunggakan pinjaman di Bank, Pinjaman Online atau Jasa Keuangan lainnya baik legal atau tidak legal? *", jawaban: "Tidak", penjelasan: "" },
      { pertanyaan: "Apakan Anda bersedia di tempatkan di luar kota? *", jawaban: "Tidak", penjelasan: "" },
      { pertanyaan: "Apakah Anda keberatan bila kami meminta referensi pada perusahaan tempat Anda pernah bekerja? *", jawaban: "Tidak", penjelasan: "" },
      { pertanyaan: "Apakah Anda mempunyai pekerjaan sampingan? Jika iya berikan penjelasannya dan berapa banyak waktu yang anda gunakan? *", jawaban: "Tidak", penjelasan: "" },
      { pertanyaan: "Apakah saat ini Anda masih memiliki kontrak kerja dengan Instansi Pemerintah atau Swasta? Jika iya jelaskan nama instansinya, siapa nama atasannya, berapa nomor telephone yang bisa dihubungi? *", jawaban: "Tidak", penjelasan: "" },
      { pertanyaan: "Apabila diterima menjadi karyawan PT Garuda Mart Indonesia, apakah Anda bersedia untuk tidak mengikatkan diri atau terlibat kontrak dengan pihak lain? *", jawaban: "Tidak", penjelasan: "" },

    ]
  });

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) { router.push("/"); return; }
    console.log("Loaded user data:", userData);
    const parsed = JSON.parse(userData);
    setUser(parsed);
    setFormData(p => ({ 
      ...p, 
      nama_lengkap: parsed.name || "", 
      email: parsed.email || "",
      no_telp: parsed.nomor_telpon || parsed.phone || "",
      tanggal_lahir: parsed.tanggal_lahir ? parsed.tanggal_lahir.split('T')[0] : ""
    }));

    if (parsed.has_filled_data) { router.push("/kandidat/dashboard"); }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateStep = () => {
    switch (step) {
      case 1: 
        if (!formData.nama_panggilan.trim()) return "Nama Panggilan wajib diisi!";
        if (!formData.tempat_lahir.trim()) return "Tempat Lahir wajib diisi!";
        if (!formData.tanggal_lahir) return "Tanggal Lahir wajib diisi!";
        if (!formData.jenis_kelamin) return "Jenis Kelamin wajib dipilih!";
        if (!formData.status_pernikahan) return "Status Pernikahan wajib dipilih!";
        if (!formData.alamat_ktp.trim()) return "Alamat KTP wajib diisi!";
        if (!formData.alamat_domisili.trim()) return "Alamat Domisili wajib diisi!";
        if (!formData.no_telp.trim()) return "No. Telp/HP wajib diisi!";
        if (!formData.agama.trim()) return "Agama wajib diisi!";
        if (!formData.suku_bangsa.trim()) return "Suku Bangsa wajib diisi!";
        if (!formData.golongan_darah) return "Golongan Darah wajib dipilih!";
        if (formData.kendaraan_pribadi.length === 0) return "Pilihan Kendaraan Pribadi wajib diisi!";
        if (!formData.size_baju.trim()) return "Ukuran Baju wajib diisi!";
        if (!formData.size_sepatu) return "Ukuran Sepatu wajib diisi!";
        if (!formData.tinggi_badan) return "Tinggi Badan wajib diisi!";
        if (!formData.berat_badan) return "Berat Badan wajib diisi!";
        if (formData.dapat_mengendarai.length === 0) return "Kolom 'Dapat Mengendarai' wajib diisi!";
        if (formData.memiliki_sim.length === 0) return "Kolom 'Memiliki SIM' wajib diisi!";
        if (!formData.kegiatan_luang.trim()) return "Hobi / Kegiatan waktu luang wajib diisi!";
        if (!formData.info_lowongan.trim()) return "Info lowongan wajib diisi!";
        if (!formData.gaji_diharapkan) return "Gaji yang diharapkan wajib diisi!";
        if (!formData.tanggal_siap_bergabung) return "Tanggal siap bergabung wajib diisi!";
        return null;

      case 2: 
        if (!formData.ayah.nama.trim()) return "Nama Lengkap Ayah wajib diisi!";
        if (!formData.ayah.alamat.trim()) return "Alamat Ayah wajib diisi!";
        if (!formData.ayah.pekerjaan.trim()) return "Pekerjaan Ayah wajib diisi!";
        if (!formData.ayah.hp.trim()) return "No. HP Ayah wajib diisi!";
        if (!formData.ibu.nama.trim()) return "Nama Lengkap Ibu wajib diisi!";
        if (!formData.ibu.alamat.trim()) return "Alamat Ibu wajib diisi!";
        if (!formData.ibu.pekerjaan.trim()) return "Pekerjaan Ibu wajib diisi!";
        if (!formData.ibu.hp.trim()) return "No. HP Ibu wajib diisi!";
        return null;

      case 3: 
        const sma = formData.pendidikan_formal[0]; 

        if (!sma.sekolah.trim()) return "Nama Sekolah SMA/SMK wajib diisi!";
        if (!sma.jurusan.trim()) return "Jurusan SMA/SMK wajib diisi!";
        if (!sma.masuk.trim()) return "Tahun Masuk SMA/SMK wajib diisi!";
        if (!sma.lulus.trim()) return "Tahun Lulus SMA/SMK wajib diisi!";
        return null;


      case 4: 
        const job1 = formData.pengalaman_kerja[0];
        if (!job1.perusahaan.trim()) return "Nama Perusahaan pada Pekerjaan 1 wajib diisi! Jika tidak memiliki pengalaman, ketik '-' atau 'Fresh Graduate'.";
        if (!job1.usaha.trim()) return "Jenis Usaha pada Pekerjaan 1 wajib diisi!";
        if (!job1.jabatan.trim()) return "Jabatan pada Pekerjaan 1 wajib diisi!";
        if (!job1.gaji.trim()) return "Gaji Terakhir pada Pekerjaan 1 wajib diisi!";
        if (!job1.start_date) return "Tanggal Mulai Bekerja pada Pekerjaan 1 wajib diisi!";
        if (!job1.end_date) return "Tanggal Berhenti Bekerja pada Pekerjaan 1 wajib diisi!";
        if (!job1.atasan.trim()) return "Nama Atasan Referensi pada Pekerjaan 1 wajib diisi!";
        if (!job1.jab_atasan.trim()) return "Jabatan Atasan Referensi pada Pekerjaan 1 wajib diisi!";
        if (!job1.hp_atasan.trim()) return "No. HP Atasan Referensi pada Pekerjaan 1 wajib diisi!";
        if (!job1.alasan_berhenti.trim()) return "Alasan Berhenti pada Pekerjaan 1 wajib diisi!";
        return null;

      case 6: 
        for (let i = 0; i < formData.info_umum.length; i++) {
          const info = formData.info_umum[i];
          if (info.jawaban === "Ya" && !info.penjelasan.trim()) {
            return `Pada Poin F, pertanyaan nomor ${i + 1} Anda memilih 'Ya', maka Penjelasan wajib diisi!`;
          }
        }
        return null;

      default:
        return null; 
    }
  };

  const handleNext = () => {
    const errorAlert = validateStep();
    if (errorAlert) {
      showDialog("Data Belum Lengkap", errorAlert, false);
      return;
    }
    window.scrollTo(0, 0);
    setStep(s => s + 1);
  };
  
  const handleBack = () => {
    window.scrollTo(0, 0);
    setStep(s => s - 1);
  };

  const handleCheckboxArray = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const { value, checked } = e.target;
    setFormData((prev: any) => {
      const currentArray = prev[field] || [];
      if (checked) {
        if (value === "Tidak Ada" || value === "Tidak Bisa") {
          return { ...prev, [field]: [value] };
        }
        const filtered = currentArray.filter((item: string) => item !== "Tidak Ada" && item !== "Tidak Bisa");
        return { ...prev, [field]: [...filtered, value] };
      } else {
        return { ...prev, [field]: currentArray.filter((item: string) => item !== value) };
      }
    });
  };

  const updatePengalamanKerjaField = (index: number, field: string, value: string) => {
    const newPengalaman = [...formData.pengalaman_kerja];
    newPengalaman[index] = { ...newPengalaman[index], [field]: value };
    setFormData({ ...formData, pengalaman_kerja: newPengalaman });
  };

  const updatePengalamanKerjaTask = (jobIndex: number, taskIndex: number, value: string) => {
    const newPengalaman = [...formData.pengalaman_kerja];
    const tugas = [...newPengalaman[jobIndex].tugas];
    tugas[taskIndex] = value;
    newPengalaman[jobIndex] = { ...newPengalaman[jobIndex], tugas };
    setFormData({ ...formData, pengalaman_kerja: newPengalaman });
  };

  const handleSubmitFinal = async () => {
    const errorAlert = validateStep();
    if (errorAlert) {
      showDialog("Data Belum Lengkap", errorAlert, false); 
      return;
    }

    if (!agreed) {
      showDialog("Persetujuan Diperlukan", "Anda harus menyetujui pernyataan di akhir form sebelum menyimpan data.", false); // 🚀 Ganti alert di sini
      return;
    }

    if (!user?.participant_id) {
      alert("User tidak ditemukan.");
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        participant_id: user.participant_id,

        // applications
        source_info: formData.info_lowongan,
        expected_salary: formData.gaji_diharapkan,
        ready_to_join_date: formData.tanggal_siap_bergabung,

        // application_profiles
        nickname: formData.nama_panggilan,
        birth_place: formData.tempat_lahir,
        gender: formData.jenis_kelamin,
        ktp_address: formData.alamat_ktp,
        domicile_address: formData.alamat_domisili,
        linkedin: formData.linkedin,
        marital_status: formData.status_pernikahan,
        religion: formData.agama,
        ethnicity: formData.suku_bangsa,
        blood_type: formData.golongan_darah,
        vehicle: formData.kendaraan_pribadi,
        shirt_size: formData.size_baju,
        shoe_size: formData.size_sepatu,
        height: formData.tinggi_badan,
        weight: formData.berat_badan,
        driving_skills: formData.dapat_mengendarai,
        sim_types: formData.memiliki_sim,
        hobbies: formData.kegiatan_luang,

        // family
        family: [
          {
            relation_type: "Ayah",
            name: formData.ayah.nama,
            address: formData.ayah.alamat,
            job: formData.ayah.pekerjaan,
            phone: formData.ayah.hp,
            order_no: 1
          },
          {
            relation_type: "Ibu",
            name: formData.ibu.nama,
            address: formData.ibu.alamat,
            job: formData.ibu.pekerjaan,
            phone: formData.ibu.hp,
            order_no: 2
          },
          {
            relation_type: "Suami/Istri",
            name: formData.suami_istri.nama,
            address: formData.suami_istri.alamat,
            job: formData.suami_istri.pekerjaan,
            phone: formData.suami_istri.hp,
            order_no: 3
          },
          ...formData.anak.map((anak, index) => ({
            relation_type: "Anak",
            name: anak.nama,
            address: anak.alamat,
            job: anak.pekerjaan,
            phone: anak.hp,
            order_no: index + 4
          }))
        ].filter(
          (f) =>
            f.name ||
            f.address ||
            f.job ||
            f.phone
        ),

        // education
        education: formData.pendidikan_formal
          .filter(
            (e) =>
              e.sekolah ||
              e.jurusan ||
              e.masuk ||
              e.lulus
          )
          .map((e) => ({
            level: e.tingkat,
            school_name: e.sekolah,
            major: e.jurusan,
            start_year: e.masuk,
            end_year: e.lulus,
            gpa: e.ipk
          })),

        // certifications
        certifications: formData.kursus
          .filter(
            (c) =>
              c.tema ||
              c.penyelenggara ||
              c.tahun
          )
          .map((c) => ({
            title: c.tema,
            organizer: c.penyelenggara,
            year: c.tahun
          })),

        // experiences
        experiences: formData.pengalaman_kerja
          .filter(
            (e) =>
              e.perusahaan ||
              e.jabatan
          )
          .map((e) => {
            return {
              company_name: e.perusahaan,
              business_type: e.usaha,
              position: e.jabatan,
              salary: e.gaji,
              start_date: e.start_date,
              end_date: e.end_date,
              supervisor_name: e.atasan,
              supervisor_phone: e.hp_atasan,
              supervisor_position: e.jab_atasan,
              tasks: e.tugas.filter((t) => t).join(", "),
              reason_for_leaving: e.alasan_berhenti
            };
          }),

        // skills
        skills: formData.keahlian
          .filter(
            (s) =>
              s.kemampuan ||
              s.level ||
              s.keterangan
          )
          .map((s) => ({
            skill_name: s.kemampuan,
            level: s.level,
            description: s.keterangan
          })),

        // general_info
        general_info: {
          applied_before:
            formData.info_umum[0]?.jawaban === "Ya",
          applied_before_note:
            formData.info_umum[0]?.penjelasan || "",

          has_relative:
            formData.info_umum[1]?.jawaban === "Ya",
          has_relative_note:
            formData.info_umum[1]?.penjelasan || "",

          has_illness:
            formData.info_umum[2]?.jawaban === "Ya",
          has_illness_note:
            formData.info_umum[2]?.penjelasan || "",

          financial_issue:
            formData.info_umum[3]?.jawaban === "Ya",
          financial_issue_note:
            formData.info_umum[3]?.penjelasan || "",

          willing_out_of_town:
            formData.info_umum[4]?.jawaban === "Ya",
          willing_out_of_town_note:
            formData.info_umum[4]?.penjelasan || "",

          allow_reference_check:
            formData.info_umum[5]?.jawaban === "Ya",
          allow_reference_check_note:
            formData.info_umum[5]?.penjelasan || "",

          has_side_job:
            formData.info_umum[6]?.jawaban === "Ya",
          has_side_job_note:
            formData.info_umum[6]?.penjelasan || "",

          has_active_contract:
            formData.info_umum[7]?.jawaban === "Ya",
          has_active_contract_note:
            formData.info_umum[7]?.penjelasan || "",

          willing_no_other_contract:
            formData.info_umum[8]?.jawaban === "Ya",
          willing_no_other_contract_note:
            formData.info_umum[8]?.penjelasan || ""
        }
      };

      const response = await fetch(
        `${API_BASE_URL}/api/applications`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Gagal submit data");
      }

      await new Promise((resolve) =>
        setTimeout(resolve, 1500)
      );

      router.push("/kandidat/dashboard");
    } catch (err: any) {
      showDialog("Terjadi Kesalahan", err.message || "Gagal menyimpan data", false);
     }
  };

  const InputLabel = ({ label, icon: Icon }: any) => (
    <label className="text-sm font-bold text-gray-700 flex items-center mb-1.5">
      {Icon && <Icon className="w-4 h-4 mr-2 text-gray-400" />} {label}
    </label>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        
        {dialog.isOpen && (
        <div className="fixed inset-0 z-[9999999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in zoom-in duration-200 text-center">
            
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${dialog.isSuccess ? 'bg-green-100' : 'bg-red-100'}`}>
              {dialog.isSuccess ? (
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              ) : (
                <AlertTriangle className="w-8 h-8 text-red-600" />
              )}
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">{dialog.title}</h3>
            <p className="text-gray-600 mb-8 font-medium leading-relaxed">
              {dialog.message}
            </p>
            
            <button
              onClick={closeDialog}
              className={`w-full font-bold py-3.5 rounded-xl transition-all hover:-translate-y-0.5 shadow-md ${
                dialog.isSuccess 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-[#242467] hover:bg-[#1a1a52] text-white'
              }`}
            >
              Oke, Mengerti
            </button>
          </div>
        </div>
      )}

        <div className="bg-[#242467] p-6 md:p-8 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div className="flex items-center">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mr-4 border border-white/30 hidden md:flex">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Formulir Data Diri Kandidat</h1>
                <p className="text-blue-200 text-sm mt-1">Lengkapi data untuk proses rekrutmen</p>
              </div>
            </div>
            <div className="bg-white/10 px-4 py-2 rounded-xl text-sm font-medium border border-white/20 whitespace-nowrap">
              Bagian {String.fromCharCode(64 + step)} dari F
            </div>
          </div>
          <div className="w-full bg-blue-900/50 h-2.5 rounded-full overflow-hidden">
            <div className="bg-yellow-400 h-full transition-all duration-500 rounded-full" style={{ width: `${(step/6)*100}%` }}></div>
          </div>
        </div>

        <div className="p-6 md:p-10">
          
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-8 border-b-2 border-gray-100 pb-4">
                <h2 className="text-xl font-black text-[#242467] uppercase tracking-wider flex items-center">
                  <span className="bg-[#242467] text-white w-8 h-8 rounded-lg flex items-center justify-center mr-3 text-lg">A</span> 
                  Identitas Diri
                </h2>
                <p className="text-sm text-gray-500 mt-2">Mohon lengkapi data berikut dengan sebenar-benarnya sesuai dengan kartu identitas Anda.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <InputLabel label="Nama Lengkap Sesuai KTP *" icon={User} />
                  <input type="text" name="nama_lengkap" value={formData.nama_lengkap} disabled className="w-full p-3 border border-gray-200 rounded-xl bg-gray-100 text-gray-500 cursor-not-allowed font-medium" />
                  <p className="text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1"/>Data ini telah diregistrasikan oleh Admin.</p>
                </div>
                <div className="space-y-2">
                  <InputLabel label="Alamat Email *" icon={Mail} />
                  <input type="email" name="email" value={formData.email} disabled className="w-full p-3 border border-gray-200 rounded-xl bg-gray-100 text-gray-500 cursor-not-allowed font-medium" />
                </div>

                <div className="space-y-2">
                  <InputLabel label="Nama Panggilan *" icon={User} />
                  <input type="text" name="nama_panggilan" required value={formData.nama_panggilan} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#242467] outline-none text-black bg-white font-medium" placeholder="Contoh: Budi" />
                </div>
                <div className="space-y-2">
                  <InputLabel label="Tempat Lahir *" icon={MapPin} />
                  <input type="text" name="tempat_lahir" required value={formData.tempat_lahir} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#242467] outline-none text-black bg-white font-medium" placeholder="Kota kelahiran" />
                </div>
                <div className="space-y-2">
                  <InputLabel label="Tanggal Lahir *" icon={Calendar} />
                  <input type="date" name="tanggal_lahir" required max={new Date().toISOString().split('T')[0]} value={formData.tanggal_lahir} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#242467] outline-none text-black bg-white font-medium" />
                </div>
                <div className="space-y-2">
                  <InputLabel label="Jenis Kelamin *" />
                  <select name="jenis_kelamin" required value={formData.jenis_kelamin} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#242467] outline-none text-black bg-white font-medium">
                    <option value="">-- Pilih Jenis Kelamin --</option>
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <InputLabel label="Status Pernikahan *" />
                  <select name="status_pernikahan" required value={formData.status_pernikahan} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#242467] outline-none text-black bg-white font-medium">
                    <option value="">-- Pilih Status --</option>
                    <option value="Lajang">Lajang</option>
                    <option value="Menikah">Menikah</option>
                    <option value="Bercerai">Janda/Duda</option>
                  </select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <InputLabel label="Alamat Sesuai KTP *" />
                  <textarea name="alamat_ktp" required rows={2} value={formData.alamat_ktp} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#242467] outline-none text-black bg-white font-medium resize-y" placeholder="Nama Jalan, RT/RW, Kelurahan, Kecamatan..." />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <InputLabel label="Alamat Domisili Saat Ini *" />
                  <textarea name="alamat_domisili" required rows={2} value={formData.alamat_domisili} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#242467] outline-none text-black bg-white font-medium resize-y" placeholder="Samakan dengan KTP jika tidak ada domisili lain..." />
                </div>

                <div className="space-y-2">
                  <InputLabel label="No. Telepon Rumah / HP *" icon={Phone} />
                  <input type="text" name="no_telp" required value={formData.no_telp} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#242467] outline-none text-black bg-white font-medium" placeholder="Contoh: 08123456789" />
                </div>
                <div className="space-y-2">
                  <InputLabel label="Nama Akun LinkedIn" icon={Briefcase} />
                  <input type="text" name="linkedin" value={formData.linkedin} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#242467] outline-none text-black bg-white font-medium" placeholder="URL atau Nama Profil" />
                </div>

                <div className="space-y-2">
                  <InputLabel label="Agama *" />
                  <input type="text" name="agama" required value={formData.agama} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#242467] outline-none text-black bg-white font-medium" placeholder="Agama" />
                </div>
                <div className="space-y-2">
                  <InputLabel label="Suku Bangsa *" />
                  <input type="text" name="suku_bangsa" required value={formData.suku_bangsa} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#242467] outline-none text-black bg-white font-medium" placeholder="Contoh: Jawa, Sunda, dll." />
                </div>
                <div className="space-y-2">
                  <InputLabel label="Golongan Darah *" icon={Heart} />
                  <select name="golongan_darah" required value={formData.golongan_darah} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#242467] outline-none text-black bg-white font-medium">
                    <option value="">-- Pilih --</option>
                    <option value="A">A</option><option value="B">B</option><option value="AB">AB</option><option value="O">O</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <InputLabel label="Kendaraan Pribadi *" icon={Car} />
                  <div className="flex flex-wrap gap-4 p-3.5 border border-gray-300 rounded-xl bg-white">
                    {["Motor", "Mobil", "Tidak Ada"].map((opt) => (
                      <label key={opt} className="flex items-center space-x-2.5 cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors">
                        <input 
                          type="checkbox" 
                          value={opt} 
                          suppressHydrationWarning 
                          checked={formData.kendaraan_pribadi.includes(opt)} 
                          onChange={(e) => handleCheckboxArray(e, "kendaraan_pribadi")} 
                          className="w-5 h-5 text-[#242467] rounded border-gray-300 focus:ring-[#242467] cursor-pointer" 
                        />
                        <span className="text-black font-medium text-sm md:text-base">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <InputLabel label="Size Baju *" />
                  <input type="text" name="size_baju" required value={formData.size_baju} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#242467] outline-none text-black bg-white font-medium" placeholder="S / M / L / XL" />
                </div>
                <div className="space-y-2">
                  <InputLabel label="Size Sepatu (EU) *" />
                  <input type="number" name="size_sepatu" required value={formData.size_sepatu} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#242467] outline-none text-black bg-white font-medium" placeholder="Contoh: 42" />
                </div>
                <div className="space-y-2">
                  <InputLabel label="Tinggi Badan (cm) *" icon={Ruler} />
                  <input type="number" name="tinggi_badan" required value={formData.tinggi_badan} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#242467] outline-none text-black bg-white font-medium" placeholder="Contoh: 170" />
                </div>
                <div className="space-y-2">
                  <InputLabel label="Berat Badan (kg) *" />
                  <input type="number" name="berat_badan" required value={formData.berat_badan} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#242467] outline-none text-black bg-white font-medium" placeholder="Contoh: 65" />
                </div>

               <div className="space-y-2">
                  <InputLabel label="Dapat Mengendarai *" />
                  <div className="flex flex-wrap gap-4 p-3.5 border border-gray-300 rounded-xl bg-white h-[60px] items-center">
                    {["Motor", "Mobil", "Tidak Bisa"].map((opt) => (
                      <label key={opt} className="flex items-center space-x-2.5 cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors">
                        <input 
                          type="checkbox" 
                          value={opt} 
                          checked={formData.dapat_mengendarai.includes(opt)} 
                          onChange={(e) => handleCheckboxArray(e, "dapat_mengendarai")} 
                          className="w-5 h-5 text-[#242467] rounded border-gray-300 focus:ring-[#242467] cursor-pointer" 
                        />
                        <span className="text-black font-medium text-sm md:text-base">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <InputLabel label="Memiliki SIM *" icon={CreditCard} />
                  <div className="flex flex-wrap gap-4 p-3.5 border border-gray-300 rounded-xl bg-white min-h-[60px] items-center">
                    {["SIM A", "SIM B", "SIM C", "Tidak Ada"].map((opt) => (
                      <label key={opt} className="flex items-center space-x-2.5 cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors">
                        <input 
                          type="checkbox" 
                          value={opt} 
                          checked={formData.memiliki_sim.includes(opt)} 
                          onChange={(e) => handleCheckboxArray(e, "memiliki_sim")} 
                          className="w-5 h-5 text-[#242467] rounded border-gray-300 focus:ring-[#242467] cursor-pointer" 
                        />
                        <span className="text-black font-medium text-sm md:text-base">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <InputLabel label="Kegiatan di Waktu Luang / Hobi *" />
                  <textarea name="kegiatan_luang" required rows={2} value={formData.kegiatan_luang} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#242467] outline-none text-black bg-white font-medium resize-y" placeholder="Hobi atau kegiatan..." />
                </div>

                <div className="space-y-2">
                  <InputLabel label="Mengetahui Info Lowongan Dari *" />
                    <input type="info_lowongan" name="info_lowongan" required value={formData.info_lowongan} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#242467] outline-none text-black bg-white font-medium" placeholder="Contoh: Keluarga" />
                </div>
               <div className="space-y-2">
                  <InputLabel label="Gaji yang Diharapkan *" />
                  <input 
                    type="text" 
                    inputMode="numeric"
                    name="gaji_diharapkan" 
                    required 
                    value={formData.gaji_diharapkan} 
                    onChange={(e) => {
                      const onlyNumbers = e.target.value.replace(/\D/g, '');
                      setFormData({ ...formData, gaji_diharapkan: onlyNumbers });
                    }} 
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#242467] outline-none text-black bg-white font-medium" 
                    placeholder="Contoh: 5000000" 
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <InputLabel label="Tanggal Siap Bergabung *" icon={Calendar} />
                  <input type="date" name="tanggal_siap_bergabung" required min={new Date().toISOString().split('T')[0]} value={formData.tanggal_siap_bergabung} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#242467] outline-none text-black bg-white font-medium md:w-1/2" />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-8 border-b-2 border-gray-100 pb-4">
                <h2 className="text-xl font-black text-[#242467] uppercase tracking-wider flex items-center">
                  <span className="bg-[#242467] text-white w-8 h-8 rounded-lg flex items-center justify-center mr-3 text-lg">B</span> 
                  Latar Belakang Keluarga
                </h2>
              </div>
              
              <div className="space-y-10">
                <div>
                  <h3 className="font-bold text-gray-800 mb-4 text-lg border-l-4 border-[#242467] pl-3">1. Data Orang Tua *</h3>
                  <div className="space-y-6">
                    <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100">
                      <h4 className="font-bold text-[#242467] mb-4 flex items-center border-b border-blue-200 pb-2"><User className="w-5 h-5 mr-2"/> Data Ayah *</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="md:col-span-2">
                          <InputLabel label="Nama Lengkap *" />
                          <input type="text" className="w-full p-3 border border-gray-300 rounded-xl text-black bg-white outline-none focus:ring-2 focus:ring-[#242467]" value={formData.ayah.nama} onChange={(e) => setFormData({...formData, ayah: {...formData.ayah, nama: e.target.value}})} />
                        </div>
                        <div className="md:col-span-2">
                          <InputLabel label="Alamat *" />
                          <textarea className="w-full p-3 border border-gray-300 rounded-xl text-black bg-white outline-none focus:ring-2 focus:ring-[#242467] resize-y" rows={2} value={formData.ayah.alamat} onChange={(e) => setFormData({...formData, ayah: {...formData.ayah, alamat: e.target.value}})} />
                        </div>
                        <div>
                          <InputLabel label="Pendidikan Terakhir / Pekerjaan *" />
                          <input type="text" className="w-full p-3 border border-gray-300 rounded-xl text-black bg-white outline-none focus:ring-2 focus:ring-[#242467]" value={formData.ayah.pekerjaan} onChange={(e) => setFormData({...formData, ayah: {...formData.ayah, pekerjaan: e.target.value}})} />
                        </div>
                        <div>
                          <InputLabel label="No. Telepon *" />
                          <input 
                            type="text" 
                            inputMode="numeric"
                            className="w-full p-3 border border-gray-300 rounded-xl text-black bg-white outline-none focus:ring-2 focus:ring-[#242467]" 
                            value={formData.ayah.hp} 
                            onChange={(e) => {
                              const onlyNumbers = e.target.value.replace(/\D/g, '');
                              setFormData({...formData, ayah: {...formData.ayah, hp: onlyNumbers}});
                            }} 
                            placeholder="Contoh: 08123456789"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-pink-50/50 rounded-2xl border border-pink-100">
                      <h4 className="font-bold text-pink-900 mb-4 flex items-center border-b border-pink-200 pb-2"><User className="w-5 h-5 mr-2"/> Data Ibu *</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="md:col-span-2">
                          <InputLabel label="Nama Lengkap *" />
                          <input type="text" className="w-full p-3 border border-gray-300 rounded-xl text-black bg-white outline-none focus:ring-2 focus:ring-pink-700" value={formData.ibu.nama} onChange={(e) => setFormData({...formData, ibu: {...formData.ibu, nama: e.target.value}})} />
                        </div>
                        <div className="md:col-span-2">
                          <InputLabel label="Alamat *" />
                          <textarea className="w-full p-3 border border-gray-300 rounded-xl text-black bg-white outline-none focus:ring-2 focus:ring-pink-700 resize-y" rows={2} value={formData.ibu.alamat} onChange={(e) => setFormData({...formData, ibu: {...formData.ibu, alamat: e.target.value}})} />
                        </div>
                        <div>
                          <InputLabel label="Pendidikan Terakhir / Pekerjaan *" />
                          <input type="text" className="w-full p-3 border border-gray-300 rounded-xl text-black bg-white outline-none focus:ring-2 focus:ring-pink-700" value={formData.ibu.pekerjaan} onChange={(e) => setFormData({...formData, ibu: {...formData.ibu, pekerjaan: e.target.value}})} />
                        </div>
                        <div>
                          <InputLabel label="No. Telepon *" />
                          <input 
                            type="text" 
                            inputMode="numeric" 
                            className="w-full p-3 border border-gray-300 rounded-xl text-black bg-white outline-none focus:ring-2 focus:ring-[#242467]" 
                            value={formData.ibu.hp} 
                            onChange={(e) => {
                              const onlyNumbers = e.target.value.replace(/\D/g, '');
                              setFormData({...formData, ibu: {...formData.ibu, hp: onlyNumbers}});
                            }} 
                            placeholder="Contoh: 08123456789"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <h3 className="font-bold text-gray-800 mb-4 text-lg border-l-4 border-indigo-600 pl-3">2. Data Suami / Istri & Anak (Jika Sudah Menikah)</h3>
                  
                  <div className="mb-6 p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                    <h4 className="font-bold text-indigo-900 mb-4 flex items-center border-b border-indigo-200 pb-2"><User className="w-5 h-5 mr-2"/> Data Suami / Istri</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="md:col-span-2">
                        <InputLabel label="Nama Lengkap" />
                        <input type="text" className="w-full p-3 border border-gray-300 rounded-xl text-black bg-white outline-none focus:ring-2 focus:ring-indigo-600" value={formData.suami_istri.nama} onChange={(e) => setFormData({...formData, suami_istri: {...formData.suami_istri, nama: e.target.value}})} />
                      </div>
                      <div className="md:col-span-2">
                        <InputLabel label="Alamat" />
                        <textarea className="w-full p-3 border border-gray-300 rounded-xl text-black bg-white outline-none focus:ring-2 focus:ring-indigo-600 resize-y" rows={2} value={formData.suami_istri.alamat} onChange={(e) => setFormData({...formData, suami_istri: {...formData.suami_istri, alamat: e.target.value}})} />
                      </div>
                      <div>
                        <InputLabel label="Pendidikan Terakhir / Pekerjaan" />
                        <input type="text" className="w-full p-3 border border-gray-300 rounded-xl text-black bg-white outline-none focus:ring-2 focus:ring-indigo-600" value={formData.suami_istri.pekerjaan} onChange={(e) => setFormData({...formData, suami_istri: {...formData.suami_istri, pekerjaan: e.target.value}})} />
                      </div>
                      <div>
                          <InputLabel label="No. Telepon" />
                          <input 
                            type="text" 
                            inputMode="numeric" 
                            className="w-full p-3 border border-gray-300 rounded-xl text-black bg-white outline-none focus:ring-2 focus:ring-[#242467]" 
                            value={formData.suami_istri.hp} 
                            onChange={(e) => {
                              const onlyNumbers = e.target.value.replace(/\D/g, '');
                              setFormData({...formData, suami_istri: {...formData.suami_istri, hp: onlyNumbers}});
                            }} 
                            placeholder="Contoh: 08123456789"
                          />
                        </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {formData.anak.map((child, index) => (
                      <div key={index} className="p-6 bg-gray-50 rounded-2xl border border-gray-200 relative">
                        {index > 0 && (
                          <button 
                            type="button" 
                            onClick={() => {
                              const newAnak = [...formData.anak];
                              newAnak.splice(index, 1);
                              setFormData({ ...formData, anak: newAnak });
                            }} 
                            className="absolute top-4 right-4 text-red-500 hover:bg-red-100 p-2 rounded-lg transition-colors"
                            title="Hapus Anak"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                        <h4 className="font-bold text-gray-800 mb-4 flex items-center border-b border-gray-200 pb-2"><User className="w-5 h-5 mr-2 text-gray-500"/> Data Anak Ke-{index + 1}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="md:col-span-2">
                            <InputLabel label="Nama Lengkap" />
                            <input type="text" className="w-full p-3 border border-gray-300 rounded-xl text-black bg-white outline-none focus:ring-2 focus:ring-gray-400" 
                              value={child.nama} 
                              onChange={(e) => {
                                const newAnak = [...formData.anak];
                                newAnak[index].nama = e.target.value;
                                setFormData({...formData, anak: newAnak});
                              }} 
                            />
                          </div>
                          <div className="md:col-span-2">
                            <InputLabel label="Alamat" />
                            <textarea className="w-full p-3 border border-gray-300 rounded-xl text-black bg-white outline-none focus:ring-2 focus:ring-gray-400 resize-y" rows={2} 
                              value={child.alamat} 
                              onChange={(e) => {
                                const newAnak = [...formData.anak];
                                newAnak[index].alamat = e.target.value;
                                setFormData({...formData, anak: newAnak});
                              }} 
                            />
                          </div>
                          <div>
                            <InputLabel label="Pendidikan Terakhir / Pekerjaan" />
                            <input type="text" className="w-full p-3 border border-gray-300 rounded-xl text-black bg-white outline-none focus:ring-2 focus:ring-gray-400" 
                              value={child.pekerjaan} 
                              onChange={(e) => {
                                const newAnak = [...formData.anak];
                                newAnak[index].pekerjaan = e.target.value;
                                setFormData({...formData, anak: newAnak});
                              }} 
                            />
                          </div>
                            <div>
                          <InputLabel label="No. Telepon" />
                          <input type="text" inputMode="numeric" className="w-full p-3 border border-gray-300 rounded-xl text-black bg-white outline-none focus:ring-2 focus:ring-gray-400" 
                            value={child.hp} 
                            onChange={(e) => {
                                const newAnak = [...formData.anak];
                                const onlyNumbers = e.target.value.replace(/\D/g, '');
                                newAnak[index].hp = e.target.value;
                                setFormData({...formData, anak: newAnak, no_telp: onlyNumbers});
                              }} 
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <div className="mt-4 flex flex-col items-start">
                {formData.anak.length < 4 ? (
                    <button 
                      type="button" 
                      onClick={() => setFormData({...formData, anak: [...formData.anak, { nama: "", alamat: "", pekerjaan: "", hp: "", isFixed: false  }]})} 
                      className="flex items-center text-sm font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-2" /> Tambah Data Anak
                    </button>
                    ) : (
                  <p className="text-sm text-red-500 font-medium flex items-center bg-red-50 px-4 py-2.5 rounded-xl border border-red-100 mt-2">
                    <AlertCircle className="w-5 h-5 mr-2 shrink-0" /> 
                    Batas maksimal telah tercapai.
                  </p>
                  )}
                  </div>
                </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-8 border-b-2 border-gray-100 pb-4">
                <h2 className="text-xl font-black text-[#242467] uppercase tracking-wider flex items-center">
                  <span className="bg-[#242467] text-white w-8 h-8 rounded-lg flex items-center justify-center mr-3 text-lg">C</span> 
                  Riwayat Pendidikan
                </h2>
              </div>
              
              <div className="mb-10">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center"><GraduationCap className="mr-2"/> 1. Pendidikan Formal</h3>
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-[#242467] text-white">
                      <tr>
                        <th className="p-3">Tingkat</th>
                        <th className="p-3">Nama Sekolah</th>
                        <th className="p-3">Jurusan</th>
                        <th className="p-3 w-24">Masuk</th>
                        <th className="p-3 w-24">Lulus</th>
                        <th className="p-3 w-24">IPK</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {formData.pendidikan_formal.map((edu, idx) => (
                        <tr key={idx} className="bg-white hover:bg-gray-50">
                          <td className="p-2 font-bold text-center text-gray-700 bg-gray-50">{edu.tingkat}</td>
                          <td className="p-2">
                            <input type="text" value={edu.sekolah} onChange={(e) => { const newEdu = [...formData.pendidikan_formal]; newEdu[idx].sekolah = e.target.value; setFormData({...formData, pendidikan_formal: newEdu}); }} className="w-full p-2 border border-gray-300 rounded-lg text-black outline-none focus:border-[#242467]" />
                          </td>
                          <td className="p-2">
                            <input type="text" value={edu.jurusan} onChange={(e) => { const newEdu = [...formData.pendidikan_formal]; newEdu[idx].jurusan = e.target.value; setFormData({...formData, pendidikan_formal: newEdu}); }} className="w-full p-2 border border-gray-300 rounded-lg text-black outline-none focus:border-[#242467]" />
                          </td>
                          <td className="p-2">
                            <input type="number" value={edu.masuk} onChange={(e) => { const newEdu = [...formData.pendidikan_formal]; newEdu[idx].masuk = e.target.value; setFormData({...formData, pendidikan_formal: newEdu}); }} className="w-full p-2 border border-gray-300 rounded-lg text-black outline-none focus:border-[#242467] text-center" placeholder="Tahun" />
                          </td>
                          <td className="p-2">
                            <input type="number" value={edu.lulus} onChange={(e) => { const newEdu = [...formData.pendidikan_formal]; newEdu[idx].lulus = e.target.value; setFormData({...formData, pendidikan_formal: newEdu}); }} className="w-full p-2 border border-gray-300 rounded-lg text-black outline-none focus:border-[#242467] text-center" placeholder="Tahun" />
                          </td>
                          <td className="p-2">
                            <input type="text" value={edu.ipk} onChange={(e) => { const newEdu = [...formData.pendidikan_formal]; newEdu[idx].ipk = e.target.value; setFormData({...formData, pendidikan_formal: newEdu}); }} className="w-full p-2 border border-gray-300 rounded-lg text-black outline-none focus:border-[#242467] text-center" placeholder="0.00" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-gray-800 mb-4 flex items-center"><Star className="mr-2"/> 2. Kursus / Seminar / Sertifikat (yang berhubungan dengan pekerjaan)</h3>
                <div className="space-y-3">
                  {formData.kursus.map((k, idx) => (
                    <div key={idx} className="flex flex-col md:flex-row gap-3 relative group">
                      <input 
                        type="text" 
                        placeholder="Tema / Judul" 
                        value={k.tema}
                        onChange={(e) => { const newKursus = [...formData.kursus]; newKursus[idx].tema = e.target.value; setFormData({...formData, kursus: newKursus}); }}
                        className="flex-1 p-3 border border-gray-300 rounded-xl text-black outline-none focus:ring-2 focus:ring-[#242467]" 
                      />
                      <input 
                        type="text" 
                        placeholder="Penyelenggara" 
                        value={k.penyelenggara}
                        onChange={(e) => { const newKursus = [...formData.kursus]; newKursus[idx].penyelenggara = e.target.value; setFormData({...formData, kursus: newKursus}); }}
                        className="flex-1 p-3 border border-gray-300 rounded-xl text-black outline-none focus:ring-2 focus:ring-[#242467]" 
                      />
                      <div className="flex gap-2 w-full md:w-auto">
                        <input 
                          type="number" 
                          placeholder="Tahun" 
                          value={k.tahun}
                          onChange={(e) => { const newKursus = [...formData.kursus]; newKursus[idx].tahun = e.target.value; setFormData({...formData, kursus: newKursus}); }}
                          className="w-full md:w-32 p-3 border border-gray-300 rounded-xl text-black outline-none focus:ring-2 focus:ring-[#242467] text-center" 
                        />
                        
                        {formData.kursus.length > 1 && (
                          <button 
                            type="button"
                            onClick={() => {
                              const newKursus = [...formData.kursus];
                              newKursus.splice(idx, 1);
                              setFormData({ ...formData, kursus: newKursus });
                            }}
                            className="bg-red-50 text-red-500 hover:bg-red-100 p-3 rounded-xl transition-colors border border-red-100"
                            title="Hapus Kursus"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                 <div className="mt-4 flex flex-col items-start">
                {formData.kursus.length < 6 ? (
                  <button 
                    type="button" 
                    onClick={() => setFormData({
                      ...formData,
                      kursus: [...formData.kursus, { tema: "", penyelenggara: "", tahun: "" , isFixed: false}]
                    })}
                    className="text-[#242467] text-sm font-bold flex items-center px-5 py-2.5 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors border border-blue-100 shadow-sm"
                  >
                    <Plus className="w-4 h-4 mr-2"/> Tambah Baris Kursus
                  </button>
                ) : (
                  <p className="text-sm text-red-500 font-medium flex items-center bg-red-50 px-4 py-2.5 rounded-xl border border-red-100 mt-2">
                    <AlertCircle className="w-5 h-5 mr-2 shrink-0" /> 
                    Batas maksimal 6 kursus/seminar/sertifikat telah tercapai.
                  </p>
                )}
              </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-8 border-b-2 border-gray-100 pb-4">
                <h2 className="text-xl font-black text-[#242467] uppercase tracking-wider flex items-center">
                  <span className="bg-[#242467] text-white w-8 h-8 rounded-lg flex items-center justify-center mr-3 text-lg">D</span> 
                  Pengalaman Pekerjaan
                </h2>
                <p className="text-sm text-red-500 mt-2 font-medium">* Mulai dari pekerjaan terakhir. Wajib diisi jika memiliki pengalaman.</p>
              </div>

              <div className="mb-8 bg-blue-50 p-5 rounded-2xl border border-blue-200 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-[#242467] text-lg">Belum Memiliki Pengalaman Kerja?</h4>
                  <p className="text-sm text-blue-800 mt-1">Jika Anda seorang <b>Fresh Graduate</b>, klik tombol di samping agar sistem otomatis mengisi kolom Pekerjaan 1.</p>
                </div>
                <button 
                  type="button"
                  onClick={() => {
                    const today = new Date().toISOString().split('T')[0];
                    const newPengalaman = [...formData.pengalaman_kerja];
                    newPengalaman[0] = {
                      perusahaan: "Fresh Graduate",
                      usaha: "-",
                      jabatan: "-",
                      gaji: "0",
                      lama_kerja: "0",
                      start_date: today,
                      end_date: today,
                      atasan: "-",
                      jab_atasan: "-",
                      hp_atasan: "0000",
                      tugas: ["-", "", "", "", ""],
                      alasan_berhenti: "Belum pernah bekerja"
                    };
                    setFormData({ ...formData, pengalaman_kerja: newPengalaman });
    showDialog("Berhasil", "Data Pekerjaan 1 telah diisi otomatis sebagai Fresh Graduate. Anda bisa klik Lanjut.", true); 
                  }}
                  className="w-full md:w-auto shrink-0 bg-[#242467] hover:bg-[#1a1a52] text-white px-5 py-3 rounded-xl font-bold shadow-md transition-all hover:-translate-y-0.5"
                >
                  Saya Fresh Graduate
                </button>
              </div>
              
              <div className="space-y-10">
                {formData.pengalaman_kerja.map((job, idx) => (
                  <div key={idx} className="p-6 md:p-8 border-2 border-gray-200 rounded-2xl relative bg-gray-50/50 shadow-sm">
                    <span className="absolute -top-4 left-6 bg-[#242467] text-white px-4 py-1.5 rounded-full font-bold text-sm shadow-md">
                      Pekerjaan {idx + 1}
                    </span>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-4">
                      <div className="md:col-span-2">
                        <InputLabel label="Nama Perusahaan" />
                        <input
                          type="text"
                          value={job.perusahaan}
                          onChange={(e) => updatePengalamanKerjaField(idx, "perusahaan", e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-xl text-black bg-white outline-none focus:ring-2 focus:ring-[#242467]"
                        />
                      </div>
                      <div>
                        <InputLabel label="Jenis Usaha" />
                        <input
                          type="text"
                          value={job.usaha}
                          onChange={(e) => updatePengalamanKerjaField(idx, "usaha", e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-xl text-black bg-white outline-none focus:ring-2 focus:ring-[#242467]"
                        />
                      </div>
                      <div>
                        <InputLabel label="Posisi / Jabatan" />
                        <input
                          type="text"
                          value={job.jabatan}
                          onChange={(e) => updatePengalamanKerjaField(idx, "jabatan", e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-xl text-black bg-white outline-none focus:ring-2 focus:ring-[#242467]"
                        />
                      </div>
                      <div>
                        <InputLabel label="Gaji Terakhir" />
                        <input
                          type="text"
                          inputMode="numeric"
                          value={job.gaji}
                          onChange={(e) => {
                            const onlyNumbers = e.target.value.replace(/\D/g, '');
                            updatePengalamanKerjaField(idx, "gaji", onlyNumbers);
                          }}
                          className="w-full p-3 border border-gray-300 rounded-xl text-black bg-white outline-none focus:ring-2 focus:ring-[#242467]"
                          placeholder="Contoh: 4500000"
                        />
                      </div>
                      <div>
                        <InputLabel label="Tanggal Mulai Bekerja" />
                        <input
                          type="date"
                          value={job.start_date}
                          onChange={(e) => updatePengalamanKerjaField(idx, "start_date", e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-xl text-black bg-white outline-none focus:ring-2 focus:ring-[#242467]"
                        />
                      </div>
                      <div>
                        <InputLabel label="Tanggal Berhenti / Sekarang" />
                        <input
                          type="date"
                          value={job.end_date}
                          onChange={(e) => updatePengalamanKerjaField(idx, "end_date", e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-xl text-black bg-white outline-none focus:ring-2 focus:ring-[#242467]"
                        />
                      </div>
                      
                      <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-5 bg-white p-5 rounded-xl border border-blue-100 shadow-sm">
                         <div className="col-span-1 md:col-span-3 text-xs font-bold text-[#242467] uppercase tracking-wider border-b border-gray-100 pb-2">Referensi Atasan</div>
                         <div>
                           <InputLabel label="Nama Atasan" />
                           <input
                             type="text"
                             value={job.atasan}
                             onChange={(e) => updatePengalamanKerjaField(idx, "atasan", e.target.value)}
                             className="w-full p-3 border border-gray-300 rounded-xl text-black outline-none focus:ring-2 focus:ring-[#242467]"
                           />
                         </div>
                         <div>
                           <InputLabel label="Jabatan Atasan" />
                           <input
                             type="text"
                             value={job.jab_atasan}
                             onChange={(e) => updatePengalamanKerjaField(idx, "jab_atasan", e.target.value)}
                             className="w-full p-3 border border-gray-300 rounded-xl text-black outline-none focus:ring-2 focus:ring-[#242467]"
                           />
                         </div>
                         <div>
                           <InputLabel label="No. Telepon Atasan" />
                           <input
                             type="text"
                             value={job.hp_atasan}
                             onChange={(e) => updatePengalamanKerjaField(idx, "hp_atasan", e.target.value)}
                             className="w-full p-3 border border-gray-300 rounded-xl text-black outline-none focus:ring-2 focus:ring-[#242467]"
                           />
                         </div>
                      </div>
                      
                      <div className="md:col-span-3">
                        <InputLabel label="Uraian Tugas (Sebutkan 5 tugas utama)" />
                        <div className="grid grid-cols-1 gap-3 bg-white p-5 rounded-xl border border-gray-200">
                          {[1,2,3,4,5].map(n => (
                            <div key={n} className="flex items-center">
                              <span className="mr-3 text-[#242467] font-bold bg-blue-50 w-6 h-6 flex items-center justify-center rounded-md">{n}</span>
                              <input
                                type="text"
                                value={job.tugas[n - 1]}
                                onChange={(e) => updatePengalamanKerjaTask(idx, n - 1, e.target.value)}
                                className="flex-1 p-2 border-b border-gray-300 focus:border-[#242467] outline-none text-black bg-transparent font-medium"
                                placeholder="..."
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="md:col-span-3">
                        <InputLabel label="Alasan Berhenti" />
                        <textarea
                          className="w-full p-3 border border-gray-300 rounded-xl text-black bg-white outline-none focus:ring-2 focus:ring-[#242467] resize-y"
                          rows={2}
                          value={job.alasan_berhenti}
                          onChange={(e) => updatePengalamanKerjaField(idx, "alasan_berhenti", e.target.value)}
                        ></textarea>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-8 border-b-2 border-gray-100 pb-4">
                <h2 className="text-xl font-black text-[#242467] uppercase tracking-wider flex items-center">
                  <span className="bg-[#242467] text-white w-8 h-8 rounded-lg flex items-center justify-center mr-3 text-lg">E</span> 
                  Bidang Keahlian
                </h2>
                <p className="text-sm text-gray-500 mt-2">Pilih level kemampuan Anda pada bidang berikut, dan tambahkan kemampuan khusus lainnya jika ada.</p>
              </div>
              
              <div className="overflow-x-auto border border-gray-200 rounded-2xl shadow-sm">
                <table className="w-full text-left min-w-[600px]">
                  <thead className="bg-[#242467] text-white">
                    <tr>
                      <th className="p-4 font-semibold w-1/3">Kemampuan Khusus</th>
                      <th className="p-4 font-semibold w-40">Level</th>
                      <th className="p-4 font-semibold">Keterangan</th>
                      <th className="p-4 font-semibold w-16 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {formData.keahlian.map((skill, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="p-4">
                          {skill.isFixed ? (
                            <span className="font-bold text-gray-800 text-base">{skill.kemampuan}</span>
                          ) : (
                            <input 
                              type="text" 
                              value={skill.kemampuan}
                              onChange={(e) => {
                                const newKeahlian = [...formData.keahlian];
                                newKeahlian[idx].kemampuan = e.target.value;
                                setFormData({...formData, keahlian: newKeahlian});
                              }}
                              className="w-full p-2.5 border border-gray-300 rounded-lg text-black outline-none focus:border-[#242467] font-medium" 
                              placeholder="Sebutkan kemampuan lainnya..." 
                            />
                          )}
                        </td>
                        <td className="p-3">
                          <select 
                            value={skill.level}
                            onChange={(e) => {
                              const newKeahlian = [...formData.keahlian];
                              newKeahlian[idx].level = e.target.value;
                              setFormData({...formData, keahlian: newKeahlian});
                            }}
                            className="w-full p-2.5 border border-gray-300 rounded-lg text-black bg-white outline-none focus:border-[#242467] font-medium"
                          >
                            <option value="">Pilih--</option>
                            <option value="Mahir">Mahir</option>
                            <option value="Sedang">Sedang</option>
                            <option value="Kurang">Kurang</option>
                          </select>
                        </td>
                        <td className="p-3">
                          <input 
                            type="text" 
                            value={skill.keterangan}
                            onChange={(e) => {
                              const newKeahlian = [...formData.keahlian];
                              newKeahlian[idx].keterangan = e.target.value;
                              setFormData({...formData, keahlian: newKeahlian});
                            }}
                            className="w-full p-2.5 border border-gray-300 rounded-lg text-black outline-none focus:border-[#242467]" 
                            placeholder="..." 
                          />
                        </td>
                        <td className="p-3 text-center">
                          {!skill.isFixed && (
                            <button 
                              type="button"
                              onClick={() => {
                                const newKeahlian = [...formData.keahlian];
                                newKeahlian.splice(idx, 1);
                                setFormData({ ...formData, keahlian: newKeahlian });
                              }}
                              className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                              title="Hapus Baris"
                            >
                              <Trash2 className="w-5 h-5 mx-auto" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex flex-col items-start">
                {formData.keahlian.filter(k => !k.isFixed).length < 7 ? (
                  <button 
                    type="button" 
                    onClick={() => setFormData({
                      ...formData,
                      keahlian: [...formData.keahlian, { kemampuan: "", level: "", keterangan: "", isFixed: false }]
                    })}
                    className="text-[#242467] text-sm font-bold flex items-center px-5 py-2.5 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors border border-blue-100 shadow-sm"
                  >
                    <Plus className="w-4 h-4 mr-2"/> Tambah Kemampuan Lainnya
                  </button>
                ) : (
                  <p className="text-sm text-red-500 font-medium flex items-center bg-red-50 px-4 py-2 rounded-lg border border-red-100">
                    <AlertCircle className="w-4 h-4 mr-2" /> 
                    Batas maksimal 7 kemampuan tambahan telah tercapai.
                  </p>
                )}
              </div>

            </div>
          )}

          {step === 6 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-8 border-b-2 border-gray-100 pb-4">
                <h2 className="text-xl font-black text-[#242467] uppercase tracking-wider flex items-center">
                  <span className="bg-[#242467] text-white w-8 h-8 rounded-lg flex items-center justify-center mr-3 text-lg">F</span> 
                  Informasi Umum
                </h2>
              </div>
              
             <div className="space-y-4 mb-12">
                {formData.info_umum.map((q, idx) => (
                  <div key={idx} className="p-5 border border-gray-200 rounded-2xl bg-white shadow-sm flex flex-col md:flex-row gap-4 justify-between md:items-start">
                    <p className="font-bold text-gray-800 flex-1 mt-1">{idx+1}. {q.pertanyaan}</p>
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center shrink-0">
                      
                      
                      <div className="flex space-x-4 bg-gray-100 p-2 rounded-xl">
                        <label className="flex items-center text-black font-medium cursor-pointer">
                          <input 
                            type="radio" 
                            name={`q_${idx}`} 
                            value="Ya"
                            checked={q.jawaban === "Ya"}
                            onChange={(e) => {
                              const newInfo = [...formData.info_umum];
                              newInfo[idx].jawaban = e.target.value;
                              setFormData({ ...formData, info_umum: newInfo });
                            }}
                            className="mr-2 w-4 h-4 text-[#242467] focus:ring-[#242467] cursor-pointer"
                          /> Ya
                        </label>
                        <label className="flex items-center text-black font-medium cursor-pointer">
                          <input 
                            type="radio" 
                            name={`q_${idx}`} 
                            value="Tidak"
                            checked={q.jawaban === "Tidak"}
                            onChange={(e) => {
                              const newInfo = [...formData.info_umum];
                              newInfo[idx].jawaban = e.target.value;
                              newInfo[idx].penjelasan = ""; // Otomatis hapus penjelasan jika pilih Tidak
                              setFormData({ ...formData, info_umum: newInfo });
                            }}
                            className="mr-2 w-4 h-4 text-[#242467] focus:ring-[#242467] cursor-pointer"
                          /> Tidak
                        </label>
                      </div>

                
                      <input 
                        type="text" 
                        placeholder="Penjelasan (Jika 'Ya')" 
                        value={q.penjelasan}
                        onChange={(e) => {
                          const newInfo = [...formData.info_umum];
                          newInfo[idx].penjelasan = e.target.value;
                          setFormData({ ...formData, info_umum: newInfo });
                        }}
                        disabled={q.jawaban === "Tidak"} // Terkunci otomatis jika pilih Tidak
                        className="w-full md:w-64 p-2.5 border border-gray-300 rounded-xl text-black text-sm outline-none focus:border-[#242467] disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors" 
                      />

                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 md:p-8 bg-[#242467]/5 border-2 border-[#242467] rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#242467]/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
                <h3 className="text-lg font-black text-[#242467] mb-4 flex items-center uppercase tracking-wider"><CheckCircle2 className="mr-2 w-6 h-6"/> Pernyataan Kandidat</h3>
                <p className="text-base text-gray-800 leading-relaxed italic font-medium">
                  "Saya telah membaca atau memahami sepenuhnya isi formulir dan menyatakan/menyetujui bahwa
                  semua keterangan jawaban dan pernyataan dalam formulir ini diberikan dengan
                  benar dan lengkap. Bila dikemudian hari terbukti ada informasi yang tidak
                  benar, maka saya bersedia menerima konsekuensi legal apapun."
                </p>
                <label className="mt-8 flex items-center p-4 bg-white rounded-xl cursor-pointer hover:bg-gray-50 border-2 border-transparent hover:border-gray-200 transition-all shadow-sm">
                  <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="w-6 h-6 mr-4 text-[#242467] rounded focus:ring-[#242467]" />
                  <span className="text-base font-bold text-gray-900">Ya, Saya Setuju dan Menjamin kebenaran data tersebut.</span>
                </label>
              </div>
            </div>
          )}

          <div className="mt-10 pt-6 border-t border-gray-200 flex flex-col md:flex-row justify-between gap-4">
            <button 
              type="button" 
              onClick={handleBack} 
              disabled={step === 1}
              className={`flex items-center justify-center px-6 py-3.5 rounded-xl font-bold transition-all text-sm md:text-base ${step === 1 ? 'invisible' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'}`}
            >
              <ChevronLeft className="mr-2 w-5 h-5"/> Sebelumnya
            </button>

            {step < 6 ? (
              <button 
                type="button" 
                onClick={handleNext} 
                className="flex items-center justify-center px-10 py-3.5 bg-[#242467] text-white rounded-xl font-bold hover:bg-[#1a1a52] shadow-lg transition-all hover:-translate-y-0.5 text-sm md:text-base"
              >
                Lanjut ke Bagian {String.fromCharCode(65 + step)} <ChevronRight className="ml-2 w-5 h-5"/>
              </button>
            ) : (
              <button 
                type="button" 
                onClick={handleSubmitFinal}
                disabled={isLoading || !agreed}
                className="flex items-center justify-center px-10 py-3.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 text-sm md:text-base"
              >
                {isLoading ? <><Loader2 className="animate-spin mr-2 w-5 h-5"/> Memproses...</> : <><Save className="mr-2 w-5 h-5"/> Simpan Seluruh Data & Selesai</>}
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}