const express = require('express');
  morgan = require('morgan');
  const app = express();
//bodyParser, and uuid calls
const bodyParser = require('body-parser');
uuid = require('uuid');
methodOverride = require('method-override');
const { rest, bindAll } = require('lodash');

//exporting of the mongoose!
const mongoose = require('mongoose');
const Models = require('./models.js');
const Movies = Models.movie;
const Users = Models.user;
mongoose.connect('mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true });

//USE, GET, POST, DELETE methods
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




// Create!
app.post('/users', (req, res) => {
  users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + 'already exists');
      } else {
        Users
          .create({
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday
          })
          .then((user) =>{res.status(201).json(user) })
        .catch((error) => {
          console.error(error);
          res.status(500).send('Error: ' + error);
        })
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

//Update!!
app.put('/users/:Username', (req, res) => {
  const  { id } = req.params;
  const updateUser = req.body;

  let user = users.find( user => user.id == id);

  if (user) {
    user.name = updateUser.name;
    res.status(200).json(user);
  } else {
    res.status(400).send('No such user');
  }
});

//POST!
app.post('/users/:Username/:movieTitle', (req, res) => {
  const  { id, movieTitle } = req.params;
  
  let user = users.find( user => user.id == id);

  if (user) {
    user.favoriteMovies.push(movieTitle);
    res.status(200).send(`${movieTitle} has been added to user ${id}'s array`);
  } else {
    res.status(400).send('No such user');
  }
});

//DELETE!!
app.delete('/users/:Username/:movieTitle', (req, res) => {
  const {id, movieTitle} =req.params;

  let user = users.find( user => user.id == id);

  if(user) {
    user.favoriteMovies = user.favoriteMovies.filter(title => title !== movieTitle);
    res.status(200).send(`The ${movieTitle} has been removed from user ${id}'s array`);
  } else {
    res.status(400).send('No such user')
  }
});

//This allows people to removed or deregister from the app
app.delete('/users/:Username/', (req, res) => {
  const { id } =req.params;

  let user = users.find( user => user.id == id);

  if(user) {
    users = users.filter(user => user.id != id);
    res.status(200).send(` user ${id}'s has been deleted`);
  } else {
    res.status(400).send('No such user')
  }
});


//Get Commands!
app.get('/', (req, res) => {
  res.send('Welcome to my movie app!');
});

app.get('/documentation', (req, res) => {
  res.sendFile('public/documentation.html', {root: __dirname});
});

app.get('/movies', (req, res) => {
  res.status(200).json(topMovies);
});

//READ!!!
app.get('/movies/:title', (req, res) => {
    const  { title } = req.params;
    const movie = topMovies.find(movie => movie.title === title );

    if (movie) {
      res.status(200).json(movie);
    } else {
      res.status(400).send('No such movie!')
    }

});

app.get('/movies/genre/:genreName', (req, res) => {
  const  { genreName } = req.params;
  const genre = topMovies.find(movie => movie.Genre.Name === genreName ).Genre;

  if (genre) {
    res.status(200).json(genre);
  } else {
    res.status(400).send('No such genre!')
  }

});

app.get('/movies/director/:directorName', (req, res) => {
  const { directorName } = req.params;
  const director = topMovies.find( movie => movie.Director.Name === directorName).Director;
  if (director) {
    res.status(200).json(director);
  } else {
    res.status(400).send('no such director!')
  }
})





//Listen Commands!
app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});



//mongodb name
