/*SCRAPPER FOR FLATICONS*/
const cheerio=require('cheerio');
const request=require('request');
var nodes=['http://freebbble.com/type/icon/page/'];
FlaticonScrapper=function(pageId,callback){
    request(nodes[0]+pageId,function(err,res,html){
        if(res.statusCode==404){
            callback(0);
        }
        try{
        const $=cheerio.load(html);
        $('.freebie').each(function(i,elem){
            var freebie_content=$(this).find('.freebie-content').children().first().children().first();
            console.log($(this).children().first().children().first().attr('src'))
            var Obj={
                basicData:{
                id:$(this).attr('id').substr(5,10),
                title:freebie_content.text()},
                linktoContent:freebie_content.attr('href'),
                imageLink:$(this).children().first().children().first().attr('src'),
                category:"UI",
                tags:freebie_content.text()
            }
            console.log(Obj);
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
