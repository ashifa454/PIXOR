/*SCRAPPER FOR FLATICONS*/
const cheerio=require('cheerio');
const request=require('request');
const config=require('../config/database');
const mongoose=require('mongoose');
const dataModel=require('../models/pixorData');
var nodes=['https://pixabay.com/en/editors_choice/?media_type=photo&pagi=','https://pixabay.com/en/editors_choice/?media_type=illustration&pagi='
,'https://pixabay.com/en/editors_choice/?media_type=vector&pagi='];
var index=0;
var category="FOT"
FlaticonScrapper=function(pageId,callback){
    request(nodes[index]+pageId,function(err,res,html){
        if(res.statusCode==404){
            index++;
            switch(index){
                case 0:
                category="FOT";
                break;
                case 1:
                category="OTH"
                break;
                case 2:
                category="VCT"
                break;
                default:
                category="FOT";
                index=0;
                break;
            }
            callback(1);
        }
        try{
        const $=cheerio.load(html);
        $('.item').each(function(i,elem){
            var header_info=$(this).children().first();
            id=header_info.attr('href').split("-");
            id=id[id.length-1].replace("/","");
            var Obj=new dataModel({
                UniqueId:id+"@PXB",
                source:"PXB",
                title:"Photo From Pixabay",
                contentLink:"https://pixabay.com"+header_info.attr('href'),
                thumbnailURL:header_info.children().first().attr('data-lazy'),
                category:category,
                tags:header_info.children().first().attr('title')
            })
            Obj=Obj.toObject();
            delete Obj._id;
            dataModel.addItem(Obj,(err,result)=>{
                (err?(()=>{throw err}):console.log(result));
            })
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