const passport = require('passport')
const passportJWT = require('passport-jwt')
const extractJWT = passportJWT.ExtractJwt
const strategyJWT = passportJWT.Strategy
const User = require('../models/user')
const Publisher = require('../models/publisher')
const Organ = require('../models/organization')

passport.use(
  new strategyJWT(
    {
      jwtFromRequest: extractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET
    },
    async (jwtPayload, done) => {
      let userWithEmail
      await Promise.all([
        User.findOne({where: {id: jwtPayload.id, email: jwtPayload.email}}),
        Publisher.findOne({where: {id: jwtPayload.id, email: jwtPayload.email, approved: true}}),
        Organ.findOne({where: {id: jwtPayload.id, email: jwtPayload.email, approved: true}})
      ])
        .then((data) => {
          for (let i = 0; i < data.length; i++) {
            if (data[i] !== null) {
              userWithEmail = data[i].dataValues
              return done(null, userWithEmail)
            }
          }
        })
        .catch((e) => {
          return done(e)
        })
      // return User.findOne({where: {id: jwtPayload.id, email: jwtPayload.email}})
      //   .then((user) => {
      //     console.log(user)
      //     return done(null, user)
      //   })
      //   .catch((e) => {
      //     console.log('error')
      //     return done(e)
      //   })
    }
  )
)

// passport.use(
//   new strategyJWT(
//     {
//       jwtFromRequest: extractJWT.fromAuthHeaderAsBearerToken(),
//       secretOrKey: process.env.JWT_SECRET
//     },
//     (jwtPayload, done) => {
//       return User.findOne({where: {id: jwtPayload.id, email: jwtPayload.email}})
//         .then((user) => {
//           console.log(user)
//           return done(null, user)
//         })
//         .catch((e) => {
//           console.log('error')
//           return done(e)
//         })
//     }
//   )
// )


