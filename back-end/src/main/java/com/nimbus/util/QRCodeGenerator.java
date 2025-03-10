package com.nimbus.util;

import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class QRCodeGenerator {
    
    public String generateStudentQRCode() {
        return "STU-" + UUID.randomUUID().toString();
    }
}

