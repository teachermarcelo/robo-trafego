/**
 * Vercel Serverless Function for Kiwify Webhook
 * Handles POST requests from Kiwify (Venda Aprovada, Pix Gerado, etc.)
 * URL: https://robo-trafego.vercel.app/api/webhook/kiwify
 */

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Health check / GET verification
  if (req.method === 'GET') {
    return res.status(200).json({
      status: 200,
      service: 'Kiwify Webhook Receiver (AutoViral AI)',
      ready: true,
      timestamp: new Date().toISOString(),
    });
  }

  try {
    const body = req.body || {};
    console.log('Kiwify Webhook Payload (Vercel):', JSON.stringify(body));

    const orderStatus = (body.order_status || body.status || 'paid').toLowerCase();
    const customer = body.Customer || body.customer || {};
    const commissions = body.Commissions || body.commissions || {};
    const product = body.Product || body.product || {};

    const fullName = customer.full_name || customer.name || body.name || 'Comprador Kiwify';
    const email = customer.email || body.email || '';
    let phone = String(customer.mobile || customer.phone || body.mobile || '').replace(/\D/g, '');
    if (phone && !phone.startsWith('55') && phone.length <= 11) {
      phone = `55${phone}`;
    }

    let price = 9.90;
    if (commissions.charge_amount) {
      price = Number(commissions.charge_amount) / 100;
    } else if (body.amount) {
      price = Number(body.amount) > 100 ? Number(body.amount) / 100 : Number(body.amount);
    }

    const isPaid = orderStatus === 'paid' || orderStatus === 'approved' || orderStatus === 'complete';

    return res.status(200).json({
      status: 200,
      received: true,
      message: 'Kiwify Webhook processado com sucesso!',
      orderId: body.order_id || `KW-${Date.now().toString().slice(-6)}`,
      customer: {
        name: fullName,
        email,
        phone,
      },
      product: product.product_name || '+100 Tarefinhas Educação Infantil e Autismo',
      amount: price,
      isPaid,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Error processing Kiwify Webhook in Vercel function:', err);
    return res.status(200).json({
      status: 200,
      received: true,
      warning: 'Processed with fallback',
      error: err.message,
    });
  }
}
