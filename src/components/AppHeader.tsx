import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogOut, Building2 } from 'lucide-react';
import { useBranding } from '@/contexts/BrandingContext';

interface AppHeaderProps {
  appName?: string;
  subtitle?: string;
  userName?: string;
  onLogout?: () => void;
}

export const AppHeader = ({ 
  appName = "Entregas Zap", 
  subtitle, 
  userName, 
  onLogout 
}: AppHeaderProps) => {
  const { appName: customAppName, logoUrl, hasCustomLogo } = useBranding();
  
  const displayName = customAppName || appName;

  return (
    <header className="bg-dashboard-sidebar border-b border-border shadow-card">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20 py-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24">
              {hasCustomLogo && logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt={displayName}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="p-1.5 sm:p-2 bg-gradient-primary rounded-lg">
                  <Building2 className="h-6 w-6 sm:h-7 sm:w-7 text-primary-foreground" />
                </div>
              )}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">
                {displayName}
              </h1>
              {subtitle && (
                <p className="text-sm sm:text-base text-muted-foreground truncate max-w-[150px] sm:max-w-none">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            {userName && (
              <Badge variant="secondary" className="hidden sm:flex text-base">
                {userName}
              </Badge>
            )}
            {onLogout && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className="text-muted-foreground hover:text-foreground px-2 sm:px-3"
              >
                <LogOut className="h-5 w-5 sm:mr-2" />
                <span className="text-base">Sair</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};