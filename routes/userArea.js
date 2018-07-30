var express=require('express');
var router=express.Router();
const userModel=require('../models/userModel');
const complaintModel=require('../models/complaintModel');
    router.post('/addProfile',(req,res)=>{
        var globalRequest=req.body;
        var datom=new userModel({
            userId:globalRequest.userId,
            biography:globalRequest.text,
            country:globalRequest.country
        });
        userModel.addCollection(datom,(err,result)=>{
            (err?res.json({
                success:false,
                message:err
            }):res.json({
                success:true,
                message:result
            }))
        })
    });
    router.post('/getprofile',(req,res)=>{
        var globalRequest=req.body;
        userModel.getProfile(globalRequest.userId,(err,result)=>{
            (err?res.json({
                success:false,
                message:err
            }):res.json({
                success:true,
                message:result
            }))
        })
    });
    router.post('/addComplaint',(req,res)=>{
        var globalRequest=req.body;
        var newComplaint=new complaintModel({
            name:globalRequest.name,
            email:globalRequest.emailId,
            message:globalRequest.message
        });
        console.log(newComplaint);
        complaintModel.addComplaint(newComplaint,(err,result)=>{
            (err?res.json({
                success:false,
                message:err
            }):res.json({
                success:true,
                message:result
            }))
        })
    });
    router.post('/getAllUsers',(req,res)=>{
        userModel.getAllUser((err,result)=>{
            if(err){
                res.json({
                    status:false,
                    message:err
                })
            }else{
                res.json({
                    status:true,
                    message:result
                })
            }
        });
    });
    router.post('/disableuser',(req,res)=>{
        userModel.updateUser(req.body.uid,req.body.flag,(err,result)=>{
            if(err){
                res.json({
                    status:false,
                    message:err
                })
            }else{
                res.json({
                    status:true,
                    message:result
                })
            }
        });
    })
module.exports=router;