import './Footer.css'
import telegram from '../../images/telegram.svg'

export function Footer () {
    return (
        <>
            <div className='footer_section'>
                <h3 className='footer_text'>тгк:</h3>
                <a className='footer_button' href="https://t.me/pivoprobuem">
                    <img className='footer_image' src={telegram} alt="Поиск" />
                </a>
            </div>
        </>
    )
}
