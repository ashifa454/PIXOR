/*SCRAPPER FOR THE HUNGRY JPEG*/
const cheerio=require('cheerio');
const request=require('request');
const config=require('../config/database');
const mongoose=require('mongoose');
const dataModel=require('../models/pixorData');
var nodes=['https://wegraphics.net/downloads/icons-downloads/page/','https://wegraphics.net/downloads/mockup/page/',
'https://wegraphics.net/downloads/textures/page/','https://wegraphics.net/downloads/vectors/page/','https://wegraphics.net/downloads/fonts/page/'];
category="ICN"
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
                category="ICN"
                break;
                case 1:
                category="MCK";
                break;
                case 2:
                category="TXT"
                break;
                case 3:
                category="VCT"
                break;
                case 4:
                category="FNT"
                break;
                default:
                category="ICN";
                index=0;
                break;

            }
            callback(1);
        }else{
        try{
        const $=cheerio.load(html);
        $('.col').each(function(i,elem){
            if($(this).children().first().is('.free_badge')){
                var header_info=$(this).find('h2').children().first();
                id=$(this).attr('id').split("-");
                id=id[1];
                var Obj=new dataModel({
                UniqueId:id+"@WGH",
                source:"WGH",
                title:header_info.text(),
                contentLink:header_info.attr('href'),
                thumbnailURL:$(this).find('img').attr('src'),
                category:category,
                tags:header_info.children().first().attr('alt')
                })
            if(Obj.contentLink){
                request(Obj.contentLink,function(err,res,html){
                    $2=cheerio.load(html,{ normalizeWhitespace: false, xmlMode: false, decodeEntities: true });
                    $2('meta').each((i,elem)=>{
                        if($2(elem).attr('name')&&$2(elem).attr('name')=="keywords"){
                                tags=$2(elem).attr('content');
                                tags=tags.split(",");
                                Obj.tags=tags.join(" ");
                                Obj=Obj.toObject();
                                delete Obj._id;
                                dataModel.addItem(Obj,(err,result)=>{
                                    (err?(()=>{throw err}):console.log(result));
                                })
                        }
                    });
                });
                }
            }
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
