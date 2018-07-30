const mongoose=require('mongoose');
const nodemailer=require('nodemailer');

const collectionSchema=mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    thumbnaild:{
        type:String
    },
    createdOn:{
        type:Date,
        default:Date.now()
    },
    files:{
        type:[]
    },
    userId:{
        type:String,
        required:true
    }
});
const collectionModel=module.exports=mongoose.model('collectionModel',collectionSchema);
//Add a New Collection
module.exports.addCollection=(newCollection,callback)=>{
    //Save the Collection Schema TypeObject
    newCollection.save(callback);
}
//Get All Collection for a User
module.exports.getAllCollection=(userId,callback)=>{
    //Query to get All Collection for User
    var Query=collectionModel.find({userId:userId},'title files').sort({createdOn:-1});
    Query.exec(callback);
}
//Get All files from Collection
module.exports.getFilesFromCollection=(collectionId,callback)=>{
    //Query to Get All files from Collection
    var Query=collectionModel.find({_id:collectionId},'title files');
    Query.exec(callback)
}
module.exports.getCollectionList=(userId,callback)=>{
    var Query=collectionModel.aggregate([
        {$unwind:'$datamodels'},
        {$lookup:{
            from:'datamodels',
            localfield:'files',
            foreignField:'_id',
            as:'fileCollection'
        }}
    ])
    Query.exec(callback);
}
//Delete A Collection.
module.exports.deleteCollection=(collectionId,callback)=>{
    collectionModel.remove({_id:collectionId},callback);
}
//Update Files in a COllecton Add/Update
module.exports.updateFilesInCollection=(collectionId,newFileList,callback)=>{
    collectionModel.update({_id:collectionId},{files:newFileList},{},callback);
}
//Update Collection
module.exports.updateCollection=(collectionId,userId,updateConstraint,callback)=>{
    collectionModel.update({$and:[{_id:collectionId},{userId:userId}]},updateConstraint,{},callback);
}
module.exports.sendShare=(email,callback)=>{
    nodemailer.createTestAccount((err,accunt)=>{
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // true for 465, false for other ports
            auth: {
                user: 'ashifa454@gmail.com', // generated ethereal user
                pass: '9971018178'  // generated ethereal password
            }
        });
        let mailOption={
            to:email,
            from:'PixorrApp <abc@gmail.com>',
            subject:'HELLO WORLD',
            body:'<b>Hello world?</b>'
        };
        transporter.sendMail(mailOption,callback);

    });
}