var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/wikilatic', {poolSize: 15 });


var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    // we're connected!
    console.log('connect');
});

module.exports = mongoose;