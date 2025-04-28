jest.spyOn(console, 'log').mockImplementation(() => {
    // This prevents that "Server running on http://localhost:5000"
    // log from appearing and from causing errors about logging after tests.
  });