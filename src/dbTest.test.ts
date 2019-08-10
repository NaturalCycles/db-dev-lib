import { DBQuery, InMemoryDB } from '@naturalcycles/db-lib'
import { testDB } from './dbTest'

test('InMemory testDB', async () => {
  const db = new InMemoryDB()
  await testDB(db, DBQuery)
})
