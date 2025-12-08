import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Sparkles, 
  Users, 
  Rocket, 
  Globe, 
  ShoppingCart, 
  Newspaper,
  Building,
  ArrowRight,
  ArrowLeft,
  Check,
  Zap,
  Server,
  Cloud
} from 'lucide-react';

interface QuizOption {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  value: number;
}

interface QuizStep {
  question: string;
  subtitle: string;
  options: QuizOption[];
}

const quizSteps: QuizStep[] = [
  {
    question: "What type of website are you building?",
    subtitle: "This helps us understand your technical needs",
    options: [
      { id: 'blog', label: 'Blog / Portfolio', description: 'Personal site or content blog', icon: <Newspaper className="h-6 w-6" />, value: 1 },
      { id: 'business', label: 'Business Website', description: 'Company site with multiple pages', icon: <Building className="h-6 w-6" />, value: 2 },
      { id: 'ecommerce', label: 'E-commerce Store', description: 'Online shop with products', icon: <ShoppingCart className="h-6 w-6" />, value: 3 },
      { id: 'webapp', label: 'Web Application', description: 'SaaS or custom application', icon: <Globe className="h-6 w-6" />, value: 4 },
    ]
  },
  {
    question: "How much traffic do you expect monthly?",
    subtitle: "Estimate your monthly visitors",
    options: [
      { id: 'starter', label: 'Just Starting', description: 'Under 10,000 visitors', icon: <Users className="h-6 w-6" />, value: 1 },
      { id: 'growing', label: 'Growing', description: '10,000 - 100,000 visitors', icon: <Users className="h-6 w-6" />, value: 2 },
      { id: 'established', label: 'Established', description: '100,000 - 500,000 visitors', icon: <Users className="h-6 w-6" />, value: 3 },
      { id: 'enterprise', label: 'High Traffic', description: '500,000+ visitors', icon: <Users className="h-6 w-6" />, value: 4 },
    ]
  },
  {
    question: "Which CMS or platform will you use?",
    subtitle: "Select your preferred content management system",
    options: [
      { id: 'wordpress', label: 'WordPress', description: 'Most popular CMS worldwide', icon: <Globe className="h-6 w-6" />, value: 1 },
      { id: 'shopify', label: 'WooCommerce / Magento', description: 'E-commerce platforms', icon: <ShoppingCart className="h-6 w-6" />, value: 2 },
      { id: 'custom', label: 'Custom / Node.js', description: 'Custom built application', icon: <Rocket className="h-6 w-6" />, value: 3 },
      { id: 'unsure', label: 'Not Sure Yet', description: "I'll decide later", icon: <Sparkles className="h-6 w-6" />, value: 1 },
    ]
  },
  {
    question: "Do you need to scale quickly?",
    subtitle: "Planning for growth and traffic spikes",
    options: [
      { id: 'no', label: 'Steady Growth', description: 'Predictable, gradual scaling', icon: <Zap className="h-6 w-6" />, value: 1 },
      { id: 'maybe', label: 'Moderate Scaling', description: 'Some seasonal peaks', icon: <Zap className="h-6 w-6" />, value: 2 },
      { id: 'yes', label: 'Rapid Scaling', description: 'Frequent traffic spikes', icon: <Rocket className="h-6 w-6" />, value: 3 },
      { id: 'critical', label: 'Mission Critical', description: '24/7 uptime required', icon: <Server className="h-6 w-6" />, value: 4 },
    ]
  },
];

interface PlanRecommendation {
  name: string;
  icon: React.ReactNode;
  price: string;
  period: string;
  description: string;
  features: string[];
  color: string;
}

const plans: Record<string, PlanRecommendation> = {
  starter: {
    name: 'Starter Hosting',
    icon: <Zap className="h-8 w-8" />,
    price: '$2.99',
    period: '/month',
    description: 'Perfect for personal blogs and small websites',
    features: ['1 Website', '50GB SSD Storage', 'Free SSL Certificate', 'Weekly Backups', '24/7 Support'],
    color: 'from-success to-emerald-400'
  },
  business: {
    name: 'Business Hosting',
    icon: <Rocket className="h-8 w-8" />,
    price: '$4.99',
    period: '/month',
    description: 'Ideal for growing businesses and agencies',
    features: ['100 Websites', '200GB NVMe Storage', 'Free SSL + CDN', 'Daily Backups', 'Priority Support', 'Free Domain'],
    color: 'from-primary to-orange-400'
  },
  cloud: {
    name: 'Cloud Pro',
    icon: <Cloud className="h-8 w-8" />,
    price: '$9.99',
    period: '/month',
    description: 'High-performance cloud infrastructure',
    features: ['Unlimited Websites', '300GB NVMe Storage', 'Dedicated Resources', 'Auto-scaling', 'Staging Environment', '99.99% Uptime SLA'],
    color: 'from-secondary to-blue-400'
  },
  vps: {
    name: 'VPS Hosting',
    icon: <Server className="h-8 w-8" />,
    price: '$14.99',
    period: '/month',
    description: 'Full control with dedicated resources',
    features: ['4 vCPU Cores', '8GB RAM', '200GB NVMe Storage', 'Root Access', 'Dedicated IP', 'Managed Support'],
    color: 'from-accent to-purple-400'
  },
};

const PlanFinderQuiz = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleOptionSelect = (optionId: string, value: number) => {
    setSelectedOption(optionId);
    const newAnswers = [...answers];
    newAnswers[currentStep] = value;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentStep < quizSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      setSelectedOption(null);
    } else {
      setShowResult(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setSelectedOption(null);
    }
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setAnswers([]);
    setSelectedOption(null);
    setShowResult(false);
  };

  const getRecommendedPlan = (): PlanRecommendation => {
    const totalScore = answers.reduce((sum, val) => sum + val, 0);
    if (totalScore <= 5) return plans.starter;
    if (totalScore <= 9) return plans.business;
    if (totalScore <= 13) return plans.cloud;
    return plans.vps;
  };

  const currentQuiz = quizSteps[currentStep];
  const progress = ((currentStep + 1) / quizSteps.length) * 100;

  if (showResult) {
    const recommendation = getRecommendedPlan();
    return (
      <section className="py-20 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-transparent to-transparent" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/20 text-success mb-6">
              <Check className="h-5 w-5" />
              <span className="text-sm font-medium">Analysis Complete</span>
            </div>
            
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Your Perfect Plan
            </h2>
            <p className="text-muted-foreground mb-8">
              Based on your needs, we recommend:
            </p>

            <Card className="bg-card/80 backdrop-blur-xl border-border/50 p-8 mb-8">
              <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${recommendation.color} mb-6`}>
                {recommendation.icon}
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">{recommendation.name}</h3>
              <p className="text-muted-foreground mb-4">{recommendation.description}</p>
              
              <div className="flex items-baseline justify-center gap-1 mb-6">
                <span className="text-4xl font-bold gradient-text-orange">{recommendation.price}</span>
                <span className="text-muted-foreground">{recommendation.period}</span>
              </div>

              <ul className="space-y-3 mb-8">
                {recommendation.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3 text-muted-foreground">
                    <Check className="h-5 w-5 text-success flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="rocket" size="lg" className="gap-2">
                  Get Started Now
                  <ArrowRight className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="lg" onClick={handleRestart}>
                  Retake Quiz
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="plan-finder" className="py-20 lg:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-transparent to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 text-accent mb-6">
            <Sparkles className="h-5 w-5" />
            <span className="text-sm font-medium">AI-Powered Recommendation</span>
          </div>
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-4">
            Find Your <span className="gradient-text-orange">Perfect Plan</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Answer a few questions and let our AI recommend the best hosting solution for your needs
          </p>
        </div>

        {/* Progress Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>Step {currentStep + 1} of {quizSteps.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-orange-400 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Quiz Card */}
        <div className="max-w-3xl mx-auto">
          <Card className="bg-card/80 backdrop-blur-xl border-border/50 p-8">
            <h3 className="text-2xl font-bold text-foreground mb-2">{currentQuiz.question}</h3>
            <p className="text-muted-foreground mb-8">{currentQuiz.subtitle}</p>

            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {currentQuiz.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleOptionSelect(option.id, option.value)}
                  className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                    selectedOption === option.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50 bg-muted/30'
                  }`}
                >
                  <div className={`p-3 rounded-lg ${
                    selectedOption === option.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {option.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">{option.label}</h4>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-between">
              <Button 
                variant="ghost" 
                onClick={handleBack}
                disabled={currentStep === 0}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button 
                variant="rocket" 
                onClick={handleNext}
                disabled={!selectedOption}
                className="gap-2"
              >
                {currentStep === quizSteps.length - 1 ? 'See Results' : 'Next'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default PlanFinderQuiz;
