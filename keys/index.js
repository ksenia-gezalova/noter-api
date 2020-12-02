if (process.env.NODE_ENV === "production") {
  module.exports = require("./keys.prod");
} else if (process.env.NODE_ENV === "dev") {
  module.exports = require("./keys.dev");
} else {
  module.exports = require("./keys.test");
}
