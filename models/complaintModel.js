const mongoose=require('mongoose');
const complaintSchema=mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    messaga:{
        type:String
    }
});
const complaintModel=module.exports=mongoose.model('complaintSchema',complaintSchema);
module.exports.addComplaint=(newComplaint,callback)=>{
    newComplaint.save(callback);
}