import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Calculator, TrendingUp, Shield, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function Index() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  const features = [
    {
      icon: Calculator,
      title: 'Cálculo Preciso',
      description: 'Calculadora completa com todas as taxas e descontos do Magalu Marketplace'
    },
    {
      icon: TrendingUp,
      title: 'Margem de Lucro',
      description: 'Visualize sua margem de lucro em tempo real com todos os custos'
    },
    {
      icon: Shield,
      title: 'Seguro LGPD',
      description: 'Seus dados protegidos com as melhores práticas de segurança'
    },
    {
      icon: Zap,
      title: 'Histórico Completo',
      description: 'Salve e consulte seus cálculos anteriores quando precisar'
    }
  ];

  if (loading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto space-y-8">
          <div className="inline-block">
            <div className="h-20 w-20 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto shadow-glow">
              <Calculator className="h-10 w-10 text-white" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Calculadora de Precificação
            <span className="block bg-gradient-primary bg-clip-text text-transparent mt-2">
              Magalu Marketplace
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Sistema completo para sellers calcularem preços, preverem recebimentos e gerenciarem margens de lucro de forma profissional
          </p>

          <div className="flex gap-4 justify-center pt-4">
            <Button 
              size="lg" 
              onClick={() => navigate('/auth')}
              className="shadow-elegant hover:shadow-glow transition-all"
            >
              Começar Agora
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/auth')}
            >
              Fazer Login
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Tudo que você precisa para precificar
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="shadow-sm hover:shadow-elegant transition-all">
              <CardContent className="pt-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="bg-gradient-accent text-white shadow-elegant">
          <CardContent className="py-12 text-center space-y-6">
            <h2 className="text-3xl font-bold">
              Pronto para otimizar suas vendas?
            </h2>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              Junte-se aos sellers que já usam nossa calculadora para maximizar seus lucros no Magalu Marketplace
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => navigate('/auth')}
              className="mt-4"
            >
              Criar Conta Grátis
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
