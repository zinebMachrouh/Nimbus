package com.nimbus.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ScanQrCodeRequest {
    @NotBlank(message = "QR code is required")
    private String qrCode;
    
    @NotNull(message = "Trip ID is required")
    private Long tripId;
}

