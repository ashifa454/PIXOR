var express=require('express');
var router=express.Router();
const collectionModel=require('../models/collectionModel');
const dataModel=require('../models/pixorData');
router.post('/addCollection',(req,res)=>{
    var globalRequest=req.body; 
    console.log(req.body);
    //Expects title and userId as a request Parameter to create a Collection. 
    let connectionModel=new collectionModel({
        title:globalRequest.title,
        thumbnail:'',
        userId:globalRequest.userId
    });
    collectionModel.addCollection(connectionModel,(err,response)=>{
        (err?res.json({
            status:false,
            message:err
        }):res.json({
            status:true,
            message:response
        }));
    })
});
router.post('/deleteCollection',(req,res)=>{
    var globalRequest=req.body;
    //Expect a Single Paramater eg. Id for the collection which is to be deleted.
    collectionModel.deleteCollection(globalRequest.collectionId,(err,response)=>{
        (err?res.json({
            status:false,
            message:err
        }):res.json({
            status:true,
            message:response
        }))
    });
});
router.post('/updateFilestoCollection',(req,res)=>{
    var globalRequest=req.body;
    collectionModel.getFilesFromCollection(globalRequest.collectId,(err,response)=>{
        if(err){
            res.json({
                status:false,
                message:err
            });
        }else{
            var files=response[0].files;
            if(files.indexOf(globalRequest.fileId)>0){
                res.json({
                    status:false,
                    message:'FAE'
                })
            }else{
                files.push(globalRequest.fileId);
                collectionModel.updateFilesInCollection(globalRequest.collectId,files,(err,response)=>{
                    (err?res.json({
                        status:false,
                        message:err
                    }):res.json({
                        status:true,
                        message:response
                    }))
                });
            }
        }
        /*(err?res.json({
            status:false,
            message:err
        }):
            response.push(req.fileId))*/
    });
});
router.post('/getFilesFromCollection',(req,res)=>{
    var globalRequest=req.body;
    dataModel.getAllAboutFiles(globalRequest.files,(err,result)=>{
        (err?res.json({
            status:false,
            message:err
        }):res.json({
            status:true,
            message:result
        }))
    });
});
router.post('/getAllCollections',(req,res)=>{
    var globalRequest=req.body;
    collectionModel.getCollectionList(globalRequest.userId,(err,result)=>{
        (err?res.json({
                status:false,
                message:err
        }):res.json({
            status:true,
            message:result
        }))
    });
});
router.post('/getCollectionFromUser',(req,res)=>{
    var globalRequest=req.body;
    collectionModel.getAllCollection(globalRequest.userId,(err,result)=>{
        (err?res.json({
            status:false,
            message:err
        }):res.json({
            status:true,
            message:result
        }))
    })
});
router.post('/sendEmail',(req,res)=>{
    collectionModel.sendShare(req.email,(err,info)=>{
        (err)?res.json({status:false,message:err}):res.json({status:true,message:info});
    })
})
module.exports=router;