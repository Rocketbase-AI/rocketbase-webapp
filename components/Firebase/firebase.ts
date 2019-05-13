import * as firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import fetch from "isomorphic-unfetch";
import cookie from "js-cookie";
import Router from "next/router";
import * as ROUTES from "../../constants/routes";
import clientCredentials from "../../credentials/client";

class Firebase {
  auth: firebase.auth.Auth;
  db: any;
  googleProvider: any;
  confirmationRedirectUrl: string | undefined;
  constructor() {
    if (!firebase.apps.length) {
      firebase.initializeApp(clientCredentials);
    }

    /* Firebase APIs */

    this.auth = firebase.auth();
    this.db = firebase.firestore();
    this.confirmationRedirectUrl =
      process.env.REACT_APP_CONFIRMATION_EMAIL_REDIRECT;

    /* Social Sign In Method Provider */

    this.googleProvider = new firebase.auth.GoogleAuthProvider();
  }

  // *** Auth API ***

  doCreateUserWithEmailAndPassword = (email: string, password: string) =>
    this.auth.createUserWithEmailAndPassword(email, password);

  doSignInWithEmailAndPassword = (email: string, password: string) => {
    Router.push("/home");
    return this.auth.signInWithEmailAndPassword(email, password);
  };

  doSignInWithGoogle = () => this.auth.signInWithPopup(this.googleProvider);

  doSignOut = () => {
    cookie.remove("token");
    // to support logging out from all windows
    window.localStorage.setItem("logout", Date.now().toString());
    Router.push(ROUTES.LANDING);
    return this.auth.signOut();
  };

  doPasswordReset = (email: string) => this.auth.sendPasswordResetEmail(email);

  doSendEmailVerification = () => {
    if (this.auth.currentUser && this.confirmationRedirectUrl) {
      this.auth.currentUser.sendEmailVerification({
        url: this.confirmationRedirectUrl,
      });
    }
  };

  doPasswordUpdate = (password: string) => {
    if (this.auth.currentUser) {
      this.auth.currentUser.updatePassword(password);
    }
  };

  // *** Merge Auth and DB User API *** //

  onAuthUserListener = (next: any, fallback: any) =>
    this.auth.onAuthStateChanged((authUser: any) => {
      if (authUser) {
        this.user(authUser.uid)
          .get()
          .then((snapshot: any) => {
            const dbUser = snapshot.data();

            // default empty roles
            if (!dbUser.roles) {
              dbUser.roles = [];
            }

            // merge auth and db user
            authUser = {
              email: authUser.email,
              emailVerified: authUser.emailVerified,
              providerData: authUser.providerData,
              uid: authUser.uid,
              ...dbUser,
            };

            next(authUser);
          });
        return authUser
          .getIdToken()
          .then((token: string) => {
            return fetch("/api/login", {
              body: JSON.stringify({ token }),
              credentials: "same-origin",
              headers: new Headers({ "Content-Type": "application/json" }),
              method: "POST",
            });
          })
          .then((res: any) => console.log(res));
      } else {
        fetch("/api/logout", {
          credentials: "same-origin",
          method: "POST",
        }).then((res: any) => console.log(res));
        fallback();
      }
    });

  // *** User API ***

  user = (uid: string) => this.db.collection("users").doc(uid);

  users = () => this.db.collection("users");

  // *** Rockets API ***

  model = async (uid: string) =>
    this.db
      .collection("rockets")
      .doc(uid)
      .get();

  models = async () => {
    const snapshot: firebase.firestore.QuerySnapshot = await this.db
      .collection("rockets")
      .where("isPrivate", "==", false)
      .get();
    // const fetchModels = async () => {
    //   const models: any[] = [];
    //   await Promise.all(
    //     snapshot.docs.map(async (doc: any) => {
    //       if (doc.exists) {
    //         const modelData = doc.data();
    //         const modelStorageRef = this.storage.ref(modelData.modelFilePath);
    //         const modelDownloadUrl = await modelStorageRef.toString();
    //         modelData.modelDownloadUrl = modelDownloadUrl;
    //         models.push(modelData);
    //       }
    //     }),
    //   );
    //   return models;
    // };
    // const fetchedModels = fetchModels();
    const fetchedModels = snapshot.docs.map(
      (doc: firebase.firestore.QueryDocumentSnapshot) => {
        const fetchedModel = doc.data();
        fetchedModel.id = doc.id;
        return fetchedModel;
      },
    );
    return fetchedModels;
  };

  // *** Helper functions ***
}

export default Firebase;
