'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axiosInstance';
import { ensureArray, ensureObject } from '@/lib/api';
import { clearSession, getSession, isAdminRole } from '@/lib/auth';
import { fetchApi } from '@/lib/fetchApi';
export default function MusyrifPortalMobile() {
  const router = useRouter();
  const STORAGE_KEY = 'musyrif_portal_state';
  const [expandedAiReports, setExpandedAiReports] = useState<number[]>([]);
  const formatIndonesiaDateTime = (value: string | Date | null | undefined) => {
    if (!value) return '—';
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat('id-ID', { timeZone: 'Asia/Jakarta', dateStyle: 'medium', timeStyle: 'short' }).format(date);
  };
  const [musyrifName, setMusyrifName] = useState('');
  const [santriList, setSantriList] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedSantri, setSelectedSantri] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [analisis, setAnalisis] = useState('');
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  // Workflow State: 'menu' | 'select_student' | 'student_detail' | 'input_form'
  const [currentStep, setCurrentStep] = useState<'menu' | 'select_student' | 'student_detail' | 'input_form'>('menu');
  // Mode State: 'input' (untuk input laporan) atau 'monitor' (untuk pantau & analisis)
  const [portalMode, setPortalMode] = useState<'input' | 'monitor'>('input');
  

  // Form Input States
  const [surah, setSurah] = useState('');
  const [ayat, setAyat] = useState('');
  const [statusSetoran, setStatusSetoran] = useState('lancar');
  const [catatanText, setCatatanText] = useState('');
  const [inputLoading, setInputLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [lastSavedReport, setLastSavedReport] = useState<any>(null);
  const [reportHistory, setReportHistory] = useState<any[]>([]);
  const [analyzingReportId, setAnalyzingReportId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const notifyAdminOverviewRefresh = () => {
    try {
      localStorage.setItem('tia_refresh_signal', String(Date.now()));
      window.dispatchEvent(new Event('tia-data-updated'));
    } catch (err) {
      console.warn('Gagal mengirim sinyal refresh overview:', err);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const savedState = localStorage.getItem(STORAGE_KEY);
      if (!savedState) return;

      const parsedState = JSON.parse(savedState);
      setSelectedSantri(parsedState.selectedSantri && typeof parsedState.selectedSantri === 'object' && !Array.isArray(parsedState.selectedSantri) ? parsedState.selectedSantri : null);
      setStats(parsedState.stats && typeof parsedState.stats === 'object' && !Array.isArray(parsedState.stats) ? parsedState.stats : null);
      setAnalisis(typeof parsedState.analisis === 'string' ? parsedState.analisis : '');
      setCurrentStep(['menu', 'select_student', 'student_detail', 'input_form'].includes(parsedState.currentStep) ? parsedState.currentStep : 'menu');
      setPortalMode(['input', 'monitor'].includes(parsedState.portalMode) ? parsedState.portalMode : 'input');
      setSuccessMsg(typeof parsedState.successMsg === 'string' ? parsedState.successMsg : '');
      setLastSavedReport(parsedState.lastSavedReport && typeof parsedState.lastSavedReport === 'object' && !Array.isArray(parsedState.lastSavedReport) ? parsedState.lastSavedReport : null);
      setReportHistory(Array.isArray(parsedState.reportHistory) ? parsedState.reportHistory : []);
    } catch (err) {
      console.error('Gagal memuat state portal:', err);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const stateToSave = {
      selectedSantri,
      stats,
      analisis,
      currentStep,
      portalMode,
      successMsg,
      lastSavedReport,
      reportHistory,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  }, [selectedSantri, stats, analisis, currentStep, portalMode, successMsg, lastSavedReport, reportHistory]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      const session = getSession();
      if (!session?.username) {
        router.push('/login');
        return;
      }

      setUserRole(session.role);
      setMusyrifName(session.nama_lengkap || session.nama || session.username);

      try {
        const res = await api.get('/musyrif/santri');
        setSantriList(ensureArray(res.data, ['santri']));
      } catch (err: any) {
        console.error('Fetch error:', err);
        const errorMessage = err.response?.data?.detail || 'Gagal mengambil data santri';
        setError(errorMessage);
        setSantriList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);
  

  const startListening = () => {
    // Gunakan 'as any' agar TypeScript tidak error karena Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert("Browser Anda tidak mendukung fitur suara. Gunakan Google Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'id-ID'; // Bahasa Indonesia (bisa mendeteksi kata ngaji/tajwid dengan baik)
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    
    recognition.onend = () => setIsListening(false);
    
    recognition.onerror = (event: any) => {
      console.error("Mic error:", event.error);
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      // Menambahkan hasil suara ke teks yang sudah ada, dipisah dengan spasi
      setCatatanText((prev) => prev ? `${prev} ${transcript}` : transcript);
    };

    recognition.start();
  };

  const fetchStatistikSantri = async (santriId: number | string) => {
    try {
      const res = await api.get(`/musyrif/statistik/setoran/${santriId}`);
      setStats(ensureObject(res.data) ?? res.data);
    } catch (e) {
      console.error('Gagal fetch statistik', e);
      setStats(null);
    }
  };

  // Trigger klik dari list nama santri
  const handleSelectSantri = (santri: any) => {
    setSelectedSantri(santri);
    setStats(null);
    setAnalisis('');
    setSuccessMsg('');
    setSurah('');
    setAyat('');
    setCatatanText('');

    if (portalMode === 'input') {
      // Kalau modenya input, langsung lari ke Form Input
      setCurrentStep('input_form');
    } else {
      // Kalau modenya monitor, lari ke halaman Detail Pantau & Analisis
      fetchStatistikSantri(santri.id);
      setCurrentStep('student_detail');
    }
  };

  const handleVerifySetoran = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!surah.trim() || !ayat.trim()) {
      alert("Isi data surah dan ayat terlebih dahulu!");
      return;
    }

    if (!selectedSantri?.id) {
      alert('Pilih santri dulu!');
      setInputLoading(false);
      return;
    }

    setInputLoading(true);

    try {
      const res = await fetchApi('/api/musyrif/setoran', {
        method: 'POST',
        body: JSON.stringify({
          santri_id: selectedSantri.id,
          surah,
          ayat,
          status_kelancaran: statusSetoran,
          catatan_musyrif: catatanText,
        }),
      });

      if (!res.ok) throw new Error('Gagal menyimpan data laporan.');

      const newReport = {
        id: `${selectedSantri.id}-${Date.now()}`,
        santriId: selectedSantri.id,
        santriName: selectedSantri.nama_santri,
        surah,
        ayat,
        statusSetoran,
        catatanText,
        savedAt: new Date().toISOString(),
        analisisAi: '',
      };

      const reportToPersist = {
        ...newReport,
        santriName: selectedSantri?.nama_santri || newReport.santriName,
        savedAt: new Date().toISOString()
      };

      setSuccessMsg("Verified & Saved successfully! 🎉");
      setLastSavedReport(reportToPersist);
      setReportHistory((prev) => [reportToPersist, ...prev].slice(0, 10));
      setSurah('');
      setAyat('');
      setCatatanText('');
      setCurrentStep('input_form');
      localStorage.setItem('tia_latest_report', JSON.stringify(reportToPersist));
      notifyAdminOverviewRefresh();

    } catch (err: any) {
      alert(err.message);
    } finally {
      setInputLoading(false);
    }
  };

  const updateReportAnalysis = (reportId: string, analysisText: string) => {
    setReportHistory((prev: any[]) => prev.map((report: any) => report.id === reportId ? { ...report, analisisAi: analysisText } : report));
    setLastSavedReport((prev: any) => prev?.id === reportId ? { ...prev, analisisAi: analysisText } : prev);
  };

  const handleGetAIAnalysis = async (e: React.MouseEvent<HTMLButtonElement> | null, report?: any) => {
    if (e) e.preventDefault();

    const reportToAnalyze = report ?? lastSavedReport ?? (selectedSantri ? {
      id: `current-${selectedSantri.id}`,
      santriId: selectedSantri.id,
      santriName: selectedSantri.nama_santri,
      surah: '',
      ayat: '',
      statusSetoran: 'lancar',
      catatanText: '',
      savedAt: new Date().toISOString(),
      analisisAi: '',
    } : null);

    if (!reportToAnalyze?.santriId) return;

    setAnalyzingReportId(reportToAnalyze.id);
    updateReportAnalysis(reportToAnalyze.id, 'Musyrif AI sedang membaca laporan ini...');
    setAnalisis('Musyrif AI sedang membaca laporan ini...');

    const session = getSession();
    const headers: Record<string, string> = session?.access_token || session?.token
      ? { Authorization: `Bearer ${session.access_token || session.token}` }
      : {};

    try {
      const res = await api.post(
        `/musyrif/statistik/analisis/${reportToAnalyze.santriId}`,
        {},
        { headers: { ...headers, 'Content-Type': 'application/json' } }
      );

      const data = res.data;
      const payload = ensureObject<{ analisis_ai?: string }>(data);
      const aiText = payload?.analisis_ai || (data as { analisis_ai?: string })?.analisis_ai || 'Analisis AI belum tersedia untuk laporan ini.';
      updateReportAnalysis(reportToAnalyze.id, aiText);
      setAnalisis(aiText);
    } catch {
      const errorText = 'Koneksi AI terputus, coba lagi.';
      updateReportAnalysis(reportToAnalyze.id, errorText);
      setAnalisis(errorText);
    } finally {
      setAnalyzingReportId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b1220] flex items-center justify-center text-slate-400 font-mono text-xs tracking-wider">
        🔮 LOADING TIA SYSTEM PROTOCOL...
      </div>
    );
  }



return(	
   <div className="min-h-screen bg-gnome-darker text-slate-800 flex justify-center p-4">
      <div className="w-full max-w-md flex flex-col gap-6 pt-6">

        {/* Top Header */}
        <div className="flex justify-between items-center bg-gnome-card p-4 rounded-2xl border border-gnome-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gnome-green rounded-full flex items-center justify-center text-white font-bold shadow-lg">
              {(musyrifName || 'M').charAt(0).toUpperCase()}
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">ASSALAMUALAIKUM 👋</span>
              <h2 className="text-md font-bold text-slate-800">{musyrifName}</h2>
            </div>
          </div>
          <button
            onClick={() => {
              clearSession();
              localStorage.removeItem(STORAGE_KEY);
              router.push('/login');
            }}
            className="text-xs bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-200 transition font-medium"
          >
            Keluar
          </button>
        </div>

        {/* ----------------- STEP 1: DASHBOARD / MENU UTAMA ----------------- */}
        {currentStep === 'menu' && (
          <div className="flex flex-col gap-4 animate-fadeIn">

            {/* CARD 1: INPUT DATA */}
            <div
              onClick={() => { setPortalMode('input'); setCurrentStep('select_student'); }}
              className="bg-gnome-green p-8 rounded-3xl cursor-pointer shadow-xl hover:scale-[1.01] transition transform active:scale-[0.99] group text-center relative overflow-hidden"
            >
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                </svg>
              </div>
              <span className="text-[11px] font-bold text-emerald-100 tracking-widest uppercase block mb-1">MULAI SEKARANG</span>
              <h3 className="text-2xl font-black text-white">Input Data Santri</h3>
            </div>

            {/* CARD 2: PANTAU & ANALISIS */}
            <div
              onClick={() => { setPortalMode('monitor'); setCurrentStep('select_student'); }}
              className="bg-gnome-card border border-gnome-border p-6 rounded-3xl cursor-pointer hover:bg-slate-50 transition flex items-center gap-5"
            >
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100">
                <svg className="w-6 h-6 text-gnome-green" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25A2.25 2.25 0 0 1 13.5 8V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
                </svg>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">PANTAU & ANALISIS</span>
                <h4 className="text-lg font-bold text-slate-800">Profil Santri</h4>
              </div>
            </div>

            {/* CARD 3: PORTAL ADMIN */}
           {isAdminRole(userRole) && (
            <button
              type="button"
              onClick={() => router.push('/admin')}
              className="w-full bg-slate-50 border border-slate-200 p-5 rounded-3xl flex items-center justify-between hover:bg-slate-100 transition"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-gnome-green border border-emerald-200">
                  🛡️
                </div>
                <span className="text-sm font-semibold text-slate-700">Portal Admin</span>
              </div>
            </button>
          )}
          </div>  
        )}
      
          
{/* ----------------- STEP 2: LIST SELEKSI NAMA SANTRI ----------------- */}
{currentStep === 'select_student' && (
  <div className="bg-gnome-card p-6 rounded-3xl border border-gnome-border flex flex-col gap-4 animate-fadeIn">
    <div className="flex justify-between items-center mb-1">
      <h3 className="text-sm font-bold text-slate-500 tracking-wider uppercase">
        {portalMode === 'input' ? '🎙️ Pilih Santri Penyetor' : '📊 Pilih Santri Dipantau'}
      </h3>
      <button onClick={() => setCurrentStep('menu')} className="text-xs text-slate-400 hover:text-slate-700">← Kembali</button>
    </div>

    <p className="text-xs text-slate-500 italic bg-slate-100 p-3 rounded-xl border border-slate-200">
      {portalMode === 'input'
        ? 'Silahkan klik nama santri di bawah untuk mulai mengoreksi teks laporan hafalan.'
        : 'Silahkan klik nama santri di bawah untuk melihat grafik serta memicu rekomendasi AI.'}
    </p>

    <div className="flex flex-col gap-2.5 mt-2">
      {error && (
        <p className="text-xs text-center text-red-500 py-2">{error}</p>
      )}
      {ensureArray(santriList).length === 0 ? (
        <p className="text-xs text-center text-slate-400 py-4">Data santri kosong.</p>
      ) : (
        ensureArray(santriList).map((s: any) => (
          <div
            key={s.id}
            onClick={() => handleSelectSantri(s)}
            className="bg-white hover:bg-emerald-50 p-4 rounded-2xl cursor-pointer border border-gnome-border flex items-center gap-4 transition group shadow-sm"
          >
            <div className="w-11 h-11 bg-gnome-green rounded-full flex items-center justify-center border border-emerald-400 text-xs font-bold text-white group-hover:scale-105 transition">
              {s.nama_santri.charAt(0).toUpperCase()}
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 group-hover:text-gnome-green transition">{s.nama_santri}</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Nomor Induk: {s.nomor_induk}</p>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
)}

{/* ----------------- STEP 3: DETAIL PANTAU & ANALISIS (COLLAPSIBLE AI DROPDOWN) ----------------- */}
{currentStep === 'student_detail' && selectedSantri && (
  <div className="flex flex-col gap-4 animate-fadeIn w-full max-w-md mx-auto pb-6">

    {/* Header Profil */}
    <div className="bg-white border border-gnome-border p-6 rounded-3xl flex flex-col items-center justify-center text-center shadow-sm">
      <div className="w-16 h-16 rounded-full bg-gnome-green flex items-center justify-center text-2xl font-black text-white mb-3 border-2 border-emerald-200">
        {selectedSantri.nama_santri?.charAt(0).toUpperCase() || 'S'}
      </div>
      <h1 className="text-xl font-black text-slate-800 tracking-wide">{selectedSantri.nama_santri}</h1>
      <div className="flex items-center gap-2 mt-2">
        <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md uppercase tracking-widest">Terkonfirmasi</span>
        <span className="text-[10px] text-slate-600 font-mono bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
          ID: {selectedSantri.nomor_induk || selectedSantri.student_id || '12344'}
        </span>
      </div>
    </div>

    {/* Tombol Trigger Global AI */}
    <button
      type="button"
      onClick={handleGetAIAnalysis}
      className="w-full bg-gnome-green hover:bg-emerald-600 text-white font-black py-4 px-4 rounded-2xl text-[11px] tracking-widest uppercase transition-all active:scale-[0.98]"
    >
      🤖 JALANKAN ANALISIS PERFORMA AI GLOBAL
    </button>

    {/* Output Global AI */}
    {analisis && (
      <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-sm animate-fadeIn">
        <div className="text-[10px] font-bold uppercase tracking-widest text-gnome-green mb-3">Hasil Analisis Performa</div>
        <div className="text-xs text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">{analisis}</div>
      </div>
    )}

    {/* Histori Laporan */}
    <div className="bg-white p-5 rounded-3xl border border-gnome-border shadow-sm">
      <div className="flex justify-between items-end border-b border-slate-100 pb-4 mb-4">
        <div>
          <span className="text-[9px] uppercase tracking-widest font-bold text-slate-400 block mb-1">Total Kehadiran</span>
          <p className="text-3xl font-black text-slate-800">{stats?.total_setoran || 0}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {ensureArray(stats?.riwayat_lengkap).map((report: any, idx: number) => {
          const isAiExpanded = expandedAiReports.includes(report.id || idx);
          return (
            <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-gnome-border hover:border-emerald-200 transition-all">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">{report.surah}</h4>
                  <p className="text-[10px] text-slate-500">Ayat {report.ayat} • {report.waktu}</p>
                </div>
                <span className={`text-[9px] px-2 py-1 rounded font-black uppercase ${report.status === 'lancar' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {report.status}
                </span>
              </div>

              {report.catatan && <p className="text-xs text-slate-600 bg-white p-2 rounded-lg border border-slate-100 mb-2 italic">"{report.catatan}"</p>}

              {/* Tombol Dropdown AI */}
              <button
                onClick={() =>
                  setExpandedAiReports(
                    isAiExpanded
                      ? expandedAiReports.filter((i) => i !== (report.id || idx))
                      : [...expandedAiReports, report.id || idx]
                  )
                }
                className="w-full flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase p-2 hover:text-gnome-green"
              >
                🤖 {isAiExpanded ? 'Sembunyikan Analisa' : 'Lihat Analisa AI'}
                <span>{isAiExpanded ? '▲' : '▼'}</span>
              </button>

              {isAiExpanded && (
                <div className="text-xs text-slate-700 mt-2 p-3 bg-white rounded-lg border border-emerald-100 animate-fadeIn">
                  {report.analisisAi || 'Belum ada analisa AI tersedia.'}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  </div>
)}

{/* ----------------- STEP 4: FORM INPUT LENGKAP ----------------- */}
{currentStep === 'input_form' && selectedSantri && (
  <div className="flex flex-col gap-4 animate-fadeIn w-full max-w-md mx-auto pb-8">
    
    {/* Header Mini Profil */}
    <div className="bg-white border border-gnome-border p-4 rounded-2xl flex items-center justify-between shadow-sm">
      <div>
        <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Input Untuk</p>
        <p className="text-sm font-black text-slate-800">{selectedSantri.nama_santri}</p>
      </div>
      <button 
        onClick={() => setCurrentStep('select_student')}
        className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition"
      >
        Batal
      </button>
    </div>

    {/* FORM UTAMA */}
    <div className="bg-white border border-gnome-border p-6 rounded-3xl shadow-sm">
      <form onSubmit={handleVerifySetoran} className="flex flex-col gap-4">
        
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Surah</label>
            <input
              type="text"
              placeholder="Contoh: Al-Mulk"
              value={surah}
              onChange={(e) => setSurah(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 border border-gnome-border rounded-xl p-3 text-xs focus:border-gnome-green outline-none"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Ayat</label>
            <input
              type="text"
              placeholder="Contoh: 1-5"
              value={ayat}
              onChange={(e) => setAyat(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 border border-gnome-border rounded-xl p-3 text-xs focus:border-gnome-green outline-none"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Status Kelancaran</label>
          <select
            value={statusSetoran}
            onChange={(e) => setStatusSetoran(e.target.value)}
            className="w-full bg-slate-50 text-slate-800 border border-gnome-border rounded-xl p-3 text-xs focus:border-gnome-green outline-none"
          >
            <option value="lancar">🟢 Mumtaz (Sangat Lancar)</option>
            <option value="sedang">🟡 Jayyid (Sedang)</option>
            <option value="kurang">🔴 Dhoif (Kurang)</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Catatan Musyrif</label>
          <div className="relative">
            <textarea
              rows={3}
              value={catatanText}
              onChange={(e) => setCatatanText(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 border border-gnome-border rounded-xl p-3 pr-12 text-xs focus:border-gnome-green outline-none resize-none"
            />
            <button
              type="button"
              onClick={startListening}
              className={`absolute right-2 bottom-2 p-2 rounded-lg border ${isListening ? 'bg-red-50 text-red-500 border-red-200' : 'bg-white text-gnome-green border-gnome-border'}`}
            >
              🎙️
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-gnome-green hover:bg-emerald-600 text-white font-black py-4 rounded-xl text-[11px] uppercase tracking-widest transition"
        >
          ✓ VERIFIED & SAVE
        </button>
      </form>
    </div>

    {/* OUTPUT ANALISA SETELAH SIMPAN */}
    {successMsg && lastSavedReport && (
      <div className="bg-white border border-gnome-border rounded-3xl p-6 shadow-sm animate-fadeIn">
        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Ringkasan Data Baru</div>
        
        <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl mb-4 text-xs text-emerald-800 font-bold">
          {successMsg}
        </div>

        <button
          onClick={(e) => handleGetAIAnalysis(e, lastSavedReport)}
          className="w-full bg-slate-800 hover:bg-black text-white font-black py-4 rounded-xl text-[10px] uppercase tracking-widest transition mb-4"
        >
          🤖 AMBIL ANALISA AI
        </button>

        {(lastSavedReport.analisisAi || analisis) && (
          <div className="bg-slate-50 p-4 rounded-xl border border-gnome-border text-xs text-slate-700 leading-relaxed font-medium">
            <span className="block text-[9px] font-bold text-gnome-green uppercase mb-2">Hasil Insight AI:</span>
            {lastSavedReport.analisisAi || analisis}
          </div>
        )}
      </div>
    )}
  </div>
      )}
      </div>
    </div>
  );
}
