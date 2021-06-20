const express = require('express')
const passport = require('passport')
const multer = require('multer')

const router = express.Router()

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, './uploads/newsImages')
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

//Загрузка файлов новостной статьи
router.post('/save/image', upload.single('image'),  passport.authenticate("jwt", {session: false}), async (req, res) => {
  try {
    const serverUrl = process.env.PRODUCTION == 'true' ? 'http://gipp-server.std-272.ist.mospolytech.ru' : 'http://localhost:8082'
    if (req.file.path !== 'null') {
      res.status(200).json({
        success: 1,
        file: {
          url: `${serverUrl}/${req.file.path}`
        }
      })
    }
  } catch (e) {
    res.status(500).json({message: e})
  }
})

module.exports = router
