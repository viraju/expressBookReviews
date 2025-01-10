const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const usersList = [];

// A secret key to sign JWTs (In real applications, store this securely, not in the code)
const JWT_SECRET = 'your_secret_key';

// Route for user registration
app.post('/register', function (req, res) {
  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Check if username already exists
  const existingUser = usersList.find(user => user.username === username);
  if (existingUser) {
    return res.status(400).json({ message: "Username already exists" });
  }

  // Hash the password before saving (in real apps)
  const hashedPassword = bcrypt.hashSync(password, 10);

  // Create new user and add to the mock database
  const newUser = { username, password: hashedPassword };
  usersList.push(newUser);

  // Respond with success message
  res.status(201).json({ message: "User registered successfully" });
});

// Route for user login
app.post('/customer/login', function (req, res) {
  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Find the user from the database
  const user = usersList.find(user => user.username === username);
  if (!user) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  // Compare the provided password with the stored hash
  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  // Generate a JWT for the authenticated user
  const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '1h' });

  // Respond with the JWT
  res.status(200).json({ message: "Login successful", token });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
  res.setHeader('Content-Type', 'application/json');  // Set response type to JSON
  res.end(JSON.stringify(books, null, 2)); 
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const { isbn } = req.params;  // Retrieve the ISBN from the request parameters
  const book = Object.values(books).find(b => b.isbn === isbn);

  if (book) {
    res.json(book);  // Return the book details as a JSON response
  } else {
    res.status(404).json({ message: "Book not found" });  // Return 404 if book is not found
  }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
   const { author } = req.params;  // Retrieve the author from the request parameters
  
  // Find all books that match the provided author
  const booksByAuthor = Object.values(books).filter(b => b.author.toLowerCase() === author.toLowerCase());
  
  if (booksByAuthor.length > 0) {
    res.json(booksByAuthor);  // Return the list of books written by the author
  } else {
    res.status(404).json({ message: "No books found for this author" });  // Return 404 if no books are found
  }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const { title } = req.params;  // Retrieve the title from the request parameters
  
  // Find all books that match the provided title
  const booksByTitle = Object.values(books).filter(b => b.title.toLowerCase().includes(title.toLowerCase()));
  
  if (booksByTitle.length > 0) {
    res.json(booksByTitle);  // Return the list of books that match the title
  } else {
    res.status(404).json({ message: "No books found for this title" });  // Return 404 if no books are found
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const { isbn } = req.params;  // Retrieve the ISBN from the request parameters
  
  // Find the book by ISBN
  const book = Object.values(books).find(b => b.isbn === isbn);
  
  if (book) {
    // If the book is found, return the reviews
    res.json(book.reviews);
  } else {
    // If the book is not found, return a 404 error
    res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
