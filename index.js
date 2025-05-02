const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gcvod.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const productCollection = client.db('BuyHubDB').collection('product');
    const cartCollection = client.db('BuyHubDB').collection('cart');

    // Get all products
    app.get("/product", async (req, res) => {
      const result = await productCollection.find().toArray();
      res.send(result);
    });

    // Add item to cart
    app.post("/cart", async (req, res) => {
      const cartItem = req.body;
      const existing = await cartCollection.findOne({
        productId: cartItem.productId,
        userEmail: cartItem.userEmail,
      });
      if (existing) {
        return res.status(400).send({ message: "Already in cart" });
      }
      const result = await cartCollection.insertOne(cartItem);
      res.send(result);
    });

    // Get user cart
    app.get("/cart", async (req, res) => {
      const { email } = req.query;
      const result = await cartCollection.find({ userEmail: email }).toArray();
      res.send(result);
    });

    // Delete cart item
    app.delete("/cart/:id", async (req, res) => {
      const id = req.params.id;
      const result = await cartCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    console.log(" MongoDB connected");
  } finally {
    // do not close the client if you want it to stay connected
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("BuyHub server is running!");
});

app.listen(port, () => {
  console.log(` BuyHub running on port: ${port}`);
});
