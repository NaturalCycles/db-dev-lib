import { BaseDBEntity, Unsaved, unsavedDBEntitySchema } from '@naturalcycles/db-lib'
import { _range } from '@naturalcycles/js-lib'
import { booleanSchema, numberSchema, objectSchema, stringSchema } from '@naturalcycles/nodejs-lib'
import { MOCK_TS_2018_06_21 } from '@naturalcycles/test-lib'

export const TEST_TABLE = 'TEST_TABLE'

export interface TestItem extends BaseDBEntity {
  k1: string
  k2?: string
  k3?: number
  even?: boolean
}

export const testItemUnsavedSchema = objectSchema<Unsaved<TestItem>>({
  k1: stringSchema,
  k2: stringSchema.optional(),
  k3: numberSchema.optional(),
  even: booleanSchema.optional(),
}).concat(unsavedDBEntitySchema)

export function testItem (num = 1): TestItem {
  return {
    id: `id${num}`,
    k1: `v${num}`,
    k2: `v${num * 2}`,
    k3: num,
    even: num % 2 === 0,
    created: MOCK_TS_2018_06_21,
    updated: MOCK_TS_2018_06_21,
  }
}

export function testItems (count = 1): TestItem[] {
  return _range(1, count + 1).map(num => testItem(num))
}
