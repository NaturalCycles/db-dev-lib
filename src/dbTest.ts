import { CommonDB, DBQuery as DBQueryType } from '@naturalcycles/db-lib'
import { _pick } from '@naturalcycles/js-lib'
import { deepFreeze } from '@naturalcycles/test-lib'
import { toArray } from 'rxjs/operators'
import { TEST_TABLE, TestItem, testItems } from './model'

export async function testDB (db: CommonDB, DBQuery: typeof DBQueryType): Promise<void> {
  const items = testItems(3)
  deepFreeze(items)
  const [item1] = items

  const queryAll = () => new DBQuery<TestItem>(TEST_TABLE, 'all')

  // DELETE ALL initially
  let itemsLoaded = await db.runQuery(queryAll().select([]))
  await db.deleteByIds(TEST_TABLE, itemsLoaded.map(i => i.id))

  // QUERY empty

  expect(await db.runQuery(queryAll())).toEqual([])
  expect(await db.runQueryCount(queryAll())).toEqual(0)

  // GET empty

  const [item1Loaded] = await db.getByIds<TestItem>(TEST_TABLE, [item1.id])
  // console.log(a)
  expect(item1Loaded).toBeUndefined()

  expect(await db.getByIds(TEST_TABLE, [])).toEqual([])
  expect(await db.getByIds(TEST_TABLE, ['abc', 'abcd'])).toEqual([])

  // SAVE

  const itemsSaved = await db.saveBatch<TestItem>(TEST_TABLE, items)

  expect(itemsSaved).toEqual(items)

  // GET not empty

  itemsLoaded = await db.getByIds<TestItem>(TEST_TABLE, items.map(i => i.id).concat('abcd'))
  expect(itemsLoaded).toEqual(items)

  // QUERY
  itemsLoaded = await db.runQuery(queryAll())
  expect(itemsLoaded).toEqual(items)
  // console.log(itemsLoaded)

  let q = new DBQuery<TestItem>(TEST_TABLE, 'only even').filter('even', '=', true)
  itemsLoaded = await db.runQuery(q)
  expect(itemsLoaded).toEqual(items.filter(i => i.even))

  q = new DBQuery<TestItem>(TEST_TABLE, 'desc').order('id', true)
  itemsLoaded = await db.runQuery(q)
  expect(itemsLoaded).toEqual([...items].reverse())

  q = new DBQuery<TestItem>(TEST_TABLE).select([])
  itemsLoaded = await db.runQuery(q)
  expect(itemsLoaded).toEqual(items.map(item => _pick(item, ['id'])))

  expect(await db.runQueryCount(new DBQuery(TEST_TABLE))).toBe(3)

  // STREAM
  itemsLoaded = await db
    .streamQuery(queryAll())
    .pipe(toArray())
    .toPromise()
  expect(itemsLoaded).toEqual(items)

  // DELETE BY
  const idsDeleted = await db.deleteBy(TEST_TABLE, 'even', false)
  expect(idsDeleted).toEqual(items.filter(item => !item.even).map(item => item.id))

  expect(await db.runQueryCount(queryAll())).toBe(1)

  // CLEAN UP
  itemsLoaded = await db.runQuery(queryAll().select([]))
  await db.deleteByIds(TEST_TABLE, itemsLoaded.map(i => i.id))
}
