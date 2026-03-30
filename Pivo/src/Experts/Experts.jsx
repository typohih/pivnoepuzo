import './Experts.css'
import beer2977173 from '../../images/free-icon-beer-2977173.png'
import beer931949 from '../../images/free-icon-beer-931949.png'
import myAccount17200091 from '../../images/free-icon-my-account-17200091.png'
import photo20241124030027 from '../../images/photo_2024-11-24_03-00-27.jpg'
import photo20260324085047 from '../../images/photo_2026-03-24_08-50-47.jpg'
import Volodya from '../../images/photo_2026-03-25_12-53-49.jpg'
import Ivan from '../../images/Ivan.PNG'
import Starichok from '../../images/Starichok.PNG'

export function Experts () {

    return (<>
        <div className='experts_container' id='Experts'>
            <div className='Expert1'>
                Слава Телегин
                <img src={myAccount17200091} alt="" />
                <div className='hidden_content'>
                    <img src={beer931949} alt="" />
                </div>
                <div className='hidden_content2'>
                    <img src={beer2977173} alt="" />
                </div>
                <div className='hidden_Expert1'>
                    <img src={photo20260324085047} alt="" />
                </div>
            </div>
            <div className='Expert2'>
                Арсений Маркарян
                <img src={myAccount17200091} alt="" />
                <div className='hidden_content'>
                    <img src={beer931949} alt="" />
                </div>
                <div className='hidden_content2'>
                    <img src={beer2977173} alt="" />
                </div>
                <div className='hidden_Expert2'>
                    <img src={photo20241124030027} alt="" />
                </div>
            </div>

            <div className='Expert3'>
                Виктор Вротопивов
                <img src={myAccount17200091} alt="" />
                <div className='hidden_content'>
                    <img src={beer931949} alt="" />
                </div>
                <div className='hidden_content2'>
                    <img src={beer2977173} alt="" />
                </div>
                <div className='hidden_Expert3'>
                    <img src={Volodya} alt="" />
                </div>
            </div>

            <div className='Expert4'>
                Никита Карамазов
                <img src={myAccount17200091} alt="" />
                <div className='hidden_content'>
                    <img src={beer931949} alt="" />
                </div>
                <div className='hidden_content2'>
                    <img src={beer2977173} alt="" />
                </div>
                <div className='hidden_Expert4'>
                    <img src={Ivan} alt="" />
                </div>
            </div>

            <div className='Expert5'>
                Старик Рехабыч
                <img src={myAccount17200091} alt="" />
                <div className='hidden_content'>
                    <img src={beer931949} alt="" />
                </div>
                <div className='hidden_content2'>
                    <img src={beer2977173} alt="" />
                </div>
                <div className='hidden_Expert5'>
                    <img src={Starichok} alt="" />
                </div>
            </div>


        </div>
    </>)
}
