const express = require('express')
const Organ = require('../models/organization')
const Review = require('../models/review')
const multer = require('multer')
const passport = require('passport')

const router = express.Router()

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, './uploads/organizationsLogos')
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

//Получение организации
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id
    const user = await Organ.findOne({where: {id}})
    res.status(200).json(user)
  } catch (e) {
    res.status(500).json({message: e})
  }
})

//Обновление организации
router.patch('/:id', upload.single('logo'), passport.authenticate("jwt", {session: false}), async (req, res) => {
  try {
    const id = req.params.id
    const infoToUpdate = JSON.parse(req.body.user)
    if (req.body.logo !== 'null') {
      infoToUpdate.logoUrl = req.file.path
    }
    const updatedOrgan = await Organ.update(infoToUpdate, {
      where: {
        id
      }
    }).catch(e => {
      res.status(409).json({message: e})
    })
    res.status(200).json(updatedOrgan)
  } catch (e) {
    res.status(500).json({message: e})
  }
})

router.patch('/block/:id', passport.authenticate("jwt", {session: false}), async (req, res) => {
  try {
    const id = req.params.id
    const organToUpdate = await Organ.findOne({
      where: {
        id
      }
    }).catch(e => {
      res.status(409).json({message: e})
    })
    const updatedOrgan = await Organ.update({blocked: true, password: ''}, {
      where: {
        id
      }
    }).catch(e => {
      res.status(409).json({message: e})
    })
    res.status(200).json(organToUpdate)
  } catch (e) {
    res.status(500).json({message: e})
  }
})

module.exports = router
