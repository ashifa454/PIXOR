/*SCRAPPER FOR VIDEO*/
const cheerio=require('cheerio');
const request=require('request');
const config=require('../../config/database');
const mongoose=require('mongoose');
const chalk = require('chalk');
const dataModel=require('../../models/pixorData');
var nodes=['https://pixabay.com/en/editors_choice/?media_type=video&pagi='];
var index=0;
var category="VDO";

FlaticonScrapper=function(pageId,callback){
    request(nodes[index]+pageId,function(err,res,html){
        if(res&&res.statusCode==404){
            console.log("DONE");
            callback("DONE");
        }
        else if(res&&res.statusCode==200){
            try{
                const $=cheerio.load(html);
                $('.item').each(function(i,elem){
                    var header_info=$(this).children().first();
                    var Media=header_info.children().first();
                    id=header_info.attr('href').split("-");
                    id=id[id.length-1].replace("/","");
                    var Obj=new dataModel({
                        UniqueId:id+"@PXV",
                        source:"PXV",
                        title:"Video From Pixabay",
                        contentLink:"https://pixabay.com"+header_info.attr('href'),
                        thumbnailURL:Media.children().first().attr('src'),
                        video_url:'https:'+Media.attr('data-mp4'),
                        category:category,
                        //tags:header_info.children().first().attr('title')
                    })
                    if(Obj.contentLink){
                        request(Obj.contentLink,function(err,res,html){
                            if(res){
                                $2=cheerio.load(html,{ normalizeWhitespace: false, xmlMode: false, decodeEntities: true });
                                $2('meta').each((i,elem)=>{
                                    if($2(elem).attr('name')=="description"){
                                        Obj.tags=$2(elem).attr('content');
                                    }
                                    if($2(elem).attr('name')=="twitter:image"){
                                        Obj.thumbnailURL=$(elem).attr('content');
                                    }
                                });
                                dataModel.addItem(Obj,(err,result)=>{
                                    (err?(()=>{process.stdout.write(chalk.red("_"))}):process.stdout.write(chalk.green("_")));
                                })
                            }
                            });
                        }
                })
            process.stdout.write(chalk.blue(parseInt(pageId)+1));
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
    if(res=="DONE"){
        process.exit(1);
    }
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