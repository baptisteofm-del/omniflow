/**
 * OmniFlow Email Templates
 * Branded, dark-themed HTML email templates with violet/cyan gradients
 * Used by Resend for all outgoing emails
 */

export interface EmailTemplate {
  subject: string
  html: string
}

const baseStyles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  body {
    background: #0a0a0f;
    color: #ffffff;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.6;
    font-size: 16px;
  }
  .container {
    max-width: 600px;
    margin: 0 auto;
    background: #0a0a0f;
  }
  .header {
    background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%);
    padding: 32px 0 0 0;
    text-align: center;
  }
  .logo {
    font-size: 28px;
    font-weight: 800;
    color: white;
    letter-spacing: -0.5px;
    background: linear-gradient(135deg, #fbbf24 0%, #f97316 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 16px;
  }
  .header-title {
    color: white;
    font-size: 32px;
    font-weight: 700;
    margin: 0;
    padding: 0 32px 24px 32px;
  }
  .content {
    background: #111118;
    padding: 40px 32px;
  }
  .subtitle {
    color: #a0a0b0;
    font-size: 16px;
    margin-bottom: 24px;
    line-height: 1.5;
  }
  .card {
    background: #1a1a2e;
    border: 1px solid rgba(139, 92, 246, 0.15);
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 20px;
  }
  .card h3 {
    color: #ffffff;
    font-size: 18px;
    margin-bottom: 16px;
    font-weight: 600;
  }
  .card p {
    color: #a0a0b0;
    font-size: 14px;
    margin-bottom: 12px;
    line-height: 1.6;
  }
  .card p:last-child {
    margin-bottom: 0;
  }
  .steps {
    background: #1a1a2e;
    border: 1px solid rgba(139, 92, 246, 0.15);
    border-radius: 12px;
    overflow: hidden;
    margin-bottom: 20px;
  }
  .step {
    padding: 20px;
    border-bottom: 1px solid rgba(139, 92, 246, 0.1);
    display: flex;
    align-items: flex-start;
  }
  .step:last-child {
    border-bottom: none;
  }
  .step-number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%);
    border-radius: 50%;
    color: white;
    font-weight: 700;
    font-size: 18px;
    margin-right: 16px;
    flex-shrink: 0;
  }
  .step-content h4 {
    color: #ffffff;
    font-size: 15px;
    margin-bottom: 4px;
    font-weight: 600;
  }
  .step-content p {
    color: #a0a0b0;
    font-size: 13px;
    margin: 0;
  }
  .cta-button {
    display: inline-block;
    background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%);
    color: white;
    padding: 14px 32px;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
    font-size: 15px;
    text-align: center;
    transition: all 0.2s;
  }
  .cta-button:hover {
    opacity: 0.9;
    transform: translateY(-2px);
  }
  .cta-container {
    text-align: center;
    margin: 32px 0;
  }
  .secondary-button {
    display: inline-block;
    background: #1a1a2e;
    color: #8b5cf6;
    padding: 12px 28px;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
    font-size: 14px;
    border: 1px solid rgba(139, 92, 246, 0.3);
    margin-left: 12px;
  }
  .footer {
    background: #0a0a0f;
    padding: 32px;
    text-align: center;
    border-top: 1px solid rgba(139, 92, 246, 0.1);
  }
  .footer-text {
    color: #666;
    font-size: 12px;
    margin-bottom: 12px;
  }
  .footer-link {
    color: #8b5cf6;
    text-decoration: none;
    font-weight: 500;
  }
  .footer-link:hover {
    text-decoration: underline;
  }
  .divider {
    height: 1px;
    background: rgba(139, 92, 246, 0.1);
    margin: 20px 0;
  }
  .list-item {
    color: #a0a0b0;
    font-size: 14px;
    margin-bottom: 12px;
    padding-left: 20px;
    position: relative;
    line-height: 1.6;
  }
  .list-item:before {
    content: '✓';
    position: absolute;
    left: 0;
    color: #06b6d4;
    font-weight: bold;
  }
  .stat-box {
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%);
    border: 1px solid rgba(139, 92, 246, 0.2);
    border-radius: 12px;
    padding: 24px;
    text-align: center;
    margin: 20px 0;
  }
  .stat-number {
    font-size: 36px;
    font-weight: 700;
    background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .stat-label {
    color: #a0a0b0;
    font-size: 13px;
    margin-top: 8px;
  }
  .table-row {
    display: flex;
    justify-content: space-between;
    padding: 12px 0;
    border-bottom: 1px solid rgba(139, 92, 246, 0.1);
  }
  .table-row:last-child {
    border-bottom: none;
  }
  .table-label {
    color: #a0a0b0;
    font-size: 13px;
  }
  .table-value {
    color: #ffffff;
    font-weight: 600;
  }
`

/**
 * Email 1: Welcome Email (Day 0)
 * Subject: "Bienvenue sur OmniFlow 🚀"
 */
export const welcomeTemplate = (): EmailTemplate => ({
  subject: 'Bienvenue sur OmniFlow 🚀',
  html: `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>${baseStyles}</style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">OMNIFLOW</div>
          <h1 class="header-title">Bienvenue à bord! 🚀</h1>
        </div>
        
        <div class="content">
          <p class="subtitle">Votre essai gratuit de <strong>7 jours</strong> a commencé. Préparez-vous à transformer votre agence OnlyFans avec l'automatisation complète.</p>
          
          <div class="steps">
            <div class="step">
              <div class="step-number">1</div>
              <div class="step-content">
                <h4>🔗 Connectez vos outils</h4>
                <p>Synchronisez AdsPower ou GeeLark en 2 minutes</p>
              </div>
            </div>
            <div class="step">
              <div class="step-number">2</div>
              <div class="step-content">
                <h4>👤 Ajoutez vos modèles</h4>
                <p>Paramétrez vos templates et vos modèles préférées</p>
              </div>
            </div>
            <div class="step">
              <div class="step-number">3</div>
              <div class="step-content">
                <h4>📅 Programmez vos posts</h4>
                <p>Lancez votre première automatisation</p>
              </div>
            </div>
          </div>
          
          <div class="card">
            <h3>Ce qui vous attend</h3>
            <div class="list-item">Dashboard financier en temps réel</div>
            <div class="list-item">Chatting IA pour gérer les DMs</div>
            <div class="list-item">Veille contenu intelligente</div>
            <div class="list-item">Génération vidéo IA</div>
            <div class="list-item">Gestion multi-comptes illimitée</div>
          </div>
          
          <div class="cta-container">
            <a href="https://omniflowapp.ai/dashboard" class="cta-button">Accéder à mon dashboard →</a>
          </div>
          
          <div class="card">
            <h3>Des questions?</h3>
            <p>Notre équipe est là pour vous aider. N'hésitez pas à répondre à cet email ou <a href="https://omniflowapp.ai/contact" class="footer-link">nous contacter</a>.</p>
          </div>
        </div>
        
        <div class="footer">
          <p class="footer-text">© 2026 OmniFlow — Omniflowapp.ai</p>
          <p class="footer-text">
            <a href="https://omniflowapp.ai/contact" class="footer-link">Nous contacter</a> • 
            <a href="#" class="footer-link">Se désinscrire</a>
          </p>
          <p class="footer-text">hello@omniflowapp.ai</p>
        </div>
      </div>
    </body>
    </html>
  `,
})

/**
 * Email 2: Day 1 - Tool Integration Guide
 * Subject: "Comment connecter AdsPower à OmniFlow (2 min ⚡)"
 */
export const toolIntegrationTemplate = (): EmailTemplate => ({
  subject: 'Comment connecter AdsPower à OmniFlow (2 min ⚡)',
  html: `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>${baseStyles}</style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">OMNIFLOW</div>
          <h1 class="header-title">Connectez vos outils ⚡</h1>
        </div>
        
        <div class="content">
          <p class="subtitle">Synchronisez vos comptes AdsPower et GeeLark en quelques secondes. C'est le cœur du système OmniFlow.</p>
          
          <div class="card">
            <h3>Option 1: AdsPower</h3>
            <div class="step" style="border: none; padding: 0; display: block; margin-bottom: 16px;">
              <div style="display: flex; align-items: center; margin-bottom: 12px;">
                <span style="display: inline-block; background: #1a1a2e; border: 1px solid #8b5cf6; border-radius: 4px; width: 24px; height: 24px; line-height: 24px; text-align: center; color: #8b5cf6; font-weight: bold; margin-right: 8px;">1</span>
                <span style="color: white; font-weight: 600;">Ouvrir AdsPower</span>
              </div>
              <div style="display: flex; align-items: center; margin-bottom: 12px;">
                <span style="display: inline-block; background: #1a1a2e; border: 1px solid #8b5cf6; border-radius: 4px; width: 24px; height: 24px; line-height: 24px; text-align: center; color: #8b5cf6; font-weight: bold; margin-right: 8px;">2</span>
                <span style="color: white; font-weight: 600;">Aller à Paramètres → API</span>
              </div>
              <div style="display: flex; align-items: center; margin-bottom: 12px;">
                <span style="display: inline-block; background: #1a1a2e; border: 1px solid #8b5cf6; border-radius: 4px; width: 24px; height: 24px; line-height: 24px; text-align: center; color: #8b5cf6; font-weight: bold; margin-right: 8px;">3</span>
                <span style="color: white; font-weight: 600;">Copier votre API Key</span>
              </div>
              <div style="display: flex; align-items: center;">
                <span style="display: inline-block; background: #1a1a2e; border: 1px solid #8b5cf6; border-radius: 4px; width: 24px; height: 24px; line-height: 24px; text-align: center; color: #8b5cf6; font-weight: bold; margin-right: 8px;">4</span>
                <span style="color: white; font-weight: 600;">Coller dans OmniFlow</span>
              </div>
            </div>
          </div>
          
          <div class="card">
            <h3>Option 2: GeeLark</h3>
            <div style="color: #a0a0b0; font-size: 14px; line-height: 1.6;">
              <p style="margin-bottom: 8px;"><strong>1.</strong> Visitez <strong>geelark.com</strong></p>
              <p style="margin-bottom: 8px;"><strong>2.</strong> Allez à Paramètres → API</p>
              <p style="margin-bottom: 8px;"><strong>3.</strong> Générez une nouvelle clé API</p>
              <p style="margin: 0;"><strong>4.</strong> Collez-la dans OmniFlow</p>
            </div>
          </div>
          
          <div class="stat-box">
            <div style="color: #a0a0b0; font-size: 12px; margin-bottom: 8px;">Temps estimé</div>
            <div class="stat-number">2 min</div>
          </div>
          
          <div class="cta-container">
            <a href="https://omniflowapp.ai/dashboard/settings/integrations" class="cta-button">Connecter mes outils →</a>
          </div>
          
          <div class="card">
            <p style="color: #a0a0b0; font-size: 13px;">💡 <strong>Besoin d'aide?</strong> Consultez notre <a href="https://omniflowapp.ai/docs" class="footer-link">documentation détaillée</a> ou répondez à cet email.</p>
          </div>
        </div>
        
        <div class="footer">
          <p class="footer-text">© 2026 OmniFlow — Omniflowapp.ai</p>
          <p class="footer-text">
            <a href="https://omniflowapp.ai/docs" class="footer-link">Documentation</a> • 
            <a href="#" class="footer-link">Se désinscrire</a>
          </p>
          <p class="footer-text">Répondez à cet email pour l'assistance</p>
        </div>
      </div>
    </body>
    </html>
  `,
})

/**
 * Email 3: Day 3 - First Post Reminder
 * Subject: "Avez-vous schedulé votre premier post ? 📅"
 */
export const firstPostTemplate = (): EmailTemplate => ({
  subject: 'Avez-vous schedulé votre premier post ? 📅',
  html: `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>${baseStyles}</style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">OMNIFLOW</div>
          <h1 class="header-title">Programmez votre premier post! 📅</h1>
        </div>
        
        <div class="content">
          <p class="subtitle">Vous avez exploré OmniFlow et connecté vos outils. Maintenant, déclenchez la magie avec votre première automatisation!</p>
          
          <div class="stat-box">
            <div style="color: #a0a0b0; font-size: 12px; margin-bottom: 8px;">Les agences OmniFlow postent en moyenne</div>
            <div class="stat-number">47x</div>
            <div class="stat-label">plus de contenu avec l'automatisation</div>
          </div>
          
          <div class="card">
            <h3>Pourquoi programmer vos posts?</h3>
            <div class="list-item">Gagnez 2-3 heures par jour</div>
            <div class="list-item">Posez au meilleur moment pour chaque modèle</div>
            <div class="list-item">Augmentez vos revenus sans effort supplémentaire</div>
            <div class="list-item">Gérez 50+ comptes simultanement</div>
            <div class="list-item">Zéro erreur manuelle</div>
          </div>
          
          <div class="card">
            <h3>3 étapes simples</h3>
            <div class="step" style="border: none; padding: 0; display: block; margin-bottom: 12px;">
              <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <span style="display: inline-block; background: #1a1a2e; border: 1px solid #8b5cf6; border-radius: 4px; width: 24px; height: 24px; line-height: 24px; text-align: center; color: #8b5cf6; font-weight: bold; margin-right: 8px;">1</span>
                <span style="color: white; font-weight: 600;">Sélectionner vos modèles</span>
              </div>
              <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <span style="display: inline-block; background: #1a1a2e; border: 1px solid #8b5cf6; border-radius: 4px; width: 24px; height: 24px; line-height: 24px; text-align: center; color: #8b5cf6; font-weight: bold; margin-right: 8px;">2</span>
                <span style="color: white; font-weight: 600;">Choisir vos contenus & timing</span>
              </div>
              <div style="display: flex; align-items: center;">
                <span style="display: inline-block; background: #1a1a2e; border: 1px solid #8b5cf6; border-radius: 4px; width: 24px; height: 24px; line-height: 24px; text-align: center; color: #8b5cf6; font-weight: bold; margin-right: 8px;">3</span>
                <span style="color: white; font-weight: 600;">Valider & c'est parti!</span>
              </div>
            </div>
          </div>
          
          <div class="cta-container">
            <a href="https://omniflowapp.ai/dashboard/posting" class="cta-button">Programmer un post →</a>
          </div>
          
          <div class="card">
            <p style="color: #a0a0b0; font-size: 13px;">Besoin d'inspiration? Consultez la section <a href="https://omniflowapp.ai/dashboard/content/veille" class="footer-link">Veille</a> pour découvrir les meilleurs contenus du moment.</p>
          </div>
        </div>
        
        <div class="footer">
          <p class="footer-text">© 2026 OmniFlow — Omniflowapp.ai</p>
          <p class="footer-text">
            <a href="https://omniflowapp.ai/dashboard/posting" class="footer-link">Programmer maintenant</a> • 
            <a href="#" class="footer-link">Se désinscrire</a>
          </p>
          <p class="footer-text">Questions? Répondez à cet email</p>
        </div>
      </div>
    </body>
    </html>
  `,
})

/**
 * Email 4: Day 7 - Trial Ending Soon
 * Subject: "⏰ Votre essai gratuit se termine demain"
 */
export const trialEndingTemplate = (): EmailTemplate => ({
  subject: '⏰ Votre essai gratuit se termine demain',
  html: `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>${baseStyles}</style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">OMNIFLOW</div>
          <h1 class="header-title">Continuons l'aventure! 🚀</h1>
        </div>
        
        <div class="content">
          <p class="subtitle">Votre essai gratuit de 7 jours se termine demain. Vous avez découvert la puissance d'OmniFlow — continuons ensemble?</p>
          
          <div class="card">
            <h3>Récapitulatif de votre essai</h3>
            <div class="table-row">
              <div class="table-label">Jours d'accès</div>
              <div class="table-value">7/7 jours</div>
            </div>
            <div class="table-row">
              <div class="table-label">Outils disponibles</div>
              <div class="table-value">Tous</div>
            </div>
            <div class="table-row">
              <div class="table-label">Comptes</div>
              <div class="table-value">Illimité</div>
            </div>
            <div class="table-row">
              <div class="table-label">Support</div>
              <div class="table-value">Prioritaire</div>
            </div>
          </div>
          
          <div class="card">
            <h3>Ce que vous débloquez en continuant</h3>
            <div class="list-item">📊 Dashboard financier temps réel</div>
            <div class="list-item">🤖 Chatting IA pour gérer les DMs</div>
            <div class="list-item">📈 Veille contenu intelligente</div>
            <div class="list-item">🎬 Génération vidéo IA</div>
            <div class="list-item">📱 Gestion multi-comptes illimitée</div>
            <div class="list-item">🌍 Croissance multilingue (FR/EN/ES)</div>
          </div>
          
          <div class="cta-container">
            <a href="https://omniflowapp.ai/settings/billing" class="cta-button">Continuer avec OmniFlow →</a>
            <a href="https://omniflowapp.ai/pricing" class="secondary-button">Voir les tarifs</a>
          </div>
          
          <div class="card">
            <h3>Des hésitations?</h3>
            <p style="color: #a0a0b0; font-size: 14px; margin-bottom: 12px;">Notre équipe est là. Nous pouvons discuter de vos besoins spécifiques et trouver le plan idéal pour votre agence.</p>
            <p style="margin: 0;">
              <a href="https://omniflowapp.ai/contact" class="footer-link">📞 Demander un appel</a>
            </p>
          </div>
          
          <div style="background: rgba(6, 182, 212, 0.05); border-left: 3px solid #06b6d4; padding: 16px; border-radius: 6px; margin: 20px 0;">
            <p style="color: #a0a0b0; font-size: 13px; margin: 0;">💬 <strong>Besoin d'aide?</strong> Répondez directement à cet email ou contactez-nous sur Telegram. Nous répondons en &lt;1h.</p>
          </div>
        </div>
        
        <div class="footer">
          <p class="footer-text">© 2026 OmniFlow — Omniflowapp.ai</p>
          <p class="footer-text">
            <a href="https://omniflowapp.ai/pricing" class="footer-link">Tarifs</a> • 
            <a href="https://omniflowapp.ai/contact" class="footer-link">Nous contacter</a> • 
            <a href="#" class="footer-link">Se désinscrire</a>
          </p>
          <p class="footer-text">hello@omniflowapp.ai | Support 24/7</p>
        </div>
      </div>
    </body>
    </html>
  `,
})

/**
 * Email 5: Payment Confirmed
 * Subject: "✅ Votre abonnement OmniFlow est actif"
 */
export const paymentConfirmedTemplate = (plan?: string, renewalDate?: string): EmailTemplate => ({
  subject: '✅ Votre abonnement OmniFlow est actif',
  html: `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>${baseStyles}</style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">OMNIFLOW</div>
          <h1 class="header-title">Bienvenue! ✅</h1>
        </div>
        
        <div class="content">
          <p class="subtitle">Votre abonnement OmniFlow est maintenant actif. Vous avez accès complet à toutes les fonctionnalités.</p>
          
          <div class="card">
            <h3>Détails de votre abonnement</h3>
            <div class="table-row">
              <div class="table-label">Plan</div>
              <div class="table-value">${plan || 'OmniFlow Pro'}</div>
            </div>
            <div class="table-row">
              <div class="table-label">Date de renouvellement</div>
              <div class="table-value">${renewalDate || 'Prochainement'}</div>
            </div>
            <div class="table-row">
              <div class="table-label">Support</div>
              <div class="table-value">Prioritaire</div>
            </div>
            <div class="table-row">
              <div class="table-label">Statut</div>
              <div class="table-value" style="color: #06b6d4;">✓ Actif</div>
            </div>
          </div>
          
          <div class="card">
            <h3>Accès débloqué</h3>
            <div class="list-item">📊 Dashboard financier complet</div>
            <div class="list-item">🤖 ChatGPT intégré pour les DMs</div>
            <div class="list-item">📈 Veille contenu et tendances</div>
            <div class="list-item">🎬 Génération vidéo IA</div>
            <div class="list-item">📅 Programmation illimitée</div>
            <div class="list-item">🌍 Support multilingue 24/7</div>
          </div>
          
          <div class="cta-container">
            <a href="https://omniflowapp.ai/dashboard" class="cta-button">Accéder à mon dashboard →</a>
          </div>
          
          <div class="card">
            <h3>Vous êtes prêt?</h3>
            <p style="color: #a0a0b0; font-size: 14px; margin-bottom: 12px;">Voici les prochaines étapes pour maximiser OmniFlow:</p>
            <div class="list-item">Créer votre premier workflow</div>
            <div class="list-item">Configurer vos modèles préférées</div>
            <div class="list-item">Programmer 7 jours de contenu</div>
            <div class="list-item">Explorer la Veille IA</div>
          </div>
        </div>
        
        <div class="footer">
          <p class="footer-text">© 2026 OmniFlow — Omniflowapp.ai</p>
          <p class="footer-text">
            <a href="https://omniflowapp.ai/dashboard" class="footer-link">Mon dashboard</a> • 
            <a href="https://omniflowapp.ai/docs" class="footer-link">Documentation</a> • 
            <a href="https://omniflowapp.ai/contact" class="footer-link">Support</a>
          </p>
          <p class="footer-text">Merci d'avoir choisi OmniFlow!</p>
        </div>
      </div>
    </body>
    </html>
  `,
})

/**
 * Email 6: Monthly Invoice
 * Subject: "Votre facture OmniFlow — [Month]"
 */
export const invoiceTemplate = (month?: string, amount?: string, invoiceUrl?: string): EmailTemplate => ({
  subject: `Votre facture OmniFlow — ${month || 'Mai 2026'}`,
  html: `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>${baseStyles}</style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">OMNIFLOW</div>
          <h1 class="header-title">Votre facture 📄</h1>
        </div>
        
        <div class="content">
          <p class="subtitle">Voici votre facture pour le mois de ${month || 'mai 2026'}. Téléchargez-la ou consultez vos détails de paiement.</p>
          
          <div class="card">
            <h3>Récapitulatif</h3>
            <div class="table-row">
              <div class="table-label">Période</div>
              <div class="table-value">${month || 'Mai 2026'}</div>
            </div>
            <div class="table-row">
              <div class="table-label">Forfait</div>
              <div class="table-value">OmniFlow Pro</div>
            </div>
            <div class="table-row">
              <div class="table-label">Montant</div>
              <div class="table-value" style="font-size: 18px; color: #06b6d4;">${amount || '49 €'}</div>
            </div>
            <div class="table-row">
              <div class="table-label">Statut</div>
              <div class="table-value" style="color: #06b6d4;">✓ Payée</div>
            </div>
          </div>
          
          <div class="cta-container">
            <a href="${invoiceUrl || 'https://omniflowapp.ai/dashboard/billing'}" class="cta-button">Télécharger la facture →</a>
          </div>
          
          <div class="card">
            <h3>Prochains pas</h3>
            <div class="list-item">Votre prochain renouvellement: 21 Juin 2026</div>
            <div class="list-item">Aucune action requise de votre part</div>
            <div class="list-item">Continuez à profiter de tous les outils</div>
          </div>
          
          <div style="background: rgba(139, 92, 246, 0.05); border-left: 3px solid #8b5cf6; padding: 16px; border-radius: 6px; margin: 20px 0;">
            <p style="color: #a0a0b0; font-size: 13px; margin: 0;">💼 Besoin d'une facture différente ou avez des questions de facturation? <a href="https://omniflowapp.ai/contact" class="footer-link">Contactez-nous</a>.</p>
          </div>
        </div>
        
        <div class="footer">
          <p class="footer-text">© 2026 OmniFlow — Omniflowapp.ai</p>
          <p class="footer-text">
            <a href="https://omniflowapp.ai/dashboard/billing" class="footer-link">Historique facturation</a> • 
            <a href="https://omniflowapp.ai/contact" class="footer-link">Support</a>
          </p>
          <p class="footer-text">Siège: France | TVA applicable selon votre lieu</p>
        </div>
      </div>
    </body>
    </html>
  `,
})

/**
 * Email 7: Weekly Report
 * Subject: "📊 Votre rapport OmniFlow — Semaine du [date]"
 */
export const weeklyReportTemplate = (
  agencyName: string,
  stats: {
    postsPublished: number
    revenue: number
    newFans: number
    aiGenerations: number
    riskFans: number
    previousRevenue?: number
  }
): EmailTemplate => {
  const revenueGrowth = stats.previousRevenue
    ? ((stats.revenue - stats.previousRevenue) / stats.previousRevenue) * 100
    : 0
  const isGrowth = revenueGrowth >= 0

  return {
    subject: `📊 Votre rapport OmniFlow — Semaine du ${new Date().toLocaleDateString('fr-FR')}`,
    html: `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>${baseStyles}</style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">OMNIFLOW</div>
            <h1 class="header-title">Votre bilan de la semaine 📊</h1>
          </div>
          
          <div class="content">
            <p class="subtitle">Bonjour <strong>${agencyName}</strong>, voici votre récapitulatif detaillé pour la semaine.</p>
            
            <!-- Stats Cards -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 24px 0;">
              <div class="stat-box">
                <div style="color: #a0a0b0; font-size: 12px; margin-bottom: 8px;">📤 Posts publiés</div>
                <div class="stat-number">${stats.postsPublished}</div>
              </div>
              <div class="stat-box">
                <div style="color: #a0a0b0; font-size: 12px; margin-bottom: 8px;">💰 Revenus générés</div>
                <div class="stat-number">${stats.revenue.toLocaleString('fr-FR')} €</div>
                <div class="stat-label" style="color: ${isGrowth ? '#06b6d4' : '#ef4444'};">
                  ${isGrowth ? '↑' : '↓'} ${Math.abs(revenueGrowth).toFixed(1)}% vs semaine dernière
                </div>
              </div>
              <div class="stat-box">
                <div style="color: #a0a0b0; font-size: 12px; margin-bottom: 8px;">👥 Nouveaux fans</div>
                <div class="stat-number">${stats.newFans}</div>
              </div>
              <div class="stat-box">
                <div style="color: #a0a0b0; font-size: 12px; margin-bottom: 8px;">🤖 Générations IA</div>
                <div class="stat-number">${stats.aiGenerations}</div>
              </div>
            </div>
            
            <!-- Details Card -->
            <div class="card">
              <h3>Détails de votre semaine</h3>
              <div class="table-row">
                <div class="table-label">📤 Posts publiés</div>
                <div class="table-value">${stats.postsPublished} posts</div>
              </div>
              <div class="table-row">
                <div class="table-label">💰 Revenus</div>
                <div class="table-value">${stats.revenue.toLocaleString('fr-FR')} €</div>
              </div>
              <div class="table-row">
                <div class="table-label">👥 Fans gagnés</div>
                <div class="table-value">+${stats.newFans}</div>
              </div>
              <div class="table-row">
                <div class="table-label">🤖 Contenus générés (IA)</div>
                <div class="table-value">${stats.aiGenerations} vidéos</div>
              </div>
              <div class="table-row">
                <div class="table-label">⚠️ Fans à risque</div>
                <div class="table-value" style="color: ${stats.riskFans > 5 ? '#ef4444' : '#06b6d4'};">${stats.riskFans} fans</div>
              </div>
            </div>
            
            <!-- Risk Alert -->
            ${stats.riskFans > 5
              ? `
            <div style="background: rgba(239, 68, 68, 0.05); border-left: 3px solid #ef4444; padding: 16px; border-radius: 6px; margin: 20px 0;">
              <p style="color: #a0a0b0; font-size: 13px; margin: 0;">⚠️ <strong>Attention:</strong> Vous avez ${stats.riskFans} fans à risque. Nous vous recommandons de vérifier vos contenus et d'engager rapidement.</p>
            </div>
            `
              : ''
            }
            
            <!-- CTA -->
            <div class="cta-container">
              <a href="https://omniflowapp.ai/dashboard" class="cta-button">Voir le dashboard complet →</a>
            </div>
            
            <!-- Tip Card -->
            <div class="card">
              <h3>💡 Conseil de la semaine</h3>
              <p style="color: #a0a0b0; font-size: 14px; margin: 0;">
                ${stats.postsPublished > 20
                  ? 'Bravo! Vous postez plus que la moyenne. Maintienez ce rythme pour maximiser vos revenus.'
                  : 'Augmentez votre fréquence de posts. Les agences qui postent 20+ fois par semaine génèrent 3x plus de revenus.'}
              </p>
            </div>
          </div>
          
          <div class="footer">
            <p class="footer-text">© 2026 OmniFlow — Omniflowapp.ai</p>
            <p class="footer-text">
              <a href="https://omniflowapp.ai/dashboard" class="footer-link">Dashboard</a> • 
              <a href="https://omniflowapp.ai/contact" class="footer-link">Support</a>
            </p>
            <p class="footer-text">Rapport généré automatiquement chaque lundi</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }
}

/**
 * Export all templates for easy access
 */
export const emailTemplates = {
  welcome: welcomeTemplate,
  toolIntegration: toolIntegrationTemplate,
  firstPost: firstPostTemplate,
  trialEnding: trialEndingTemplate,
  paymentConfirmed: paymentConfirmedTemplate,
  invoice: invoiceTemplate,
  weeklyReport: weeklyReportTemplate,
}
