const express = require("express");
const mongoose = require("mongoose");
const ejs = require("ejs");
const { Schema } = mongoose;
const { application } = express;
const { title } = require("process");
const { parse } = require("path");
const _ = require("lodash");

mongoose.connect("mongodb://127.0.0.1:27017/wikiDB");

const entrySchema = {
  title: String,
  content: String,
};

const Entry = mongoose.model("Entry", entrySchema);

const app = express();

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app
  .route("/entries")

  .get(function (req, res) {
    Entry.find(function (err, foundEntries) {
      if (!err) {
        res.send(foundEntries);
      } else {
        res.send(err);
      }
    });
  })
  .post(function (req, res) {
    const newEntry = new Entry({
      title: req.body.title,
      content: req.body.content,
    });
    newEntry.save(function (err) {
      if (!err) {
        res.send("Success!");
      } else {
        res.send(err);
      }
    });
  })
  .delete(function (req, res) {
    Entry.deleteMany(function (err) {
      if (!err) {
        res.send("Success!");
      } else {
        res.send(err);
      }
    });
  });

app
  .route("/entries/:entryTitle")

  .get(function (req, res) {
    Entry.findOne({ title: req.params.entryTitle }, function (err, foundEntry) {
      if (!err) {
        res.send(foundEntry);
      } else {
        console.log(err);
        res.send("No entries matching the title found!");
      }
    });
  })

  .put(function (req, res) {
    Entry.updateOne(
      { title: req.params.entryTitle },
      { title: req.body.title, content: req.body.content },
      function (err) {
        if (!err) {
          res.send("Success!");
        } else {
          res.send(err);
        }
      }
    );
  })

  .patch(function (req, res) {
    Entry.updateOne(
      { title: req.params.entryTitle },
      { $set: req.body },
      function (err) {
        if (!err) {
          res.send("Success!");
        } else {
          res.send(err);
        }
      }
    );
  })

  .delete(function (req, res) {
    Entry.deleteOne({ title: req.params.entryTitle }, function (err) {
      if (!err) {
        res.send("Deleted!");
      } else {
        res.send(err);
      }
    });
  });

app.listen(3000, function () {
  console.log("Server running on port 3000");
});
