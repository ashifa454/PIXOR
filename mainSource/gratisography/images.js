const cheerio = require('cheerio');
const request = require('request');
const chalk = require('chalk');
const config = require('../../config/database');
const mongoose = require('mongoose');
const dataModel = require('../../models/pixorData');

var category = "FOT";
var source = "GTG";

function gratistographyCrawler(callback) {
  request('https://gratisography.com/', (err, res, html) => {
    if(res.statusCode == 200 && res) {
      $ = cheerio.load(html);
      $('.cd-gallery').find('.mix').map((index, item) => {
        if ($(item).find('a').attr('href') !== 'https://gratisography.com/bundles/' && $(item).find('img').attr('alt') !== 'Adobe Stock') {
          var Obj = new dataModel({
            title: $(item).attr('class').replace('mix all ',''),
            tags: $(item).attr('class').replace('mix all ',''),
            thumbnailURL: 'https://gratisography.com/'+$(item).find('img').attr('data-original'),
            UniqueId: $(item).find('a').attr('href').split('https://cdn.gratisography.com/photos/')[1].split('.')[0] + '@GTG',
            contentLink: $(item).find('a').attr('href'),
            category: category,
            source: source
          });
          dataModel.addItem(Obj,(err,result)=>{
            (err?(()=>{process.stdout.write(chalk.red("_"))}):process.stdout.write(chalk.green("_")));
          });
          callback('true',{
            flag: true
          });
        }
      });
    } else if(res.statusCode == 404) {
      callback('404',{
        flag: false
      });
      console.log(res.statusCode);
    } else {
      callback(err, {
        flag: false
      });
      console.log(res.statusCode);
    }
  });
}

function MyAgent() {
  gratistographyCrawler((err, success) => {
    if (!success.flag) {
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
    MyAgent();    
})
mongoose.connection.on('error',()=>{
    console.log("Not Connected");
});
