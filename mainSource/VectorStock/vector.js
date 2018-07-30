const cheerio = require('cheerio');
const request = require('request');
const chalk = require('chalk');
const config = require('../../config/database');
const mongoose = require('mongoose');
const dataModel = require('../../models/pixorData');

var category = 'VCT';
var source = 'VCTSTK';

function vectorStockCrawler(pageId, callback) {
  request(
    'https://www.vectorstock.com/free-vectors-page_' + pageId,
    (err, res, html) => {
      if (res && res.statusCode == 200) {
        $ = cheerio.load(html);
        object = $('.collection').find('li');
        if (object.length > 0) {
          object.map((index, item) => {
            var Obj = new dataModel({
              UniqueId: null,
              title: null,
              thumbnailURL: null,
              contentLink: null,
              category: category,
              source: source,
              tags: null
            });
            $(item)
              .find('meta')
              .map((index, item2) => {
                object2 = $(item2).attr('itemprop');
                switch (object2) {
                  case 'productID':
                    Obj.UniqueId = $(item2).attr('content') + '@' + source;
                    break;
                  case 'url':
                    Obj.contentLink = $(item2).attr('content');
                    break;
                  case 'name':
                    Obj.title = $(item2).attr('content');
                    break;
                  case 'description':
                    Obj.tags = $(item2).attr('content');
                    break;
                  case 'image':
                    Obj.thumbnailURL = $(item2).attr('content');
                    break;
                }
                dataModel.addItem(Obj, (err, result) => {
                  err
                    ? () => {
                        process.stdout.write(chalk.red('-'));
                      }
                    : process.stdout.write(chalk.green('-'));
                });
              });
          });
          callback(null, {
            flag: true,
            pageId: pageId + 1
          });
        } else {
          callback('no more data', {
            flag: false
          });
        }
      } else if (res && res.statusCode == 404) {
        callback('404', { flag: false });
        console.log(res.statusCode);
      } else {
        callback(err, { flag: false });
        console.log(res.statusCode);
      }
    }
  );
}

function MyAgent(initialPage) {
  vectorStockCrawler(initialPage, (err, success) => {
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
});
mongoose.connection.on('connected', () => {
  console.log('Connected');
  MyAgent(1);
});
mongoose.connection.on('error', () => {
  console.log('Not Connected');
});
