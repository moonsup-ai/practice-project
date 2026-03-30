'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type Lang = 'ko' | 'en';

interface LangContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  hasChosen: boolean;
}

const LangContext = createContext<LangContextType>({
  lang: 'ko',
  setLang: () => {},
  hasChosen: false,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('ko');
  const [hasChosen, setHasChosen] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('cheonmyeong_lang');
    if (saved === 'ko' || saved === 'en') {
      setLangState(saved);
      setHasChosen(true);
    } else {
      setHasChosen(false);
    }
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    setHasChosen(true);
    localStorage.setItem('cheonmyeong_lang', l);
  };

  return (
    <LangContext.Provider value={{ lang, setLang, hasChosen }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
