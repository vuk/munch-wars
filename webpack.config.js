const path = require('path');

const DIST_DIR = path.join(__dirname, 'dist'),
  CLIENT_DIR = path.join(__dirname, 'app')

module.exports = {
  context: CLIENT_DIR,

  entry: './main',

  output: {
    path: DIST_DIR,
    filename: 'bundle.js'
  },

  resolve: {
    extensions: ['', '.js']
  }
}