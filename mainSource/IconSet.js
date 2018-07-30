/*SCRAPPER FOR FLATICONS*/
const cheerio=require('cheerio');
const request=require('request');
const mongoose=require('mongoose');
const config=require('../config/database');
const dataModel=require('../models/pixorData');
var nodes=['http://www.iconfinder.com/icon-sets/popular/free/'];
FlaticonScrapper=function(pageId,callback){
    request(nodes[0]+pageId,function(err,res,html){
        if(res.statusCode==404){
            callback(1);
        }
        try{
        const $=cheerio.load(html);
        $('.iconset-preview').each(function(i,elem){
           var header_info=$(this).find('h4').children().first();
            var Obj=new dataModel({
                UniqueId:$(this).attr('data-iconset-id')+"@ICT",
                source:"ICT",
                title:header_info.attr('title'),
                contentLink:"https://www.iconfinder.com"+header_info.attr('href'),
                thumbnailURL:$(this).find('img').attr('src'),
                category:"ICN",
            });
            if(Obj.contentLink){
                request(Obj.contentLink,function(err,res,html){
                    $2=cheerio.load(html,{ normalizeWhitespace: false, xmlMode: false, decodeEntities: true });
                    $2('meta').each((i,elem)=>{
                        if($2(elem).attr('name')&&$2(elem).attr('name')=="keywords"){
                                tags=$2(elem).attr('content');
                                tags=tags.split(",");
                                for(item in tags){
                                    tags[item]=tags[item].replace(" ","");
                                }
                            Obj.tags=tags.join(" ");
                            //Obj=Obj.toObject();
                            //delete Obj._id;
                            dataModel.addItem(Obj,(err,result)=>{
                                if(err){
                                    throw err;
                                }else{
                                    console.log(chalk.green(result.title))
                                }
                            })
                        }
                    });
                });
            }
        })
        callback(pageId+1);
     }
    catch(e){
        console.log(e);
    }
    });
}
mongoose.connect(config.database,{
    config:{
        autoIndex:false
    }
});
mongoose.connection.on('connected',()=>{
    console.log("Connected");
    callingBoss(1);    
})
mongoose.connection.on('error',(err)=>{
    console.error(err);
})
function callingBoss(link){
    FlaticonScrapper(link,function(res){
        callingBoss(res);   
    });
}