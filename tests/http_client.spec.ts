/*
 * @jeftelabs/oauth-client
 *
 * (c) Jeftelabs
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import nock from 'nock'
import { test } from '@t8ngs/runner'
import { HttpClient } from '../src/http_client.ts'

test.group('HttpClient', () => {
  test('make post request', async ({ assert }) => {
    nock('https://www.foo.com')
      .post('/request')
      .reply(function () {
        return [200, 'Handled']
      })

    const client = new HttpClient('https://www.foo.com/request')
    const response = await client.post()
    assert.equal(response, 'Handled')
  })

  test('send request body in POST request', async ({ assert }) => {
    assert.plan(2)

    nock('https://www.foo.com')
      .post('/request')
      .reply(function (_, body) {
        assert.deepEqual(body, 'username=jefte')
        return [200, 'Handled']
      })

    const client = new HttpClient('https://www.foo.com/request')
    client.field('username', 'jefte')

    const response = await client.post()
    assert.equal(response, 'Handled')
  })

  test('send request body as json', async ({ assert }) => {
    assert.plan(2)

    nock('https://www.foo.com')
      .post('/request')
      .reply(function (_, body) {
        assert.deepEqual(body, { username: 'jefte' })
        return [200, 'Handled']
      })

    const client = new HttpClient('https://www.foo.com/request')
    client.field('username', 'jefte')
    client.sendAs('json')

    const response = await client.post()
    assert.equal(response, 'Handled')
  })

  test('clear request body', async ({ assert }) => {
    assert.plan(2)

    nock('https://www.foo.com')
      .post('/request')
      .reply(function (_, body) {
        assert.deepEqual(body, '')
        return [200, 'Handled']
      })

    const client = new HttpClient('https://www.foo.com/request')
    client.field('username', 'jefte')
    client.clearField('username')

    const response = await client.post()
    assert.equal(response, 'Handled')
  })

  test('send headers', async ({ assert }) => {
    assert.plan(2)

    nock('https://www.foo.com')
      .post('/request')
      .reply(function () {
        assert.equal(this.req.headers.authorization, 'Bearer foo=bar')
        return [200, 'Handled']
      })

    const client = new HttpClient('https://www.foo.com/request')
    client.header('Authorization', 'Bearer foo=bar')

    const response = await client.post()
    assert.equal(response, 'Handled')
  })

  test('clear headers', async ({ assert }) => {
    assert.plan(2)

    nock('https://www.foo.com')
      .post('/request')
      .reply(function () {
        assert.isUndefined(this.req.headers.authorization)
        return [200, 'Handled']
      })

    const client = new HttpClient('https://www.foo.com/request')
    client.header('Authorization', 'Bearer foo=bar')
    client.clearHeader('Authorization')

    const response = await client.post()
    assert.equal(response, 'Handled')
  })

  test('send query params', async ({ assert }) => {
    assert.plan(1)

    nock('https://www.foo.com')
      .post('/request')
      .query(() => {
        return true
      })
      .reply(function (uri) {
        assert.equal(uri, '/request?foo=bar')
        return [200, 'Handled']
      })

    const client = new HttpClient('https://www.foo.com/request')
    client.param('foo', 'bar')

    await client.post()
  })

  test('clear query params', async ({ assert }) => {
    assert.plan(1)

    nock('https://www.foo.com')
      .post('/request')
      .query(() => {
        return true
      })
      .reply(function (uri) {
        assert.equal(uri, '/request')
        return [200, 'Handled']
      })

    const client = new HttpClient('https://www.foo.com/request')
    client.param('foo', 'bar')
    client.clearParam('foo')

    await client.post()
  })

  test('do not send oauth1 params in request query string', async ({ assert }) => {
    assert.plan(1)

    nock('https://www.foo.com')
      .post('/request')
      .query(() => {
        return true
      })
      .reply(function (uri) {
        assert.equal(uri, '/request')
        return [200, 'Handled']
      })

    const client = new HttpClient('https://www.foo.com/request')
    client.oauth1Param('foo', 'bar')

    await client.post()
  })

  test('parse response as json', async ({ assert }) => {
    assert.plan(2)

    nock('https://www.foo.com')
      .post('/request')
      .reply(function (_, body) {
        assert.deepEqual(body, { username: 'jefte' })
        return [200, { username: 'jefte' }]
      })

    const client = new HttpClient('https://www.foo.com/request')
    client.field('username', 'jefte')
    client.sendAs('json')
    client.parseAs('json')

    const response = await client.post()
    assert.deepEqual(response, { username: 'jefte' })
  })

  test('get response as text', async ({ assert }) => {
    nock('https://www.foo.com')
      .get('/request')
      .reply(function () {
        return [200, 'Handled']
      })

    const client = new HttpClient('https://www.foo.com/request')
    const response = await client.parseAs('text').get()
    assert.equal(response, 'Handled')
  })

  test('clear oauth1Param', async ({ assert }) => {
    const client = new HttpClient('https://www.foo.com/request')
    client.oauth1Param('foo', 'bar')
    client.clearOauth1Param('foo')
    assert.deepEqual(client.getOauth1Params(), {})
  })

  test('reset client state', async ({ assert }) => {
    const client = new HttpClient('https://www.foo.com/request')
    client.field('username', 'jefte')
    client.param('foo', 'bar')
    client.oauth1Param('foo', 'bar')
    client.header('Authorization', 'foo')

    client.clear()

    assert.deepEqual(client.getFields(), {})
    assert.deepEqual(client.getHeaders(), {})
    assert.deepEqual(client.getParams(), {})
    assert.deepEqual(client.getOauth1Params(), {})
  })
})
