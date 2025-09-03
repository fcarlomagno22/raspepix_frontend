"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';

interface ReferralContextType {
  referralCode: string | null;
  setReferralCode: (code: string | null) => void;
}

const ReferralContext = createContext<ReferralContextType | undefined>(undefined);

export function ReferralProvider({ children }: { children: React.ReactNode }) {
  const [referralCode, setReferralCode] = useState<string | null>(null);

  useEffect(() => {
    // Recupera o código do localStorage ao montar o componente
    const storedCode = localStorage.getItem('referral_code');
    if (storedCode) {
      setReferralCode(storedCode);
    }
  }, []);

  const handleSetReferralCode = (code: string | null) => {
    setReferralCode(code);
    if (code) {
      localStorage.setItem('referral_code', code);
    } else {
      localStorage.removeItem('referral_code');
    }
  };

  return (
    <ReferralContext.Provider value={{ referralCode, setReferralCode: handleSetReferralCode }}>
      {children}
    </ReferralContext.Provider>
  );
}

export function useReferral() {
  const context = useContext(ReferralContext);
  if (context === undefined) {
    throw new Error('useReferral must be used within a ReferralProvider');
  }
  return context;
}