const mongoose = require('mongoose');
const admin = require('firebase-admin');
const serviceAccount = require('../config/pixorrapp.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
User = [];
const userSchema = mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  biography: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  }
});
const userModel = (module.exports = mongoose.model('userSchema', userSchema));
module.exports.addCollection = (newUserProfile, callback) => {
  newUserProfile = newUserProfile.toObject();
  delete newUserProfile._id;
  userModel.update(
    { userId: newUserProfile.userId },
    newUserProfile,
    { upsert: true, new: true },
    callback
  );
};
module.exports.isBioGraphyExist = userId => {
  var Query = userModel.find({ userId: userId }).count();
  Query.exec((err, result) => {
    return result;
  });
};
module.exports.getProfile = (userId, callback) => {
  var Query = userModel.findOne({ userId: userId }, callback);
};
module.exports.getAllUser = callback => {
  admin
    .auth()
    .listUsers(1000)
    .then(function(listUsers) {
      User = [];
      listUsers.users.forEach(function(userData) {
        User.push(userData);
      });
      callback(null, User);
      /*if(listUsers.pageToken){
            getNextBatch(listUsers.pageToken);
        }
        else{
            console.log(User);
            callback(null,User);            
        }*/
    })
    .catch(error => callback(error, null));
};
module.exports.updateUser = (uId, flag, callback) => {
  admin
    .auth()
    .updateUser(uId, {
      disabled: flag == 'D' ? true : false
    })
    .then(result => callback(null, result))
    .catch(error => callback(error, null));
};
getNextBatch = pageToken => {
  admin
    .auth()
    .listUsers(100, pageToken)
    .then(function(listUsers) {
      listUsers.users.forEach(function(userData) {
        User.push(userData);
      });
      if (listUsers.pageToken) {
        getNextBatch(listUsers.pageToken);
      }
    })
    .catch(error => {
      console.log(error);
    });
};
