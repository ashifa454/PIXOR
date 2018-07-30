const chalk=require('chalk');
const request=require('request');
const cheerio=require('cheerio');
const config=require('../../config/database');
const mongoose=require('mongoose');
const dataModel=require('../../models/pixorData');
category="VCT";
function _crawler(pageId,callback){
    request('https://undraw.co/illustrations/load/'+pageId,(err,res,html)=>{
        if(res&&res.statusCode==200){
            $=cheerio.load(html);
            $('.item').find('a').map((index,item)=>{
                var Obj=new dataModel({
                    UniqueId:$(item).attr('data-id')+"@UND",
                    source:"UND",
                    title:$(item).attr('data-title'),
                    contentLink:$(item).attr('data-src'),
                    thumbnailURL:$(item).attr('data-src'),
                    category:category,
                    tags:$(item).attr('data-tags'),
                })
                dataModel.addItem(Obj,(err,result)=>{
                    (err?(()=>{process.stdout.write(chalk.red("_"))}):process.stdout.write(chalk.green("_")));
                })            
            }); 
        }else if(res.statusCode==404){
            callback('404',null);
        }
        else{
            callback(err,null);
        }
    });
}
function MyAgent(initialPage){
    _crawler(initialPage,(err,success)=>{
        if(success.flag){
            MyAgent(success.pageId)
        }
        else{
            console.log(chalk.red(err));
        }
    }); 
}
mongoose.connect(config.database,{
    config:{
      autoIndex:false
    }
  });
 mongoose.connection.on('connected',()=>{
    console.log('Connected');
    MyAgent(1);    
  });
mongoose.connection.on('error',()=>{
    console.error('Database Connection Error');
})