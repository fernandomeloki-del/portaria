import React, { createContext, useContext, useState, useEffect } from 'react';
import { LogoProcessor } from '@/utils/logoProcessor';

interface BrandingContextType {
  appName: string;
  appDescription: string;
  logoUrl: string | null;
  hasCustomLogo: boolean;
  updateBranding: (data: Partial<BrandingData>) => void;
  refreshBranding: () => void;
}

interface BrandingData {
  appName: string;
  appDescription: string;
  logoUrl: string;
  hasCustomLogo: boolean;
}

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

export const useBranding = () => {
  const context = useContext(BrandingContext);
  if (!context) {
    throw new Error('useBranding must be used within a BrandingProvider');
  }
  return context;
};

interface BrandingProviderProps {
  children: React.ReactNode;
}

export const BrandingProvider: React.FC<BrandingProviderProps> = ({ children }) => {
  const [brandingData, setBrandingData] = useState<BrandingData>({
    appName: 'Entregas Zap',
    appDescription: 'Sistema de Gestão de Entregas',
    logoUrl: '',
    hasCustomLogo: false
  });

  const loadBranding = () => {
    // Load from localStorage
    const stored = localStorage.getItem('app_branding');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setBrandingData(prev => ({
          ...prev,
          ...parsed
        }));
      } catch (error) {
        console.error('Error parsing branding data:', error);
      }
    }

    // Load custom logo
    const customLogoUrl = LogoProcessor.getCustomLogoURL();
    if (customLogoUrl) {
      setBrandingData(prev => ({
        ...prev,
        logoUrl: customLogoUrl,
        hasCustomLogo: true
      }));
    }
  };

  useEffect(() => {
    loadBranding();
    
    // Listen for localStorage changes (from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'app_branding' || e.key === 'custom_logo_data') {
        loadBranding();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const updateBranding = (data: Partial<BrandingData>) => {
    setBrandingData(prev => ({ ...prev, ...data }));
  };

  const refreshBranding = () => {
    loadBranding();
  };

  const value: BrandingContextType = {
    appName: brandingData.appName,
    appDescription: brandingData.appDescription,
    logoUrl: brandingData.logoUrl,
    hasCustomLogo: brandingData.hasCustomLogo,
    updateBranding,
    refreshBranding
  };

  return (
    <BrandingContext.Provider value={value}>
      {children}
    </BrandingContext.Provider>
  );
};