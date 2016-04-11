
module.exports = (Model, options) => {
  options = {
    ...options,
    idField: 'id',
    start: 1,
    increment: (v) => parseInt(v, 10) + 1
  }

  Model.observe('before save', (ctx, next) => {
    // Do nothing on already created instance
    if (!ctx.isNewInstance || ctx.instance[options.idField]) {
      return next()
    }

    Model.findOne({
      fields: { [options.idField]: true },
      order: `${options.idField} DESC`
    })
      .then(record => {
        const nextId = record && options.increment(record[options.idField])
        ctx.instance[options.idField] = nextId || options.start
      })
      .then(_ => next())
      .catch(err => next(err))
  })
}
