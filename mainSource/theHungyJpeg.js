/*SCRAPPER FOR THE HUNGRY JPEG*/
const cheerio=require('cheerio');
const request=require('request');
const config=require('../config/database');
const mongoose=require('mongoose');
const dataModel=require('../models/pixorData');
var nodes=['https://thehungryjpeg.com/freebies/fonts/','https://thehungryjpeg.com/freebies/graphics/','https://thehungryjpeg.com/freebies/photos/',
'https://thehungryjpeg.com/freebies/templates/'];
category="FNT"
var index=0;
FlaticonScrapper=function(pageId,callback){
    if(pageId>1){
        nodes[index]=nodes[index]+"page-"+pageId;
    }
    request(nodes[index],function(err,res,html){
        if(res.statusCode==404){
            index++;
            switch(index){
                case 0:
                category="FNT"
                break;
                case 1:
                category="FOT";
                break;
                case 2:
                category="FOT"
                break;
                case 3:
                category="PSD"
                break;
                default:
                category="FNT";
                index=0;
                break;
            }
            callback(1);
        }else{
        try{
        const $=cheerio.load(html);
        $('.product-bundle').each(function(i,elem){
            var header_info=$(this).find('.fadeIn').children().first();
            id=header_info.attr('href');
            id=id.split("/");
            id=id[4].split("-");
            id=id[0];
            var Obj=new dataModel({
                UniqueId:id+"@THJ",
                source:"THJ",
                title:header_info.children().first().attr('alt'),
                contentLink:"https:"+header_info.attr('href'),
                thumbnailURL:header_info.children().first().attr('data-src'),
                category:category,
                tags:header_info.children().first().attr('alt')
            });
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
