var Transaction = require('../DbModels/Transaction');

function TransactionRepository() {};

TransactionRepository.Add = function(td, callback) {
    Transaction({
        sender_id: td.sender_id,
        receiver_id: td.receiver_id,
        timestamp: td.timestamp,
        sum: td.sum
    }).save(function(err, transaction) {
        if (err) {
            callback({
                success: false,
                msg: 'Something went wrong (All the fields are required).'
            });
        } else {
            callback({
                success: true,
                msg: 'This transaction was successfully added.',
                transaction: transaction
            });
        }
    });
};

TransactionRepository.GetUserBalanceInInterval = function(filters, callback) {
    Transaction.aggregate(
        [{
            $match: {
                timestamp: {
                    $gte: filters.since_timestamp,
                    $lte: filters.until_timestamp
                }
            }
        }, {
            $group: {
                _id: {
                    $cond: {
                        if: { $eq: ["$sender_id", filters.user_id] },
                        then: "payed",
                        else: {
                            $cond: {
                                if: { $eq: ["$receiver_id", filters.user_id] },
                                then: "received",
                                else: "other"
                            }
                        }
                    }
                },
                sum: {
                    $sum: "$sum"
                }
            }
        }],
        function(err, result) {
            var transaction_summary = { payed: 0, received: 0, balance: 0 };

            result.forEach(function(datapoint) {
                if (datapoint._id === 'payed')
                    transaction_summary.payed = datapoint.sum;
                else if (datapoint._id === 'received')
                    transaction_summary.received = datapoint.sum;
            });
            transaction_summary.balance = transaction_summary.received - transaction_summary.payed;

            callback(transaction_summary);
        });
};

TransactionRepository.GetAllUserTransactions = function(filters, callback) {
    Transaction.aggregate(
        [{
            $match: {
                $and: [{
                    $or: [
                        { sender_id: filters.user_id },
                        { receiver_id: filters.user_id }
                    ]
                }, {
                    timestamp: {
                        $gte: filters.since_timestamp,
                        $lte: filters.until_timestamp
                    }
                }, {
                    sum: {
                        $gt: filters.treshold
                    }
                }]
            }

        }],
        function(err, result) {
            callback(result);
        });
};

module.exports = TransactionRepository;