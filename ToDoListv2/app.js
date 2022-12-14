const express = require("express");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));

//Install and add mongoose!!!
mongoose.connect("mongodb+srv://user:test-12345@cluster0.evwfgde.mongodb.net/todolistDB");

//Create new Mongoose Schema!!
const itemsSchema = {
  name: String
};

//Create new Mongoose model!!!
const Item = mongoose.model("Item", itemsSchema);

//Create new mongoose items!!!
const welcome = new Item({
  name: "This is your todolist!"
});

const add = new Item({
  name: "Press + to add a task"
});

const del = new Item({
  name: "Tick the box to delete a task"
});

const defaultItems = [welcome, add, del];

//Insert new mongoose items to the new model!!

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems){

  if (foundItems.length === 0){
    Item.insertMany(defaultItems, function(err){
      if (err){
        console.log(err);
      } else {
        console.log("Added default items succesfully!");
      }
    });
    res.redirect("/");
  } else {
    res.render("list", {listTitle: "Today", newListItems: foundItems});
  }});


app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundLists){
    if (!err){
      if (!foundLists){
        //Create a new List
        const list = new List({
          name: customListName,
          items: defaultItems
        });
      list.save();
      res.redirect("/" + customListName);
      }else {
        //show an existing list
       res.render("list", {listTitle: foundLists.name, newListItems: foundLists.items});
      }
    }

  });


});

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today"){
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  };

 
});

app.post("/delete", function(req, res){

  const deleted = req.body.deletedItem;
  const listName = req.body.listName;

  if (listName === "Today"){
    Item.findByIdAndRemove(deleted, function(err){
    if (err){
      console.log(err);
    } else {
      console.log("Item deleted!");
      res.redirect("/");
    }
  });
} else {
  List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: deleted}}}, function(err, foundList){
    if (!err){
      res.redirect("/" + listName);
    }

  });
};
  

});



app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}


app.listen(port, function() {
  console.log("Server started!");
});
