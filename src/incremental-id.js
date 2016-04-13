
module.exports = (Model, options) => {
  options = {
    idField: 'id',
    start: 1,
    increment: v => parseInt(v, 10) + 1,
    ...options
  }

  function findNextId () {
    return Model.findOne({
      fields: { [options.idField]: true },
      order: `${options.idField} DESC`
    })
      .then(record => {
        const nextId = record && record[options.idField]
        return (nextId && options.increment(nextId)) || options.start
      })
  }

  Model.observe('before save', (ctx, next) => {
    // Do nothing on already created instance
    if (!ctx.isNewInstance || ctx.instance[options.idField]) {
      return next()
    }

    findNextId()
      .then(id => {
        ctx.instance[options.idField] = id
      })
      .then(_ => next())
      .catch(next)
  })
}
