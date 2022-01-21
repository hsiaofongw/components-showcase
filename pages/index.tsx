import styles from "../styles/HomePage.module.css";
import CardComponent from "./components/card";

type CardData = {
  id: string | number;
  name: string;
  imageSrc: string;
};

function HomePage() {
  const cards: CardData[] = [
    {
      id: 0,
      name: "real-clock",
      imageSrc: "/images/real-clock.png",
    },
    {
      id: 1,
      name: "slider-demo",
      imageSrc: "/images/slider-demo.png"
    },
  ];

  function handleCardClick(event: MouseEvent, cardId: number | string): void {
    console.log(`card: ${cardId} clicked`);
    console.log(event);
  }

  return (
    <div className={styles.gridOuterContainer}>
      <div className={styles.grid}>
        {cards.map((card) => (
          <CardComponent
            key={card.id}
            onClick={(event) => handleCardClick(event, card.id)}
            name={card.name}
            imageSrc={card.imageSrc}
          ></CardComponent>
        ))}
      </div>
    </div>
  );
}

export default HomePage;
