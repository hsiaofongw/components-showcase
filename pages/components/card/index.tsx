import styles from "./CardComponent.module.css";
import Image from 'next/image';

function CardComponent(props: { onClick?: (event: MouseEvent) => void, name: string, imageSrc: string }) {
  function handleClick(event: MouseEvent): void {
    if (typeof props.onClick === "function") {
      props.onClick(event);
    }
  }

  return (
    <div
      onClick={(event) => handleClick(event as any)}
      className={styles.card}
    >
      <div className={styles.cardImage}>
        {/* <Image src={props.imageSrc} alt={props.name} layout={'responsive'} height={200}></Image> */}
      </div>
    </div>
  );
}

export default CardComponent;
