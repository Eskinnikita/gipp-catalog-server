const express = require('express')
const Publication = require('../models/publication')
const Article = require('../models/article')
const Comment = require('../models/comment')
const Publisher = require('../models/publisher')
const User = require('../models/user')
const Organ = require('../models/organization')
const authorParser = require('../utils/authorParser')

const router = express.Router()

//Получение данный для отображение во вкладке профиля
router.post('/tab-content', async (req, res) => {
  try {
    const {tab, page, role, id} = req.body
    console.log(req.body)
    let tabContent = {}
    let limit
    if (tab === 'catalog') {
      limit = 8
      tabContent = await Publication.findAndCountAll({
        where: {publisherId: id},
        limit: limit,
        offset: (+page - 1) * limit,
        attributes: ['id', 'coverLink', 'title', 'updatedAt']
      })
      tabContent.limit = limit
    } else if (tab === 'news') {
      limit = 4
      tabContent = await Article.findAndCountAll({
        where: {authorId: id, authorRole: role},
        limit: limit,
        offset: (+page - 1) * limit,
        attributes: {exclude: ['blocks']},
        order: [['updatedAt', 'DESC']],
      })
      tabContent.limit = limit
    } else if (tab === 'comments') {
      limit = 6
      const comments = await Comment.findAndCountAll({
        where: {authorId: id, authorRole: role},
        limit: limit,
        offset: (+page - 1) * limit,
        order: [['createdAt', 'DESC']],
        include: [
          {
            model: Publisher, attributes: ['id', 'name', 'logoUrl', 'role'],
          },
          {
            model: User, attributes: ['id', 'name', 'role'],
          },
          {
            model: Organ, attributes: ['id', 'name', 'role'],
          }
        ]
      })
      const commentsCopy = JSON.parse(JSON.stringify(comments))
      tabContent.rows = authorParser(commentsCopy.rows)
      tabContent.count = commentsCopy.count
      tabContent.limit = limit
    }
    res.status(200).json(tabContent)
  } catch (err) {
    res.status(500).json({message: err})
  }
})


module.exports = router
