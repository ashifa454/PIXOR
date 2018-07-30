const mongoose=require('mongoose');
const chalk = require('chalk');
const dataSchema=mongoose.Schema({
    UniqueId:{
        type:String,
        required:true,
        dropDups: true
    },
    source:{
        type:String,
        required:true
    },
    title:{
        type:String,
        required:true
    },
    contentLink:{
        type:String,
        required:true
    },
    thumbnailURL:{
        type:String,
        required:true
    },
    category:{
        type:String,
        required:true
    },
    tags:{
        type:String
    },
    meta:{
        type:String,
    },
    addedOn:{
        type:Date,
        default:Date.now()
    },
    isPremium:{
        type:Boolean,
        default:false
    },
    video_url:{
        type:String,
        default:null
    },
    cost:{
        type:String,
        default:null
    }
});
const dataModel=module.exports=mongoose.model('dataModel',dataSchema);
module.exports.addItem=(item,callback)=>{
    const warning=chalk.keyword('orange');
    dataModel.findOne({UniqueId:item.UniqueId},(err,result)=>{
        if(err){
            console.log(chalk.red(err));
        }
        else if(!result){
            item.save(callback);
            //dataModel.save(item,callback)
        }else{
            callback('DAE',null)
        }
    });
}
module.exports.isExist=(UniqueId,callback)=>{
    dataModel.findOne({UniqueId:UniqueId},callback);
};
module.exports.getLatest=(skipCount,limitCount,callback)=>{
    //dataModel.count((err,result)=>{
        //var Query=dataModel.find().limit(parseInt(limitCount)).skip(parseInt(skipCount));
        var Query=dataModel.aggregate([
            {$skip:parseInt(skipCount)},
            {$sample: {size: parseInt(limitCount)}},
            {$project:{title:1,meta:1,tags:1,category:1,source:1,contentLink:1,isPremium:1,thumbnailURL:1}},
        ])
        Query.exec(callback);
    //})
}
module.exports.search=(findCondition,sourceCondition,tagsCondition,term,skipCount,limitCount,callback)=>{
    pipeline=[];
    if(term.length>0){
        pipeline.push({$match:{$text:{$search:term}}})
    }
    if(findCondition.length>0){
        pipeline.push({$match:{$or:findCondition}})
    }
    console.log(findCondition);
    if(tagsCondition.length>0){
        pipeline.push({$match:{$or:tagsCondition}})
    }
    if(sourceCondition.length>0){
        pipeline.push({$match:{$or:sourceCondition}})
    }
    if(term.length>0){
        pipeline.push({$sort:{score:{$meta:"textScore"}}})
    }else{
        pipeline.push({$sort:{addedOn:-1}})
    }
    pipeline.push({$skip:parseInt(skipCount)})
    pipeline.push({$limit:parseInt(limitCount)});
    pipeline.push({$project:{title:1,meta:1,category:1,source:1,contentLink:1,thumbnailURL:1,video_url:1,isPremium:1,cost:1}});
    dataModel.aggregate(pipeline,callback);
}
module.exports.getData=(condition,searchTerm,skipCount,limitCount,callback)=>{
    var Query=dataModel.aggregate([
        {$sample: {size: parseInt(limitCount)}},
        {$skip:parseInt(skipCount)},
        {$project:{title:1,meta:1,category:1,source:1,contentLink:1,thumbnailURL:1,video_url:1}}
    ])
///    var Query=dataModel.find(condition,'title meta category source contentLink thumbnailURL',{skip:parseInt(skipCount),limit:parseInt(limitCount)}).sort({addedOn:-1});
    Query.exec(callback);
}
module.exports.getAllAboutFiles=(files,callback)=>{
    var result=[];
    var promises=files.map((file)=>{
        return dataModel.find({_id:file},'title meta category source contentLink thumbnailURL',(err,res)=>{
            if(err){
                return err;
            }else{
               result.push(res);
            }
        });
    });
    Promise.all(promises).then(()=>{
        return callback(false,result);
    })
}
module.exports.deleteData=(id,callback)=>{
    dataModel.findByIdAndRemove({_id:mongoose.Types.ObjectId(id)},callback)
}
module.exports.updateItem=(Obj,callback)=>{
    id=Obj.UniqueId;
    delete Obj.UniqueId;
    dataModel.update({_id:mongoose.Types.ObjectId(id)},Obj,{upsert:true},callback);
}