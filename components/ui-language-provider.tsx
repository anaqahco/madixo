'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';
import {
  getClientUiLanguage,
  getDirection,
  setClientUiLanguage,
  type UiLanguage,
} from '@/lib/ui-language';

type UiLanguageStateContextValue = {
  uiLang: UiLanguage;
  setUiLang: Dispatch<SetStateAction<UiLanguage>>;
};

const InitialUiLanguageContext = createContext<UiLanguage>('en');
const UiLanguageStateContext = createContext<UiLanguageStateContextValue | null>(null);

export function UiLanguageProvider({
  initialUiLang,
  children,
}: {
  initialUiLang: UiLanguage;
  children: ReactNode;
}) {
  const [uiLang, setUiLang] = useState<UiLanguage>(initialUiLang);

  useEffect(() => {
    const syncFromBrowser = () => {
      const nextUiLang = getClientUiLanguage(initialUiLang);
      setUiLang((currentUiLang) =>
        currentUiLang === nextUiLang ? currentUiLang : nextUiLang
      );
    };

    syncFromBrowser();
    window.addEventListener('popstate', syncFromBrowser);

    return () => window.removeEventListener('popstate', syncFromBrowser);
  }, [initialUiLang]);

  useEffect(() => {
    setClientUiLanguage(uiLang);

    document.documentElement.lang = uiLang;
    document.documentElement.dir = getDirection(uiLang);
  }, [uiLang]);

  const value = useMemo(() => ({ uiLang, setUiLang }), [uiLang]);

  return (
    <InitialUiLanguageContext.Provider value={initialUiLang}>
      <UiLanguageStateContext.Provider value={value}>
        {children}
      </UiLanguageStateContext.Provider>
    </InitialUiLanguageContext.Provider>
  );
}

export function useInitialUiLanguage() {
  return useContext(InitialUiLanguageContext);
}

export function useUiLanguageState(): [UiLanguage, Dispatch<SetStateAction<UiLanguage>>] {
  const context = useContext(UiLanguageStateContext);

  if (!context) {
    throw new Error('useUiLanguageState must be used within UiLanguageProvider');
  }

  return useMemo(() => [context.uiLang, context.setUiLang], [context]);
}
