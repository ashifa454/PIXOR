const cheerio = require('cheerio');
const request = require('request');
const config = require('../../config/database');
const mongoose = require('mongoose');
const chalk = require('chalk');
const dataModel = require('../../models/pixorData');
var category = "VCT";
var source = "PPX";

function premiumPixelCrawler(pageId, callback) {
  request('http://www.premiumpixels.com/page/' + pageId, (err, res, html) => {
    if (res && res.statusCode == 200) {
      $ = cheerio.load(html);
      $('.post').map((index, item) => {
        var Obj = new dataModel({
          title: $(item)
            .find('.entry-title')
            .find('a')
            .text(),
          tags: $(item)
            .find('.entry-content')
            .find('p')
            .text(),
          thumbnailURL: $(item)
            .find('.post-thumb-img')
            .find('img')
            .attr('src'),
          UniqueId: $(item)
            .find('.zilla-likes')
            .attr('data-id') + "@PPX",
          contentLink: $(item)
            .find('.entry-title')
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
                .write(chalk.red("_"))
            })
            : process.stdout.write(chalk.green("_")));
        });
      });
      callback(null, {
        flag: true,
        pageId: pageId + 1
      });
    } else if (res.statusCode == 404) {
      callback('404', {flag: false});
    } else {
      callback(err, {flag: false});
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
