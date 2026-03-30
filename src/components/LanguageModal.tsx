'use client';

import { useLang } from '@/lib/lang';

export default function LanguageModal() {
  const { hasChosen, setLang } = useLang();

  if (hasChosen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(10,5,16,0.85)', backdropFilter: 'blur(8px)' }}
    >
      <div
        className="w-full max-w-sm rounded-3xl p-8 text-center"
        style={{
          background: 'linear-gradient(135deg, rgba(45,19,84,0.95), rgba(26,10,46,0.98))',
          border: '1px solid rgba(212,168,83,0.35)',
          boxShadow: '0 0 60px rgba(124,58,237,0.25)',
        }}
      >
        {/* 장식선 */}
        <div className="w-16 h-px mx-auto mb-6" style={{ background: 'linear-gradient(90deg, transparent, rgba(212,168,83,0.7), transparent)' }} />

        <div className="text-4xl mb-5">☯</div>

        <h2 className="text-xl font-bold mb-1" style={{ color: '#e8d5b7' }}>
          언어를 선택하세요
        </h2>
        <p className="text-sm mb-1" style={{ color: 'rgba(232,213,183,0.5)' }}>
          Choose Your Language
        </p>
        <p className="text-xs mb-8" style={{ color: 'rgba(232,213,183,0.35)' }}>
          언제든지 변경할 수 있습니다 · You can change this anytime
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => setLang('ko')}
            className="w-full py-4 rounded-2xl font-bold text-base transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, #d4a853, #b8853a)',
              color: '#0a0510',
            }}
          >
            🇰🇷 &nbsp;한국어
          </button>
          <button
            onClick={() => setLang('en')}
            className="w-full py-4 rounded-2xl font-bold text-base transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: 'rgba(212,168,83,0.12)',
              border: '1px solid rgba(212,168,83,0.4)',
              color: '#f0c97a',
            }}
          >
            🌐 &nbsp;English
          </button>
        </div>

        <div className="w-16 h-px mx-auto mt-6" style={{ background: 'linear-gradient(90deg, transparent, rgba(212,168,83,0.7), transparent)' }} />
      </div>
    </div>
  );
}
