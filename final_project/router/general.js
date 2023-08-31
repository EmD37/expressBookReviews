const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (username && password) {
        
        let existingUser = users.filter((user) => {
            return user.username === username;
        });
        
        if (existingUser.length === 0) { 
            users.push({"username":username,"password":password});
            return res.status(200).json({message: "Registered user " + username});
        }
        return res.status(404).json({message: "User with username " + username + " already exists"});
    } 
    return res.status(404).json({message: "Please provide username and password to register."});
});

// Get the book list available in the shop
public_users.get('/', (req, res) => {

    const getBooks = new Promise((resolve, reject) => {
        resolve(res.status(200).json({"List of Books": books}));
        reject(res.status(500).json({message: "Operation failed"}));
    });

    getBooks.then(console.log("Should always resolve"), console.log("If you're seeing this there is something bad in the previous code"));
});


// Get book details based on ISBN
public_users.get('/isbn/:isbn', (req, res) => {
    
    const bookDetailsFromISBN = new Promise((resolve, reject) => {
        const isbn = parseInt(req.params.isbn);
        let book = books[isbn];

        if (book) {
            resolve(res.status(200).json(book));
        }

        reject(res.status(404).json({error: "Could not find book with isbn " + isbn}));
    });

    bookDetailsFromISBN.then(console.log("Found the requested book"), console.log("Did not find the requested book"));
    
});
  
// Get book details based on author
public_users.get('/author/:author', (req, res) => {
    
    const bookDetailsFromAuthor = new Promise( (resolve, reject) => {

        const author = req.params.author.replace("-"," ");
        let isbnKeys = Object.keys(books);
        let foundBooks = [];

        isbnKeys.forEach((key) => {
            if (books[key].author === author) {
                foundBooks.push(books[key])
            };
        });
        if (foundBooks.length > 0) {
            resolve(res.status(200).json(foundBooks));
        }
        reject(res.status(404).json({error: "Could not find any books with author " + author}));
    });

    bookDetailsFromAuthor.then(console.log("Found the requested book"), console.log("Did not find the requested book"));
});

// Get all books based on title
public_users.get('/title/:title', (req, res) => {
    
    const bookDetailsFromTitle = new Promise((resolve, reject) => {
        let isbnKeys = Object.keys(books);
        let foundBooks = [];

            isbnKeys.forEach((key) => {
                if (books[key].title === title) {
                    foundBooks.push(books[key])
                };
            });
            if (foundBooks.length > 0) {
                resolve(res.status(200).json(foundBooks));
            }
            reject(res.status(404).json({error: "Could not find any books with title " + title}));
        }
    );
    
    bookDetailsFromTitle.then(console.log("Found the requested book"), console.log("Did not find the requested book"));
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    
    const isbn = parseInt(req.params.isbn);
    let book = books[isbn];

    return res.status(200).json({reviews: book.reviews});
});

module.exports.general = public_users;
