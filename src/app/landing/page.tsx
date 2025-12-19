'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Shield, Clock, Download, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#000091] via-[#000091] to-[#1e1e1e]">
      <header className="bg-[#000091] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/landing" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white rounded flex items-center justify-center overflow-hidden">
                <img 
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Icone-de-document-avec-maison-1765698769698.png?width=8000&height=8000&resize=contain" 
                  alt="Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Quittances de Loyer</h1>
                  <p className="text-xs text-blue-200">Générateur simple et conforme</p>
                </div>
            </Link>
            <div className="flex items-center gap-3">
              <Button 
                onClick={() => router.push('/')} 
                variant="outline" 
                className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              >
                Se connecter
              </Button>
              <Button 
                onClick={() => router.push('/')} 
                className="bg-[#e1000f] hover:bg-[#c10010] text-white"
              >
                Créer un compte
              </Button>
            </div>
          </div>
        </div>
        <div className="h-2 bg-[#e1000f]" />
      </header>

      <main className="max-w-7xl mx-auto px-4 py-16">
        <section className="text-center mb-20">
          <h2 className="text-5xl font-bold text-white mb-6">
            Générez vos quittances de loyer en quelques clics
          </h2>
          <p className="text-xl text-blue-200 mb-8 max-w-2xl mx-auto">
            Outil simple, conforme à la loi française. 
            Vos données restent privées et sécurisées.
          </p>
          <Button 
            onClick={() => router.push('/')} 
            size="lg" 
            className="bg-[#e1000f] hover:bg-[#c10010] text-white text-lg px-8 py-6 h-auto"
          >
            <FileText className="w-6 h-6 mr-3" />
            Commencer
          </Button>
        </section>

        <section className="grid md:grid-cols-3 gap-8 mb-20">
          <Card className="bg-white/10 border-white/20 text-white">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-[#e1000f] rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">100% Conforme</h3>
              <p className="text-blue-200">
                Conforme à la loi n°89-462 du 6 juillet 1989. Toutes les mentions légales obligatoires incluses.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 text-white">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-[#e1000f] rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Rapide et Simple</h3>
              <p className="text-blue-200">
                Créez une quittance en moins de 2 minutes. Interface intuitive, aucune compétence technique requise.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 text-white">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-[#e1000f] rounded-lg flex items-center justify-center mb-4">
                <Download className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Export PDF</h3>
              <p className="text-blue-200">
                Téléchargez vos quittances en PDF haute qualité, prêtes à être envoyées par email ou imprimées.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="bg-white/5 rounded-2xl p-12 mb-20 border border-white/10">
          <h3 className="text-3xl font-bold text-white mb-8 text-center">
            Pourquoi choisir notre générateur ?
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
              {[
                'Solution simple et sans frais cachés',
                'Aucune publicité intrusive',
                'Données stockées localement sur votre appareil',
                'Multi-bailleurs et multi-locataires',
                'Historique complet de vos quittances',
                'Gestion des colocations',
                'Interface moderne et responsive',
                'Mises à jour régulières et support',
              ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-white">
                <CheckCircle2 className="w-5 h-5 text-[#e1000f] flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="text-center">
          <h3 className="text-3xl font-bold text-white mb-6">
            Prêt à générer votre première quittance ?
          </h3>
          <p className="text-blue-200 mb-8 text-lg">
            Rejoignez des centaines de propriétaires qui nous font confiance
          </p>
          <Button 
            onClick={() => router.push('/')} 
            size="lg" 
            className="bg-white text-[#000091] hover:bg-blue-50 text-lg px-8 py-6 h-auto"
          >
            Créer mon compte gratuitement
          </Button>
        </section>
      </main>

      <footer className="bg-[#1e1e1e] text-white py-8 mt-20 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400">
            Générateur de quittances de loyer conformes à la loi n°89-462 du 6 juillet 1989
          </p>
          <p className="text-gray-500 mt-2 text-sm">
            Les données sont stockées localement sur votre appareil. Nous ne collectons aucune information personnelle.
          </p>
        </div>
      </footer>
    </div>
  );
}
