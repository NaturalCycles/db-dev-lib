import { CommonDao, DBQuery, InMemoryDB } from '@naturalcycles/db-lib'
import { testDao } from './daoTest'
import { TEST_TABLE, testItemUnsavedSchema } from './model'

test('InMemory testDao', async () => {
  const db = new InMemoryDB()
  const dao = new CommonDao({
    table: TEST_TABLE,
    db,
    bmUnsavedSchema: testItemUnsavedSchema,
    dbmUnsavedSchema: testItemUnsavedSchema,
  })

  await testDao(dao, DBQuery)
})
