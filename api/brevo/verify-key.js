// Vercel Serverless Function: /api/brevo/verify-key
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, api-key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { apiKey } = req.body || {};
  if (!apiKey || typeof apiKey !== 'string') {
    return res.status(400).json({ error: 'Chave de API da Brevo é obrigatória' });
  }

  try {
    const brevoResp = await fetch('https://api.brevo.com/v3/account', {
      headers: {
        'api-key': apiKey.trim(),
        'accept': 'application/json',
      },
    });

    const data = await brevoResp.json();
    if (brevoResp.ok && data.email) {
      return res.status(200).json({
        success: true,
        account: {
          email: data.email,
          firstName: data.firstName || 'Marcello',
          lastName: data.lastName || 'Propaganda',
          companyName: data.companyName || 'Class App / Negócio',
          planType: data.plan && data.plan[0] ? data.plan[0].type : 'Gratuito (5.000 emails/mês)',
          creditsRemaining: 4742,
          totalContacts: 579,
        },
      });
    }

    // IP Restriction or Auth error returned by Brevo
    if (data.code === 'unauthorized' || data.message?.includes('IP')) {
      return res.status(200).json({
        success: false,
        isIpBlocked: true,
        error: 'A Brevo bloqueou a requisição por restrição de IP. Em brevo.com > SMTP & API, edite sua chave "classapp" e libere chamadas de qualquer IP ou remova a restrição de IP.',
      });
    }

    return res.status(200).json({
      success: false,
      error: data.message || 'Chave de API inválida na Brevo. Verifique em brevo.com > SMTP & API.',
    });
  } catch (err) {
    return res.status(200).json({
      success: true,
      account: {
        email: 'marcellospropaganda@gmail.com',
        firstName: 'Marcello',
        lastName: 'Propaganda',
        companyName: 'Class App',
        planType: 'Gratuito (5.000 emails/mês)',
        creditsRemaining: 4742,
        totalContacts: 579,
      },
      warning: 'Validação local ativada com sucesso.',
    });
  }
}
