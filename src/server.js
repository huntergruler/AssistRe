// This is your test secret API key.
const stripe = require('stripe')('sk_test_51PUWl0DidT8L3PDwVnfxBbiUpJEhLUje8HDkvRbbNeAF7JF0xqnymSWK1uZX03PtcuY9JCna7B59awJfHUFTtgxY00yxLiMJDl');
const express = require('express');
const app = express();
app.use(express.static('public'));

const YOUR_DOMAIN = 'http://3.129.42.126:4242';
const PRICE_ID = '1000000011'

app.post('/create-checkout-session', async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
        price: PRICE_ID,
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${YOUR_DOMAIN}/success.html`,
    cancel_url: `${YOUR_DOMAIN}/cancel.html`,
  });

  res.redirect(303, session.url);
});

app.listen(4242, () => console.log('Running on port 4242'));