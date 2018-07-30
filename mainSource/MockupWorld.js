/*SCRAPPER FOR FLATICONS*/
const cheerio=require('cheerio');
const request=require('request');
const config=require('../config/database');
const mongoose=require('mongoose');
const dataModel=require('../models/pixorData');
var nodes=['https://www.mockupworld.co/all-mockups/page/'];
FlaticonScrapper=function(pageId,callback){
    request(nodes[0]+pageId,function(err,res,html){
        if(res.statusCode==404){
            callback(1);
        }
        try{
        const $=cheerio.load(html);
        $('article').each(function(i,elem){
            var header_info=$(this).find('h3').children().first();
            var Obj=new dataModel({
                UniqueId:$(this).attr('content')+"@MKW",
                source:"MKW",
                title:header_info.text().trim(),
                contentLink:header_info.attr('href'),
                thumbnailURL:$(this).find('img').attr('src').trim(),
                category:"MCK",
                tags:header_info.text().trim()
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