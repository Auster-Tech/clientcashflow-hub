
import React from 'react';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { useTranslation } from '@/contexts/TranslationContext';
import { cn } from '@/lib/utils';

interface LanguageToggleProps {
  collapsed: boolean;
}

export function LanguageToggle({ collapsed }: LanguageToggleProps) {
  const { language, setLanguage, t } = useTranslation();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'pt' : 'en');
  };

  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start gap-3 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
      )}
      onClick={toggleLanguage}
    >
      <Globe className="h-5 w-5" />
      <span className={cn(
        "transition-all overflow-hidden",
        collapsed ? "w-0 opacity-0" : "opacity-100"
      )}>
        {t('language.toggle')} ({language === 'en' ? t('language.english') : t('language.portuguese')})
      </span>
    </Button>
  );
}
