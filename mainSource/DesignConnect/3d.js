const cheerio = require('cheerio');
const request = require('request');
const chalk = require('chalk');
const config = require('../../config/database');
const mongoose = require('mongoose');
const dataModel = require('../../models/pixorData');

var category = '3DO';
var source = 'DESCONN';

function designConnectCrawler(pageId, callback) {
  request(
    'https://www.designconnected.com/catalog_list/load_more/' +
      pageId +
      '?fltr_modeltype=1fltr_action=Freebies&fltr_pricegroup=22&fltr_sorttype=date&fltr_sortorder=down&fltr_page=' +
      pageId +
      '&fltr_perpage=60&first_page=1',
    (err, res, html) => {
      if (res && res.statusCode == 200) {
        $ = cheerio.load(html);
        object = $('.item');
        if (object.length > 0) {
          object.map((index, item) => {
            var Obj = new dataModel({
              UniqueId:
                $(item)
                  .find('.qv_frontend_group')
                  .attr('data-id') +
                '@' +
                source,
              title: $(item)
                .find('.image_supporter')
                .attr('title'),
              thumbnailURL: $(item)
                .find('.qv_frontend_group')
                .attr('data-image'),
              contentLink:
                'https://www.designconnected.com' +
                $(item)
                  .find('.qv_frontend_group')
                  .attr('data-url'),
              category: category,
              source: source,
              tags: $(item)
                .find('.image_supporter')
                .attr('title')
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
