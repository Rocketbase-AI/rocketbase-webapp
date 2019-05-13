import * as express from "express";
import * as session from "express-session";
import * as bodyParser from "body-parser";
import * as SessionFileStore from "session-file-store";
import * as next from "next";
import * as admin from "firebase-admin";

interface FirebaseRequest extends express.Request {
  firebaseServer?: admin.app.App;
}

const FileStore = SessionFileStore(session);
const port = parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const firebase = admin.initializeApp(
  {
    credential: admin.credential.applicationDefault(),
    databaseURL: "https://rockethub.firebaseio.com"
  },
  "server"
);

app.prepare().then(() => {
  const server = express();

  server.use(bodyParser.json());
  server.use(
    session({
      secret: "geheimnis",
      saveUninitialized: true,
      store: new FileStore({ path: "/tmp/sessions", secret: "geheimnis" }),
      resave: false,
      rolling: true,
      cookie: { httpOnly: true, maxAge: 604800000 } // week
    })
  );

  server.use((req: FirebaseRequest, _, next) => {
    req.firebaseServer = firebase;
    next();
  });

  server.post("/api/login", (req, res) => {
    if (!req.body) return res.sendStatus(400);

    const token = req.body.token;
    firebase
      .auth()
      .verifyIdToken(token)
      .then(decodedToken => {
        if (req.session) {
          req.session.decodedToken = decodedToken;
        }
        return decodedToken;
      })
      .then(decodedToken => res.json({ status: true, decodedToken }))
      .catch(error => res.json({ error }));
  });

  server.post("/api/logout", (req, res) => {
    if (req.session) {
      req.session.decodedToken = null;
    }
    res.json({ status: true });
  });

  server.get("*", (req, res) => {
    return handle(req, res);
  });

  server.listen(port, (err: any) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
