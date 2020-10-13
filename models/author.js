const mongoose = require('mongoose');
const Book = require('./book');
//Schema = Table

const authorSchema = new mongoose.Schema({
    name : {
        type: String ,
        required : true
    }
})

authorSchema.pre('remove' , function(next){
    Book.find({author :  this.id} , (err , books) => {
        if(err){
            next(err);
        } else if (books.length > 0){
            next(new Error('This author still has a book'))
        } else {
            next();
        }
    })
}) //gonna run any func that we put in here before it is actually removed


module.exports = mongoose.model('Author' , authorSchema);