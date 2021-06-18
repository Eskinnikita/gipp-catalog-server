const express = require('express')
const User = require('../models/user')
const Publisher = require('../models/publisher')
const Organ = require('../models/organization')
const Review = require('../models/review')
const Comment = require('../models/comment')
const UserPublication = require('../models/userPublications')
const passport = require('passport')
const generator = require('generate-password');
const transporter = require('../utils/nodemailerClient')
const multer = require('multer')
const bcrypt = require('bcrypt');

const router = express.Router()

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, './uploads/usersLogos')
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

//Подтвеждение заявки
router.post('/confirm', passport.authenticate('jwt', {session: false}), async (req, res) => {
  try {
    const {role, id} = req.body
    // const saltRounds = 10;
    let Model
    switch (role) {
      case 2:
        Model = Organ;
        break;
      case 3:
        Model = Publisher;
        break;
      default:
        console.log("Error")
        break;
    }
    const newPassword = generator.generate({
      length: 10,
      numbers: true
    });

    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(newPassword, salt);

    await Model.update({approved: true, password: hash}, {
      where: {
        id
      }
    });

    const request = await Model.findOne({where: {id}})
    const email = request.dataValues.email

    const info = await transporter.sendMail({
      from: process.env.MAIL_CLIENT_USERNAME,
      to: email,
      subject: "Добро пожаловать в детский каталог ГИПП!",
      text: "Ваша заявка подтверждена, в можете авторизоваться на сайте, спользуя следующие данные:",
      html: `<b>Логин: </b>${email}<br/><b>Пароль: </b>${newPassword}`,
    }).catch(e => {
      console.log(e)
    })

    console.log(info)

    res.status(200).json(request)
  } catch (e) {
    res.status(500).json({message: e})
  }
})

//Отклонение заявки
router.post('/deny', passport.authenticate('jwt', {session: false}), async (req, res) => {
  try {
    const {role, id, comment} = req.body
    let Model
    switch (role) {
      case 2:
        Model = Organ;
        break;
      case 3:
        Model = Publisher;
        break;
      default:
        console.log("Error")
        break;
    }

    const request = await Model.findOne({where: {id}})

    const email = request.dataValues.email

    const info = await transporter.sendMail({
      from: process.env.MAIL_CLIENT_USERNAME,
      to: email,
      subject: "Отклонение заявки!",
      text: "Ваша заявка подтверждена, в можете авторизоваться на сайте, спользуя следующие данные:",
      html: `<b>К сожалению, ваша заявка была отклонена, ниже вы можете ознакомиться с комментарием администратора</b><br/>
      <p>${comment}</p>`
    }).catch(e => {
      console.log(e)
    })

    const destroyedRequest = await Model.destroy({where: {id}})
    res.status(200).json(destroyedRequest)
  } catch (e) {
    res.status(500).json({message: e})
  }
})

//Получение пользователя
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id
    const user = await User.findOne({where: {id}})
    res.status(200).json(user)
  } catch (e) {
    res.status(500).json({message: e})
  }
})

//Обновление пользователя
router.patch('/:id', upload.single('logo'), passport.authenticate("jwt", {session: false}), async (req, res) => {
  try {
    const id = req.params.id
    const infoToUpdate = JSON.parse(req.body.user)
    if (req.body.logo !== 'null') {
      infoToUpdate.logoUrl = req.file.path
    }
    const updatedUser = await User.update(infoToUpdate, {
      where: {
        id
      }
    }).catch(e => {
      res.status(409).json({message: e})
    })
    res.status(200).json(updatedUser)
  } catch (e) {
    res.status(500).json({message: e})
  }
})

//Удаление пользователя
router.delete('/:id', passport.authenticate("jwt", {session: false}), async (req, res) => {
  try {
    const userId = req.params.id
    const userToDelete = await User.findOne({where: {id: userId}})
      .catch(e => res.status(409).json({message: e}))
    await Comment.destroy({where: {authorRole: 1, authorId: userId}})
      .catch(e => res.status(409).json({message: e}))
    await Review.destroy({where: {reviewerRole: 1, reviewerId: userId}})
      .catch(e => res.status(409).json({message: e}))
    await UserPublication.destroy({where: {userId: userId, userRole: 1}})
      .catch(e => res.status(409).json({message: e}))
    await User.destroy({where: {id: userId}})
      .catch(e => res.status(409).json({message: e}))
    res.status(200).json(userToDelete)
  } catch (e) {
    res.status(500).json({message: e})
  }
})

module.exports = router
