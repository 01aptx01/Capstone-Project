# MFRC522 Driver for Raspberry Pi via Adafruit Blinka (Software SPI / BitBang)
# Improved with Antenna Gain and Logging

import time
import logging
from digitalio import Direction

logger = logging.getLogger(__name__)

class MFRC522:
    def __init__(self, spi, cs, rst):
        self.spi = spi
        self.cs = cs
        self.rst = rst
        
        self.cs.direction = Direction.OUTPUT
        self.cs.value = True
        self.rst.direction = Direction.OUTPUT
        
        # Hard Reset
        self.rst.value = False
        time.sleep(0.1)
        self.rst.value = True
        time.sleep(0.1)
        
        self.init()
        
        # Self-test: Read VersionReg (0x37)
        ver = self._read_reg(0x37)
        if ver == 0x00 or ver == 0xFF:
            logger.error(f"[NFC] CRITICAL: RC522 not responding (Version: {hex(ver)}). Check wiring and ensure SPI is NOT enabled in raspi-config if using bitbang on SPI pins!")
        else:
            logger.info(f"[NFC] RC522 Hardware detected. Version: {hex(ver)}")

    def _write_reg(self, reg, val):
        self.cs.value = False
        while not self.spi.try_lock(): pass
        try:
            self.spi.write(bytes([(reg << 1) & 0x7E, val]))
        finally:
            self.spi.unlock()
            self.cs.value = True

    def _read_reg(self, reg):
        self.cs.value = False
        while not self.spi.try_lock(): pass
        try:
            # MUST use write_readinto for RC522 to get data in the same transaction
            addr = ((reg << 1) & 0x7E) | 0x80
            result = bytearray(2)
            self.spi.write_readinto(bytes([addr, 0x00]), result)
            return result[1]
        finally:
            self.spi.unlock()
            self.cs.value = True

    def init(self):
        self._write_reg(0x01, 0x0F) # SoftReset
        time.sleep(0.05)
        self._write_reg(0x2A, 0x8D) # TModeReg
        self._write_reg(0x2B, 0x3E) # TPrescalerReg
        self._write_reg(0x2D, 30)   # TReloadRegL
        self._write_reg(0x2C, 0)    # TReloadRegH
        self._write_reg(0x15, 0x40) # TxASKReg
        self._write_reg(0x11, 0x3D) # ModeReg
        
        # Increase Antenna Gain to Maximum (48dB)
        self._write_reg(0x26, 0x70)
        
        self.antenna_on()

    def antenna_on(self, on=True):
        val = self._read_reg(0x14)
        if on:
            self._write_reg(0x14, val | 0x03)
        else:
            self._write_reg(0x14, val & ~0x03)

    def request(self, mode=0x26):
        self._write_reg(0x0D, 0x07) # BitFramingReg
        status, back_data, back_bits = self._to_card(0x0C, [mode])
        if status != 0:
            return None
        return back_data

    def _to_card(self, command, send_data):
        back_data = []
        back_bits = 0
        status = 2 # ERR
        irq_en = 0x00
        wait_irq = 0x00
        
        if command == 0x0E: # Authent
            irq_en = 0x12
            wait_irq = 0x10
        elif command == 0x0C: # Transceive
            irq_en = 0x77
            wait_irq = 0x30
            
        self._write_reg(0x02, irq_en | 0x80)
        self._write_reg(0x04, 0x7F) # Clear interrupts
        self._write_reg(0x0A, 0x80) # Flush FIFO
        self._write_reg(0x01, 0x00) # Idle
        
        for d in send_data:
            self._write_reg(0x09, d)
        
        self._write_reg(0x01, command)
        if command == 0x0C:
            self._write_reg(0x0D, self._read_reg(0x0D) | 0x80)
            
        i = 2000
        while i > 0:
            n = self._read_reg(0x04)
            i -= 1
            if n & 0x01 or n & wait_irq:
                break
                
        self._write_reg(0x0D, self._read_reg(0x0D) & ~0x80)
        
        if i != 0:
            if not (self._read_reg(0x06) & 0x1B):
                status = 0 # OK
                if n & irq_en & 0x01:
                    status = 1 # NOTAGERR
                if command == 0x0C:
                    n = self._read_reg(0x0A)
                    last_bits = self._read_reg(0x0C) & 0x07
                    if last_bits != 0:
                        back_bits = (n - 1) * 8 + last_bits
                    else:
                        back_bits = n * 8
                    if n == 0:
                        n = 1
                    if n > 16:
                        n = 16
                    for _ in range(n):
                        back_data.append(self._read_reg(0x09))
            else:
                status = 2 # ERR
                
        return status, back_data, back_bits

    def anticoll(self):
        self._write_reg(0x0D, 0x00)
        status, back_data, back_bits = self._to_card(0x0C, [0x93, 0x20])
        if status == 0:
            if len(back_data) == 5:
                # Checksum
                ser_num_check = 0
                for i in range(4):
                    ser_num_check ^= back_data[i]
                if ser_num_check != back_data[4]:
                    status = 2
            else:
                status = 2
        return status, back_data

    def read_uid(self):
        res = self.request()
        if res is not None:
            status, uid = self.anticoll()
            if status == 0:
                return uid
        return None