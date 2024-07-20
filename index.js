const express = require("express");
const app = express();
const mongoose = require("mongoose");
require("dotenv").config();
const ejs = require("ejs");
const path = require("path");
const { type } = require("os");
app.set("view engine", "ejs");

// // app.set('views', path.join(__dirname, 'views'));

// app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

const shoppingSchema = mongoose.Schema({
  item: {
    type: String,
  },
  price: {
    type: Number,
  },
  quantity: {
    type: Number,
  },
  subTotal: {
    type: Number,
  },
});
const shoppingmodel = mongoose.model("shopping_collection", shoppingSchema);

app.get("/", async (req, res) => {
  try {
    let total = 0;
    let lists = [];

    let shop = await shoppingmodel.find();

    shop.map((sub) => {
      total = total + sub.subTotal;
    });
    lists = shop;
    res.render("index", { lists, total: total });
  } catch (error) {
    console.log(error);
  }
});

app.get("/edit/:id", async (req, res) => {
  let { id } = req.params;

  await shoppingmodel
    .findOne({ _id: id })
    .then((edit) => {
      res.render("edit", { edit });
    })
    .catch((error) => {
      console.log(error);
    });
});

app.post("/upload", async (req, res) => {
  let { item, price, quantity } = req.body;
  try {
    let check = await shoppingmodel.findOne({ item: item, price: price });
    if (check) {
      let Nquantity = parseInt(check.quantity) + parseInt(quantity);
      let NsubTotal = parseInt(price) * Nquantity;
      await shoppingmodel.findOneAndUpdate(
        { item: check.item },
        { item: item, quantity: Nquantity, subTotal: NsubTotal }
      );
      res.redirect("/");
    } else {
      let items = {
        item: item,
        price: parseInt(price),
        quantity: parseInt(quantity),
        subTotal: price * quantity,
      };
      const list = await shoppingmodel.create(items);
      res.redirect("/");
    }
  } catch (error) {
    console.log(error._message);
  }
});

app.post("/delete/:id", async (req, res) => {
  let { id } = req.params;

  await shoppingmodel
    .deleteOne({ _id: id })
    .then(() => res.redirect("/"))
    .catch((error) => console.log(error));
});

app.post("/edititem/:id", async (req, res) => {
  try {
    let { item, price, quantity } = req.body;
    let { id } = req.params;

    let Nprice = parseInt(price);
    let Nquantity = parseInt(quantity);
    let NsubTotal = parseInt(price) * parseInt(quantity);
    let check = await shoppingmodel.find({ item: item, price: Nprice });
    if (check.length >= 2) {
      let Newquantity = parseInt(check[0].quantity) + Nquantity;
      let NewsubTotal = parseInt(Nprice) * Newquantity;
      await shoppingmodel.findOneAndUpdate(
        { item: check[0].item },
        { item: item, quantity: Newquantity, subTotal: NewsubTotal }
      );
      await shoppingmodel.findByIdAndDelete({ _id: id });
      res.redirect("/");
    } else {
      await shoppingmodel.findByIdAndUpdate(
        { _id: id },
        { item: item, price: Nprice, quantity: Nquantity, subTotal: NsubTotal }
      );

      res.redirect("/");
    }
  } catch (error) {
    console.log(error);
  }
});

port = 5000;
app.listen(port, () => {
  console.log("shopping list started at" + port);
});

mongoose
  .connect(process.env.URI)
  .then((res) => {
    if (res) {
      console.log("connected to database");
    }
  })
  .catch((err) => {
    console.log(err);
  });
