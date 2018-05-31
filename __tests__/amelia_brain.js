describe('Validate MainBrain', () => {
  const expected = {
    'affective': [],
    'analytic': [],
    'process': [],
    'semantic': [],
    'episodic': []
  }

  it('Ready to write test cases', () => {
    expect({ affective: []}).toEqual(expect.not.objectContaining(expected))
  })
})
