'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const CITIES = [
  // 한국 주요 도시
  { name: '서울',     lat: 37.5665,  lng: 126.9780  },
  { name: '부산',     lat: 35.1796,  lng: 129.0756  },
  { name: '대구',     lat: 35.8714,  lng: 128.6014  },
  { name: '인천',     lat: 37.4563,  lng: 126.7052  },
  { name: '광주',     lat: 35.1595,  lng: 126.8526  },
  { name: '대전',     lat: 36.3504,  lng: 127.3845  },
  { name: '울산',     lat: 35.5384,  lng: 129.3114  },
  { name: '수원',     lat: 37.2636,  lng: 127.0286  },
  { name: '고양',     lat: 37.6584,  lng: 126.8320  },
  { name: '용인',     lat: 37.2411,  lng: 127.1775  },
  { name: '창원',     lat: 35.2279,  lng: 128.6811  },
  { name: '성남',     lat: 37.4449,  lng: 127.1388  },
  { name: '청주',     lat: 36.6424,  lng: 127.4890  },
  { name: '충주',     lat: 36.9910,  lng: 127.9259  },
  { name: '제천',     lat: 37.1326,  lng: 128.1904  },
  { name: '보은',     lat: 36.4896,  lng: 127.7296  },
  { name: '옥천',     lat: 36.3062,  lng: 127.5708  },
  { name: '영동',     lat: 36.1750,  lng: 127.7762  },
  { name: '증평',     lat: 36.7853,  lng: 127.5815  },
  { name: '진천',     lat: 36.8556,  lng: 127.4436  },
  { name: '괴산',     lat: 36.8154,  lng: 127.7870  },
  { name: '음성',     lat: 36.9401,  lng: 127.6904  },
  { name: '단양',     lat: 36.9847,  lng: 128.3655  },
  { name: '전주',     lat: 35.8242,  lng: 127.1480  },
  { name: '천안',     lat: 36.8151,  lng: 127.1139  },
  { name: '안산',     lat: 37.3219,  lng: 126.8309  },
  { name: '남양주',   lat: 37.6359,  lng: 127.2165  },
  { name: '화성',     lat: 37.1994,  lng: 126.8317  },
  { name: '안양',     lat: 37.3943,  lng: 126.9568  },
  { name: '평택',     lat: 36.9921,  lng: 127.1127  },
  { name: '의정부',   lat: 37.7382,  lng: 127.0337  },
  { name: '시흥',     lat: 37.3800,  lng: 126.8031  },
  { name: '파주',     lat: 37.7601,  lng: 126.7800  },
  { name: '김해',     lat: 35.2286,  lng: 128.8892  },
  { name: '광명',     lat: 37.4789,  lng: 126.8647  },
  { name: '포항',     lat: 36.0190,  lng: 129.3435  },
  { name: '제주',     lat: 33.4996,  lng: 126.5312  },
  { name: '진주',     lat: 35.1799,  lng: 128.1076  },
  { name: '원주',     lat: 37.3422,  lng: 127.9201  },
  { name: '경주',     lat: 35.8562,  lng: 129.2247  },
  { name: '목포',     lat: 34.8118,  lng: 126.3922  },
  { name: '여수',     lat: 34.7604,  lng: 127.6622  },
  { name: '순천',     lat: 34.9506,  lng: 127.4872  },
  { name: '춘천',     lat: 37.8813,  lng: 127.7298  },
  { name: '강릉',     lat: 37.7519,  lng: 128.8761  },
  { name: '부천',     lat: 37.5034,  lng: 126.7660  },
  { name: '김포',     lat: 37.6152,  lng: 126.7156  },
  { name: '하남',     lat: 37.5394,  lng: 127.2149  },
  { name: '구리',     lat: 37.5943,  lng: 127.1296  },
  { name: '군포',     lat: 37.3615,  lng: 126.9352  },
  { name: '오산',     lat: 37.1500,  lng: 127.0770  },
  { name: '이천',     lat: 37.2721,  lng: 127.4424  },
  { name: '안성',     lat: 37.0080,  lng: 127.2799  },
  { name: '여주',     lat: 37.2985,  lng: 127.6378  },
  { name: '양주',     lat: 37.7852,  lng: 127.0459  },
  { name: '양평',     lat: 37.4916,  lng: 127.4875  },
  { name: '가평',     lat: 37.8315,  lng: 127.5097  },
  { name: '포천',     lat: 37.8949,  lng: 127.2004  },
  { name: '동두천',   lat: 37.9037,  lng: 127.0601  },
  { name: '과천',     lat: 37.4291,  lng: 126.9876  },
  { name: '의왕',     lat: 37.3448,  lng: 126.9688  },
  { name: '광주(경기)', lat: 37.4294, lng: 127.2553  },
  // 아시아
  { name: '도쿄',     lat: 35.6895,  lng: 139.6917  },
  { name: '오사카',   lat: 34.6937,  lng: 135.5022  },
  { name: '베이징',   lat: 39.9042,  lng: 116.4074  },
  { name: '상하이',   lat: 31.2304,  lng: 121.4737  },
  { name: '홍콩',     lat: 22.3193,  lng: 114.1694  },
  { name: '대만',     lat: 25.0330,  lng: 121.5654  },
  { name: '싱가포르', lat:  1.3521,  lng: 103.8198  },
  { name: '방콕',     lat: 13.7563,  lng: 100.5018  },
  { name: '하노이',   lat: 21.0285,  lng: 105.8542  },
  { name: '자카르타', lat: -6.2088,  lng: 106.8456  },
  { name: '마닐라',   lat: 14.5995,  lng: 120.9842  },
  { name: '뭄바이',   lat: 19.0760,  lng: 72.8777   },
  { name: '델리',     lat: 28.7041,  lng: 77.1025   },
  { name: '두바이',   lat: 25.2048,  lng: 55.2708   },
  // 서양
  { name: '런던',     lat: 51.5074,  lng: -0.1278   },
  { name: '파리',     lat: 48.8566,  lng:  2.3522   },
  { name: '베를린',   lat: 52.5200,  lng: 13.4050   },
  { name: '로마',     lat: 41.9028,  lng: 12.4964   },
  { name: '마드리드', lat: 40.4168,  lng: -3.7038   },
  { name: '암스테르담', lat: 52.3676, lng: 4.9041   },
  { name: '모스크바', lat: 55.7558,  lng: 37.6173   },
  { name: '뉴욕',     lat: 40.7128,  lng: -74.0060  },
  { name: '로스앤젤레스', lat: 34.0522, lng: -118.2437 },
  { name: '시카고',   lat: 41.8781,  lng: -87.6298  },
  { name: '샌프란시스코', lat: 37.7749, lng: -122.4194 },
  { name: '토론토',   lat: 43.6532,  lng: -79.3832  },
  { name: '밴쿠버',   lat: 49.2827,  lng: -123.1207 },
  { name: '투싼',     lat: 32.2226,  lng: -110.9747 },
  { name: '시드니',   lat: -33.8688, lng: 151.2093  },
  { name: '멜버른',   lat: -37.8136, lng: 144.9631  },
];

const currentYear = new Date().getFullYear();
const YEARS  = Array.from({ length: currentYear - 1930 + 1 }, (_, i) => currentYear - i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const HOURS  = Array.from({ length: 24 }, (_, i) => i);
const MINS   = Array.from({ length: 60 }, (_, i) => i);

export default function FortunePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    year: 1990, month: 1, day: 1,
    unknownTime: false,
    hour: 12, minute: 0,
    gender: '남' as '남' | '여',
    city: '서울',
    jajasi: '야자시' as '야자시' | '조자시',
  });

  const [dayInput, setDayInput] = useState('1');

  // 도시 자동완성
  const [cityQuery, setCityQuery] = useState('서울');
  const [showCityList, setShowCityList] = useState(false);
  const cityRef = useRef<HTMLDivElement>(null);

  const filteredCities = cityQuery.trim()
    ? CITIES.filter(c => c.name.includes(cityQuery.trim()))
    : CITIES;

  const selectCity = (name: string) => {
    setCityQuery(name);
    setForm(prev => ({ ...prev, city: name }));
    setShowCityList(false);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) {
        setShowCityList(false);
        // 입력값이 유효한 도시가 아니면 이전 값으로 복구
        if (!CITIES.find(c => c.name === cityQuery)) {
          setCityQuery(form.city);
        }
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [cityQuery, form.city]);

  const set = (key: string, val: unknown) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const city = CITIES.find(c => c.name === form.city) ?? CITIES[0];
    const params = new URLSearchParams({
      name:   form.name || '익명',
      year:   String(form.year),
      month:  String(form.month),
      day:    String(form.day),
      hour:   form.unknownTime ? '12' : String(form.hour),
      minute: form.unknownTime ? '0'  : String(form.minute),
      gender: form.gender,
      lat:    String(city.lat),
      lng:    String(city.lng),
      city:   city.name,
      jajasi: form.jajasi,
    });
    router.push(`/fortune/result?${params.toString()}`);
  };

  const selectClass = `
    w-full rounded-xl px-4 py-3 text-sm font-medium appearance-none cursor-pointer
    focus:outline-none focus:ring-1 focus:ring-amber-400/50
  `;
  const selectStyle = {
    background: 'rgba(45,19,84,0.6)',
    border: '1px solid rgba(212,168,83,0.25)',
    color: '#e8d5b7',
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(180deg,#0a0510 0%,#1a0a2e 50%,#0d0820 100%)' }}
    >
      {/* 헤더 */}
      <header className="flex items-center justify-between px-6 md:px-16 py-5" style={{ borderBottom: '1px solid rgba(212,168,83,0.1)' }}>
        <Link href="/" className="flex items-center gap-3">
          <span className="text-2xl">☽</span>
          <span className="text-xl font-bold tracking-widest" style={{ color: '#d4a853' }}>천명술</span>
        </Link>
      </header>

      {/* 폼 */}
      <main className="flex-1 flex items-start justify-center px-4 py-12">
        <form onSubmit={handleSubmit} className="w-full max-w-lg space-y-6">

          {/* 타이틀 */}
          <div className="text-center mb-8">
            <p className="text-xs tracking-widest mb-2" style={{ color: '#d4a853' }}>✦ 천명 분석 ✦</p>
            <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: '#e8d5b7' }}>
              당신의 이야기를 들려주세요
            </h1>
            <p className="text-sm" style={{ color: 'rgba(232,213,183,0.55)' }}>
              사주팔자 + 서양 점성학으로 분석합니다
            </p>
          </div>

          {/* 이름 */}
          <div className="glass-card rounded-2xl p-5 space-y-3">
            <label className="text-xs tracking-widest" style={{ color: '#d4a853' }}>이름 (선택)</label>
            <input
              type="text"
              placeholder="홍길동"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-amber-400/50"
              style={{ ...selectStyle, background: 'rgba(45,19,84,0.6)' }}
            />
          </div>

          {/* 생년월일 */}
          <div className="glass-card rounded-2xl p-5 space-y-3">
            <label className="text-xs tracking-widest" style={{ color: '#d4a853' }}>생년월일</label>
            <div className="grid grid-cols-3 gap-3">
              <div className="relative">
                <select value={form.year} onChange={e => set('year', +e.target.value)} className={selectClass} style={selectStyle}>
                  {YEARS.map(y => <option key={y} value={y}>{y}년</option>)}
                </select>
              </div>
              <div className="relative">
                <select value={form.month} onChange={e => set('month', +e.target.value)} className={selectClass} style={selectStyle}>
                  {MONTHS.map(m => <option key={m} value={m}>{m}월</option>)}
                </select>
              </div>
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={dayInput}
                  onChange={e => {
                    setDayInput(e.target.value);
                    const n = parseInt(e.target.value);
                    if (n >= 1 && n <= 31) set('day', n);
                  }}
                  onBlur={() => {
                    const v = Math.min(31, Math.max(1, parseInt(dayInput) || 1));
                    set('day', v);
                    setDayInput(String(v));
                  }}
                  className={selectClass}
                  style={selectStyle}
                  placeholder="일"
                />
              </div>
            </div>
          </div>

          {/* 생시 */}
          <div className="glass-card rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs tracking-widest" style={{ color: '#d4a853' }}>출생 시간</label>
              <label className="flex items-center gap-2 cursor-pointer text-xs" style={{ color: 'rgba(232,213,183,0.6)' }}>
                <input
                  type="checkbox"
                  checked={form.unknownTime}
                  onChange={e => set('unknownTime', e.target.checked)}
                  className="accent-amber-400"
                />
                시간 모름
              </label>
            </div>
            {!form.unknownTime && (
              <div className="grid grid-cols-2 gap-3">
                <select value={form.hour} onChange={e => set('hour', +e.target.value)} className={selectClass} style={selectStyle}>
                  {HOURS.map(h => (
                    <option key={h} value={h}>
                      {h.toString().padStart(2, '0')}시 ({h < 12 ? '오전' : '오후'} {h === 0 ? 12 : h > 12 ? h - 12 : h}시)
                    </option>
                  ))}
                </select>
                <select value={form.minute} onChange={e => set('minute', +e.target.value)} className={selectClass} style={selectStyle}>
                  {MINS.map(m => <option key={m} value={m}>{m.toString().padStart(2, '0')}분</option>)}
                </select>
              </div>
            )}
            {form.unknownTime && (
              <p className="text-xs" style={{ color: 'rgba(232,213,183,0.4)' }}>
                시간 미상 시 정오(12:00) 기준으로 계산됩니다. 시주(時柱)는 참고용으로만 보세요.
              </p>
            )}

            {/* 야자시/조자시 */}
            {!form.unknownTime && (
              <div className="pt-1">
                <p className="text-xs mb-2" style={{ color: 'rgba(212,168,83,0.7)' }}>자시(子時) 학파 선택</p>
                <div className="flex gap-3">
                  {(['야자시', '조자시'] as const).map(opt => (
                    <label key={opt} className="flex items-center gap-2 cursor-pointer">
                      <div
                        className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
                        style={{
                          borderColor: form.jajasi === opt ? '#d4a853' : 'rgba(212,168,83,0.3)',
                          background:  form.jajasi === opt ? 'rgba(212,168,83,0.2)' : 'transparent',
                        }}
                      >
                        {form.jajasi === opt && <div className="w-2 h-2 rounded-full" style={{ background: '#d4a853' }} />}
                      </div>
                      <input type="radio" name="jajasi" value={opt} checked={form.jajasi === opt} onChange={() => set('jajasi', opt)} className="sr-only" />
                      <span className="text-sm" style={{ color: form.jajasi === opt ? '#f0c97a' : 'rgba(232,213,183,0.65)' }}>
                        {opt}
                      </span>
                    </label>
                  ))}
                </div>
                <p className="text-xs mt-1.5" style={{ color: 'rgba(232,213,183,0.35)' }}>
                  {form.jajasi === '야자시'
                    ? '야자시: 23시생은 당일 일주 유지'
                    : '조자시: 23시 이후는 다음날 일주 적용'}
                </p>
              </div>
            )}
          </div>

          {/* 성별 */}
          <div className="glass-card rounded-2xl p-5 space-y-3">
            <label className="text-xs tracking-widest" style={{ color: '#d4a853' }}>성별 (대운 계산 기준)</label>
            <div className="flex gap-4">
              {(['남', '여'] as const).map(g => (
                <label key={g} className="flex items-center gap-2 cursor-pointer">
                  <div
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
                    style={{
                      borderColor: form.gender === g ? '#d4a853' : 'rgba(212,168,83,0.3)',
                      background: form.gender === g ? 'rgba(212,168,83,0.2)' : 'transparent',
                    }}
                  >
                    {form.gender === g && <div className="w-2 h-2 rounded-full" style={{ background: '#d4a853' }} />}
                  </div>
                  <input type="radio" name="gender" value={g} checked={form.gender === g} onChange={() => set('gender', g)} className="sr-only" />
                  <span className="text-sm" style={{ color: form.gender === g ? '#f0c97a' : 'rgba(232,213,183,0.65)' }}>
                    {g === '남' ? '남성' : '여성'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* 출생지 */}
          <div className="glass-card rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs tracking-widest" style={{ color: '#d4a853' }}>출생 도시</label>
              <span className="text-xs" style={{ color: 'rgba(232,213,183,0.4)' }}>서양 점성학 계산에 사용</span>
            </div>
            <div className="relative" ref={cityRef}>
              <input
                type="text"
                value={cityQuery}
                placeholder="도시명 입력 (예: 서울, 부산)"
                autoComplete="off"
                className={selectClass}
                style={selectStyle}
                onChange={e => {
                  setCityQuery(e.target.value);
                  setShowCityList(true);
                }}
                onFocus={() => setShowCityList(true)}
              />
              {showCityList && filteredCities.length > 0 && (
                <ul
                  className="absolute z-50 w-full mt-1 rounded-xl overflow-auto"
                  style={{
                    background: 'rgba(30,10,60,0.97)',
                    border: '1px solid rgba(212,168,83,0.3)',
                    maxHeight: '200px',
                  }}
                >
                  {filteredCities.map(c => (
                    <li
                      key={c.name}
                      onMouseDown={() => selectCity(c.name)}
                      className="px-4 py-2.5 text-sm cursor-pointer transition-colors"
                      style={{
                        color: form.city === c.name ? '#f0c97a' : '#e8d5b7',
                        background: form.city === c.name ? 'rgba(212,168,83,0.15)' : 'transparent',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(212,168,83,0.1)')}
                      onMouseLeave={e => (e.currentTarget.style.background = form.city === c.name ? 'rgba(212,168,83,0.15)' : 'transparent')}
                    >
                      {c.name}
                    </li>
                  ))}
                </ul>
              )}
              {showCityList && filteredCities.length === 0 && (
                <div
                  className="absolute z-50 w-full mt-1 rounded-xl px-4 py-3 text-sm"
                  style={{
                    background: 'rgba(30,10,60,0.97)',
                    border: '1px solid rgba(212,168,83,0.3)',
                    color: 'rgba(232,213,183,0.5)',
                  }}
                >
                  검색 결과 없음
                </div>
              )}
            </div>
          </div>

          {/* 제출 */}
          <button
            type="submit"
            className="glow-card w-full py-4 rounded-2xl font-bold text-base transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg,#d4a853,#b8853a)',
              color: '#0a0510',
            }}
          >
            ✨ 운명 분석 시작하기
          </button>

          <p className="text-center text-xs" style={{ color: 'rgba(232,213,183,0.35)' }}>
            모든 계산은 브라우저에서 직접 처리됩니다
          </p>
        </form>
      </main>
    </div>
  );
}
