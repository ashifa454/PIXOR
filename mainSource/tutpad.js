/*SCRAPPER FOR TUTPAD*/
const cheerio=require('cheerio');
const request=require('request');
const config=require('../config/database');
const mongoose=require('mongoose');
const dataModel=require('../models/pixorData');
var nodes=['https://www.tutpad.com/tutorials/text?page='];
FlaticonScrapper=function(pageId,callback){
    request(nodes[0]+pageId,function(err,res,html){
        if(res.statusCode==404){
            callback(1);
        }
        try{
        const $=cheerio.load(html);
        $('.text-tut').each(function(i,elem){
            var content_block=$(this).children().first();
            var image_Link=content_block.children().first().children().first().attr('src');
            id=image_Link.split("/");
            id=id[5];
            var Obj=new dataModel({
                UniqueId:id+"@TUP",
                source:"TUP",
                title:$(this).find('.mg-top-lv1').text(),
                contentLink:"https://www.tutpad.com"+content_block.children().first().attr('href'),
                thumbnailURL:"https:"+image_Link,
                category:"TUT",
            })
            if(Obj.contentLink){
                request(Obj.contentLink,function(err,res,html){
                    $2=cheerio.load(html,{ normalizeWhitespace: false, xmlMode: false, decodeEntities: true });
                    $2('meta').each((i,elem)=>{
                        if($2(elem).attr('name')&&$2(elem).attr('name')=="keywords"){
                                tags=$2(elem).attr('content');
                                tags=tags.split(",");
                            Obj.tags=tags.join(" ");
                            Obj=Obj.toObject();
                            delete Obj._id;
                            dataModel.addItem(Obj,(err,result)=>{
                                (err?(()=>{throw err}):console.log(result))
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
function callingBoss(link){
FlaticonScrapper(link,function(res){
    callingBoss(res);   
});
}
mongoose.connect(config.database,{
    config:{
      autoIndex:false
    }
  });
mongoose.connection.on('connected',()=>{
    console.log('Connected');
    callingBoss(1);  
});
mongoose.connection.on('error',()=>{
    console.error('Database Connection Error');
  })
