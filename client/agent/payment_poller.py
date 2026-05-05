import time
import requests

def wait_for_payment_and_dispense(charge_id: str, machine_id: str, product_id: str):
    """
    Polls the backend to check if the payment is successful.
    If successful, triggers the dispensing mechanism.
    """
    backend_url = f"http://localhost:8000/api/buy/status/{charge_id}"
    
    print(f"Waiting for payment on charge {charge_id}...")
    
    max_retries = 60 # e.g., wait up to 2 minutes (60 * 2 seconds)
    
    for _ in range(max_retries):
        try:
            response = requests.get(backend_url)
            if response.status_code == 200:
                data = response.json()
                status = data.get("status")
                
                if status == "PAID":
                    print("Payment confirmed! Dispensing product...")
                    dispense_product(machine_id, product_id)
                    return True
                elif status == "FAILED":
                    print("Payment failed or was cancelled.")
                    return False
                    
        except requests.exceptions.RequestException as e:
            print(f"Error checking status: {e}")
            
        # Wait 2 seconds before polling again
        time.sleep(2)
        
    print("Payment timeout.")
    return False

def dispense_product(machine_id: str, product_id: str):
    # Add your hardware specific GPIO/Serial code here to drop the item
    print(f"Dispensing item {product_id} from {machine_id}")
    pass
