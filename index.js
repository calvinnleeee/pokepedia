const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.static(__dirname + "/public"));

// ---------------------------------------------------------------------

app.get('/', (req, res) => {
  res.redirect('/pokemon');
  return;
});

app.get('/pokemon', (req, res) => {
  res.render('pokemon');
});

app.get('/abilities', (req, res) => {
  res.render('abilities');
});

app.get('/moves', (req, res) => {
  res.render('moves');
});

app.get('/types', (req, res) => {
  res.render('types');
});

// ---------------------------------------------------------------------

app.get('*', (req, res) => {
  res.redirect('pokemon');
  return;
});

app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});
