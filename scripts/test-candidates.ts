import https from 'https';

const candidates = [
  'photo-1478760329108-5c3ed9d495a0',
  'photo-1518173946687-a4c8a383392e',
  'photo-1481627834876-b7833e8f5570',
  'photo-1524995997946-a1c2e315a42f',
];

candidates.forEach(id => {
  const url = `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&h=750&q=80`;
  https.get(url, res => {
    console.log(`${id}: ${res.statusCode} ${res.headers['content-type']}`);
  });
});
