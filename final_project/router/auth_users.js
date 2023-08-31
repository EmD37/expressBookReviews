const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => { 
    if (username) {
        let valid = () => {
            return (users.find((user) => {
                user.username === username
            }).length > 0) ? true : false;
        }
        console.log(valid);
        return valid;
    }
    console.log("username not provided somehow");
    return false;
}

const authenticatedUser = (username,password) => { 
    console.log("got to authenticated")
    if (isValid(username)) {
        let validatedUsers = users.filter((user) => {
            return (user.username === username && user.password === password)
        });

        if(validatedUsers.length > 0){
            return true;
        } 
        console.log("inner rejection");
        return false;
    }
    console.log("outer rejection");
    return false; 
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.query.username;
    const password = req.query.password;

    console.log(username + " " + password);
  
    if (!username || !password) {
        if (!username) {
            return res.status(401).json({message: "Cannot log in without credentials. Please provide username."});
        }
        return res.status(401).json({message: "Please provide password to log in"});
    }
  
    if (authenticatedUser(username,password)) {
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });
    
        req.session.authorization = {
            accessToken,
            username
        }
        return res.status(200).send({message: "User successfully logged in"});
    }
    return res.status(401).json({message: "Login Failed! Check username and password"});
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {

    const user = req.session.authorization.username;
    const isbn = parseInt(req.params.isbn);
    const newReview = req.query.review;

    let book = books[isbn];
    let existingReview = book.reviews[user];
        
    if (existingReview) {
        book.reviews[user] = newReview;       
        books[isbn] = book;

        return res.status(200).json({message: "Updated review for user " + user + " for book " + isbn});
    }

    book.reviews[user] = newReview;
    books[isbn] = book;

    return res.status(200).json({message: "Created new review for user " + user + " for book " + isbn});
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {

    const user = req.session.authorization.username;
    const isbn = parseInt(req.params.isbn);

    let book = books[isbn];
    let existingReview = book.reviews[user];
        
    if (existingReview) {
        delete book.reviews[user];       
        books[isbn] = book;

        return res.status(200).json({message: "Deleted review for user " + user + " for book " + isbn});
    }

    return res.status(404).json({message: user + " does not have a review for book " + isbn});
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
