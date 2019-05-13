import Head from "next/head";
import Link from "next/link";
import React, { Component } from "react";
import ReactGA from "react-ga";
import RocketLayout from "../components/RocketLayout";
import { EXTERNAL_DOCS } from "../constants/routes";

class RocketPage extends Component<any, any> {
  static async getInitialProps(context: any, firebase: any) {
    const { id } = context.query;
    const rocketSnapshot = await firebase.model(id);
    const rocketData = await rocketSnapshot.data();
    ReactGA.pageview("/rocket?id=" + rocketData.id);
    return { rocket: rocketData };
  }

  clipString = (longString: string, limit: number) => {
    return longString.length < limit
      ? longString
      : longString.substring(0, limit) + "...";
  };

  camelCase = (origString: string, separator: string) => {
    let re;
    switch (separator) {
      case "_":
        re = /_/gi;
        break;
      case "-":
        re = /-/gi;
        break;
      default:
        re = /_/gi;
        break;
    }
    return origString
      .replace(re, " ")
      .toLowerCase()
      .split(" ")
      .map(s => s.charAt(0).toUpperCase() + s.substring(1))
      .join(" ");
  };

  render() {
    return (
      <RocketLayout>
        <Head>
          <title>{this.props.rocket.modelName} | RocketHub</title>
        </Head>
        <div className="columns">
          <div className="column is-offset-1">
            <div className="rocket-title title is-1 has-text-left">
              {this.clipString(this.camelCase(this.props.rocket.username, "") +
                "/" +
                this.camelCase(this.props.rocket.modelName, ""), 39)}
            </div>
          </div>
        </div>
        <div className="columns">
          <div className="column is-offset-1">
            <div className="rocket-snippet subtitle is-4">
              <span>
                Rocket.land("{this.props.rocket.username}/
                {this.props.rocket.modelName}")
              </span>
            </div>
          </div>
        </div>
        <br />
        <br />
        <div className="columns">
          <div className="column is-4 is-offset-1">
            <a href={EXTERNAL_DOCS + "/#" + this.props.rocket.family.replace(/_/gi, "-")}>
              <div className="rocket-family subtitle is-4">
                <h1>DOCS: {this.camelCase(this.props.rocket.family, "_")} </h1>
              </div>
            </a>
          </div>
          <div className="column is-2 has-text-centered">
            <Link href={this.props.rocket.originRepoUrl}>
              <a>
                <div className="rocket-repo-button subtitle is-4">
                  <object
                    className="rocket-repo-logo"
                    data="/static/GithubLogo.svg"
                    type="image/svg+xml"
                  />
                  GitHub
                </div>
              </a>
            </Link>
          </div>
          <div className="column is-2 has-text-centered">
            <Link href={this.props.rocket.paperUrl}>
              <a>
                <div className="rocket-paper-button subtitle is-4">
                  <img
                    className="rocket-paper-logo"
                    src="/static/PaperLogo.svg"
                    alt="Paper Logo"
                  />
                  Paper
                </div>
              </a>
            </Link>
          </div>
        </div>

        <div className="columns">
          <div className="column is-8 is-offset-1">
            <div className="rocket-description-box">
              <span className="has-text-left title is-3 "> Description </span>
              <p className="rocket-description-body">
                {this.props.rocket.description
                  ? this.props.rocket.description
                  : "No description available."}
              </p>
            </div>
          </div>
        </div>
        <div className="columns">
          <div className="column is-offset-1">
            <div className="rocket-trainable-notice subtitle is-4">
              Trainable{" "}
              <img
                className="rocket-trainable-badge"
                src={`/static/${
                  this.props.rocket.isTrainable ? "success" : "error"
                }.svg`}
                alt="Trainable badge"
              />
            </div>
          </div>
        </div>
        <div className="columns">
          <div className="column is-offset-1">
            <div className="rocket-public-notice subtitle is-4">
              Public{" "}
              <img
                className="rocket-public-badge"
                src={`/static/${
                  !this.props.rocket.isPrivate ? "success" : "error"
                }.svg`}
                alt="Public badge"
              />
            </div>
          </div>
        </div>
      </RocketLayout>
    );
  }
}

export default RocketPage;
