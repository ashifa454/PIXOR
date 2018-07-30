/*SCRAPPER FOR FLATICONS*/
const cheerio=require('cheerio');
const cloudscraper=require('cloudscraper');
const config=require('../config/database');
const mongoose=require('mongoose');
const dataModel=require('../models/pixorData');
var nodes=['http://design.tutsplus.com/tutorials?page='];
FlaticonScrapper=function(pageId,callback){
    cloudscraper.get(nodes[0]+pageId,function(err,res,html){
        if(res.statusCode==404){
            callback(0);
        }
        try{
        const $=cheerio.load(html);
        $('article').each(function(i,elem){
           var content_block=$(this).find('header');
            id=content_block.find('.posts__post-title ').attr('href').split("-");
            id=id[id.length-1];
             var Obj=new dataModel({
                UniqueId:id+"@TPL",
                source:"TPL",
                title:content_block.find('.posts__post-title ').text(),
                contentLink:content_block.children().first().attr('href'),
                thumbnailURL:content_block.find('img').attr('src'),
                category:"TUT",
                tags:content_block.find('.posts__post-title ').text()
                })
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
    callingBoss(0);    
  });
mongoose.connection.on('error',()=>{
    console.error('Database Connection Error');
})
