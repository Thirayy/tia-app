'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axiosInstance';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isError, setIsError] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setIsError(false);
    setStatusMsg('');

    try {
      const response = await api.post('/auth/login', { username, password });
      const userData = response.data.user;

      if (userData) {
        localStorage.setItem('user_session', JSON.stringify(userData));
        const role = String(userData.role || '').toLowerCase();
        
        // Asumsi fungsi getPostLoginPath sudah ada di file ini atau diimpor
        const redirectPath = '/musyrif'; 
        router.push(redirectPath);
      } else {
        throw new Error('Data user tidak ditemukan.');
      }
    } catch (err: any) {
      setIsError(true);
      setStatusMsg('Gagal masuk, cek username/password Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen w-full p-4 bg-gnome-darker">
      <div className="bg-gnome-card border border-gnome-border rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">TIA Assessment</h1>
          <p className="text-sm text-slate-500 mt-2">Tahfizh Integrated Assessment & AI Center</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-gnome-input border border-gnome-border rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-gnome-green transition-all"
              placeholder="Masukkan username..."
              required
              autoComplete="off"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gnome-input border border-gnome-border rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-gnome-green transition-all"
              placeholder="Masukkan password..."
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gnome-green text-white font-semibold py-3 rounded-xl transition hover:bg-emerald-600 shadow-md disabled:opacity-60"
          >
            {loading ? 'Memverifikasi...' : 'Masuk ke Sistem'}
          </button>

          {statusMsg && (
            <div
              className={`p-3 rounded-lg text-xs text-center border ${
                isError
                  ? 'bg-red-50 text-red-600 border-red-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
            >
              {statusMsg}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
