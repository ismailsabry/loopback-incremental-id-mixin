'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

module.exports = function (Model, options) {
  options = _extends({
    idField: 'iid',
    createColumn: true,
    start: 1,
    increment: function increment(v) {
      return parseInt(v, 10) + 1;
    }
  }, options);

  if (options.createColumn) {
    Model.defineProperty(options.idField, {
      type: 'number',
      index: {
        'unique': true
      }
    });
  }

  function findNextId() {
    return Model.findOne({
      fields: _defineProperty({}, options.idField, true),
      order: options.idField + ' DESC'
    }).then(function (record) {
      var nextId = record && record[options.idField];
      return nextId && options.increment(nextId) || options.start;
    });
  }

  Model.observe('before save', function (ctx, next) {
    // Do nothing on already created instance
    if (!ctx.isNewInstance || ctx.instance[options.idField]) {
      return next();
    }

    findNextId().then(function (id) {
      ctx.instance[options.idField] = id;
    }).then(function (_) {
      return next();
    }).catch(next);
  });
};