import telegramIcon from "../../../images/telegram.svg";
import "./Footer.css";

export function Footer() {
  return (
    <footer className="footer">
      <section className="footer__content">
        <a
          className="footer__link"
          href="https://t.me/pivoprobuem"
          target="_blank"
          rel="noreferrer"
          aria-label="Telegram pivoprobuem"
        >
          <img className="footer__icon" src={telegramIcon} alt="" aria-hidden="true" />
        </a>
        <div>тгк: pivoprobuem</div>
      </section>
    </footer>
  );
}
