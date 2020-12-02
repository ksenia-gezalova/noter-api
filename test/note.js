let Note = require("../models/note");
let User = require("../models/user");
const TokenService = require("../tokenservice/tokenService");

let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../app");
let should = chai.should();

let token;

chai.use(chaiHttp);
describe("Notes", () => {
  before((done) => {
    User.destroy({
      where: {},
      truncate: true,
    }).then(() =>
      Note.destroy({
        where: {},
        truncate: true,
      }).then(() => {
        const hashPassword =
          "$2a$10$1XiMekHkSf4sQZYj5Jqg2er8xEcPjF8ziy26QSsT3V0kdv6tbHHia";
        let user = {
          name: "login",
          password: hashPassword,
        };
        User.create(user).then(() => {
          chai
            .request(server)
            .post("/auth/login")
            .set("content-type", "application/json")
            .send({ name: "login", password: "test" })
            .end((err, res) => {
              token = res.body.token;
              done();
            });
        });
      })
    );
  });
  /*
   * Test the /GET route
   */
  describe("/GET /note/all", () => {
    it("it should GET all the notes", (done) => {
      chai
        .request(server)
        .get("/note/all?limit=10&offset=0")
        .set("token", token)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("object");
          res.body.should.include.key("notes");
          res.body.should.include.key("total");
          done();
        });
    });
  });

  describe("/POST /note/create", () => {
    it("it should create new note", (done) => {
      let note = {
        title: "test",
        text: "test",
      };
      chai
        .request(server)
        .post("/note/create")
        .set("token", token)
        .send(note)
        .end((err, res) => {
          res.should.have.status(201);
          res.body.should.be.a("object");
          res.body.should.include.key("title");
          res.body.should.include.key("text");
          res.body.should.include.key("userId");
          done();
        });
    });
  });
});
