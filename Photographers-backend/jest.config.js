module.exports = {
    testEnvironment: 'node',
    transform: {
      '^.+\\.js$': 'babel-jest'
    },
    // Force Jest to exit even if the server is still listening:
    forceExit: true,
    // (Optional) If you want to see which open handles are hanging:
    // detectOpenHandles: true,
  
    // (Optional) Turn off logging about "Server running on..."
    // by mocking console.log. We'll do that in setupFilesAfterEnv.
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js']
  };