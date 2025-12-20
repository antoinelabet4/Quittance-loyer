# 🚀 Prochaines Étapes : Déploiement & Production

Ce guide vous accompagne pour mettre votre application en ligne et activer l'envoi d'emails professionnels.

## 1. Achat et Configuration du Nom de Domaine

Pour envoyer des emails à vos locataires (hors test), vous devez posséder un nom de domaine (ex: `ma-gestion-immo.com`).

1.  **Acheter un domaine** chez un registrar (Namecheap, GoDaddy, Ionos, ou via Vercel directement).
2.  **Créer un compte sur [Resend](https://resend.com)**.
3.  Aller dans **Domains** > **Add Domain**.
4.  Entrez votre domaine (ex: `ma-gestion-immo.com`).
5.  Resend vous donnera des enregistrements DNS (Type `MX`, `TXT`, `CNAME`).
6.  Allez sur le site où vous avez acheté votre domaine, dans la section "Gestion DNS", et ajoutez ces enregistrements.
7.  Cliquez sur **Verify** dans Resend.
   > *Note : La propagation DNS peut prendre de quelques minutes à 24h.*

## 2. Déploiement sur Vercel

Vercel est la plateforme idéale pour héberger cette application Next.js.

1.  Poussez votre code sur **GitHub**.
2.  Créez un compte sur **[Vercel](https://vercel.com)**.
3.  Cliquez sur **"Add New..."** > **"Project"** et importez votre dépôt GitHub.
4.  **Configuration des Variables d'Environnement** :
    Dans l'écran de configuration Vercel, ajoutez les variables suivantes (copiez-les depuis votre `.env.local`) :

    | Variable | Valeur |
    | :--- | :--- |
    | `NEXT_PUBLIC_SUPABASE_URL` | Votre URL Supabase |
    | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Votre Clé Anon Supabase |
    | `SUPABASE_SERVICE_ROLE_KEY` | Votre Clé Service Role Supabase |
    | `RESEND_API_KEY` | Votre clé API Resend (commence par `re_`) |
    | `EMAIL_FROM` | `noreply@votre-domaine.com` (Adaptez avec votre vrai domaine vérifié) |

5.  Cliquez sur **Deploy**.

## 3. Vérification Finale

Une fois le déploiement terminé (l'URL sera du type `votre-projet.vercel.app`) :
1.  Connectez-vous à votre application en ligne.
2.  Dans "Réglages" ou directement dans le code, assurez-vous que `EMAIL_FROM` correspond bien au domaine que vous avez vérifié à l'étape 1.
3.  Créez une quittance de test.
4.  Envoyez-la à une adresse email réelle (ex: votre adresse personnelle Gmail/Outlook).
5.  Vérifiez que vous recevez bien l'email et que l'expéditeur est bien votre domaine pro.

---

### 💡 Besoin d'aide ?
Si les emails ne partent pas :
- Vérifiez les logs dans le tableau de bord Vercel (onglet "Logs").
- Assurez-vous que votre domaine est marqué "Verified" dans Resend.
- Vérifiez que la variable `EMAIL_FROM` dans Vercel correspond exactement au domaine vérifié.
