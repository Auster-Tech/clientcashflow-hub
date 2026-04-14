
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { CreditCard, Building, LineChart, Globe } from 'lucide-react';
import { useTranslation } from '@/contexts/TranslationContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const { t, language, setLanguage } = useTranslation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent, role: string) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password, role);
    } catch (err: any) {
      toast({
        title: 'Erro ao entrar',
        description: err.message || 'Verifique suas credenciais.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'pt' : 'en');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-secondary/20 p-4">
      <div className="w-full max-w-md space-y-8 animate-blur-in">
        <div className="text-center space-y-2">
          <div className="flex justify-center items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="gap-2"
            >
              <Globe className="h-4 w-4" />
              {language === 'en' ? 'EN' : 'PT'}
            </Button>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Tesouraria Web</h1>
          <p className="text-muted-foreground">{t('index.subtitle')}</p>
        </div>

        <Tabs defaultValue="accountant" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="accountant">{t('common.accountant')}</TabsTrigger>
            <TabsTrigger value="client_user">{t('common.client')}</TabsTrigger>
          </TabsList>

          <TabsContent value="accountant">
            <Card className="border-0 shadow-lg">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  {t('index.acclogin')}
                </CardTitle>
                <CardDescription>
                  {t('index.acclogindesc')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={(e) => handleSubmit(e, 'accountant')}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="accountant-email">{t('index.email')}</Label>
                      <Input
                        id="accountant-email"
                        type="email"
                        placeholder="name@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="accountant-password">{t('index.password')}</Label>
                        <Button variant="link" className="p-0 h-auto text-xs">
                          {t('index.forgotpass')}
                        </Button>
                      </div>
                      <Input
                        id="accountant-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Entrando...' : t("index.accloginbutton")}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="client_user">
            <Card className="border-0 shadow-lg">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  {t('index.clilogin')}
                </CardTitle>
                <CardDescription>
                  {t('index.clilogindesc')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={(e) => handleSubmit(e, 'client_user')}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="client-email">{t('index.email')}</Label>
                      <Input
                        id="client-email"
                        type="email"
                        placeholder="name@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="client-password">{t('index.password')}</Label>
                        <Button variant="link" className="p-0 h-auto text-xs">
                          {t('index.forgotpass')}
                        </Button>
                      </div>
                      <Input
                        id="client-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Entrando...' : t('index.cliloginbutton')}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>
            {t('index.needacc')+'   '}
            <Button variant="link" className="p-0 h-auto text-sm">
              {t('common.contactadm')}
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
