/**
 * imports express ( a node.js)framework with middlware module packages  body parser, uuid and morgan
 */
const express = require("express"),
  morgan = require("morgan");

const app = express();
//bodyParser, and uuid calls
/**automatically creates and assigns unique ids to new users */
const bodyParser = require("body-parser"),
  uuid = require("uuid");
methodOverride = require("method-override");

/**
 *  importing mongoose to be integrated with the REST API
 * this will allow the REST API to perform CRUD operations on MongoDB
 */
const mongoose = require("mongoose");
/**importing mongoose models which were defined in models.js */
const Models = require("./models");
const Movies = Models.Movie;
const Users = Models.User;
/**
 * integrating middleware express validator used for server-side input validation
 */
const { check, validationResult } = require("express-validator");
//mongoose.connect('mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
/** allows mongoose to connect to the myFlixDB database to perform CRUD operations
 */

//USE, GET, POST, DELETE methods

//USE Commands!!
app.use(bodyParser.json());
app.use(methodOverride());
/**
 * integrating middleware cors for Cross-origin resource sharing
 * it defines which domains/origins can access your API (here the default is, it grands access to all domains)
 */

app.use((err, req, res, next) => {
  // logic
});

app.use(morgan("common"));
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
const cors = require("cors");
app.use(cors());
require("./auth")(app);
const passport = require("passport");
require("./passport.js");
/**
 * integrating auth.js file for authentication and authorization using HTTP and JWSToken
 */

/**
 * POST route to add new User
 */

/* We’ll expect JSON in this format
{
  ID: Integer,
  Username: String,
  Password: String,
  Email: String,
  Birthday: Date
}*/
app.post(
  "/users",
  /**
   * Validation logic here for request
   * you can either use a chain of methods like .not().isEmpty()
   * which means "opposite of isEmpty" in plain english "is not empty"
   * or use .isLength({min: 5}) which means
   * minimum value of 5 characters are only allowed
   */
  [
    check("Username", "Username is required").isLength({ min: 5 }),
    check(
      "Username",
      "Username contains non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("Password", "Password is required").not().isEmpty(),
    check("Email", "Email does not appear to be valid").isEmail(),
  ],
  (req, res) => {
  /**check the validation object for errors */
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    
    Users.findOne({ Username: req.body.Username })  /** Search to see if a user with the requested username already exists*/
      .then((users) => {
        if (users) {
          /**If the user is found, send a response that it already exists */
          return res.status(400).send(req.body.Username + " already exists");
        } else {
          Users.create({
            Username: req.body.Username,
            Password: hashedPassword /** here the password is hashed*/,
            Email: req.body.Email,
            Birthday: req.body.Birthday,
          })
            .then((users) => {
              res.status(201).json(users);
            })
            .catch((error) => {
              console.error(error);
              res.status(500).send("Error: " + error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

/**POST route to add movie to favorite */
app.post(
  "/users/:Username/movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $push: { FavoriteMovies: req.params.MovieID },
      },
      { new: true }/**This line makes sure that the updated document is returned */,
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error: " + err);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);
/**PUT route to update User */
app.put(
  "/users/:Username",
  passport.authenticate("jwt", { session: false })/**this code integrates authorization for all the API endpoints */, 
  (req, res) => {
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $set: {
          Username: req.body.Username,
          Password: req.body.Password,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
        },
      },
      { new: true }, // This line makes sure that the updated document is returned
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error: " + err);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

/** DELETE route to delete favorite movie from list*/
app.delete(
  "/users/:Username/:movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { Username: req.params.Username }, // Find user by username
      { $pull: { FavoriteMovies: req.params.MovieID } }, // Remove movie from the list
      { new: true }/** This line makes sure that the updated document is returned*/
    ) // Return the updated document
      .then((updatedUser) => {
        res.json(updatedUser); // Return json object of updatedUser
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

//This allows people to removed or deregister from the app
/**DELETE route to delete user */
app.delete(
  "/users/:Username/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndRemove({ Username: req.params.Username })
      .then((user) => {
        if (!user) {
          res.status(400).send(req.params.Username + " was not found");
        } else {
          res.status(200).send(req.params.Username + " was deleted.");
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/** GET request to display message in the browser upon entering "localhost:8080" in the browser
 */
app.get("/", (req, res) => {
  res.send("Welcome to my movie app!");
});

app.get("/documentation", (req, res) => {
  res.sendFile("public/documentation.html", { root: __dirname });
});

/** GET route located at the endpoint "/movies" which returns a json object in form of a  list of top 10 movies with the status 200 "ok"
 */
app.get("/movies", (req, res) => {
  Movies.find()
    .then((movies) => {
      res.json(movies);
    })
    .catch((err) => {
      res.status(500).send("Error: " + err);
    });
});

/**GET route located at the endpoint "/movies/title" which returns a json object with a single movie
 */
app.get(
  "/movies/:Title",

  (req, res) => {
    Movies.findOne({ Title: req.params.Title })
      .then((movie) => {
        res.json(movie);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/** GET route located at the endpoint "/movies/genre" which returns a json object with a single movie
 */
app.get(
  "/movies/genre/:genreName",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.findOne({ "Genre.name": req.params.Name })
      .then((movies) => {
        if (movies) {
          res.json(movies.Genre);
        } else {
          res.status(400).send("Genre Not Found!");
        }
      })
      .catch((err) => {
        res.status(500).send("Error " + err);
      });
  }
);

/** GET route located at the endpoint "/movies/director" which returns a json object with a single movie
 */
app.get(
  "/movies/director/:directorName",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.findOne({ "Director.name": req.params.Name }) //allows you to search for a director by name!
      .then((movies) => {
        if (movies) {
          res.json(movies.Director);
        } else {
          res.status(400).send("Director Not Found!");
        }
      })
      .catch((err) => {
        res.status(500).send("Error " + err);
      });
  }
);

/**GET route to get a user */
app.get(
  "/users",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.find()
      .then((users) => {
        res.json(users);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**GET route to get a user */
app.get(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOne({ Username: req.params.Username })
      .then((user) => {
        res.json(user);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**setting up server on port 8080, listen for request */
const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log("Listening on Port " + port);
});/** express function that automatically routes all requests for static files to their corresponding files in the "public" folder
*/


