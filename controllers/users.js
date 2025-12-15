// Simple user controller stubs. No User model currently present.
module.exports = {
  showRegister: (req, res) => {
    // Render a register form if you add one later
    res.send('register form (not implemented)');
  },
  register: (req, res) => {
    res.send('register (not implemented)');
  },
  showLogin: (req, res) => {
    res.send('login form (not implemented)');
  },
  login: (req, res) => {
    res.send('login (not implemented)');
  },
  logout: (req, res) => {
    res.send('logout (not implemented)');
  }
};
