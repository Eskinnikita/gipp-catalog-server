const express = require('express')
const User = require('../models/user')
const Publisher = require('../models/publisher')
const Organ = require('../models/organization')
const PublisherConfig = require('../models/publisherConfig')
const jwt = require('jsonwebtoken')


const router = express.Router()

//Авторизация пользователя
router.post('/login', async (req, res) => {
  const {email, password} = req.body
  let userWithEmail
  await Promise.all([
    User.findOne({where: {email}}),
    Publisher.findOne({where: {email: email, approved: true}}),
    Organ.findOne({where: {email: email, approved: true}})
  ])
    .then((data) => {
      for(let i = 0; i < data.length; i++) {
        if(data[i] !== null) {
          userWithEmail = data[i].dataValues
        }
      }
    })
    .catch(
      e => {
        console.log("Error", e)
      }
    )

  if (!userWithEmail) {
    return res.status(400).json({
      message: "Неверная почта или пароль!"
    })
  }

  if (userWithEmail.password !== password) {
    return res.status(400).json({
      message: "Неверная почта или пароль!"
    })
  }

  const jwtToken = jwt.sign(
    {id: userWithEmail.id, email: userWithEmail.email},
    process.env.JWT_SECRET
  )

  const userWithToken = JSON.parse(JSON.stringify(userWithEmail))
  userWithToken.token = jwtToken

  res.status(200).json(userWithToken)
})

//Регистрация пользователя
router.post('/register', async (req, res) => {
  const {name, email, password, role} = req.body

  const existedUser = await User.findOne({where: {email}}).catch(
    e => {
      console.log("Error", e)
    }
  )

  if (existedUser) {
    return res.status(409).json({
      message: "Пользователь уже существует!"
    })
  }

  const newUser = new User({name, email, password, role})
  const createdUser = await newUser.save().catch(
    e => {
      console.log("Error: ", e);
      res.status(500).json({error: "Ошибка регистрации"});
    }
  )

  if (createdUser) {
    const jwtToken = jwt.sign(
      {id: createdUser.id, email: createdUser.email},
      process.env.JWT_SECRET
    )

    const userWithToken = JSON.parse(JSON.stringify(createdUser))
    userWithToken.token = jwtToken
    res.status(201).json(userWithToken)
  }
})

//Отправка запроса организации или издателя
router.post('/request', async (req, res) => {
  const {name, phone, email, address, role, approved} = req.body
  let Model
  if (+role === 2) {
    Model = Organ
  } else {
    Model = Publisher
  }
  const existedRequest = await Model.findOne({where: {email}}).catch(
    e => {
      console.log("Error", e)
    }
  )

  if (existedRequest) {
    return res.status(409).json({
      message: "Вы уже подавали заявку! Ожидайте рассмотрения администратором портала"
    })
  }

  const newRequest = new Model({name, phone, email, address, role, approved})
  const createdRequest = await newRequest.save().catch(
    e => {
      console.log("Error: ", e);
      res.status(500).json({error: "Ошибка регистрации"});
    }
  )

  if(+role === 3) {
    await PublisherConfig.create({
      publisherId: createdRequest.id,
      mainColor: "#ebeef5",
      accentColor: "#409EFF"
    })
  }

  res.status(201).json(createdRequest)
})


module.exports = router
