const express = require('express'),
  morgan = require('morgan');

const app = express();
const bodyParser = require('body-parser'),
  methodOverride = require('method-override');

app.use(bodyParser.urlencoded({
  extended: true
}));

//USE Commands!!
app.use(bodyParser.json());
app.use(methodOverride());

app.use((err, req, res, next) => {
  // logic
});

app.use(morgan('common'));
app.use(express.static('public'));

//Get Commands!
app.get('/', (req, res) => {
  res.send('Welcome to my movie app!');
});

app.get('/documentation', (req, res) => {
  res.sendFile('public/documentation.html', {root: __dirname});
});


//Listen Commands!
app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});