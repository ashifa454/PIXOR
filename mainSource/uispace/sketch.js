const cheerio = require('cheerio');
const request = require('request');
const chalk = require('chalk');
const config = require('../../config/database');
const mongoose = require('mongoose');
const dataModel = require('../../models/pixorData');
const category = "SKT";
const source = "UIS"

function UISpaceCrawler(pageId, callback) {
  request('https://uispace.net/?filter=sketch&page=' + pageId, (err, res, html) => {
    if (res && res.statusCode == 200) {
      $ = cheerio.load(html);
      grid = $('.grid');
      if (grid.length > 1) {
        grid.map((index, item) => {
          if ($(item).find('.value').text() === 'Free') {
            var Obj = new dataModel({
              title: $(item)
                .find('.titlelink')
                .text(),
              thumbnailURL: $(item)
                .find('.preview')
                .attr('style')
                .split('(')[1]
                .split(')')[0],
              UniqueId: $(item)
                .find('.preview')
                .attr('style')
                .split('(')[1]
                .split('https://i2.wp.com/uispace.net/images/')[1]
                .split('-')[0] + '@UIS',
              contentLink: $(item)
                .find('a')
                .attr('href'),
              tags: $(item)
                .find('.titlelink')
                .text(),
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
        callback(null, {
          flag: true,
          pageId: pageId + 1
        })
      } else {
        callback('files not found', {flag: false});
      }

    } else if (res.statusCode == 404) {
      callback('404', {flag: false});
    } else {
      callback(err, {flag: false});
    }
  });
}

function MyAgent(initialPage) {
  UISpaceCrawler(initialPage, (err, success) => {
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
    MyAgent(0);
  })
mongoose
  .connection
  .on('error', () => {
    console.log("Not Connected");
  });
