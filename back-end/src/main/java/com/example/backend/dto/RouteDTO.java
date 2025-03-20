package com.example.backend.dto;

import lombok.Data;

@Data
public class RouteDTO {
    private long id;
    private String name;
    private String status;
    private String vehicle;
    private double latitude;
    private double longitude;
}

