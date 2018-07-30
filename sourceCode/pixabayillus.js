/*SCRAPPER FOR FLATICONS*/
const cheerio=require('cheerio');
const request=require('request');
var nodes=['https://pixabay.com/en/editors_choice/?media_type=illustration&pagi='];
FlaticonScrapper=function(pageId,callback){
    request(nodes[0]+pageId,function(err,res,html){
        if(res.statusCode==404){
            callback(1);
        }
        try{
        const $=cheerio.load(html);
        $('.item').each(function(i,elem){
            var header_info=$(this).children().first();
            id=header_info.attr('href').split("-");
            id=id[id.length-1].replace("/","");
            console.log()
            var Obj={
                basicData:{
                    id:id,
                    title:"Photo From Pixabay"},
                linktoContent:"https://pixabay.com"+header_info.attr('href'),
                imageLink:header_info.children().first().attr('data-lazy'),
                category:"PSD",
                tags:header_info.children().first().attr('alt')
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
