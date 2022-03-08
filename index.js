const express = require('express');
  morgan = require('morgan');
  const app = express();
//bodyParser, and uuid calls
const bodyParser = require('body-parser'),
uuid = require('uuid');
methodOverride = require('method-override');
const { rest, bindAll } = require('lodash');

//exporting of the mongoose!
const mongoose = require('mongoose');
const Models = require('./models');
const Movies = Models.Movie;
const Users = Models.User;

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

app.use(bodyParser.urlencoded({ extended: true }));
let auth = require('./auth.js')(app);

const passport = require('passport');
require('./passport.js');



// Create!
app.post('/users', (req, res) => {
  Users.findOne({ Username: req.body.Username })
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

//Adding a movie to the users list of favourites!
app.post('/users/:Username/movies/:MovieID', (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
     $push: { FavoriteMovies: req.params.MovieID }
   },
   { new: true }, // This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

//Update!!
app.put('/users/:Username', (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
    {
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  },
  { new: true }, // This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if(err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});



//DELETE!!
 app.delete('/users/:Username/:movies/:MovieID', (req, res) => {
  Users.findOneAndUpdate({ Username : req.params.Username}, //Finds the user by Username
    {$pull: {FavouriteMovies: req.params.MovieID}},
    {new : true}) 
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err)
    })
}); 

//This allows people to removed or deregister from the app
// Delete a user by username
app.delete('/users/:Username/', (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found');
      } else {
        res.status(200).send(req.params.Username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});



//Get Commands!
app.get('/', (req, res) => {
  res.send('Welcome to my movie app!');
});

app.get('/documentation', (req, res) => {
  res.sendFile('public/documentation.html', {root: __dirname});
});

//READ!!!
app.get('/movies', passport.authenticate('jwt', {session: false}), (req, res) => {
  Movies.find()
    .then((movies) => {
      res.status(200).json(movies);
    })
    .catch((err) => {
      res.status(500).send('Error: '+ err);
    });
});

app.get('/movies/genre/:genreName', (req, res) => {
  Movies.findOne({ 'Genre.name': req.params.Name})
  .then((movies) => {
    if(movies) {
      res.status(200).json(movies.Genre);
    } else {
      res.status(400).send('Genre Not Found!');
    };
  })
  .catch((err) => {
    res.status(500).send('Error ' + err);
  });
});

app.get('/movies/director/:directorName', (req, res) => {
  Movies.findOne({ 'Director.name': req.params.Name })//allows you to search for a director by name!
  .then((movies) => {
    if(movies){
      res.status(200).json(movies.Director);
    } else {
      res.status(400).send('Director Not Found!');
    };
  })
  .catch((err) => {
    res.status(500).send('Error ' + err);
  });
});

//Gwtting the Users!
app.get('/users', (req, res) => {
  Users.find()
    .then((users) => {
      res.status(200).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err)
    });
});

//Getting the User by Username
app.get('/users/:Username', (req, res) => {
  Users.findOne({ Username: req.params.Username})
  .then((user) => {
    res.json(user);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});





//Listen Commands!
app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});



//mongodb name
