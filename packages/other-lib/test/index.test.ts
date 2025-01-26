/// <reference types="vitest/globals" />

import { bar } from '../src/index.js'

it('should call bar', () => {
  expect(bar()).toBe('Hello bar!')
})
