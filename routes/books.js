const express  = require('express');
const router  = express.Router();
// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');
//Import the Book schema
const Book = require('../models/book');
const Author = require('../models/author');
const { param } = require('.');
// const uploadPath = path.join('public' , Book.coverImageBasePath);
const imageMimeTypes = ['image/jpeg' , 'image/png' , 'image/gif' , 'image/jpg'];
// const upload = multer({
//     dest: uploadPath,
//     filefilter: (req , file , callback) => {
//         callback(null , imageMimeTypes.includes(file.mimetype))
//     }
// })


//All the Book Routes 
router.get('/' ,async (req , res) => {
    let query = Book.find();
    if((req.query.title) != null && req.query.title != ""){
        query = query.regex('title' , new RegExp(req.query.title , 'i'))
    }
    if ((req.query.publishedBefore) != null && req.query.publishedBefore != ""){
        query = query.lte('publishedDate' , req.query.publishedBefore);
    }
    if((req.query.publishedAfter) != null && req.query.publishedAfter != ""){
        query = query.gte('publishedDate' , req.query.publishedAfter);
    }
    try{
        const books = await query.exec();
        res.render('books/index' , {
            books : books , 
            searchOptions: req.query
        })
    }catch {
        res.redirect('/');
    }
    
})
//For A new Books
router.get('/new' , async (req , res) => {
    renderNewPage(res , new Book());
  
})
//For creating a  new Book
router.post('/' , async (req , res) => {
    // const fileName =req.file != null ? req.file.filename : null;
    const book = new Book({
        title : req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount : req.body.pageCount,
        // coverImageName : fileName ,
        description : req.body.description
    })
    // res.send('Create Books');
    saveCover(book , req.body.cover)
    try{
        const newBook = await book.save();
        res.redirect(`books/${newBook.id}`)
        // res.redirect('books');
    }catch{
        // if(book.coverImageName != null){
        //     removeBookCover(book.coverImageName);
        // }
        renderNewPage(res , book , true);
    }
})
//To create a new Book

// function removeBookCover(fileName){
//     fs.unlink(path.join(uploadPath , fileName) , err => {
//         if(err) console.log(err);
//     });
// }
//Show Book Route
router.get('/:id' , async (req  , res) =>{
    try{
        const book = await Book.findById(req.params.id)
                                        .populate('author')
                                        .exec();
        res.render('books/show' , {book : book})
    }catch (err){
        console.log(err);
        res.redirect('/');
    }
})

//Edit Book Route
router.get('/:id/edit', async(req , res) => {
    let book = await Book.findById(req.params.id);
    try{
        renderEditPage(res , book);
    } catch (err){
        console.log(err);
        res.redirect('/');
    }
})

//Put Update
router.put('/:id' , async(req , res) => {
    let book;
    try{
        book = await Book.findById(req.params.id);
        book.title = req.body.title;
        book.author = req.body.author;
        book.publishDate = new Date(req.body.publishDate);
        book.pageCount = req.body.pageCount;
        book.description = req.body.description;

        if(req.body.cover != null && req.body.cover !== ''){
            saveCover(book , req.body.cover);
        }
        await book.save();
        res.redirect(`/books/${req.params.id}`);
    }catch (err){
        // console.log(err);
        if (book != null){
            renderEditPage(res , book , true);
        }else {
            res.redirect('/');
        }
    }
})

//Delete Book Page Route
router.delete('/:id' , async(req , res) => {
    let book;
    try{
        book = await Book.findById(req.params.id);
        await book.remove();
        res.redirect('/books');
    }catch {
        if(book != null){
            res.render('books/show' , {
                book : book,
                errorMessage : 'Could not remove book'
            })
        }else{
            res.redirect('/');
            }
        }

    })

async function renderNewPage(res, book , hasError = false ) {
    renderFormPage(res , book , 'new' , hasError);
}
async function renderEditPage(res, book , hasError = false ) {
    renderFormPage(res , book , 'edit' , hasError);
}
async function renderFormPage(res, book ,form , hasError = false ) {
    try{
        const authors = await Author.find({});  
        // const book = new Book();
        const params = {
            authors : authors,
            book : book
        }
        if(hasError){
            if(form === 'edit'){
                params.errorMessage = "Error Updating";
            }
            else {
                param.errorMessage = "Error Creating Book";
            }
        }
        if(hasError){
            params.errorMessage = "Error Creating Book";
        }
        res.render(`books/${form}`, params)
      }catch {
          res.redirect('/books');
      }
}

function saveCover(book , coverEncoded){
    if(coverEncoded == null)return;
    const cover = JSON.parse(coverEncoded);
    if(cover != null && imageMimeTypes.includes(cover.type)){
        book.coverImage = new Buffer.from(cover.data, 'base64');
        book.coverImageType = cover.type;
    }
}

module.exports = router;