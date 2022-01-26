import { descending } from "d3";
import { useRouter } from "next/router";
import styles from "../styles/HomePage.module.css";
import CardComponent from "./components/card";

type CardData = {
  id: string | number;
  name: string;
  imageSrc: string;
  url: string;
  description: string;
};

function HomePage() {
  const cards: CardData[] = [
    {
      id: 0,
      name: "clock",
      url: "/components/clock",
      imageSrc: "/images/real-clock.png",
      description: "一个时钟",
    },
    {
      id: 1,
      name: "slider",
      url: "/components/slider",
      imageSrc: "/images/slider-demo.png",
      description: "一个可左右滑动的 slider",
    },
  ];

  const router = useRouter();

  function handleCardClick(card: CardData): void {
    router.push(card.url);
  }

  return (
    <div className={styles.gridOuterContainer}>
      <div className={styles.grid}>
        {cards.map((card) => (
          <CardComponent
            key={card.id}
            onClick={(_) => handleCardClick(card)}
            name={card.name}
            imageSrc={card.imageSrc}
            url={card.url}
            description={card.description}
          ></CardComponent>
        ))}
      </div>
    </div>
  );
}

export default HomePage;
