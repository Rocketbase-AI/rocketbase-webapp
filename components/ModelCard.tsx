import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { faPaste } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import moment from "moment";
import Link from "next/link";
import React, { Component } from "react";

class ModelCard extends Component<any, any> {
  constructor(props: any) {
    super(props);
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
      <div className="box model-card has-text-left is-inline-flex model-card-background">
        <style jsx={true}>
          {`
            .model-card-background {
              background-image: url(/static/modelCardBackgrounds/${this.props.model
									.family}_Background.svg);
						background-repeat: no-repeat;
						background-size: cover;
            }
          `}
        </style>
        <Link href={`/rocket?id=${this.props.model.id}`} passHref={true}>
          <a className="">
            <p className="model-card-title">
              {this.clipString(
                this.camelCase(this.props.model.modelName, "-"),
                14,
              )}
            </p>
            <p className="model-card-publication-date">
              {" "}
              {moment(this.props.model.launchDate.seconds * 1000).format("ll")}
            </p>
            <img
              className="model-card-training-logo"
              src="/static/weightlifting.svg"
              alt="Training Set:"
            />
            <p className="model-card-training-title">
              {this.clipString(this.props.model.trainingDataset, 11)}
            </p>
            <p className="model-card-task-title">
              {this.camelCase(this.props.model.family, "_")}
            </p>
          </a>
        </Link>
        <Link href={this.props.model.originRepoUrl}>
          <a>
            <div className="model-card-repo-link">
              <FontAwesomeIcon icon={faGithub} size="lg" />
            </div>
          </a>
        </Link>
        <Link href={this.props.model.paperUrl}>
          <a>
            <div className="model-card-paper-link">
              <FontAwesomeIcon icon={faPaste} size="lg" />
            </div>
          </a>
        </Link>
      </div>
    );
  }
}

export default ModelCard;
