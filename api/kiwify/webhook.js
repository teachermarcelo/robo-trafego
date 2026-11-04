import kiwifyHandler from '../webhook/kiwify.js';

export default async function handler(req, res) {
  return kiwifyHandler(req, res);
}
