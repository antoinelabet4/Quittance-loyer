'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  ShieldCheck, 
  Clock, 
  Send, 
  ChevronRight, 
  CheckCircle2,
  Building2,
  Users,
  Archive,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export function LandingPage({ onGetStarted, onLogin }: LandingPageProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const features = [
    {
      icon: <ShieldCheck className="w-10 h-10 text-[#000091]" />,
      title: "100% Conforme",
      description: "Quittances conformes à la loi n°89-462 du 6 juillet 1989. Valides pour les aides au logement (APL)."
    },
    {
      icon: <Clock className="w-10 h-10 text-[#000091]" />,
      title: "Gain de temps",
      description: "Générez vos quittances en moins de 30 secondes. Les informations de vos locataires sont mémorisées."
    },
    {
      icon: <Archive className="w-10 h-10 text-[#000091]" />,
      title: "Historique complet",
      description: "Toutes vos quittances sont archivées et accessibles en un clic. Ne perdez plus jamais un document."
    },
    {
      icon: <Send className="w-10 h-10 text-[#000091]" />,
      title: "Envoi automatisé",
      description: "Envoyez directement la quittance par email à votre locataire depuis la plateforme."
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Configurez vos profils",
      description: "Ajoutez vos informations de bailleur, vos locataires et vos logements."
    },
    {
      number: "02",
      title: "Générez la quittance",
      description: "Sélectionnez le mois et l'année. Le montant est calculé automatiquement."
    },
    {
      number: "03",
      title: "Signez et envoyez",
      description: "Téléchargez le PDF ou envoyez-le par email avec votre signature numérisée."
    }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-[#000091] selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#000091] rounded flex items-center justify-center">
                <FileText className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-[#000091]">QuittanceExpress</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium hover:text-[#000091] transition-colors">Fonctionnalités</a>
              <a href="#how-it-works" className="text-sm font-medium hover:text-[#000091] transition-colors">Comment ça marche</a>
              <div className="flex items-center gap-3 border-l pl-8 border-slate-200">
                <Button variant="ghost" onClick={onLogin} className="text-sm font-medium">Connexion</Button>
                  <Button onClick={onGetStarted} className="bg-[#000091] hover:bg-[#000091]/90 text-sm font-medium">S'inscrire</Button>
              </div>
            </div>

            <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-white border-b border-slate-100 p-4 space-y-4"
          >
            <a href="#features" className="block text-base font-medium" onClick={() => setIsMenuOpen(false)}>Fonctionnalités</a>
            <a href="#how-it-works" className="block text-base font-medium" onClick={() => setIsMenuOpen(false)}>Comment ça marche</a>
            <div className="pt-4 space-y-2">
              <Button variant="outline" onClick={onLogin} className="w-full">Connexion</Button>
              <Button onClick={onGetStarted} className="w-full bg-[#000091]">S'inscrire</Button>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10 opacity-20">
          <div className="absolute top-20 right-10 w-72 h-72 bg-blue-400 rounded-full blur-[120px]" />
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-[#000091] rounded-full blur-[150px]" />
        </div>

        <div className="max-w-7xl mx-auto text-center">
            <motion.div {...fadeIn}>
              <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-8 text-slate-900 leading-[1.1]">
              Générez vos quittances de loyer <br />
              <span className="text-[#000091]">en toute simplicité.</span>
            </h1>
              <p className="text-lg lg:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                La solution simple, rapide et conforme pour les propriétaires bailleurs. 
                Gérez vos locataires, archivez vos documents et envoyez-les en un clic.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button onClick={onGetStarted} size="lg" className="bg-[#000091] hover:bg-[#000091]/90 text-lg px-8 py-7 h-auto rounded-xl shadow-xl shadow-blue-900/10">
                  Commencer maintenant
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
                <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-green-500" /> Sans engagement</span>
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-green-500" /> Conforme loi 89-462</span>
                </div>
              </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mt-20 relative max-w-5xl mx-auto"
          >
            <div className="rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden aspect-[16/9] lg:aspect-[21/9]">
              <div className="w-full h-full bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 opacity-40">
                  <FileText className="w-16 h-16 text-[#000091]" />
                  <p className="font-medium">Interface de gestion intuitive</p>
                </div>
              </div>
              {/* Overlay elements for "dashboard" feel */}
              <div className="absolute top-4 left-4 w-48 h-32 bg-white rounded-lg border border-slate-100 shadow-sm p-4 hidden md:block">
                <div className="h-2 w-24 bg-slate-100 rounded mb-4" />
                <div className="h-8 w-full bg-blue-50 rounded" />
              </div>
              <div className="absolute bottom-4 right-4 w-64 h-40 bg-white rounded-lg border border-slate-100 shadow-sm p-4 hidden md:block">
                 <div className="flex justify-between mb-4">
                   <div className="h-2 w-12 bg-slate-100 rounded" />
                   <div className="h-2 w-8 bg-slate-100 rounded" />
                 </div>
                 <div className="space-y-2">
                   <div className="h-4 w-full bg-slate-50 rounded" />
                   <div className="h-4 w-full bg-slate-50 rounded" />
                   <div className="h-4 w-3/4 bg-slate-50 rounded" />
                 </div>
              </div>
            </div>
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-[#000091]/10 blur-3xl -z-10" />
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Tout ce dont vous avez besoin</h2>
            <p className="text-slate-600">Gérez votre patrimoine locatif avec sérénité.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -5 }}
                className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all"
              >
                <div className="mb-6">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1">
              <h2 className="text-4xl lg:text-5xl font-extrabold mb-8 leading-tight">
                Gagnez du temps sur <br />
                <span className="text-[#000091]">votre gestion locative.</span>
              </h2>
              <div className="space-y-10">
                {steps.map((step, idx) => (
                  <div key={idx} className="flex gap-6">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-50 text-[#000091] flex items-center justify-center font-bold text-lg border border-blue-100">
                      {step.number}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                      <p className="text-slate-600 leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1 w-full">
              <div className="relative">
                <div className="aspect-square bg-blue-50 rounded-3xl overflow-hidden border border-blue-100 flex items-center justify-center p-12">
                   <div className="w-full bg-white rounded-xl shadow-2xl p-6 border border-slate-100">
                      <div className="flex justify-between items-center mb-8 border-b pb-4">
                        <div className="flex items-center gap-2">
                           <div className="w-6 h-6 bg-[#000091] rounded-sm" />
                           <span className="font-bold text-xs uppercase tracking-widest text-slate-400">Quittance de Loyer</span>
                        </div>
                        <span className="text-xs font-mono text-slate-400">#2025-01-01</span>
                      </div>
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                              <div className="h-2 w-16 bg-slate-100 rounded" />
                              <div className="h-3 w-full bg-slate-50 rounded" />
                              <div className="h-3 w-3/4 bg-slate-50 rounded" />
                           </div>
                           <div className="space-y-2">
                              <div className="h-2 w-16 bg-slate-100 rounded" />
                              <div className="h-3 w-full bg-slate-50 rounded" />
                              <div className="h-3 w-3/4 bg-slate-50 rounded" />
                           </div>
                        </div>
                        <div className="h-10 w-full bg-slate-50 border-y flex items-center px-4 justify-between">
                           <span className="text-[10px] font-bold">MONTANT TOTAL</span>
                           <span className="text-sm font-bold text-[#000091]">850,00 €</span>
                        </div>
                      </div>
                   </div>
                </div>
                <div className="absolute -top-6 -right-6 w-32 h-32 bg-[#e1000f]/5 rounded-full blur-3xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust / Social Proof */}
      <section className="py-20 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-400 uppercase tracking-[0.2em] text-xs font-bold mb-10">Conforme aux standards français</p>
          <div className="flex flex-wrap justify-center items-center gap-12 lg:gap-24 opacity-40 grayscale">
            <div className="flex items-center gap-2 font-bold text-xl"><Building2 /> ANIL</div>
            <div className="flex items-center gap-2 font-bold text-xl"><ShieldCheck /> RGPD</div>
            <div className="flex items-center gap-2 font-bold text-xl font-serif">Loi 89-462</div>
            <div className="flex items-center gap-2 font-bold text-xl"><Users /> FNAIM</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto rounded-[3rem] bg-[#000091] p-12 lg:p-20 text-center relative overflow-hidden shadow-2xl shadow-blue-900/40">
          <div className="absolute top-0 left-0 w-full h-full -z-10">
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-600 rounded-full blur-[100px] opacity-50" />
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-red-600 rounded-full blur-[100px] opacity-30" />
          </div>
          
          <motion.div {...fadeIn}>
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-8">
              Prêt à simplifier votre gestion ?
            </h2>
            <p className="text-blue-100 text-lg lg:text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
              Rejoignez des centaines de propriétaires qui utilisent QuittanceExpress pour gagner du temps chaque mois.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Button onClick={onGetStarted} size="lg" className="bg-white text-[#000091] hover:bg-slate-100 text-lg px-10 py-7 h-auto rounded-2xl font-bold">
                  Créer mon compte
                </Button>
              <button onClick={onLogin} className="text-white font-medium flex items-center gap-2 hover:gap-3 transition-all">
                Déjà utilisateur ? Connectez-vous <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-16 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-[#000091] rounded flex items-center justify-center">
                <FileText className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">QuittanceExpress</span>
            </div>
            <p className="max-w-xs mb-8 text-sm leading-relaxed">
              La solution de gestion locative simple et conforme pour les propriétaires indépendants en France.
            </p>
            <div className="flex gap-4">
              {/* Social icons placeholder */}
            </div>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6">Produit</h4>
            <ul className="space-y-4 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Fonctionnalités</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Modèles de quittance</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Tarification</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6">Légal</h4>
            <ul className="space-y-4 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Mentions légales</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Politique de confidentialité</a></li>
              <li><a href="#" className="hover:text-white transition-colors">CGU</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-slate-800 text-center text-xs">
          <p>© {new Date().getFullYear()} QuittanceExpress. Tous droits réservés. Conforme à la loi n°89-462.</p>
        </div>
      </footer>
    </div>
  );
}
