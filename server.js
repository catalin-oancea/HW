var express = require('express');
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;
var server = require('http').createServer(app);
server.listen(5000);

var TransactionRepository = require('./Repositories/TransactionRepository');

var url = 'mongodb://db:27017/hootsuite_hw2017';
mongoose.connect(url);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.post('/transactions', function(req, res) {
    var transaction_details = {};
    transaction_details.sender_id = req.body.sender;
    transaction_details.receiver_id = req.body.receiver;
    transaction_details.timestamp = req.body.timestamp;
    transaction_details.sum = req.body.sum;

    TransactionRepository.Add(transaction_details, function(rv) {
        res.json(rv);
    });
});

app.get('/transactions', function(req, res) {
    var filters = {};
    filters.user_id = parseInt(req.query.user);
    filters.timestamp = parseInt(req.query.day);
    filters.treshold = parseInt(req.query.treshold);

    var date = new Date(filters.timestamp * 1000);
    //get timestamp of the beginning of the day that contains the given timestamp (day field)
    var beginningOfDay = date;
    beginningOfDay.setHours(0);
    beginningOfDay.setMinutes(0);
    beginningOfDay.setSeconds(0);
    beginningOfDay = Math.floor(beginningOfDay / 1000);

    //get timestamp of the end of the day that contains the given timestamp (day field)
    var endOfDay = date;
    endOfDay.setHours(23);
    endOfDay.setMinutes(59);
    endOfDay.setSeconds(59);
    endOfDay = Math.floor(endOfDay / 1000);

    filters.since_timestamp = beginningOfDay;
    filters.until_timestamp = endOfDay;

    TransactionRepository.GetAllUserTransactions(filters, function(rv) {
        res.json(rv);
    })
});

app.get('/balance', function(req, res) {
    var filters = {};
    filters.user_id = parseInt(req.query.user);
    filters.since_timestamp = parseInt(req.query.since);
    filters.until_timestamp = parseInt(req.query.until);

    TransactionRepository.GetUserBalanceInInterval(filters, function(rv) {
        res.json(rv);
    });
});