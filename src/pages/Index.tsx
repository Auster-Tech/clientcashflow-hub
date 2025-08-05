
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { UserRole } from '@/types';
import { useTranslation } from '@/contexts/TranslationContext';

interface IndexProps {
  onLogin: (role: UserRole) => void;
}

const Index = ({ onLogin }: IndexProps) => {
  const { t, language, setLanguage } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleSubmit = (e: React.FormEvent, role: UserRole) => {
    e.preventDefault();
    // In a real app, you would validate credentials
    onLogin(role);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'pt' : 'en');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-secondary/20 p-4">
      <div className="w-full max-w-md space-y-8 animate-blur-in">
        <div className="text-center space-y-2">
          <div className="flex justify-center items-center gap-4 mb-6">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-primary/10 blur-xl"></div>
              <div className="relative bg-white rounded-full p-3 shadow-md">
                <CreditCard className="h-8 w-8 text-primary" />
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="gap-2"
            >
              <Globe className="h-4 w-4" />
              {language === 'en' ? 'PT' : 'EN'}
            </Button>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Tesouraria Web</h1>
          <p className="text-muted-foreground">Your accounting and financial management solution</p>
        </div>

        <Tabs defaultValue="accountant" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="accountant">Accountant</TabsTrigger>
            <TabsTrigger value="client-admin">Client</TabsTrigger>
          </TabsList>
          
          <TabsContent value="accountant">
            <Card className="border-0 shadow-lg">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Accountant Login
                </CardTitle>
                <CardDescription>
                  Log in to manage your client accounts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={(e) => handleSubmit(e, 'accountant')}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="accountant-email">Email</Label>
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
                        <Label htmlFor="accountant-password">Password</Label>
                        <Button variant="link" className="p-0 h-auto text-xs">
                          Forgot password?
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
                    <Button type="submit" className="w-full">
                      Login as Accountant
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="client-admin">
            <Card className="border-0 shadow-lg">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Client Login
                </CardTitle>
                <CardDescription>
                  Log in to manage your company finances
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={(e) => handleSubmit(e, 'client-admin')}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="client-email">Email</Label>
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
                        <Label htmlFor="client-password">Password</Label>
                        <Button variant="link" className="p-0 h-auto text-xs">
                          Forgot password?
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
                    <Button type="submit" className="w-full">
                      Login as Client
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>
            Need an account?{' '}
            <Button variant="link" className="p-0 h-auto text-sm">
              Contact your administrator
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
