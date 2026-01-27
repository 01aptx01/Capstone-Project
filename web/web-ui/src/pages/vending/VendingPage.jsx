import { useState } from "react";
import { buyProduct } from "../../api/vendingApi";
import { Button, Container } from "react-bootstrap";

export default function VendingPage() {
  const [status, setStatus] = useState("");

  const handleBuy = async () => {
    try {
      setStatus("Processing...");
      const data = await buyProduct(1);

      // Call Pi agent (localhost on Pi)
      await fetch(`http://localhost:5000/dispense/${data.slot}`);

      setStatus("Thank you!");
    } catch (err) {
      setStatus("Out of stock");
    }
  };

  return (
    <Container className="mt-5">
      <h1>Vending Machine</h1>
      <Button onClick={handleBuy}>Buy Cola</Button>
      <p>{status}</p>
    </Container>
  );
}
