import City from '../model/city';
import slug from 'slug';

export function search(req, res) {
  const q = req.query.q;
  if (!q || q.length < 3) res.status(400).send({ message: 'Enter at least 3 letters' });

  City.find({
    slug: {
      $regex: new RegExp(`^${slug(q, {lower: true})}`)
    }
  }).limit(100).then((docs) => {
    res.send(docs);
  }).catch((err) => {
    console.error(err);
    res.sendStatus(500);
  })
}
