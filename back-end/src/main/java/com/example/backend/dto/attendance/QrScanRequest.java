package com.example.backend.dto.attendance;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class QrScanRequest {
    @NotBlank(message = "QR code is required")
    private String qrCode;

    @NotNull(message = "Trip ID is required")
    private Long tripId;

    private Double latitude;
    private Double longitude;
    private String notes;
} 