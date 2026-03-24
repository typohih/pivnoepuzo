import './PhotoSection.css'
import logoHeader from '../../images/logo-header-small.svg'

export function PhotoSection () {
    return (
        <div className="hero">
            <img src="./images/245293.webp" className="image"/>
            <img src={logoHeader} alt="Pivnoe Puzo" className="site_logo" />
            <h1 className="title">Pivnoe Puzo</h1>
            <p className="description">Каталог алкоголя по вкусовым, визуальным, ценовым и прочим качествам от квалифицированных специалистов в области дворовой попойки</p>
            <section  className="buttons">
                <button className='button' onClick={() => {
                    document.getElementById('catalog')?.scrollIntoView({
                    behavior: 'smooth'
                    }
                    )}
                    }
                    >
                    Каталог
                </button>
                <button className='button' onClick={() => {
                    document.getElementById('Experts')?.scrollIntoView({
                    behavior: 'smooth'
                    }
                    )}
                    }>Эксперты</button>
            </section>
        </div>
    )
}
