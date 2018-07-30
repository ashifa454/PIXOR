const cheerio = require('cheerio');
const request = require('request');
const chalk = require('chalk');
const config = require('../../config/database');
const mongoose = require('mongoose');
const dataModel = require('../../models/pixorData');

var category = "FOT";
var source = "SHR";

function splitshireCrawler(pageId, callback) {
  request('https://www.splitshire.com/?upage=' + pageId, (err, res, html) => {
    if (res.statusCode == 200 && res) {
      $ = cheerio.load(html);
      $('.tmb').map((index, item) => {
        if (!$(item).hasClass('tmb-format-video') == true) {
          console.log(!$(item).hasClass('tmb-format-video'));
          var Obj = new dataModel({
            title: $(item)
              .find('a')
              .attr('href')
              .split('https://www.splitshire.com/')[1]
              .split('/')[0]
              .replace(/-/g, ' '),
            tags: $(item)
              .find('a')
              .attr('href')
              .split('https://www.splitshire.com/')[1]
              .split('/')[0]
              .split('-'),
            thumbnailURL: $(item)
              .find('img')
              .attr('src'),
            UniqueId: $(item)
              .find('img')
              .attr('data-uniqueid') + '@SHR',
            contentLink: $(item)
              .find('a')
              .attr('href'),
            category: category,
            source: source
          });
          dataModel.addItem(Obj, (err, result) => {
            (err
              ? (() => {
                process
                  .stdout
                  .write(chalk.red("-"))
              })
              : process.stdout.write(chalk.green("-")));
          });
        }
      });
      console.log(pageId);
      callback(null, {
        flag: true,
        pageId: pageId + 1
      })
    } else if (res.statusCode == 404) {
      callback('404', {flag: false});
    } else {
      callback(err, {flag: false});
    }
  });
}

function MyAgent(initialPage) {
  splitshireCrawler(initialPage, (err, success) => {
    if (success.flag) {
      MyAgent(success.pageId);
    } else {
      console.log(chalk.red(err));
    }
  });
}
mongoose.connect(config.database, {
  config: {
    autoIndex: false
  }
})
mongoose
  .connection
  .on('connected', () => {
    console.log("Connected");
    MyAgent(1);
  })
mongoose
  .connection
  .on('error', () => {
    console.log("Not Connected");
  });
