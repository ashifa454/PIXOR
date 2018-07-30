/*SCRAPPER FOR FREEBCARD*/
const cheerio=require('cheerio');
const request=require('request');
const config=require('../../config/database');
const mongoose=require('mongoose');
const chalk = require('chalk');
const dataModel=require('../../models/pixorData');
var nodes=['https://freebcard.com/business-cards/show/all/'];
FlaticonScrapper=function(pageId,callback){
    request(nodes[0]+pageId,function(err,res,html){
        if(res){
            if(res.statusCode==404){
                callback("DONE");
            }
            try{
            const $=cheerio.load(html);
            $('.portfolio-item').each(function(i,elem){
                var id=$(this).children().first().attr('onclick');
                id=id.split(',');
                id=id[1].substr(0,id[1].length-1);
                var Obj=new dataModel({
                    UniqueId:id+"@FBC",
                    source:"FBC",
                    title:$(this).find('h3').text(),
                    contentLink:"https://freebcard.com"+$(this).find('.portfolio-link').attr('href'),
                    thumbnailURL:"https://freebcard.com"+$(this).find('.img-responsive').attr('src'),
                    category:"PSD",
                })
                request(Obj.contentLink,function(err,res,html){
                    $2=cheerio.load(html,{ normalizeWhitespace: false, xmlMode: false, decodeEntities: true });
                    $2('meta').each((i,elem)=>{
                            if($2(elem).attr('name')&&$2(elem).attr('name')=="keywords"){
                                    Obj.tags=$2(elem).attr('content');
                                    dataModel.addItem(Obj,(err,result)=>{
                                        if(err)
                                            process.stdout.write(chalk.red(res.statusCode))
                                        else{
                                            process.stdout.write(chalk.green('-'))
                                        }
                                    })
                            }
                    });
                });
            })
            callback(parseInt(pageId)+1);
         }
        catch(e){
            console.log(e);
        }
        }
    });
}
function callingBoss(link){
FlaticonScrapper(link,function(res){
    if(res=="DONE"){
        process.stdout.write(chalk.blue("#"))
        process.exit(1);
    }
    callingBoss(res);   
});
}
mongoose.connect(config.database,{
    config:{
        autoIndex:false
    }
})
mongoose.connection.on('connected',()=>{
    console.log("Connected");
    var args = process.argv.slice(2);
    pageNumer=args[0];
    callingBoss(pageNumer);    
})
mongoose.connection.on('error',()=>{
    console.log("Not Connected");
});
