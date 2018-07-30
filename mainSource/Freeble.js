/*SCRAPPER FOR FLATICONS*/
const cheerio=require('cheerio');
const request=require('request');
const chalk = require('chalk');
const config=require('../config/database');
const mongoose=require('mongoose');
const dataModel=require('../models/pixorData');
var nodes=[
'http://freebbble.com/type/ui-kit/page/',
'http://freebbble.com/type/icon/page/',
'http://freebbble.com/type/psd/page/',
//'http://freebbble.com/type/sketch/page/',
'http://freebbble.com/type/font/page/',
'http://freebbble.com/type/mockup/page/',
'http://freebbble.com/type/wallpaper/page/',
'http://freebbble.com/type/ui/page/'];
var sourceIndex=0;
var category="UIK";
FlaticonScrapper=function(pageId,callback){
    request(nodes[sourceIndex]+pageId,function(err,res,html){
        console.log(nodes[sourceIndex]+pageId);
        if(res){
            if(res.statusCode==404){
                sourceIndex++;
                switch(sourceIndex){
                    case 0:
                    category="UIK"
                    break;
                    case 1:
                    category="ICN"
                    break;
                    case 2:
                    category="PSD"
                    break;
                    case 3:
                    category="SKT"
                    break;
                    case 4:
                    category="FN"
                    break;
                    case 5:
                    category="MCK"
                    break;
                    case 6:
                    category="WLP"
                    break;
                    case 7:
                    category="VCT"
                    break;
                    default:
                        console.log("DONE");
                        callback("DONE");
                    break;
                }
                pageId=1;
                callback(1);
        }
    }
        try{
        const $=cheerio.load(html);
        $('.freebie').each(function(i,elem){
            var freebie_content=$(this).find('.freebie-content').children().first().children().first();
            var Obj=new dataModel({
                UniqueId:$(this).attr('id').substr(5,10)+"@FRB",
                source:"FRB",
                title:freebie_content.text(),
                contentLink:freebie_content.attr('href'),
                thumbnailURL:$(this).children().first().children().first().attr('src'),
                category:category,
                tags:freebie_content.text()
            });
            dataModel.addItem(Obj,(err,result)=>{
                if(err)
                    console.log(chalk.red(err));
                else{
                    console.log(chalk.green(result));
                }
            })
        })
        callback(pageId+1);
     }
    catch(e){
        console.log(chalk.red(JSON.stringify(e)));
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
    console.log(chalk.green("Connected"));
    var args = process.argv.slice(2);
    sourceIndex=args[0];
    category=args[1];
    console.log(sourceIndex);
    callingBoss(1);
})
mongoose.connection.on('error',(err)=>{
    console.error(err);
})