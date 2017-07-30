export function search(req, res) {
  const q = req.query.q;
  if (!q || q.length < 3) res.sendStatus(400);
  res.send([]);
}
