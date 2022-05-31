const express = require("express");
require("dotenv").config();
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const User = require("./models/user");
const Log = require("./models/log");
const Exercise = require("./models/exercise");

// Config
mongoose.connect(
  process.env.MONGO_URI,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => {
    console.log("Connected to mongoDB");
  }
);

// Middlware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.post("/api/users", (req, res) => {
  User.find({ username: req.body.username }, (err, userData) => {
    if (err) {
      console.log("Error with server=> ", err);
    } else {
      if (userData.length === 0) {
        const newUser = new User({
          _id: req.body.id,
          username: req.body.username,
        });

        newUser.save((err, data) => {
          if (err) {
            console.log("Error saving data ", err);
          } else {
            res.json({
              _id: data.id,
              username: data.username,
            });
          }
        });
      } else {
        res.send("Username already Exists");
      }
    }
  });
});

app.get("/api/users", (req, res) => {
  User.find({}, (err, data) => {
    if (err) {
      res.send("No Users");
    } else {
      res.json(data);
    }
  });
});

app.post("/api/users/:_id/exercises", (req, res) => {
  let date = req.body.date;
  let id = req.params._id;

  if (date === "") {
    date = new Date();
    // console.log("no date",date)
  } else if (!new Date(req.body.date) instanceof Date) {
    date = new Date();
    // console.log("invalid date",date)
  } else if (isNaN(new Date(req.body.date))) {
    date = new Date();
    // console.log("in not a number valid date",date)
  } else {
    date = new Date(date);
    // console.log("given date",date)
  }

  User.findById(id, (err, data) => {
    if (err) {
      console.log("error with id ", err);
    } else {
      const newExercise = new Exercise({
        username: data.username,
        description: req.body.description,
        duration: req.body.duration,
        date: date.toDateString(),
      });

      newExercise.save((err, data) => {
        if (err) {
          console.log("error saving=> ", err);
        } else {
          res.json({
            _id: id,
            username: data.username,
            description: data.description,
            duration: data.duration,
            date: data.date.toDateString(),
          });
        }
      });
    }
  });
});

// Reference : https://replit.com/@mazorSharp/Exercise-Tracker?v=1#server.js

app.get("/api/users/:_id/logs", (req, res) => {
  const { from, to, limit } = req.query;
  let idJson = { id: req.params._id };
  let idToCheck = idJson.id;

  // Check ID
  User.findById(idToCheck, (err, data) => {
    var query = {
      username: data.username,
    };

    if (from !== undefined && to === undefined) {
      query.date = { $gte: new Date(from) };
    } else if (to !== undefined && from === undefined) {
      query.date = { $lte: new Date(to) };
    } else if (from !== undefined && to !== undefined) {
      query.date = { $gte: new Date(from), $lte: new Date(to) };
    }

    let limitChecker = (limit) => {
      let maxLimit = 100;
      if (limit) {
        return limit;
      } else {
        return maxLimit;
      }
    };

    if (err) {
      console.log("error with ID=> ", err);
    } else {
      Exercise.find(
        query,
        null,
        { limit: limitChecker(+limit) },
        (err, docs) => {
          if (err) {
            console.log("error with query=> ", err);
          } else {
            let documents = docs;
            let loggedArray = documents.map((item) => {
              return {
                description: item.description,
                duration: item.duration,
                date: item.date.toDateString(),
              };
            });

            const test = new Log({
              username: data.username,
              count: loggedArray.length,
              log: loggedArray,
            });

            test.save((err, data) => {
              if (err) {
                console.log("error saving exercise=> ", err);
              } else {
                res.json({
                  _id: idToCheck,
                  username: data.username,
                  count: data.count,
                  log: loggedArray,
                });
              }
            });
          }
        }
      );
    }
  });
});

// app.get('/api/users/:_id/logs', (req, res)=>{
//   let { from, to, limit } = req.query;
//   const userId = req.params._id
//     from = moment(from, 'YYYY-MM-DD').isValid() ? moment(from, 'YYYY-MM-DD') : 0;
//     to = moment(to, 'YYYY-MM-DD').isValid() ? moment(to, 'YYYY-MM-DD') : moment().add(1000000000000);
//     User.findById(userId).then(user => {
//         if (!user) throw new Error('Unknown user with _id');
//         Exercise.find({ userId })
//             .where('date').gte(from).lte(to)
//             .limit(+limit).exec()
//             .then(log => res.status(200).send({
//                 _id: userId,
//                 username: user.username,
//                 count: log.length,
//                 log: log.map(o => ({
//                     description: o.description,
//                     duration: o.duration,
//                     date: moment(o).format('ddd MMMM DD YYYY')
//                 }))
//             }))
//     })
//         .catch(err => {
//             console.log(err);
//             res.status(500).send(err.message);
//         })
// })

app.get("/api/users/removeall", (req, res) => {
  User.remove({}, (err, data) => {
    if (err) return console.error(err);
    console.log(data);
    data.ok = true;
    data.n = data.deletedCount;
    res.send("Done");
  });
});

app.get("/api/exercises/removeall", (req, res) => {
  Exercise.remove({}, (err, data) => {
    if (err) return console.error(err);
    console.log(data);
    data.ok = true;
    data.n = data.deletedCount;
    res.send("Done");
  });
});

app.get("/api/logs/removeall", (req, res) => {
  Log.remove({}, (err, data) => {
    if (err) return console.error(err);
    console.log(data);
    data.ok = true;
    data.n = data.deletedCount;
    res.send("Done");
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
