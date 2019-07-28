import { CommonDao, DBQuery } from '@naturalcycles/db-lib'
import { _pick } from '@naturalcycles/js-lib'
import { toArray } from 'rxjs/operators'
import { TEST_TABLE, TestItem, testItems } from './model'

export async function testDao (dao: CommonDao): Promise<void> {
  const items = testItems(3)
  const [item1] = items

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

  expect(itemsSaved).toEqual(items)

  // GET not empty

  itemsLoaded = await dao.getByIds(items.map(i => i.id).concat('abcd'))
  expect(itemsLoaded).toEqual(items)

  // QUERY
  itemsLoaded = await dao.runQuery(queryAll())
  expect(itemsLoaded).toEqual(items)
  // console.log(itemsLoaded)

  let q = new DBQuery<TestItem>(TEST_TABLE, 'only even').filter('even', '=', true)
  itemsLoaded = await dao.runQuery(q)
  expect(itemsLoaded).toEqual(items.filter(i => i.even))

  q = new DBQuery<TestItem>(TEST_TABLE, 'desc').order('id', true)
  itemsLoaded = await dao.runQuery(q)
  expect(itemsLoaded).toEqual([...items].reverse())

  q = new DBQuery<TestItem>(TEST_TABLE).select([])
  itemsLoaded = await dao.runQuery(q)
  expect(itemsLoaded).toEqual(items.map(item => _pick(item, ['id'])))

  expect(await dao.runQueryCount(new DBQuery(TEST_TABLE))).toBe(3)

  // STREAM
  itemsLoaded = await dao
    .streamQuery(queryAll())
    .pipe(toArray())
    .toPromise()
  expect(itemsLoaded).toEqual(items)

  // DELETE BY
  const idsDeleted = await dao.deleteBy('even', false)
  expect(idsDeleted).toEqual(items.filter(item => !item.even).map(item => item.id))

  expect(await dao.runQueryCount(queryAll())).toBe(1)

  // CLEAN UP
  itemsLoaded = await dao.runQuery(queryAll().select([]))
  await dao.deleteByIds(itemsLoaded.map(i => i.id))
}
