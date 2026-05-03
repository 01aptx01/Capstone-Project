import io

with io.open(r'c:\Git\Capstone-Project\web\machine-ui\src\app\page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Chunk 1
c1_old = '''  const [numpadCountdown, setNumpadCountdown] = useState<number>(60);

  const MOCK_USER_POINTS = 38;'''
c1_new = '''  const [numpadCountdown, setNumpadCountdown] = useState<number>(60);

  // -- Member / Points States --
  const [memberPoints, setMemberPoints] = useState<number | null>(null);
  const [earnedPoints, setEarnedPoints] = useState<number>(0);
  const [isNewMember, setIsNewMember] = useState<boolean>(false);
  const [isMemberLoading, setIsMemberLoading] = useState<boolean>(false);
  const [memberError, setMemberError] = useState<string | null>(null);
  const totalPriceRef = useRef<number>(0);'''
content = content.replace(c1_old, c1_new)

# Chunk 2
c2_old = '''    // ตั้งค่าคิวและตะกร้า
    const flatQueue = cart.flatMap((item) => Array(item.qty).fill(item));
    setQueue(flatQueue);
    setCart([]);'''
c2_new = '''    // ตั้งค่าคิวและตะกร้า
    const flatQueue = cart.flatMap((item) => Array(item.qty).fill(item));
    totalPriceRef.current = totalPrice; // Save total price for points
    setQueue(flatQueue);
    setCart([]);'''
content = content.replace(c2_old, c2_new)

# Chunk 3
c3_old = '''  const handleDeleteClick = () => setPhoneNumber((prev) => prev.slice(0, -1));
  const handleConfirmPhone = () => {
    if (phoneNumber.length === 10) {
      setPointsCountdown(10);
      setActiveModal("points_result");
    } else {
      alert("กรุณากรอกเบอร์โทรศัพท์ให้ครบ 10 หลัก");
    }
  };
  const displayFormattedPhone = () => {'''
c3_new = '''  const handleDeleteClick = () => setPhoneNumber((prev) => prev.slice(0, -1));

  const handleConfirmPhone = async () => {
    if (phoneNumber.length !== 10) {
      alert("กรุณากรอกเบอร์โทรศัพท์ให้ครบ 10 หลัก");
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    setIsMemberLoading(true);
    setMemberError(null);

    if (isAfterPayment) {
      try {
        const res = await fetch(`${apiUrl}/api/members/earn`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone_number: phoneNumber,
            total_price: totalPriceRef.current,
            charge_id: currentChargeId,
          }),
        });
        const data = await res.json();
        setEarnedPoints(data.points_earned ?? 0);
        setMemberPoints(data.total_points ?? 0);
        setIsNewMember(data.is_new_member ?? false);
        setPointsCountdown(10);
        setActiveModal("points_result");
      } catch (err) {
        console.error("Earn points error:", err);
        startHeatingProcess();
      } finally {
        setIsMemberLoading(false);
      }
    } else {
      try {
        const res = await fetch(`${apiUrl}/api/members/${phoneNumber}`);
        if (res.status === 404) {
          setMemberError("ไม่พบข้อมูลสมาชิก กรุณาลงทะเบียนหลังจากซื้อสินค้า");
          setMemberPoints(null);
          setEarnedPoints(0);
          setIsNewMember(false);
          setPointsCountdown(10);
          setActiveModal("points_result");
        } else if (res.ok) {
          const data = await res.json();
          setMemberPoints(data.points);
          setEarnedPoints(0);
          setIsNewMember(false);
          setMemberError(null);
          setPointsCountdown(10);
          setActiveModal("points_result");
        } else {
          alert("เกิดข้อผิดพลาดในการตรวจสอบข้อมูล");
        }
      } catch (err) {
        console.error("Lookup error:", err);
        alert("ไม่สามารถเชื่อมต่อกับระบบได้");
      } finally {
        setIsMemberLoading(false);
      }
    }
  };

  const displayFormattedPhone = () => {'''
content = content.replace(c3_old, c3_new)

# Chunk 4
c4_old = '''                  <button
                    className="numpad-btn action"
                    onClick={handleConfirmPhone}
                  >
                    OK
                  </button>'''
c4_new = '''                  <button
                    className="numpad-btn action"
                    onClick={handleConfirmPhone}
                    disabled={isMemberLoading}
                  >
                    {isMemberLoading ? "..." : "OK"}
                  </button>'''
content = content.replace(c4_old, c4_new)

# Chunk 5
c5_old = '''          {/* Modal 4: Points Result (แสดงคะแนนสะสม) */}
          {activeModal === "points_result" && (
            <div
              className="points-modal-box"
              onClick={(e) => e.stopPropagation()}
            >
              {/* ปุ่มปิดอัตโนมัติพร้อมตัวเลข */}
              <button
                className="timeout-close-btn"
                onClick={
                  isAfterPayment
                    ? startHeatingProcess
                    : () => setActiveModal("none")
                }
              >
                <span>{pointsCountdown}</span>
                <span className="points-close-icon">&times;</span>
              </button>
              <div className="points-title">คะแนนสะสมปัจจุบัน</div>
              <div className="points-value">{MOCK_USER_POINTS}</div>
              <div className="points-unit">คะแนน</div>
              <div className="points-disclaimer">
                <strong>*คะแนนสามารถนำไปแลกเป็นส่วนลดหรือโปรโมชั่น*</strong>
                <br />
                ได้ทางเว็ปไซต์ MODPAO.com
              </div>
            </div>
          )}'''
c5_new = '''          {/* Modal 4: Points Result (แสดงคะแนนสะสม) */}
          {activeModal === "points_result" && (
            <div
              className="points-modal-box"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="timeout-close-btn"
                onClick={
                  isAfterPayment
                    ? startHeatingProcess
                    : () => setActiveModal("none")
                }
              >
                <span>{pointsCountdown}</span>
                <span className="points-close-icon">&times;</span>
              </button>

              {memberError ? (
                <>
                  <div className="points-title" style={{ color: "#ef4444" }}>❌ ไม่พบสมาชิก</div>
                  <div className="points-disclaimer" style={{ marginTop: "16px", fontSize: "16px" }}>
                    {memberError}
                  </div>
                </>
              ) : (
                <>
                  {isNewMember && (
                    <div style={{
                      background: "linear-gradient(135deg, #f89025, #f59e0b)",
                      color: "white", borderRadius: "20px", padding: "6px 18px",
                      fontSize: "14px", fontWeight: "bold", marginBottom: "8px",
                    }}>
                      ✨ ยินดีต้อนรับสมาชิกใหม่!
                    </div>
                  )}
                  <div className="points-title">
                    {isAfterPayment ? "ได้รับแต้ม" : "คะแนนสะสมปัจจุบัน"}
                  </div>
                  {isAfterPayment && earnedPoints > 0 && (
                    <div style={{ color: "#22c55e", fontSize: "22px", fontWeight: "bold", marginBottom: "4px" }}>
                      +{earnedPoints} แต้ม
                    </div>
                  )}
                  <div className="points-value">{memberPoints ?? 0}</div>
                  <div className="points-unit">คะแนน</div>
                  <div className="points-disclaimer">
                    <strong>*คะแนนสามารถนำไปแลกเป็นส่วนลดหรือโปรโมชั่น*</strong>
                    <br />
                    ได้ทางเว็บไซต์ MODPAO.com
                  </div>
                </>
              )}
            </div>
          )}'''
content = content.replace(c5_old, c5_new)

with io.open(r'c:\Git\Capstone-Project\web\machine-ui\src\app\page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Done replacing.')
