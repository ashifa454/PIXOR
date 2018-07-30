/*SCRAPPER FOR FREEPIK*/
const cheerio=require('cheerio');
const request=require('request');
var admin=require('firebase-admin');
var nodes=['http://www.freepik.com/index.php?goto=8&populares=1&page='];
var admin = require("firebase-admin");
var serviceAccount = require("../config/pixor-brandlitic-firebase-adminsdk-kjtzw-29e409ac68.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://pixor-brandlitic.firebaseio.com"
});
var db=admin.database();
var ref=db.ref('/data');
FlaticonScrapper=function(pageId,callback){
    request(nodes[0]+pageId+"&type=psd",function(err,res,html){
        if(res.statusCode==404){
            callback(0);
        }
        try{
        const $=cheerio.load(html);
        $('.slide-square').each(function(i,elem){
            var Obj={
                id:$(elem).attr('id'),
                title:$(this).find('.description').contents().text(),
                linktoContent:$(this).find('.preview').attr('href'),
                imageLink:$(this).find('.preview ').children().first().attr('src'),
                category:"PS",
            }
            if(Obj.linktoContent){
                request(Obj.linktoContent,function(err,res,html){
                    $2=cheerio.load(html,{ normalizeWhitespace: false, xmlMode: false, decodeEntities: true });
                    $2('meta').each((i,elem)=>{
                        if($2(elem).attr('name')&&$2(elem).attr('name')=="keywords"){
                                tags=$2(elem).attr('content');
                                tags=tags.split(",");
                                for(item in tags){
                                    tags[item]=tags[item].replace(" ","");
                                }
                                ref.child(Obj.id).set(Obj,(err)=>{
                                if(err)
                                    throw err
                                else{
                                    console.log("Added "+Obj.id);
                                } 
                                });
                        }
                    });
                });
            }
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
callingBoss(1);
