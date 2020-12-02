const Redis = require("ioredis");
const jwt = require("jsonwebtoken");

const tokenKey = () => process.env.TOKEN_KEY;

class tokenService {
  constructor() {
    if (tokenService.instance) {
      return tokenService.instance;
    }
    tokenService.instance = this;
    this.client = new Redis();

    return this;
  }

  generateToken(obj) {
    let sign = jwt.sign(obj, tokenKey());
    return sign;
  }

  addToken(token, id) {
    this.client.set(token, String(id), "EX", 60 * 60 * 24);
  }

  deleteToken(token) {
    this.client.del(token);
  }

  async checkToken(token) {
    return await this.client.get(token);
  }
}

module.exports = new tokenService();
