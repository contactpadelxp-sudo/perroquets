import Link from 'next/link';

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-background text-foreground px-4 py-12">
      <div className="max-w-2xl mx-auto space-y-10">
        <Link
          href="/login"
          className="text-sm text-accent-violet hover:underline"
        >
          ← Retour
        </Link>

        {/* ── Politique de confidentialité ──────────────────────── */}
        <section className="space-y-4">
          <h1 className="text-2xl font-bold">Politique de confidentialité</h1>
          <p className="text-sm text-muted">Dernière mise à jour : 17 avril 2026</p>

          <h2 className="text-lg font-semibold mt-6">1. Responsable du traitement</h2>
          <p className="text-sm leading-relaxed">
            ParrotCare est une application personnelle de suivi animalier.
            Le responsable du traitement est l&apos;éditeur de l&apos;application.
            Pour toute question relative à vos données personnelles, contactez-nous à
            l&apos;adresse indiquée dans la section « Contact » ci-dessous.
          </p>

          <h2 className="text-lg font-semibold mt-6">2. Données collectées</h2>
          <p className="text-sm leading-relaxed">
            Lors de votre inscription et de votre utilisation, nous collectons uniquement :
          </p>
          <ul className="list-disc pl-5 text-sm space-y-1">
            <li><strong>Email</strong> — pour l&apos;authentification et la récupération de compte</li>
            <li><strong>Nom et photo de profil Google</strong> (si connexion via Google) — pour personnaliser l&apos;interface</li>
            <li><strong>Données de suivi de votre oiseau</strong> — alimentation, poids, paramètres (ces données vous appartiennent)</li>
          </ul>
          <p className="text-sm leading-relaxed">
            Nous ne collectons <strong>aucune donnée sensible</strong> au sens du RGPD (santé humaine, opinions politiques, etc.).
            Les données de suivi concernent exclusivement un animal.
          </p>

          <h2 className="text-lg font-semibold mt-6">3. Base légale du traitement</h2>
          <ul className="list-disc pl-5 text-sm space-y-1">
            <li><strong>Exécution du contrat</strong> (Art. 6.1.b RGPD) — fournir le service de suivi</li>
            <li><strong>Consentement</strong> (Art. 6.1.a RGPD) — lors de l&apos;inscription, vous consentez explicitement au traitement de vos données</li>
          </ul>

          <h2 className="text-lg font-semibold mt-6">4. Durée de conservation</h2>
          <p className="text-sm leading-relaxed">
            Vos données sont conservées tant que votre compte est actif.
            Lors de la suppression de votre compte, <strong>toutes vos données sont supprimées définitivement
            sous 30 jours</strong>, y compris les sauvegardes.
          </p>

          <h2 className="text-lg font-semibold mt-6">5. Vos droits (RGPD Art. 15-22)</h2>
          <p className="text-sm leading-relaxed">Vous disposez des droits suivants :</p>
          <ul className="list-disc pl-5 text-sm space-y-1">
            <li><strong>Droit d&apos;accès</strong> — exporter toutes vos données (Paramètres → Export CSV/JSON)</li>
            <li><strong>Droit de rectification</strong> — modifier vos données depuis l&apos;application</li>
            <li><strong>Droit à l&apos;effacement</strong> — supprimer votre compte et toutes vos données (Paramètres → Supprimer mon compte)</li>
            <li><strong>Droit à la portabilité</strong> — exporter vos données dans un format structuré (JSON)</li>
            <li><strong>Droit de retrait du consentement</strong> — à tout moment en supprimant votre compte</li>
          </ul>

          <h2 className="text-lg font-semibold mt-6">6. Cookies et stockage local</h2>
          <p className="text-sm leading-relaxed">
            Nous utilisons exclusivement des <strong>cookies strictement nécessaires</strong> au
            fonctionnement de l&apos;authentification (cookies de session Supabase Auth).
            Aucun cookie de pistage, d&apos;analyse ou publicitaire n&apos;est utilisé.
            Conformément à l&apos;Art. 5(3) de la directive ePrivacy, ces cookies étant
            strictement nécessaires, ils ne requièrent pas de consentement séparé.
          </p>

          <h2 className="text-lg font-semibold mt-6">7. Hébergement et sous-traitants</h2>
          <ul className="list-disc pl-5 text-sm space-y-1">
            <li><strong>Supabase Inc.</strong> (base de données, authentification) — serveurs UE disponibles, conforme RGPD, DPA signable</li>
            <li><strong>Vercel Inc.</strong> (hébergement web) — serveurs Edge EU, conforme RGPD</li>
            <li><strong>Google</strong> (authentification OAuth uniquement) — données limitées à l&apos;email et au profil public</li>
          </ul>
          <p className="text-sm leading-relaxed">
            Aucun transfert de données hors UE n&apos;est effectué sans garanties
            appropriées (clauses contractuelles types ou décision d&apos;adéquation).
          </p>

          <h2 className="text-lg font-semibold mt-6">8. Sécurité</h2>
          <p className="text-sm leading-relaxed">
            Les mots de passe sont hashés côté serveur (bcrypt via Supabase Auth).
            Les communications sont chiffrées en TLS. L&apos;accès aux données est
            protégé par Row Level Security (chaque utilisateur ne voit que ses propres données).
          </p>

          <h2 className="text-lg font-semibold mt-6">9. Contact</h2>
          <p className="text-sm leading-relaxed">
            Pour exercer vos droits ou poser une question sur vos données personnelles,
            rendez-vous dans Paramètres → Supprimer mon compte, ou contactez
            le responsable du traitement par email.
          </p>

          <h2 className="text-lg font-semibold mt-6">10. Réclamation</h2>
          <p className="text-sm leading-relaxed">
            Si vous estimez que le traitement de vos données n&apos;est pas conforme,
            vous pouvez déposer une réclamation auprès de la <strong>CNIL</strong> (Commission
            Nationale de l&apos;Informatique et des Libertés) — <span className="text-accent-violet">www.cnil.fr</span>.
          </p>
        </section>
      </div>
    </div>
  );
}
