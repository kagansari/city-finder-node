import {SmallCity, LargeCity} from '../model/city';
import slug from 'slug';

export function search(req, res) {
  const q = req.query.q;
  const dataset = req.query.dataset || 'small';

  if (!dataset.match(/^(small|large)$/)) res.status(400).send({ message: 'Enter at valid dataset' });
  if (!q || q.length < 3) res.status(400).send({ message: 'Enter at least 3 letters' });
  if (!q || q.length < 3) res.status(400).send({ message: 'Enter at least 3 letters' });

  const Model = dataset === 'small' ? SmallCity : LargeCity;
  Model.find({
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
