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
import { getClientUiLanguage, type UiLanguage } from '@/lib/ui-language';

const UiLanguageContext = createContext<UiLanguage>('en');

export function UiLanguageProvider({
  initialUiLang,
  children,
}: {
  initialUiLang: UiLanguage;
  children: ReactNode;
}) {
  return (
    <UiLanguageContext.Provider value={initialUiLang}>
      {children}
    </UiLanguageContext.Provider>
  );
}

export function useInitialUiLanguage() {
  return useContext(UiLanguageContext);
}

export function useUiLanguageState(): [
  UiLanguage,
  Dispatch<SetStateAction<UiLanguage>>,
] {
  const initialUiLang = useInitialUiLanguage();
  const [uiLang, setUiLang] = useState<UiLanguage>(initialUiLang);

  useEffect(() => {
    const resolvedUiLang = getClientUiLanguage(initialUiLang);
    setUiLang((currentUiLang) =>
      currentUiLang === resolvedUiLang ? currentUiLang : resolvedUiLang
    );
  }, [initialUiLang]);

  return useMemo(() => [uiLang, setUiLang], [uiLang]);
}
