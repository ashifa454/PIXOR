/*SCRAPPER FOR FLATICONS*/
const cheerio=require('cheerio');
const request=require('request');
const mongoose=require('mongoose');
const config=require('../../config/database');
const dataModel=require('../../models/pixorData');
var nodes=['http://www.flaticon.com/packs/'];
FlaticonScrapper=function(pageId,callback){
    request(nodes[0]+pageId,function(err,res,html){
        console.log(nodes[0]+pageId);
        if(res.statusCode==404){
            callback("DONE");
        }
        try{
        const $=cheerio.load(html);
        $('article').each(function(i,elem){
           var Obj=new dataModel({
                UniqueId:$(this).data().id+"@FTI",
                source:"FIT",
                title:$(this).data().name,
                contentLink:$(this).children().first().attr('href'),
                thumbnailURL:$(this).find('img').first().attr('src'),
                category:"ICN",
                meta:$(this).find('.badge','.pull-right').contents().text()
            });
            if(Obj.contentLink){
            request(Obj.contentLink,function(err,res,html){
                if(res){
                    $2=cheerio.load(html,{ normalizeWhitespace: false, xmlMode: false, decodeEntities: true });
                    $2('script').each((i,elem)=>{
                        temp=$2(elem).contents().text();
                        if(temp.indexOf('search_in_pack_data')>0){
                            tags=temp.substring(temp.indexOf("[")+1,temp.indexOf("]")).split(",");
                            for(item in tags){
                                tags[item]=tags[item].replace(/"/g,"");
                                tags[item]=tags[item].replace(" ","");
                            }                
                            Obj.tags=tags.join(" ");
//                            Obj=Obj.toObject();
//                            delete Obj._id;
                            dataModel.addItem(Obj,(err,result)=>{
                                if(err){
                                    console.log(err);
                                }else{
                                    console.log(result);
                                }
                            })
                        }
                    });
                }
                });
            }
        })
        callback(parseInt(pageId)+1);
     }
    catch(e){
        console.log(e);
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
    var args = process.argv.slice(2);
    pageNumer=args[0];
    callingBoss(pageNumer);
})
mongoose.connection.on('error',(err)=>{
    console.log(err);
})
function callingBoss(link){
FlaticonScrapper(link,function(res){
    if(res=="DONE"){
        process.exit(1);
    }
    callingBoss(res);   
});
}
