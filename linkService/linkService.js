const Redis = require("ioredis");

class linkService {
  constructor() {
    if (linkService.instance) {
      return linkService.instance;
    }
    linkService.instance = this;
    this.client = new Redis();

    return this;
  }

  generateLink(id) {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15) +
      "$p_" +
      id
    );
  }

  addLink(link, id) {
    this.client.set(link, String(id), "EX", 60 * 60 * 24 * 7);
  }

  async checkLink(link) {
    return await this.client.get(link);
  }
}

module.exports = new linkService();
