var express = require('express');
var chalk=require('chalk');
var router = express.Router();
const dataModel = require('../models/pixorData');
router.post('/getHome', (req, res) => {
  dataModel.getLatest(req.body.skip, req.body.limit, (err, result) => {
    err
      ? res.json({
          status: false,
          message: err
        })
      : res.json({
          status: true,
          message: result
        });
  });
});
getCode = source => {
  switch (source) {
    case 'Photos':
      return 'FOT';
    case 'Icons':
      return 'ICN';
    case 'Vector':
      return 'VCT';
    case 'PSD':
      return 'PSD';
    case 'UIKit':
      return 'UIK';
    case 'Sketch':
      return 'SKT';
    case 'Video':
      return 'VDO';
    case '3D':
      return '3DO';
    case 'Mockup':
      return 'MCK';
    case 'Wallpaper':
      return 'WLP';
    case 'Background':
      return 'BCK';
    case 'Texture':
      return 'TXT';
    case 'Fonts':
      return 'FNT';
    case 'Youtube':
      return 'YTB';
    case 'Tutorial':
      return 'TUT';
    case 'Freepik':
      return 'FPK';
    case 'FreeBCard':
      return 'FBC';
    case 'Freeebbble':
      return 'FRB';
    case 'Graphberry':
      return 'GPB';
    case 'GraphicFuel':
      return 'GPF';
    case 'Iconstore':
      return 'ICT';
    case 'Flaticon':
      return 'FIT';
    case 'Mockupworld':
      return 'MKW';
    case 'Pixaden':
      return 'PXD';
    case 'The hungry jpeg':
      return 'THJ';
    case 'Tutpad':
      return 'TUP';
    case 'Tutplus':
      return 'TPL';
    case 'We Graphics':
      return 'WGH';
    case 'Pixabay':
      return 'PXB';
    case 'Photodune':
      return 'PTD';
    case '3docean':
      return '3DO';
    case 'Videohive':
      return 'VDH';
    case 'Pixabay video':
      return 'PXV';
    case 'Picography':
      return 'PICO';
    case 'Foodies feed':
      return 'FOOD';
    case 'Imagefree':
      return 'IMF';
    case 'Iso republic':
      return 'ISOR';
    case 'Designerspics':
      return 'DSP';
    case 'Splitshire':
      return 'SHR';
    case 'Ui space':
      return 'UIS';
    case 'Refe':
      return 'GRF';
    case 'Gratisography':
      return 'GTG';
    case 'Premium pixel':
      return 'PPX';
    case 'Pxhere':
      return 'PXH';
    case 'Designconnected':
      return 'DESCONN';
    case 'Vectorstock':
        return 'VCTSTK';
    case '3dmodelfree':
        return '3DM';
    case 'Free3d':
        return 'FR3D';
  }
};
router.post('/getFiltered', (req, res) => {
  const globalRequest = req.body;
  if (!globalRequest.condition) {
    dataModel.getLatest(
      globalRequest.skip,
      globalRequest.limit,
      (err, result) => {
        err
          ? res.json({
              status: false,
              message: err
            })
          : res.json({
              status: true,
              message: result
            });
      }
    );
  } else {
    var category = [];
    var source = [];
    var find = [];
    var searchTerm = '';
    var Promises = globalRequest.condition.map(item => {
      if (item.type == 'TAG') {
        return category.push({
          category: getCode(item.text.trim())
        });
      } else if (item.type == 'SER') {
        searchTerm = item.text;
      } else if (item.type == 'TYPE') {
        return find.push({
          isPremium: item.text == 'Prime' ? true : false
        });
      } else {
        return source.push({
          source: getCode(item.text.trim())
        });
      }
    });
    Promise.all(Promises)
      .then(() => {
        dataModel.search(
          find,
          source,
          category,
          searchTerm,
          globalRequest.skip,
          globalRequest.limit,
          (err, result) => {
            err
              ? res.json({
                  status: false,
                  message: err
                })
              : res.json({
                  status: true,
                  message: result
                });
          }
        );
      })
      .catch(e => {
        console.log(e);
      });
  }
});
router.post('/search', (req, res) => {
  var globalRequest = req.body;
  dataModel.search(
    globalRequest.term,
    globalRequest.skip,
    globalRequest.limit,
    (err, result) => {
      err
        ? res.json({
            status: false,
            message: err
          })
        : res.json({
            status: true,
            message: result
          });
    }
  );
});
router.post('/addItem', (req, res) => {
  var Obj = new dataModel(req.body);
  dataModel.addItem(Obj, (err, result) => {
    if (err) {
      res.json({
        status: false,
        message: err
      });
    } else {
      res.json({
        status: true,
        message: result._id
      });
    }
  });
});
router.post('/isExist', (req, res) => {
  dataModel.isExist(req.body.id, (err, result) => {
    if (err)
      res.json({
        status: false,
        message: err
      });
    else {
      if (result == null) {
        res.json({
          status: true,
          message: null
        });
      } else {
        res.json({
          status: true,
          message: result.UniqueId
        });
      }
    }
  });
});
router.post('/deleteData', (req, res) => {
  dataModel.deleteData(req.body.id, (err, result) => {
    if (err)
      res.json({
        status: false,
        message: err
      });
    else {
      res.json({
        status: true,
        message: result
      });
    }
  });
});
router.post('/updateItem', (req, res) => {
  var ObjectToBeUpdated = req.body;
  dataModel.updateItem(ObjectToBeUpdated, (err, result) => {
    if (err) {
      res.json({
        status: false,
        message: err
      });
    } else {
      res.json({
        status: true,
        message: result
      });
    }
  });
});
module.exports = router;
