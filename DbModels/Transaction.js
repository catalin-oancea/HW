var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TransactionSchema = new Schema({
    sender_id: {
        type: Number,
        required: true
    },
    receiver_id: {
        type: Number,
        required: true
    },
    timestamp: {
        type: Number,
        required: true
    },
    sum: {
        type: Number,
        required: true
    }
});


module.exports = mongoose.model('Transation', TransactionSchema);