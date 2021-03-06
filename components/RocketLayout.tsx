import "../styles/styles.scss";
import Footer from "./Footer";
import Header from "./Header";

interface LayoutProps {
  children: any;
}

const RocketLayout = (props: LayoutProps) => (
  <div>
    <section className="hero is-fullheight has-background">
      <Header />
      <div className="hero-body has-background ">
        <div className="container rocket_background">
          {props.children}
         </div>
      </div>
      <div className="hero-foot" />
    </section>
    <Footer />
  </div>
);

export default RocketLayout;
