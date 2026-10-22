import { Col, Container, Row } from "react-bootstrap";
import { footerSectionContent } from "../../data/contentData";
import CopyrightSection from "../home/CopyrightSection";
import ScrollTop from "../others/ScrollTop";

const facebookUrl = "https://www.facebook.com/share/1bfKYSaatv/";

function Footer() {
  return (
    <>
      <footer>
        <Container>
          <Row>
            {footerSectionContent.map((item, index) => (
              <Col sm={6} lg={3} className="mb-4 mb-lg-0" key={index}>
                <div className="text-center">
                  <h5>{item.heading}</h5>
                  {item.descriptions.map((description, i) => (
                    <p key={i}>{description}</p>
                  ))}
                  {item.links && (
                    <p>
                      <a
                        href={facebookUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="calling"
                      >
                        {item.links.text}
                      </a>
                    </p>
                  )}
                  {item.socialLinks && (
                    <ul className="list-unstyled text-center mt-2">
                      {item.socialLinks.map((social, i) => (
                        <li key={i}>
                          <a
                            href={facebookUrl}
                            target="_blank"
                            rel="noreferrer"
                            aria-label="Pasture Choice Beef on Facebook"
                          >
                            <i className={social.icon}></i>
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </Col>
            ))}
          </Row>

          {/* Copyright Section */}
          <CopyrightSection />
        </Container>
      </footer>

      {/* Scroll to Top Button */}
      <ScrollTop/>
    </>
  );
}

export default Footer;
