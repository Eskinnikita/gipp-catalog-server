const express = require('express')
const sequelize = require('sequelize')
const Publication = require('../models/publication')
const Article = require('../models/article')
const Publisher = require('../models/publisher')
const User = require('../models/user')
const Organ = require('../models/organization')
const passport = require('passport')
const {Op} = require('sequelize')
const PublicationTags = require('../models/publicationTags')

const router = express.Router()

//Получение изданий для каталога
router.post('/all', async (req, res) => {
  try {
    Publication.hasMany(PublicationTags)
    const {page, age, types, tags, search} = req.body
    const limit = 16
    const options = {
      where: {},
      limit: limit,
      offset: (+page - 1) * limit,
      order: [['createdAt', 'DESC']],
    }
    if(tags.length) {
      options.include = [
        {
          model: PublicationTags,
          required: true,
          where: {
            pubTagId: {
              [Op.in]: tags
            }
          }
        }
      ]
    }
    if (types.length) {
      options.where.type = types
    }
    if (age.length) {
      options.where.age = age
    }
    if (search && search !== '') {
      options.where.name = sequelize.where(sequelize.fn('LOWER', sequelize.col('title')), 'LIKE', '%' + search + '%')
    }
    const allPublications = await Publication.findAndCountAll(options).catch(
      e => {
        console.log("Error", e)
      }
    )
    allPublications.limit = limit
    // console.log(JSON.parse(JSON.stringify(allPublications)))
    res.status(200).json(allPublications)
  } catch (err) {
    res.status(500).json({message: err})
  }
})

//Получение данных для глобального поиска
router.post('/search', async (req, res) => {
  try {
    Publication.belongsTo(Publisher)
    const search = req.body.search
    if (search !== '') {

      const limit = 4
      const searchResults = {}
      searchResults.publications = await Publication.findAll({
        where: {
          name: sequelize.where(sequelize.fn('LOWER', sequelize.col('title')), 'LIKE', '%' + search + '%')
        },
        attributes: ['id', 'title', 'coverLink'],
        include: {
          model: Publisher,
          attributes: ['id', 'name', 'role']
        },
        limit: limit
      })
      searchResults.news = await Article.findAll({
        where: {
          name: sequelize.where(sequelize.fn('LOWER', sequelize.col('title')), 'LIKE', '%' + search + '%')
        },
        include: [
          {
            model: Publisher, attributes: ['id', 'name', 'role'],
          },
          {
            model: User, attributes: ['id', 'name', 'role'],
          },
          {
            model: Organ, attributes: ['id', 'name', 'role'],
          },
        ],
        attributes: {exclude: ['blocks', 'mainImageUrl']},
        limit: limit
      })
      searchResults.news = parseAuthor(JSON.parse(JSON.stringify(searchResults.news)))
      res.status(200).json(searchResults)
    } else {
      res.status(200).json({})
    }
  } catch (err) {
    res.status(500).json({message: err})
  }
})

const parseAuthor = (arr) => {
  const roles = ['User', 'Publisher', 'Organ']
  arr.forEach(el => {
    roles.forEach(role => {
      if (el[role] !== null) {
        if (el.hasOwnProperty(role) && el[role] && el[role].role === el.authorRole) {
          el.author = el[role]
          delete el[role]
        }
        delete el[role]
      }
    })
  })
  return arr
}


module.exports = router
