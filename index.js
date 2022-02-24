const express = require('express'),
  morgan = require('morgan');

const app = express();
const bodyParser = require('body-parser'),
  methodOverride = require('method-override');

  let topMovies = [ // A small list of favourite movies
    {
      title: 'Blues Brothers',
      Director: 'John Landis'
    },
    {
      title: 'The Godfather',
      director: 'Francis Ford Coppola'
    },
    {
      title: 'The Departed',
      Director: 'Martin Scorsese'
    },
    {
      title: 'Rush Hour 2',
      director: 'Brett Ratner'
    },
    {
      title: 'Gran Torino',
      director: 'Clint Eastwood'
    },
    {
      Title: 'John Wick',
      Director: 'Chad Stahelski'
    },
    {
      Title: '300',
      Director: 'Zack Snyder'
    },
    {
      Title: 'Slap Shot',
      Director: 'Geroge Roy Hill'
    },
    {
      Title: 'Goon',
      Director: 'Michael Dowse'
    },
    {
      Title: 'The Rocket',
      Director: 'Charles Biname'
    }

  ];

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

app.get('/movies', (req, res) => {
  res.json(topMovies);
});


//Listen Commands!
app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});