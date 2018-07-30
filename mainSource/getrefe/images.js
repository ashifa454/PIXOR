const cheerio = require('cheerio');
const request = require('request');
const chalk = require('chalk');
const config = require('../../config/database');
const mongoose = require('mongoose');
const dataModel = require('../../models/pixorData');
var category="FOT";
var source="GRF";

function getrefeCrawler(pageId,callback) {
  request('http://getrefe.com/downloads/category/free/page/'+pageId, (err, res, html) => {
    if (res && res.statusCode == 200) {
      $ = cheerio.load(html);
      $('.content-area').find('article').map((index, item) => {
        var Obj = new dataModel({
          title: $(item).find('.entry-title').text(),
          tags: $(item).attr('class').split(/ |-/),
          thumbnailURL: $(item).find('img').attr('src'),
          UniqueId: $(item).attr('id').split('-')[1]+"@GRF",
          contentLink: $(item).find('.entry-title').find('a').attr('href'),
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
  getrefeCrawler(initialPage, (err, success) => {
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
