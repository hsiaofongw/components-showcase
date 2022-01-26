import styles from "./CardComponent.module.css";
import Image from "next/image";

function CardComponent(props: {
  onClick?: (event: MouseEvent) => void;
  name: string;
  imageSrc: string;
  url: string;
  description: string;
}) {
  function handleClick(event: MouseEvent): void {
    if (typeof props.onClick === "function") {
      props.onClick(event);
    }
  }

  return (
    <div onClick={(event) => handleClick(event as any)} className={styles.card}>
      <div className={styles.imageContainer}>
        <img className={styles.cardImage} src={props.imageSrc} alt={""}></img>
      </div>
      <div className={styles.descriptionArea}>
        <h2 className={styles.myL2Heading}>{props.name}</h2>
        <p className={styles.myParagraph}>{props.description}</p>
      </div>
    </div>
  );
}

export default CardComponent;
