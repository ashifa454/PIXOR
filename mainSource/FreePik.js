const cheerio=require('cheerio');
const request=require('request');
const config=require('../config/database');
const mongoose=require('mongoose');
const chalk = require('chalk');
const dataModel=require('../models/pixorData');
var nodes=['http://www.freepik.com/index.php?goto=8&populares=1&page='];
var type="fotos";
var category="FOT";
FreePikScrapper=function(pageId,type,callback){
  request(nodes[0]+pageId+"&type="+type,(err,res,html)=>{
    console.log(chalk.green(nodes[0]+pageId+"&type="+type));    
    if(res.statusCode==404){
            index++;
            switch(index){
              case 0:
                type="fotos";           
                category="FOT";
                break;
              case 1:
                type="iconos";
                category="ICN"
              break;
              case 2:
                type="vectores";
                category="VCT";
              break;
              case 3:
                type="psd";
                category="PSD";
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
            $('.slide-square').each(function(i,elem){
              var Obj=new dataModel({
                    UniqueId:$(elem).attr('id')+"@FPK",
                    source:"FPK",
                    title:$(this).find('.description').contents().text(),
                    contentLink:$(this).find('.preview').attr('href'),
                    thumbnailURL:$(this).find('.preview ').children().first().attr('src'),
                    category:category,
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
                                        console.log(chalk.red(err));
                                      else{
                                        console.log(chalk.green(result.title));
                                      }
                                    })
                            }
                        });
                      }
                    });
                }
            })
          callback(pageId+1);
        }catch(error){
          console.log(chalk.red(error));          
        }
      }
  });
}
ParentFunction=(pageId)=>{
  FreePikScrapper(pageId,type,function(res){
    ParentFunction(res);
  });
}
mongoose.connect(config.database,{
  config:{
    autoIndex:false
  }
});
mongoose.connection.on('connected',()=>{
  console.log('Connected');
  ParentFunction(1);
});
mongoose.connection.on('error',()=>{
  console.error('Database Connection Error');
})