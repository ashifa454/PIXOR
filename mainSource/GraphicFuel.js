/*SCRAPPER FOR FLATICONS*/
const cheerio=require('cheerio');
const request=require('request');
const mongoose=require('mongoose');
const chalk = require('chalk');
const dataModel=require('../models/pixorData');
const config=require('../config/database');
var nodes=['http://www.graphicsfuel.com/category/backgrounds/page/','http://www.graphicsfuel.com/category/vectors/page/',
'http://www.graphicsfuel.com/category/fonts/page/','http://www.graphicsfuel.com/category/free-psd-files-3/page/',
'http://www.graphicsfuel.com/category/mockup-templates/page/','http://www.graphicsfuel.com/category/textures/page/',
'http://www.graphicsfuel.com/category/free-photos/page/','http://www.graphicsfuel.com/category/graphics/page/'];
var index=0;
category="BCK"
FlaticonScrapper=function(pageId,callback){
    request(nodes[index]+pageId,function(err,res,html){
        console.log(chalk.yellow(nodes[index]+pageId))
        if(res&&res.statusCode===404){
            index++;
            switch(index){
                case 0:
                category="BCK";
                break;
                case 1:
                category="VCT";  
                break;
                case 2:
                category="ICN";
                break;
                case 3:
                category="PSD";
                break;
                case 4:
                category="MCK";
                break;
                case 5:
                category="TXT";
                break;
                case 7:
                category="FOT";
                break;
                case 8:
                category="OTH";
                break;
                default:
                    console.log(chalk.green("DONE"));
                    return;
                break;
            }
            callback(1);
        }else{
        try{
        const $=cheerio.load(html);
        $('main').find('article').each(function(i,elem){
            id=$(this).attr('class');
            id=id.split(" ")
            id=id[0].split("-");
            id=id[1];
            var header_info=$(this).find('.entry-title').children().first();
             var Obj=new dataModel({
                UniqueId:id+"@GPF",
                source:"GPF",
                title:header_info.text(),
                contentLink:header_info.attr('href'),
                thumbnailURL:$(this).find('.post-image').attr('src'),
                category:category,
            })
           if(Obj.contentLink){
                request(Obj.contentLink,function(err,res,html){
                    tags=[];
                    k=0;
                    $2=cheerio.load(html,{ normalizeWhitespace: false, xmlMode: false, decodeEntities: true });
                    $2('meta').each((i,elem)=>{
                        if($2(elem).attr('property')&&$2(elem).attr('property').indexOf("tag")>0){
                                tags[k]=$2(elem).attr('content')
                                k++
                        }
                    });
                    Obj.tags=tags.join(" ");
                    //Obj=Obj.toObject();
                    //delete Obj._id;
                    dataModel.addItem(Obj,(err,result)=>{
                        if(err)
                            console.log(chalk.red(err));
                        else{
                            console.log(chalk.green(result.title))      
                        }
                    })
                });
            }
        });
        callback(pageId+1);
     }
    catch(e){
        console.log(e);
    }
}
    });
}
mongoose.connect(config.database,{
    config:{
        autoIndex:false
    }
});
mongoose.connection.on('connected',()=>{
    console.log("Connected");
    callingBoss(1);    
});
mongoose.connection.on('error',(err)=>{
    console.error(err)
})
function callingBoss(link){
FlaticonScrapper(link,function(res){
    callingBoss(res);   
});
}