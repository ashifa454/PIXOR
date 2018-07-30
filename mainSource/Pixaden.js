/*SCRAPPER FOR FLATICONS*/
const cheerio=require('cheerio');
const request=require('request');
const config=require('../config/database');
const mongoose=require('mongoose');
const dataModel=require('../models/pixorData');
var nodes=['https://pixelbuddha.net/freebies/tag/vectors/','https://pixelbuddha.net/freebies/tag/icons/','https://pixelbuddha.net/freebies/tag/ui-kits/',
'https://pixelbuddha.net/freebies/tag/fonts/','https://pixelbuddha.net/freebies/tag/mockups/','https://pixelbuddha.net/freebies/tag/photo/',
'https://pixelbuddha.net/freebies/tag/textures/','https://pixelbuddha.net/freebies/tag/templates/'];
category="VCT"
var index=0;
FlaticonScrapper=function(pageId,callback){
     if(index==nodes.length){
        return;
    }
    request(nodes[index]+pageId,function(err,res,html){
        if(res.statusCode==404){
            index++;
            switch(index){
                case 0:
                category="VCT"
                break;
                case 1:
                category="ICN";
                break;
                case 2:
                category="UIK"
                break;
                case 3:
                category="FNT"
                break;
                case 4:
                category="MCK"
                break;
                case 5:
                category="FOT"
                break;
                case 6:
                category="TXT"
                break;
                case 7:
                category="PSD"
                break;
                default:
                category="VCT"
                index=0;
                break;
            }
            callback(1);
        }else{
        try{
        const $=cheerio.load(html);
        $('article').each(function(i,elem){
                    var header_info=$(this).children().first().children().first();
                    id=header_info.attr('src').split("-");
                    id=id[1].split(".");
                    id=id[0];
            var Obj=new dataModel({
                UniqueId:id+"@PXD",
                source:"PXD",
                title:$(this).find('.preview-link').children().first().text(),
                contentLink:"https://pixelbuddha.net"+$(this).children().first().attr('href'),
                thumbnailURL:header_info.attr('src'),
                category:category,
                tags:$(this).find('.preview-link').children().first().text()
            })
            Obj=Obj.toObject();
            delete Obj._id;
            dataModel.addItem(Obj,(err,result)=>{
                (err?(()=>{throw err}):console.log(result))
            })
        })
        callback(pageId+1);
     }
    catch(e){
        console.log(e);
    }
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