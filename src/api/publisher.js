const express = require('express')
const sequelize = require('sequelize')
const Publisher = require('../models/publisher')
const Publication = require('../models/publication')
const User = require('../models/user')
const Organ = require('../models/organization')
const Review = require('../models/review')
const PublisherConfig = require('../models/publisherConfig')
const multer = require('multer')
const passport = require('passport')

const router = express.Router()

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, './uploads/publishersLogos')
  },
  filename(req, file, cb) {
    cb(null, new Date().toISOString() + file.originalname)
  }
})

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpeg') {
    cb(null, true)
  } else {
    cb(null, false)
  }
}

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter
})

//Получение издателя
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id
    Publisher.hasMany(Review, {
      foreignKey: 'reviewerId'
    })
    Publisher.hasOne(PublisherConfig)
    const publisher = await Publisher.findOne({
      where: {id},
      attributes: { exclude: ['password', 'approved'] },
      include: {
        model: PublisherConfig
      }
    }).catch(e => {
      res.status(404).json({message: e})
    })
    res.status(200).json(publisher)
  } catch (e) {
    res.status(500).json({message: e})
  }
})

//Обновление издателя
router.patch('/:id', upload.single('logo'), passport.authenticate("jwt", {session: false}), async (req, res) => {
  try {
    const id = req.params.id
    const infoToUpdate = JSON.parse(req.body.publisher)
    const config = JSON.parse(req.body.config)

    if(req.body.logo !== 'null') {
      infoToUpdate.logoUrl = req.file.path
    }
    console.log(id, infoToUpdate)
    const updatedPublisher = await Publisher.update(infoToUpdate, {
      where: {
        id
      }
    }).catch(e => {
      res.status(409).json({message: e})
    })
    await PublisherConfig.update(config, {
      where: {
        publisherId: id
      }
    })
    res.status(200).json(updatedPublisher)
  } catch (e) {
    res.status(500).json({message: e})
  }
})

router.patch('/block/:id', passport.authenticate("jwt", {session: false}), async (req, res) => {
  try {
    const id = req.params.id
    const publisherToUpdate = await Publisher.findOne({
      where: {
        id
      }
    }).catch(e => {
      res.status(409).json({message: e})
    })
    const updatedPublisher = await Publisher.update({blocked: true, password: ''}, {
      where: {
        id
      }
    }).catch(e => {
      res.status(409).json({message: e})
    })
    res.status(200).json(publisherToUpdate)
  } catch (e) {
    res.status(500).json({message: e})
  }
})

module.exports = router
