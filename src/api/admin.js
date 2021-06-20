const express = require('express')
const sequelize = require('sequelize')
const Publication = require('../models/publication')
const User = require('../models/user')
const Organ = require('../models/organization')
const Review = require('../models/review')
const Publisher = require('../models/publisher')
const passport = require('passport')
const Article = require('../models/article')
const PubTag = require('../models/pubTag')
const authorParser = require('../utils/authorParser')

const router = express.Router()

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

//Получешние списка публикаций для администратора
router.post('/users/pubs/all', passport.authenticate("jwt", {session: false}), async (req, res) => {
    try {
        const {page, role, search} = req.body
        const Model = defineModel(+role)
        const limit = 10
        const options = {
            where: {
                approved: true,
                blocked: false
            },
            limit: limit,
            offset: (+page - 1) * limit,
        }

        if (search && search !== '') {
            options.where.name = sequelize.where(sequelize.fn('LOWER', sequelize.col('name')), 'LIKE', '%' + search + '%')
        }

        const approvedUsers = await Model.findAndCountAll(options).catch(
            e => {
                console.log("Error", e)
            }
        )
        const notApprovedUsers = await Model.findAll({where: {approved: false}}).catch(
            e => {
                console.log("Error", e)
            }
        )

        res.status(200).json({
            approved: approvedUsers,
            notApproved: notApprovedUsers,
            count: approvedUsers.count,
            limit: limit
        })
    } catch (err) {
        res.status(500).json({message: err})
    }
})

//Получешние списка пользователей для администратора
router.post('/users/users/all', passport.authenticate("jwt", {session: false}), async (req, res) => {
    try {
        const {page, search} = req.body
        const limit = 10
        const options = {
            where: {},
            limit: limit,
            offset: (+page - 1) * limit,
            order: [['name', 'ASC']]
        }
        if (search && search !== '') {
            options.where.name = sequelize.where(sequelize.fn('LOWER', sequelize.col('name')), 'LIKE', '%' + search + '%')
        }

        const users = await User.findAndCountAll(options).catch(
            e => {
                console.log("Error", e)
            }
        )
        const usersCopy = JSON.parse(JSON.stringify(users))
        usersCopy.limit = limit
        res.status(200).json(usersCopy)
    } catch (err) {
        res.status(500).json({message: err})
    }
})

//Получешние списка отзывов для администратора
router.post('/reviews/all', passport.authenticate("jwt", {session: false}), async (req, res) => {
    try {
        const {page} = req.body
        const limit = 10
        const options = {
            where: {
                approved: false
            },
            limit: limit,
            offset: (+page - 1) * limit,
            include: [
                {
                    model: Publisher, attributes: ['id', 'name', 'logoUrl', 'role'],
                },
                {
                    model: User, attributes: ['id', 'name', 'logoUrl', 'role'],
                },
                {
                    model: Organ, attributes: ['id', 'name', 'logoUrl', 'role'],
                },
                {
                    model: Publication, attributes: ['id', 'title']
                }
            ]
        }

        const reviews = await Review.findAndCountAll(options).catch(
            e => {
                console.log("Error", e)
            }
        )
        const reviewsCopy = JSON.parse(JSON.stringify(reviews))
        reviewsCopy.limit = limit
        res.status(200).json(reviewsCopy)
    } catch (err) {
        res.status(500).json({message: err})
    }
})

//Подтверждение отзыва
router.post('/reviews/confirm', passport.authenticate("jwt", {session: false}), async (req, res) => {
    try {
        const {id} = req.body
        const updatedReview = await Review.update({approved: true}, {
            where: {
                id
            }
        })
        res.status(200).json(updatedReview)
    } catch (err) {
        res.status(500).json({message: err})
    }
})

router.post('/reviews/deny', passport.authenticate("jwt", {session: false}), async (req, res) => {
    try {
        const {id} = req.body
        console.log(req.body)
        const reviewToDelete = await Review.findOne({where: {id}})
        await Review.destroy({where: {id}})
        res.status(200).json(reviewToDelete)
    } catch (err) {
        res.status(500).json({message: err})
    }
})

router.post('/articles/all', passport.authenticate("jwt", {session: false}), async (req, res) => {
    try {
        const {page, search} = req.body
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
                    model: User, attributes: ['id', 'name', 'logoUrl', 'role'],
                },
                {
                    model: Organ, attributes: ['id', 'name','logoUrl',  'role'],
                }
            ]
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

router.post('/tags/all', passport.authenticate("jwt", {session: false}), async (req, res) => {
    try {
        const {page, search} = req.body
        const limit = 15
        const options = {
            where: {},
            limit: limit,
            offset: (+page - 1) * limit,
            order: [['tag', 'ASC']]
        }
        if (search && search !== '') {
            options.where.tag = sequelize.where(sequelize.fn('LOWER', sequelize.col('tag')), 'LIKE', '%' + search + '%')
        }

        const tags = await PubTag.findAndCountAll(options).catch(
            e => {
                console.log("Error", e)
            }
        )
        const tagsCopy = JSON.parse(JSON.stringify(tags))
        tagsCopy.limit = limit
        res.status(200).json(tagsCopy)
    } catch (err) {
        res.status(500).json({message: err})
    }
})


module.exports = router
