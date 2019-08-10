import { CommonDao, DBQuery, InMemoryDB } from '@naturalcycles/db-lib'
import { testDao } from './daoTest'
import { TEST_TABLE, testItemSchema } from './model'

test('InMemory testDao', async () => {
  const db = new InMemoryDB()
  const dao = new CommonDao({
    table: TEST_TABLE,
    db,
    bmSchema: testItemSchema,
    dbmSchema: testItemSchema,
  })

  await testDao(dao, DBQuery)
})
