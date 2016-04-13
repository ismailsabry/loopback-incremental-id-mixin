
import app from 'loopback'

export default function createDataSource () {
  switch (process.env.DATASOURCE) {
    case 'mysql':
      return createMySQLDataSource()
    case 'memory':
    default:
      return createMemoryDataSource()
  }
}

function createMemoryDataSource () {
  return app.createDataSource({
    connector: app.Memory
  })
}

function createMySQLDataSource () {
  return app.createDataSource({
    connector: 'mysql',
    database: 'loopback-incremental-id-mixin',
    user: 'root'
  })
}
