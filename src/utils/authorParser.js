const authorParser = (arr) => {
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

module.exports = authorParser
