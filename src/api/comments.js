const express = require('express')
const sequelize = require('../database/index')
const Comment = require('../models/comment')
const User = require('../models/user')
const Organ = require('../models/organization')
const Publisher = require('../models/publisher')
const passport = require('passport')
const authorParser = require('../utils/authorParser')

const router = express.Router()

//Добавление комментария
router.post('/', passport.authenticate("jwt", {session: false}), async (req, res) => {
  try {
    const comment = await sequelize.transaction(function(t) {
      return Comment.create(req.body, {transaction: t})
    });
    // const comment = await Comment.create(req.body).catch(e => {
    //   res.status(401).json({message: e.message})
    // })
    let commentWithAuthor = await Comment.findOne({
      where: { id: comment.id},
      include: [
        {
          model: Publisher,
          attributes: ['id', 'name', 'logoUrl', 'role']
        },
        {
          model: User,
          attributes: ['id', 'name', 'role', 'logoUrl']
        },
        {
          model: Organ,
          attributes: ['id', 'name', 'role', 'logoUrl']
        }
      ]
    }).catch(e => {
      res.status(401).json({message: e.message})
    })
    const authorCopy = JSON.parse(JSON.stringify([commentWithAuthor]))
    commentWithAuthor = authorParser(authorCopy)
    res.status(200).json(commentWithAuthor)
  } catch (err) {
    res.status(500).json({message: err})
  }
})

module.exports = router
