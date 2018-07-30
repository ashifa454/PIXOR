/*SCRAPPER FOR FLATICONS*/
const cheerio=require('cheerio');
const request=require('request');
const config=require('../config/database');
const mongoose=require('mongoose');
const chalk = require('chalk');
const dataModel=require('../models/pixorData');
var nodes=['http://www.graphberry.com/category/mock-ups/page:','http://www.graphberry.com/category/ui-elements/page:'
,'http://www.graphberry.com/category/icons/page:'];
var index=0;
category="MCK"
FlaticonScrapper=function(pageId,callback){
    request(nodes[index]+pageId,function(err,res,html){
        console.log(chalk.yellow(nodes[index]+pageId));
        if(res.statusCode==404){
            index++;
            switch(index){
                case 0:
                category="MCK"
                break;
                case 1:
                category="UI"   
                break;
                case 2:
                category="IC"
                break;
                default:
                console.log(chalk.green("DONE"));
                return;
                //category="MCK";
                //index=0;
                break;
            }
            callback(1);
        }else{
        try{
        const $=cheerio.load(html);
        $('.product-item').each(function(i,elem){     
            tempImage=$(this).children().first().children().first().attr('src');
            id=tempImage.split('/');
            var Obj=new dataModel({
                UniqueId:id[3]+"@GPB",
                source:"GPB",
                title:$(this).find('.desc').children().first().text(),
                contentLink:"http://www.graphberry.com"+$(this).attr('href'),
                thumbnailURL:"http://www.graphberry.com"+$(this).children().first().children().first().attr('src'),
                category:category,
                tags:$(this).find('.desc').children().first().text()
            });
            //Obj=Obj.toObject();
            //delete Obj._id;
            dataModel.addItem(Obj,(err,result)=>{
                if(err)
                    console.log(chalk.red(err));
                else{
                    console.log(chalk.green(result.title));
                }
            });

        })
        callback(pageId+1);
     }
    catch(e){
        console.log(chalk.red(e));
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
mongoose.connection.on('error',(err)=>{
    console.error(err);
});