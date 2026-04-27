import express from "express";
import { db } from "./config/db.js";
import cors from "cors";

const PORT = 3000;
const app = express();
app.use(express.json({limit:'50mb'}));

app.use(
  cors({
    origin: "http://127.0.0.1:5500",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
  }),
);

app.post("/api/books", (req, res) => {
  const { name, description, author, price, imageSrc } = req.body;
  if (!name || !description || !author || !price || !imageSrc) {
    console.log("all fields are riquired");
    return res.status(400).json("all fields are riquired");
  }

  const query = `INSERT INTO books (name, description, author, price, imageSrc) VALUES(?,?,?,?,?
    
    )`;
  db.run(query, [name, description, author, price, imageSrc], (err) => {
    if (err) {
      return console.log("error in creating book", err);
    }
    return res.status(201).json({ message: "book created susseccfull" });
  });
});


app.put("/api/books/:id", (req, res) => {
  const { name, description, author, price } = req.body;
  const { id } = req.params;
  
  if (!name || !description || !author || !price) {
    console.log("all fields are required");
    return res.status(400).json("all fields are required");
  }
  
  if (!id) {
    return res.status(400).json("missing id");
  }

  const query = `UPDATE books SET name=?, description=?, author=?, price=? WHERE id=?`;
  
  db.run(query, [name, description, author, price, id], (err) => {
    if (err) {
      console.log("error in updating book", err);
      return res.status(500).json({ message: "error in updating book" });
    }
    return res.status(200).json({ message: "book updated successfully" });
  });
});

app.get("/api/books", (req, res) => {
  const query = `SELECT * FROM books`;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.log("error in getting data");
    }
    return res.status(200).json(rows);
  });
});
app.get("/api/books/:id", (req, res) => {
  const {id}= req.params
  const query = `SELECT * FROM books WHERE id=?`;

  db.all(query, [id], (err, rows) => {
    if (err) {
      console.log("error in getting data");
    }
    return res.status(200).json(rows[0]);
  });
});

app.delete("/api/books/:id", (req, res) => {
  const { id } = req.params;

  if (!id) return;

  const query = `DELETE FROM books WHERE id = ?`;

  db.run(query, [id], (err) => {
    if (err) {
      console.log("something went wrong while deleting book");
      return res.status(500).json({
        message: "something went wrong while deleting book",
      });
    }

    return res.status(200).json({
      message:'deleted book successfully'
    })

  });
});

app.listen(PORT, () => {
  console.log(`server is running on http://localhost:${PORT}`);
});
