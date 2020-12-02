let User = require("../models/user");
const TokenService = require("../tokenservice/tokenService");

let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../app");
let should = chai.should();

let token;

chai.use(chaiHttp);

describe("User", () => {
  before((done) => {
    User.destroy({
      where: {},
      truncate: true,
    }).then(() => {
      const hashPassword =
        "$2a$10$1XiMekHkSf4sQZYj5Jqg2er8xEcPjF8ziy26QSsT3V0kdv6tbHHia";
      let user = {
        name: "login",
        password: hashPassword,
      };
      User.create(user).then(() => done());
    });
  });
  /*
   * Test the /POST route
   */
  describe("/POST /auth/register", () => {
    it("it should registrate user by login and password", (done) => {
      let user = {
        name: "test",
        password: "test",
      };
      chai
        .request(server)
        .post("/auth/register")
        .set("content-type", "application/json")
        .send(user)
        .end((err, res) => {
          res.should.have.status(201);
          res.body.should.be.a("object");
          res.body.should.include.key("name");
          res.body.should.include.key("password");
          done();
        });
    });
  });

  describe("/POST /auth/login", () => {
    it("it should login user by login and password", (done) => {
      let user = {
        name: "login",
        password: "test",
      };
      chai
        .request(server)
        .post("/auth/login")
        .set("content-type", "application/json")
        .send(user)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("object");
          res.body.should.include.key("name");
          res.body.should.include.key("id");
          res.body.should.include.key("token");
          token = res.body.token;
          done();
        });
    });
  });

  describe("/POST /auth/logout", () => {
    it("it should logout user and delete token", (done) => {
      chai
        .request(server)
        .post("/auth/logout")
        .set("x-access-token", token)
        .end((err, res) => {
          res.should.have.status(204);
          done();
        });
    });
  });
});
