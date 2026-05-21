import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendWelcomeEmail(email: string, agencyName: string): Promise<void> {
  try {
    await resend.emails.send({
      from: process.env.FROM_EMAIL || 'hello@omniflowapp.ai',
      to: email,
      subject: 'Bienvenue sur Omniflow 🚀 — Votre agence va changer',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Bienvenue sur Omniflow 🚀</h1>
          </div>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <p style="color: #333; font-size: 16px; margin-top: 0;">
              Salut <strong>${agencyName}</strong> !
            </p>
            <p style="color: #555; font-size: 14px;">
              Votre essai gratuit de 7 jours a commencé. Préparez-vous à transformer votre agence OnlyFans avec l'automatisation complète.
            </p>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 10px; border-left: 4px solid #8B5CF6; margin-bottom: 20px;">
            <h2 style="color: #333; margin-top: 0;">3 étapes pour démarrer :</h2>
            <ol style="color: #555; font-size: 14px;">
              <li style="margin-bottom: 10px;"><strong>Connectez AdsPower/GeeLark</strong> — Synchronisez vos comptes</li>
              <li style="margin-bottom: 10px;"><strong>Ajoutez vos modèles</strong> — Paramétrez vos templates</li>
              <li style="margin-bottom: 10px;"><strong>Programmez votre premier post</strong> — Lancez l'automatisation</li>
            </ol>
          </div>
          
          <div style="text-align: center; margin-bottom: 20px;">
            <a href="https://omniflowapp.ai/dashboard" style="display: inline-block; background: linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
              Accéder au dashboard →
            </a>
          </div>
          
          <div style="color: #999; font-size: 12px; text-align: center; border-top: 1px solid #e0e0e0; padding-top: 20px;">
            <p style="margin: 5px 0;">
              Questions ? <a href="https://omniflowapp.ai/contact" style="color: #8B5CF6; text-decoration: none;">Contactez-nous</a>
            </p>
            <p style="margin: 0;">
              <a href="#" style="color: #999; text-decoration: none;">Se désinscrire</a>
            </p>
          </div>
        </div>
      `,
    })
  } catch (error) {
    console.error('Error sending welcome email:', error)
    throw error
  }
}

export async function sendOnboardingEmail(
  email: string,
  agencyName: string,
  day: number
): Promise<void> {
  const emailContent = {
    1: {
      subject: 'Comment connecter AdsPower à Omniflow (2 min)',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Connexion AdsPower 🔌</h1>
          </div>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <p style="color: #333; font-size: 16px; margin-top: 0;">
              Bonjour ${agencyName},
            </p>
            <p style="color: #555; font-size: 14px;">
              Connecter AdsPower et GeeLark à Omniflow en 2 minutes c'est possible !
            </p>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 10px; border-left: 4px solid #8B5CF6; margin-bottom: 20px;">
            <h3 style="color: #333; margin-top: 0;">Procédure rapide :</h3>
            <ol style="color: #555; font-size: 14px; line-height: 1.8;">
              <li>Allez dans Paramètres → Intégrations</li>
              <li>Sélectionnez AdsPower</li>
              <li>Collez votre API Key AdsPower</li>
              <li>Confirmez la connexion</li>
            </ol>
            <p style="color: #8B5CF6; font-size: 12px; margin-top: 15px;">
              💡 <strong>Besoin d'aide ?</strong> <a href="https://omniflowapp.ai/docs" style="color: #8B5CF6; text-decoration: none;">Consultez le guide complet</a>
            </p>
          </div>
          
          <div style="text-align: center; margin-bottom: 20px;">
            <a href="https://omniflowapp.ai/dashboard/settings/integrations" style="display: inline-block; background: linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
              Connecter mes outils →
            </a>
          </div>
          
          <div style="color: #999; font-size: 12px; text-align: center; border-top: 1px solid #e0e0e0; padding-top: 20px;">
            <p style="margin: 0;">
              <a href="#" style="color: #999; text-decoration: none;">Se désinscrire</a>
            </p>
          </div>
        </div>
      `,
    },
    3: {
      subject: 'Avez-vous schedulé votre premier post ? ✨',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Premier Post Automatisé ✨</h1>
          </div>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <p style="color: #333; font-size: 16px; margin-top: 0;">
              Coucou ${agencyName},
            </p>
            <p style="color: #555; font-size: 14px;">
              Vous avez exploré Omniflow, connecté vos outils... Et maintenant ? C'est le moment de programmer votre premier post automatique !
            </p>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 10px; border-left: 4px solid #8B5CF6; margin-bottom: 20px;">
            <h3 style="color: #333; margin-top: 0;">Les avantages du posting automatisé :</h3>
            <ul style="color: #555; font-size: 14px; line-height: 1.8;">
              <li>✅ Gagnez 2-3h par jour de travail manuel</li>
              <li>✅ Posez à la meilleure heure pour chaque modèle</li>
              <li>✅ Augmentez vos revenus sans effort supplémentaire</li>
              <li>✅ Gérez 50+ comptes en même temps</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-bottom: 20px;">
            <a href="https://omniflowapp.ai/dashboard/posting" style="display: inline-block; background: linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
              Programmer un post →
            </a>
          </div>
          
          <div style="color: #999; font-size: 12px; text-align: center; border-top: 1px solid #e0e0e0; padding-top: 20px;">
            <p style="margin: 0;">
              <a href="#" style="color: #999; text-decoration: none;">Se désinscrire</a>
            </p>
          </div>
        </div>
      `,
    },
    7: {
      subject: 'Votre essai se termine dans 24h ⏰',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Votre essai expire demain ⏰</h1>
          </div>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <p style="color: #333; font-size: 16px; margin-top: 0;">
              Bonjour ${agencyName},
            </p>
            <p style="color: #555; font-size: 14px;">
              Vos 7 jours d'essai gratuit se terminent demain. Vous avez découvert la puissance d'Omniflow. Continuons ensemble ?
            </p>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 10px; border-left: 4px solid #8B5CF6; margin-bottom: 20px;">
            <h3 style="color: #333; margin-top: 0;">Ce que vous avez débloqué :</h3>
            <ul style="color: #555; font-size: 14px; line-height: 1.8;">
              <li>📊 Dashboard financier temps réel</li>
              <li>🤖 Chatting IA pour gérer les DMs</li>
              <li>📈 Veille contenu intelligente</li>
              <li>🎬 Génération vidéo IA</li>
              <li>📱 Gestion multi-comptes illimitée</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-bottom: 20px;">
            <a href="https://omniflowapp.ai/pricing" style="display: inline-block; background: linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-right: 10px;">
              Continuer avec Omniflow →
            </a>
          </div>
          
          <div style="background: #f0f0f0; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <p style="color: #666; font-size: 13px; margin: 0;">
              <strong>Vous hésitez encore ?</strong> Notre équipe est là pour vous. <a href="https://omniflowapp.ai/contact" style="color: #8B5CF6; text-decoration: none;">Parlons de votre agence</a>
            </p>
          </div>
          
          <div style="color: #999; font-size: 12px; text-align: center; border-top: 1px solid #e0e0e0; padding-top: 20px;">
            <p style="margin: 0;">
              <a href="#" style="color: #999; text-decoration: none;">Se désinscrire</a>
            </p>
          </div>
        </div>
      `,
    },
  }

  const content = emailContent[day as keyof typeof emailContent]
  if (!content) {
    console.warn(`No email template found for day ${day}`)
    return
  }

  try {
    await resend.emails.send({
      from: process.env.FROM_EMAIL || 'hello@omniflowapp.ai',
      to: email,
      subject: content.subject,
      html: content.html,
    })
  } catch (error) {
    console.error(`Error sending day ${day} email:`, error)
    throw error
  }
}
