const cheerio = require('cheerio');
const request = require('request');
const chalk = require('chalk');
const config = require('../../config/database');
const mongoose = require('mongoose');
const dataModel = require('../../models/pixorData');

var category = '3DO';
var source = '3DM';

function designConnectCrawler(pageId, callback) {
  request(
    'http://www.3dmodelfree.com/3dmodel/list400-' + pageId + '.htm',
    (err, res, html) => {
      if (res && res.statusCode == 200) {
        $ = cheerio.load(html);
        $('.bg_pic').map((index, item) => {
          var Obj = new dataModel({
            UniqueId:
              $(item)
                .find('a')
                .attr('href')
                .split('.htm')[0]
                .split('http://www.3dmodelfree.com/models/')[1]
                .split('-')[0] +
              '@' +
              source,
            title: $(item)
              .find('img')
              .attr('alt'),
            thumbnailURL:
              'http://www.3dmodelfree.com/' +
              $(item)
                .find('img')
                .attr('src'),
            contentLink: $(item)
              .find('a')
              .attr('href'),
            category: category,
            source: source,
            tags: $(item)
              .find('img')
              .attr('alt')
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
  designConnectCrawler(initialPage, (err, success) => {
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
