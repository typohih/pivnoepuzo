import styles from './Button.module.css'

export const Button = ( { text, onClick } ) => {
    console.log(styles)
    return(
        <button className='button' onClick={onClick}>{text}</button>
    )
}