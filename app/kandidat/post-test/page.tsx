"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  FileText,
  ArrowRight,
  ArrowLeft,
  Brain,
  Type,
  Hash,
  Calculator,
  Lightbulb,
  Target,
  Play,
  BarChart3,
  Mail,
  BookOpen,
  Layers,
  Timer as TimerIcon,
  Maximize
} from "lucide-react";


type QuestionType = 'verbal' | 'numerical' | 'logical' | 'personality' | 'visual' | 'memory' | 'essay' | 'disc';

interface ExampleQuestion {
  id: number;
  type: QuestionType;
  question: string;
  options?: string[];
  optionImages?: string[]; 
  correctAnswer?: number;
  explanation: string;
  tips: string[];
  unit?: string;
  correctValue?: number;
  correctText?: string;
  image?: string; 
}

interface SubtestInfo {
  id: number;
  code: string;
  name: string;
  totalQuestions: number;
  duration: number;
  icon: React.ReactNode;
  color: string;
  questionType: QuestionType;
}


const istSubtests: SubtestInfo[] = [
  { id: 1, code: 'SE', name: 'Melengkapi Kalimat', totalQuestions: 20, duration: 6, icon: <Type className="w-6 h-6" />, color: 'bg-blue-600', questionType: 'verbal' },
  { id: 2, code: 'WA', name: 'Melengkapi Kata',  totalQuestions: 20, duration: 6, icon: <BookOpen className="w-6 h-6" />, color: 'bg-indigo-600', questionType: 'verbal' },
  { id: 3, code: 'AN', name: 'Persamaan Kata', totalQuestions: 20, duration: 7, icon: <Brain className="w-6 h-6" />, color: 'bg-purple-600', questionType: 'verbal' },
  { id: 4, code: 'GE', name: 'Sifat yang dimiliki Bersama', totalQuestions: 20, duration: 5, icon: <FileText className="w-6 h-6" />, color: 'bg-pink-600', questionType: 'essay' },
  { id: 5, code: 'RA', name: 'Berhitung', totalQuestions: 20, duration: 8, icon: <Calculator className="w-6 h-6" />, color: 'bg-green-600', questionType: 'numerical' },
  { id: 6, code: 'ZR', name: 'Deret Angka',  totalQuestions: 20, duration: 7, icon: <Hash className="w-6 h-6" />, color: 'bg-teal-600', questionType: 'numerical' },
  { id: 7, code: 'FA', name: 'Memilih Bentuk',  totalQuestions: 20, duration: 8, icon: <Layers className="w-6 h-6" />, color: 'bg-orange-600', questionType: 'visual' },
  { id: 8, code: 'WU', name: 'Latihan Balok',  totalQuestions: 20, duration: 9, icon: <Target className="w-6 h-6" />, color: 'bg-red-600', questionType: 'visual' },
  { id: 9, code: 'ME', name: 'Latihan Simbol',  totalQuestions: 20, duration: 5, icon: <Brain className="w-6 h-6" />, color: 'bg-amber-600', questionType: 'memory' }
];

const availableTests = [
  { code: 'WPT', name: 'Wonderlic Personnel Test', description: 'Mengukur potensi kerja, logika, dan kemampuan analitis', totalQuestions: 50, duration: 12, icon: <Brain className="w-6 h-6" />, color: 'bg-[#242467]' },
  { code: 'Papikostik', name: 'Papikostik', description: 'Tes kepribadian untuk mengukur trait pekerjaan', totalQuestions: 90, duration: 45, icon: <BarChart3 className="w-6 h-6" />, color: 'bg-[#242467]' },
  { code: 'DISC', name: 'DISC Personality Test', description: 'Tes kepribadian DISC untuk profiling perilaku', totalQuestions: 40, duration: 30, icon: <BarChart3 className="w-6 h-6" />, color: 'bg-[#242467]' } 
];

const exampleQuestions: Record<string, ExampleQuestion[]> = {
  verbal: [{
    id: 1, type: 'verbal', question: 'MENUAI adalah lawan kata dari?',
    options: ['1. Mendapat', '2. Bersorak', '3. Melanjutkan', '4. Berada', '5. Menabur'],
    correctAnswer: 4, explanation: 'Jawaban yang benar adalah "Menabur" (pilihan 5). MENUAI = memanen, lawan katanya adalah MENABUR = menanam.',
    tips: ['Pahami makna kata', 'Cari kata yang berlawanan', 'Perhatikan semua opsi']
  }],
  numerical: [{
    id: 2, type: 'numerical', question: 'Harga setiap kotak "paper clip" adalah 23 rupiah. Berapa harga 4 kotak?',
    correctValue: 92, explanation: '23 (harga per kotak) × 4 (jumlah kotak) = 92. Jadi harga 4 kotak adalah Rp 92.',
    tips: ['Gunakan perkalian sederhana', 'Periksa kembali perhitungan', 'Masukkan jawaban dalam bentuk angka tanpa tanda titik atau pemisah ribuan. Contoh: 92.000 ditulis 92.'], unit: 'Rp'
  }],
  logical: [{
    id: 3, type: 'logical', question: 'MINER MINOR - Apakah kata-kata ini',
    options: ['1. memiliki arti sama', '2. memiliki arti berlawanan', '3. tidak memiliki arti sama atau berlawanan'],
    correctAnswer: 2, explanation: 'Jawaban yang benar adalah "tidak memiliki arti sama atau berlawanan" (Nomor 3). MINER = penambang, MINOR = minor/bawahan.',
    tips: ['Perhatikan ejaan', 'Cari hubungan makna']
  }],
  personality: [{
    id: 4, type: 'personality', question: 'Pilihlah pernyataan yang paling mendekati anda:',
    options: ['Saya seorang pekerja "keras"', 'Saya "bukan" seorang pemurung'],
    correctAnswer: -1, explanation: 'Soal kepribadian tidak memiliki jawaban benar atau salah. Pilih yang paling menggambarkan diri Anda.',
    tips: ['Pilih yang sesuai diri', 'Jangan pilih yang seharusnya']
  }],
  DISC: [
    { 
      id: 9901, type: 'disc', question: 'Pilihlah 1 pernyataan yang PALING (P) menggambarkan diri Anda, dan 1 pernyataan yang PALING TIDAK (K) menggambarkan diri Anda.', 
      options: [
        'Gampangan, Mudah menyetujui', 
        'Percaya, Mudah percaya pada orang', 
        'Petualang, Suka mengambil resiko', 
        'Toleran, Menghormati'
      ], 
      correctAnswer: -1, 
      explanation: 'Dalam tes DISC tidak ada jawaban yang salah. Anda harus memilih tepat satu pilihan P (Paling sesuai) dan satu pilihan K (Paling Kurang sesuai). Keduanya tidak boleh berada pada baris yang sama.', 
      tips: ['Jawablah secara jujur dan spontan', 'Ingat, Anda wajib mengisi 1 kolom P dan 1 kolom K'] 
    }
  ],
  SE: [
    { id: 501, type: 'verbal', question: 'Contoh 1: Seekor kuda mempunyai kesamaan terbanyak dengan seekor ...', options: ['1. Kucing', '2. Bajing', '3. Keledai', '4. Lembu', '5. Anjing'], correctAnswer: 2, explanation: 'Keledai adalah hewan yang paling dekat secara klasifikasi dengan kuda (satu keluarga: Equidae)', tips: ['Cari yang paling spesifik, bukan yang sekadar mirip'] },
    { id: 502, type: 'verbal', question: 'Contoh 2: Lawannya "harapan" ialah ...', options: ['1. Duka', '2. Putus Asa', '3. Sengsara', '4. Cinta', '5. Benci'], correctAnswer: 1, explanation: 'Lawan kata dari "harapan" adalah "putus asa" karena harapan berarti optimisme, sedangkan putus asa berarti kehilangan harapan.', tips: ['Tentukan dulu jenis hubungan katanya (antonim/lawan kata).'] }
  ],
  WA: [
    { id: 601, type: 'verbal', question: 'Tentukan satu kata yang TIDAK memiliki kesamaan dengan empat kata lainnya.', options: ['1. Meja', '2. Kursi', '3. Burung', '4. Lemari', '5. Tempat tidur'], correctAnswer: 2, explanation: 'Burung adalah makhluk hidup, sedangkan yang lainnya adalah perabotan.', tips: ['Cari kategori besar yang bisa mengelompokkan 4 kata'] },
    { id: 602, type: 'verbal', question: 'Tentukan satu kata yang TIDAK memiliki kesamaan...', options: ['1. Duduk', '2. Berbaring', '3. Berdiri', '4. Berjalan', '5. Menangis'], correctAnswer: 4, explanation: 'Menangis adalah ekspresi emosi, sementara yang lain adalah aktivitas fisik yang melibatkan gerakan kaki/tubuh.', tips: ['Cari kata yang paling menyimpang dari kelompok'] }
  ],
  AN: [
    { id: 701, type: 'verbal', question: 'Hutan : Pohon = Tembok : ?', options: ['1. Batu bata', '2. Rumah', '3. Semen', '4. Putih', '5. Dinding'], correctAnswer: 0, explanation: 'Hubungan antara hutan dan pohon ialah bahwa hutan terdiri atas pohon-pohon, maka hubungan antara tembok dan salah satu kata pilihan bahwa tembok terdiri atas batu-batu bata.', tips: ['Antara kata pertama dan kata kedua terdapat suatu hubungan tertentu', 'Antara kata ketiga dan salah diantara lima kata pilihan harus pula terdapat hubungan yang sama, maka carilah kata itu'] },
    { id: 702, type: 'verbal', question: 'Gelap : Terang = Basah : ?', options: ['1. Hujan', '2. Hari', '3. Lembab', '4. Angin', '5. Kering'], correctAnswer: 4, explanation: 'Gelap berlawanan dengan terang. Maka lawan dari basah adalah kering.', tips: ['Terapkan pola hubungan (antonim) pada kata berikutnya', 'Antara kata pertama dan kata kedua terdapat suatu hubungan tertentu', 'Antara kata ketiga dan salah diantara lima kata pilihan harus pula terdapat hubungan yang sama, maka carilah kata itu'] }
  ],
  GE: [
    { id: 801, type: 'essay', question: 'Pada setiap pernyataan akan diberikan dua kata. Tugas Anda adalah mencari satu kata yang mencakup atau mewakili pengertian dari kedua kata berikut. Ayam - Itik', correctText: 'Burung', explanation: 'Ayam dan Itik termasuk dalam kelompok hewan jenis Burung atau Unggas.', tips: ['Carilah satu kata yang mencakup kedua kata tersebut.'] },
    { id: 802, type: 'essay', question: 'Pada setiap pernyataan akan diberikan dua kata. Tugas Anda adalah mencari satu kata yang mencakup atau mewakili pengertian dari kedua kata berikut. Gaun - Celana. Carilah satu kata yang mencakup kedua kata tersebut.', correctText: 'Pakaian', explanation: 'Gaun dan celana sama-sama merupakan jenis pakaian.', tips: ['Pikirkan kategori besar dari benda-benda tersebut.'] }
  ],
  RA: [
    { id: 901, type: 'numerical', question: 'Sebatang pensil harganya 25 rupiah. Berapakah harga 3 batang?', correctValue: 75, explanation: 'Total: 3 x Rp 25.000 = Rp 75.000.', tips: ['Hitung total harga terlebih dahulu','Kandidat hanya perlu mengisi dua digit awal dari hasil perhitungan. contoh: 75.000 → 75'], unit: 'Rp' }, 
    { id: 902, type: 'numerical', question: 'Sebuah mobil menempuh jarak 120 km dalam waktu 2 jam. Berapa kecepatannya per jam?', correctValue: 60, explanation: 'Kecepatan = Jarak / Waktu = 120 / 2 = 60 km/jam.', tips: ['Pahami rumus dasar kecepatan', 'Kandidat hanya perlu mengisi dua digit awal dari hasil perhitungan. contoh: 12.000 → 12'], unit: 'km/jam' }
  ],
  ZR: [
    { id: 1001, type: 'numerical', question: 'Contoh 1: Lanjutkan deret angka berikut: 2, 4, 6, 8, 10, 12, 14, ... ', correctValue: 16, explanation: 'Pola deret selalu ditambah 2 (+2). Maka 14 + 2 = 16.', tips: ['Setiap deret tersusun menurut suatu aturan pola yang tertentu dan dapat dilanjutkan menurut aturan itu.','Cari selisih antar angka berurutan'] },
    { id: 1002, type: 'numerical', question: 'Contoh 2: Lanjutkan deret angka berikut: 9, 7, 10, 8, 11, 9, 12, ...', correctValue: 10, explanation: 'Pada deret ini berganti-ganti harus dikurangi dengan 2 dan dilanjutkan ditambah dengan 3. Jawaban contoh ini adalah 10', tips: ['Setiap deret tersusun menurut suatu aturan pola yang tertentu dan dapat dilanjutkan menurut aturan itu.','Jika kenaikan drastis, kemungkinan polanya perkalian'] }
  ],
  FA: [
    { 
      id: 1101, type: 'visual', question: 'Pada persoalan berikutnya, setiap soal memperlihatkan suatu bentuk tertentu yang terpotong menjadi beberapa bagian. Carilah di antara bentuk-bentuk yang ditentukan (a, b, c, d, e) bentuk yang dibangun dengan cara menyusun potongan-potongan itu sedemikian rupa, sehingga tidak ada kelebihan sudut atau ruang di antaranya. Carilah bentuk-bentuk itu dan pilih jawaban yang menunjukkan bentuk pada soal', 
      image: '/asset/ist/fa/1.png',  
      options: ['Gambar A', 'Gambar B', 'Gambar C', 'Gambar D', 'Gambar E'], 
      optionImages: [
        '/asset/ist/fa/a.png', 
        '/asset/ist/fa/b.png', 
        '/asset/ist/fa/c.png', 
        '/asset/ist/fa/d.png', 
        '/asset/ist/fa/e.png'
      ], 
      correctAnswer: 0, explanation: 'Jika potongan-potongan pada contoh di atas disusun (digabungkan), maka akan menghasilkan bentuk a.', tips: ['Perhatikan sudut dan bentuk putaran'] 
    },
    { 
      id: 1102, type: 'visual', question: 'Contoh 2: Analogi Gambar kedua...', 
      image: '/asset/ist/fa/2.png',
      options: ['Gambar A', 'Gambar B', 'Gambar C', 'Gambar D', 'Gambar E'], 
      optionImages: [
       '/asset/ist/fa/fa/a.png', 
        '/asset/ist/fa/b.png', 
        '/asset/ist/fa/c.png', 
        '/asset/ist/fa/d.png', 
        '/asset/ist/fa/e.png'
      ],
      correctAnswer: 4, explanation: 'Potongan-potongan contoh kedua setelah disusun (digabungkan) menghasilkan bentuk e',tips: ['Perhatikan sudut dan bentuk putaran'] 
    },
     { 
      id: 1103, type: 'visual', question: 'Contoh 3: Analogi Gambar ketiga...', 
      image: '/asset/ist/fa/3.png',
      options: ['Gambar A', 'Gambar B', 'Gambar C', 'Gambar D', 'Gambar E'], 
      optionImages: [
       '/asset/ist/fa/a.png', 
        '/asset/ist/fa/b.png', 
        '/asset/ist/fa/c.png', 
        '/asset/ist/fa/d.png', 
        '/asset/ist/fa/e.png'
      ],
      correctAnswer: 1, explanation: 'Potongan-potongan contoh kedua setelah disusun (digabungkan) menghasilkan bentuk e',tips: ['Perhatikan sudut dan bentuk putaran'] 
    },
     { 
      id: 1104, type: 'visual', question: 'Contoh 4: Analogi Gambar keempat...', 
      image: '/asset/ist/fa/4.png',
      options: ['Gambar A', 'Gambar B', 'Gambar C', 'Gambar D', 'Gambar E'], 
      optionImages: [
       '/asset/ist/fa/a.png', 
        '/asset/ist/fa/b.png', 
        '/asset/ist/fa/c.png', 
        '/asset/ist/fa/d.png', 
        '/asset/ist/fa/e.png'
      ],
      correctAnswer: 3, explanation: 'Potongan-potongan contoh kedua setelah disusun (digabungkan) menghasilkan bentuk e',tips: ['Perhatikan sudut dan bentuk putaran'] 
    }
  ],
  WU: [
    { 
      id: 1201, type: 'visual', question: 'Diberikan 5 kubus (A, B, C, D, E). Setiap kubus memiliki 6 sisi dengan tanda yang berbeda-beda. Pada setiap gambar, hanya 3 sisi yang terlihat. Setiap pilihan (A-E) adalah kubus yang berbeda (susunan tandanya berbeda, walaupun simbolnya bisa sama). Tugas Anda adalah menentukan kubus mana yang sama dengan kubus pada soal, meskipun posisinya sudah diputar atau digulingkan. Perlu diingat, kubus dapat diputar ke segala arah, sehingga posisi tanda bisa berubah.', 
      image: '/asset/ist/wu/1.png', 
      options: ['Kubus A', 'Kubus B', 'Kubus C', 'Kubus D', 'Kubus E'], 
      optionImages: [
        '/asset/ist/wu/a.png', 
        '/asset/ist/wu/b.png', 
        '/asset/ist/wu/c.png', 
        '/asset/ist/wu/d.png', 
        '/asset/ist/wu/e.png'
      ], 
      correctAnswer: 0, explanation: 'Mendapatkannya adalah dengan cara menggulingkan kubus ke kiri satu kali, kemudian diputar ke kiri satu kali, sehingga sisi kubus yang bertanda dua segi empat hitam terletak di depan, seperti pada kubus A.', tips: ['Bayangkan kubus diputar atau digulingkan dalam pikiran', 'Fokus pada hubungan antar sisi (yang bersebelahan & berlawanan)', 'Sisi yang berlawanan tidak mungkin terlihat bersamaan'] 
    },
    { 
      id: 1202, type: 'visual', question: 'Diberikan 5 kubus (A, B, C, D, E). Setiap kubus memiliki 6 sisi dengan tanda yang berbeda-beda. Pada setiap gambar, hanya 3 sisi yang terlihat. Setiap pilihan (A-E) adalah kubus yang berbeda (susunan tandanya berbeda, walaupun simbolnya bisa sama). Tugas Anda adalah menentukan kubus mana yang sama dengan kubus pada soal, meskipun posisinya sudah diputar atau digulingkan. Perlu diingat, kubus dapat diputar ke segala arah, sehingga posisi tanda bisa berubah.',
      image: '/asset/ist/wu/2.png', 
      options: ['Kubus A', 'Kubus B', 'Kubus C', 'Kubus D', 'Kubus E'], 
      optionImages: [
         '/asset/ist/wu/a.png', 
        '/asset/ist/wu/b.png', 
        '/asset/ist/wu/c.png', 
        '/asset/ist/wu/d.png', 
        '/asset/ist/wu/e.png'
      ], 
      correctAnswer: 4, explanation: 'Cara mendapatkannya adalah dengan menggulingkan kubus ke kiri satu kali, kemudian diputar ke kanan satu kali, sehingga sisi kubus yang bertanda garis silang terletak di depan, seperti kubus E.', tips: ['Bayangkan kubus diputar atau digulingkan dalam pikiran', 'Fokus pada hubungan antar sisi (yang bersebelahan & berlawanan)', 'Sisi yang berlawanan tidak mungkin terlihat bersamaan']
    },
    { 
      id: 1203, type: 'visual', question: 'Diberikan 5 kubus (A, B, C, D, E). Setiap kubus memiliki 6 sisi dengan tanda yang berbeda-beda. Pada setiap gambar, hanya 3 sisi yang terlihat. Setiap pilihan (A-E) adalah kubus yang berbeda (susunan tandanya berbeda, walaupun simbolnya bisa sama). Tugas Anda adalah menentukan kubus mana yang sama dengan kubus pada soal, meskipun posisinya sudah diputar atau digulingkan. Perlu diingat, kubus dapat diputar ke segala arah, sehingga posisi tanda bisa berubah.',
      image: '/asset/ist/wu/3.png', 
      options: ['Kubus A', 'Kubus B', 'Kubus C', 'Kubus D', 'Kubus E'], 
      optionImages: [
         '/asset/ist/wu/a.png', 
        '/asset/ist/wu/b.png', 
        '/asset/ist/wu/c.png', 
        '/asset/ist/wu/d.png', 
        '/asset/ist/wu/e.png'
      ], 
      correctAnswer: 1, explanation: 'Cara mendapatkannya adalah dengan memutar kubus ke kanan satu kali, kemudian digulingkan ke depan satu kali, sehingga susunan tanda pada sisi depan dan atas sesuai dengan kubus B.', tips: ['Bayangkan kubus diputar atau digulingkan dalam pikiran', 'Fokus pada hubungan antar sisi (yang bersebelahan & berlawanan)', 'Sisi yang berlawanan tidak mungkin terlihat bersamaan']
    },
    { 
      id: 1204, type: 'visual', question: 'Diberikan 5 kubus (A, B, C, D, E). Setiap kubus memiliki 6 sisi dengan tanda yang berbeda-beda. Pada setiap gambar, hanya 3 sisi yang terlihat. Setiap pilihan (A-E) adalah kubus yang berbeda (susunan tandanya berbeda, walaupun simbolnya bisa sama). Tugas Anda adalah menentukan kubus mana yang sama dengan kubus pada soal, meskipun posisinya sudah diputar atau digulingkan. Perlu diingat, kubus dapat diputar ke segala arah, sehingga posisi tanda bisa berubah.',
      image: '/asset/ist/wu/4.png', 
      options: ['Kubus A', 'Kubus B', 'Kubus C', 'Kubus D', 'Kubus E'], 
      optionImages: [
        '/asset/ist/wu/a.png', 
        '/asset/ist/wu/b.png', 
        '/asset/ist/wu/c.png', 
        '/asset/ist/wu/d.png', 
        '/asset/ist/wu/e.png'
      ], 
      correctAnswer: 2, explanation: 'Cara mendapatkannya adalah dengan menggulingkan kubus ke depan satu kali, kemudian diputar ke kiri satu kali, sehingga posisi tanda pada kubus menjadi sama seperti pada kubus C.', tips: ['Bayangkan kubus diputar atau digulingkan dalam pikiran', 'Fokus pada hubungan antar sisi (yang bersebelahan & berlawanan)', 'Sisi yang berlawanan tidak mungkin terlihat bersamaan'] 
    },
    { 
      id: 1205, type: 'visual', question: 'Diberikan 5 kubus (A, B, C, D, E). Setiap kubus memiliki 6 sisi dengan tanda yang berbeda-beda. Pada setiap gambar, hanya 3 sisi yang terlihat. Setiap pilihan (A-E) adalah kubus yang berbeda (susunan tandanya berbeda, walaupun simbolnya bisa sama). Tugas Anda adalah menentukan kubus mana yang sama dengan kubus pada soal, meskipun posisinya sudah diputar atau digulingkan. Perlu diingat, kubus dapat diputar ke segala arah, sehingga posisi tanda bisa berubah.',
      image: '/asset/ist/wu/5.png', 
      options: ['Kubus A', 'Kubus B', 'Kubus C', 'Kubus D', 'Kubus E'], 
      optionImages: [
        '/asset/ist/wu/a.png', 
        '/asset/ist/wu/b.png', 
        '/asset/ist/wu/c.png', 
        '/asset/ist/wu/d.png', 
        '/asset/ist/wu/e.png'
      ], 
      correctAnswer: 3, explanation: 'Cara mendapatkannya adalah dengan memutar kubus ke kiri satu kali, kemudian digulingkan ke belakang satu kali, sehingga sisi-sisi yang terlihat sesuai dengan kubus D.', tips: ['Bayangkan kubus diputar atau digulingkan dalam pikiran', 'Fokus pada hubungan antar sisi (yang bersebelahan & berlawanan)', 'Sisi yang berlawanan tidak mungkin terlihat bersamaan']   
    }
  ],

  ME: [
    { id: 1301, type: 'memory', question: 'Contoh 1: Berdasarkan kata-kata yang telah Anda hafalkan sebelumnya, Kata yang mempunyai huruf awalan - Q - adalah suatu....', options: ['1. Bunga', '2. Perkakas', '3. Burung', '4. Kesenian', '5. Binatang'], correctAnswer: 4, explanation: 'Quintet adalah termasuk dalam jenis kesenian, sehingga jawaban yang benar adalah D', tips: ['Fokus pada huruf yang diminta', 'Hafalkan dengan benar kata kata yang sudah diberikan'] },
    { id: 1302, type: 'memory', question: 'Contoh 2: Kata yang memilik huruf pertama - Z - adalah suatu', options: ['1. Bunga', '2. Perkakas', '3. Burung', '4. Kesenian', '5. Binatang'], correctAnswer: 4, explanation: 'Jawabannya adalah e, karena Zebra termasuk dalam jenis binatang', tips: ['Fokus pada huruf yang diminta', 'Hafalkan dengan benar kata kata yang sudah diberikan'] }
  ]
};


const memoryWordsList = [
  { category: 'BUNGA', words: ['SOKA', 'LARAT', 'FLAMBOYAN', 'YASMIN', 'DAHLIA'] },
  { category: 'PERKAKAS', words: ['WAJAN', 'JARUM', 'KIKIR', 'CANGKUL', 'PALU'] },
  { category: 'BURUNG', words: ['ITIK', 'ELANG', 'WALET', 'TEKUKUR', 'NURI'] },
  { category: 'KESENIAN', words: ['QUINTET', 'ARCA', 'OPERA', 'UKIRAN', 'GAMELAN'] },
  { category: 'BINATANG', words: ['RUSA', 'MUSANG', 'BERUANG', 'HARIMAU', 'ZEBRA'] }
];

const getExamplesForSubtest = (subtestId: number): ExampleQuestion[] => {
  const subtest = istSubtests.find(s => s.id === subtestId);
  return subtest ? exampleQuestions[subtest.code] || [] : [];
};

const getQuestionTypeIcon = (type: QuestionType) => {
  switch(type) {
    case 'verbal': return <Type className="w-5 h-5" />;
    case 'numerical': return <Hash className="w-5 h-5" />;
    case 'logical': return <Brain className="w-5 h-5" />;
    case 'personality': return <BarChart3 className="w-5 h-5" />;
    case 'visual': return <Layers className="w-5 h-5" />;
    case 'memory': return <Brain className="w-5 h-5" />;
    case 'essay': return <Type className="w-5 h-5" />;
    case 'disc': return <BarChart3 className="w-5 h-5" />;
    default: return <FileText className="w-5 h-5" />;
  }
};


const isIOSDevice = () => {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
};

export default function TestGuidePage() {
  const router = useRouter();


  const [accepted, setAccepted] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const [showMemorization, setShowMemorization] = useState(false); 
  const [loading, setLoading] = useState(true);
  const [showExplanation, setShowExplanation] = useState(false);
  const [inputError, setInputError] = useState<string>('');
  

  const [testId, setTestId] = useState<string>('');
  const [testCode, setTestCode] = useState<string>('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  

  const [currentSubtest, setCurrentSubtest] = useState(1);
  const [completedSubtests, setCompletedSubtests] = useState<number[]>([]);
  

  const [currentExampleIndex, setCurrentExampleIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(number | string)[]>([]);
  const [numericalInput, setNumericalInput] = useState<string>('');
  const [essayInput, setEssayInput] = useState<string>('');

  
  const [discAnswer, setDiscAnswer] = useState<{most: number | null, least: number | null}>({ most: null, least: null });

  const [meTimeLeft, setMeTimeLeft] = useState<number>(180);
  const [isFullscreen, setIsFullscreen] = useState(false);

  
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
      showDialog({
        type: 'alert',
        title: 'Akses Ditolak',
        message: "Browser Anda memblokir mode Fullscreen. Izinkan melalui pengaturan pop-up/fullscreen browser."
      });
    }
  };

useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const idParam = urlParams.get('testId');
    const codeParam = urlParams.get('testCode');
    const subtestParam = urlParams.get('subtest');
    
    let resolvedCode = codeParam;
    if (!resolvedCode && idParam) {
        if (idParam === '1') resolvedCode = 'WPT';
        else if (idParam === '2') resolvedCode = 'Papikostik';
        else if (idParam === '3') resolvedCode = 'IST';
        else if (idParam === '4') resolvedCode = 'DISC'; 
    }

    if (idParam) {
      setTestId(idParam);
      const sessId = localStorage.getItem(`current_session_${idParam}`);
      if (sessId) setSessionId(sessId);
      
      if (resolvedCode === 'IST') {
        loadCompletedSubtests(idParam, sessId);
      }
    }
    
    if (resolvedCode) setTestCode(resolvedCode);
    if (subtestParam) setCurrentSubtest(parseInt(subtestParam));
    
    setLoading(false);
  }, []); 

  const loadCompletedSubtests = async (testId: string, sessId: string | null) => {
    if (!sessId) return;
    try {
      const response = await fetch(`https://api.lourdesautoparts.com/api/testSessions/${sessId}/sections`);

      if (response.ok) {
        const data = await response.json();
        const completedArray = data.completed_sections || data || [];
        setCompletedSubtests(completedArray);
      }
    } catch (error) {
      console.error('Error loading completed subtests:', error);
    }
  };

  const currentInfo = testCode === 'IST' 
    ? istSubtests.find(s => s.id === currentSubtest) || istSubtests[0]
    : availableTests.find(t => t.code === testCode) || availableTests[0];

  const currentExamples = (() => {
    if (testCode === 'IST') return getExamplesForSubtest(currentSubtest);
    if (testCode === 'WPT') return [exampleQuestions['verbal'][0], exampleQuestions['numerical'][0], exampleQuestions['logical'][0]];
    if (testCode === 'Papikostik') return exampleQuestions['personality'];
    if (testCode === 'DISC') return exampleQuestions['DISC'];
    return [];
  })();

  const currentExample = currentExamples[currentExampleIndex];

  
  useEffect(() => {
    if (showMemorization) {
      if (meTimeLeft <= 0) {
        handleFinishMemorization();
        return;
      }
      const timer = setInterval(() => {
        setMeTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [showMemorization, meTimeLeft]);

  
  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentExampleIndex] = answerIndex;
    setUserAnswers(newAnswers);
    setShowExplanation(true);
  };

  const handleNumericalSubmit = () => {
    if (!numericalInput) return setInputError('Mohon masukkan jawaban Anda');
    const numValue = parseInt(numericalInput);
    if (isNaN(numValue)) return setInputError('Mohon masukkan angka yang valid');
    const newAnswers = [...userAnswers];
    newAnswers[currentExampleIndex] = numValue;
    setUserAnswers(newAnswers);
    setShowExplanation(true);
  };

  const handleEssaySubmit = () => {
    if (!essayInput.trim()) return setInputError('Mohon masukkan jawaban Anda');
    const newAnswers = [...userAnswers];
    newAnswers[currentExampleIndex] = essayInput.trim();
    setUserAnswers(newAnswers);
    setShowExplanation(true);
  };

  const handleNextExample = () => {
    if (currentExampleIndex < currentExamples.length - 1) {
      setCurrentExampleIndex(prev => prev + 1);
      resetInputStates();
    }
  };

  const handlePrevExample = () => {
    if (currentExampleIndex > 0) {
      const prevIndex = currentExampleIndex - 1;
      setCurrentExampleIndex(prevIndex);
      resetInputStates();
      
      const prevAnswer = userAnswers[prevIndex];
      const prevType = currentExamples[prevIndex].type;
      
      if (typeof prevAnswer === 'number' && prevType === 'numerical') {
        setNumericalInput(prevAnswer.toString());
      } else if (typeof prevAnswer === 'string' && prevType === 'essay') {
        setEssayInput(prevAnswer);
      }
    }
  };

  const resetInputStates = () => {
    setShowExplanation(false);
    setNumericalInput('');
    setEssayInput('');
    setInputError('');
    setDiscAnswer({ most: null, least: null }); 
  };

  const handleStartExamples = () => {
    if (testCode === 'IST' && currentInfo?.code === 'ME') {
       setShowMemorization(true);
       setMeTimeLeft(180);
       return;
    }

    if (currentExamples.length === 0) {
        showDialog({ type: 'alert', title: 'Info', message: "Contoh soal belum tersedia untuk tes ini." });
        return;
    }
    setShowExamples(true);
    setCurrentExampleIndex(0);
    setUserAnswers([]);
    resetInputStates();
  };

  const handleFinishMemorization = () => {
    setShowMemorization(false);
    setShowExamples(true);
    setCurrentExampleIndex(0);
    setUserAnswers([]);
    resetInputStates();
  };

  const handleStartRealTest = () => {
    if (!testId) {
      showDialog({ type: 'alert', title: 'Error', message: 'Test ID tidak ditemukan.' });
      return;
    }
    const route = testCode === 'IST' ? `/kandidat/test/${testId}?subtest=${currentSubtest}` : `/kandidat/test/${testId}`;
    router.push(route);
  };


  return (
    <div className="min-h-screen flex flex-col bg-[#f3f4f6]">
      
      {dialog.isOpen && (
        <div className="fixed inset-0 z-[9999999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-5 md:p-6 animate-in zoom-in duration-200">
            <div className="flex items-center mb-4">
              {dialog.type === 'confirm' ? (
                <AlertTriangle className="w-7 h-7 md:w-8 md:h-8 text-yellow-500 mr-3 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-7 h-7 md:w-8 md:h-8 text-[#242467] mr-3 flex-shrink-0" />
              )}
              <h3 className="text-lg md:text-xl font-bold text-gray-900">{dialog.title}</h3>
            </div>
            <div className="mb-6 md:mb-8 text-gray-600 whitespace-pre-line leading-relaxed font-medium text-sm md:text-base">
              {dialog.message}
            </div>
            <div className="flex justify-end space-x-3">
              {dialog.type === 'confirm' && (
                <button
                  onClick={() => {
                    if (dialog.onCancel) dialog.onCancel();
                    closeDialog();
                  }}
                  className="px-4 md:px-5 py-2 md:py-2.5 rounded-xl font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-sm md:text-base"
                >
                  {dialog.cancelText || 'Batal'}
                </button>
              )}
              <button
                onClick={() => {
                  if (dialog.onConfirm) dialog.onConfirm();
                  closeDialog();
                }}
                className="px-4 md:px-5 py-2 md:py-2.5 rounded-xl font-bold bg-[#242467] text-white hover:bg-[#1a1a52] transition-colors text-sm md:text-base"
              >
                {dialog.confirmText || 'Oke, Mengerti'}
              </button>
            </div>
          </div>
        </div>
      )}

      {!isFullscreen && !loading && (
        <div className="fixed inset-0 z-[99999] bg-black/90 flex flex-col items-center justify-center p-4 md:p-6">
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-2xl max-w-md w-full text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 border-4 border-blue-100">
              <Maximize className="w-8 h-8 md:w-10 md:h-10 text-[#242467]" />
            </div>
            <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-2 md:mb-3">Layar Penuh Diwajibkan</h2>
            <p className="text-gray-600 mb-6 md:mb-8 text-xs md:text-sm leading-relaxed font-medium">Sistem mendeteksi Anda belum berada di mode layar penuh. Untuk memulai panduan, Anda diwajibkan untuk masuk ke mode Full Screen.</p>
            <button 
              onClick={enterFullscreen} 
              className="w-full bg-[#242467] hover:bg-[#1a1a52] text-white font-bold py-3 md:py-3.5 px-4 rounded-xl flex items-center justify-center transition-all text-sm md:text-base"
            >
              <Maximize className="w-4 h-4 md:w-5 md:h-5 mr-2" /> Masuk Full Screen
            </button>
          </div>
        </div>
      )}

  
      {loading ? (
        <div className="flex-1 bg-white flex items-center justify-center p-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 md:h-16 md:w-16 border-b-2 border-[#242467] mx-auto mb-4 md:mb-6"></div>
            <h2 className="text-lg md:text-xl font-bold text-gray-800">Memuat panduan tes...</h2>
          </div>
        </div>
      ) : showMemorization ? (
        
        <>
          <header className="bg-[#242467] text-white shadow-xl flex-shrink-0">
            <div className="container mx-auto px-4 py-4 md:py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
                    <Brain className="w-6 h-6 md:w-7 md:h-7 text-[#242467]" />
                  </div>
                  <div>
                    <h1 className="text-lg md:text-3xl font-bold leading-tight">Sesi Hafalan Kata</h1>
                    <p className="text-blue-200 text-xs md:text-sm mt-0.5 md:mt-0">Subtes 9 (ME) - Menguji Daya Ingat</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="container mx-auto px-4 py-6 md:py-8 flex-grow flex items-center justify-center">
            <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200 animate-in zoom-in duration-300">
              <div className="bg-red-50 border-b border-red-100 p-4 md:p-6 text-center">
                <h2 className="text-lg md:text-xl font-bold text-red-800 flex items-center justify-center">
                  <TimerIcon className="w-5 h-5 md:w-6 md:h-6 mr-2" /> Waktu Menghafal
                </h2>
                <div className="text-4xl md:text-5xl font-mono mt-2 md:mt-3 font-bold text-red-600 tracking-wider">
                  {Math.floor(meTimeLeft / 60)}:{(meTimeLeft % 60).toString().padStart(2, '0')}
                </div>
              </div>
              
              <div className="p-5 md:p-8">
                 <p className="text-center text-gray-600 mb-6 md:mb-8 text-sm md:text-lg font-medium">
                   Hafalkan kategori dan daftar kata di bawah ini. Setelah waktu habis, Anda akan diarahkan ke contoh soal terlebih dahulu.
                 </p>
                 
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {memoryWordsList.map(group => (
                      <div key={group.category} className="bg-blue-50/50 p-4 md:p-5 rounded-xl border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                        <h4 className="font-bold text-[#242467] mb-2 md:mb-3 border-b border-blue-200 pb-2 text-base md:text-lg flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2 text-[#10b981]" /> {group.category}
                        </h4>
                        <ul className="space-y-1 md:space-y-1.5">
                          {group.words.map((word, wIdx) => (
                             <li key={wIdx} className="text-gray-800 text-sm md:text-base font-medium ml-5 relative before:content-['•'] before:absolute before:-left-4 before:text-[#242467]">
                               {word}
                             </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                 </div>
                 
                 <div className="mt-8 md:mt-10 flex justify-center">
                    <button 
                      onClick={handleFinishMemorization} 
                      className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 bg-[#10b981] text-white font-bold rounded-xl hover:bg-[#059669] transition-all shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.23)] flex items-center justify-center md:hover:-translate-y-0.5 text-sm md:text-base"
                    >
                      Saya Sudah Hafal <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2" />
                    </button>
                 </div>
              </div>
            </div>
          </main>
        </>
      ) : showExamples && currentExample ? (
   
        <div className="flex-1 bg-white flex flex-col">
          <header className="bg-[#242467] text-white shadow-xl flex-shrink-0">
            <div className="container mx-auto px-4 py-4 md:py-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-0">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 md:w-7 md:h-7 text-[#242467]" />
                  </div>
                  <div>
                    <h1 className="text-lg md:text-3xl font-bold leading-tight">
                      Contoh Soal {testCode === 'IST' ? currentInfo.code : testCode}
                    </h1>
                    <p className="text-blue-200 text-xs md:text-sm mt-0.5 md:mt-0">
                      {testCode === 'IST' ? currentInfo.name : ''}
                    </p>
                  </div>
                </div>
                
                {testCode === 'IST' && (
                  <div className="text-left md:text-right border-t border-white/20 pt-2 md:border-none md:pt-0">
                    <div className="text-base md:text-xl font-bold">Subtes {currentSubtest}/9</div>
                    <div className="text-blue-200 text-xs md:text-base">{currentExamples.length} contoh soal</div>
                  </div>
                )}
              </div>
            </div>
          </header>

          <main className="container mx-auto px-4 py-6 md:py-8 flex-grow">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
                  <div className="bg-[#242467] text-white p-4 md:p-6 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className="hidden sm:block">
                        {getQuestionTypeIcon(currentExample?.type || 'verbal')}
                      </div>
                      <div>
                        
                        <h3 className="text-lg md:text-xl font-bold">
                          Contoh {currentExampleIndex + 1} dari {currentExamples.length}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 md:p-8">
                    <div className="mb-6 md:mb-8">
                      <h4 className="text-base md:text-lg font-semibold text-black mb-2 md:mb-3">Pertanyaan:</h4>
                      <p className="text-lg md:text-xl font-bold text-black leading-relaxed">{currentExample?.question}</p>
                      
                      {currentExample?.image && (
                        <div className="mt-4 flex justify-center border border-gray-200 rounded-xl p-3 md:p-4 bg-gray-50">
                          <img 
                            src={currentExample.image} 
                            alt="Gambar Soal" 
                            className="max-h-48 md:max-h-64 object-contain rounded" 
                          />
                        </div>
                      )}
                    </div>

                    {currentExample?.type === 'disc' ? (
                      <div className="space-y-4 mb-6 md:mb-8 text-black">
                        <div className="bg-[#242467] text-white flex text-xs md:text-sm font-bold p-2 md:p-3 items-center rounded-t-xl">
                          <div className="flex-1 px-2">Gambaran Diri</div>
                          <div className="w-10 md:w-14 text-center">P</div>
                          <div className="w-10 md:w-14 text-center">K</div>
                        </div>
                        <div className="border-x border-b border-gray-200 rounded-b-xl p-2 md:p-3 bg-gray-50">
                          {currentExample.options?.map((option, index) => (
                            <div key={index} className="flex mb-2 md:mb-3 items-center min-h-[44px] hover:bg-white rounded px-2 transition-colors border-b border-gray-100 last:border-0">
                              <div className="flex-1 text-sm md:text-base text-gray-800 font-medium">
                                {option}
                              </div>
                              <div className="w-10 md:w-14 flex justify-center items-center">
                                <input
                                  type="radio"
                                  name="disc_most"
                                  checked={discAnswer.most === index}
                                  onChange={() => {
                                     const newAns = { ...discAnswer, most: index };
                                     if (newAns.least === index) newAns.least = null;
                                     setDiscAnswer(newAns);
                                     if (newAns.most !== null && newAns.least !== null) setShowExplanation(true);
                                  }}
                                  disabled={showExplanation}
                                  className="w-4 h-4 md:w-5 md:h-5 text-[#242467] focus:ring-[#242467] cursor-pointer"
                                />
                              </div>
                              <div className="w-10 md:w-14 flex justify-center items-center">
                                <input
                                  type="radio"
                                  name="disc_least"
                                  checked={discAnswer.least === index}
                                  onChange={() => {
                                     const newAns = { ...discAnswer, least: index };
                                     if (newAns.most === index) newAns.most = null;
                                     setDiscAnswer(newAns);
                                     if (newAns.most !== null && newAns.least !== null) setShowExplanation(true);
                                  }}
                                  disabled={showExplanation}
                                  className="w-4 h-4 md:w-5 md:h-5 text-[#242467] focus:ring-[#242467] cursor-pointer"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {showExplanation && (
                          <div className="p-3 md:p-4 rounded-lg flex items-center bg-green-50 border border-green-200 text-green-700 mt-4">
                            <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" /> 
                            <span className="font-medium text-sm md:text-base">Jawaban Anda sudah lengkap (1 Paling, 1 Kurang).</span>
                          </div>
                        )}
                      </div>
                    ) : currentExample?.type === 'numerical' ? (
                      <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                        <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">Masukkan Jawaban Anda:</label>
                        <div className="flex items-center">
                          {currentExample.unit && (
                            <span className="inline-flex items-center px-3 md:px-4 py-2.5 md:py-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-700 font-medium text-sm md:text-base">
                              {currentExample.unit}
                            </span>
                          )}
                          <input
                            type="text"
                            value={numericalInput}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === '' || /^\d+$/.test(val)) { setNumericalInput(val); setInputError(''); }
                            }}
                            disabled={showExplanation}
                            className={`flex-1 px-3 md:px-4 py-2.5 md:py-3 border ${currentExample.unit ? 'rounded-r-lg' : 'rounded-lg'} focus:outline-none focus:ring-2 focus:ring-[#242467] ${inputError ? 'border-red-500' : 'border-gray-300'} ${showExplanation ? 'bg-gray-100' : 'bg-white'} text-black font-medium text-sm md:text-base`}
                            placeholder="Masukkan angka..."
                          />
                        </div>
                        {inputError && <p className="mt-1 md:mt-2 text-xs md:text-sm text-red-600">{inputError}</p>}

                        {!showExplanation && (
                          <button onClick={handleNumericalSubmit} className="w-full py-2.5 md:py-3 bg-[#242467] text-white rounded-xl font-bold hover:bg-[#1a1a52] transition-colors text-sm md:text-base">
                            Cek Jawaban
                          </button>
                        )}

                        {showExplanation && (
                          <div className={`p-3 md:p-4 rounded-lg flex items-center ${userAnswers[currentExampleIndex] === currentExample.correctValue ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                            {userAnswers[currentExampleIndex] === currentExample.correctValue 
                              ? <><CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" /> <span className="font-medium text-sm md:text-base">Jawaban Anda benar!</span></>
                              : <><AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" /> <span className="font-medium text-sm md:text-base">Jawaban kurang tepat. Jawaban yang benar: {currentExample.unit} {currentExample.correctValue}</span></>
                            }
                          </div>
                        )}
                      </div>
                    ) : currentExample?.type === 'essay' ? (
                      <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                        <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">Ketik Jawaban Anda:</label>
                        <textarea
                          value={essayInput}
                          onChange={(e) => { setEssayInput(e.target.value); setInputError(''); }}
                          disabled={showExplanation}
                          rows={4}
                          className={`w-full px-3 md:px-4 py-2.5 md:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#242467] ${inputError ? 'border-red-500' : 'border-gray-300'} ${showExplanation ? 'bg-gray-100' : 'bg-white'} text-black font-medium resize-y text-sm md:text-base`}
                          placeholder="Contoh jawaban..."
                        />
                        {inputError && <p className="mt-1 md:mt-2 text-xs md:text-sm text-red-600">{inputError}</p>}

                        {!showExplanation && (
                          <button onClick={handleEssaySubmit} className="w-full py-2.5 md:py-3 bg-[#242467] text-white rounded-xl font-bold hover:bg-[#1a1a52] transition-colors text-sm md:text-base">
                            Cek Jawaban
                          </button>
                        )}

                        {showExplanation && (
                          <div className={`p-3 md:p-4 rounded-lg flex items-center ${String(userAnswers[currentExampleIndex]).toLowerCase() === String(currentExample.correctText).toLowerCase() ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                            {String(userAnswers[currentExampleIndex]).toLowerCase() === String(currentExample.correctText).toLowerCase() 
                              ? <><CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" /> <span className="font-medium text-sm md:text-base">Jawaban Anda benar!</span></>
                              : <><AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" /> <span className="font-medium text-sm md:text-base">Jawaban kurang tepat. Jawaban yang benar: {currentExample.correctText}</span></>
                            }
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3 md:space-y-4 mb-6 md:mb-8 text-black">
                        {currentExample?.options?.map((option, index) => (
                          <button
                            key={index}
                            onClick={() => handleAnswerSelect(index)}
                            disabled={showExplanation}
                            className={`w-full p-3 md:p-4 rounded-xl text-left border-2 transition-all flex items-center ${
                              userAnswers[currentExampleIndex] === index
                                ? showExplanation && currentExample.correctAnswer === index ? 'border-green-500 bg-green-50' : showExplanation && currentExample.correctAnswer !== index ? 'border-red-500 bg-red-50' : 'border-[#242467] bg-[#242467]/5'
                                : 'border-gray-200 hover:border-[#242467] hover:bg-gray-50'
                            } ${showExplanation ? 'cursor-default' : 'cursor-pointer'}`}
                          >
                            <div className={`w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center mr-3 md:mr-4 flex-shrink-0 text-sm md:text-base ${
                              userAnswers[currentExampleIndex] === index
                                ? showExplanation && currentExample.correctAnswer === index ? 'bg-green-500 text-white' : showExplanation && currentExample.correctAnswer !== index ? 'bg-red-500 text-white' : 'bg-[#242467] text-white'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {String.fromCharCode(65 + index)}
                            </div>
                            
                            {currentExample.optionImages && currentExample.optionImages[index] ? (
                               <div className="flex-1 text-left">
                                 <img 
                                   src={currentExample.optionImages[index]} 
                                   alt={`Opsi ${option}`} 
                                   className="max-h-20 md:max-h-24 object-contain rounded bg-white border border-gray-200 p-1" 
                                 />
                               </div>
                            ) : (
                               <span className="text-sm md:text-lg">{option}</span>
                            )}
                            
                            {showExplanation && currentExample.correctAnswer === index && (
                              <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-green-500 ml-auto flex-shrink-0" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}

                    {showExplanation && currentExample?.explanation && (
                      <div className="mt-6 md:mt-8 p-4 md:p-6 bg-gray-50 rounded-2xl border border-gray-200">
                        <div className="flex items-center mb-3 md:mb-4">
                          <AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-[#242467] mr-2 md:mr-3 flex-shrink-0" />
                          <h4 className="text-base md:text-lg font-bold text-gray-800">Penjelasan Jawaban</h4>
                        </div>
                        <p className="text-sm md:text-base text-gray-700 mb-5 md:mb-6">{currentExample.explanation}</p>
                        
                        <div className="mb-2 md:mb-6">
                          <h5 className="font-bold text-sm md:text-base text-gray-800 mb-2 flex items-center">
                            <Lightbulb className="w-4 h-4 md:w-5 md:h-5 text-yellow-500 mr-2 flex-shrink-0" /> Tips Mengerjakan:
                          </h5>
                          <ul className="space-y-1.5 md:space-y-2">
                            {currentExample.tips.map((tip, index) => (
                              <li key={index} className="flex items-start">
                                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#242467] rounded-full mt-1.5 md:mt-2 mr-2 md:mr-3 flex-shrink-0"></div>
                                <span className="text-xs md:text-sm text-gray-600 leading-relaxed">{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0 mt-6 md:mt-8 pt-5 md:pt-6 border-t border-gray-200">
                      <button
                        onClick={handlePrevExample}
                        disabled={currentExampleIndex === 0}
                        className={`w-full sm:w-auto px-4 md:px-6 py-2.5 md:py-3 rounded-lg font-medium flex justify-center items-center text-sm md:text-base ${currentExampleIndex === 0 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                      >
                        <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 mr-2" /> Sebelumnya
                      </button>
                      
                      <div className="flex flex-col items-center justify-center order-first sm:order-none mb-2 sm:mb-0">
                        <span className="text-xs md:text-sm text-gray-600 font-medium">Contoh {currentExampleIndex + 1} dari {currentExamples.length}</span>
                      </div>
                      
                      <button
                        onClick={handleNextExample}
                        disabled={currentExampleIndex === currentExamples.length - 1 || !showExplanation}
                        className={`w-full sm:w-auto px-4 md:px-6 py-2.5 md:py-3 rounded-lg font-medium flex justify-center items-center text-sm md:text-base ${currentExampleIndex === currentExamples.length - 1 || !showExplanation ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-[#242467] text-white hover:bg-[#1a1a52]'}`}
                      >
                        Berikutnya <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-lg p-5 md:p-6 border border-gray-200 sticky top-6">
                  <h3 className="text-base md:text-lg font-bold text-gray-800 mb-3 md:mb-4">Sudah Siap?</h3>
                  <p className="text-sm md:text-base text-gray-600 mb-5 md:mb-6">
                    Setelah memahami contoh soal, Anda bisa mulai mengerjakan tes sesungguhnya.
                  </p>
                  
                  <button
                    onClick={handleStartRealTest}
                    disabled={!accepted}
                    className={`w-full py-3 md:py-3.5 text-sm md:text-base font-bold rounded-xl flex items-center justify-center space-x-2 transition-all ${accepted ? 'bg-[#242467] text-white hover:bg-[#1a1a52] hover:shadow-lg' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                  >
                    <Play className="w-4 h-4 md:w-5 md:h-5" />
                    <span>Mulai Tes {testCode} {testCode === 'IST' && `Subtes ${currentSubtest}`}</span>
                  </button>
                  
                  <p className="text-xs md:text-sm text-gray-500 mt-4 text-center flex items-center justify-center">
                    <input type="checkbox" id="agree" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="w-4 h-4 text-[#242467] rounded focus:ring-[#242467] mr-2" />
                    <label htmlFor="agree" className="text-gray-700 cursor-pointer ml-1 md:ml-2">Saya telah memahami panduan</label>
                  </p>
                </div>
              </div>
            </div>
          </main>
        </div>
      ) : (
   
        <>
          <header className="bg-[#242467] text-white shadow-lg flex-shrink-0">
            <div className="container mx-auto px-4 py-4 md:py-6">
              <div className="text-center">
                <h1 className="text-xl md:text-3xl font-bold leading-tight">
                  {testCode === 'IST' ? `Panduan Tes IST - Subtes ${currentSubtest}` : `Panduan Tes ${testCode}`}
                </h1>
              </div>
            </div>
          </header>

          <main className="container mx-auto px-4 py-6 md:py-8 flex-grow">
            <div className="max-w-3xl mx-auto">
              <div className="bg-white rounded-2xl shadow-xl p-5 md:p-8 border border-gray-200 mb-6 md:mb-8">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6 text-center leading-tight">
                  {testCode === 'IST' ? `Subtes ${currentSubtest}: ${currentInfo?.name}` : `Selamat Datang di Tes ${testCode}`}
                </h2>
                
                <div className="space-y-5 md:space-y-6">
                 <p className="text-sm md:text-base text-gray-600 text-center">
                    Anda akan mengikuti tes {testCode}. Tes ini bertujuan untuk mengukur kemampuan dan potensi Anda.
                  </p>
                  
                  <div className="bg-[#242467]/5 p-4 md:p-6 rounded-xl">
                    <h3 className="text-base md:text-lg font-bold text-[#242467] mb-3 md:mb-4">Informasi Tes:</h3>
                    <ul className="space-y-2 md:space-y-3">
                      <li className="flex items-center text-sm md:text-base">
                        <FileText className="w-4 h-4 md:w-5 md:h-5 text-[#242467] mr-2 md:mr-3 flex-shrink-0" />
                        <span className="text-gray-700">Jumlah Soal: <span className="font-bold">{currentInfo?.totalQuestions}</span></span>
                      </li>
                      <li className="flex items-center text-sm md:text-base">
                        <Clock className="w-4 h-4 md:w-5 md:h-5 text-[#242467] mr-2 md:mr-3 flex-shrink-0" />
                        <span className="text-gray-700">Durasi: <span className="font-bold">{currentInfo?.duration} menit</span></span>
                      </li>
                      {testCode === 'IST' && (
                        <li className="flex items-center text-sm md:text-base">
                          <Layers className="w-4 h-4 md:w-5 md:h-5 text-[#242467] mr-2 md:mr-3 flex-shrink-0" />
                          <span className="text-gray-700">Progress: <span className="font-bold">{completedSubtests.length}/9 subtes selesai</span></span>
                        </li>
                      )}
                    </ul>
                  </div>
                  
                  <div className="bg-yellow-50 border border-yellow-200 p-4 md:p-6 rounded-xl">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start justify-center text-center sm:text-left">
                      <AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-yellow-600 mb-2 sm:mb-0 sm:mr-3 flex-shrink-0 sm:mt-1" />
                      <div>
                        <h4 className="font-bold text-yellow-800 mb-1 md:mb-2 text-sm md:text-base">Penting!</h4>
                        <p className="text-yellow-700 text-xs md:text-sm">
                          {testCode === 'IST' 
                            ? currentInfo?.code === 'ME'
                              ? `Anda akan masuk ke sesi menghafal (Memorization) selama 5 menit. Hafalkan daftar yang diberikan sebaik mungkin.`
                              : `Anda akan mengerjakan subtes ${currentSubtest} dari 9 subtes. Setiap subtes memiliki contoh soal. Selesaikan secara berurutan.`
                            : 'Sebelum memulai tes sesungguhnya, Anda akan diberikan beberapa contoh soal untuk memahami format dan cara menjawab.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-xl p-5 md:p-8 border border-gray-200">
                <div className="flex flex-col items-center text-center">
                  <button
                    onClick={handleStartExamples}
                    className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 font-bold rounded-xl flex items-center justify-center space-x-2 md:space-x-3 transition-all duration-300 bg-[#242467] hover:bg-[#1a1a52] text-white hover:shadow-xl transform md:hover:scale-105 text-sm md:text-base"
                  >
                    <span>
                      {testCode === 'IST' && currentInfo?.code === 'ME' ? 'Mulai Sesi Hafalan' : 'Lihat Contoh Soal'}
                    </span>
                    <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                  <p className="text-xs md:text-sm text-gray-500 mt-3 md:mt-4 px-2">
                    {testCode === 'IST' && currentInfo?.code === 'ME' 
                      ? 'Klik tombol di atas untuk memulai waktu hafalan.' 
                      : 'Klik tombol di atas untuk mempelajari cara menjawab soal.'}
                  </p>
                </div>
              </div>
            </div>
          </main>
        </>
      )}

      <footer className="bg-[#242467] text-white py-6 md:py-8 mt-auto flex-shrink-0">
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