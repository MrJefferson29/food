import { Row, Col } from "react-bootstrap";
import { copyrightSectionContent } from "../../data/contentData";

function CopyrightSection() {
    const { year, owner, links, reserveText } = copyrightSectionContent
    const facebookUrl = "https://www.facebook.com/share/1bfKYSaatv/";

    return (
        <Row className="copy_right">
          <Col>
            <div>
              <ul className="list-unstyled text-center mb-0">
                <li>
                  <a href={facebookUrl} target="_blank" rel="noreferrer">
                    © {year} <span>{owner}</span>. {reserveText}
                  </a>
                </li>
                {links.map((link, index) => (
                  <li key={index}>
                    <a href={facebookUrl} target="_blank" rel="noreferrer">
                      {link.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </Col>
        </Row>
      )
}

export default CopyrightSection