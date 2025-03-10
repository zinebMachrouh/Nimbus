package com.nimbus.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LocationUpdateDTO {
    private Long id;
    private Long tripId;
    private Double latitude;
    private Double longitude;
    private Long timestamp;
    private Double speed;
    private Double heading;
    private Long createdAt;
}

