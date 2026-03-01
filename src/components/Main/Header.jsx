import "./Header.css";

export function Header({ searchQuery, onSearchChange }) {
  return (
    <header className="header">
      <div className="header__hero">
        <h1 className="header__title">Пивное Пузо</h1>
      </div>
      <p className="header__subtitle">
        Введите хотя бы одно слово из названия товара
      </p>
      <div className="header__controls">
        <input
          className="header__input"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Поиск"
        />
      </div>
    </header>
  );
}
