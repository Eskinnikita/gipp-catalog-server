const express = require("express");
const router = express.Router();

const authApi = require("./auth")
const usersApi = require("./users")
const publicationsApi = require("./publications")
const publisherApi = require("./publisher")
const tagsApi = require("./pubTags")
const catalogApi = require("./catalog")
const adminApi = require('./admin')
const reviewsApi = require('./reviews')
const filesApi = require('./files')
const articlesApi = require('./articles')
const profileApi = require('./profile')
const organizationsApi = require('./organizations')
const favouritesApi = require('./favourites')
const commentsApi = require('./comments')

router.use(authApi)
router.use('/users', usersApi)
router.use('/publication', publicationsApi)
router.use('/publisher', publisherApi)
router.use('/tags', tagsApi)
router.use('/catalog', catalogApi)
router.use('/admin', adminApi)
router.use('/reviews', reviewsApi)
router.use('/files', filesApi)
router.use('/articles', articlesApi)
router.use('/profile', profileApi)
router.use('/organs', organizationsApi)
router.use('/favourites', favouritesApi)
router.use('/comments', commentsApi)

module.exports = router;
