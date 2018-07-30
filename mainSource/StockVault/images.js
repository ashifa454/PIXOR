const cheerio = require('cheerio');
const request = require('request');
const chalk = require('chalk');
const config = require('../../config/database');
const mongoose = require('mongoose');
const dataModel = require('../../models/pixorData');
var category="FOT";
var source="STV";

function premiumPixelCrawler(pageId,callback) {
  request('https://www.stockvault.net/latest-photos/?&p='+pageId, (err, res, html) => {
    if (res && res.statusCode == 200) {
      $ = cheerio.load(html);
      content = $('#flexgrid').find('.item');
      if (content.length != 0) {
        content.map((index, item) => {
          var Obj = new dataModel({
            title: $(item).find('a').attr('title'),
            tags: $(item).find('img').attr('alt').split(' '),
            thumbnailURL: $(item).find('img').attr('data-src').replace('/.','https://www.stockvault.net'),
            UniqueId: $(item).find('a').attr('photoId') === undefined ? $(item).find('a').attr('photoid')+"@STV" : $(item).find('a').attr('photoId')+"@STV",
            contentLink: 'https://www.stockvault.net'+$(item).find('a').attr('href'),
            category: category,
            source: source
          });
          dataModel.addItem(Obj,(err,result)=>{
            (err?(()=>{process.stdout.write(chalk.red("_"))}):process.stdout.write(chalk.green("_")));
          });  
        });
        callback(null, {
          flag: true,
          pageId:pageId+1
        });
      } else {
        callback('404',{
          flag: false
        });
      }
    } else if(res.statusCode == 404) {
      callback('404',{
        flag: false
      });
    } else {
      callback(err, {
        flag: false
      });
    }
  });
}

function MyAgent(initialPage) {
  premiumPixelCrawler(initialPage, (err, success) => {
    if (success.flag) {
      MyAgent(success.pageId);  
    } else {
      console.log(chalk.red(err));
    }
  });
}

mongoose.connect(config.database,{
    config:{
        autoIndex:false
    }
})
mongoose.connection.on('connected',()=>{
    console.log("Connected");
    MyAgent(1);    
})
mongoose.connection.on('error',()=>{
    console.log("Not Connected");
});
