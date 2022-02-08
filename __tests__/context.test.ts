import * as context from '../src/context'
import * as os from 'os'

describe('setOutput', () => {
  beforeEach(() => {
    process.stdout.write = jest.fn()
  })

  it('setOutput produces the correct command', () => {
    context.setOutput('some output', 'some value')
    /* eslint-disable @typescript-eslint/unbound-method */
    expect(process.stdout.write).toHaveBeenCalledWith(
      `::set-output name=some output::some value${os.EOL}`
    )
    /* eslint-enable */
  })

  it('setOutput handles bools', () => {
    context.setOutput('some output', false)
    /* eslint-disable @typescript-eslint/unbound-method */
    expect(process.stdout.write).toHaveBeenCalledWith(
      `::set-output name=some output::false${os.EOL}`
    )
    /* eslint-enable */
  })

  it('setOutput handles numbers', () => {
    context.setOutput('some output', 1.01)
    /* eslint-disable @typescript-eslint/unbound-method */
    expect(process.stdout.write).toHaveBeenCalledWith(
      `::set-output name=some output::1.01${os.EOL}`
    )
    /* eslint-enable */
  })
})
