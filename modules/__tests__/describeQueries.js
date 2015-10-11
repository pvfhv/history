/*eslint-env mocha */
import expect from 'expect'
import { PUSH, REPLACE, POP } from '../Actions'
import useQueries from '../useQueries'
import execSteps from './execSteps'

function stripHash(path) {
  return path.replace(/^#/, '')
}

function describeQueries(createHistory) {
  describe('query serialization', function () {
    let history, unlisten
    beforeEach(function () {
      history = useQueries(createHistory)({
        parseQueryString() {
          return 'PARSE_QUERY_STRING'
        },
        stringifyQuery() {
          return 'STRINGIFY_QUERY'
        }
      })
    })

    afterEach(function () {
      if (unlisten)
        unlisten()
    })

    describe('in pushState', function () {
      it('works', function (done) {
        let steps = [
          function (location) {
            expect(location.pathname).toEqual('/')
            expect(location.search).toEqual('')
            expect(location.query).toEqual('PARSE_QUERY_STRING')
            expect(location.state).toEqual(null)
            expect(location.action).toEqual(POP)

            history.pushState({ the: 'state' }, '/home', { the: 'query' })
          },
          function (location) {
            expect(location.pathname).toEqual('/home')
            expect(location.search).toEqual('?STRINGIFY_QUERY')
            expect(location.query).toEqual('PARSE_QUERY_STRING')
            expect(location.state).toEqual({ the: 'state' })
            expect(location.action).toEqual(PUSH)
          }
        ]

        unlisten = history.listen(execSteps(steps, done))
      })
    })

    describe('in replaceState', function () {
      it('works', function (done) {
        let steps = [
          function (location) {
            expect(location.pathname).toEqual('/')
            expect(location.search).toEqual('')
            expect(location.query).toEqual('PARSE_QUERY_STRING')
            expect(location.state).toEqual(null)
            expect(location.action).toEqual(POP)

            history.replaceState({ the: 'state' }, '/home', { the: 'query' })
          },
          function (location) {
            expect(location.pathname).toEqual('/home')
            expect(location.search).toEqual('?STRINGIFY_QUERY')
            expect(location.query).toEqual('PARSE_QUERY_STRING')
            expect(location.state).toEqual({ the: 'state' })
            expect(location.action).toEqual(REPLACE)
          }
        ]

        unlisten = history.listen(execSteps(steps, done))
      })
    })

    describe('in createPath', function () {
      it('works', function () {
        expect(
          history.createPath('/the/path', { the: 'query' })
        ).toEqual('/the/path?STRINGIFY_QUERY')
      })

      it('does not strip trailing slash', function () {
        expect(
          history.createPath('/the/path/', { the: 'query' })
        ).toEqual('/the/path/?STRINGIFY_QUERY')
      })

      describe('when the path contains a hash', function () {
        it('puts the query before the hash', function () {
          expect(
            history.createPath('/the/path#the-hash', { the: 'query' })
          ).toEqual('/the/path?STRINGIFY_QUERY#the-hash')
        })
      })
    })

    describe('in createHref', function () {
      it('works', function () {
        expect(
          stripHash(history.createHref('/the/path', { the: 'query' }))
        ).toEqual('/the/path?STRINGIFY_QUERY')
      })
    })
  })
}

export default describeQueries
