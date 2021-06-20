const express = require('express')
const multer = require('multer')
const Article = require('../models/article')
const User = require('../models/user')
const Organ = require('../models/organization')
const Publisher = require('../models/publisher')
const Comment = require('../models/comment')
const authorParser = require('../utils/authorParser')
const passport = require('passport')
const sequelize = require('sequelize')

const router = express.Router()

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, './uploads/newsPreviews')
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

const defineModel = (role) => {
  let Model
  switch (role) {
    case 1:
      Model = User;
      break;
    case 2:
      Model = Organ;
      break;
    case 3:
      Model = Publisher;
      break;
    default:
      console.log("error")
      break;
  }
  return Model
}

//Добавление новостной статьи
router.post('/', upload.single('mainImage'), passport.authenticate("jwt", {session: false}), async (req, res) => {
  try {
    const parsedData = JSON.parse(req.body.data)
    if (req.file) {
      parsedData.mainImageUrl = req.file.path
    }
    const article = await Article.create(parsedData)
      .catch(e => {
        res.status(404).json({message: e})
      })
    res.status(201).json(article)
  } catch (e) {
    res.status(500).json({message: e})
  }
})

//Получение новостной статьи
router.get('/:id', async (req, res) => {
  try {
    Article.hasMany(Comment)
    const id = req.params.id
    const article = await Article.findOne({
      where: {id},
      include: {
        model: Comment,
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
      }
    })
      .catch(e => {
        res.status(404).json({message: e})
      })
    const articleCopy = JSON.parse(JSON.stringify(article))
    articleCopy.Comments = authorParser(articleCopy.Comments)
    const authorModel = defineModel(article.authorRole)
    articleCopy.author = await authorModel.findOne(
      {
        where: {id: article.authorId},
        attributes: ['id', 'role', 'name']
      })
    res.status(200).json(articleCopy)
  } catch (e) {
    res.status(500).json({message: e})
  }
})

//Получение списках всех новостных статей
router.post('/all', async (req, res) => {
  try {
    const {page, search, types} = req.body
    const limit = 10
    const options = {
      where: {},
      attributes: {exclude: ['blocks']},
      order: [['updatedAt', 'DESC']],
      limit: limit,
      offset: (+page - 1) * limit,
      include: [
        {
          model: Publisher, attributes: ['id', 'name', 'logoUrl', 'role'],
        },
        {
          model: User, attributes: ['id', 'name', 'role', 'logoUrl'],
        },
        {
          model: Organ, attributes: ['id', 'name', 'role', 'logoUrl'],
        }
      ]
    }
    if (types.length) {
      options.where.authorRole = types.map(el => {
        if(el === 'Издательство') {
          return 3
        } else {
          return 2
        }
      })
    }
    if (search && search !== '') {
      options.where.title = sequelize.where(sequelize.fn('LOWER', sequelize.col('title')), 'LIKE', '%' + search + '%')
    }
    const allArticles = await Article.findAndCountAll(options).catch(
      e => {
        console.log("Error", e)
      }
    )
    const allArticlesCopy = JSON.parse(JSON.stringify(allArticles))
    allArticlesCopy.rows = authorParser(allArticlesCopy.rows)
    allArticlesCopy.limit = limit
    res.status(200).json(allArticlesCopy)
  } catch (err) {
    res.status(500).json({message: err})
  }
})

//Обновление новостной статьи
router.patch('/:id', upload.single('mainImage'), passport.authenticate("jwt", {session: false}), async (req, res) => {
  try {
    const id = req.params.id
    const parsedData = JSON.parse(req.body.data)
    if (req.file) {
      parsedData.mainImageUrl = req.file.path
    }
    const updatedArticle = await Article.update(parsedData, {
      where: {
        id
      }
    })
      .catch(e => {
        res.status(404).json({message: e})
      })
    res.status(201).json(updatedArticle)
  } catch (e) {
    res.status(500).json({message: e})
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const articleId = +req.params.id
    await Comment.destroy({where: {articleId: articleId}})
    await Article.destroy({where: {id: articleId}})
      .catch(e => {
        console.log(e)
      })
    res.status(200).json({message: 'Успех'})
  } catch (e) {
    res.status(500).json({message: e})
  }
})

module.exports = router
