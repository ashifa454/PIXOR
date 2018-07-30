const cheerio = require('cheerio');
const request = require('request');
const chalk = require('chalk');
const config = require('../../config/database');
const mongoose = require('mongoose');
const dataModel = require('../../models/pixorData');

var category = 'FOT';
var source = 'PXH';

function pxhereCrawler(pageId, callback) {
  request('https://pxhere.com/?page=' + pageId, (err, res, html) => {
    if (res && res.statusCode == 200) {
      $ = cheerio.load(html);
      object = $('.item');
      if (object.length > 0) {
        object.map((index, item) => {
          var Obj = new dataModel({
            title: $(item)
              .find('img')
              .attr('title'),
            tags: $(item)
              .find('img')
              .attr('alt')
              .replace(',', ' '),
            thumbnailURL: $(item)
              .find('img')
              .attr('data-src'),
            UniqueId:
              $(item)
                .find('button')
                .attr('data-id') + '@PXH',
            contentLink:
              'https://pxhere.com' +
              $(item)
                .find('a')
                .attr('href'),
            category: category,
            source: source
          });
          dataModel.addItem(Obj, (err, result) => {
            err
              ? () => {
                  process.stdout.write(chalk.red('-'));
                }
              : process.stdout.write(chalk.green('-'));
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
  });
}

function MyAgent(initialPage) {
  pxhereCrawler(initialPage, (err, success) => {
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
