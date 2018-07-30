const cheerio=require('cheerio');
const request=require('request');
const config=require('../../config/database');
const mongoose=require('mongoose');
const chalk = require('chalk');
const dataModel=require('../../models/pixorData');
var nodes=['http://www.freepik.com/index.php?goto=8&populares=1&page='];
var Obj;
FreePikScrapper=function(pageId,callback){
  request(nodes[0]+pageId+"&type=vectores",(err,res,html)=>{
    if(res){
        if(res.statusCode==404){
                console.log(chalk.green("DONE"));
                callback("DONE");                
        }
          try{
            const $=cheerio.load(html);
            $('.slide-square').each(function(i,elem){
              Obj=new dataModel({
                    UniqueId:$(elem).attr('id')+"@FPK",
                    source:"FPK",
                    title:$(this).find('.description').contents().text(),
                    contentLink:$(this).find('.preview').attr('href'),
                    thumbnailURL:$(this).find('.preview ').children().first().attr('src'),
                    category:"VCT",
                    tags:""
                });
                if(Obj.contentLink){
                    request(Obj.contentLink,function(err,res,html){
                      if(html){
                        $2=cheerio.load(html);
                        $2('meta').each((i,elem)=>{
                            if($2(elem).attr('name')&&$2(elem).attr('name')=="keywords"){
                                    Obj.tags=$2(elem).attr('content');
                                    dataModel.addItem(Obj,(err,result)=>{
                                      if(err)
                                        process.stdout.write(chalk.red("_"));
                                      else{
                                        process.stdout.write(chalk.green("_"));
                                      }
                                    })
                            }
                        });
                      }
                    });
                }
            })
          process.stdout.write(chalk.blue(parseInt(pageId)+1));
          callback(parseInt(pageId)+1);
        }catch(error){
          console.log(chalk.red(error));          
        }
      }
  });
}
ParentFunction=(pageId)=>{
  FreePikScrapper(pageId,function(res){
    if(res=="DONE"){
        process.exit(1);
    }
    ParentFunction(res);
  });
}
mongoose.connect(config.database,{
  config:{
    autoIndex:false
  }
});
mongoose.connection.on('connected',()=>{
  var args = process.argv.slice(2);
  pageNumber=args[0];
  ParentFunction(pageNumber);
});
mongoose.connection.on('error',()=>{
  console.error('Database Connection Error');
})