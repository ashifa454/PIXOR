/*SCRAPPER FOR FLATICONS*/
const cheerio=require('cheerio');
const request=require('request');
const chalk = require('chalk');
const config=require('../../config/database');
const mongoose=require('mongoose');
const dataModel=require('../../models/pixorData');
var nodes=['http://freebbble.com/type/icon/page/'];
FlaticonScrapper=function(pageId,callback){
    request(nodes[0]+pageId,function(err,res,html){
        if(res){
            if(res.statusCode==404){
                process.stdout.write(chalk.blue(pageId));
                callback("DONE");
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
                        category:"ICN",
                        tags:freebie_content.text()
                    });
                    dataModel.addItem(Obj,(err,result)=>{
                        if(err)
                            process.stdout.write(chalk.red("_"));
                        else{
                            process.stdout.write(chalk.green("_"));
                        }
                    })
                })
                callback(parseInt(pageId)+1);
             }
            catch(e){
                console.log(chalk.red(JSON.stringify(e)));
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
    console.log(chalk.green("Connected"));
    var args = process.argv.slice(2);
    pageNumber=args[0];
    callingBoss(pageNumber);
})
mongoose.connection.on('error',(err)=>{
    console.error(err);
})