'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { track } from '@vercel/analytics';
import { useLang } from '@/lib/lang';
import { t } from '@/lib/translations';

const CITIES = [
  // 한국 주요 도시
  { name: '서울',       nameEn: 'Seoul',              lat: 37.5665,  lng: 126.9780  },
  { name: '부산',       nameEn: 'Busan',              lat: 35.1796,  lng: 129.0756  },
  { name: '대구',       nameEn: 'Daegu',              lat: 35.8714,  lng: 128.6014  },
  { name: '인천',       nameEn: 'Incheon',            lat: 37.4563,  lng: 126.7052  },
  { name: '광주',       nameEn: 'Gwangju',            lat: 35.1595,  lng: 126.8526  },
  { name: '대전',       nameEn: 'Daejeon',            lat: 36.3504,  lng: 127.3845  },
  { name: '울산',       nameEn: 'Ulsan',              lat: 35.5384,  lng: 129.3114  },
  { name: '수원',       nameEn: 'Suwon',              lat: 37.2636,  lng: 127.0286  },
  { name: '고양',       nameEn: 'Goyang',             lat: 37.6584,  lng: 126.8320  },
  { name: '용인',       nameEn: 'Yongin',             lat: 37.2411,  lng: 127.1775  },
  { name: '창원',       nameEn: 'Changwon',           lat: 35.2279,  lng: 128.6811  },
  { name: '성남',       nameEn: 'Seongnam',           lat: 37.4449,  lng: 127.1388  },
  { name: '청주',       nameEn: 'Cheongju',           lat: 36.6424,  lng: 127.4890  },
  { name: '충주',       nameEn: 'Chungju',            lat: 36.9910,  lng: 127.9259  },
  { name: '제천',       nameEn: 'Jecheon',            lat: 37.1326,  lng: 128.1904  },
  { name: '보은',       nameEn: 'Boeun',              lat: 36.4896,  lng: 127.7296  },
  { name: '옥천',       nameEn: 'Okcheon',            lat: 36.3062,  lng: 127.5708  },
  { name: '영동',       nameEn: 'Yeongdong',          lat: 36.1750,  lng: 127.7762  },
  { name: '증평',       nameEn: 'Jeungpyeong',        lat: 36.7853,  lng: 127.5815  },
  { name: '진천',       nameEn: 'Jincheon',           lat: 36.8556,  lng: 127.4436  },
  { name: '괴산',       nameEn: 'Goesan',             lat: 36.8154,  lng: 127.7870  },
  { name: '음성',       nameEn: 'Eumseong',           lat: 36.9401,  lng: 127.6904  },
  { name: '단양',       nameEn: 'Danyang',            lat: 36.9847,  lng: 128.3655  },
  { name: '전주',       nameEn: 'Jeonju',             lat: 35.8242,  lng: 127.1480  },
  { name: '천안',       nameEn: 'Cheonan',            lat: 36.8151,  lng: 127.1139  },
  { name: '안산',       nameEn: 'Ansan',              lat: 37.3219,  lng: 126.8309  },
  { name: '남양주',     nameEn: 'Namyangju',          lat: 37.6359,  lng: 127.2165  },
  { name: '화성',       nameEn: 'Hwaseong',           lat: 37.1994,  lng: 126.8317  },
  { name: '안양',       nameEn: 'Anyang',             lat: 37.3943,  lng: 126.9568  },
  { name: '평택',       nameEn: 'Pyeongtaek',         lat: 36.9921,  lng: 127.1127  },
  { name: '의정부',     nameEn: 'Uijeongbu',          lat: 37.7382,  lng: 127.0337  },
  { name: '시흥',       nameEn: 'Siheung',            lat: 37.3800,  lng: 126.8031  },
  { name: '파주',       nameEn: 'Paju',               lat: 37.7601,  lng: 126.7800  },
  { name: '김해',       nameEn: 'Gimhae',             lat: 35.2286,  lng: 128.8892  },
  { name: '광명',       nameEn: 'Gwangmyeong',        lat: 37.4789,  lng: 126.8647  },
  { name: '포항',       nameEn: 'Pohang',             lat: 36.0190,  lng: 129.3435  },
  { name: '제주',       nameEn: 'Jeju',               lat: 33.4996,  lng: 126.5312  },
  { name: '진주',       nameEn: 'Jinju',              lat: 35.1799,  lng: 128.1076  },
  { name: '원주',       nameEn: 'Wonju',              lat: 37.3422,  lng: 127.9201  },
  { name: '경주',       nameEn: 'Gyeongju',           lat: 35.8562,  lng: 129.2247  },
  { name: '목포',       nameEn: 'Mokpo',              lat: 34.8118,  lng: 126.3922  },
  { name: '여수',       nameEn: 'Yeosu',              lat: 34.7604,  lng: 127.6622  },
  { name: '순천',       nameEn: 'Suncheon',           lat: 34.9506,  lng: 127.4872  },
  { name: '춘천',       nameEn: 'Chuncheon',          lat: 37.8813,  lng: 127.7298  },
  { name: '강릉',       nameEn: 'Gangneung',          lat: 37.7519,  lng: 128.8761  },
  { name: '부천',       nameEn: 'Bucheon',            lat: 37.5034,  lng: 126.7660  },
  { name: '김포',       nameEn: 'Gimpo',              lat: 37.6152,  lng: 126.7156  },
  { name: '하남',       nameEn: 'Hanam',              lat: 37.5394,  lng: 127.2149  },
  { name: '구리',       nameEn: 'Guri',               lat: 37.5943,  lng: 127.1296  },
  { name: '군포',       nameEn: 'Gunpo',              lat: 37.3615,  lng: 126.9352  },
  { name: '오산',       nameEn: 'Osan',               lat: 37.1500,  lng: 127.0770  },
  { name: '이천',       nameEn: 'Icheon',             lat: 37.2721,  lng: 127.4424  },
  { name: '안성',       nameEn: 'Anseong',            lat: 37.0080,  lng: 127.2799  },
  { name: '여주',       nameEn: 'Yeoju',              lat: 37.2985,  lng: 127.6378  },
  { name: '양주',       nameEn: 'Yangju',             lat: 37.7852,  lng: 127.0459  },
  { name: '양평',       nameEn: 'Yangpyeong',         lat: 37.4916,  lng: 127.4875  },
  { name: '가평',       nameEn: 'Gapyeong',           lat: 37.8315,  lng: 127.5097  },
  { name: '포천',       nameEn: 'Pocheon',            lat: 37.8949,  lng: 127.2004  },
  { name: '동두천',     nameEn: 'Dongducheon',        lat: 37.9037,  lng: 127.0601  },
  { name: '과천',       nameEn: 'Gwacheon',           lat: 37.4291,  lng: 126.9876  },
  { name: '의왕',       nameEn: 'Uiwang',             lat: 37.3448,  lng: 126.9688  },
  { name: '광주(경기)', nameEn: 'Gwangju (Gyeonggi)', lat: 37.4294,  lng: 127.2553  },
  // 아시아
  { name: '도쿄',       nameEn: 'Tokyo',              lat: 35.6895,  lng: 139.6917  },
  { name: '오사카',     nameEn: 'Osaka',              lat: 34.6937,  lng: 135.5022  },
  { name: '베이징',     nameEn: 'Beijing',            lat: 39.9042,  lng: 116.4074  },
  { name: '상하이',     nameEn: 'Shanghai',           lat: 31.2304,  lng: 121.4737  },
  { name: '홍콩',       nameEn: 'Hong Kong',          lat: 22.3193,  lng: 114.1694  },
  { name: '대만',       nameEn: 'Taipei',             lat: 25.0330,  lng: 121.5654  },
  { name: '싱가포르',   nameEn: 'Singapore',          lat:  1.3521,  lng: 103.8198  },
  { name: '방콕',       nameEn: 'Bangkok',            lat: 13.7563,  lng: 100.5018  },
  { name: '하노이',     nameEn: 'Hanoi',              lat: 21.0285,  lng: 105.8542  },
  { name: '자카르타',   nameEn: 'Jakarta',            lat: -6.2088,  lng: 106.8456  },
  { name: '마닐라',     nameEn: 'Manila',             lat: 14.5995,  lng: 120.9842  },
  { name: '뭄바이',     nameEn: 'Mumbai',             lat: 19.0760,  lng: 72.8777   },
  { name: '델리',       nameEn: 'Delhi',              lat: 28.7041,  lng: 77.1025   },
  { name: '두바이',     nameEn: 'Dubai',              lat: 25.2048,  lng: 55.2708   },
  // 서양
  { name: '런던',       nameEn: 'London',             lat: 51.5074,  lng: -0.1278   },
  { name: '파리',       nameEn: 'Paris',              lat: 48.8566,  lng:  2.3522   },
  { name: '베를린',     nameEn: 'Berlin',             lat: 52.5200,  lng: 13.4050   },
  { name: '로마',       nameEn: 'Rome',               lat: 41.9028,  lng: 12.4964   },
  { name: '마드리드',   nameEn: 'Madrid',             lat: 40.4168,  lng: -3.7038   },
  { name: '암스테르담', nameEn: 'Amsterdam',          lat: 52.3676,  lng: 4.9041    },
  { name: '모스크바',   nameEn: 'Moscow',             lat: 55.7558,  lng: 37.6173   },
  { name: '뉴욕',       nameEn: 'New York',           lat: 40.7128,  lng: -74.0060  },
  { name: '로스앤젤레스', nameEn: 'Los Angeles',      lat: 34.0522,  lng: -118.2437 },
  { name: '시카고',     nameEn: 'Chicago',            lat: 41.8781,  lng: -87.6298  },
  { name: '샌프란시스코', nameEn: 'San Francisco',    lat: 37.7749,  lng: -122.4194 },
  { name: '토론토',     nameEn: 'Toronto',            lat: 43.6532,  lng: -79.3832  },
  { name: '밴쿠버',     nameEn: 'Vancouver',          lat: 49.2827,  lng: -123.1207 },
  { name: '투싼',       nameEn: 'Tucson',             lat: 32.2226,  lng: -110.9747 },
  { name: '시드니',     nameEn: 'Sydney',             lat: -33.8688, lng: 151.2093  },
  { name: '멜버른',     nameEn: 'Melbourne',          lat: -37.8136, lng: 144.9631  },
];

const currentYear = new Date().getFullYear();
const YEARS  = Array.from({ length: currentYear - 1930 + 1 }, (_, i) => currentYear - i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const HOURS  = Array.from({ length: 24 }, (_, i) => i);
const MINS   = Array.from({ length: 60 }, (_, i) => i);

export default function FortunePage() {
  const router = useRouter();
  const { lang } = useLang();
  const f = t.form;
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
  const [cityQuery, setCityQuery] = useState(() => lang === 'ko' ? '서울' : 'Seoul');
  const [showCityList, setShowCityList] = useState(false);
  const cityRef = useRef<HTMLDivElement>(null);

  const getCityDisplay = (c: typeof CITIES[0]) => lang === 'ko' ? c.name : c.nameEn;

  const filteredCities = cityQuery.trim()
    ? CITIES.filter(c => getCityDisplay(c).toLowerCase().includes(cityQuery.trim().toLowerCase()))
    : CITIES;

  const selectCity = (korName: string) => {
    const city = CITIES.find(c => c.name === korName)!;
    setCityQuery(getCityDisplay(city));
    setForm(prev => ({ ...prev, city: korName }));
    setShowCityList(false);
  };

  useEffect(() => {
    const currentCity = CITIES.find(c => c.name === form.city);
    if (currentCity) setCityQuery(getCityDisplay(currentCity));
  }, [lang]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) {
        setShowCityList(false);
        const valid = lang === 'ko'
          ? CITIES.find(c => c.name === cityQuery)
          : CITIES.find(c => c.nameEn === cityQuery);
        if (!valid) {
          const currentCity = CITIES.find(c => c.name === form.city);
          setCityQuery(currentCity ? getCityDisplay(currentCity) : (lang === 'ko' ? '서울' : 'Seoul'));
        }
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler as EventListener);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler as EventListener);
    };
  }, [cityQuery, form.city, lang]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (key: string, val: unknown) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    track('fortune_started', {
      city: form.city,
      gender: form.gender,
      unknown_time: form.unknownTime,
    });
    const city = CITIES.find(c => c.name === form.city) ?? CITIES[0];
    const params = new URLSearchParams({
      name:   form.name || (lang === 'ko' ? '익명' : 'Anonymous'),
      year:   String(form.year),
      month:  String(form.month),
      day:    String(form.day),
      hour:   form.unknownTime ? '12' : String(form.hour),
      minute: form.unknownTime ? '0'  : String(form.minute),
      gender: form.gender,
      lat:    String(city.lat),
      lng:    String(city.lng),
      city:   lang === 'ko' ? city.name : city.nameEn,
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
          <span className="text-xl font-bold tracking-widest" style={{ color: '#d4a853' }}>{lang === 'ko' ? '천명술' : 'Cheonmyeongsul'}</span>
        </Link>
      </header>

      {/* 폼 */}
      <main className="flex-1 flex items-start justify-center px-4 py-12">
        <form onSubmit={handleSubmit} className="w-full max-w-lg space-y-6">

          {/* 타이틀 */}
          <div className="text-center mb-8">
            <p className="text-xs tracking-widest mb-2" style={{ color: '#d4a853' }}>{f.badge[lang]}</p>
            <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: '#e8d5b7' }}>
              {f.title[lang]}
            </h1>
            <p className="text-sm" style={{ color: 'rgba(232,213,183,0.55)' }}>
              {f.subtitle[lang]}
            </p>
          </div>

          {/* 이름 */}
          <div className="glass-card rounded-2xl p-5 space-y-3">
            <label className="text-xs tracking-widest" style={{ color: '#d4a853' }}>{f.name[lang]}</label>
            <input
              type="text"
              placeholder={f.namePlaceholder[lang]}
              value={form.name}
              onChange={e => set('name', e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-amber-400/50"
              style={{ ...selectStyle, background: 'rgba(45,19,84,0.6)' }}
            />
          </div>

          {/* 생년월일 */}
          <div className="glass-card rounded-2xl p-5 space-y-3">
            <label className="text-xs tracking-widest" style={{ color: '#d4a853' }}>{f.birthDate[lang]}</label>
            <div className="grid grid-cols-3 gap-3">
              <div className="relative">
                <select value={form.year} onChange={e => set('year', +e.target.value)} className={selectClass} style={selectStyle}>
                  {YEARS.map(y => <option key={y} value={y}>{y}{f.yearSuffix[lang]}</option>)}
                </select>
              </div>
              <div className="relative">
                <select value={form.month} onChange={e => set('month', +e.target.value)} className={selectClass} style={selectStyle}>
                  {MONTHS.map(m => <option key={m} value={m}>{lang === 'ko' ? `${m}월` : m}</option>)}
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
                  placeholder={lang === 'ko' ? '일' : 'DD'}
                />
              </div>
            </div>
          </div>

          {/* 생시 */}
          <div className="glass-card rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs tracking-widest" style={{ color: '#d4a853' }}>{f.birthTime[lang]}</label>
              <label className="flex items-center gap-2 cursor-pointer text-xs" style={{ color: 'rgba(232,213,183,0.6)' }}>
                <input
                  type="checkbox"
                  checked={form.unknownTime}
                  onChange={e => set('unknownTime', e.target.checked)}
                  className="accent-amber-400"
                />
                {f.unknownTime[lang]}
              </label>
            </div>
            {!form.unknownTime && (
              <div className="grid grid-cols-2 gap-3">
                <select value={form.hour} onChange={e => set('hour', +e.target.value)} className={selectClass} style={selectStyle}>
                  {HOURS.map(h => (
                    <option key={h} value={h}>
                      {lang === 'ko'
                        ? `${h.toString().padStart(2, '0')}시 (${h < 12 ? '오전' : '오후'} ${h === 0 ? 12 : h > 12 ? h - 12 : h}시)`
                        : `${h.toString().padStart(2, '0')}:00 (${h < 12 ? 'AM' : 'PM'} ${h === 0 ? 12 : h > 12 ? h - 12 : h})`
                      }
                    </option>
                  ))}
                </select>
                <select value={form.minute} onChange={e => set('minute', +e.target.value)} className={selectClass} style={selectStyle}>
                  {MINS.map(m => <option key={m} value={m}>{m.toString().padStart(2, '0')}{lang === 'ko' ? '분' : ''}</option>)}
                </select>
              </div>
            )}
            {form.unknownTime && (
              <p className="text-xs" style={{ color: 'rgba(232,213,183,0.4)' }}>
                {f.unknownNote[lang]}
              </p>
            )}

            {/* 야자시/조자시 - 23시에만 표시 */}
            {!form.unknownTime && form.hour === 23 && (
              <div className="pt-1 rounded-xl px-3 py-2.5" style={{ background: 'rgba(212,168,83,0.06)', border: '1px solid rgba(212,168,83,0.2)' }}>
                <p className="text-xs mb-2" style={{ color: 'rgba(212,168,83,0.8)' }}>
                  {lang === 'ko' ? '자정(23:00~00:00) 출생 — 일주 설정' : 'Born near midnight (23:00~00:00) — Day Pillar Setting'}
                </p>
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
                        {lang === 'ko'
                          ? (opt === '야자시' ? '야자시 (오늘 일주)' : '조자시 (내일 일주)')
                          : (opt === '야자시' ? "Late Zi (today's pillar)" : "Early Zi (tomorrow's pillar)")
                        }
                      </span>
                    </label>
                  ))}
                </div>
                <p className="text-xs mt-1.5" style={{ color: 'rgba(232,213,183,0.35)' }}>
                  {lang === 'ko'
                    ? '잘 모르겠다면 야자시(기본값)를 선택하세요.'
                    : 'If unsure, leave as Late Zi (default).'}
                </p>
              </div>
            )}
          </div>

          {/* 성별 */}
          <div className="glass-card rounded-2xl p-5 space-y-3">
            <label className="text-xs tracking-widest" style={{ color: '#d4a853' }}>{f.gender[lang]}</label>
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
                    {g === '남' ? f.male[lang] : f.female[lang]}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* 출생지 */}
          <div className="glass-card rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs tracking-widest" style={{ color: '#d4a853' }}>{f.city[lang]}</label>
              <span className="text-xs" style={{ color: 'rgba(232,213,183,0.4)' }}>{f.cityNote[lang]}</span>
            </div>
            <div className="relative" ref={cityRef}>
              <input
                type="text"
                value={cityQuery}
                placeholder={f.cityPlaceholder[lang]}
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
                      onTouchEnd={e => { e.preventDefault(); selectCity(c.name); }}
                      className="px-4 py-2.5 text-sm cursor-pointer transition-colors"
                      style={{
                        color: form.city === c.name ? '#f0c97a' : '#e8d5b7',
                        background: form.city === c.name ? 'rgba(212,168,83,0.15)' : 'transparent',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(212,168,83,0.1)')}
                      onMouseLeave={e => (e.currentTarget.style.background = form.city === c.name ? 'rgba(212,168,83,0.15)' : 'transparent')}
                    >
                      {getCityDisplay(c)}
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
                  {f.cityNoResult[lang]}
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
            {f.submit[lang]}
          </button>

          <p className="text-center text-xs" style={{ color: 'rgba(232,213,183,0.35)' }}>
            {f.privacy[lang]}
          </p>
        </form>
      </main>
    </div>
  );
}
