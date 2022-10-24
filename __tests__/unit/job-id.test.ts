import {JobId, nullJobId} from '../../src/job-id'

describe('JobId', () => {
  it('should fail when using invalid job value', () => {
    const negativeJobId = (): JobId => {
      return new JobId(-2)
    }
    const NaNJobId = (): JobId => {
      return new JobId(NaN)
    }
    const zeroJobId = (): JobId => {
      return new JobId(0)
    }

    expect(negativeJobId).toThrow()
    expect(NaNJobId).toThrow()
    expect(zeroJobId).not.toThrow()
  })

  it('should compare two JobIds', () => {
    const jobId1 = new JobId(42)
    const jobId2 = new JobId(43)
    const jobId3 = new JobId(42)

    expect(jobId1.equalsTo(jobId2)).toBe(false)
    expect(jobId1.equalsTo(jobId3)).toBe(true)
  })

  it('should be nullable', () => {
    const nullObject = nullJobId()

    expect(nullObject.isNull()).toBe(true)
  })

  it('should return a consecutive JobId', () => {
    const jobId = new JobId(42)

    expect(jobId.getNextConsecutiveJobId().equalsTo(new JobId(43))).toBe(true)
  })
})
