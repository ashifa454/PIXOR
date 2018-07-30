const mongoose = require('mongoose');
const config = require('./config/database');
const dataModel = require('./models/pixorData');

function double3DOTag() {
  var i = 0;
  dataModel.find({ UniqueId: /@3DO@3DO/g }, (err, result) => {
    result.forEach((elem, index) => {
      len = elem.UniqueId.length;
      elem.UniqueId = elem.UniqueId.substring(0, len - 4);
      elem.save();
      console.log('double3DO' + i++);
    });
  });
}

function doubleVDHTag() {
  var i = 0;
  dataModel.find({ UniqueId: /@VDH@VDH/g }, (err, result) => {
    result.forEach((elem, index) => {
      len = elem.UniqueId.length;
      elem.UniqueId = elem.UniqueId.substring(0, len - 4);
      elem.save();
      console.log('doubleVDH' + i++);
    });
  });
}

function redundantDataChecker() {
  var i = 0;
  var aggr = dataModel.aggregate([
    {
      $group: {
        _id: '$UniqueId',
        dups: { $push: '$_id' },
        count: { $sum: 1 }
      }
    },
    { $match: { count: { $gt: 1 } } }
  ]);
  aggr.exec((err, result) => {
    result.forEach(function(doc) {
      doc.dups.shift();
      dataModel.find({ _id: { $in: doc.dups } }).remove((err, product) => {
        if (err) return handleError(err);
      });
      console.log('redundant' + i++);
    });
  });
}

mongoose.connect(config.database, {
  config: {
    autoIndex: false
  }
});
mongoose.connection.on('connected', () => {
  console.log('connected');
  //double3DOTag();
  //doubleVDHTag();
  redundantDataChecker();
});
mongoose.connection.on('error', err => {
  console.log(err);
});
