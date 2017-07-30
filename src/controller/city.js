import City from '../model/city';

export function search(req, res) {
  const q = req.query.q;
  if (!q || q.length < 3) res.sendStatus(400);

  City.find({ name: { $regex: new RegExp(`^${q}`, 'i') } }).then((docs) => {
    res.send(docs);
  }).catch((err) => {
    console.error(err);
    res.sendStatus(500);
  })
}
