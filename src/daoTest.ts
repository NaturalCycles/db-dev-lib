import { CommonDao, DBQuery as DBQueryType } from '@naturalcycles/db-lib'
import { _pick, _sortBy } from '@naturalcycles/js-lib'
import { deepFreeze } from '@naturalcycles/test-lib'
import { toArray } from 'rxjs/operators'
import { TEST_TABLE, TestItem, testItems } from './model'

export async function testDao (dao: CommonDao<any>, DBQuery: typeof DBQueryType): Promise<void> {
  const items = testItems(3)
  deepFreeze(items)
  const [item1] = items

  const expectedItems = items.map(i => ({
    ...i,
    updated: expect.any(Number),
  }))

  const queryAll = () => new DBQuery<TestItem>(TEST_TABLE, 'all')

  // DELETE ALL initially
  let itemsLoaded = await dao.runQuery(queryAll())
  await dao.deleteByIds(itemsLoaded.map(i => i.id))

  // QUERY empty

  expect(await dao.runQuery(queryAll())).toEqual([])
  expect(await dao.runQueryCount(queryAll())).toEqual(0)

  // GET empty

  const item1Loaded = await dao.getById(item1.id)
  // console.log(a)
  expect(item1Loaded).toBeUndefined()

  expect(await dao.getByIds([])).toEqual([])
  expect(await dao.getByIds(['abc', 'abcd'])).toEqual([])

  // SAVE

  const itemsSaved = await dao.saveBatch(items)

  expect(itemsSaved).toEqual(expectedItems)

  // GET not empty

  itemsLoaded = await dao.getByIds(items.map(i => i.id).concat('abcd'))
  expect(itemsLoaded).toEqual(expectedItems)

  // QUERY
  itemsLoaded = await dao.runQuery(queryAll())
  expect(_sortBy(itemsLoaded, 'id')).toEqual(expectedItems)
  // console.log(itemsLoaded)

  let q = new DBQuery<TestItem>(TEST_TABLE, 'only even').filter('even', '=', true)
  itemsLoaded = await dao.runQuery(q)
  expect(_sortBy(itemsLoaded, 'id')).toEqual(expectedItems.filter(i => i.even))

  q = new DBQuery<TestItem>(TEST_TABLE, 'desc').order('id', true)
  itemsLoaded = await dao.runQuery(q)
  expect(itemsLoaded).toEqual([...expectedItems].reverse())

  q = new DBQuery<TestItem>(TEST_TABLE).select([])
  itemsLoaded = await dao.runQuery(q)
  expect(_sortBy(itemsLoaded, 'id')).toEqual(expectedItems.map(item => _pick(item, ['id'])))

  expect(await dao.runQueryCount(new DBQuery(TEST_TABLE))).toBe(3)

  // STREAM
  itemsLoaded = await dao
    .streamQuery(queryAll())
    .pipe(toArray())
    .toPromise()
  expect(_sortBy(itemsLoaded, 'id')).toEqual(expectedItems)

  // DELETE BY
  q = new DBQuery<TestItem>(TEST_TABLE).filter('even', '=', false)
  const deleted = await dao.deleteByQuery(q)
  expect(deleted).toBe(expectedItems.filter(item => !item.even).length)

  expect(await dao.runQueryCount(queryAll())).toBe(1)

  // CLEAN UP
  itemsLoaded = await dao.runQuery(queryAll().select([]))
  await dao.deleteByIds(itemsLoaded.map(i => i.id))
}
