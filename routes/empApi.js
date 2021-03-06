var express=require('express');
var router=express.Router();
const empModel=require('../models/empModel');
router.post('/addEmp',(req,res)=>{
    var UserObj=new empModel({
        name:req.body.name,
        password:req.body.password,
        email:req.body.email
    })
    empModel.addUser(UserObj,(err,result)=>{
        if(err){
            res.json({
                status:false,
                messsage:err
            })
        }else{
            res.json({
                status:true,
                messsage:result
            })
        }
    })
});
router.post('/deleteEmp',(req,res)=>{
    empModel.deleteUser(req.body._id,(err,result)=>{
        if(err){
            res.json({
                status:false,
                messsage:err
            })
        }else{
            res.json({
                status:true,
                messsage:result
            })
        }
    });
});
router.post('/getEmps',(req,res)=>{
    empModel.getUsers((err,result)=>{
        if(err){
            res.json({
                status:false,
                messsage:err
            })
        }else{
            res.json({
                status:true,
                messsage:result
            })
        }
    })
});
router.post('/authentication',(req,res)=>{
    empModel.authentication(req.body,(err,result)=>{
        if(err){
            res.json({
                status:false,
                messsage:err
            })
        }else{
            res.json({
                status:true,
                messsage:result
            })
        }
    })
})
module.exports=router;