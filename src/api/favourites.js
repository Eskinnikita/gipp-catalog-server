const express = require('express')
const UserPublication = require('../models/userPublications')
const Publication = require('../models/publication')
const router = express.Router()
const passport = require('passport')

//Добавление или удаление из избранного
router.post('/', passport.authenticate("jwt", {session: false}), async (req, res) => {
  try {
    const existedAssoc = await UserPublication.findOne({where: req.body})
    const favStatus = {}
    if (existedAssoc) {
      await UserPublication.destroy({where: req.body})
      favStatus.publication = existedAssoc
      favStatus.status = 'removed'
    } else {
      favStatus.publication = await UserPublication.create(req.body)
      favStatus.status = 'added'
    }
    res.status(200).json(favStatus)
  } catch (e) {
    res.status(500).json({message: e})
  }
})

//Получение списка избранного
router.post('/all', passport.authenticate("jwt", {session: false}), async (req, res) => {
  try {
    UserPublication.belongsTo(Publication, {foreignKey: 'publicationId'})
    const {id, role} = req.body
    const favourites = await UserPublication.findAndCountAll({
      where: {
        userId: id,
        userRole: role
      },
      include: {
        model: Publication,
        attributes: ['id', 'title', 'coverLink'],
      }
    })
    const favouritesPublications = {}
    favouritesPublications.count = favourites.count
    favouritesPublications.publications = []
    favourites.rows.forEach(el => {
      favouritesPublications.publications.push(el.Publication)
    })

    res.status(200).json(favouritesPublications)
  } catch (e) {
    res.status(500).json({message: e})
  }
})

module.exports = router
