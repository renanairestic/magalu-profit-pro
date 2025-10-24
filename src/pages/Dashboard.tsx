import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, History, LogOut, Settings, TrendingUp, DollarSign, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PricingCalculator } from '@/components/PricingCalculator';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  full_name: string;
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [showCalculator, setShowCalculator] = useState(true);

  useEffect(() => {
    if (user) {
      supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data) setProfile(data);
        });
    }
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const stats = [
    {
      title: "Consultas Hoje",
      value: "0",
      icon: Calculator,
      description: "Cálculos realizados"
    },
    {
      title: "Margem Média",
      value: "0%",
      icon: TrendingUp,
      description: "Nos últimos 30 dias"
    },
    {
      title: "Total em Histórico",
      value: "0",
      icon: History,
      description: "Produtos calculados"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Calculator className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Magalu Price Calculator</h1>
                <p className="text-sm text-muted-foreground">
                  Bem-vindo, {profile?.full_name || user?.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Calculator Section */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Calculadora de Precificação
                </CardTitle>
                <CardDescription>
                  Calcule o preço ideal e previsão de recebimento para seus produtos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PricingCalculator />
              </CardContent>
            </Card>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Guia Rápido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-primary">1</span>
                  </div>
                  <div>
                    <p className="font-medium">Preencha os dados do produto</p>
                    <p className="text-muted-foreground">Informe preço, dimensões e peso</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-primary">2</span>
                  </div>
                  <div>
                    <p className="font-medium">Selecione o nível de despacho</p>
                    <p className="text-muted-foreground">Escolha entre os níveis disponíveis</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-primary">3</span>
                  </div>
                  <div>
                    <p className="font-medium">Veja os resultados</p>
                    <p className="text-muted-foreground">Confira a previsão de recebimento e margem</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-accent text-white">
              <CardHeader>
                <CardTitle className="text-base">Assinatura Ativa</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="opacity-90">Plano: <strong>Free Trial</strong></p>
                <p className="opacity-90">Válido até: <strong>Ilimitado</strong></p>
                <Button variant="secondary" className="w-full mt-2">
                  Fazer Upgrade
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
