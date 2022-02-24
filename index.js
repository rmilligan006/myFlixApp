const express = require('express'),
  morgan = require('morgan');

const app = express();

app.use(morgan('common'));
app.use(express.static('public'));

//Get Commands!
app.get('/', (req, res) => {
  res.send('Welcome to my app!');
});

app.get('/secreturl', (req, res) => {
  res.send('This is a secret url with super top-secret content.');
});


//Listen Commands!
app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});