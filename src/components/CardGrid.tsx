import { motion } from "motion/react";
import ProductCard, { type CardData } from "./ProductCard";
import { springs } from "@/lib/springs";

/** A static grid of cards that rise in one after another when scrolled into view. */
export default function CardGrid({ cards }: { cards: CardData[] }) {
  return (
    <motion.ul
      className="m-0 grid list-none grid-cols-1 gap-5 p-0 md:grid-cols-2"
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      variants={{ shown: { transition: { staggerChildren: 0.08 } } }}
    >
      {cards.map(c => (
        <motion.li key={c.id} variants={{ hidden: { opacity: 0, y: 28 }, shown: { opacity: 1, y: 0 } }} transition={springs.standard}>
          <ProductCard d={c} />
        </motion.li>
      ))}
    </motion.ul>
  );
}
