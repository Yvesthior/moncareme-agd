import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-primary text-primary-foreground py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-center">Mon Carnet de Carême</h1>
          <p className="text-center mt-2">Apostolat Génération David</p>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Bienvenue sur votre Carnet de Carême</h2>
            <p className="text-lg">
              Suivez votre parcours spirituel pendant le Carême avec cet outil qui vous permet de noter vos exercices
              spirituels, actes de charité et réflexions quotidiennes.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 max-w-md mx-auto">
            <Link href="/sign-in" className="w-full">
              <Button variant="outline" className="w-full">
                Se connecter
              </Button>
            </Link>
            <Link href="/sign-up" className="w-full">
              <Button className="w-full">S'inscrire</Button>
            </Link>
          </div>

          <div className="bg-muted p-6 rounded-lg mt-8">
            <h3 className="font-semibold text-xl mb-4">Fonctionnalités</h3>
            <ul className="text-left space-y-2">
              <li>✓ Suivi quotidien des exercices spirituels</li>
              <li>✓ Enregistrement de vos actes de charité</li>
              <li>✓ Espace pour vos commentaires et réflexions</li>
              <li>✓ Bilan hebdomadaire de votre progression</li>
              <li>✓ Sauvegarde automatique de vos données</li>
            </ul>
          </div>
        </div>
      </main>

      <footer className="bg-muted py-6">
        <div className="container mx-auto px-4 text-center text-sm">
          <p>© {new Date().getFullYear()} Apostolat Génération David - Mon Carnet de Carême</p>
        </div>
      </footer>
    </div>
  )
}

