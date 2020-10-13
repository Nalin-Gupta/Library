const express = require('express');
const router = express.Router();
// const author = require('../models/author');
const Author = require('../models/author');
const Book = require('../models/book');

//For all authors :
router.get('/' , async(req , res) => {
    // console.log('check');
    let searchOptions = {};
    if(req.query.name != null && req.query.name !== ' '){
        searchOptions.name = new RegExp(req.query.name , 'i');
    }

    try{
        const authors = await Author.find(searchOptions);
        res.render('authors/index' , {
            authors : authors,
            searchOptions: req.query
        });
    }catch{
        res.redirect('/');
    }
    
})
//For New Author Route :
router.get('/new' , (req , res) => {
    // console.log('In new get ');
    res.render('authors/new' , {author : new Author() }); //
})
//For creating a Author Route : 
//Over here we are actually creating a author and and not fetchig any details hence we will use the HTTP Post along res.send
router.post('/' , async(req , res) => {
    const author = new Author({
        name : req.body.name  //explicity tell the brwoser which param we want from the client
    })
    try {
        const newAuthor = await author.save();
        res.redirect(`authors/${newAuthor.id}`)
        // res.redirect('authors');
    } catch {
        res.render('authors/new' , {
        author : author , 
        errorMessage : 'Error In Creation'
        })
    }
    // author.save((err , newAuthor) => {
    //     if(err){
    //         // console.log('error');
    //         res.render('authors/new' , {
    //             author : author , 
    //             errorMessage : 'Error In Creation'
    //         })
    //     } else {
    //         // res.redirect(`authors/${newAuthor.id}`)
    //         res.redirect('authors');
    //     }
    // })


    // res.send(req.body.name); //Testing
});

router.get('/:id' , async(req , res) => {
    // res.send(`Show Author ${req.params.id}`);
    try{
        // console.log('test');
        const author = await Author.findById(req.params.id);
        const books = await Book.find({author : author.id}).limit(6).exec();
        res.render(`authors/show`, {
            author : author,
            booksByAuthor : books
        })
    }catch (err){
        console.log(err);
        res.redirect('/');
    }
})

router.get('/:id/edit' , async(req, res) => {
    try{
        const author =  await Author.findById(req.params.id);
        res.render('authors/edit' , { author : author});
    } catch {
        res.redirect('/authors');
    }
})

router.put('/:id' ,async (req , res) => {
    // res.send(`Update Author ${req.params.id}`);
    let author;
    try {
        author = await Author.findById(req.params.id);
        author.name = req.body.name;
        await author.save();
        res.redirect(`/authors/${author.id}`);

    } catch { 
        if(author == null){
            res.redirect('/');
        }
        else{
            res.render('authors/edit' , {
                author : author , 
                errorMessage : 'Error In Updation'
                })
        }
    }
})

router.delete('/:id' , async(req , res) => {
    // res.send(`Delete Author ${req.params.id}`);
    let author;
    try {
        author = await Author.findById(req.params.id);
        await author.remove();
        res.redirect(`/authors`);

    } catch { 
        if(author == null){
            res.redirect('/');
        }
        else{
           res.redirect(`/authors/${author.id}`);
        }
    }
})



module.exports = router;