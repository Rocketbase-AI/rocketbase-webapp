import cookie from "js-cookie";
import nextCookie from "next-cookies";
import App, { Container } from "next/app";
import Head from "next/head";
import Router from "next/router";
import React from "react";
import Firebase, { FirebaseContext } from "../components/Firebase";
import { AuthUserContext } from "../components/Session";
import { LOG_IN } from "../constants/routes";

const firebase: any = new Firebase();

export const login = async (authUser: any) => {
  cookie.set("token", authUser, { expires: 1 });
  Router.push("/home");
};

interface MyAppProps {
  userData: any;
  user: any;
}

class MyApp extends App<MyAppProps, any> {
  static async getInitialProps({
    Component,
    ctx,
  }: {
    Component: any;
    ctx: any;
  }) {
    const req = ctx.req;
    const user = req && req.session ? req.session.decodedToken : null;
    const { token } = nextCookie(ctx);
    let userData = null;
    if (token) {
      userData = JSON.parse(token);
    }
    let pageProps = {};

    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx, firebase);
    }

    return { pageProps, userData, user };
  }

  constructor(props: any) {
    super(props);

    this.syncLogout = this.syncLogout.bind(this);
    this.state = {
      listener: null,
    };
  }

  componentDidMount() {
    const listener = firebase.onAuthUserListener(
      (authUser: any) => {
        login(JSON.stringify(authUser));
      },
      () => {
        // logout();
      },
    );
    this.setState({ listener });
    window.addEventListener("storage", this.syncLogout);
  }

  componentWillUnmount() {
    window.removeEventListener("storage", this.syncLogout);
    window.localStorage.removeItem("logout");
    this.state.listener();
  }

  syncLogout(event: any) {
    if (event.key === "logout") {
      console.log("logged out from storage!");
      Router.push(LOG_IN);
    }
  }

  render() {
    const { Component, pageProps, userData, user } = this.props;
    return (
      <Container>
        <Head>
          <title>RocketBase - Discover and deploy latest ML models</title>
        </Head>
        <FirebaseContext.Provider value={firebase}>
          <AuthUserContext.Provider value={userData}>
            <Component {...pageProps} user={user} />
          </AuthUserContext.Provider>
        </FirebaseContext.Provider>
      </Container>
    );
  }
}

export default MyApp;
