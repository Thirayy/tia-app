'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axiosInstance';
import { getPostLoginPath, setSession } from '@/lib/auth';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

      if (!userData) {
        throw new Error('Data user tidak ditemukan.');
      }

      const redirectPath = getPostLoginPath(String(userData.role || ''));
      if (!redirectPath) {
        throw new Error('Role akun belum dikenali.');
      }

      setSession(userData);
      router.replace(redirectPath);
    } catch {
      setIsError(true);
      setStatusMsg('Gagal masuk. Cek username, password, dan role akun.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-dvh bg-gnome-darker text-slate-900">
      <div className="mx-auto grid min-h-dvh w-full max-w-6xl grid-cols-1 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_420px] lg:items-center lg:gap-12 lg:py-10">
        <section className="hidden lg:block">
          <div className="max-w-xl">
            <div className="mb-8 inline-flex items-center gap-3 rounded-md border border-gnome-border bg-white px-3 py-2 text-sm font-medium text-emerald-800">
              <span className="h-2.5 w-2.5 rounded-full bg-gnome-green" aria-hidden="true" />
              Sistem aktif untuk assessment tahfizh
            </div>

            <h1 className="text-5xl font-semibold leading-tight tracking-normal text-slate-950">
              TIA Assessment
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-slate-600">
              Dashboard operasional untuk musyrif dan admin, dibuat agar input setoran santri
              tetap cepat, rapi, dan mudah ditinjau.
            </p>

            <div className="mt-10 grid max-w-lg grid-cols-3 gap-3">
              {['Input setoran', 'Monitoring halaqah', 'Rekap santri'].map((item) => (
                <div key={item} className="rounded-md border border-slate-200 bg-white p-4">
                  <div className="text-xs font-semibold uppercase tracking-normal text-slate-500">
                    Fokus
                  </div>
                  <div className="mt-2 text-sm font-semibold text-slate-900">{item}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex min-h-[calc(100dvh-3rem)] items-center justify-center lg:min-h-0">
          <div className="w-full max-w-[420px] rounded-lg border border-slate-200 bg-gnome-card p-5 shadow-sm sm:p-7">
            <div className="mb-7">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-md bg-emerald-950 text-sm font-bold text-white">
                TIA
              </div>
              <h2 className="text-2xl font-semibold tracking-normal text-slate-950">
                Masuk ke Sistem
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Gunakan akun yang sudah didaftarkan oleh admin.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="username" className="mb-2 block text-sm font-medium text-slate-700">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 transition placeholder:text-slate-400 focus:border-gnome-green focus:outline-none sm:text-sm"
                  placeholder="contoh: ustadzah.aisyah"
                  required
                  autoComplete="username"
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2 pr-24 text-base text-slate-900 transition placeholder:text-slate-400 focus:border-gnome-green focus:outline-none sm:text-sm"
                    placeholder="Masukkan password"
                    required
                    autoComplete="current-password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-1.5 top-1/2 min-h-8 -translate-y-1/2 rounded px-3 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-50"
                    aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                    disabled={loading}
                  >
                    {showPassword ? 'Sembunyikan' : 'Tampilkan'}
                  </button>
                </div>
              </div>

              {statusMsg && (
                <div
                  role={isError ? 'alert' : 'status'}
                  className={`rounded-md border px-3 py-2.5 text-sm leading-5 ${
                    isError
                      ? 'border-red-200 bg-red-50 text-red-700'
                      : 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  }`}
                >
                  {statusMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-gnome-green px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading && (
                  <span
                    className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white"
                    aria-hidden="true"
                  />
                )}
                {loading ? 'Memverifikasi...' : 'Masuk'}
              </button>
            </form>

            <p className="mt-6 border-t border-slate-100 pt-4 text-xs leading-5 text-slate-500">
              Jika akun tidak bisa masuk, minta admin memeriksa role dan status user di dashboard.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
