/* global describe, it */

import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
chai.use(chaiAsPromised)

const {expect} = chai

import app from 'loopback'
import IncrementalIdMixin from '../src/incremental-id'

// Declare mixin
app.modelBuilder.mixins.define('IncrementalId', IncrementalIdMixin)

const createModel = (options = {}) => {
  // Create memory datasource
  const dataSource = app.createDataSource({
    connector: app.Memory
  })

  const Book = dataSource.createModel('Book',
    { name: String, type: String },
    { mixins: { IncrementalId: options } }
  )

  return Book
}

const createBook = (options, data) => {
  return createModel(options).create({
    ...data,
    name: 'vi and Vim'
  })
    .then(record => record.iid)
}

describe('Incremental ID', _ => {
  describe('options.createColumn', _ => {
    it('Should create the column by default', () => {
      const Model = createModel()
      expect(Model.definition.rawProperties).to.have.property('iid')
      expect(Model.definition.rawProperties.iid).to.deep.equal({
        type: 'number',
        required: true,
        index: {
          'unique': true
        }
      })
    })
    it('Should create the column with another name', () => {
      const Model = createModel({ idField: 'foo' })
      expect(Model.definition.rawProperties).to.have.property('foo')
      expect(Model.definition.rawProperties.foo).to.deep.equal({
        type: 'number',
        required: true,
        index: {
          'unique': true
        }
      })
    })
    it('Should not create the column if disabled', () => {
      const Model = createModel({
        createColumn: false
      })
      expect(Model.definition.rawProperties).to.not.have.property('iid')
    })
  })

  describe('Model.create', _ => {
    it('should begin at 1 if no existing record', () => {
      return expect(createBook()).to.eventually.equal(1)
    })
    it('should begin at `start` option', () => {
      return expect(createBook({
        start: 99
      })).to.eventually.equal(99)
    })
    it('should not use `increment` option if no existing record', () => {
      return expect(createBook({
        increment: v => 50
      })).to.eventually.equal(1)
    })
    it('should increment 1 of the latest record', () => {
      const Book = createModel()

      return expect(
        Book.create({ name: 'foo' })
          .then(_ => Book.create({ name: 'foo' }))
          .then(_ => Book.create({ name: 'foo' }))
          .then(record => record.iid)
      ).to.eventually.equal(3)
    })
    it('should use `increment` option', () => {
      const Book = createModel({
        increment: v => parseInt(v, 10) + 10
      })

      return expect(
        Book.create({ name: 'foo' })
          .then(_ => Book.create({ name: 'foo' }))
          .then(_ => Book.create({ name: 'foo' }))
          .then(record => record.iid)
      ).to.eventually.equal(21)
    })
  })
  describe('Model.update', _ => {
    it('should not use the mixin', () => {
      const Book = createModel()

      return expect(
        Book.create({ name: 'foo' })
          .then(record => {
            record.name = 'bar'
            return record.save()
          })
          .then(record => record.iid)
      ).to.eventually.equal(1)
    })
  })
})
