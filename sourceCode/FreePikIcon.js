/*SCRAPPER FOR FLATICONS*/
const cheerio=require('cheerio');
const request=require('request');
var nodes=['http://www.freepik.com/index.php?goto=8&populares=1&page='];
FlaticonScrapper=function(pageId,callback){
    request(nodes[0]+pageId+"&type=iconos",function(err,res,html){
        if(res.statusCode==404){
            callback(0);
        }
        try{
        const $=cheerio.load(html);
        $('.slide-square').each(function(i,elem){
            var Obj={
                basicData:{
                    id:$(this).attr('id'),
                    title:$(this).find('.description').contents().text()},
                linktoContent:$(this).find('.preview').attr('href'),
                imageLink:$(this).find('.preview ').children().first().attr('src'),
                category:"IC",
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
                               Obj.tags=tags;
                            console.log(Obj);
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
