const express = require('express');
const bodyParser = require ('body-parser');
const mongoose = require('mongoose');

var authenticate = require('../authenticate');

const cors = require('./cors');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images');
    },

    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
});

const fileFilter = (req, file, cb) => {
  // reject a file
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter
});


const Promotions = require('../models/promotions');
const promotionRouter = express.Router();
promotionRouter.use(bodyParser.json());

promotionRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors,(req,res,next) => {
    Promotions.find({})
    .then((promotions) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promotions);
    }, (err) => next(err))
    .catch((err) => next(err));
})
// .post(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
//     Promotions.create(req.body)
//     .then((promotion) => {
//         console.log('Promotion Created ', promotion);
//         res.statusCode = 200;
//         res.setHeader('Content-Type', 'application/json');
//         res.json(promotion);
//     }, (err) => next(err))
//     .catch((err) => next(err));
// })

.post(cors.corsWithOptions,authenticate.verifyUser, upload.single('image'),(req, res, next) => {
    const promotion = new Promotions({
    name: req.body.name,
    image: req.file.path,
    label:req.body.label,
    price: req.body.price,
    description: req.body.description
  });
  promotion
    .save()

  .then((promotion) => {
      console.log('Promotion Created ', promotion);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(promotion);
      
  }, (err) => next(err))
  .catch((err) => next(err));
})




.put(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /Promotions');
})
.delete(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    Promotions.remove({})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));    
});

promotionRouter.route('/:promotionId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors,(req,res,next) => {
    Promotions.findById(req.params.promotionId)
    .then((promotion) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promotion);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /promotions/'+ req.params.promotionId);
})
.put(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    Promotions.findByIdAndUpdate(req.params.promotionId, {
        $set: req.body
    }, { new: true })
    .then((promotion) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promotion);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    Promotions.findByIdAndRemove(req.params.promotionId)
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = promotionRouter;