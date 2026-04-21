import React, { useState, useEffect, useCallback } from 'react';

interface Props {
  totalPrice: number;
  onClose: () => void;
  onPaymentSuccess: (paymentData: { type: 'token'; id: string; amount: number }) => void;
}

export default function CardPaymentModal({ totalPrice, onClose, onPaymentSuccess }: Props) {
  const [cardNumber, setCardNumber] = useState('');
  const [name, setName] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [securityCode, setSecurityCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // MSR Wedge buffer
  const [buffer, setBuffer] = useState('');

  // Handle magnetic stripe parsing (Track 1)
  const parseTrackData = useCallback((data: string) => {
    try {
      // Standard Track 1 format: %B[PAN]^[NAME]^[YYMM]...
      const track1Regex = /%B(\d+)\^([^^]+)\^(\d{4})/;
      const match = data.match(track1Regex);
      
      if (match) {
        const pan = match[1];
        const rawName = match[2];
        const expiry = match[3]; // YYMM

        // Format name from "LAST/FIRST" or "LAST / FIRST TITLE" to "FIRST LAST"
        let formattedName = rawName;
        if (rawName.includes('/')) {
            const parts = rawName.split('/');
            formattedName = `${parts[1].trim()} ${parts[0].trim()}`.trim();
        }

        setCardNumber(pan);
        setName(formattedName);
        setExpiryYear(`20${expiry.substring(0, 2)}`);
        setExpiryMonth(expiry.substring(2, 4));
        
        console.log("Card swiped successfully!");
        return true;
      }
      return false;
    } catch (e) {
      console.error("Failed to parse track data", e);
      return false;
    }
  }, []);

  // Listen for keyboard wedge input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input field (except we want to capture global swipe)
      // If we want to capture even when focused, we just append to buffer
      
      if (e.key === 'Enter') {
        if (buffer.startsWith('%')) {
          parseTrackData(buffer);
        }
        setBuffer(''); // clear buffer
      } else if (e.key.length === 1) {
        setBuffer(prev => prev + e.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [buffer, parseTrackData]);

  // Handle Demo Simulate
  const simulateSwipe = () => {
    // Dummy Track 1 Data: %B4242424242424242^DOE/JOHN^281210100000?
    const dummyData = "%B4242424242424242^DOE/JOHN^281210100000?\n";
    parseTrackData(dummyData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    if (typeof window !== 'undefined' && (window as any).Omise) {
      const Omise = (window as any).Omise;
      
      // Set Public Key
      Omise.setPublicKey(process.env.NEXT_PUBLIC_OMISE_PUBLIC_KEY || "pkey_test_xxx");

      const card = {
        name: name,
        number: cardNumber,
        expiration_month: expiryMonth,
        expiration_year: expiryYear,
        security_code: securityCode
      };

      Omise.createToken('card', card, (statusCode: number, response: any) => {
        setIsProcessing(false);
        if (statusCode === 200) {
          // Success
          onPaymentSuccess({ type: 'token', id: response.id, amount: totalPrice * 100 });
        } else {
          // Error
          alert(`Payment Error: ${response.message}`);
        }
      });
    } else {
      setIsProcessing(false);
      alert("Payment gateway not loaded.");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>&times;</button>
        <div className="modal-title">ชำระเงินด้วยบัตร (Credit/Debit Card)</div>
        
        <div style={{ marginBottom: '20px', textAlign: 'center', color: '#666' }}>
          กรุณารูดบัตรของท่าน หรือกรอกข้อมูลด้วยตนเอง<br />
          <small>(Please swipe your card or enter details below)</small>
        </div>

        <button 
          type="button"
          onClick={simulateSwipe}
          style={{
            width: '100%', padding: '10px', marginBottom: '20px', 
            backgroundColor: '#ff9800', color: 'white', border: 'none', 
            borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold'
          }}
        >
          [DEMO] Simulate Card Swipe
        </button>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Card Number</label>
            <input 
              type="text" 
              value={cardNumber} 
              onChange={e => setCardNumber(e.target.value)} 
              placeholder="0000 0000 0000 0000"
              required
              style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Name on Card</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="JOHN DOE"
              required
              style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Expiry Month</label>
              <input 
                type="text" 
                value={expiryMonth} 
                onChange={e => setExpiryMonth(e.target.value)} 
                placeholder="MM"
                maxLength={2}
                required
                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Expiry Year</label>
              <input 
                type="text" 
                value={expiryYear} 
                onChange={e => setExpiryYear(e.target.value)} 
                placeholder="YYYY"
                maxLength={4}
                required
                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>CVV</label>
              <input 
                type="text" 
                value={securityCode} 
                onChange={e => setSecurityCode(e.target.value)} 
                placeholder="123"
                maxLength={4}
                required
                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isProcessing}
            style={{
              marginTop: '10px', width: '100%', padding: '12px', 
              backgroundColor: isProcessing ? '#ccc' : '#4CAF50', 
              color: 'white', border: 'none', borderRadius: '5px', 
              fontSize: '16px', fontWeight: 'bold', cursor: isProcessing ? 'not-allowed' : 'pointer'
            }}
          >
            {isProcessing ? 'Processing...' : `Pay ${totalPrice} ฿`}
          </button>
        </form>
      </div>
    </div>
  );
}
